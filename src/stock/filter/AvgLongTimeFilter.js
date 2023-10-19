module.exports = {
    check(context, stock) { 
        let e=stock.klines[stock.klines.length-1];
        let a=stock.analyst;
        let check= true;


        let d1= ((a.mp1_5-a.mp5_5) /a.mp5_5)
        let d2= ((a.mp5_5-a.mp10_5)/a.mp10_5)

        let d3= (a.mp1_5-a.mp10_5)/a.mp10_5
    
        // 10内均价变化不超过2%
        // check=Math.abs(d1-d2)<0.02 && d1>0 && d2>0
        check=Math.abs(d1)<0.01 && d3>0.02


        // 尚未放量
        // check&=(a.exa_dp11<200 &&a.exa_dp12<200 && a.exa_dp13<200)
        // 当天放量
        check&=(a.exa_dp11>150 &&a.exa_dp12>150 && a.exa_dp13>150 )
        if(check){
            // console.log(a)
        }


         
       return check
    }
}
