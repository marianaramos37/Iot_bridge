var visualization = require('./visualization');

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
    demandOption: true,
    requiresArg: true,
    nargs: 1,
    type: 'string',
    description: 'Tell the topic',
  })
  .option('command', {
    alias: 'c',
    demandOption: true,
    requiresArg: true,
    nargs: 1,
    type: 'string',
    description: 'Tell the command',
  })
  .help()
  .alias('helpMe', 'h').argv;

  
if (argv.command == 'visualize') {
    yargs.check((argv) => {
        if (argv.protocol == 'mqtt') {
            if (!argv.t) {
                throw new Error("Please tell the topic of interest for the subscription")
            }
        }
        return true
    })
    
    visualization.visualize(argv.p, argv.h, argv.t)
}
  