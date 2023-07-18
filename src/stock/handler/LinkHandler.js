const Helper =require("../../util/Helper.js") 
const lodash=require("lodash")


module.exports = {
    type:"ONCE", 

    handle(context, stocks) {
        if(!stocks || !stocks.length) return;
        for (let index = 0; index < stocks.length; index++) {
            this.handleStock(stocks[index])
            break;
        }        
    },
    handleStock(stock) {
        const klines=stock.klines;
        if(!klines || !klines.length) return;
        for (let index = 0; index < klines.length; index++) {
            const e = klines[index];
            if(index>0) e.pre=klines[index-1]
            if(index<klines.length-1) e.next=klines[index+1]
        }
    },
    

}
