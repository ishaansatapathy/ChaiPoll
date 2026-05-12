import mongoose from "mongoose";

/**
 * Validates each response references a real question and option on the poll,
 * and that no question appears twice.
 */
export function validateResponsesAgainstPoll(responses, poll) {
  const questionIds = new Set();
  for (const r of responses) {
    const qid = String(r.questionId);
    if (questionIds.has(qid)) {
      return { ok: false, message: "Each question can only be answered once" };
    }
    questionIds.add(qid);
  }

  for (const r of responses) {
    const q = poll.questions.find((x) => x._id.toString() === String(r.questionId));
    if (!q) {
      return { ok: false, message: "Invalid question for this poll" };
    }
    const opt = q.options.find((o) => o._id.toString() === String(r.selectedOptionId));
    if (!opt) {
      return { ok: false, message: "Invalid option for this question" };
    }
  }

  return { ok: true };
}

/**
 * Single atomic $inc update for all per-question tallies + totalParticipants.
 */
export function buildPollVoteIncrement(responses) {
  const $inc = { totalParticipants: 1 };
  const arrayFilters = [];

  responses.forEach((resp, i) => {
    const qName = `q${i}`;
    const oName = `o${i}`;
    $inc[`questions.$[${qName}].totalVotes`] = 1;
    $inc[`questions.$[${qName}].options.$[${oName}].voteCount`] = 1;
    arrayFilters.push({ [`${qName}._id`]: new mongoose.Types.ObjectId(resp.questionId) });
    arrayFilters.push({ [`${oName}._id`]: new mongoose.Types.ObjectId(resp.selectedOptionId) });
  });

  return { $inc, arrayFilters };
}
