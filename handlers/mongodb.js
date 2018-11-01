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
    if (['REV_COMMIT', 'REV_UNDO'].includes(operation.type)) {
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
    if (operation.type === 'ROW_CREATE') {
      await collection.insertOne({
        _id: { primary_key: operation.primary_key, scope: operation.scope },
        ...operation.data
      })
    } else if (operation.type === 'ROW_MODIFY') {
      await collection.replaceOne(
        { _id: { primary_key: operation.primary_key, scope: operation.scope } },
        operation.data
      )
    } else if (operation.type === 'ROW_REMOVE') {
      await collection.deleteOne({
        _id: { primary_key: operation.primary_key, scope: operation.scope }
      })
    }
    else if(operation.type === 'TABLE_REMOVE') {
      await collection.deleteMany({
        "_id.scope": operation.scope
      })
    }
    else {
      throw new TypeError(`Unrecognized operation type '${operation.type}'`)
    }
  }
}
