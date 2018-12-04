const { defer } = require('rxjs')
const { map, filter } = require('rxjs/operators')

module.exports = function groupByAction() {
  return source =>
    defer(() => {
      let currentChangeset = []
      return source.pipe(
        map(op => {
          if (
            op.code === 'system' &&
            op.scope === 'system' &&
            op.table === 'actions'
          ) {
            if (op.type === 'EMPLACE') {
              op.stateDiff = currentChangeset
              currentChangeset = []
              return op
            } else if (op.type === 'ERASE') {
              // TODO: Action ERASE ops might come before the reversed undo operations
              // so it's hard to know how to handle them.
              // We need to check the actual order in which operations come from nodeos
            } else {
              throw new Error(
                `Unrecognized operation type '${op.type}' for action grouping`
              )
            }
          } else {
            // TODO Handle undos properly
            this.currentChangeset.push(op)
            return false
          }
        }),
        filter(op => op !== false)
      )
    })
}
