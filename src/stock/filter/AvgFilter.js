module.exports = {
    check(context, stock) { 
        let e=stock.klines[stock.klines.length-1];
        let a=stock.analyst;
        let check= true;
        
        // 当天MA5与MA10交叉
        check =( (a.m5-a.m10)/a.m5>-0.002  ) && (a.mp1_5<a.mp1_10 && a.mp5_5<a.mp5_10 && a.mp10_5<a.mp10_10)
        // check =( (a.m5-a.m10)/a.m5>0.005 ) && (a.mp1_5<a.mp1_10 && a.mp5_5<a.mp5_10 && a.mp10_5<a.mp10_10)

        // 最近MA5与MA10交叉
        // check =( (a.m5>a.m10)  && (a.m5-a.m10)>(a.mp1_5-a.mp1_10) ) && (a.mp5_5<a.mp5_10 && a.mp10_5<a.mp10_10) 
        // check =( (a.m5-a.m10)/a.m5>0.01 && (a.m5-a.m10)>(a.mp1_5-a.mp1_10) ) && (a.mp5_5<a.mp5_10 && a.mp10_5<a.mp10_10)

        // 尚未放量
        check&=(a.exa_dp11<200 &&a.exa_dp12<200 && a.exa_dp13<200)
        // 当天放量
        // check&=(a.exa_dp11>200 &&a.exa_dp12>200 && a.exa_dp13>200 )

        check&= (a.m5<a.m20   )
        // check&=(e.amp_final_percent>0  )
        // if(check)console.log(stock.name, a);
       return check
    }
}
