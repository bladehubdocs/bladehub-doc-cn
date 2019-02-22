module.exports = {
    isExecutor: true,
    tickInterval: 1000,
    initialState: "watch",
    shortPeriod: 10 * 60 * 1000, 
    longPeriod: 30 * 60 * 1000,
    amount: 0.001,
    OptionDefinition: {
        type: "object",
        fields: [
            {
                displayName: "API credential",
                key: "targetCredential",
                value: {
                    type: "apiCredential"
                }
            }
        ]
    },
    setup() {
        let context = {
            name:"huobi_btc_usdt",
            sp:"huobi",
            front:"btc",
            back:"usdt"
        }
        this.requirements = {
            shortTrades: {
                type: "trades",
                context: context,
                duration: this.shortPeriod
            },
            
            longTrades: {
                type: "trades",
                context: context,
                duration: this.longPeriod
            },
            shot: {
                type: "shot",
                context: context,
            },
            credential: this.option.targetCredential
        }
    },
    getAvg(numbers) {
        let sum = 0
        for (let i = 0; i < numbers.length; i++) {
            sum = sum + numbers[i]
        }
        return sum / numbers.length
    },
    shortAvg: 0,
    longAvg: 0,
    atWatch() {
        this.nextTick(() => {
            let longTrades =  this.requirements.longTrades
            let longPrices = longTrades.datas.map((trade) => {
                return trade.price
            })
            let longAvg = this.getAvg(longPrices)
            
            let shortTrades =  this.requirements.shortTrades
            let shortPrices = shortTrades.datas.map((trade) => {
                return trade.price
            })
            let shortAvg = this.getAvg(shortPrices)
            
            this.log("=======")
            
            this.log("longAvg",longAvg,longPrices.length)
            this.log("shortAvg",shortAvg,shortPrices.length)
            
            this.log(shortAvg - longAvg)
            
            if (shortAvg >= longAvg && this.shortAvg < this.longAvg) {
                this.setState("createOrder", {
                    price: this.requirements.shot.shot.sell1,
                    amount: this.amount,
                    marketOnly: true
                })
            } else if (shortAvg <= longAvg && this.shortAvg > this.longAvg) {
                this.setState("createOrder", {
                    price: this.requirements.shot.shot.buy1,
                    amount: -this.amount,
                    marketOnly: true
                })
            } else {
                this.setState("watch")
            }
            
            this.shortAvg = shortAvg
            this.longAvg = longAvg
            
            this.setState("watch")
        }) 
    },
    atCreateOrder(stale, info) {
        if (!this.requirements.market.runtime) {
            this.setState("watch")
            return
        }
        this.log("create order params",info)
        let order = this.requirements.market.runtime.createOrder(info)
        this.log("order", order)
        this.setState("watch")
    }
}
