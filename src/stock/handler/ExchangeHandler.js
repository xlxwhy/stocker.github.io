module.exports = {
    type:"EACH",
    extractRateFromKLine(kline){
        // return parseInt((parseFloat(kline.split(",") [10])*100)) 
        if(!kline){
            console.log("kline should not be empty!");
            return 0;
        }
        return parseInt((parseFloat(kline["exchange"])*100)) 
    },

    handle(context, stock) {
 
        e=stock
        if(!e.klines || e.klines.length==0) {
            console.log("klines should not be empty!", e.code);
            return;
        }

        if(!stock.analyst){  stock.analyst={} }
        
        let klines=e.klines
        let len=klines.length
 
        let rate1=this.extractRateFromKLine(klines[len-1])
        let rate2=this.extractRateFromKLine(klines[len-2])
        let rate3=this.extractRateFromKLine(klines[len-3])
        let rate4=this.extractRateFromKLine(klines[len-4])
        let rate5=this.extractRateFromKLine(klines[len-5])
        let rate6=this.extractRateFromKLine(klines[len-6])
        let rate7=this.extractRateFromKLine(klines[len-7])
        let rate8=this.extractRateFromKLine(klines[len-8])
        let rate9=this.extractRateFromKLine(klines[len-9])
        let rate10=this.extractRateFromKLine(klines[len-10])
        
        let a=e.analyst
        a.rate1=rate1
        a.rate2=rate2
        a.rate3=rate3
        a.rate4=rate4
        a.rate5=rate5
        a.rate6=rate6
        a.rate7=rate7
        a.rate8=rate8
        a.rate9=rate9
        a.rate10=rate10 

        a.exa1=rate1
        a.exa11=rate2
        a.exa12=parseInt((rate2+rate3)/2)
        a.exa13=parseInt((rate2+rate3+rate4)/3)
        a.exa17=parseInt((rate2+rate3+rate4+rate5+rate6+rate7+rate8)/7)
        a.exa19=parseInt((rate2+rate3+rate4+rate5+rate6+rate7+rate8+rate9+rate10)/9)
        a.exa2=parseInt((rate1+rate2)/2)
        a.exa25=parseInt((rate3+rate4+rate5+rate6+rate7)/5)
        a.exa3=parseInt((rate1+rate2+rate3)/3)
        a.exa37=parseInt((rate4+rate5+rate6+rate7+rate8+rate9+rate10)/7)
 
        a.exa_dp37=parseInt((a.exa3-a.exa37)/a.exa37*100)
        a.exa_dp25=parseInt((a.exa2-a.exa25)/a.exa25*100)
        a.exa_dp11=parseInt((a.exa1-a.exa11)/a.exa11*100)
        a.exa_dp12=parseInt((a.exa1-a.exa12)/a.exa12*100)
        a.exa_dp13=parseInt((a.exa1-a.exa13)/a.exa13*100)
        a.exa_dp17=parseInt((a.exa1-a.exa17)/a.exa17*100)
        a.exa_dp19=parseInt((a.exa1-a.exa19)/a.exa19*100)
 
    }
}
