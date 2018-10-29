const WebSocket = require('ws')

module.exports = class WebsocketHandler {
  constructor(serverOptions = { port: 8080 }) {
    this.serverOptions = serverOptions
    this.wss = null
    this.connections = []
  }
  get ready() {
    return Boolean(this.wss)
  }
  async start() {
    this.wss = new WebSocket.Server(this.serverOptions)
    console.log('WebSocket server started successfully')

    this.wss.on('connection', ws => {
      this.connections.push(ws)
      ws.on('close', () => {
        this.connections = this.connections.filter(
          connection => connection !== ws
        )
      })
    })
  }
  stop() {
    this.wss.close()
    this.wss = null
  }
  async handle(operation) {
    if (this.ready) {
      for (const ws of this.connections) {
        await new Promise((resolve, reject) => {
          ws.send(operation, error => (error ? reject(error) : resolve()))
        })
      }
    } else {
      throw new Error('Websocket adaptor not ready, must call start() first')
    }
  }
}
