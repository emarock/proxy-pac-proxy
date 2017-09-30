const meta = require('./package')
const debug = require('debug')(meta.name + ':command-stop')
const request = require('request')

exports.command = 'stop [options]'

exports.describe = 'Stop the proxy.pac proxy'

exports.builder = {
  'address': {},
  'port': {}
}

exports.handler = async (argv) => {

  try {
    const url = `http://${argv.address}:${argv.port}/shutdown`
    request(url, (err, res, body) => {
      if (err) {
	console.error('Cannot stop proxy.')
	console.error(err)
	process.exit(1)
      } else if (Math.floor(res.statusCode / 100) != 2) {
	console.error('Cannot stop proxy.')
	console.error(res.statusMessage)
	process.exit(1)
      }
      console.log('Proxy successfully stopped. ')
      console.log('You may reset your shell configuration ' +
		  'by running the `' + argv['$0'] + ' env -r` command.')
    })
  } catch (err) {
    console.error('Cannot stop proxy.')
    console.error(err)
  }
  
}
