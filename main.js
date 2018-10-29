const Observable = require('rxjs')
const { concatMap } = require('rxjs/operators')
const ZeroMqReader = require('./readers/zeromq')
const MongoDbHandler = require('./handlers/mongodb')

main().catch(error => {
  console.error(error)
  process.exit(1)
})

async function main() {
  // Instantiate reader and handler
  const reader = new ZeroMqReader()
  const handler = new MongoDbHandler()

  // Connect them together
  // (using a queue for async operations from concatMap)
  Observable.fromEvent(reader, 'operation')
    .pipe(
      concatMap(async op => {
        await handler.handle(op)
      })
    )
    .subscribe()

  // Generate a fake stream of operations coming from ZeroMQ
  reader.generateDummyLoad()

  // Start the handler first
  await handler.start()
  // And then the reader once everything is ready
  await reader.start()
}
