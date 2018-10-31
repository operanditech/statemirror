const MongoClient = require('mongodb').MongoClient

module.exports = class MongoDbHandler {
  constructor(dbUrl = 'mongodb://localhost:27017', dbName = 'statemirror') {
    this.url = dbUrl
    this.dbName = dbName
    this.ready = false
    this.collections = {}
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
    if (!this.ready) {
      throw new Error('MongoDB handler not ready, must call start() first')
    }
    if (['SQUASH', 'COMMIT', 'UNDO'].includes(operation.type)) {
      // TODO Handle these properly
      if (this.verbose) {
        console.log(`Ignoring operation of type ${operation.type}`)
      }
      return
    }
    console.log('Handling operation:', operation)

    const colName = `${operation.code}_${operation.table}`
    let collection
    if (this.collections[colName]) {
      collection = this.collections[colName]
    } else {
      collection = this.collections[colName] = this.db.collection(colName)
      await collection.createIndex({ '_id.scope': 1, '_id.primary_key': 1 })
    }
    if (operation.type === 'EMPLACE') {
      await collection.insertOne({
        _id: { primary_key: operation.primary_key, scope: operation.scope },
        ...operation.data
      })
    } else if (operation.type === 'MODIFY') {
      await collection.replaceOne(
        { _id: { primary_key: operation.primary_key, scope: operation.scope } },
        operation.data
      )
    } else if (operation.type === 'ERASE') {
      await collection.deleteOne({
        _id: { primary_key: operation.primary_key, scope: operation.scope }
      })
    } else {
      throw new TypeError(`Unrecognized operation type '${operation.type}'`)
    }
  }
}
