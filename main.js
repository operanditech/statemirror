const Observable = require('rxjs')
const { concatMap } = require('rxjs/operators')
const ZeroMqReader = require('./readers/zeromq')
const MongoDbHandler = require('./handlers/mongodb')
const WebsocketHandler = require('./handlers/websocket')
// const Undoer = require('./util/undoer')

main().catch(error => {
  console.error(error)
  process.exit(1)
})

async function main() {
  // Instantiate reader and handlers
  const reader = new ZeroMqReader(undefined, false)
  const dbHandler = new MongoDbHandler()
  const wsHandler = new WebsocketHandler()
  // const undoer = new Undoer(dbHandler)

  // Connect them together
  // (using a queue for async operations from concatMap)
  Observable.fromEvent(reader, 'operation')
    .pipe(
      // concatMap(op => undoer.process(op)),
      // concatMap(ops => Observable.from(ops)),
      concatMap(op => Promise.all([dbHandler.handle(op), wsHandler.handle(op)]))
    )
    .subscribe()

  // Start the handlers first
  await Promise.all([dbHandler.start(), wsHandler.start()])
  // And then the reader once everything is ready
  await reader.start()

  // Generate a fake stream of operations coming from ZeroMQ
  // reader.generateDummyLoad()
}
