var mqtt = require('mqtt');
const coap = require('coap');
const Stream = require('stream')
const EventEmitter = require('events')

class getProtocol {
    constructor(address, topic) {
        this.address = address;
        this.topic = topic;
        this.get_mqtt = function (callBack) {
            let readableStream = new Stream.Readable({
                objectMode: true
            });
            let client = mqtt.connect('mqtt://test.mosquitto.org'); //TODO: change connection address to the one being passed in arguments
            readableStream._read = () => { };
            callBack(readableStream);
            client.on('connect', () => {
                client.subscribe(this.topic);
                console.log("Topic subscribed!");
            });
            client.on('message', (t, m) => {
                readableStream.push({ topic: t, message: m });
            });
        };

        this.get_coap = () => new Promise((resolve, reject) => {
            let request;
            let my_url = new URL(this.address);
            my_url.port = 5683;
            if (my_url.protocol != 'coap:') {
                reject("The url provided doesn't have protocol = coap")
            }
            request = coap.request(my_url)
            request.end();
            request.on('response', (res) => {
                let value = res.payload.toString();
                resolve(value);
            });
        })
    }
}

function visualize(protocol,host,topic) {
    console.log("Starting visualization ...")

    let display = new getProtocol(host, topic)

    switch (protocol) {
        case 'mqtt':
            console.log("Connecting to protocol MQTT")
            display.get_mqtt((read_stream) => {
                let data
                let t, m
                read_stream.on('readable', () => {
                    while (data = read_stream.read()) {
                        t = data.topic.toString()
                        m = data.message.toString()
                        console.log("Topic - "+ t +", Message : " + m)
                    }
                })
            })
            break;
        case 'http':
            break;
        case 'coap':
            let eventEmitter = new EventEmitter()
            eventEmitter.on('start', async () => {

                try {
                    let prom =  display.get_coap();
                    prom.then(function(result) {
                        console.log(result) // "Some User token"
                     })
                    await new Promise(resolve => setTimeout(resolve, 2000)) //Sleep 2 seconds before emiting new event
                    eventEmitter.emit('start')

                } catch (error) {
                    console.log("Errore nella richiesta coap")
                    console.log(error)
                }

            })
            eventEmitter.emit('start')
            break;
        default:
            break;
    }
}

module.exports = { visualize };