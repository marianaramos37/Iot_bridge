
var mqtt = require('mqtt');
var client  = mqtt.connect('mqtt://localhost:1883');

client.on('connect', function () {
    setInterval(() => {     
        val=((Math.random()*(22-21+1)+21)).toFixed(2)
        var data = JSON.stringify({"sensorType": "temperature", "value":val.toString()});
        client.publish('temperature', data);
        console.log("Published on topic temperature:")
        console.log(JSON.parse(data))

        var data2 = JSON.stringify({"sensorType": "humidity", "value": ((Math.random() * 10)+ 61).toFixed(2).toString() });
        client.publish('humidity',  data2);
        
        console.log("Published on topic humidity:")
        console.log(JSON.parse(data2)) 
    }, 2000)
});