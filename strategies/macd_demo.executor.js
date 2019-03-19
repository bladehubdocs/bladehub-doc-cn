const min = 1000 * 60 
const hour = min * 60
class Main{
    constructor(){
        this.isExecutor = true
        this.initialState = "watch"
        this.tickInterval = 1000
        this.plotInterval = 1000
        // https://www.investopedia.com/terms/e/ema.asp
        this.ema1 = 12
        this.ema2 = 26
        this.emaSmooth = 2
        this.data = {}
        
    }
    calculateEMA(aggs,count){
        count = Math.min(count,aggs.length)
        let k = this.emaSmooth/(count + 1)
        return aggs.slice(-count).reduce((prevEMA,agg)=>{
            return (prevEMA * (1-k)) + agg.average * k
        },0)
    }
    setup(){
        this.log("此策略不准确仅供参考学习")
        this.requirements = {
            aggs:{   
                type:"aggregations",
                context: {
                    name:"bitmex_btc_usd",
                    sp:"bitmex",
                    front:"btc",
                    back:"usd",
                },
                duration:hour * 48,
                rate: "15min"
            }
        }
        this.plots = {
            e1:{
                chart:"EMA"
            },
            e2:{
                chart:"EMA"
            },
            macd:{
                chart:"MACD"
            }
        }
    }
    atWatch(){
        this.nextTick(()=>{
            let aggs = this.requirements.aggs.aggregations
            let last = aggs.slice(-1)[0]
            if(aggs){
                let e1 = this.calculateEMA(aggs,this.ema1)
                let e2 = this.calculateEMA(aggs,this.ema2)
                let macd = e1 - e2
                this.plots.e1.data = e1
                this.plots.e2.data = e2
                this.plots.macd.data = macd
                if(this.data.macd * macd < 0){
                    this.log("MACD CROSS")
                    if(macd > 0){
                        this.log("买入信号",last.average,new Date(this.now).toLocaleString())
                    }else{
                        this.log("卖出信号",last.average,new Date(this.now).toLocaleString())
                    }
                }
                this.data.macd = macd
            }else{
                this.log("Missing datas",aggs,this.requirements.aggs)
            }
            this.setState("watch")
        })
    }
}


module.exports = new Main()
