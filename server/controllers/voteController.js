import Poll from "../models/Poll.js";
import { validateResponsesAgainstPoll } from "../utils/pollVoteIncrement.js";
import { persistVoteSubmission, TallyUpdateError } from "../services/persistVoteSubmission.js";
import logger from "../utils/logger.js";

// @desc    Submit a vote for a poll
// @route   POST /api/votes
// @access  Public/Private
export const submitVote = async (req, res) => {
  try {
    // Check if user is authenticated and banned
    if (req.user && req.user.isBanned) {
      return res.status(403).json({ message: "Your account has been banned" });
    }

    const { pollCode, responses } = req.body;

    const poll = await Poll.findOne({ pollCode: pollCode.toUpperCase() });

    if (!poll) {
      return res.status(404).json({ message: "Poll not found" });
    }

    if (!poll.isActive) {
      return res.status(400).json({ message: "This poll is closed" });
    }

    if (poll.expiresAt && new Date(poll.expiresAt) < new Date()) {
      return res.status(400).json({ message: "This poll has expired" });
    }

    if (!poll.settings?.anonymous && !req.user) {
      return res.status(401).json({ message: "Authentication required for this poll" });
    }

    for (const q of poll.questions) {
      const resp = responses.find(r => r.questionId === q._id.toString());
      const oIds = resp?.optionIds || (resp?.selectedOptionId ? [resp.selectedOptionId] : []);
      if (q.isMandatory && oIds.length === 0) {
        return res.status(400).json({ message: `Question "${q.text}" is mandatory` });
      }
    }

    const struct = validateResponsesAgainstPoll(responses, poll);
    if (!struct.ok) {
      return res.status(400).json({ message: struct.message });
    }

    // Normalize responses: accept both selectedOptionId (string) and optionIds (array)
    const normalizedResponses = responses.map((r) => ({
      questionId: r.questionId,
      optionIds: r.optionIds || (r.selectedOptionId ? [r.selectedOptionId] : []),
    }));

    let voterId = req.user ? req.user._id : null;
    const voterIp = req.headers["x-forwarded-for"] || req.socket.remoteAddress;

    try {
      const finalPoll = await persistVoteSubmission({
        pollId: poll._id,
        responses: normalizedResponses,
        voterId,
        voterIp,
      });

      const io = req.app.get("io");
      if (io) {
        io.to(poll.pollCode).emit("pollUpdated", finalPoll);
        io.to(poll.pollCode).emit("new_participation", {
          timestamp: new Date(),
          location: "Remote",
        });
      }

      res.status(201).json({ message: "Response submitted successfully", poll: finalPoll });
    } catch (dbError) {
      if (dbError.code === 11000) {
        return res
          .status(400)
          .json({ message: "You have already submitted a response to this poll." });
      }
      if (dbError instanceof TallyUpdateError) {
        return res
          .status(500)
          .json({ message: "Failed to update poll tallies. Please try again." });
      }
      throw dbError;
    }
  } catch (error) {
    logger.error("Vote submission error", { message: error.message, stack: error.stack });
    res.status(500).json({ message: "Failed to submit your response. Please try again." });
  }
};
