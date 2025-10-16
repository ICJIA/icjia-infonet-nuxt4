// Polyfill for File API in Node.js environment
// This fixes the "File is not defined" error from undici

if (typeof global !== 'undefined' && !global.File) {
  global.File = class File extends Blob {
    constructor(bits, filename, options = {}) {
      super(bits, options);
      this.name = filename;
      this.lastModified = options.lastModified || Date.now();
    }
  };
}

if (typeof global !== 'undefined' && !global.Blob) {
  global.Blob = class Blob {
    constructor(bits = [], options = {}) {
      this.type = options.type || '';
      this.size = bits.reduce((acc, bit) => acc + (typeof bit === 'string' ? bit.length : bit.length), 0);
    }
  };
}

export default {};

