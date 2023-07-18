
module.exports = {
    filters:[],
    handlers:[],
    analyzeFilters:[],
    context:{},

    appendFilter(filter) {
        this.filters.push(filter)
    },
    appendAnalyzeFilter(filter) {
        this.analyzeFilters.push(filter)
    },

    
    cleanAnalyzeFilter() {
        this.analyzeFilters=[]
    },

    appendHandler(handler) {
        this.handlers.push(handler)
    },


    doFilters(data, filters) {
        // execute filter
        let result=[]
        data.forEach(stock=>{
            let isRightStock=true;
            for (var fi=0;fi<filters.length;fi++) {
                let filter=filters[fi]
                if(!filter.check(this.context,stock)){
                    isRightStock=false;
                    break;
                }
            }
            if(isRightStock){
                result.push(stock)
            }
        })
        return result;
    },

    
    doHandlers(data, handlers) {
        let onceHandlers=handlers.filter(e=>e.type=='ONCE');
        let eachHandlers=handlers.filter(e=>e.type=='EACH');

        // execute handler once
        if(onceHandlers && onceHandlers.length){
            onceHandlers.forEach(handler=>{
                handler.handle(this.context, data)
            })
        }

        // execute handler each
        data.forEach(stock=>{
            for (var fi=0;fi<eachHandlers.length;fi++) {
                let handler=eachHandlers[fi]
                handler.handle(this.context, stock)
            }
        })
    },

    analyze(data) {
        let start=new Date().getTime(); 
        
        console.log("等待分析的股票数： ", data.length)
        // execute filter
        let result=this.doFilters(data, this.filters)
        console.log("前置过滤后股票数： ", result.length)
      
        // execute handlers
        this.doHandlers(result, this.handlers)
 
        // execute analyze filter
        result=this.doFilters(result, this.analyzeFilters)
        console.log("分析过滤后股票数： ", result.length)
        
        let end=new Date().getTime();
        console.log("分析耗时 ", end-start, " ms");

        return result;
    }
}

