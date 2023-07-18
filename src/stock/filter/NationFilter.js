module.exports = {
    check(context, stock) {
        let nation=context.nationMap[stock.code]
        if(!nation) return false;
 
       return true
    }
}
