'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});

var _debug = require('debug');

var _debug2 = _interopRequireDefault(_debug);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var debug = (0, _debug2.default)('circular-buffer');

var InstanceMetaProgrammingInterface = {
    get: function (object, property) {
        var abstractIndex = parseInt(property);
        if (Number.isInteger(abstractIndex)) {
            let realIndex = (object._beginIndex + abstractIndex) % object.capacity();
            return object._buffer[realIndex];
        }
        return object[property];
    }
};

var ModelMetaProgrammingInterface = {
    construct: function (target, args) {
        var instance = new target(...args);
        return new Proxy(instance, InstanceMetaProgrammingInterface);
    }
};

var CircularBuffer = class CircularBuffer {
    constructor(size) {
        this._maxLength = size;
        this._beginIndex = 0;
        this._size = 0;
        this._buffer = Buffer.alloc(this._maxLength);
    }
    capacity() {
        return this._maxLength;
    }
    size() {
        return this._size;
    }
    put(enumerable) {
        if (!(enumerable instanceof Buffer)) {
            enumerable = Buffer.from(enumerable);
        }
        if (enumerable.length > this.capacity()) {
            return false;
        }

        var writingIndex = (this._beginIndex + this.size()) % this.capacity();
        if (this.capacity() < writingIndex + enumerable.length) {
            // split & copy
            let copiedElement = this.capacity() - writingIndex;
            enumerable.copy(this._buffer, writingIndex, 0, copiedElement);
            enumerable.copy(this._buffer, 0, copiedElement, enumerable.length);
        } else {
            // copy
            enumerable.copy(this._buffer, writingIndex, 0, enumerable.length);
        }
        this._size += enumerable.length;
        if (this._size > this.capacity()) {
            this._beginIndex = (this._beginIndex + this._size - this.capacity()) % this.capacity();
            this._size = this.capacity();
        }
        return true;
    }
    push(element) {
        this.put(Buffer.from([element]));
    }
    get(size) {
        if (size > this.size()) {
            size = this.size();
        }
        var data = Buffer.alloc(size);
        if (this._beginIndex + size > this.capacity()) {
            // split & copy
            let copiedElement = this.capacity() - this._beginIndex;
            this._buffer.copy(data, 0, this._beginIndex, this.capacity());
            this._buffer.copy(data, copiedElement, 0, size - copiedElement);
        } else {
            // copy
            this._buffer.copy(data, 0, this._beginIndex, this._beginIndex + size);
        }
        this._size -= size;
        this._beginIndex = (this._beginIndex + size) % this.capacity();
        return data;
    }
    pop() {
        return this.get(1);
    }
};

exports.default = new Proxy(CircularBuffer, ModelMetaProgrammingInterface);
//# sourceMappingURL=CircularBuffer.js.map