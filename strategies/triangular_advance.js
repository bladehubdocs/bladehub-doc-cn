
// Here is a demo:   https://github.com/NStal/bladehub-doc-cn/wiki/%E7%AD%96%E7%95%A5%E4%B9%A6%E5%86%99%E5%85%A5%E9%97%A8
module.exports = {
    isExecutor: true,
    isReadonly: false,
    initialState: "watch",
    feeRate: 0.001,
    maxWaitInterval: 1000 * 15,
    OptionDefinition: {
        type: "object",
        fields: [{
            displayName: "base-quote",
            key: "tradeContextA",
            value: {
                type: "tradeContext"
            }
        }, {
            displayName: "API Credential",
            key: "credentialA",
            value: {
                type: "apiCredential"
            }
        }, {
            displayName: "base-middle",
            key: "tradeContextB",
            value: {
                type: "tradeContext"
            }
        }, {
            displayName: "API Credential",
            key: "credentialB",
            value: {
                type: "apiCredential"
            }
        }, {
            displayName: "quote-middle",
            key: "tradeContextC",
            value: {
                type: "tradeContext"
            }
        }, {
            displayName: "API Credential",
            key: "credentialC",
            value: {
                type: "apiCredential"
            }
        }]
    },
    
    data: {
        currentOrder: null
    },
    
    setup() {
        this.requirements = {
            shotA: {
                type: "shot",
                context: this.option.tradeContextA
            },
            shotB: {
                type: "shot",
                context: this.option.tradeContextB
            },
            shotC: {
                type: "shot",
                context: this.option.tradeContextC
            },
            depthA: {
                type: "depth",
                context: this.option.tradeContextA
            },
            depthB: {
                type: "depth",
                context: this.option.tradeContextB
            },
            depthC: {
                type: "depth",
                context: this.option.tradeContextC
            },
            marketA: {
                type: "runtime",
                context: this.option.tradeContextA,
                credential: this.option.credentialA
            },
            marketB: {
                type: "runtime",
                context: this.option.tradeContextB,
                credential: this.option.credentialB
            },
            marketC: {
                type: "runtime",
                context: this.option.tradeContextC,
                credential: this.option.credentialC
            }
        }
        this.log("option ~~~~~~", this.option)
    },
    
    atWatch() {
        this.nextTick(() => {
            let positiveRate = this.getPositiveProfitRate()
            let reverseRate = this.getReverseProfitRate()
            if (positiveRate < 0 && reverseRate < 0) {
                this.setState("watch")    
            } else if (positiveRate >= reverseRate) {
                this.setState("createOrder", true)
            } else {
                this.setState("createOrder", true)
            }
        })
    },
    
    atCreateOrder(stale, direction) {
        let shot = this.requirements.shotA.shot
        let depth = this.requirements.depthA.depth
        let runtime = this.requirements.marketA.runtime
        let side = direction && 1 || -1
        let price = 0
        let amount = 0
        let datas = depth.filter(data => data[1] * side > 0).sort((a, b) => (b[0] - a[0]) * side) || []
        if (!datas.length) {
            this.setState("watch")
        } else {
            price = (shot.buy1 + shot.sell1) / 2
            amount = datas[0][1]
        }
        let order = runtime.createOrder({price, amount})
        this.setState("waitOrder", order, runtime)
    },
    
    atWaitOrder(stale, order, runtime) {
        this.nextTick(() => {
            order = runtime.getOrder({ pid: order.pid })
            if (order.state == "closed" || order.state == "partial") {
                this.log("order closed ~~~", order)
                let dealtAmount = order.transferedAmount
                let shots = [this.requirements.shotB.shot, this.requirements.shotC.shot]
                let runtimes = [this.requirements.marketB.runtime, this.requirements.marketC.runtime]
                let side = dealtAmount > 0 && 1 || -1
                shots.forEach((shot, i) => {
                    let aRuntime = runtimes[i]
                    let price = (shot.buy1 + shot.sell1) / 2
                    let amount = dealtAmount * -1
                    if (i == 1) {
                        amount = dealtAmount * order.price * (1 + this.feeRate * side)
                    }
                    this.log(price, amount)
                    aRuntime.createOrder({ price, amount })
                })
                this.setState("watch")
            } else if (order.state == "error" || order.state == "canceled") {
                this.setState("watch")
            } else {
                if (order.state == "book" || order.state == "pending" && this.now - order.intentAt > this.maxWaitInterval) {
                    this.log("order passed ...")
                    runtime.cancelOrder({ pid: order.pid })
                    this.setState("watch")
                    return
                }
                this.setState("waitOrder", order, runtime)
            }
        })    
    },
    
    getPositiveProfitRate() {
        /* 正循环套利
         * base-quote下买单，base增加，quote减少
         * base-middle下卖单，base减少，middle增加
         * quote-middle下买单，quote增加，middle减少
         * 套利条件为增加的middle大于减少的middle
        */
        let shots = [this.requirements.shotA, this.requirements.shotB, this.requirements.shotC]
        let prices = []
        prices[0] = shots[0].shot.sell1
        let quote = prices[0] * (1 + this.feeRate)
        prices[1] = shots[1].shot.buy1
        let profit = prices[1] * (1 - this.feeRate)
        prices[2] = shots[2].shot.sell1
        let loss = quote * prices[2] * (1 + this.feeRate)
        this.log("+pl ~~~", profit, loss, profit-loss)
        let rate = profit / loss - 1
        return rate
    },
    
    getReverseProfitRate() {
        /* 逆循环套利
         * base-quote下卖单，base减少，quote增加
         * base-middle下买单，base增加，middle减少
         * quote-middle下卖单，quote减少，middle增加
         * 套利条件为减少的middle小于增加的middle
        */
        let shots = [this.requirements.shotA, this.requirements.shotB, this.requirements.shotC]
        let prices = []
        prices[0] = shots[0].shot.buy1
        let quote = prices[0] * (1 - this.feeRate)
        prices[1] = shots[1].shot.sell1
        let loss = prices[1] * (1 + this.feeRate)
        prices[2] = shots[2].shot.buy1
        let profit = quote * prices[2] * (1 - this.feeRate)
        this.log("-pl ~~~", profit, loss, profit - loss)
        let rate = profit / loss - 1
        return rate
    }
}
