

const fs = require('fs')
const FileHelper =require("../file/FileHelper.js") 
const Helper = require('../util/Helper.js')

 
const lineByLine = require('n-readlines');

 
const ROOT=__dirname+"/../.."


function getKLinesValue(values, index){
    if(values.length>index) return values[index];
    else return null;
}

function modifyJsonFiles(dir,filter){
    let start=Date.now()
    let companyFolder=dir+"/company"
    let klinesFolder=dir+"/klines"
    let conpanyFiles=fs.readdirSync(companyFolder)
 
    let data=[]
    for (let cfi = 0; cfi < conpanyFiles.length; cfi++) {
        const conpanyFile = conpanyFiles[cfi];
        if(!conpanyFile.endsWith(filter)) continue;

        // company
        let stock=JSON.parse(FileHelper.read(companyFolder+"/"+conpanyFile, true));
        let code=conpanyFile.split(".")[0]
        let klinesFiles=FileHelper.getFiles(klinesFolder+"/"+code)

        for (let kfi = 0; kfi < klinesFiles.length; kfi++) { 
            console.log(klinesFiles[kfi])
            let content=FileHelper.read(klinesFiles[kfi])
            let lines=content.split("\n")
            if(lines[0].startsWith("M")){
                lines[0]= Buffer.from(lines[0],"base64").toString("utf-8");
            } 
            FileHelper.write(klinesFiles[kfi], lines.join("\n"))
        }
    }
}

function buildJsonFiles(dir,filter){
    let start=Date.now()
    let companyFolder=dir+"/company"
    let klinesFolder=dir+"/klines"
    let conpanyFiles=fs.readdirSync(companyFolder)
 
    let data=[]
    for (let cfi = 0; cfi < conpanyFiles.length; cfi++) {
        const conpanyFile = conpanyFiles[cfi];
        if(!conpanyFile.endsWith(filter)) continue;

        // company
        let stock=JSON.parse(FileHelper.read(companyFolder+"/"+conpanyFile, true));
        let code=conpanyFile.split(".")[0]
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
 

    //write data file
    let builderOutputFileName="builder-"+parseInt(new Date().getTime()/1000/3600)+".json" 
    let file=ROOT+"/data/temp/"+builderOutputFileName;
    FileHelper.write(file,"[")
    for (let index = 0; index < data.length; index++) {
        const stock = data[index];
        FileHelper.append(file,JSON.stringify(stock))
        if(index!=(data.length-1)){
            FileHelper.append(file,",")
        }
    }
    FileHelper.append(file,"]")
    console.log("完成写入JSON文件!","耗时",Date.now()-start, "ms", start=Date.now());
    //write config
    Helper.config(builderOutputFileName,"builder","filename")
}

 

async function main(){
    let dir="./data/stock/spider"
    let filter=".dat"
    // buildJsonFiles(dir,filter)

    modifyJsonFiles(dir,filter)

}


main()
     






