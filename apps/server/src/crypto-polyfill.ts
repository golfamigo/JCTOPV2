// Polyfill for crypto in Node.js 18
import * as crypto from 'crypto';

// Make crypto available globally for packages that expect it
if (typeof global.crypto === 'undefined') {
  global.crypto = crypto as any;
}

// Also add webcrypto if needed
if (typeof (global.crypto as any).webcrypto === 'undefined' && (crypto as any).webcrypto) {
  (global.crypto as any).webcrypto = (crypto as any).webcrypto;
}

export {};