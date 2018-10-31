const data = [
  {
    type: 'EMPLACE',
    code: 'wings',
    scope: 'wings',
    table: 'users',
    primary_key: '1',
    data: { name: 'Andres', age: 28 }
  },
  {
    type: 'EMPLACE',
    code: 'wings',
    scope: 'wings',
    table: 'users',
    primary_key: '2',
    data: { name: 'Mario' }
  },
  {
    type: 'MODIFY',
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
    type: 'EMPLACE',
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
    type: 'ERASE',
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
