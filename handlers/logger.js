module.exports = class LoggerHandler {
  constructor(ignoreOperationTypes = []) {
    this.ignoreOperationTypes = ignoreOperationTypes
  }
  get ready() {
    return true
  }
  start() {
    console.log('Logger handler ready')
  }
  stop() {
    console.log('Logger handler stopped')
  }
  handle(operation) {
    if (!this.ignoreOperationTypes.includes(operation.type)) {
      if (operation.type === 'EMPLACE' || operation.type === 'MODIFY') {
        if (
          operation.code === 'system' &&
          operation.scope === 'system' &&
          operation.table === 'actions'
        ) {
          const act = operation.data.action_trace.act
          if (act.account === 'eosio' && act.name === 'setabi') {
            act.data.abi = 'omitted'
            act.hex_data = 'omitted'
          } else if (act.account === 'eosio' && act.name === 'setcode') {
            act.data.code = 'omitted'
            act.hex_data = 'omitted'
          }
        }
      }
      console.log('Received message:', operation)
    }
  }
}
