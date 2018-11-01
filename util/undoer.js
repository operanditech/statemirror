module.exports = class Undoer {
  constructor(storage) {
    this.storage = storage
    this.revisions = {}
    this.currentChangeset = []
  }
  async process(op) {
    if (op.type === 'SQUASH') {
      if (!this.revisions[op.revision]) {
        this.revisions[op.revision] = this.currentChangeset
      } else {
        this.revisions[op.revision] = this.revisions[op.revision].concat(
          this.currentChangeset
        )
      }
      this.currentChangeset = []
      return []
    } else if (op.type === 'COMMIT') {
      delete this.revisions[op.revision]
      return []
    } else if (op.type === 'UNDO') {
      let changes = []
      for (let rev = op.revision + 1; this.revisions[rev]; rev++) {
        changes = changes.concat(this.revisions[rev])
      }
      changes = changes.concat(this.currentChangeset)
      return changes.reverse()
    } else if (['EMPLACE', 'MODIFY', 'ERASE'].includes(op.type)) {
      this.currentChangeset.push(await this.invertOperation(op))
      return [op]
    } else {
      throw new Error(`Unrecognized operation type '${op.type}'`)
    }
  }

  async invertOperation(op) {
    const id = {
      code: op.code,
      scope: op.scope,
      table: op.table,
      primary_key: op.primary_key
    }
    if (op.type === 'EMPLACE') {
      return { type: 'ERASE', ...id }
    } else if (op.type === 'MODIFY') {
      return { type: 'MODIFY', ...id, data: await this.storage.get(id) }
    } else if (op.type === 'ERASE') {
      return { type: 'EMPLACE', ...id, data: await this.storage.get(id) }
    } else {
      throw new Error(`Cannot invert operation type '${op.type}'`)
    }
  }
}
