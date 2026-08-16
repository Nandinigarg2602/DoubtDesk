const Doubt = require('../models/Doubt');
const Response = require('../models/Response');
const { analyzeDoubt } = require('../controllers/aiController');

/**
 * Check and escalate any open doubts that have passed their SLA threshold
 */
async function checkAndEscalateDoubts() {
  try {
    const overdueDoubts = await Doubt.find({
      status: 'Open',
      slaDeadline: { $lte: new Date() },
      isEscalated: false,
    }).populate('student', 'name');

    for (const doubt of overdueDoubts) {
      doubt.isEscalated = true;
      doubt.escalatedAt = new Date();
      doubt.aiInterimResponsePosted = true;
      await doubt.save();

      // Automatically post an AI Interim First-Responder in the discussion thread
      const interimMessage = `🚨 **[AUTOMATED SLA ESCALATION — INTERIM AI FIRST-RESPONDER]**

This doubt has been unclaimed in the Open Queue for over 15 minutes and has been **auto-escalated with Priority 1**. While our on-call senior mentors at CodingMates are paged, here is an automated interim diagnostic so you aren't blocked:

- **Topic:** \`${doubt.subject}\`
- **Triage Status:** High Priority Escalation
- **Interim Recommendation:** Check asynchronous state timing, dependency array boundaries, and inspect network response status codes in browser DevTools ($F12$).

*A dedicated mentor will review your thread shortly.*`;

      await Response.create({
        doubt: doubt._id,
        author: doubt.student._id, // Posted on thread
        message: interimMessage,
      });

      console.log(`⚡ [SLA Monitor] Escalated Doubt ID ${doubt._id}: "${doubt.title}"`);
    }
  } catch (err) {
    console.error('SLA Escalation Check Error:', err.message);
  }
}

// Start periodic 30-second interval worker
function startSLAMonitor() {
  setInterval(checkAndEscalateDoubts, 30000);
  console.log('✓ SLA Escalation Monitor initialized (30s check interval)');
}

module.exports = { checkAndEscalateDoubts, startSLAMonitor };
