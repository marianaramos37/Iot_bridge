var mqtt = require('mqtt');
var client  = mqtt.connect({host:'localhost', port:1883});

client.on('connect', function () {
    setInterval(() => {        
            client.publish('temperature', ((Math.random())));
            client.publish('humidity', ((Math.random())) ); // TODO: change this values, put equal to the lab
    }, 2000)
});