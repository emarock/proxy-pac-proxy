const meta = require('../../package')
const debug = require('debug')(meta.name + ':local-address')
const _ = require('lodash')
const async = require('async')
const ip = require('ip')
const os = require('os')
const dns = require('dns')

module.exports = {

  get() {
    const addr = ip.address()
    debug('returning local address %j', addr)
    return addr
  },

  check(host) {
    if (typeof host === 'undefined') {
      throw new Error('missing host parameter')
    }

    debug(`checking whether ${host} is local`)
    return new Promise((resolve, reject) => {

      async.waterfall([
	(callback) => {
	  dns.lookup(host, callback)
	},
	(host, family, callback) => {
	  const ifcs = os.networkInterfaces()
	  let found = false
	  _.forEach(ifcs, (ifc) => {
	    _.forEach(ifc, (addr) => {
	      found = found || (addr.address && ip.isEqual(host, addr.address))
	      return !found
	    })
	    return !found
	  })
	  debug(`local: ${found}`)
	  return callback(null, found)
	}
      ], (err, result) => {
	return resolve(!err && result)
      })
    })
  }
}
