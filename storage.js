const { Point } = require('@influxdata/influxdb-client')
const { InfluxDB } = require('@influxdata/influxdb-client')
const fs = require('fs');
const EventEmitter = require('events')
const protocol = require('./visualization.js');

class InfluxInstance{
    constructor(token, org, bucket, url, measurement, inputField, defaultTag, host, topic) {
        this.token = token
        this.org = org
        this.bucket = bucket
        this.url = url
        this.mesurement = measurement
        this.field = inputField
        this.defaultTag = defaultTag
        let display= new protocol.getProtocol(host,topic)

        this.createWriteAPI = function () {
            const client = new InfluxDB({ url: this.url, token: this.token })
            const writeApi = client.getWriteApi(this.org, this.bucket)
            if (this.defaultTag) {
                try {
                    let defaultTags = JSON.parse(this.defaultTag)
                    writeApi.useDefaultTags(defaultTags)
                    return writeApi
                } catch (error) {
                    console.log(error)
                    return writeApi
                }
    
            }
    
        }

    
        this.saveInflux = async function (mesurement, field, value, topic) {
            return new Promise(async (res, rej) => {
                let point = new Point(mesurement).floatField(field, parseFloat(value))
                if (topic) {
                    point = point.tag("topic", topic) // If topic exists create new tag.
                }
                const writeApi = this.createWriteAPI()
                try {
                    let response = await new Promise(function (res, rej) {
                        writeApi.writePoint(point)
                        console.log("Point added: " + point)
                        writeApi.close().then(() => {
                                res('FINISHED')
                            })
                            .catch(e => {
                                rej(e)
                                console.log('FINISHED ERROR')
                            })
            
                    })
                    res(response);
                } catch (error) {
                    rej(error);
                }
            })
    
    
        }

        // STORAGE MQTT PROTOCOL
        this.mqtt_save = function () {
            console.log("Saving MQTT protocol data...")
            let data, t, m, response;
            display.get_mqtt((stream_r) => {
                stream_r.on('readable', async () => {
                    while (data = stream_r.read()) {
                        t = data.topic.toString();
                        m = data.message.toString();
                        try {
                            response = await this.saveInflux(this.mesurement, this.field, m, t)
                        } catch (error) {
                            console.log("Influx storage error MQTT- " + error);
                        }
                    }
                });

        })
        }

        // STORAGE COAP PROTOCOL
        this.coap_save = function () {
            let response, response_influx;
            console.log("Saving COAP protocol data...")

            const eventEmitter = new EventEmitter()            
            eventEmitter.on('start', async () => {
                try {
                    response = await display.get_coap()
                    if (response) {
                        response_influx = await this.saveInflux(this.mesurement, this.field, response)
                    }
                    await new Promise(resolve => setTimeout(resolve, 2000)) //Sleep 2 seconds before emiting new event
                    eventEmitter.emit('start')
    
                } catch (error) {
                    console.log("Influx storage error COAP- " + error)
                }
            })
            eventEmitter.emit('start')
        }

        // STORAGE HTTP PROTOCOL
        this.http_save = function () {
            let response, response_influx;
            console.log("Saving HTTP protocol data...")

            const eventEmitter = new EventEmitter()            
            eventEmitter.on('start', async () => {
                try {
                    response = await display.get_http()
                    if (response) {
                        response_influx = await this.saveInflux(this.mesurement, this.field, response)
                    }
                    await new Promise(resolve => setTimeout(resolve, 2000)) //Sleep 2 seconds before emiting new event
                    eventEmitter.emit('start')
    
                } catch (error) {
                    console.log("Influx storage error HTTP - " + error)
                }
            })
            eventEmitter.emit('start')
        
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