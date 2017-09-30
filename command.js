const meta = require('./package')
const debug = require('debug')(meta.name + ':command')
const yargs = require('yargs')

module.exports = () => {

  yargs.usage('Usage: $0 <command> [options]')
  yargs.options({
    'url': {
      alias: 'u',
      nargs: 1,
      string: true,
      describe: 'The proxy.pac URL'
    },
    'address': {
      alias: 'a',
      nargs: 1,
      string: true,
      describe: 'The local address the proxy will bind to',
      default: '127.0.0.1'
    },
    'port': {
      alias: 'p',
      nargs: 1,
      number: true,
      describe: 'The local port the proxy will bind to',
      default: 8079
    },
    'authenticate': {
      alias: 'A',
      boolean: true,
      describe: 'Prompt for username and password for proxy authentication',
      default: false
    },
    'username': {
      alias: [
	'user',
	'U'
      ],
      nargs: 1,
      string: true,
      describe: 'The username for proxy authentication'
    },
    'password': {
      alias: [
	'pass',
	'P'
      ],
      nargs: 1,
      string: true,
      describe: 'The password for proxy authentication'
    },
    'foreground': {
      alias: 'f',
      boolean: true,
      default: false,
      describe: 'Run in foreground'
    },
    'reset': {
      alias: 'r',
      boolean: true,
      default: false,
      describe: 'Display commands to reset the environment'
    }
  })

  yargs.command(require('./command-start'))
  yargs.command(require('./command-stop'))
  yargs.command(require('./command-env'))

  yargs.command('*', false, () => {
    yargs.showHelp();
    console.error("Non-existing or no command specified");
    process.exit(1);
  })
  yargs.demandCommand(1)

  yargs.help('h')
  yargs.alias('h', 'help')
  yargs.env(meta.name.replace(/-/g, '').toUpperCase())

  const argv = yargs.argv

}

