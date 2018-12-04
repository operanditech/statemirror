const Observable = require('rxjs')
const { concatMap } = require('rxjs/operators')
const ZeroMqReader = require('./readers/zeromq')
const LoggerHandler = require('./handlers/logger')
const MongoDbHandler = require('./handlers/mongodb')
const WebsocketHandler = require('./handlers/websocket')

main().catch(error => {
  console.error(error)
  process.exit(1)
})

async function main() {
  // Instantiate reader and handlers
  const reader = new ZeroMqReader()
  const loggerHandler = new LoggerHandler(['COMMIT'])
  // const dbHandler = new MongoDbHandler()
  // const wsHandler = new WebsocketHandler()

  // Connect them together
  // (using a queue for async operations from concatMap)
  Observable.fromEvent(reader, 'operation')
    .pipe(
      concatMap(op =>
        Promise.all([
          loggerHandler.handle(op)
          // dbHandler.handle(op),
          // wsHandler.handle(op)
        ])
      )
    )
    .subscribe()

  // Start the handlers first
  await Promise.all([
    loggerHandler.start()
    // dbHandler.start(),
    // wsHandler.start()
  ])
  // And then the reader once everything is ready
  await reader.start()
}
