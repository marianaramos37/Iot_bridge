var coap = require('coap')
server = coap.createServer()
server.on('request', function (req, res) {
    if(req.url=="/temperature"){
        console.log("Request received...")
        val=((Math.random()*(22-21+1)+21)).toFixed(2)
        var data = JSON.stringify({"sensorType": "temperature", "value": val.toString()});
        res.end(data)
        console.log("File sent:")
        console.log(JSON.parse(data))
    }
    if(req.url=="/humidity"){
        console.log("Request received...")
        val=((Math.random() * 10)+ 61).toFixed(2).toString()
        var data = JSON.stringify({"sensorType": "humidity", "value": val.toString()});
        res.end(data)
        console.log("File sent:")
        console.log(JSON.parse(data))
    }
   
})
server.listen(5683, function () {
    console.log('Confirmation: Sarted COAP Server on Port 5683. Listening...')
})