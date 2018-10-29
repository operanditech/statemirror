const DummyReader = require('./readers/dummy')
const MongoDbHandler = require('./handlers/mongodb')
const Observable = require('rxjs')
const { concatMap } = require('rxjs/operators')

main().catch(error => {
  console.error(error)
  process.exit(1)
})

async function main() {
  const reader = new DummyReader()
  const handler = new MongoDbHandler()

  Observable.fromEvent(reader, 'operation')
    .pipe(
      concatMap(async op => {
        await handler.handle(op)
      })
    )
    .subscribe()

  await handler.start()
  await reader.start()
}
