
function getProtocol(address, topic) {
    this.address = address
    this.port = 8000
    this.topic = topic
    this.get_mqtt = function (cb) {
        let readableStream = new Stream.Readable({ 
            objectMode: true 
        });
        let client = mqtt.connect({ 
            host: this.address, 
            port: this.port 
        });
        readableStream._read = () => { };
        cb(readableStream);
        client.on('connect', () => {
            client.subscribe(this.topic);
        });

        client.on('message', (t, m) => {
            readableStream.push({ topic: t, message: m })
        });
    }
}

function visualize(protocol,host,topic) {
    console.log("Starting visualization ...")

    let display = getProtocol(host, topic)

    switch (protocol) {
        case 'mqtt':
            break;
        case 'http':
            break;
        case 'coap':
            break;
        default:
            break;
    }
}

module.exports = { visualize };