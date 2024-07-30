import {Utils} from './Utils.js';

class BoundMethodsObject {
    constructor() {
        Object.getOwnPropertyNames(this.constructor.prototype)
            .filter(x => x !== 'constructor')
            .forEach(x => {
                this[x] = this[x].bind(this);
            });
    }
}

export {BoundMethodsObject}