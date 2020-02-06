"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const rxjs_1 = require("rxjs");
function observeProcess(process) {
    return new rxjs_1.Observable(subscriber => {
        process
            .then(() => subscriber.complete())
            .catch(error => subscriber.error(error));
        process.stdout.on('data', (data) => {
            subscriber.next(data.toString().trim());
        });
    });
}
exports.default = observeProcess;
