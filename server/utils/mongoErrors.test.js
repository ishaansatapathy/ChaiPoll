import { describe, it, expect } from 'vitest';
import { isTransactionUnsupportedError } from './mongoErrors.js';

describe('isTransactionUnsupportedError', () => {
  it('returns true for replica set messages', () => {
    expect(
      isTransactionUnsupportedError(new Error('Transaction numbers are only allowed on a replica set member or mongos'))
    ).toBe(true);
  });

  it('returns false for duplicate key errors', () => {
    const err = new Error('E11000 duplicate key');
    err.code = 11000;
    expect(isTransactionUnsupportedError(err)).toBe(false);
  });
});
