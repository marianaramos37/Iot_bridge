const fs = require('fs');
const EventEmitter = require('events')
const getProtocol = require('./visualization.js');

class InfluxInstance{
    constructor(token, org, bucket, url, measurement, inputField, defaultTag, host, topic) {
        this.token = token
        this.org = org
        this.bucket = bucket
        this.url = url
        this.mesurement = measurement
        this.field = inputField
        this.defaultTag = defaultTag
        //let read = new getProtocol(host, topic)

        this.mqtt_save = function () {
            console.log("Saving mqtt")
        }

        this.coap_save = function () {
        
        }

        this.http_save = function () {
        
        }
    }
}


function readJsonFile(file) {
    let bufferData = fs.readFileSync(file)
    let stData = bufferData.toString()
    let data = JSON.parse(stData)
    return data
}

function save(protocol,host,topic,influxConfFile) {
    console.log("Starting storage ...")
    const data = readJsonFile(influxConfFile) // Read data from conf file

    const influx = new InfluxInstance(data.token, data.org, data.bucket, data.url, data.mesurement, data.field, data.defaultTag, host, topic)

    switch (protocol) {
        case 'mqtt':
            influx.mqtt_save();
            break;
        case 'coap':
            influx.coap_save();
            break;
        case 'http':
            influx.http_save();
            break;
        default:
            break;
    }
}
module.exports = { save };