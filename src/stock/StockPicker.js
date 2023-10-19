

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

function extractFieldFromKLine(klines, pos, field, defaultValue){
    let kp=klines.length+pos-1
    if( kp < 0){
        return defaultValue
    }
    let kline=klines[kp]
    if(!kline){ 
        return defaultValue;
    }
    return parseInt((parseFloat(kline[field])*100)) 
}

function buildTrainFile(dir,filter){
    let start=Date.now()
    let companyFolder=dir+"/company"
    let klinesFolder=dir+"/klines"
    let trainFolder="./data/temp/train"
    let conpanyFiles=fs.readdirSync(companyFolder)
 
    let data=[]
    for (let cfi = 0; cfi < conpanyFiles.length; cfi++) {
        const conpanyFile = conpanyFiles[cfi];
        if(!conpanyFile.endsWith(filter)) continue;

        // company
        let stock=JSON.parse(FileHelper.read(companyFolder+"/"+conpanyFile, true));
        stock.lines=[]
        stock.klines=[]

        let code=conpanyFile.split(".")[0]
        let klinesFiles=FileHelper.getFiles(klinesFolder+"/"+code)
        // klines, 
        let linei=0
        let lineNums=[]
        for (let kfi = 0; kfi < klinesFiles.length; kfi++) { 
            const liner = new lineByLine(klinesFiles[kfi]);
            let line; 
           
            while (line = liner.next()) {
                linei++
                let values=line.toString('utf8').split(",")
                //2023-08-25,29.40,31.71,32.89,28.60,560446,1797066265.00,14.35,6.05,1.81,10.80
                
                let kline={
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
                }

                stock.klines.push(kline)
                stock.lines.push(line)

                let klines=stock.klines

                if(!kline.analyst){  kline.analyst={} }
                rate0=extractFieldFromKLine(klines, -0, "exchange", 0)
                rate1=extractFieldFromKLine(klines, -1, "exchange", 0)
                rate2=extractFieldFromKLine(klines, -2, "exchange", 0)
                rate3=extractFieldFromKLine(klines, -3, "exchange", 0)
                rate4=extractFieldFromKLine(klines, -4, "exchange", 0)
                rate5=extractFieldFromKLine(klines, -5, "exchange", 0)
                rate6=extractFieldFromKLine(klines, -6, "exchange", 0)
                rate7=extractFieldFromKLine(klines, -7, "exchange", 0)
                rate8=extractFieldFromKLine(klines, -8, "exchange", 0)
                rate9=extractFieldFromKLine(klines, -9, "exchange", 0)
                rate10=extractFieldFromKLine(klines, -10, "exchange", 0)

                let a=kline.analyst
                a.rate1=rate1
                a.rate2=rate2
                a.rate3=rate3
                a.rate4=rate4
                a.rate5=rate5
                a.rate6=rate6
                a.rate7=rate7
                a.rate8=rate8
                a.rate9=rate9
                a.rate10=rate10 
        
                a.exa1=rate1
                a.exa11=rate2
                a.exa12=parseInt((rate2+rate3)/2)
                a.exa13=parseInt((rate2+rate3+rate4)/3)
                a.exa17=parseInt((rate2+rate3+rate4+rate5+rate6+rate7+rate8)/7)
                a.exa19=parseInt((rate2+rate3+rate4+rate5+rate6+rate7+rate8+rate9+rate10)/9)
                a.exa2=parseInt((rate1+rate2)/2)
                a.exa25=parseInt((rate3+rate4+rate5+rate6+rate7)/5)
                a.exa3=parseInt((rate1+rate2+rate3)/3)
                a.exa37=parseInt((rate4+rate5+rate6+rate7+rate8+rate9+rate10)/7)
         
                a.exa_dp37=parseInt((a.exa3-a.exa37)/a.exa37*100)
                a.exa_dp25=parseInt((a.exa2-a.exa25)/a.exa25*100)
                a.exa_dp11=parseInt((a.exa1-a.exa11)/a.exa11*100)
                a.exa_dp12=parseInt((a.exa1-a.exa12)/a.exa12*100)
                a.exa_dp13=parseInt((a.exa1-a.exa13)/a.exa13*100)
                a.exa_dp17=parseInt((a.exa1-a.exa17)/a.exa17*100)
                a.exa_dp19=parseInt((a.exa1-a.exa19)/a.exa19*100)

                if(linei>20){
                    //首次放量
                    let check=(a.exa_dp11>200 &&a.exa_dp12>200 && a.exa_dp13>200 && kline.amp_final_percent>0)
                    if(check){
                        lineNums.push(linei)
                    }
                }
            }
        } 

        let section=0
        for (let ni = 0; ni < stock.klines.length; ni++) {
            let kline = stock.klines[ni];
            let a=kline.analyst

            if(ni>20){
                //首次放量
                let check=(a.exa_dp11>200 &&a.exa_dp12>200 && a.exa_dp13>200 && kline.amp_final_percent>0)
                if(check){
                    for (let index = ni-20 ; index < ni+20; index++) {
                        if(index>stock.lines.length-1)break
                        let line=stock.lines[index]
                        let codeFolder=trainFolder+"/"+stock.code
                        if(!fs.existsSync(codeFolder)) { fs.mkdirSync(codeFolder); } 
                        FileHelper.append(codeFolder+"/train-"+section+".csv", line+"\n")
                    }
                    section++
                }
            }
        }
    }
}

 

async function main(){
    let dir="./data/stock/spider"
    let filter=".dat"
    buildTrainFile(dir,filter)
}


main()
     






