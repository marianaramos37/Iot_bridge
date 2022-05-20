const express = require('express')
const app = express()
const port = 3001
app.get('/'+'temperature', (req, res) => {
    console.log("Request received..." )
    val=((Math.random() * 10) + 21).toFixed(2)
    
    res.set('Content-Type', 'text/plain')
    res.send(val.toString()) // TODO: change this randoms
    console.log("Temperature sent - " + val)
})

app.get('/'+'humidity', (req, res) => {
    console.log("Request received..." )
    val=((Math.random() * 10) + 21).toFixed(2)
    
    res.set('Content-Type', 'text/plain')
    res.send(val.toString()) // TODO: change this randoms
    console.log("Humidity sent - " + val)
})
app.listen(port, () => {
    console.log('Confirmation: Sarted HTTP Server on Port 3001. Listening...')
})