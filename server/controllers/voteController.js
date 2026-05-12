import Poll from '../models/Poll.js';
import {
  validateResponsesAgainstPoll,
} from '../utils/pollVoteIncrement.js';
import { persistVoteSubmission, TallyUpdateError } from '../services/persistVoteSubmission.js';

// @desc    Submit a vote for a poll
// @route   POST /api/votes
// @access  Public/Private
export const submitVote = async (req, res) => {
  try {
    const { pollCode, responses } = req.body;

    const poll = await Poll.findOne({ pollCode: pollCode.toUpperCase() });

    if (!poll) {
      return res.status(404).json({ message: 'Poll not found' });
    }

    if (!poll.isActive) {
      return res.status(400).json({ message: 'This poll is closed' });
    }

    if (poll.expiresAt && new Date(poll.expiresAt) < new Date()) {
      return res.status(400).json({ message: 'This poll has expired' });
    }

    if (!poll.settings?.anonymous && !req.user) {
      return res.status(401).json({ message: 'Authentication required for this poll' });
    }

    const responseMap = new Map(responses.map((r) => [r.questionId, r.selectedOptionId]));
    for (const q of poll.questions) {
      if (q.isMandatory && !responseMap.has(q._id.toString())) {
        return res.status(400).json({ message: `Question "${q.text}" is mandatory` });
      }
    }

    const struct = validateResponsesAgainstPoll(responses, poll);
    if (!struct.ok) {
      return res.status(400).json({ message: struct.message });
    }

    let voterId = req.user ? req.user._id : null;
    const voterIp = req.headers['x-forwarded-for'] || req.socket.remoteAddress;

    try {
      const finalPoll = await persistVoteSubmission({
        pollId: poll._id,
        responses,
        voterId,
        voterIp,
      });

      const io = req.app.get('io');
      if (io) {
        io.to(poll.pollCode).emit('pollUpdated', finalPoll);
        io.to(poll.pollCode).emit('new_participation', {
          timestamp: new Date(),
          location: 'Remote',
        });
      }

      res.status(201).json({ message: 'Response submitted successfully', poll: finalPoll });
    } catch (dbError) {
      if (dbError.code === 11000) {
        return res.status(400).json({ message: 'You have already submitted a response to this poll.' });
      }
      if (dbError instanceof TallyUpdateError) {
        return res.status(500).json({ message: 'Failed to update poll tallies. Please try again.' });
      }
      throw dbError;
    }
  } catch (error) {
    console.error('Vote submission error:', error);
    res.status(500).json({ message: 'Failed to submit your response. Please try again.' });
  }
};
