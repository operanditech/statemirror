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
  handle(operation) {
    if (this.ready) {
      console.log('Handling operation:', operation)
    } else {
      throw new Error('MongoDB adaptor not ready, must call start() first')
    }
  }
}
