var coap = require('coap')
server = coap.createServer()
server.on('request', function (req, res) {
    console.log("Request received..." )
    val=((Math.random() * 3) + 21).toFixed(2)
    res.end(val.toString(), "UTF-8")
    console.log("Temperature sent - " + val.toString())
})
server.listen(5683, function () {
    console.log('Confirmation: Sarted COAP Server on Port 5683. Listening...')
})