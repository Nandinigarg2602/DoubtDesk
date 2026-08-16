const FAQ = require('../models/FAQ');

/**
 * GET /api/faq
 * Search and browse self-growing knowledge base
 */
exports.getFAQs = async (req, res) => {
  try {
    const { q, subject, sort } = req.query;
    const filter = {};

    if (q && q.trim()) {
      filter.$or = [
        { title: { $regex: q.trim(), $options: 'i' } },
        { problemSummary: { $regex: q.trim(), $options: 'i' } },
        { solution: { $regex: q.trim(), $options: 'i' } },
      ];
    }

    if (subject && subject !== 'All') {
      filter.subject = subject;
    }

    let sortOption = { createdAt: -1 };
    if (sort === 'helpful') {
      sortOption = { helpfulCount: -1, createdAt: -1 };
    } else if (sort === 'views') {
      sortOption = { views: -1, createdAt: -1 };
    }

    const faqs = await FAQ.find(filter)
      .populate('resolvedBy', 'name email role')
      .sort(sortOption)
      .limit(50);

    res.json(faqs);
  } catch (err) {
    console.error('FAQ search error:', err);
    res.status(500).json({ message: 'Failed to retrieve Knowledge Base entries' });
  }
};

/**
 * POST /api/faq/:id/helpful
 * Vote helpful on an FAQ entry
 */
exports.voteHelpful = async (req, res) => {
  try {
    const faq = await FAQ.findById(req.params.id);
    if (!faq) {
      return res.status(404).json({ message: 'FAQ entry not found' });
    }

    const userId = req.user._id;
    const hasVoted = faq.helpfulVoters.some((voter) => voter.toString() === userId.toString());

    if (hasVoted) {
      faq.helpfulVoters = faq.helpfulVoters.filter((voter) => voter.toString() !== userId.toString());
      faq.helpfulCount = Math.max(0, faq.helpfulCount - 1);
    } else {
      faq.helpfulVoters.push(userId);
      faq.helpfulCount += 1;
    }

    await faq.save();
    res.json({ helpfulCount: faq.helpfulCount, hasVoted: !hasVoted });
  } catch (err) {
    console.error('FAQ vote error:', err);
    res.status(500).json({ message: 'Failed to register vote' });
  }
};

/**
 * GET /api/faq/stats
 * Return metrics for bootcamp reporting
 */
exports.getFAQStats = async (req, res) => {
  try {
    const totalEntries = await FAQ.countDocuments();
    const categories = await FAQ.aggregate([
      { $group: { _id: '$subject', count: { $sum: 1 } } },
      { $sort: { count: -1 } },
    ]);

    res.json({
      totalEntries,
      categories,
      estimatedHoursSaved: totalEntries * 1.5, // 1.5 hours saved per recurring resolved doubt
    });
  } catch (err) {
    console.error('FAQ stats error:', err);
    res.status(500).json({ message: 'Failed to retrieve stats' });
  }
};
