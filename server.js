const meta = require('./package')
const debug = require('debug')(meta.name + ':daemon')
const resolver = require('./lib/pac/resolver')
const proxy = require('./lib/http/proxy')

module.exports = async (argv) => {

    const server = proxy({
      resolve: await resolver({
	url: argv.url,
	auth: (argv.username ?
	       {
		 username: argv.username,
		 password: argv.password
	       } : undefined)
      }),
      host: argv.address,
      port: argv.port
    })
  
  return server
}





