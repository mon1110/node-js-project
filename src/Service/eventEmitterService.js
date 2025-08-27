const EventEmitter = require("events");

class EventEmitterService extends EventEmitter {
  emitEvent(eventName, eventData) {
    console.log(" EMIT CALLED:", eventName, eventData);
    try {
      super.emit(eventName, eventData);
    } catch (error) {
      console.error("Emit Error: ", error);
    }
  }

  onEvent(eventName, listener) {
    console.log("LISTENER REGISTERED:", eventName);
    try {
      super.on(eventName, listener);
    } catch (error) {
      console.error("On Error: ", error);
    }
  }
}

let clients = [];

function addClient(res) {
  clients.push(res);
  res.on("close", () => {
    clients = clients.filter((c) => c !== res);
  });
}

function broadcast({ event, data }) {
  clients.forEach((res) => {
    res.write(`event: ${event}\n`);
    res.write(`data: ${JSON.stringify(data)}\n\n`);
  });
}

const eventEmitterService = new EventEmitterService();

module.exports = { eventEmitterService, addClient, broadcast };
