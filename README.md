# statemirror

This is a receiver library for reading and handling EOSIO state database
operations from the nodeos statetrack_plugin.

Currently it implements a ZeroMQ reader to connect to the statetrack_plugin
and two operation handlers:

- **MongoDB handler**: Applies the received database operations to a MongoDB
  database. The collections will be named using `<code>_<table>` and the
  `_id` of the documents will be an object composed of `{scope, primary_key}`.
  - This handler allows for mirroring the state DB of contracts in MongoDB
    as a drop-in solution, without requiring any additional logic implemented.
  - The mirrored database allows for more complex queries and indexing,
    and is much less costly to run than a nodeos instance serving those queries.
- **WebSocket handler**: Starts a WebSocket server and propagates the received
  database operations to all the connected WebSocket clients. It currently
  sends all operations, but some publish/subscribe mechanism will be
  implemented in the future.
  - This handler allows dapp frontends to receive real-time updates about
    the data they are displaying.
  - It also allows for horizontal scaling of WebSocket servers by connecting
    them as clients of each other and spreading the amount of end client
    connections that each will serve.

In the future we will add handler implementations for other popular
database systems, as well as for piping to other popular message
queue systems or communication protocols.

## Usage example

```javascript
const Observable = require("rxjs");
const { concatMap } = require("rxjs/operators");
const ZeroMqReader = require("./readers/zeromq");
const MongoDbHandler = require("./handlers/mongodb");
const WebsocketHandler = require("./handlers/websocket");

main().catch(error => {
  console.error(error);
  process.exit(1);
});

async function main() {
  // Instantiate reader and handlers
  const reader = new ZeroMqReader();
  const dbHandler = new MongoDbHandler();
  const wsHandler = new WebsocketHandler();

  // Connect them together
  // (using a queue for async operations from concatMap)
  Observable.fromEvent(reader, "operation")
    .pipe(
      concatMap(op => Promise.all([dbHandler.handle(op), wsHandler.handle(op)]))
    )
    .subscribe();

  // Start the handlers first
  await Promise.all([dbHandler.start(), wsHandler.start()]);
  // And then the reader once everything is ready
  await reader.start();
}
```
