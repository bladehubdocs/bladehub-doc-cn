module.exports = {
    isExecutor: true,
    tickInterval: 1000,
    initialState: "watch",
    feeRate: 0.001,
    profitRate: 0.00,
    OptionDefinition: {
        type: "object",
        fields: [{
            displayName: "base-quote",
            key: "tradeContextA",
            value: {
                type: "tradeContext"
            }
        }, {
            displayName: "base-middle",
            key: "tradeContextB",
            value: {
                type: "tradeContext"
            }
        }, {
            displayName: "quote-middle",
            key: "tradeContextC",
            value: {
                type: "tradeContext"
            }
        }, {
            displayName: "API Credential",
            key: "credential",
            value: {
                type: "apiCredential"
            }
        }, {
            displayName: "per trade amount",
            key: "amount",
            value: {
                type: "number"
            }
        }]
    },
    
    data: {
        isValidOption: false,
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
            runtimeA: {
                type: "runtime",
                context: this.option.tradeContextA,
                credential: this.option.credential
            },
            runtimeB: {
                type: "runtime",
                context: this.option.tradeContextB,
                credential: this.option.credential
            },
            runtimeC: {
                type: "runtime",
                context: this.option.tradeContextC,
                credential: this.option.credential
            }
        }
        this.data.isValidOption = this.checkOption()
        this.log("option ~~~~~~", this.option)
        this.log("data ~~~~~", this.data)
    },
        
    checkOption() {
        let flag = true
        let contexts = [this.option.tradeContextA, this.option.tradeContextB, this.option.tradeContextC]
        if (contexts[1].front != contexts[0].front || contexts[2].front != contexts[0].back || contexts[1].back != contexts[2].back) {
            this.log("Invalid triangular context.")
            flag = false
        }
        
        let credential = this.option.credential
        for (let context of contexts) {
            if (!credential || credential.sp != context.sp) {
                this.log(`Invalid sp ${context.sp}.`)
                flag = false
                break
            }
        }
        return flag
    },
    
    atWatch() {
        if (!this.data.isValidOption) {
            this.log("Invalid definition option! Please reconfigure.")
            return
        }
        this.nextTick(() => {
            let shots = [this.requirements.shotA, this.requirements.shotB, this.requirements.shotC]
            this.log("shot ~~~~", shots)
            let positiveRate = this.getPositiveProfitRate()
            let reverseRate = this.getReverseProfitRate()
            if (positiveRate < this.profitRate && reverseRate < this.profitRate) {
                this.setState("watch")    
            } else if (positiveRate >= reverseRate) {
                this.setState("createOrders", true)
            } else {
                this.setState("createOrders", false)
            }
        })
    },
    
    atCreateOrders(stale, direction) {
        let shots = [this.requirements.shotA.shot, this.requirements.shotB.shot, this.requirements.shotC.shot]
        let runtimes = [this.requirements.runtimeA.runtime, this.requirements.runtimeB.runtime, this.requirements.runtimeC.runtime]
        let sides = this.getTradeSides(direction)
        shots.forEach((shot, i) => {
            let runtime = runtimes[i]
            let price = (shot.buy1 + shot.sell1) / 2
            let amount = this.option.amount
            if (i == 2) {
                amount *= (shots[0].buy1 + shots[0].sell1) / 2 * (1 + this.feeRate)
            }
            runtime.createOrder({
                price, amount: sides[i] * amount
            })
        })
        this.setState("watch")
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
    },

    getTradeSides(direction) {
        if (direction) {
            return [1, -1, 1]
        } else {
            return [-1, 1, -1]
        }
    }
}
