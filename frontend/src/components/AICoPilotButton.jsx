import { useState } from 'react';
import api from '../api/axios';

export default function AICoPilotButton({ contextMessage, onInsertReply }) {
  const [loading, setLoading] = useState(false);

  const handleAction = async (actionType) => {
    setLoading(true);
    try {
      const res = await api.post('/ai/explain', {
        message: contextMessage || 'React and Node async doubt',
        action: actionType,
      });
      if (res.data?.reply && onInsertReply) {
        onInsertReply(res.data.reply);
      }
    } catch (err) {
      console.error('Failed to trigger AI Co-Pilot action:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="ai-copilot-tools" style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', margin: '8px 0' }}>
      <button
        type="button"
        className="btn btn-sm btn-ai-outline"
        onClick={() => handleAction('eli5')}
        disabled={loading}
      >
        ✨ Explain Simply (ELI5)
      </button>

      <button
        type="button"
        className="btn btn-sm btn-ai-outline"
        onClick={() => handleAction('test-cases')}
        disabled={loading}
      >
        🧪 Generate Test Cases
      </button>

      <button
        type="button"
        className="btn btn-sm btn-ai-outline"
        onClick={() => handleAction('optimize')}
        disabled={loading}
      >
        ⚡ Optimize Solution
      </button>
    </div>
  );
}
