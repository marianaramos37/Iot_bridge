
var mqtt = require('mqtt');
var client  = mqtt.connect('mqtt://test.mosquitto.org');

client.on('connect', function () {
    setInterval(() => {        
            client.publish('temperature', ((Math.random() * 3)+ 21).toFixed(2).toString() );
            console.log("Published on topic temperature.")
            client.publish('humidity', ((Math.random() * 10)+ 61).toFixed(2).toString() );    
            console.log("Published on topic humidity.")    
    }, 2000)
});