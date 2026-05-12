import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { getAllowedOrigins } from './allowedOrigins.js';

describe('getAllowedOrigins', () => {
  let origAllowed;
  let origClient;

  beforeEach(() => {
    origAllowed = process.env.ALLOWED_ORIGINS;
    origClient = process.env.CLIENT_URL;
    delete process.env.ALLOWED_ORIGINS;
    delete process.env.CLIENT_URL;
  });

  afterEach(() => {
    if (origAllowed !== undefined) process.env.ALLOWED_ORIGINS = origAllowed;
    else delete process.env.ALLOWED_ORIGINS;
    if (origClient !== undefined) process.env.CLIENT_URL = origClient;
    else delete process.env.CLIENT_URL;
  });

  it('parses comma-separated ALLOWED_ORIGINS', () => {
    process.env.ALLOWED_ORIGINS = 'https://a.app, https://b.app ,';
    expect(getAllowedOrigins()).toEqual(['https://a.app', 'https://b.app']);
  });

  it('uses CLIENT_URL and localhost when ALLOWED_ORIGINS is unset', () => {
    process.env.CLIENT_URL = 'https://prod.example';
    expect(getAllowedOrigins()).toEqual(['https://prod.example', 'http://localhost:5173']);
  });

  it('dedupes when CLIENT_URL is already localhost', () => {
    process.env.CLIENT_URL = 'http://localhost:5173';
    expect(getAllowedOrigins()).toEqual(['http://localhost:5173']);
  });
});
