module.exports = {
    check(context, stock) {
        let e=stock.klines[stock.klines.length-1];
        let a=stock.analyst;
        let check= a.exa1>300 && a.exa2>300 && a.exa3>300 && a.exa37<150 

        //首次放量
        check=(a.exa_dp11>200 &&a.exa_dp12>200 && a.exa_dp13>200 && e.amp_final_percent>0  )
        //首次放量
        // check=(a.exa_dp11>300 &&a.exa_dp12>200 && a.exa_dp13>200 && a.exa_dp17>200 && a.exa_dp19>200)
        //二次连续放量(3倍)
        // check=(a.exa2>400 && a.exa_dp25>300)
        // check=(a.exa1>a.exa2 && a.exa2>a.exa3 && a.exa_dp19>300 && a.exa_dp25>150 && a.exa_dp37>150 )
        // check=(a.exa1>300 && a.exa2>300 && a.exa3>300 && a.exa37<150 )

       return check
    }
}
