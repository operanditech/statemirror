const MongoClient = require('mongodb').MongoClient

module.exports = class MongoDbAdaptor {
  constructor(dbUrl = 'mongodb://localhost:27017', dbName = 'statemirror') {
    this.url = dbUrl
    this.dbName = dbName
    this.ready = false
  }
  async start() {
    this.client = await MongoClient.connect(
      this.url,
      { useNewUrlParser: true }
    )
    console.log('DB connection successful')
    this.db = this.client.db(this.dbName)
    this.ready = true
  }
  stop() {
    this.ready = false
    this.client.close()
  }
  async handle(operation) {
    if (this.ready) {
      console.log('Handling operation:', operation)

      const collection = this.db.collection(
        `${operation.code}_${operation.scope}_${operation.table}`
      )
      if (operation.action === 'emplace') {
        await collection.insertOne({
          _id: operation.primary_key,
          ...operation.data
        })
      } else if (operation.action === 'modify') {
        await collection.updateOne(
          { _id: operation.primary_key },
          { $set: operation.data }
        )
      } else if (operation.action === 'erase') {
        await collection.deleteOne({ _id: operation.primary_key })
      } else {
        throw new TypeError(
          `Unrecognized operation action type '${operation.action}'`
        )
      }
    } else {
      throw new Error('MongoDB adaptor not ready, must call start() first')
    }
  }
}
