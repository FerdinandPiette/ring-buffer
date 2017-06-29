import CircularBuffer from '../build/CircularBuffer';
import test from 'ava';

test('CircularBuffer#constructor', t => {
    t.plan(5);
    
    const size = 5;
    var buffer = new CircularBuffer(size);
    
    t.is(buffer._maxLength, size);
    t.is(buffer._beginIndex, 0);
    t.is(buffer._size, 0);
    t.true(buffer._buffer instanceof Buffer);
    t.is(buffer._buffer.length, size);
});

test('CircularBuffer#getRawBuffer', t => {
    t.plan(2);
    
    const size = 5;
    var buffer = new CircularBuffer(size);
    var rawBuffer = buffer.getRawBuffer();
    
    t.true(rawBuffer instanceof Buffer);
    t.is(rawBuffer, buffer._buffer);
});

test('CircularBuffer#put', t => {    
    const size = 5;
    var buffer = new CircularBuffer(size);
    var array1 = [10,11,12];
    var array2 = [13,14,15];
    
    t.plan(4+array1.length+size);
    
    buffer.put(array1);
    t.is(buffer._size, 3);
    t.is(buffer._beginIndex, 0);
    for(let i = 0; i < array1.length; ++i) {
        t.is(buffer._buffer[buffer._beginIndex+i], array1[i]);
    }
    
    buffer.put(array2);
    t.is(buffer._size, 5);
    t.is(buffer._beginIndex, 1);
    [11,12,13,14,15].forEach((n,index) => t.is(buffer._buffer[(buffer._beginIndex+index)%buffer._maxLength], n));
    
});

test('CircularBuffer#accessor[]', t => {
    const size = 5;
    var buffer = new CircularBuffer(size);
    var array1 = [10,11,12];
    var array2 = [13,14,15];
    
    t.plan(8);
    
    buffer.put(array1);
    t.is(buffer[0], array1[0]);
    t.is(buffer[2], array1[2]);
    t.is(buffer[3], 0);
    t.is(buffer[size], array1[0]);
    
    buffer.put(array2);
    t.is(buffer[0], array1[1]);
    t.is(buffer[2], array2[0]);
    t.is(buffer[4], array2[2]);
    t.is(buffer[size], array1[1]);
});

test('CircularBuffer#get', t => {
    const size = 5;
    var buffer = new CircularBuffer(size);
    var array1 = [9,10,11,12];
    var array2 = [13,14,15,16];
    
    t.plan(17);
    
    buffer.put(array1);
    var b1 = buffer.get(2);
    t.true(b1 instanceof Buffer);
    t.is(b1[0], array1[0]);
    t.is(b1[1], array1[1]);
    t.is(buffer._size, 2);
    t.is(buffer._beginIndex, 2);
    
    buffer.put(array2);
    t.is(buffer._size, 5);
    t.is(buffer._beginIndex, 3);
    var b2 = buffer.get(3);
    t.is(buffer._size, 2);
    t.is(buffer._beginIndex, 1);
    t.is(b2[0], array1[3]);
    t.is(b2[1], array2[0]);
    t.is(b2[2], array2[1]);
    
    var b3 = buffer.get(3);
    t.is(b3.length, 2);
    t.is(b3[0], array2[2]);
    t.is(b3[1], array2[3]);
    t.is(buffer._size, 0);
    t.is(buffer._beginIndex, 3);
    
});

test('CircularBuffer#capacity', t => {
    const size = 5;
    var buffer = new CircularBuffer(size);
    var array1 = [9,10,11,12];
    var array2 = [13,14,15,16];
    
    t.plan(6);
    
    t.is(buffer.capacity(), size);
    buffer.put(array1);
    t.is(buffer.capacity(), size);
    buffer.put(array2);
    t.is(buffer.capacity(), size);
    buffer.put(array1);
    t.is(buffer.capacity(), size);
    buffer.get(3);
    t.is(buffer.capacity(), size);
    buffer.get(3);
    t.is(buffer.capacity(), size);
});

test('CircularBuffer#size', t => {
    const size = 5;
    var buffer = new CircularBuffer(size);
    var array1 = [9,10,11,12];
    var array2 = [13,14,15,16];
    
    t.plan(6);
    
    t.is(buffer.size(), 0);
    buffer.put(array1);
    t.is(buffer.size(), array1.length);
    buffer.put(array2);
    t.is(buffer.size(), size);
    buffer.put(array1);
    t.is(buffer.size(), size);
    buffer.get(2);
    t.is(buffer.size(), size-2);
    buffer.get(size);
    t.is(buffer.size(), 0);
});

test('CircularBuffer#push', t => {
    const size = 5;
    var buffer = new CircularBuffer(size);
    var array1 = [9,10,11,12,13]
    var array2 = [14,15,16,17];
    
    t.plan(3*array1.length+2*array2.length+1);
    
    array1.forEach((n,i) => {
        buffer.push(n);
        t.is(buffer.size(), i+1);
        t.is(buffer[i], n);
        t.is(buffer._beginIndex, 0);
    });
    
    array2.forEach((n,i) => {
        buffer.push(n);
        t.is(buffer.size(), size);
        t.is(buffer._beginIndex, i+1);
    });
    
    t.is(buffer[0], array1[4]);
});

test('CircularBuffer#shift', t => {
    const size = 5;
    var buffer = new CircularBuffer(size);
    var array1 = [9,10,11,12,13]
    var array2 = [14,15,16,17];
    
    t.plan(9+2*(size-1));
    
    buffer.put(array1);
    var n1 = buffer.shift();
    t.is(n1, array1[0]);
    t.is(buffer.size(), array1.length-1);
    t.is(buffer[0], array1[1]);
    t.is(buffer._beginIndex, 1);
    
    buffer.put(array2);
    t.is(buffer.size(), size);
    var n2 = buffer.shift();
    t.is(n2, array1[4]);
    t.is(buffer._beginIndex, 0);
    t.is(buffer.size(), size-1);
    var i = 0;
    var n;
    while(n = buffer.shift()) {
        t.is(n, array2[i++]);
        t.is(buffer.size(), size-1-i);
    }
    t.is(buffer.size(), 0);
});