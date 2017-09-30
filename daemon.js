const meta = require('./package')
const debug = require('debug')(meta.name + ':daemon')
const server = require('./server')

debug('waiting for configurations')

process.on('message', async (argv) => {
  debug('starting proxy daemon')

  try {
    const daemon = await server(argv)

    daemon.on('listening', () => {
      process.send(null)
    })

    daemon.on('error', (err) => {
      debug('server error: %O', err)
      process.send(err)
    })

  } catch (err) {
    debug('server error: %O', err)
    process.send(err)
  }

})




