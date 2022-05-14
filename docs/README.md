# IOT Bridge

## Visualization

### Prerequisites:
In the command shell run: 
```
npm install yargs --save 
npm install coap --save 
npm install mqtt --save
npm install axios --save
npm install express --save
```


### Commands

To initialize the data simulation:
```
node ./<protocol>_simulator.js
```

To visualize responses
```
node ./bridgeIoT.js -p <protocol> -h <host_address> -t <topic> -c visualize
```
Examples:
```
node ./bridgeIoT.js -p "mqtt" -h "localhost" -t "temperature" -c visualize

node ./bridgeIoT.js -p "coap" -h "coap://localhost" -c visualize

node ./bridgeIoT.js -p "http" -h "http://localhost" -t "temperature" -c visualize

```
## Aggregation

## Storage

## Bridging