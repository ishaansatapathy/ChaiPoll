import Poll from "../models/Poll.js";
import Vote from "../models/Vote.js";
import { sanitizeText } from "../utils/sanitize.js";

// @desc    Create a new poll
// @route   POST /api/polls
// @access  Private
export const createPoll = async (req, res) => {
  try {
    // Check if user is banned
    if (req.user.isBanned) {
      return res.status(403).json({ message: "Your account has been banned" });
    }

    const { title, description, questions, visibility, expiresAt, settings } = req.body;

    // Format questions and options with sanitization
    const formattedQuestions = questions.map((q) => {
      const optionsWithIds = q.options.map((opt) => ({ text: sanitizeText(opt), voteCount: 0 }));
      return {
        text: sanitizeText(q.text),
        isMandatory: q.isMandatory !== undefined ? q.isMandatory : true,
        options: optionsWithIds,
        type: q.type === "multiple" ? "multiple" : "single",
      };
    });

    const poll = await Poll.create({
      title: sanitizeText(title),
      description: sanitizeText(description || ""),
      questions: formattedQuestions,
      createdBy: req.user._id,
      visibility: visibility || "public",
      expiresAt,
      settings: {
        anonymous: settings?.anonymous || false,
        isPublished: false,
      },
    });

    // Assign correctOptionId based on index if provided
    for (let i = 0; i < questions.length; i++) {
      if (questions[i].correctOptionIndex !== undefined) {
        const qIndex = i;
        const oIndex = questions[i].correctOptionIndex;
        if (poll.questions[qIndex].options[oIndex]) {
          poll.questions[qIndex].correctOptionId = poll.questions[qIndex].options[oIndex]._id;
        }
      }
    }
    await poll.save();

    res.status(201).json(poll);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error creating poll" });
  }
};

// @desc    Get all public polls
// @route   GET /api/polls
// @access  Public
export const getPolls = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = Math.min(parseInt(req.query.limit) || 20, 50);
    const skip = (page - 1) * limit;

    const filter = { visibility: "public" };
    const [polls, total] = await Promise.all([
      Poll.find(filter)
        .populate("createdBy", "name avatar")
        .sort("-createdAt")
        .skip(skip)
        .limit(limit),
      Poll.countDocuments(filter),
    ]);

    res.json({
      data: polls,
      pagination: { page, limit, total, hasMore: skip + polls.length < total },
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error fetching polls" });
  }
};

// @desc    Get user's own polls
// @route   GET /api/polls/my-polls
// @access  Private
export const getMyPolls = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = Math.min(parseInt(req.query.limit) || 20, 50);
    const skip = (page - 1) * limit;

    const filter = { createdBy: req.user._id };
    const [polls, total] = await Promise.all([
      Poll.find(filter).sort("-createdAt").skip(skip).limit(limit),
      Poll.countDocuments(filter),
    ]);

    res.json({
      data: polls,
      pagination: { page, limit, total, hasMore: skip + polls.length < total },
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error fetching your polls" });
  }
};

// @desc    Get a single poll by code
// @route   GET /api/polls/:code
// @access  Public
export const getPollByCode = async (req, res) => {
  try {
    const poll = await Poll.findOne({ pollCode: req.params.code.toUpperCase() }).populate(
      "createdBy",
      "name avatar"
    );

    if (!poll) {
      return res.status(404).json({ message: "Poll not found" });
    }

    res.json(poll);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error fetching poll" });
  }
};

// @desc    Publish poll results
// @route   PATCH /api/polls/:code/publish
// @access  Private
export const publishPoll = async (req, res) => {
  try {
    const poll = await Poll.findOne({ pollCode: req.params.code.toUpperCase() });

    if (!poll) {
      return res.status(404).json({ message: "Poll not found" });
    }

    if (poll.createdBy.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: "Not authorized" });
    }

    poll.settings.isPublished = true;
    await poll.save();

    res.json({ message: "Poll results published successfully", poll });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error publishing poll" });
  }
};

export const getPollAnalytics = async (req, res) => {
  try {
    const poll = await Poll.findOne({ pollCode: req.params.code.toUpperCase() });

    if (!poll) {
      return res.status(404).json({ message: "Poll not found" });
    }

    if (poll.createdBy.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: "Not authorized" });
    }

    const page = parseInt(req.query.page) || 1;
    const limit = Math.min(parseInt(req.query.limit) || 50, 200);
    const skip = (page - 1) * limit;

    const [votes, totalVotes] = await Promise.all([
      Vote.find({ pollId: poll._id })
        .populate("voterId", "name email displayName avatar")
        .sort("-createdAt")
        .skip(skip)
        .limit(limit),
      Vote.countDocuments({ pollId: poll._id }),
    ]);

    res.json({
      poll,
      recentVotes: votes,
      pagination: {
        page,
        limit,
        total: totalVotes,
        hasMore: skip + votes.length < totalVotes,
      },
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error fetching analytics" });
  }
};

// @desc    Export poll data as CSV
// @route   GET /api/polls/:code/export
// @access  Private
export const exportPollData = async (req, res) => {
  try {
    const poll = await Poll.findOne({ pollCode: req.params.code.toUpperCase() });

    if (!poll) {
      return res.status(404).json({ message: "Poll not found" });
    }

    if (poll.createdBy.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: "Not authorized" });
    }

    const votes = await Vote.find({ pollId: poll._id }).populate("voterId", "name email");

    // Create CSV Header
    let csv = "Timestamp,Voter Name,Voter Email,Voter IP\n";
    poll.questions.forEach((q, i) => {
      csv += `,Question ${i + 1}: ${q.text.replace(/,/g, "")}`;
    });
    csv += "\n";

    // Create CSV Rows
    votes.forEach((v) => {
      csv += `${v.createdAt.toISOString()},${v.voterId?.name || "Anonymous"},${v.voterId?.email || "N/A"},${v.voterIp || "Unknown"}`;
      
      const responseMap = new Map(v.responses.map(r => [r.questionId.toString(), r.optionIds]));
      
      poll.questions.forEach(q => {
        const selectedOptionIds = responseMap.get(q._id.toString()) || [];
        const selectedTexts = q.options
          .filter(opt => selectedOptionIds.includes(opt._id.toString()))
          .map(opt => opt.text.replace(/,/g, ""));
        
        csv += `,${selectedTexts.join(" | ")}`;
      });
      csv += "\n";
    });

    res.setHeader("Content-Type", "text/csv");
    res.setHeader("Content-Disposition", `attachment; filename=poll-export-${poll.pollCode}.csv`);
    res.status(200).send(csv);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error fetching analytics" });
  }
};

// @desc    Delete a poll and its votes
// @route   DELETE /api/polls/:code
// @access  Private
export const deletePoll = async (req, res) => {
  try {
    const poll = await Poll.findOne({ pollCode: req.params.code.toUpperCase() });

    if (!poll) {
      return res.status(404).json({ message: "Poll not found" });
    }

    if (poll.createdBy.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: "Not authorized" });
    }

    await Vote.deleteMany({ pollId: poll._id });
    await Poll.findByIdAndDelete(poll._id);

    res.json({ message: "Poll deleted successfully" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error deleting poll" });
  }
};

// @desc    Update poll details (only if no votes yet)
// @route   PUT /api/polls/:code
// @access  Private
export const updatePoll = async (req, res) => {
  try {
    const poll = await Poll.findOne({ pollCode: req.params.code.toUpperCase() });

    if (!poll) {
      return res.status(404).json({ message: "Poll not found" });
    }

    if (poll.createdBy.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: "Not authorized" });
    }

    if (poll.totalParticipants > 0) {
      return res.status(400).json({ message: "Cannot edit a poll that already has responses" });
    }

    const { title, description, visibility, expiresAt } = req.body;
    if (title) poll.title = title;
    if (description !== undefined) poll.description = description;
    if (visibility) poll.visibility = visibility;
    if (expiresAt !== undefined) poll.expiresAt = expiresAt || null;

    await poll.save();
    res.json(poll);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error updating poll" });
  }
};

// @desc    Close a poll (stop accepting responses)
// @route   PATCH /api/polls/:code/close
// @access  Private
export const closePoll = async (req, res) => {
  try {
    const poll = await Poll.findOne({ pollCode: req.params.code.toUpperCase() });

    if (!poll) {
      return res.status(404).json({ message: "Poll not found" });
    }

    if (poll.createdBy.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: "Not authorized" });
    }

    poll.isActive = false;
    await poll.save();

    res.json({ message: "Poll closed successfully", poll });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error closing poll" });
  }
};
