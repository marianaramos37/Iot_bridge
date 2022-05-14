const express = require('express')
const app = express()
const port = 3001
app.get('/'+'temperature', (req, res) => {
    console.log("Request received..")
    res.set('Content-Type', 'text/plain')
    res.send(((Math.random() * 10)+ 21).toFixed(2).toString()) // TODO: change this randoms
})
app.listen(port, () => {
    console.log('Confirmation: Sarted HTTP on Port 3001.')
    console.log(`Example app listening at http://localhost:${port}/temperature`)
})