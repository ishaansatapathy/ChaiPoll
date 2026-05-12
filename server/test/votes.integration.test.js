import { describe, it, expect, beforeAll, afterAll, beforeEach } from 'vitest';
import mongoose from 'mongoose';
import { MongoMemoryReplSet } from 'mongodb-memory-server';
import request from 'supertest';
import { createApp } from '../app.js';
import User from '../models/User.js';
import Poll from '../models/Poll.js';
import Vote from '../models/Vote.js';

let replSet;
let app;

beforeAll(async () => {
  process.env.JWT_SECRET = 'test-jwt-secret-ci-only';
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
  await Vote.deleteMany({});
  await Poll.deleteMany({});
  await User.deleteMany({});
});

describe('POST /api/votes', () => {
  it('submits a vote and increments tallies (transactional on replica set)', async () => {
    const user = await User.create({
      name: 'Tester',
      email: 'tester@example.com',
      password: 'secret12',
      authProvider: 'local',
    });

    const poll = await Poll.create({
      title: 'Poll',
      questions: [
        {
          text: 'Pick one',
          options: [
            { text: 'A', voteCount: 0 },
            { text: 'B', voteCount: 0 },
          ],
          isMandatory: true,
          type: 'single',
        },
      ],
      createdBy: user._id,
      settings: { anonymous: true, isPublished: true },
    });

    const q = poll.questions[0];
    const optionA = q.options[0];

    const res = await request(app)
      .post('/api/votes')
      .set('X-Forwarded-For', '203.0.113.9')
      .send({
        pollCode: poll.pollCode,
        responses: [{ questionId: q._id.toString(), selectedOptionId: optionA._id.toString() }],
      });

    expect(res.status).toBe(201);
    expect(res.body.poll.totalParticipants).toBe(1);
    expect(res.body.poll.questions[0].totalVotes).toBe(1);
    expect(res.body.poll.questions[0].options[0].voteCount).toBe(1);

    const votes = await Vote.find({ pollId: poll._id });
    expect(votes).toHaveLength(1);
  });

  it('rejects a second anonymous vote from the same IP', async () => {
    const user = await User.create({
      name: 'Tester',
      email: 'voter2@example.com',
      password: 'secret12',
      authProvider: 'local',
    });

    const poll = await Poll.create({
      title: 'Poll',
      questions: [
        {
          text: 'Q',
          options: [
            { text: 'A', voteCount: 0 },
            { text: 'B', voteCount: 0 },
          ],
          isMandatory: true,
          type: 'single',
        },
      ],
      createdBy: user._id,
      settings: { anonymous: true, isPublished: true },
    });

    const q = poll.questions[0];
    const body = {
      pollCode: poll.pollCode,
      responses: [{ questionId: q._id.toString(), selectedOptionId: q.options[0]._id.toString() }],
    };

    const first = await request(app).post('/api/votes').set('X-Forwarded-For', '203.0.113.10').send(body);
    expect(first.status).toBe(201);

    const second = await request(app).post('/api/votes').set('X-Forwarded-For', '203.0.113.10').send(body);
    expect(second.status).toBe(400);
    expect(second.body.message).toMatch(/already submitted/i);
  });
});
