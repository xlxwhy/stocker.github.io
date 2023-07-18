module.exports = {
    check(context, stock) {
       let check= stock.klines && stock.klines.length>90 
       return check
    }
}
