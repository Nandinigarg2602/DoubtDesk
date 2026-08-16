import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import api from '../api/axios';
import StatusStepper from '../components/StatusStepper';
import AIDiagnosticCard from '../components/AIDiagnosticCard';
import AICoPilotButton from '../components/AICoPilotButton';
import PageTransition from '../components/PageTransition';
import './DoubtDetail.css';

export default function DoubtDetail() {
  const { id } = useParams();
  const { user } = useAuth();
  const { showToast } = useToast();

  const [doubt, setDoubt] = useState(null);
  const [responses, setResponses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [replyMsg, setReplyMsg] = useState('');
  const [replying, setReplying] = useState(false);

  // Student resolution review state
  const [rating, setRating] = useState(5);
  const [rejectComment, setRejectComment] = useState('');
  const [showRejectForm, setShowRejectForm] = useState(false);
  const [submittingReview, setSubmittingReview] = useState(false);

  const fetchDoubt = async () => {
    try {
      const res = await api.get(`/doubts/${id}`);
      setDoubt(res.data);
    } catch (err) {
      console.error('Failed to fetch doubt:', err);
    }
  };

  const fetchResponses = async () => {
    try {
      const res = await api.get(`/responses/${id}`);
      setResponses(res.data);
    } catch (err) {
      console.error('Failed to fetch responses:', err);
    }
  };

  useEffect(() => {
    const load = async () => {
      await Promise.all([fetchDoubt(), fetchResponses()]);
      setLoading(false);
    };
    load();
  }, [id]);

  const handleAssign = async () => {
    try {
      const res = await api.put(`/doubts/${id}/assign`);
      setDoubt(res.data);
      showToast('Doubt claimed successfully');
    } catch (err) {
      showToast(`Error: ${err.response?.data?.message || 'Failed to claim'}`);
    }
  };

  const handleProposeResolution = async () => {
    try {
      const res = await api.put(`/doubts/${id}/propose-resolution`);
      setDoubt(res.data);
      await fetchResponses();
      showToast('Solution proposed! Awaiting student verification sign-off.');
    } catch (err) {
      showToast(`Error: ${err.response?.data?.message || 'Failed to propose solution'}`);
    }
  };

  const handleVerifyResolution = async (satisfied) => {
    setSubmittingReview(true);
    try {
      const payload = {
        satisfied,
        rating: satisfied ? rating : undefined,
        comment: satisfied ? 'Solution confirmed working by student.' : rejectComment,
      };

      const res = await api.put(`/doubts/${id}/verify-resolution`, payload);
      setDoubt(res.data);
      await fetchResponses();

      if (satisfied) {
        showToast('✓ Solution accepted! Marked as Resolved and indexed to Knowledge Base.');
      } else {
        setShowRejectForm(false);
        setRejectComment('');
        showToast('⚠️ Clarification request sent to mentor. Ticket remains In Progress.');
      }
    } catch (err) {
      showToast(`Error: ${err.response?.data?.message || 'Verification update failed'}`);
    } finally {
      setSubmittingReview(false);
    }
  };

  const handleReply = async (e) => {
    e.preventDefault();
    if (!replyMsg.trim()) return;

    setReplying(true);
    try {
      const res = await api.post(`/responses/${id}`, { message: replyMsg });
      setResponses((prev) => [...prev, res.data]);
      setReplyMsg('');
      showToast('Reply posted');
    } catch (err) {
      showToast(`Error: ${err.response?.data?.message || 'Failed to reply'}`);
    } finally {
      setReplying(false);
    }
  };

  const handleInsertAISolution = (codeSnippet) => {
    setReplyMsg((prev) => (prev ? `${prev}\n\n${codeSnippet}` : codeSnippet));
    showToast('AI snippet inserted into reply box');
  };

  if (loading) {
    return (
      <div className="detail-loading">
        <div className="skeleton" style={{ width: '200px', height: '24px', marginBottom: '16px' }} />
        <div className="skeleton" style={{ width: '400px', height: '32px' }} />
      </div>
    );
  }

  if (!doubt) {
    return (
      <div className="detail-loading">
        <h3>Doubt not found</h3>
        <Link to="/dashboard" className="btn btn-sm" style={{ marginTop: '16px' }}>
          ← Back to Dashboard
        </Link>
      </div>
    );
  }

  const statusClass =
    doubt.status === 'Open'
      ? 'open'
      : doubt.status === 'In Progress'
      ? 'in-progress'
      : 'resolved';

  const isStudentOwner =
    user?.role === 'student' &&
    (doubt.student?._id === user._id || doubt.student === user._id);

  const isAssignedMentor =
    user?.role === 'mentor' &&
    (doubt.assignedMentor?._id === user._id || doubt.assignedMentor === user._id);

  return (
    <PageTransition>
      <div className="detail">
        <div className="container container--narrow">
          <Link to="/dashboard" className="detail__back">
            ← Back to Dashboard
          </Link>

          {/* SLA Escalation Alert Banner */}
          {doubt.isEscalated && doubt.status === 'Open' && (
            <div className="detail__sla-banner glass-panel" style={{
              background: 'linear-gradient(135deg, rgba(40, 10, 15, 0.9) 0%, rgba(20, 10, 20, 0.9) 100%)',
              border: '1px solid rgba(239, 68, 68, 0.5)',
              padding: '16px 20px',
              borderRadius: 'var(--radius-sm)',
              marginBottom: '20px',
              display: 'flex',
              alignItems: 'center',
              gap: '14px',
            }}>
              <span style={{ fontSize: '1.6rem' }}>🔥</span>
              <div>
                <strong style={{ color: '#f87171', display: 'block', fontSize: '0.95rem' }}>
                  AUTOMATED RESPONSE-TIME SLA ESCALATION
                </strong>
                <span className="dim" style={{ fontSize: '0.85rem' }}>
                  This ticket has been unclaimed past the 15-minute threshold. Priority has been elevated, and an automated interim AI response was posted below.
                </span>
              </div>
            </div>
          )}

          {/* Main Doubt Header Card */}
          <div className="detail__header glass-panel">
            <div className="detail__meta">
              <span className="subject-tag">{doubt.subject}</span>
              <span className={`status-badge ${statusClass}`}>{doubt.status}</span>
            </div>

            <h1 className="detail__title">{doubt.title}</h1>

            <p className="detail__author dim">
              Posted by <strong style={{ color: '#fff' }}>{doubt.student?.name || 'Student'}</strong>
              <span className="faint"> · {new Date(doubt.createdAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}</span>
            </p>

            {/* Status Stepper */}
            <div style={{ margin: '20px 0 10px 0' }}>
              <StatusStepper currentStatus={doubt.status} />
            </div>

            {/* Description */}
            <div className="detail__description">
              <p>{doubt.description}</p>
            </div>

            {/* Mentor Actions */}
            {user?.role === 'mentor' && (
              <div className="detail__actions">
                {doubt.status === 'Open' && (
                  <button className="btn btn-primary" onClick={handleAssign}>
                    Claim This Doubt as Mentor
                  </button>
                )}
                {doubt.status === 'In Progress' && (
                  <button
                    className="btn btn-primary"
                    onClick={handleProposeResolution}
                    disabled={doubt.resolutionProposed}
                  >
                    {doubt.resolutionProposed
                      ? '⏳ Solution Proposed (Awaiting Student Sign-Off)'
                      : '📋 Propose Solution & Request Student Sign-Off'}
                  </button>
                )}
              </div>
            )}

            {doubt.assignedMentor && (
              <div className="detail__assigned">
                Assigned Mentor: <span className="accent" style={{ fontWeight: 600 }}>{doubt.assignedMentor.name}</span>
              </div>
            )}
          </div>

          {/* 🌟 Student Satisfaction Sign-Off Banner (Guarantees solution meets expectations before resolving) */}
          {isStudentOwner && doubt.status === 'In Progress' && (
            <div className="student-signoff-card glass-panel" style={{
              border: '1px solid rgba(59, 130, 246, 0.4)',
              background: 'linear-gradient(135deg, rgba(15, 23, 42, 0.95) 0%, rgba(20, 30, 55, 0.9) 100%)',
              padding: '24px',
              borderRadius: 'var(--radius)',
              marginBottom: '24px',
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '10px' }}>
                <span style={{ fontSize: '1.4rem' }}>🛡️</span>
                <div>
                  <h3 style={{ fontSize: '1.15rem', color: '#ffffff', margin: 0 }}>
                    Student Quality Assurance &amp; Resolution Sign-Off
                  </h3>
                  <span className="dim" style={{ fontSize: '0.8rem' }}>
                    Has the mentor's solution fully solved your doubt to your satisfaction?
                  </span>
                </div>
              </div>

              {!showRejectForm ? (
                <div style={{ marginTop: '16px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '16px' }}>
                    <span className="dim" style={{ fontSize: '0.85rem' }}>Rate Solution Quality:</span>
                    <div style={{ display: 'flex', gap: '6px' }}>
                      {[1, 2, 3, 4, 5].map((star) => (
                        <button
                          key={star}
                          type="button"
                          onClick={() => setRating(star)}
                          style={{
                            background: 'none',
                            border: 'none',
                            cursor: 'pointer',
                            fontSize: '1.3rem',
                            color: star <= rating ? '#fbbf24' : '#475569',
                            padding: 0,
                          }}
                        >
                          ★
                        </button>
                      ))}
                    </div>
                  </div>

                  <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
                    <button
                      type="button"
                      className="btn btn-success"
                      onClick={() => handleVerifyResolution(true)}
                      disabled={submittingReview}
                    >
                      {submittingReview ? 'Processing...' : '✓ Yes, Fully Solved (Accept & Mark Resolved)'}
                    </button>
                    <button
                      type="button"
                      className="btn"
                      style={{ background: 'rgba(239, 68, 68, 0.15)', borderColor: 'rgba(239, 68, 68, 0.4)', color: '#f87171' }}
                      onClick={() => setShowRejectForm(true)}
                      disabled={submittingReview}
                    >
                      ✕ Not Satisfied (Request Clarification)
                    </button>
                  </div>
                </div>
              ) : (
                <div style={{ marginTop: '16px' }}>
                  <label htmlFor="reject-reason" style={{ fontSize: '0.85rem', color: '#f87171', display: 'block', marginBottom: '8px' }}>
                    What is still unclear or not working? (Mentor will be required to explain further)
                  </label>
                  <textarea
                    id="reject-reason"
                    placeholder="e.g. I tried the suggested fix, but I am still getting a TypeError on line 14 when submitting the form..."
                    value={rejectComment}
                    onChange={(e) => setRejectComment(e.target.value)}
                    rows={3}
                    style={{ width: '100%', marginBottom: '12px' }}
                  />
                  <div style={{ display: 'flex', gap: '10px' }}>
                    <button
                      type="button"
                      className="btn btn-primary"
                      onClick={() => handleVerifyResolution(false)}
                      disabled={submittingReview || !rejectComment.trim()}
                    >
                      Submit Clarification Request
                    </button>
                    <button
                      type="button"
                      className="btn"
                      onClick={() => setShowRejectForm(false)}
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* 🌟 WOW Feature: AI First-Responder & Code Diff Diagnostic Card (Student Only) */}
          {user?.role === 'student' && (
            <AIDiagnosticCard
              doubt={doubt}
              onApplySolution={handleInsertAISolution}
            />
          )}

          {/* Discussion Thread */}
          <div className="detail__thread">
            <h3 className="detail__thread-title">
              Discussion &amp; Solution ({responses.length})
            </h3>

            {responses.length === 0 ? (
              <div className="detail__no-replies glass-panel">
                <p className="dim text-center">
                  No replies yet. {user?.role === 'student' ? 'The AI First-Responder above provided an instant analysis, and a human mentor will review shortly.' : 'Review the doubt description above and post your mentor guidance below.'}
                </p>
              </div>
            ) : (
              <div className="detail__replies">
                {responses.map((r, i) => {
                  const isInterimAI = r.message?.includes('AUTOMATED SLA ESCALATION');
                  return (
                    <div
                      key={r._id}
                      className={`detail__reply glass-panel ${isInterimAI ? 'detail__reply--interim-ai' : ''}`}
                      style={{
                        animationDelay: `${i * 0.05}s`,
                        borderColor: isInterimAI ? 'rgba(239, 68, 68, 0.4)' : undefined,
                        background: isInterimAI ? 'rgba(30, 15, 25, 0.8)' : undefined,
                      }}
                    >
                      <div className="detail__reply-header">
                        <strong className="detail__reply-name">
                          {isInterimAI ? '🤖 DoubtDesk SLA Interim Bot' : (r.author?.name || 'User')}
                        </strong>
                        <span className={`role-badge ${isInterimAI ? 'admin' : (r.author?.role || '')}`}>
                          {isInterimAI ? 'AI Interim' : r.author?.role}
                        </span>
                        <span className="detail__reply-time faint mono">
                          {new Date(r.createdAt).toLocaleTimeString([], {
                            hour: '2-digit',
                            minute: '2-digit',
                          })}
                        </span>
                      </div>
                      <div className="detail__reply-message">
                        <p style={{ whiteSpace: 'pre-wrap' }}>{r.message}</p>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}

            {/* Reply Input Form */}
            {doubt.status !== 'Resolved' && (
              <form className="detail__reply-form glass-panel" onSubmit={handleReply}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', width: '100%' }}>
                  <label htmlFor="doubt-reply-input" style={{ margin: 0, fontWeight: 600 }}>
                    Add Your Reply
                  </label>
                  <span className="faint mono" style={{ fontSize: '0.75rem' }}>Markdown supported</span>
                </div>

                {/* AI Co-Pilot One-Click Helper Triggers (Student only) */}
                {user?.role === 'student' && (
                  <AICoPilotButton
                    contextMessage={`${doubt.title}: ${doubt.description}`}
                    onInsertReply={handleInsertAISolution}
                  />
                )}

                <textarea
                  id="doubt-reply-input"
                  placeholder="Explain the solution, provide code snippets, or ask for clarification..."
                  value={replyMsg}
                  onChange={(e) => setReplyMsg(e.target.value)}
                  required
                  minLength={1}
                  maxLength={4000}
                  rows={4}
                />

                <div style={{ display: 'flex', justifyContent: 'flex-end', width: '100%' }}>
                  <button
                    type="submit"
                    className="btn btn-primary"
                    disabled={replying || !replyMsg.trim()}
                  >
                    {replying ? 'Posting...' : 'Post Reply'}
                  </button>
                </div>
              </form>
            )}

            {doubt.status === 'Resolved' && (
              <div className="detail__resolved-banner glass-panel">
                <span className="status-badge resolved">✓ Resolved &amp; Verified by Student</span>
                <span className="dim"> This doubt is solved to student expectation and auto-indexed into the <Link to="/faq" className="accent" style={{ textDecoration: 'underline' }}>Knowledge Base FAQ</Link>.</span>
              </div>
            )}
          </div>
        </div>
      </div>
    </PageTransition>
  );
}
