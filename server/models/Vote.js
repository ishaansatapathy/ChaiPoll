import mongoose from 'mongoose';

const responseSchema = new mongoose.Schema({
  questionId: {
    type: mongoose.Schema.ObjectId,
    required: true
  },
  selectedOptionId: {
    type: mongoose.Schema.ObjectId,
    required: true
  }
});

const voteSchema = new mongoose.Schema({
  pollId: {
    type: mongoose.Schema.ObjectId,
    ref: 'Poll',
    required: true,
    index: true
  },
  responses: {
    type: [responseSchema],
    required: true
  },
  voterId: {
    type: mongoose.Schema.ObjectId,
    ref: 'User',
    default: null
  },
  voterIp: {
    type: String,
  }
}, {
  timestamps: true
});

// One submission per authenticated voter; one per IP when anonymous (voterId null)
voteSchema.index({ pollId: 1, voterId: 1 }, { unique: true, partialFilterExpression: { voterId: { $type: "objectId" } } });
voteSchema.index({ pollId: 1, voterIp: 1 }, { unique: true, partialFilterExpression: { voterId: null, voterIp: { $type: "string" } } });

export default mongoose.model('Vote', voteSchema);
