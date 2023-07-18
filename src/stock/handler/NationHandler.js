
const ROOT = __dirname + "/../../.."

const FileHelper = require("../../file/FileHelper.js")
const Helper = require("../../util/Helper.js")

module.exports = {
    type:"ONCE",
 
    handle(context, stock) {
        let config=Helper.config()
        let nationData = JSON.parse(FileHelper.read(ROOT +"/"+ config.spider.nation));
        if(!nationData ||nationData.length==0){
            return ;
        }
        let nationMap={}
        for (let ndi = 0; ndi < nationData.length; ndi++) {
            const ndata = nationData[ndi];
            nationMap[ndata.code]=ndata
        }
        context["nationMap"]=nationMap
    }
}
