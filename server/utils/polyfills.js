/**
 * Browser API Polyfills for Node.js
 * Provides File and Blob APIs in Node.js server environment
 * Fixes "File is not defined" error from undici HTTP client
 * @module server/utils/polyfills
 */

/**
 * File API Polyfill
 * Implements File class for Node.js environment
 * Extends Blob with file-specific properties
 * @class File
 * @extends Blob
 * @param {Array} bits - Array of data chunks
 * @param {string} filename - File name
 * @param {Object} [options={}] - File options
 * @param {string} [options.type=''] - MIME type
 * @param {number} [options.lastModified] - Last modified timestamp
 * @property {string} name - File name
 * @property {number} lastModified - Last modified timestamp (defaults to current time)
 */
if (typeof global !== "undefined" && !global.File) {
  global.File = class File extends Blob {
    /**
     * Create a File instance
     * @constructor
     * @param {Array} bits - Array of data chunks
     * @param {string} filename - File name
     * @param {Object} [options={}] - File options
     */
    constructor(bits, filename, options = {}) {
      super(bits, options);
      this.name = filename;
      this.lastModified = options.lastModified || Date.now();
    }
  };
}

/**
 * Blob API Polyfill
 * Implements Blob class for Node.js environment
 * @class Blob
 * @param {Array} [bits=[]] - Array of data chunks
 * @param {Object} [options={}] - Blob options
 * @param {string} [options.type=''] - MIME type
 * @property {string} type - MIME type
 * @property {number} size - Total size in bytes
 */
if (typeof global !== "undefined" && !global.Blob) {
  global.Blob = class Blob {
    /**
     * Create a Blob instance
     * @constructor
     * @param {Array} [bits=[]] - Array of data chunks
     * @param {Object} [options={}] - Blob options
     */
    constructor(bits = [], options = {}) {
      this.type = options.type || "";
      this.size = bits.reduce(
        (acc, bit) => acc + (typeof bit === "string" ? bit.length : bit.length),
        0
      );
    }
  };
}

export default {};
