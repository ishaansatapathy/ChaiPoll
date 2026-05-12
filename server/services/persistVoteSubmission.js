import mongoose from 'mongoose';
import Poll from '../models/Poll.js';
import Vote from '../models/Vote.js';
import { buildPollVoteIncrement } from '../utils/pollVoteIncrement.js';
import { isTransactionUnsupportedError } from '../utils/mongoErrors.js';

export class TallyUpdateError extends Error {
  constructor() {
    super('TALLY_UPDATE_FAILED');
    this.name = 'TallyUpdateError';
  }
}

async function persistVoteFallback({ pollId, responses, voterId, voterIp, $inc, arrayFilters }) {
  const vote = await Vote.create({ pollId, responses, voterId, voterIp });
  try {
    const finalPoll = await Poll.findOneAndUpdate(
      { _id: pollId },
      { $inc },
      { returnDocument: 'after', arrayFilters }
    );
    if (!finalPoll) {
      await Vote.findByIdAndDelete(vote._id);
      throw new TallyUpdateError();
    }
    return finalPoll;
  } catch (err) {
    await Vote.findByIdAndDelete(vote._id);
    throw err;
  }
}

/**
 * Inserts vote + updates poll tallies atomically when the server supports transactions (replica set).
 * Otherwise falls back to insert + single document $inc with vote rollback on failure.
 */
export async function persistVoteSubmission({ pollId, responses, voterId, voterIp }) {
  const { $inc, arrayFilters } = buildPollVoteIncrement(responses);

  let session;
  try {
    session = await mongoose.startSession();
    let finalPoll;
    await session.withTransaction(async () => {
      await Vote.create([{ pollId, responses, voterId, voterIp }], { session });
      const fp = await Poll.findOneAndUpdate(
        { _id: pollId },
        { $inc },
        { returnDocument: 'after', arrayFilters, session }
      );
      if (!fp) {
        throw new TallyUpdateError();
      }
      finalPoll = fp;
    });
    return finalPoll;
  } catch (err) {
    if (isTransactionUnsupportedError(err)) {
      return persistVoteFallback({ pollId, responses, voterId, voterIp, $inc, arrayFilters });
    }
    throw err;
  } finally {
    if (session) await session.endSession();
  }
}
