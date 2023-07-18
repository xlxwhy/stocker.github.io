
/**
   kline: 
   "2022-12-30,15.50,17.42,17.42,15.42,1735005,2883635635.00,12.63,9.97,1.58,63.48"
    日期, 开盘, 收盘, 最高, 最低, 成交量, 成交额，振幅, 涨跌幅, 涨跌额, 换手率
    stock_date, open,close, max, min, deal_num, deal_amount, amplitude, final_amp, final_amp_amount, turnover
 */

const ROOT = __dirname + "/../.."
const FileHelper = require("../file/FileHelper.js")

const Helper = require("../util/Helper.js")
const util = require("util")
const fs = require('fs')
const nodemailer = require("nodemailer");

const argv = require('minimist')(process.argv.slice(2));

const StockAnalyzer = require("./analyzer/StockAnalyzer.js")
const ExchangeFilter = require("./filter/ExchangeFilter.js")
const AvgFilter = require("./filter/AvgFilter.js")
const NotNewFilter = require("./filter/NotNewFilter.js")
const NotSTFilter = require("./filter/NotSTFilter.js")
const ExchangeHandler = require("./handler/ExchangeHandler.js")
const AvgHandler = require("./handler/AvgHandler.js")
const LinkHandler = require("./handler/LinkHandler.js")
const NationHandler = require("./handler/NationHandler.js")
const NationFilter = require("./filter/NationFilter.js")
const AvgLongTimeFilter = require("./filter/AvgLongTimeFilter.js")



function buildHomeHtml() {
    
    let template = FileHelper.read(ROOT + "/src/stock/html/template.html")
    let content = ""

    let dir="./data/stock/analyst"
    
    let files=fs.readdirSync(dir) 
    files.reverse();
    let link = "<a href='%s'>%s</a> <br/>\n"
    for (let rowi = 0; rowi < files.length; rowi++) {
        const file = files[rowi];
        const linkHerf = "./analyst/" + file 
        content += util.format(link, linkHerf, file)
    }

    let html = util.format(template, content)
    FileHelper.write(ROOT + "/data/stock/index.html", html)
}

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


function sendEmail(html) {
    // 创建一个发送邮件对象实例，配置基础信息
    //host，port等信息，不同邮箱的配置内容可以在node_modules/lib/well_know/services.json中找到
    let username=argv["email-username"]
    let password=argv["email-password"]
    let transporter = nodemailer.createTransport({
        host: "smtp.qq.com",
        port: 465,
        secure: true, // true for 465, false for other ports //如果端口号是465为true，反之false
        auth: {
            user: username, // 发送方的邮箱地址
            pass: password  // 此处填写你的邮箱授权码
        }
    });

    // send mail with defined transport object
    let mailObj = {
        from: '1509868568@qq.com', // 发送者，必须与上面的发送方信息一致，否则发送失败
        to: "1509868568@qq.com", // 多个发送用逗号隔开
        subject: "stocker-" + Helper.formatDate(), // 主题
        html: html // html body
    }
    //调用发送方法 
    transporter.sendMail(mailObj, (err, data) => {
        if (err) console.log(err)
        else console.log('send mail success!')
    }); 

}


async function show(data, name) {
    if (!data || data.length == 0) {
        console.log("分析结果为空!");
        return
    }
    //md
    let content = ""
    let title = util.format("|%s|%s|%s|%s|%s|%s|%s|%s|%s|%s|%s|%s|", "编号", "名称", "EXA1", "EXA13", "EXA-DP13", "EXA2", "EXA25", "EXA-DP25", "EXA3", "EXA37", "EXA-DP37")
    console.log(title);
    content += title + "\n"
    content += "|-|-|-|-|-|-|-|-|-|-|-|-|\n"
    data.forEach(stock => {
        let a = stock.analyst
        let link = util.format("[%s](http://quote.eastmoney.com/sh%s.html#fullScreenChart)", stock.code, stock.code)
        let msg = util.format("|%s|%s|%s|%s|%s|%s|%s|%s|%s|%s|%s|%s|", link, stock.name, a.exa1, a.exa13, a.exa_dp13, a.exa2, a.exa25, a.exa_dp25, a.exa3, a.exa37, a.exa_dp37)
        console.log(msg);
        content += msg + "\n"
    })
    let date = Helper.formatDate()
    let timestamp = parseInt(new Date().getTime() / 1000 / 3600)
    let filename = "analyst-" + name + "-" + date + "-" + timestamp
    // FileHelper.write(ROOT+"/data/temp/"+filename+".md", content)

    //json
    let stocks = []
    data.forEach(stock => {
        stocks.push({
            code: stock.code,
            name: stock.name,
            info: stock.klines[stock.klines.length - 1]
        })
    })
    FileHelper.write(ROOT + "/data/temp/" + filename + ".json", JSON.stringify(stocks, null, 2))

    //write config
    Helper.config(filename, "analyst", "filename")

    await Helper.sleep(500)
}

function main() {
    
    let config = Helper.config()
    let path = ROOT + "/data/temp/" + config.builder.filename
    let data = JSON.parse(FileHelper.read(path));

    let analyzer = StockAnalyzer;
    analyzer.appendFilter(NotNewFilter)
    analyzer.appendFilter(NotSTFilter)
    analyzer.appendHandler(ExchangeHandler)
    analyzer.appendHandler(AvgHandler)
    analyzer.appendHandler(NationHandler)


    let content="";


    // AvgLongTimeFilter
    console.log("=========================avg-long-time");
    analyzer.cleanAnalyzeFilter()
    analyzer.appendAnalyzeFilter(AvgLongTimeFilter)  
    content+=buildStockerHtml(analyzer.analyze(data),"avg-long-time"); 

    //nation+avg
    console.log("=========================nation+avg");
    analyzer.cleanAnalyzeFilter()
    analyzer.appendAnalyzeFilter(AvgFilter) 
    analyzer.appendAnalyzeFilter(NationFilter) 
    content+=buildStockerHtml(analyzer.analyze(data),"nation+avg"); 
    
    //nation+exchange
    console.log("=========================nation+exchange");
    analyzer.cleanAnalyzeFilter()
    analyzer.appendAnalyzeFilter(ExchangeFilter) 
    analyzer.appendAnalyzeFilter(NationFilter) 
    content+=buildStockerHtml(analyzer.analyze(data),"nation+exchange"); 


    //avg
    console.log("=========================avg");
    analyzer.cleanAnalyzeFilter()
    analyzer.appendAnalyzeFilter(AvgFilter) 
    content+=buildStockerHtml(analyzer.analyze(data),"avg");

    //exchange
    console.log("=========================exchange");
    analyzer.cleanAnalyzeFilter()
    analyzer.appendAnalyzeFilter(ExchangeFilter) 
    content+=buildStockerHtml(analyzer.analyze(data),"exa"); 

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

    // index.html
    buildHomeHtml()

}


main()







