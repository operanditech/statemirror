const data = [
  {
    action: 'emplace',
    code: 'wings',
    scope: 'wings',
    table: 'users',
    primary_key: '1',
    data: { name: 'Andres', age: 28 }
  },
  {
    action: 'emplace',
    code: 'wings',
    scope: 'wings',
    table: 'users',
    primary_key: '2',
    data: { name: 'Mario' }
  },
  {
    action: 'modify',
    code: 'wings',
    scope: 'wings',
    table: 'users',
    primary_key: '1',
    data: {
      name: 'Andres',
      age: 28,
      location: 'Barcelona'
    }
  },
  {
    action: 'emplace',
    code: 'wings',
    scope: 'wings',
    table: 'users',
    primary_key: '3',
    data: {
      name: 'John',
      age: 32
    }
  },
  {
    action: 'erase',
    code: 'wings',
    scope: 'wings',
    table: 'users',
    primary_key: '3'
  }
]

const EventEmitter = require('events')

module.exports = class DummyReader extends EventEmitter {
  start() {
    for (const operation of data) {
      this.emit('operation', operation)
    }
  }
}
