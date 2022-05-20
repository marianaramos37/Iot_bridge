var visualization = require('./visualization');
var storage = require('./storage');
var bridging = require('./bridging');
var aggregation = require('./aggregation');

const yargs = require('yargs');
const argv = yargs
  .option('command', {
    alias: 'c',
    demandOption: true,
    requiresArg: true,
    nargs: 1,
    type: 'string',
    description: 'Tell the protocol',
    choices: ['visualize', 'aggregate', 'save', 'translate']
  })
  .option('protocol', {
    alias: 'p',
    demandOption: true,
    requiresArg: true,
    nargs: 1,
    type: 'string',
    description: 'Tell the protocol',
    choices: ['mqtt', 'coap', 'http']
  })
  .option('host', {
    alias: 'h',
    demandOption: true,
    requiresArg: true,
    nargs: 1,
    type: 'string',
    description: 'Tell the host',
  })
  .option('topic', {
    alias: 't',
    nargs: 1,
    type: 'string',
    description: 'Tell the topic',
  })
  .option('influxconf', {
    alias: 'i',
    nargs: 1,
    type: 'string',
    description: 'Tell the influx configuration file',
    requiresArg: true,
  })
  .option('destprotocol', {
    alias: 'd',
    nargs: 1,
    type: 'string',
    description: 'Tell the destination protocol',
    requiresArg: true,
    choices: ['mqtt', 'coap', 'http']
  })
  .option('config', {
    alias: 'f',
    nargs: 1,
    type: 'string',
    description: 'Tell the destination protocol',
    requiresArg: true,
  })
  .option('command', {
    alias: 'c',
    demandOption: true,
    requiresArg: true,
    nargs: 1,
    type: 'string',
    description: 'Tell the command',
    choices: ['visualization', 'aggregate', 'save', 'translate']
  })
  .help()
  .alias('helpMe', 'h').argv;

  
  // TODO: the checks are not working i dont know why
if (argv.command == 'visualize') {
    yargs.check((argv) => {
        if (argv.protocol == 'mqtt') {
            if (!argv.t) {
                throw new Error("Please tell the topic of interest for the subscription.")
            }
        }
        return true
    })
    
    visualization.visualize(argv.p, argv.h, argv.t)
}
if (argv.command == 'save') {
  yargs.check((argv) => {
      if (argv.protocol == 'mqtt') {
          if (!argv.t) {
              throw new Error("Please tell the topic of interest for the subscription.")
          }
      }
      if (!argv.i) {
        throw new Error("Please tell the influx configuaration file.")
      }
      return true
  })
  storage.save(argv.p, argv.h, argv.t, argv.i)
}
if (argv.command == 'aggregate') {
  // TODO checking
  aggregation.aggregate(argv.p, argv.h, argv.t, argv.n) 
}
if (argv.command == 'translate') {
  // TODO checking
  bridging.translate(argv.p, argv.h, argv.t, argv.d, argv.f)
}