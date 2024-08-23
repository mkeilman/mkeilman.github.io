import {Utils} from './Utils.js';

class BoundMethodsObject {
    static poop() {

    }

    constructor() {
        Object.getOwnPropertyNames(this.constructor.prototype)
            .filter(x => x !== 'constructor')
            .forEach(x => {
                this[x] = this[x].bind(this);
            });
    }

    funcs() {
        return Object.getOwnPropertyNames(this).filter(x => typeof this[x] === 'function');
    }

    objs() {
        return this.props().filter(x => typeof this[x] === 'object');
    }

    props() {
        return Object.getOwnPropertyNames(this).filter(x => ! this.funcs().includes(x));
    }

    vals() {
        return this.props().filter(x => typeof this[x] !== 'object');
    }
}

export {BoundMethodsObject}