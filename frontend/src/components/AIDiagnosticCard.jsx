import { useState, useEffect } from 'react';
import api from '../api/axios';
import './AIDiagnosticCard.css';

export default function AIDiagnosticCard({ doubt, onApplySolution }) {
  const [analysis, setAnalysis] = useState(null);
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('diff'); // 'root', 'diff', 'steps'
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (!doubt || !doubt.title) return;

    let isMounted = true;
    const fetchAIAnalysis = async () => {
      setLoading(true);
      try {
        const res = await api.post('/ai/analyze', {
          title: doubt.title,
          subject: doubt.subject,
          description: doubt.description,
        });
        if (isMounted) {
          setAnalysis(res.data);
        }
      } catch (err) {
        console.error('Failed to run AI analysis:', err);
      } finally {
        if (isMounted) setLoading(false);
      }
    };

    fetchAIAnalysis();
    return () => { isMounted = false; };
  }, [doubt?._id]);

  const handleCopyFix = () => {
    if (!analysis?.afterCode) return;
    navigator.clipboard.writeText(analysis.afterCode);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  if (loading) {
    return (
      <div className="ai-card glass-panel ai-card--loading">
        <div className="ai-card__loading-header">
          <div className="ai-pulse-dot" />
          <span className="ai-loading-text">
            ✨ AI Co-Pilot analyzing root cause & generating code fix...
          </span>
        </div>
        <div className="skeleton" style={{ height: '80px', marginTop: '16px' }} />
      </div>
    );
  }

  if (!analysis) return null;

  return (
    <div className="ai-card glass-panel">
      {/* Header Bar */}
      <div className="ai-card__header">
        <div className="ai-card__title-group">
          <div className="ai-badge">
            <span>✨</span> AI First-Responder
          </div>
          <span className="ai-card__model-tag mono">
            {analysis.model || 'DoubtDesk Neural AI'} · {analysis.confidence || '98%'} Match
          </span>
        </div>

        <button
          className="btn btn-sm btn-ai-outline"
          onClick={handleCopyFix}
          title="Copy fixed code snippet"
        >
          {copied ? '✓ Copied' : 'Copy Solution'}
        </button>
      </div>

      {/* Tabs */}
      <div className="ai-card__tabs">
        <button
          className={`ai-tab ${activeTab === 'diff' ? 'ai-tab--active' : ''}`}
          onClick={() => setActiveTab('diff')}
        >
          💡 Code Fix &amp; Diff
        </button>
        <button
          className={`ai-tab ${activeTab === 'root' ? 'ai-tab--active' : ''}`}
          onClick={() => setActiveTab('root')}
        >
          🔍 Root Cause Analysis
        </button>
        <button
          className={`ai-tab ${activeTab === 'steps' ? 'ai-tab--active' : ''}`}
          onClick={() => setActiveTab('steps')}
        >
          ⚡ Action Checklist ({analysis.suggestions?.length || 0})
        </button>
      </div>

      {/* Tab Contents */}
      <div className="ai-card__content">
        {/* Tab 1: Code Diff */}
        {activeTab === 'diff' && (
          <div className="ai-diff-container">
            <div className="ai-diff-pane ai-diff-pane--before">
              <div className="ai-diff-label mono">❌ Problematic Code</div>
              <pre className="ai-code-block mono">
                <code>{analysis.beforeCode}</code>
              </pre>
            </div>

            <div className="ai-diff-pane ai-diff-pane--after">
              <div className="ai-diff-label ai-diff-label--fixed mono">
                ✅ Recommended Fix
              </div>
              <pre className="ai-code-block ai-code-block--fixed mono">
                <code>{analysis.afterCode}</code>
              </pre>
            </div>
          </div>
        )}

        {/* Tab 2: Root Cause */}
        {activeTab === 'root' && (
          <div className="ai-root-content">
            <h4 className="ai-root-title">{analysis.rootCause}</h4>
            <p className="ai-root-explanation">{analysis.explanation}</p>
          </div>
        )}

        {/* Tab 3: Action Steps */}
        {activeTab === 'steps' && (
          <ul className="ai-suggestions-list">
            {analysis.suggestions?.map((item, idx) => (
              <li key={idx} className="ai-suggestion-item">
                <span className="ai-step-num mono">{idx + 1}</span>
                <span>{item}</span>
              </li>
            ))}
          </ul>
        )}
      </div>

      {/* Footer Info */}
      <div className="ai-card__footer">
        <span className="ai-footer-note">
          Generated automatically while your doubt waits for a human mentor review.
        </span>
        {onApplySolution && (
          <button
            className="btn btn-sm btn-ai"
            onClick={() => onApplySolution(analysis.afterCode)}
          >
            Insert Solution in Reply ↓
          </button>
        )}
      </div>
    </div>
  );
}
