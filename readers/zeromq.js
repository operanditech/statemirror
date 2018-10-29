const EventEmitter = require('events')
const zmq = require('zeromq')
const DummyReader = require('./dummy')
const Observable = require('rxjs')
const { concatMap } = require('rxjs/operators')

module.exports = class ZeroMqReader extends EventEmitter {
  constructor(connectionUrl = 'tcp://127.0.0.1:3000', bind = true) {
    super()
    this.connectionUrl = connectionUrl
    this.bind = bind
    this.socket = zmq.socket('pull')
  }
  start() {
    this.socket.on('message', msg => {
      try {
        this.emit('operation', JSON.parse(msg.toString()))
      } catch (error) {
        throw new Error(`Malformed operation received: ${msg.toString()}`)
      }
    })
    if (this.bind) {
      this.socket.bindSync(this.connectionUrl)
      console.log('ZeroMQ reader socket bound successfully')
    } else {
      this.socket.connect(this.connectionUrl)
      console.log('ZeroMQ reader connected successfully')
    }
  }
  stop() {
    this.socket.close()
  }
  generateDummyLoad() {
    const out = zmq.socket('push')
    if (this.bind) {
      out.connect(this.connectionUrl)
      console.log('ZeroMQ dummy data generator connected successfully')
    } else {
      out.bindSync(this.connectionUrl)
      console.log('ZeroMQ dummy data generator socket bound successfully')
    }

    const reader = new DummyReader()
    Observable.fromEvent(reader, 'operation')
      .pipe(
        concatMap(async op => {
          out.send(JSON.stringify(op))
        })
      )
      .subscribe()

    reader.start()
  }
}
