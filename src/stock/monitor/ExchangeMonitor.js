
let fs = require('fs')
var argv = require('minimist')(process.argv.slice(2));
const ROOT = __dirname + "/../../.."

const util = require("util")

const AxiosRequest =require("../../http/AxiosRequest.js") 
const FileHelper =require("../../file/FileHelper.js") 
const Helper =require("../../util/Helper.js") 
const EastMoney =require("../spider/EastMoney.js") 

const lineByLine = require('n-readlines');
const PATH="./data"


const StockAnalyzer = require("../analyzer/StockAnalyzer.js") 
const ExchangeFilter = require("../filter/ExchangeFilter.js")
const AvgFilter = require("../filter/AvgFilter.js")
const NotNewFilter = require("../filter/NotNewFilter.js")
const NotSTFilter = require("../filter/NotSTFilter.js")
const ExchangeHandler = require("../handler/ExchangeHandler.js")
const AvgHandler = require("../handler/AvgHandler.js")
const LinkHandler = require("../handler/LinkHandler.js")
const NationHandler = require("../handler/NationHandler.js")
const NationFilter = require("../filter/NationFilter.js")
const AvgLongTimeFilter = require("../filter/AvgLongTimeFilter.js")
const OneExchangeFilter = require("../filter/OneExchangeFilter.js")


function buildStockerHtml(data, name) {
    if (!data || data.length == 0) {
        console.log(name, "分析结果为空!");
        return ""
    }
    //html
    let content = "<br/>"+name+"<br/>\n"
    for (let rowi = 0; rowi < data.length; rowi++) {
        const stock = data[rowi];
        let a = stock.analyst
        let code = stock.code
        let link = "<a href='%s'>%s,%s</a> <br/>\n"
        //code startsWith(0-3-4-6-68-8)
        let linkHerf="https://wap.eastmoney.com/quote/stock/"+stock.market+"."+stock.code+".html"
        content += util.format(link, linkHerf, stock.name, stock.code)
    } 
    return content;
}


function getKLinesValue(values, index){
    if(values.length>index) return values[index];
    else return null;
}

function buildJsonFiles(codes){
    let start=Date.now() 
    
    let dir="./data/stock/spider"
    let companyFolder=dir+"/company"
    let klinesFolder=dir+"/klines"
  
    let data=[]
    for (let cfi = 0; cfi < codes.length; cfi++) {
        let code=codes[cfi]
 
        // company
        let stock=JSON.parse(FileHelper.read(companyFolder+"/"+code+".dat", true)); 
        let klinesFiles=FileHelper.getFiles(klinesFolder+"/"+code)
        // klines, 
        // 仅处理klines最新2个文件(最近2年的数据)
        // 仅处理klines最新100个数据
        let klineCount=100
        if(klinesFiles && klinesFiles.length>2){
            klinesFiles.splice(0, klinesFiles.length-2)
        }
        for (let kfi = 0; kfi < klinesFiles.length; kfi++) { 
            const liner = new lineByLine(klinesFiles[kfi]);
            let line; 
            while (line = liner.next()) {
                stock.klines.push(line.toString('utf8'));   
            }
        }
        if(stock.klines.length>klineCount){
            stock.klines=stock.klines.splice(-klineCount)
        }
        data.push(stock)        
    }
    console.log("读到"+data.length+"个文件数据!","耗时",Date.now()-start, "ms", start=Date.now());
 
    data.forEach(stock=>{
        let klines=[];
        stock.klines.forEach(e=>{
            let values=e.split(",")
            //2023-08-25,29.40,31.71,32.89,28.60,560446,1797066265.00,14.35,6.05,1.81,10.80
            klines.push({
                "date": getKLinesValue(values,0),
                "open": getKLinesValue(values,1),
                "close":getKLinesValue(values,2),
                "max":getKLinesValue(values,3),
                "min": getKLinesValue(values,4),
                "deal_num": getKLinesValue(values,5),
                "deal_amount": getKLinesValue(values,6),
                "amp_total": getKLinesValue(values,7),          //振幅
                "amp_final_percent": getKLinesValue(values,8),  //涨跌比率
                "amp_final_amount": getKLinesValue(values,9),   //涨跌金额
                "exchange": getKLinesValue(values,10),
            })
        })
        stock.klines=klines;
    })
    console.log("完成转换!","耗时",Date.now()-start, "ms", start=Date.now());
 

    let content=""
    let analyzer = StockAnalyzer;
    analyzer.appendFilter(NotNewFilter)
    analyzer.appendFilter(NotSTFilter)
    analyzer.appendHandler(ExchangeHandler)
    analyzer.appendHandler(AvgHandler)
    analyzer.appendHandler(NationHandler)

 
    // OneExchangeFilter
    console.log("=========================OneExchangeFilter");
    analyzer.cleanAnalyzeFilter()
    analyzer.appendAnalyzeFilter(OneExchangeFilter)  
    content+=buildStockerHtml(analyzer.analyze(data),"OneExchangeFilter"); 

    // analyst html
    let template = FileHelper.read(ROOT + "/src/stock/html/template.html")
    let html=util.format(template, content)

    let date = Helper.formatDate()
    let timestamp = parseInt(new Date().getTime() / 1000 / 3600) 


    let file ;
    if(argv["github"]=="true"){
        file = ROOT + "/data/stock/analyst/stocker-" + date + "-" + timestamp + ".html"
        FileHelper.write(file, html)
        let githubHtml="<a href='https://whimpark.github.io/stocker.github.io/'>stocker.github.io</a><br/>\n"
        sendEmail(githubHtml+html)
    }else{
        file = ROOT + "/data/temp/stocker-" + date + "-" + timestamp + ".html"
        FileHelper.write(file, html)
    }

}

 
 


async function main(){
    const start=Date.now();
    const today=Helper.formatDate()
    let size=20
    let startPage=0
    let result, pages


    // fromDate(15天前的当年1号)
    // 必须整年获取数据
    let fromDate;
    if(argv["append-klines"]=="true"){ 
        const date=new Date(Date.now()-15*24*3600*1000)
        fromDate=date.getFullYear()+"0101"
    }
 
    // fetch Stock
    let codes=await EastMoney.fetchData("Stock", 0, 10, 20, fromDate);

    // let codes=[
    //     '688256', '301348', '300812',
    //     '300290', '301517', '688693',
    //     '300342', '600439', '600619',
    //     '603178', '001266', '605111',
    //     '001270', '603158', '002176',
    //     '603893', '605258', '002729',
    //     '600520', '002077'
    //   ] 

    buildJsonFiles(codes)
 
    
  

    console.log("耗时: ",Date.now()-start, " ms")

}


main()
     






