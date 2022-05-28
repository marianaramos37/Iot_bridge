const coap = require('coap')
const protocol = require('./visualization.js');
const fs = require('fs');
const express = require('express')
const mqtt = require('mqtt')
const EventEmitter = require('events')


class Bridge{
    constructor(srcHost, srcTopic, dstHost) {

        this.dstHost = dstHost
        //this.dstPort = dstPort
        //read.ReadProtocol.call(this, srcHost, srcPort, srcTopic, min, max)
        let display= new protocol.getProtocol(srcHost,srcTopic)

        // FROM PROTOCOL HTTP TO COAP
        this.bridge_http_coap = function () {
            console.log("Bridging from protocol HTTP to COAP")
            let server = coap.createServer();
            let path = new URL(display.address).pathname;
            let reply;
            server.on('request', async (req, res) => {
                if ((req.url) == path) {
                    try {
                        reply = await display.get_http();
                        console.log("Received: " + reply);
                        res.end(reply, "UTF-8");
                    } catch (error) {
                        console.log("HTTP error - " + error);
                    }

                } else {
                    res.end();
                }
            })
            // the default CoAP port is 5683
            server.listen(5683);
        }

        // FROM PROTOCOL COAP TO HTTP
        this.bridge_coap_http = function () {
            console.log("Bridging from protocol COAP to HTTP")
            let app = express()
            let reply
            let path = new URL(display.address).pathname;
            app.get(path, async (req, res) => {

                try {
                    res.on('timeout', function () {
                        console.log("Timeout error");
                    })
                    req.on('close', function () {
                        console.log("Connection closed.");
                    })
                    reply = await display.get_coap();
                    
                    res.set('Content-Type', 'text/plain');
                    console.log("Received: " + reply);
                    res.send(reply);
                 
                } catch (error) {
                    console.log("COAP error - " + error);
                }
            })
            app.listen(3001, () => {
                console.log(`Confirmation: Sarted HTTP Server on Port 3001${path}. Listening...`)
            })

        }

        // FROM PROTOCOL MQTT TO COAP
        this.bridge_mqtt_coap = function () {
            let server = coap.createServer()
            let t, m, data, ind
            let objsMqtt = []
            server.on('request', (req, res) => {
                ind= objsMqtt.findIndex(value => value.url === req.url)
                if (ind === -1) {
                    console.log("This topic was not found, please choose another one.");
                    res.end()
                }
                else {
                    res.end(objsMqtt[ind].value, "UTF-8")
                }

            })
            server.listen(this.dstPort, () => {
                console.log('Confirmation: Sarted COAP Server. Listening...')
            })

            display.get_mqtt((stream_r) => {
                stream_r.on('readable', () => {
                    // Starting to read data
                    while (data = stream_r.read()) {
                        t = data.topic.toString();
                        m = data.message.toString();
                        ind= objsMqtt.findIndex(value => value.url === '/'+ t)
                        ind === -1 ? objsMqtt.push({ url: '/' + t, value: m }) : objsMqtt[ind].value = m
                        console.log(objsMqtt);
                        
                    }
                })
            })
        }

        // FROM PROTOCOL MQTT TO COAP
        this.bridge_coap_mqtt = function () {
            let my_url = new URL(display.address)

            let client = mqtt.connect({ host: this.dstHost, port: 1883 })

            let eventEmitter = new EventEmitter()
            let value

            client.on('connect', async () => {

                eventEmitter.on('start', async () => {
                    try {
                        value = await display.get_coap() // aspetta che la richiesta al server coap restituisca un messaggio
                        client.publish((my_url.pathname).slice(1), value)
                        console.log((my_url.pathname).slice(1))
                        console.log('Received value in COAP server and published.')
                        await new Promise(resolve => setTimeout(resolve, 3000)) //New coap request each 3 seconds
                        eventEmitter.emit('start')
                    } catch (error) {
                        console.log("COAP error - " + error)
                    }

                })
                eventEmitter.emit('start')
            })

        }

        // FROM PROTOCOL MQTT TO HTTP
        this.bridge_mqtt_http = function () {
            let server = express()
            let t, m, data, ind;
            let objsMqtt = []
    
            server.get('*', (req, res) => {
                res.on('timeout', () => {
                    console.log("Timeout error");
                })
                req.on('close', function () {
                    console.log("Connection closed.");
                })
                ind= objsMqtt.findIndex(value => value.url === req.path)
                if (ind === -1) {
                    res.sendStatus(404)
                }
                else {
                    res.send(objsMqtt[ind].value)
                }
    
            })
            server.listen(3001, () => {
                console.log(`Server started at port: 3001. Topic : ${this.topic}`)
            })
    
            display.get_mqtt((stream_r) => {
                stream_r.on('readable', () => {
                    // There is some data to read now.
                    while (data = stream_r.read()) {
                        t = data.topic.toString();
                        m = data.message.toString();

                        ind= objsMqtt.findIndex(value => value.url === '/' + t)
                        ind === -1 ? objsMqtt.push({ url: '/' + t, value: m }) : objsMqtt[ind].value = m
                        console.log(objsMqtt);
                        
    
                    }
                })
            })
        }

        // FROM PROTOCOL HTTP TO MQTT
        
        this.bridge_http_mqtt = function () {
            let my_url = new URL(display.address)

            let client = mqtt.connect({ host: this.dstHost, port: 1883})

            let eventEmitter = new EventEmitter()

            client.on('connect', async () => {

                eventEmitter.on('start', async () => {

                    try {
                        let value = await display.get_http() // aspetta che la richiesta al server http restituisca un messaggio

                        client.publish((my_url.pathname).slice(1), value)
                        console.log((my_url.pathname).slice(1))
                        console.log('Received value in HTTP server and published.')
                        await new Promise(resolve => setTimeout(resolve, 3000)) //New HTTP request each 3 seconds
                        eventEmitter.emit('start')

                    } catch (error) {
                        console.log("HTTP error - " + error)
                    }
                })
                eventEmitter.emit('start')
            })
        }


    }
}

function readJsonFile(file) {
    let bufferData = fs.readFileSync(file)
    let stData = bufferData.toString()
    let data = JSON.parse(stData)
    return data
}

function translate(protocol,host,topic,destination_protocol,protocol_conf_file) {
    const data = readJsonFile(protocol_conf_file) // Read data from conf file

    let bridge = new Bridge(host, topic, data.host)

    if (((protocol) == 'mqtt') && ((destination_protocol) == 'coap')) {
        bridge.bridge_mqtt_coap()
    }
    else if (((protocol) == 'coap') && ((destination_protocol) == 'mqtt')) {
        bridge.bridge_coap_mqtt()
    }
    else if (((protocol) == 'http') && ((destination_protocol) == 'coap')) {
        bridge.bridge_http_coap()
    }
    else if (((protocol) == 'coap') && ((destination_protocol) == 'http')) {
        bridge.bridge_coap_http()
    }
    else if (((protocol) == 'http') && ((destination_protocol) == 'mqtt')) {
        bridge.bridge_http_mqtt()
    }
    else if (((protocol) == 'mqtt') && ((destination_protocol) == 'http')) {
        bridge.bridge_mqtt_http()
    }
}
module.exports = { translate };