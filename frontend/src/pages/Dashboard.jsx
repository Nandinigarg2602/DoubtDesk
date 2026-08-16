import { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import api from '../api/axios';
import StatCounter from '../components/StatCounter';
import DoubtCard from '../components/DoubtCard';
import SkeletonCard from '../components/SkeletonCard';
import PageTransition from '../components/PageTransition';
import './Dashboard.css';

export default function Dashboard() {
  const { user } = useAuth();
  const { showToast } = useToast();

  const [doubts, setDoubts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('');
  const [showSkeleton, setShowSkeleton] = useState(false);

  // Post doubt form (student only)
  const [form, setForm] = useState({ title: '', subject: '', description: '' });
  const [posting, setPosting] = useState(false);
  const [formError, setFormError] = useState('');

  // 🌟 AI Live Similar Doubts Matcher
  const [similarDoubts, setSimilarDoubts] = useState([]);
  const [searchingSimilar, setSearchingSimilar] = useState(false);

  const firstName = user?.name?.split(' ')[0] || 'User';

  const fetchDoubts = useCallback(async () => {
    try {
      const params = {};
      if (statusFilter) params.status = statusFilter;
      const res = await api.get('/doubts', { params });
      setDoubts(res.data);
    } catch (err) {
      console.error('Failed to fetch doubts:', err);
    } finally {
      setLoading(false);
    }
  }, [statusFilter]);

  useEffect(() => {
    fetchDoubts();
  }, [fetchDoubts]);

  // Live search similar resolved doubts on title change
  useEffect(() => {
    if (!form.title || form.title.length < 4) {
      setSimilarDoubts([]);
      return;
    }

    const delayDebounce = setTimeout(async () => {
      setSearchingSimilar(true);
      try {
        const res = await api.get('/ai/similar', {
          params: { q: form.title, subject: form.subject },
        });
        setSimilarDoubts(res.data || []);
      } catch (err) {
        console.error('Failed to search similar doubts:', err);
      } finally {
        setSearchingSimilar(false);
      }
    }, 400);

    return () => clearTimeout(delayDebounce);
  }, [form.title, form.subject]);

  // Stats
  const stats = {
    open: doubts.filter((d) => d.status === 'Open').length,
    progress: doubts.filter((d) => d.status === 'In Progress').length,
    resolved: doubts.filter((d) => d.status === 'Resolved').length,
  };

  const handleFormChange = (e) => {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
    setFormError('');
  };

  const handlePostDoubt = async (e) => {
    e.preventDefault();
    setPosting(true);
    setFormError('');
    setShowSkeleton(true);

    try {
      await api.post('/doubts', form);
      showToast('✨ Doubt submitted — AI First-Responder is analyzing...');
      setForm({ title: '', subject: '', description: '' });
      setSimilarDoubts([]);

      setTimeout(async () => {
        await fetchDoubts();
        setShowSkeleton(false);
      }, 500);
    } catch (err) {
      setFormError(err.response?.data?.message || 'Failed to post doubt');
      setShowSkeleton(false);
    } finally {
      setPosting(false);
    }
  };

  const handleAssign = async (doubtId) => {
    try {
      await api.put(`/doubts/${doubtId}/assign`);
      showToast('Doubt claimed successfully');
      fetchDoubts();
    } catch (err) {
      showToast(`Error: ${err.response?.data?.message || 'Failed to claim doubt'}`);
    }
  };

  return (
    <PageTransition>
      <div className="dashboard">
        <div className="container">
          {/* Welcome Banner */}
          <div className="dashboard__header">
            <h1 className="dashboard__title">
              Welcome back, {firstName}
            </h1>
            <p className="dashboard__subtitle">
              {user?.role === 'mentor'
                ? 'Manage active doubt resolution queues and assist students with code roadblocks.'
                : 'Ask technical questions, get instant AI code analysis, and work with expert mentors.'}
            </p>
          </div>

          {/* Stats Bar */}
          <div className="dashboard__stats glass-panel">
            <StatCounter label="Open Doubts" value={stats.open} color="var(--status-open)" />
            <div className="stat-divider" />
            <StatCounter label="In Progress" value={stats.progress} color="var(--status-progress)" />
            <div className="stat-divider" />
            <StatCounter label="Resolved Doubts" value={stats.resolved} color="var(--status-resolved)" />
          </div>

          {/* Post Doubt Form (Student Only) */}
          {user?.role === 'student' && (
            <div className="dashboard__post glass-panel">
              <div className="dashboard__post-header">
                <div>
                  <h3 className="dashboard__section-title">Ask a Coding Doubt</h3>
                  <p className="dim" style={{ fontSize: '0.9rem' }}>
                    Includes instant AI root-cause analysis and queued human mentor resolution.
                  </p>
                </div>
                <div className="ai-badge">
                  <span>✨</span> AI Co-Pilot Active
                </div>
              </div>

              <form onSubmit={handlePostDoubt} style={{ marginTop: '20px' }}>
                {formError && <div className="auth-error">{formError}</div>}

                <div className="dashboard__form-row">
                  <div className="form-group" style={{ flex: 2 }}>
                    <label htmlFor="doubt-title">Question Summary</label>
                    <input
                      id="doubt-title"
                      name="title"
                      placeholder="e.g. Infinite re-render loop inside async useEffect handler"
                      value={form.title}
                      onChange={handleFormChange}
                      required
                      minLength={3}
                      maxLength={140}
                    />
                  </div>

                  <div className="form-group" style={{ flex: 1 }}>
                    <label htmlFor="doubt-subject">Topic / Tech Stack</label>
                    <input
                      id="doubt-subject"
                      name="subject"
                      placeholder="React, Node.js, Express, MongoDB..."
                      value={form.subject}
                      onChange={handleFormChange}
                      required
                      minLength={2}
                      maxLength={60}
                    />
                  </div>
                </div>

                {/* 🌟 Live Similar Doubts Preview */}
                {similarDoubts.length > 0 && (
                  <div className="similar-doubts-box">
                    <div className="similar-doubts-header">
                      <span className="mono" style={{ fontSize: '0.8rem', color: '#10b981', fontWeight: 600 }}>
                        ⚡ {similarDoubts.length} Similar Solved Doubt(s) Found:
                      </span>
                    </div>
                    <div className="similar-doubts-list">
                      {similarDoubts.map((sim) => (
                        <Link
                          key={sim._id}
                          to={`/doubts/${sim._id}`}
                          className="similar-doubt-item"
                        >
                          <span className="subject-tag">{sim.subject}</span>
                          <span className="similar-doubt-title">{sim.title}</span>
                          <span className="status-badge resolved" style={{ marginLeft: 'auto', fontSize: '0.7rem' }}>
                            ✓ Solved
                          </span>
                        </Link>
                      ))}
                    </div>
                  </div>
                )}

                <div className="form-group">
                  <label htmlFor="doubt-description">Detailed Description &amp; Code Snippet</label>
                  <textarea
                    id="doubt-description"
                    name="description"
                    placeholder="Describe what you are trying to accomplish, the exact error messages, and paste any relevant code..."
                    value={form.description}
                    onChange={handleFormChange}
                    required
                    minLength={10}
                    maxLength={4000}
                    rows={4}
                  />
                </div>

                <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
                  <button
                    type="submit"
                    className="btn btn-primary"
                    disabled={posting}
                  >
                    {posting ? 'Submitting & Analyzing...' : 'Submit Doubt →'}
                  </button>
                </div>
              </form>
            </div>
          )}

          {/* Doubt List Header & Filter */}
          <div className="dashboard__list-header">
            <div>
              <h3 className="dashboard__section-title">
                {user?.role === 'student' ? 'Your Submitted Doubts' : 'Live Mentor Resolution Queue'}
              </h3>
              <p className="dim" style={{ fontSize: '0.9rem' }}>
                {user?.role === 'student'
                  ? 'Track your questions, review AI diagnostics, and chat with mentors.'
                  : 'Claim open doubts matching your expertise and guide students.'}
              </p>
            </div>

            <div className="dashboard__filter-wrapper">
              <select
                className="dashboard__filter"
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
              >
                <option value="">All Statuses</option>
                <option value="Open">Open</option>
                <option value="In Progress">In Progress</option>
                <option value="Resolved">Resolved</option>
              </select>
            </div>
          </div>

          {/* Doubt Cards Grid */}
          <div className="dashboard__doubts">
            {loading ? (
              <>
                <SkeletonCard />
                <SkeletonCard />
                <SkeletonCard />
              </>
            ) : showSkeleton ? (
              <>
                <SkeletonCard />
                {doubts.map((d, i) => (
                  <DoubtCard key={d._id} doubt={d} index={i + 1} />
                ))}
              </>
            ) : doubts.length === 0 ? (
              <div className="dashboard__empty glass-panel">
                <p className="dim text-center">
                  {user?.role === 'student'
                    ? 'You have not submitted any doubts yet. Use the form above to post your first question.'
                    : 'No doubts currently in the queue for this filter.'}
                </p>
              </div>
            ) : (
              doubts.map((d, i) => (
                <div key={d._id} className="dashboard__doubt-wrapper">
                  <DoubtCard doubt={d} index={i} />
                  {user?.role === 'mentor' && d.status === 'Open' && (
                    <div className="dashboard__card-action">
                      <button
                        className="btn btn-sm btn-primary"
                        onClick={(e) => {
                          e.preventDefault();
                          handleAssign(d._id);
                        }}
                      >
                        Claim Doubt
                      </button>
                    </div>
                  )}
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </PageTransition>
  );
}
