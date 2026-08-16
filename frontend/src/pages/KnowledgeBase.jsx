import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../api/axios';
import { useToast } from '../context/ToastContext';
import PageTransition from '../components/PageTransition';
import './KnowledgeBase.css';

const SUBJECTS = ['All', 'React', 'Node.js', 'Express', 'MongoDB', 'JavaScript', 'Python'];

export default function KnowledgeBase() {
  const { showToast } = useToast();
  const [faqs, setFaqs] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [selectedSubject, setSelectedSubject] = useState('All');
  const [sortBy, setSortBy] = useState('recent');

  const fetchFAQs = async () => {
    setLoading(true);
    try {
      const params = {
        sort: sortBy,
      };
      if (search.trim()) params.q = search.trim();
      if (selectedSubject !== 'All') params.subject = selectedSubject;

      const [faqRes, statsRes] = await Promise.all([
        api.get('/faq', { params }),
        api.get('/faq/stats'),
      ]);

      setFaqs(faqRes.data);
      setStats(statsRes.data);
    } catch (err) {
      console.error('Failed to load Knowledge Base:', err);
      showToast('Could not load knowledge base entries');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchFAQs();
  }, [selectedSubject, sortBy]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    fetchFAQs();
  };

  const handleVoteHelpful = async (faqId) => {
    try {
      const res = await api.post(`/faq/${faqId}/helpful`);
      setFaqs((prev) =>
        prev.map((f) =>
          f._id === faqId
            ? { ...f, helpfulCount: res.data.helpfulCount, hasVoted: res.data.hasVoted }
            : f
        )
      );
      showToast(res.data.hasVoted ? 'Marked as helpful! 👍' : 'Vote removed');
    } catch (err) {
      showToast('Failed to vote');
    }
  };

  return (
    <PageTransition>
      <div className="kb-page">
        <div className="kb-container">
          {/* Header Section */}
          <div className="kb-header glass-panel">
            <div className="kb-badge">
              <span className="spatial-brand-dot" />
              <span>SELF-GROWING KNOWLEDGE REPOSITORY</span>
            </div>
            <h1 className="kb-title">CodingMates Knowledge Base</h1>
            <p className="kb-subtitle">
              Every time a doubt is solved by a mentor, it automatically archives here as a verified FAQ.
              Search past solutions and ship without waiting.
            </p>

            {/* Metrics Bar */}
            {stats && (
              <div className="kb-stats-row mono">
                <div className="kb-stat-pill">
                  <span className="accent">{stats.totalEntries}</span> Verified Solutions
                </div>
                <div className="kb-stat-pill">
                  <span className="accent">~{stats.estimatedHoursSaved}h</span> Dev Time Saved
                </div>
                <div className="kb-stat-pill">
                  <span>⚡ Real-Time Auto-Indexing</span>
                </div>
              </div>
            )}

            {/* Search Input */}
            <form className="kb-search-form" onSubmit={handleSearchSubmit}>
              <input
                type="text"
                className="kb-search-input"
                placeholder="Search error messages, hooks, tokens, database queries..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
              <button type="submit" className="btn btn-primary kb-search-btn">
                Search FAQs 🔍
              </button>
            </form>

            {/* Filter Pills */}
            <div className="kb-filter-row">
              <div className="kb-subject-pills">
                {SUBJECTS.map((subj) => (
                  <button
                    key={subj}
                    type="button"
                    className={`kb-pill ${selectedSubject === subj ? 'kb-pill--active' : ''}`}
                    onClick={() => setSelectedSubject(subj)}
                  >
                    {subj}
                  </button>
                ))}
              </div>

              <select
                className="kb-sort-select"
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
              >
                <option value="recent">Most Recent</option>
                <option value="helpful">Most Helpful 👍</option>
              </select>
            </div>
          </div>

          {/* FAQ List */}
          {loading ? (
            <div className="kb-loading glass-panel mono dim">
              Indexing knowledge entries...
            </div>
          ) : faqs.length === 0 ? (
            <div className="kb-empty glass-panel text-center">
              <div style={{ fontSize: '2.5rem', marginBottom: '12px' }}>📚</div>
              <h3>No FAQ entries found for this filter</h3>
              <p className="dim" style={{ maxWidth: '440px', margin: '8px auto 20px auto' }}>
                As bootcamp doubts are resolved by mentors, they are instantly synthesized and indexed here!
              </p>
              <Link to="/dashboard">
                <button className="btn btn-primary">Go to Doubt Queue →</button>
              </Link>
            </div>
          ) : (
            <div className="kb-grid">
              {faqs.map((faq) => (
                <div key={faq._id} className="kb-card glass-panel">
                  <div className="kb-card-header">
                    <span className="subject-tag">{faq.subject}</span>
                    <span className="status-badge resolved">✓ Auto-Archived</span>
                  </div>

                  <h3 className="kb-card-title">{faq.title}</h3>

                  <div className="kb-card-section">
                    <span className="kb-section-label mono faint">PROBLEM CONTEXT</span>
                    <p className="kb-card-desc">{faq.problemSummary}</p>
                  </div>

                  <div className="kb-card-section kb-card-section--solution">
                    <span className="kb-section-label mono accent">VERIFIED RESOLUTION</span>
                    <div className="kb-solution-box mono">{faq.solution}</div>
                  </div>

                  <div className="kb-card-footer">
                    <div className="kb-author-meta dim" style={{ fontSize: '0.8rem' }}>
                      Resolved by {faq.resolvedBy?.name || 'CodingMates Mentor'}
                    </div>

                    <button
                      type="button"
                      className={`kb-helpful-btn ${faq.hasVoted ? 'kb-helpful-btn--voted' : ''}`}
                      onClick={() => handleVoteHelpful(faq._id)}
                    >
                      👍 Helpful ({faq.helpfulCount})
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </PageTransition>
  );
}
