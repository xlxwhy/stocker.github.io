module.exports = {
    check(context, stock) {
        let check=!(stock.name.indexOf("ST")>=0 )
        return check
    }
}
