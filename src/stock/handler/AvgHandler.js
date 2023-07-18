const Helper =require("../../util/Helper.js") 
const lodash=require("lodash")


module.exports = {
    type:"ONCE", 

    handle(context, stocks) {
        if(!stocks || !stocks.length) return;
        for (let index = 0; index < stocks.length; index++) {
            this.handleStock(stocks[index])  
        }        
    },    

    getAvgValue(klines, index, field, avg){
        const start=index-(avg-1);
        const end=index+1
        //计算AVG
        if(start>=0){            
            return Number(Number(Helper.avgList(klines, start, end, field)).toFixed(4))
        }
        return null;
    },

    handleStock(stock) {
        const klines=stock.klines;
        if(!klines || !klines.length) return; 

        if(!stock.analyst) stock.analyst={}
        let a=stock.analyst
        let index=0;

        index=klines.length-1
        a.m5=this.getAvgValue(klines, index, "close", 5)
        a.m10=this.getAvgValue(klines, index, "close", 10)
        a.m20=this.getAvgValue(klines, index, "close", 20)

        index=klines.length-2
        a.mp1_5=this.getAvgValue(klines, index, "close", 5)
        a.mp1_10=this.getAvgValue(klines, index, "close", 10)
        a.mp1_20=this.getAvgValue(klines, index, "close", 20)

        index=klines.length-5
        a.mp5_5=this.getAvgValue(klines, index, "close", 5)
        a.mp5_10=this.getAvgValue(klines, index, "close", 10)
        a.mp5_20=this.getAvgValue(klines, index, "close", 20)

        index=klines.length-10
        a.mp10_5=this.getAvgValue(klines, index, "close", 5)
        a.mp10_10=this.getAvgValue(klines, index, "close", 10)
        a.mp10_20=this.getAvgValue(klines, index, "close", 20)

        index=klines.length-15
        a.mp15_5=this.getAvgValue(klines, index, "close", 5)
        a.mp15_10=this.getAvgValue(klines, index, "close", 10)
        a.mp15_20=this.getAvgValue(klines, index, "close", 20)

    },
    

}
