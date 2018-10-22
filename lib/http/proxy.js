const meta = require('../../package')
const debug = require('debug')(meta.name + ':proxy')
const _ = require('lodash')
const Promise = require('bluebird')
const net = require('net')
const http = require('http')
const request = require('request')
const ip = require('ip')

const defaults = {
  address: undefined,
  resolve: undefined,
  host: ip.loopback(),
  port: 8079
}

module.exports = (options) => {

  options = _.defaults(options, defaults)

  if (typeof options.resolve === 'undefined') {
    throw new Error('missing resolve function')
  }
  
  const status = {
    started: new Date(),
    status: 'alive',
    version: meta.version,
    host: (_.includes([
      '0.0.0.0',
      '::'
    ], options.host) ? ip.loopback() : options.host),
    port: options.port
  }

  debug('creating server')
  const server = http.createServer()

  function rest(req, res) {
    debug('handling API call to %j', req.url)
    const [url, path] = req.url.match('(/[^?#]*)')
    switch (path) {
    case '/status':
      res.setHeader('Content-Type', 'application/json')
      return res.end(JSON.stringify(status))
    case '/shutdown':
      res.setHeader('Content-Type', 'application/json')
      res.end(JSON.stringify({
	action: 'shutdown'
      }))
      return server.close()
    default:
      res.statusCode = 404
      res.statusMessage = 'Not Found'
      return res.end()
    }
  }

  debug('registering request handler')
  server.on('request', async (req, res) => {
    if (!req.url.match(/http(s)?:\/\//)) {
      return rest(req, res)
    }
    debug('handling request to %j', req.url)
    try {
      const proxy = await options.resolve(req.url)
      const nextreq = request({
	url: req.url,
	method: req.method,
	followRedirect: false,
	proxy: (proxy ?
		'http://' +
		(proxy.auth ?
		 proxy.auth.username + ':' + proxy.auth.password + '@' : '') +
		proxy.host + ':' + proxy.port : undefined)
      })

      req.pipe(nextreq)
      nextreq.pipe(res)
      nextreq.on('error', (err) => {
	debug('error: %O', err)
	res.statusCode = 500
	res.statusMessage = err.message
	res.end()
      })
    } catch (err) {
      res.statusCode = 500
      res.statusMessage = err.message
      res.end()
    }
  })

  debug('registering connect handler')
  server.on('connect', async (req, clisok, head) => {
    debug('handling connect to %j', req.url)
    try {
      const proxy = await options.resolve('https://' + req.url)
      debug('establishing connection to %j:%j', proxy.host, proxy.port)
      const srvsok = net.connect(proxy.port, proxy.host)
      srvsok.on('connect', () => {
	if (proxy.connection === 'DIRECT') {
	  debug('confirming connection establishment')
	  clisok.write('HTTP/1.1 200 Connection Established\r\n' +
		       'Proxy-Agent: Node.js-Proxy\r\n' +
		       '\r\n')
	} else {
	  srvsok.write(`CONNECT ${req.url} HTTP/${req.httpVersion}\r\n`)
	  _.forEach(req.headers, (value, header) => {
	    srvsok.write(`${header}: ${value}\r\n`)
	  })
	  if (proxy.auth) {
	    debug('setting proxy authorization header')
	    const auth = ('BASIC ' +
			  Buffer(proxy.auth.username + ':' +
				 proxy.auth.password).toString('Base64'))
	    srvsok.write(`Proxy-Authorization: ${auth}\r\n`)
	  }
	  srvsok.write('\r\n')
	}
	srvsok.write(head)
	srvsok.pipe(clisok)
	clisok.pipe(srvsok)
      })
      srvsok.on('error', (err) => {
	clisok.write(`HTTP/1.1 500 ${err.message}\r\n` +
		     'Proxy-Connection: Keep-Alive\r\n' +
		     '\r\n')
      })
      clisok.on('error', (err) => {
        debug('error on inbound client socket: %j', err)
        debug('disconnecting outbound server socket')
        srvsok.destroy()
      })
    } catch (err) {
      clisok.write(`HTTP/1.1 500 ${err.message}\r\n` +
		   'Proxy-Connection: Keep-Alive\r\n' +
		   '\r\n')
    }
  })

  debug('starting server on port %j', options.port)
  server.listen(options.port, options.host)
  
  return server
}
