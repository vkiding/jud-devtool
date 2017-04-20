const EventEmitter = require('events').EventEmitter;
class MessageBus extends EventEmitter {
    constructor() {
        super();
    }
    waitFor(method) {
        return new Promise((resolve, reject)=> {
            this.once(method, function (data) {
                resolve(data);
            })
        });
    }
}
module.exports = new MessageBus();