const getProtocol = require('./visualization.js');
var mqtt = require('mqtt');
const coap = require('coap');
const Stream = require('stream')
const EventEmitter = require('events')
const axios = require('axios')
const require_math = require("require-math");

function getStandardDeviation (array) {
    const n = array.length
    const mean = array.reduce((a, b) => a + b) / n
    return Math.sqrt(array.map(x => Math.pow(x - mean, 2)).reduce((a, b) => a + b) / n)
  }

function aggregate(protocol,host,topic,n) {
    console.log("Starting aggregation ...")
    let display= new getProtocol.getProtocol(host,topic)
    switch (protocol) {
        // Aggregate MQTT
        case 'mqtt':
            let number_mqtt = 0;
            let storage_mqtt = [];
            console.log("Connecting to protocol MQTT")
            display.get_mqtt((read_stream) => {
                let data
                read_stream.on('readable', () => {
                    while (data = read_stream.read()) {
                        console.log(number_mqtt)
                        storage_mqtt.push(parseFloat(data.message.toString()));
                        number_mqtt= number_mqtt+1;
                        if(number_mqtt==n){
                            let sum = 0;
                            for (let i = 0; i < storage_mqtt.length; i++) {
                                sum = sum + storage_mqtt[i];
                            }
                            console.log(storage_mqtt)
                            console.log("Maximum: " + Math.max.apply(Math, storage_mqtt));
                            console.log("Minimum: " + Math.min.apply(Math, storage_mqtt))
                            console.log("Average: " + sum/n)
                            console.log("Standard Deviation: " + getStandardDeviation(storage_mqtt))
                            number_mqtt = 0;
                            storage_mqtt = []   
                        }
                    }
                })
            })
            break;
        // Aggregate COAP
        case 'coap':
            let eventEmitterCoap = new EventEmitter()
            let number_coap = 0;
            let storage_coap = [];
            eventEmitterCoap.on('start', async () => {
                try {
                    let prom =  display.get_coap();
                    prom.then(function(result) {
                        console.log(number_coap)
                        storage_coap.push(parseFloat(result));
                        number_coap= number_coap+1;
                        if(number_coap==n){
                            let sum = 0;
                            for (let i = 0; i < storage_coap.length; i++) {
                                sum = sum + storage_coap[i];
                            }
                            console.log(storage_coap)
                            console.log("Maximum: " + Math.max.apply(Math, storage_coap));
                            console.log("Minimum: " + Math.min.apply(Math, storage_coap))
                            console.log("Average: " + sum/n)
                            console.log("Standard Deviation: " + getStandardDeviation(storage_coap))
                            number_coap = 0;
                            storage_coap = []   
                        }
                    })
                    await new Promise(resolve => setTimeout(resolve, 2000)) //Sleep 2 seconds before emiting new event
                    eventEmitterCoap.emit('start')
                } catch (error) {
                    console.log("Coap error")
                    console.log(error)
                }
            })
            eventEmitterCoap.emit('start')
            break;
        // Aggregate HTTP
        case 'http':
            let eventEmitterHttp = new EventEmitter()
            let number_http = 0;
            let storage_http = [];
            eventEmitterHttp.on('start', async () => {
                try {
                    let res = await display.get_http() // Response
                    console.log(number_http)
                    storage_http.push(parseFloat(res));
                    number_http= number_http+1;
                    if(number_http==n){
                        let sum = 0;
                        for (let i = 0; i < storage_http.length; i++) {
                            sum = sum + storage_http[i];
                        }
                        console.log(storage_http)
                        console.log("Maximum: " + Math.max.apply(Math, storage_http));
                        console.log("Minimum: " + Math.min.apply(Math, storage_http))
                        console.log("Average: " + sum/n)
                        console.log("Standard Deviation: " + getStandardDeviation(storage_http))
                        number_http = 0;
                        storage_http = []   
                    }
                    await new Promise(resolve => setTimeout(resolve, 2000)) //Sleep 2 seconds before emiting new event
                    eventEmitterHttp.emit('start')
                } catch (error) {
                    console.log("Http error - " + error)
                }
            })
            eventEmitterHttp.emit('start')
            break
        default:
            break;
    }
}
module.exports = { aggregate };