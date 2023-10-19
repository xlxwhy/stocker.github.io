module.exports = {

    extractFieldFromKLine(klines, pos, field, defaultValue){
        let kp=klines.length+pos-1
        if( kp < 0){
            return defaultValue
        }
        let kline=klines[kp]
        if(!kline){ 
            return defaultValue;
        }
        return parseInt((parseFloat(kline[field])*100)) 
    },
    

    check(context, stock) { 
        let a=stock.analyst;
        let check= true;

        //只有一次放量
        let DAYS=20
        let sum=0
        let sumi=0
        for (let di = 1; di <= DAYS; di++) {
            const klines = stock.klines;
            let close1=this.extractFieldFromKLine(klines, -di+1, "close", 0)
            let rate1=this.extractFieldFromKLine(klines, -di+1, "exchange", 0)
            let rate2=this.extractFieldFromKLine(klines, -di+0, "exchange", 0)
            let rate3=this.extractFieldFromKLine(klines, -di-1, "exchange", 0)
            let rate4=this.extractFieldFromKLine(klines, -di-2, "exchange", 0)
            let a={}
            a.exa1=rate1
            a.exa11=rate2
            a.exa12=parseInt((rate2+rate3)/2)
            a.exa13=parseInt((rate2+rate3+rate4)/3)

            a.exa_dp11=parseInt((a.exa1-a.exa11)/a.exa11*100)
            a.exa_dp12=parseInt((a.exa1-a.exa12)/a.exa12*100)
            a.exa_dp13=parseInt((a.exa1-a.exa13)/a.exa13*100)

            if(a.exa_dp11>200 &&a.exa_dp12>200 && a.exa_dp13>200 && close1>0){
                sum++
                sumi=di
            }
        }
        check&=(sum==1)

        if(!check) return check;


        //后5天比前5天均价高
        let EXDAYS=5
        let neLen=sumi
        if(neLen<EXDAYS || neLen>EXDAYS*2) return false;
        let sumPe=0; sumNe=0; sumNa=0;
        let avgPe=0; avgNe=0; avgNa=0;

        for (let di = 0; di < EXDAYS; di++) { 
            sumPe+=Number(stock.klines[stock.klines.length-sumi-di-1].close);
            sumNe+=Number(stock.klines[stock.klines.length-sumi+di].close);
            sumNa+=Number(stock.klines[stock.klines.length-sumi+di].amp_total);
        }
        avgPe=sumPe/EXDAYS
        avgNe=sumNe/EXDAYS
        avgNa=sumNa/EXDAYS

        let pnr=(avgNe-avgPe)/avgPe
         
        check&=(pnr<0.08 && pnr>0.04 && avgNa<6)
        if(stock.code=="000663"){
            console.log("pnr=",pnr);
            console.log("pnr=", sumNe,avgNe, sumPe,avgPe, sumNa, avgNa);
        }

       return check
    }
}
