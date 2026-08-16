const mongoose = require('mongoose');

const doubtSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, 'Title is required'],
      trim: true,
    },
    description: {
      type: String,
      required: [true, 'Description is required'],
    },
    subject: {
      type: String,
      required: [true, 'Subject is required'],
      trim: true,
    },
    student: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    assignedMentor: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null,
    },
    status: {
      type: String,
      enum: ['Open', 'In Progress', 'Resolved'],
      default: 'Open',
    },
    // Response-time SLA and Auto-Escalation Engine
    slaDeadline: {
      type: Date,
      default: () => new Date(Date.now() + 15 * 60 * 1000), // 15-minute SLA target
    },
    isEscalated: {
      type: Boolean,
      default: false,
    },
    escalatedAt: {
      type: Date,
      default: null,
    },
    aiInterimResponsePosted: {
      type: Boolean,
      default: false,
    },
    // Student Satisfaction & Quality-Assurance Sign-Off
    resolutionProposed: {
      type: Boolean,
      default: false,
    },
    resolutionProposedAt: {
      type: Date,
      default: null,
    },
    resolvedByStudent: {
      type: Boolean,
      default: false,
    },
    studentFeedback: {
      rating: { type: Number, min: 1, max: 5 },
      comment: { type: String, trim: true },
      satisfied: { type: Boolean },
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Doubt', doubtSchema);
