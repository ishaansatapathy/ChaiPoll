import express from "express";
import { protect } from "../middleware/auth.js";
import {
  createPoll,
  getPolls,
  getMyPolls,
  getPollByCode,
  getPollAnalytics,
  getPollTimeSeries,
  publishPoll,
  deletePoll,
  updatePoll,
  closePoll,
  exportPollData,
} from "../controllers/pollController.js";
import { pollValidationRules, validate } from "../middleware/validator.js";

const router = express.Router();

router.route("/").post(protect, pollValidationRules, validate, createPoll).get(getPolls);

router.route("/my-polls").get(protect, getMyPolls);

router.route("/:code").get(getPollByCode).put(protect, updatePoll).delete(protect, deletePoll);

router.route("/:code/analytics").get(protect, getPollAnalytics);
router.route("/:code/analytics/timeseries").get(protect, getPollTimeSeries);
router.route("/:code/export").get(protect, exportPollData);

router.route("/:code/publish").patch(protect, publishPoll);

router.route("/:code/close").patch(protect, closePoll);

export default router;
