const meta = require('./package')
const debug = require('debug')(meta.name + ':command-env')
const request = require('request')
const os = require('os')

exports.command = 'env [options]'

exports.describe = 'Display the commands to set up the environment'

exports.builder = {
  'address': {},
  'port': {},
  'reset': {}
}

exports.handler = async (argv) => {

  try {
    if (argv.reset) {
      console.log('unset HTTP_PROXY HTTPS_PROXY NO_PROXY')
      console.log('unset http_proxy https_proxy no_proxy')
    } else {
      const url = `http://${argv.address}:${argv.port}/status`
      request({
	url: url,
	json: true
      }, (err, res, body) => {
	if (err) {
	  console.error('proxy is not running')
	  console.error(err)
	  process.exit(1)
	} else if (Math.floor(res.statusCode / 100) != 2) {
	  console.error('proxy is not running')
	  console.error(res.statusMessage)
	  process.exit(1)
	}
	const proxy = `http://${body.host}:${body.port}`
	const noproxy = `localhost,127.0.0.1,${os.hostname()},${body.host}`
	console.log(`export HTTP_PROXY=${proxy}`)
	console.log(`export HTTPS_PROXY=${proxy}`)
	console.log(`export NO_PROXY=${noproxy}`)
	console.log(`export http_proxy=${proxy}`)
	console.log(`export https_proxy=${proxy}`)
	console.log(`export no_proxy=${noproxy}`)
      })
    }
  } catch (err) {
    console.error('proxy is not running')
    console.error(err)
  }
}
