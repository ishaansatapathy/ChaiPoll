import { webcrypto } from "node:crypto";

/**
 * Polyfill for globalThis.crypto in Vitest Node environment.
 * Required for MongoDB driver's uuid generation and other crypto-dependent libraries
 * that expect a global crypto object (Web Crypto API).
 */
if (!globalThis.crypto) {
  Object.defineProperty(globalThis, "crypto", {
    value: webcrypto,
    writable: true,
    configurable: true,
  });
}
