import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { getJwtCookieOptions, getClearJwtCookieOptions } from './jwtCookieOptions.js';

describe('jwtCookieOptions', () => {
  let origNodeEnv;
  let origSame;
  let origSecure;

  beforeEach(() => {
    origNodeEnv = process.env.NODE_ENV;
    origSame = process.env.JWT_COOKIE_SAMESITE;
    origSecure = process.env.JWT_COOKIE_SECURE;
    delete process.env.JWT_COOKIE_SAMESITE;
    delete process.env.JWT_COOKIE_SECURE;
  });

  afterEach(() => {
    if (origNodeEnv !== undefined) process.env.NODE_ENV = origNodeEnv;
    else delete process.env.NODE_ENV;
    if (origSame !== undefined) process.env.JWT_COOKIE_SAMESITE = origSame;
    else delete process.env.JWT_COOKIE_SAMESITE;
    if (origSecure !== undefined) process.env.JWT_COOKIE_SECURE = origSecure;
    else delete process.env.JWT_COOKIE_SECURE;
  });

  it('defaults to lax + non-secure outside production', () => {
    process.env.NODE_ENV = 'development';
    const o = getJwtCookieOptions();
    expect(o.sameSite).toBe('lax');
    expect(o.secure).toBe(false);
    expect(o.httpOnly).toBe(true);
  });

  it('defaults to none + secure in production', () => {
    process.env.NODE_ENV = 'production';
    const o = getJwtCookieOptions();
    expect(o.sameSite).toBe('none');
    expect(o.secure).toBe(true);
  });

  it('clear options match set options', () => {
    process.env.NODE_ENV = 'development';
    const set = getJwtCookieOptions();
    const clear = getClearJwtCookieOptions();
    expect(clear.sameSite).toBe(set.sameSite);
    expect(clear.secure).toBe(set.secure);
    expect(clear.expires).toBeInstanceOf(Date);
  });
});
