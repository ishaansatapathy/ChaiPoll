import mongoose from "mongoose";
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

    const oIds = r.optionIds || (r.selectedOptionId ? [r.selectedOptionId] : []);
    if (oIds.length === 0) {
      return { ok: false, message: "At least one option must be selected" };
    }

    if (q.type === "single" && oIds.length > 1) {
      return { ok: false, message: `Question "${q.text}" only allows one selection` };
    }

    for (const oid of oIds) {
      const opt = q.options.find((o) => o._id.toString() === String(oid));
      if (!opt) {
        return { ok: false, message: "Invalid option for this question" };
      }
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

  let filterIdx = 0;
  responses.forEach((resp, i) => {
    const qName = `q${i}`;
    $inc[`questions.$[${qName}].totalVotes`] = 1;
    arrayFilters.push({ [`${qName}._id`]: new mongoose.Types.ObjectId(resp.questionId) });

    const oIds = resp.optionIds || (resp.selectedOptionId ? [resp.selectedOptionId] : []);

    oIds.forEach((oid) => {
      const oName = `o${filterIdx++}`;
      $inc[`questions.$[${qName}].options.$[${oName}].voteCount`] = 1;
      arrayFilters.push({ [`${oName}._id`]: new mongoose.Types.ObjectId(oid) });
    });
  });

  return { $inc, arrayFilters };
}
