const { validationResult } = require('express-validator');
const Response = require('../models/Response');

/**
 * POST /api/responses/:doubtId — add a reply to a doubt thread
 */
const createResponse = async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ message: errors.array()[0].msg });
    }

    const { message } = req.body;

    const response = await Response.create({
      doubt: req.params.doubtId,
      author: req.user._id,
      message,
    });

    await response.populate('author', 'name role');

    res.status(201).json(response);
  } catch (err) {
    next(err);
  }
};

/**
 * GET /api/responses/:doubtId — get the full thread for a doubt
 */
const getResponses = async (req, res, next) => {
  try {
    const responses = await Response.find({ doubt: req.params.doubtId })
      .populate('author', 'name role')
      .sort({ createdAt: 1 });

    res.json(responses);
  } catch (err) {
    next(err);
  }
};

module.exports = { createResponse, getResponses };
