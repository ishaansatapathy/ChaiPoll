import Poll from '../models/Poll.js';
import Vote from '../models/Vote.js';

// @desc    Submit a vote for a poll
// @route   POST /api/votes
// @access  Public/Private
export const submitVote = async (req, res) => {
  try {
    const { pollCode, responses } = req.body;
    
    // Find the poll
    const poll = await Poll.findOne({ pollCode: pollCode.toUpperCase() });
    
    if (!poll) {
      return res.status(404).json({ message: 'Poll not found' });
    }

    if (!poll.isActive) {
      return res.status(400).json({ message: 'Poll is closed' });
    }

    if (poll.expiresAt && new Date(poll.expiresAt) < new Date()) {
      return res.status(400).json({ message: 'Poll has expired' });
    }

    // Security Check: Authenticated only?
    if (!poll.settings?.anonymous && !req.user) {
      return res.status(401).json({ message: 'Authentication required for this poll' });
    }

    // Validation: All mandatory questions answered?
    const responseMap = new Map(responses.map(r => [r.questionId, r.selectedOptionId]));
    for (const q of poll.questions) {
      if (q.isMandatory && !responseMap.has(q._id.toString())) {
        return res.status(400).json({ message: `Question "${q.text}" is mandatory` });
      }
    }

    let voterId = req.user ? req.user._id : null;
    const voterIp = req.headers['x-forwarded-for'] || req.socket.remoteAddress;

    // Register Vote with unique constraint handling
    try {
      const vote = await Vote.create({
        pollId: poll._id,
        responses,
        voterId,
        voterIp
      });

      // Atomic Update Vote Counts in Poll Model
      const mongoose = (await import('mongoose')).default;
      
      for (const resp of responses) {
        // Convert string IDs to ObjectIDs to ensure matching in updateOne
        const qId = new mongoose.Types.ObjectId(resp.questionId);
        const oId = new mongoose.Types.ObjectId(resp.selectedOptionId);

        await Poll.updateOne(
          { _id: poll._id },
          { 
            $inc: { 
              "questions.$[q].totalVotes": 1,
              "questions.$[q].options.$[opt].voteCount": 1
            } 
          },
          {
            arrayFilters: [
              { "q._id": qId },
              { "opt._id": oId }
            ]
          }
        );
      }

      // Atomic Update global participant count
      const finalPoll = await Poll.findByIdAndUpdate(
        poll._id,
        { $inc: { totalParticipants: 1 } },
        { new: true }
      );

      // Broadcast updated poll
      const io = req.app.get('io');
      if (io) {
        io.to(poll.pollCode).emit('pollUpdated', finalPoll);
        io.to(poll.pollCode).emit('new_participation', { 
          timestamp: new Date(),
          location: 'Remote Node'
        });
      }

      res.status(201).json({ message: 'Responses submitted successfully', poll: finalPoll });

    } catch (dbError) {
      if (dbError.code === 11000) {
        return res.status(400).json({ message: 'Double submission detected. Access denied.' });
      }
      throw dbError;
    }

  } catch (error) {
    console.error('Warrior Vote Submission Failure:', error);
    res.status(500).json({ message: 'Nexus connection failed. Mission aborted.' });
  }
};
