import { describe, it, expect, beforeAll, afterAll, beforeEach } from 'vitest';
import mongoose from 'mongoose';
import { MongoMemoryReplSet } from 'mongodb-memory-server';
import request from 'supertest';
import { createApp } from '../app.js';
import User from '../models/User.js';
import Poll from '../models/Poll.js';

let replSet;
let app;

beforeAll(async () => {
  process.env.JWT_SECRET = 'test-jwt-secret-polls';
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
  await Poll.deleteMany({});
  await User.deleteMany({});
});

describe('Poll CRUD Integration Tests', () => {
  const signupAndGetCookie = async (email) => {
    const res = await request(app)
      .post('/api/auth/signup')
      .send({ name: 'Tester', email, password: 'password123' });
    return res.headers['set-cookie'];
  };

  it('creates a new poll for an authenticated user', async () => {
    const cookie = await signupAndGetCookie('creator@example.com');
    
    const res = await request(app)
      .post('/api/polls')
      .set('Cookie', cookie)
      .send({
        title: 'New Poll',
        questions: [{ text: 'Q1', options: ['A', 'B'], type: 'single' }],
      });

    expect(res.status).toBe(201);
    expect(res.body.title).toBe('New Poll');
    expect(res.body.pollCode).toHaveLength(6);
  });

  it('fetches polls with pagination metadata', async () => {
    const cookie = await signupAndGetCookie('list@example.com');
    await Poll.create({
      title: 'Public Poll',
      createdBy: new mongoose.Types.ObjectId(),
      visibility: 'public',
      questions: [{ text: 'Q', options: [{ text: '1' }, { text: '2' }] }]
    });

    const res = await request(app).get('/api/polls');
    
    expect(res.status).toBe(200);
    expect(res.body.data).toBeDefined();
    expect(res.body.pagination).toBeDefined();
    expect(res.body.pagination.total).toBe(1);
  });

  it('allows owner to delete their poll', async () => {
    const cookie = await signupAndGetCookie('owner@example.com');
    const user = await User.findOne({ email: 'owner@example.com' });
    
    const poll = await Poll.create({
      title: 'To Be Deleted',
      createdBy: user._id,
      questions: [{ text: 'Q', options: [{ text: '1' }, { text: '2' }] }]
    });

    const res = await request(app)
      .delete(`/api/polls/${poll.pollCode}`)
      .set('Cookie', cookie);

    expect(res.status).toBe(200);
    const deleted = await Poll.findById(poll._id);
    expect(deleted).toBeNull();
  });

  it('prevents non-owners from deleting polls', async () => {
    const ownerCookie = await signupAndGetCookie('owner2@example.com');
    const thiefCookie = await signupAndGetCookie('thief@example.com');
    const owner = await User.findOne({ email: 'owner2@example.com' });

    const poll = await Poll.create({
      title: 'Safe Poll',
      createdBy: owner._id,
      questions: [{ text: 'Q', options: [{ text: '1' }, { text: '2' }] }]
    });

    const res = await request(app)
      .delete(`/api/polls/${poll.pollCode}`)
      .set('Cookie', thiefCookie);

    expect(res.status).toBe(403);
  });

  it('allows owner to close their poll', async () => {
    const cookie = await signupAndGetCookie('closer@example.com');
    const user = await User.findOne({ email: 'closer@example.com' });

    const poll = await Poll.create({
      title: 'Closing Soon',
      createdBy: user._id,
      questions: [{ text: 'Q', options: [{ text: '1' }, { text: '2' }] }]
    });

    const res = await request(app)
      .patch(`/api/polls/${poll.pollCode}/close`)
      .set('Cookie', cookie);

    expect(res.status).toBe(200);
    expect(res.body.poll.isActive).toBe(false);
  });
});
