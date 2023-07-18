


const axios = require("axios")

module.exports = {
    get(url) {
        return axios.get(url).then((res) => {
            return res.data
        }).catch(ex => {
            console.error(ex)
        })
    },
    post(url, data) {
        return axios.post(url, data).then((res) => {
            return res.data
        }).catch(ex => {
            console.error(ex)
        })
    }
}





