import { describe, it, expect, beforeAll, afterAll, beforeEach } from 'vitest';
import mongoose from 'mongoose';
import { MongoMemoryReplSet } from 'mongodb-memory-server';
import request from 'supertest';
import { createApp } from '../app.js';
import User from '../models/User.js';

let replSet;
let app;

beforeAll(async () => {
  process.env.JWT_SECRET = 'test-jwt-secret-auth';
  replSet = await MongoMemoryReplSet.create({
    replSet: { count: 1 },
  });
  await mongoose.connect(replSet.getUri());
  app = createApp();
}, 120_000);

afterAll(async () => {
  await mongoose.disconnect();
  if (replSet) await replSet.stop();
});

beforeEach(async () => {
  await User.deleteMany({});
});

describe('Auth Integration Tests', () => {
  it('registers a new user and sets a cookie', async () => {
    const res = await request(app)
      .post('/api/auth/signup')
      .send({
        name: 'John Doe',
        email: 'john@example.com',
        password: 'password123'
      });

    expect(res.status).toBe(201);
    expect(res.body.name).toBe('John Doe');
    expect(res.body.email).toBe('john@example.com');
    expect(res.headers['set-cookie']).toBeDefined();
    
    const user = await User.findOne({ email: 'john@example.com' });
    expect(user).toBeTruthy();
  });

  it('fails to register with existing email', async () => {
    await User.create({
      name: 'Existing',
      email: 'test@example.com',
      password: 'hashedpassword'
    });

    const res = await request(app)
      .post('/api/auth/signup')
      .send({
        name: 'New Guy',
        email: 'test@example.com',
        password: 'password123'
      });

    expect(res.status).toBe(400);
    expect(res.body.message).toMatch(/already exists/i);
  });

  it('logs in an existing user and returns a token cookie', async () => {
    await request(app)
      .post('/api/auth/signup')
      .send({
        name: 'Tester',
        email: 'login@example.com',
        password: 'secretpassword'
      });

    const res = await request(app)
      .post('/api/auth/login')
      .send({
        email: 'login@example.com',
        password: 'secretpassword'
      });

    expect(res.status).toBe(200);
    expect(res.headers['set-cookie']).toBeDefined();
    expect(res.body.email).toBe('login@example.com');
  });

  it('fails to log in with wrong password', async () => {
    await User.create({
      name: 'Tester',
      email: 'wrong@example.com',
      password: 'realpassword'
    });

    const res = await request(app)
      .post('/api/auth/login')
      .send({
        email: 'wrong@example.com',
        password: 'fake-password'
      });

    expect(res.status).toBe(401);
    expect(res.body.message).toMatch(/invalid/i);
  });

  it('protects private routes', async () => {
    const res = await request(app).get('/api/auth/me');
    expect(res.status).toBe(401);
  });

  it('returns generic message for forgot-password when email is unknown (no enumeration)', async () => {
    const res = await request(app)
      .post('/api/auth/forgot-password')
      .send({ email: 'nobody@example.com', method: 'otp' });

    expect(res.status).toBe(200);
    expect(res.body.message).toMatch(/if an account exists/i);
  });
});
