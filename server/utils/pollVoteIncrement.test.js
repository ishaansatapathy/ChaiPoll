import { describe, it, expect } from 'vitest';
import mongoose from 'mongoose';
import { validateResponsesAgainstPoll, buildPollVoteIncrement } from './pollVoteIncrement.js';

const q1 = new mongoose.Types.ObjectId();
const q2 = new mongoose.Types.ObjectId();
const o1a = new mongoose.Types.ObjectId();
const o1b = new mongoose.Types.ObjectId();
const o2a = new mongoose.Types.ObjectId();

const poll = {
  questions: [
    { _id: q1, text: 'Q1', options: [{ _id: o1a, text: 'A' }, { _id: o1b, text: 'B' }] },
    { _id: q2, text: 'Q2', options: [{ _id: o2a, text: 'X' }] },
  ],
};

describe('validateResponsesAgainstPoll', () => {
  it('rejects duplicate question ids', () => {
    const r = validateResponsesAgainstPoll(
      [
        { questionId: q1.toString(), selectedOptionId: o1a.toString() },
        { questionId: q1.toString(), selectedOptionId: o1b.toString() },
      ],
      poll
    );
    expect(r.ok).toBe(false);
  });

  it('rejects invalid question', () => {
    const badQ = new mongoose.Types.ObjectId();
    const r = validateResponsesAgainstPoll(
      [{ questionId: badQ.toString(), selectedOptionId: o1a.toString() }],
      poll
    );
    expect(r.ok).toBe(false);
  });

  it('rejects option not on question', () => {
    const r = validateResponsesAgainstPoll(
      [{ questionId: q1.toString(), selectedOptionId: o2a.toString() }],
      poll
    );
    expect(r.ok).toBe(false);
  });

  it('accepts valid responses', () => {
    const r = validateResponsesAgainstPoll(
      [
        { questionId: q1.toString(), selectedOptionId: o1b.toString() },
        { questionId: q2.toString(), selectedOptionId: o2a.toString() },
      ],
      poll
    );
    expect(r).toEqual({ ok: true });
  });
});

describe('buildPollVoteIncrement', () => {
  it('builds matching $inc keys and arrayFilters', () => {
    const responses = [
      { questionId: q1.toString(), selectedOptionId: o1a.toString() },
      { questionId: q2.toString(), selectedOptionId: o2a.toString() },
    ];
    const { $inc, arrayFilters } = buildPollVoteIncrement(responses);

    expect($inc.totalParticipants).toBe(1);
    expect($inc['questions.$[q0].totalVotes']).toBe(1);
    expect($inc['questions.$[q0].options.$[o0].voteCount']).toBe(1);
    expect($inc['questions.$[q1].totalVotes']).toBe(1);
    expect($inc['questions.$[q1].options.$[o1].voteCount']).toBe(1);

    expect(arrayFilters).toHaveLength(4);
    expect(arrayFilters[0]).toEqual({ 'q0._id': q1 });
    expect(arrayFilters[1]).toEqual({ 'o0._id': o1a });
    expect(arrayFilters[2]).toEqual({ 'q1._id': q2 });
    expect(arrayFilters[3]).toEqual({ 'o1._id': o2a });
  });
});
