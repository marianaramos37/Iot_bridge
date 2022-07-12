const express = require('express')
const app = express()
const port = 3001
app.get('/'+'temperature', (req, res) => {
    console.log("Request received..." )
    val=((Math.random()*(22-21+1)+21)).toFixed(2)
    var data = JSON.stringify({"sensorType": "temperature", "value": val.toString()});
    
    res.set('Content-Type', 'application/json')
    res.send(data) 

    console.log("File sent:")
    console.log(JSON.parse(data))
})

app.get('/'+'humidity', (req, res) => {
    console.log("Request received..." )
    val=((Math.random() * 10)+ 61).toFixed(2).toString()
    var data = JSON.stringify({"sensorType": "humidity", "value": val.toString()});
    
    res.set('Content-Type', 'application/json')
    res.send(data)

    console.log("File sent:")
    console.log(JSON.parse(data))
})
app.listen(port, () => {
    console.log('Confirmation: Sarted HTTP Server on Port 3001. Listening...')
})