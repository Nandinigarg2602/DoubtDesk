const { validationResult } = require('express-validator');
const Doubt = require('../models/Doubt');
const Response = require('../models/Response');
const FAQ = require('../models/FAQ');
const { checkAndEscalateDoubts } = require('../services/slaService');

/**
 * POST /api/doubts — student only
 */
const createDoubt = async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ message: errors.array()[0].msg });
    }

    const { title, description, subject } = req.body;

    const doubt = await Doubt.create({
      title,
      description,
      subject,
      student: req.user._id,
      status: 'Open',
      slaDeadline: new Date(Date.now() + 15 * 60 * 1000), // 15-minute SLA
    });

    await doubt.populate('student', 'name email role');
    res.status(201).json(doubt);
  } catch (err) {
    next(err);
  }
};

/**
 * GET /api/doubts
 */
const getDoubts = async (req, res, next) => {
  try {
    await checkAndEscalateDoubts();

    const filter = {};

    if (req.user.role === 'student') {
      filter.student = req.user._id;
    }

    if (req.query.status && ['Open', 'In Progress', 'Resolved'].includes(req.query.status)) {
      filter.status = req.query.status;
    }

    const doubts = await Doubt.find(filter)
      .populate('student', 'name email role')
      .populate('assignedMentor', 'name email role')
      .sort({ isEscalated: -1, createdAt: -1 });

    res.json(doubts);
  } catch (err) {
    next(err);
  }
};

/**
 * GET /api/doubts/:id
 */
const getDoubt = async (req, res, next) => {
  try {
    await checkAndEscalateDoubts();

    const doubt = await Doubt.findById(req.params.id)
      .populate('student', 'name email role')
      .populate('assignedMentor', 'name email role');

    if (!doubt) {
      return res.status(404).json({ message: 'Doubt not found' });
    }

    res.json(doubt);
  } catch (err) {
    next(err);
  }
};

/**
 * PUT /api/doubts/:id/assign — mentor only
 */
const assignDoubt = async (req, res, next) => {
  try {
    const doubt = await Doubt.findById(req.params.id);

    if (!doubt) {
      return res.status(404).json({ message: 'Doubt not found' });
    }

    if (doubt.status !== 'Open') {
      return res
        .status(400)
        .json({ message: 'Doubt is not open for assignment' });
    }

    doubt.assignedMentor = req.user._id;
    doubt.status = 'In Progress';
    await doubt.save();

    await doubt.populate('student', 'name email role');
    await doubt.populate('assignedMentor', 'name email role');

    res.json(doubt);
  } catch (err) {
    next(err);
  }
};

/**
 * PUT /api/doubts/:id/propose-resolution — mentor only
 * Mentor indicates they have delivered the solution and requests student approval.
 */
const proposeResolution = async (req, res, next) => {
  try {
    const doubt = await Doubt.findById(req.params.id);
    if (!doubt) {
      return res.status(404).json({ message: 'Doubt not found' });
    }

    if (doubt.status !== 'In Progress') {
      return res.status(400).json({ message: 'Doubt must be In Progress to propose a solution.' });
    }

    doubt.resolutionProposed = true;
    doubt.resolutionProposedAt = new Date();
    await doubt.save();

    // Post a notice in the thread
    await Response.create({
      doubt: doubt._id,
      author: req.user._id,
      message: '📋 **[RESOLUTION PROPOSED]** Mentor has provided the solution and requested student review. Student sign-off is required to mark as Resolved.',
    });

    await doubt.populate('student', 'name email role');
    await doubt.populate('assignedMentor', 'name email role');

    res.json(doubt);
  } catch (err) {
    next(err);
  }
};

/**
 * PUT /api/doubts/:id/verify-resolution — student only
 * Student evaluates if the solution meets their expectations.
 * Body: { satisfied: boolean, rating?: number, comment?: string }
 */
const verifyResolution = async (req, res, next) => {
  try {
    const { satisfied, rating, comment } = req.body;
    const doubt = await Doubt.findById(req.params.id);

    if (!doubt) {
      return res.status(404).json({ message: 'Doubt not found' });
    }

    // Verify requesting user is the student who created the doubt
    if (doubt.student.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Only the student who asked this doubt can approve or reject the resolution.' });
    }

    if (satisfied) {
      // Student is satisfied -> Officially resolve
      doubt.status = 'Resolved';
      doubt.resolvedByStudent = true;
      doubt.resolutionProposed = true;
      doubt.studentFeedback = {
        satisfied: true,
        rating: rating || 5,
        comment: comment || 'Resolved to student expectation.',
      };
      await doubt.save();

      // Auto-index into Knowledge Base FAQ
      try {
        const lastMentorResponse = await Response.findOne({
          doubt: doubt._id,
        }).sort({ createdAt: -1 });

        const solutionText = lastMentorResponse?.message || 'Resolution verified by student.';

        await FAQ.findOneAndUpdate(
          { doubt: doubt._id },
          {
            doubt: doubt._id,
            title: doubt.title,
            subject: doubt.subject,
            problemSummary: doubt.description,
            solution: solutionText,
            resolvedBy: doubt.assignedMentor || req.user._id,
          },
          { upsert: true, new: true }
        );
      } catch (faqErr) {
        console.error('Failed to auto-index FAQ:', faqErr.message);
      }

      await Response.create({
        doubt: doubt._id,
        author: req.user._id,
        message: `⭐ **[STUDENT SIGN-OFF APPROVED]** Student rated this solution **${rating || 5}/5 Stars**. Resolution officially accepted and marked Resolved!`,
      });
    } else {
      // Student is NOT satisfied -> Reset to In Progress and request further clarification
      doubt.status = 'In Progress';
      doubt.resolutionProposed = false;
      doubt.studentFeedback = {
        satisfied: false,
        comment: comment || 'Student requested further clarification.',
      };
      await doubt.save();

      await Response.create({
        doubt: doubt._id,
        author: req.user._id,
        message: `⚠️ **[STUDENT FEEDBACK: CLARIFICATION NEEDED]**\n\nThe student indicated the solution is not yet up to expectation:\n*"${comment || 'I am still encountering issues and need further explanation.'}"*\n\nStatus remains **In Progress** until the problem is fully resolved.`,
      });
    }

    await doubt.populate('student', 'name email role');
    await doubt.populate('assignedMentor', 'name email role');

    res.json(doubt);
  } catch (err) {
    next(err);
  }
};

/**
 * PUT /api/doubts/:id/status
 */
const updateStatus = async (req, res, next) => {
  try {
    const { status } = req.body;

    if (!status || !['Open', 'In Progress', 'Resolved'].includes(status)) {
      return res.status(400).json({ message: 'Invalid status value' });
    }

    const doubt = await Doubt.findById(req.params.id);
    if (!doubt) {
      return res.status(404).json({ message: 'Doubt not found' });
    }

    // Quality assurance guard: Mentor cannot unilaterally resolve without student approval
    if (status === 'Resolved' && req.user.role === 'mentor' && !doubt.resolvedByStudent) {
      return res.status(400).json({
        message: 'Quality Assurance Rule: A doubt cannot be closed until the student confirms the solution meets their expectation. Please use "Propose Resolution" to request student sign-off.',
      });
    }

    doubt.status = status;
    await doubt.save();

    await doubt.populate('student', 'name email role');
    await doubt.populate('assignedMentor', 'name email role');

    res.json(doubt);
  } catch (err) {
    next(err);
  }
};

module.exports = {
  createDoubt,
  getDoubts,
  getDoubt,
  assignDoubt,
  proposeResolution,
  verifyResolution,
  updateStatus,
};
