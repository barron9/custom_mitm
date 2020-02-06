(function(root, factory) {
  if (typeof exports === 'object' && typeof module === 'object') {
    module.exports = factory();
  } else if (typeof define === 'function' && define.amd) {
    define([], factory);
  } else if (typeof exports === 'object') {
    exports['ObjectId'] = factory();
  } else {
    root['ObjectId'] = factory();
  }
})(this, function() {
  'use strict';

  function __node_require__(request) {
    var __r;
    if (typeof __webpack_require__ !== 'undefined') {
      __r = ((typeof __non_webpack_require__ !== 'undefined' && typeof wx === 'undefined') ? __non_webpack_require__ : undefined);
    } else {
      __r = ((typeof require !== 'undefined' && typeof wx === 'undefined') ? require : undefined);
    }
    return __r(request);
  }

  var __Buffer;
  try {
    __Buffer = __node_require__('buffer').Buffer;
  } catch (e) {
    // empty
  }

  var toString = Object.prototype.toString;

  function isArray(o) {
    if (Array.isArray) {
      return Array.isArray(o);
    }
    return (toString.call(o) === '[object Array]');
  }

  function isArrayLike(o) {
    return (typeof Uint8Array !== 'undefined' && o instanceof Uint8Array) || isArray(o);
  }

  function createBuffer(len) {
    if (__Buffer) {
      return __Buffer.alloc(len);
    }

    var i;
    if (typeof Uint8Array !== 'undefined') {
      return new Uint8Array(len);
    }

    var arr = [];
    for (i = 0; i < len; i++) {
      arr[i] = 0;
    }

    return arr;
  }

  function bufferFrom(buf) {
    if (__Buffer) {
      return __Buffer.from(buf);
    }
    var i;
    if (typeof Uint8Array !== 'undefined') {
      if (typeof Uint8Array.from === 'function') {
        return Uint8Array.from(buf);
      } else {
        var uint8arr = new Uint8Array(buf.length);
        for (i = 0; i < buf.length; i++) {
          uint8arr[i] = buf[i];
        }
        return uint8arr;
      }
    }

    var arr = [];
    for (i = 0; i < buf.length; i++) {
      arr[i] = buf[i];
    }
    return arr;
  }

  function readUInt32BE(offset) {
    offset = offset || 0;
    if (__Buffer && __Buffer.isBuffer(this)) {
      return this.readUInt32BE(offset);
    }
    var first = this[offset];
    var last = this[offset + 3];
    if (first === undefined || last === undefined) {
      throw new RangeError('Attempt to write outside buffer bounds');
    }

    return first * Math.pow(2, 24) +
      this[++offset] * Math.pow(2, 16) +
      this[++offset] * Math.pow(2, 8) +
      last;
  }

  function bufferToString(encoding) {
    if (__Buffer) {
      return __Buffer.from(this).toString(encoding);
    }
    var res = '';
    var i = 0;
    if (encoding === 'hex') {
      res = '';
      for (i = 0; i < this.length; i++) {
        var hex = this[i].toString(16);
        res += (hex.length === 1 ? ('0' + hex) : hex);
      }
      return res;
    } else if (encoding === 'binary') {
      res = '';
      for (i = 0; i < this.length; i++) {
        res += String.fromCharCode(this[i]);
      }
      return res;
    } else {
      var out, len, c;
      var char2, char3;

      out = '';
      len = this.length;
      i = 0;
      while (i < len) {
        c = this[i++];
        switch (c >> 4) {
          case 0: case 1: case 2: case 3: case 4: case 5: case 6: case 7:
            // 0xxxxxxx
            out += String.fromCharCode(c);
            break;
          case 12: case 13:
            // 110x xxxx 10xx xxxx
            char2 = this[i++];
            out += String.fromCharCode(((c & 0x1F) << 6) | (char2 & 0x3F));
            break;
          case 14:
            // 1110 xxxx 10xx xxxx 10xx xxxx
            char2 = this[i++];
            char3 = this[i++];
            out += String.fromCharCode(((c & 0x0F) << 12) | ((char2 & 0x3F) << 6) | ((char3 & 0x3F) << 0));
            break;
        }
      }

      return out;
    }
  }

  function insecureRandomBytes(size) {
    var result = createBuffer(size);
    for (var i = 0; i < size; ++i) result[i] = Math.floor(Math.random() * 256);
    return result;
  }

  var randomBytes = insecureRandomBytes;
  if (typeof window !== 'undefined' && window.crypto && window.crypto.getRandomValues && typeof Uint8Array !== 'undefined') {
    randomBytes = function(size) {
      return window.crypto.getRandomValues(new Uint8Array(size));
    };
  } else {
    var crypto;
    try {
      crypto = __node_require__('crypto');
      randomBytes = crypto.randomBytes;
    } catch (e) {
      // keep the fallback
    }

    if (randomBytes == null) {
      randomBytes = insecureRandomBytes;
    }
  }

  function deprecate(fn, msg) {
    return function() {
      console.warn(msg);
      var args = Array.prototype.slice.call(arguments);
      return fn.apply(this, args);
    };
  }

  // constants
  var PROCESS_UNIQUE = randomBytes(5);

  // Regular expression that checks for hex value
  var checkForHexRegExp = new RegExp('^[0-9a-fA-F]{24}$');
  // let hasBufferType = false;

  // Check if buffer exists
  // try {
  //   if (Buffer && Buffer.from) hasBufferType = true;
  // } catch (err) {
  //   hasBufferType = false;
  // }

  // Precomputed hex table enables speedy hex string conversion
  var hexTable = [];
  var i;
  for (i = 0; i < 256; i++) {
    hexTable[i] = (i <= 15 ? '0' : '') + i.toString(16);
  }

  // Lookup tables
  var decodeLookup = [];
  i = 0;
  while (i < 10) decodeLookup[0x30 + i] = i++;
  while (i < 16) decodeLookup[0x41 - 10 + i] = decodeLookup[0x61 - 10 + i] = i++;

  // const _Buffer = Buffer;
  function convertToHex(bytes) {
    // return bytes.toString('hex');
    return bufferToString.call(bytes, 'hex');
  }

  function makeObjectIdError(invalidString, index) {
    var invalidCharacter = invalidString[index];
    return new TypeError(
      'ObjectId string "' + invalidString + '" contains invalid character "' + invalidCharacter + '" with character code (' + invalidString.charCodeAt(
        index
      ) + '). All character codes for a non-hex string must be less than 256.'
    );
  }

  /**
   * Create an ObjectId type
   *
   * @constructor
   * @param {(string|Uint8Array|number)} id Can be a 24 byte hex string, 12 byte binary Buffer, or a Number.
   * @property {number} generationTime The generation time of this ObjectId instance
   * @return {ObjectId} instance of ObjectId.
   */
  function ObjectId(id) {
    if (!(this instanceof ObjectId)) throw new TypeError('Class constructor ObjectId cannot be invoked without \'new\'');

    // Duck-typing to support ObjectId from different npm packages
    if (id instanceof ObjectId) return id;

    // The most common usecase (blank id, new objectId instance)
    if (id == null || typeof id === 'number') {
      // Generate a new id
      this.id = ObjectId.generate(id);
      // If we are caching the hex string
      if (ObjectId.cacheHexString) this.__id = this.toString('hex');
      // Return the object
      return;
    }

    // Check if the passed in id is valid
    var valid = ObjectId.isValid(id);

    // Throw an error if it's not a valid setup
    if (!valid && id != null) {
      throw new TypeError(
        'Argument passed in must be a single String of 12 bytes or a string of 24 hex characters'
      );
    } else if (valid && typeof id === 'string' && id.length === 24 && __Buffer) {
      return new ObjectId(__Buffer.from(id, 'hex'));
    } else if (valid && typeof id === 'string' && id.length === 24) {
      return ObjectId.createFromHexString(id);
    } else if (id != null && id.length === 12) {
      if (isArrayLike(id)) {
        this.id = bufferFrom(id);
      } else {
        // assume 12 byte string
        this.id = id;
      }
    } else if (id != null && id.toHexString) {
      // Duck-typing to support ObjectId from different npm packages
      return ObjectId.createFromHexString(id.toHexString());
    } else {
      throw new TypeError(
        'Argument passed in must be a single String of 12 bytes or a string of 24 hex characters'
      );
    }

    if (ObjectId.cacheHexString) this.__id = this.toString('hex');
  }

  /**
   * Return the ObjectId id as a 24 byte hex string representation
   *
   * @method
   * @return {string} return the 24 byte hex string representation.
   */
  ObjectId.prototype.toHexString = function() {
    if (ObjectId.cacheHexString && this.__id) return this.__id;

    var hexString = '';
    if (!this.id || !this.id.length) {
      throw new TypeError(
        'invalid ObjectId, ObjectId.id must be either a string or a Buffer, but is [' +
        JSON.stringify(this.id) +
        ']'
      );
    }

    if (isArrayLike(this.id)) {
      hexString = convertToHex(this.id);
      if (ObjectId.cacheHexString) this.__id = hexString;
      return hexString;
    }

    for (var i = 0; i < this.id.length; i++) {
      var hexChar = hexTable[this.id.charCodeAt(i)];
      if (typeof hexChar !== 'string') {
        throw makeObjectIdError(this.id, i);
      }
      hexString += hexChar;
    }

    if (ObjectId.cacheHexString) this.__id = hexString;
    return hexString;
  };

  /**
   * Update the ObjectId index used in generating new ObjectId's on the driver
   *
   * @method
   * @return {number} returns next index value.
   * @ignore
   */
  ObjectId.getInc = function() {
    return (ObjectId.index = (ObjectId.index + 1) % 0xffffff);
  };

  /**
   * Generate a 12 byte id buffer used in ObjectId's
   *
   * @method
   * @param {number} [time] optional parameter allowing to pass in a second based timestamp.
   * @return {Uint8Array} return the 12 byte id buffer string.
   */
  ObjectId.generate = function(time) {
    if ('number' !== typeof time) {
      time = ~~(Date.now() / 1000);
    }

    var inc = ObjectId.getInc();
    var buffer = createBuffer(12);

    // 4-byte timestamp
    buffer[3] = time & 0xff;
    buffer[2] = (time >> 8) & 0xff;
    buffer[1] = (time >> 16) & 0xff;
    buffer[0] = (time >> 24) & 0xff;

    // 5-byte process unique
    buffer[4] = PROCESS_UNIQUE[0];
    buffer[5] = PROCESS_UNIQUE[1];
    buffer[6] = PROCESS_UNIQUE[2];
    buffer[7] = PROCESS_UNIQUE[3];
    buffer[8] = PROCESS_UNIQUE[4];

    // 3-byte counter
    buffer[11] = inc & 0xff;
    buffer[10] = (inc >> 8) & 0xff;
    buffer[9] = (inc >> 16) & 0xff;

    return buffer;
  };

  /**
   * Converts the id into a 24 byte hex string for printing
   *
   * @return {String} return the 24 byte hex string representation.
   * @ignore
   */
  ObjectId.prototype.toString = function(format) {
    // Is the id a buffer then use the buffer toString method to return the format
    if (isArrayLike(this.id)) {
      // return this.id.toString(typeof format === 'string' ? format : 'hex');
      return bufferToString.call(this.id, typeof format === 'string' ? format : 'hex');
    }

    return this.toHexString();
  };

  /**
   * Converts to its JSON representation.
   *
   * @return {String} return the 24 byte hex string representation.
   * @ignore
   */
  ObjectId.prototype.toJSON = function() {
    return this.toHexString();
  };

  /**
   * Compares the equality of this ObjectId with `otherID`.
   *
   * @method
   * @param {object} otherId ObjectId instance to compare against.
   * @return {boolean} the result of comparing two ObjectId's
   */
  ObjectId.prototype.equals = function(otherId) {
    if (otherId instanceof ObjectId) {
      return this.toString() === otherId.toString();
    }

    if (
      typeof otherId === 'string' &&
      ObjectId.isValid(otherId) &&
      otherId.length === 12 &&
      (isArrayLike(this.id))
    ) {
      // return otherId === this.id.toString('binary');
      return otherId === bufferToString.call(this.id, 'binary');
    }

    if (typeof otherId === 'string' && ObjectId.isValid(otherId) && otherId.length === 24) {
      return otherId.toLowerCase() === this.toHexString();
    }

    if (typeof otherId === 'string' && ObjectId.isValid(otherId) && otherId.length === 12) {
      return otherId === this.id;
    }

    if (otherId != null && (otherId instanceof ObjectId || otherId.toHexString)) {
      return otherId.toHexString() === this.toHexString();
    }

    return false;
  };

  /**
   * Returns the generation date (accurate up to the second) that this ID was generated.
   *
   * @method
   * @return {Date} the generation date
   */
  ObjectId.prototype.getTimestamp = function() {
    var timestamp = new Date();
    var time = readUInt32BE.call(this.id, 0);
    timestamp.setTime(Math.floor(time) * 1000);
    return timestamp;
  };

  /**
   * @ignore
   */
  ObjectId.createPk = function() {
    return new ObjectId();
  };

  /**
   * Creates an ObjectId from a second based number, with the rest of the ObjectId zeroed out. Used for comparisons or sorting the ObjectId.
   *
   * @method
   * @param {number} time an integer number representing a number of seconds.
   * @return {ObjectId} return the created ObjectId
   */
  ObjectId.createFromTime = function(time) {
    var buffer = createBuffer(12);
    // Encode time into first 4 bytes
    buffer[3] = time & 0xff;
    buffer[2] = (time >> 8) & 0xff;
    buffer[1] = (time >> 16) & 0xff;
    buffer[0] = (time >> 24) & 0xff;
    // Return the new objectId
    return new ObjectId(buffer);
  };

  /**
   * Creates an ObjectId from a hex string representation of an ObjectId.
   *
   * @method
   * @param {string} hexString create a ObjectId from a passed in 24 byte hexstring.
   * @return {ObjectId} return the created ObjectId
   */
  ObjectId.createFromHexString = function(hexString) {
    // Throw an error if it's not a valid setup
    if (typeof hexString === 'undefined' || (hexString != null && hexString.length !== 24)) {
      throw new TypeError(
        'Argument passed in must be a single String of 12 bytes or a string of 24 hex characters'
      );
    }

    // Use Buffer.from method if available
    // if (hasBufferType) return new ObjectId(Buffer.from(string, 'hex'));

    // Calculate lengths
    var array = createBuffer(12);

    var n = 0;
    var i = 0;
    while (i < 24) {
      array[n++] =
        (decodeLookup[hexString.charCodeAt(i++)] << 4) | decodeLookup[hexString.charCodeAt(i++)];
    }

    return new ObjectId(array);
  };

  /**
   * Checks if a value is a valid bson ObjectId
   *
   * @method
   * @param {any} id
   * @return {boolean} return true if the value is a valid bson ObjectId, return false otherwise.
   */
  ObjectId.isValid = function(id) {
    if (id == null) return false;

    if (typeof id === 'number') {
      return true;
    }

    if (typeof id === 'string') {
      return id.length === 12 || (id.length === 24 && checkForHexRegExp.test(id));
    }

    if (id instanceof ObjectId) {
      return true;
    }

    if (isArrayLike(id) && id.length === 12) {
      return true;
    }

    // Duck-Typing detection of ObjectId like objects
    if (id.toHexString) {
      return id.id.length === 12 || (id.id.length === 24 && checkForHexRegExp.test(id.id));
    }

    return false;
  };

  /**
   * @ignore
   */
  ObjectId.prototype.toExtendedJSON = function() {
    if (this.toHexString) return { $oid: this.toHexString() };
    return { $oid: this.toString('hex') };
  };

  /**
   * @ignore
   */
  ObjectId.fromExtendedJSON = function(doc) {
    return new ObjectId(doc.$oid);
  };

  // Deprecated methods
  ObjectId.get_inc = deprecate(
    function() { return ObjectId.getInc(); },
    'Please use the static `ObjectId.getInc()` instead'
  );

  ObjectId.prototype.get_inc = deprecate(
    function() { return ObjectId.getInc(); },
    'Please use the static `ObjectId.getInc()` instead'
  );

  ObjectId.prototype.getInc = deprecate(
    function() { return ObjectId.getInc(); },
    'Please use the static `ObjectId.getInc()` instead'
  );

  ObjectId.prototype.generate = deprecate(
    function(time) { return ObjectId.generate(time); },
    'Please use the static `ObjectId.generate(time)` instead'
  );

  try {
    /**
     * @ignore
     */
    Object.defineProperty(ObjectId.prototype, 'generationTime', {
      enumerable: true,
      get: function() {
        return this.id[3] | (this.id[2] << 8) | (this.id[1] << 16) | (this.id[0] << 24);
      },
      set: function(value) {
        // Encode time into first 4 bytes
        this.id[3] = value & 0xff;
        this.id[2] = (value >> 8) & 0xff;
        this.id[1] = (value >> 16) & 0xff;
        this.id[0] = (value >> 24) & 0xff;
      }
    });
  } catch (err) {
    ObjectId.prototype.generationTime = 0;
  }

  var util;
  try {
    util = __node_require__('util');
    ObjectId.prototype[util.inspect.custom || 'inspect'] = ObjectId.prototype.toString;
  } catch (e) {
    ObjectId.prototype.inspect = ObjectId.prototype.toString;
  }

  /**
   * @ignore
   */
  ObjectId.index = ~~(Math.random() * 0xffffff);

  // In 4.0.0 and 4.0.1, this property name was changed to ObjectId to match the class name.
  // This caused interoperability problems with previous versions of the library, so in
  // later builds we changed it back to ObjectID (capital D) to match legacy implementations.
  try {
    Object.defineProperty(ObjectId.prototype, '_bsontype', { value: 'ObjectID' });
  } catch (err) {
    ObjectId.prototype._bsontype = 'ObjectID';
  }

  return ObjectId;

});
