const DummyReader = require('./readers/dummy')
const MongoDbHandler = require('./handlers/mongodb')

main().catch(error => {
  console.error(error)
  process.exit(1)
})

async function main() {
  const reader = new DummyReader()
  const handler = new MongoDbHandler()

  reader.on('operation', op => {
    handler.handle(op)
  })

  await handler.start()
  await reader.start()
}
