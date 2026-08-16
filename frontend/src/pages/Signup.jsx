import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import PageTransition from '../components/PageTransition';
import './Auth.css';

export default function Signup() {
  const { signup } = useAuth();
  const { showToast } = useToast();
  const navigate = useNavigate();

  const [form, setForm] = useState({
    name: '',
    email: '',
    password: '',
    role: 'student',
    expertise: '',
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
    setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    // Frontend validation
    if (form.password.length < 8) {
      setError('Password must be at least 8 characters long');
      setLoading(false);
      return;
    }
    if (!/\d/.test(form.password)) {
      setError('Password must contain at least one digit (e.g. Pass1234)');
      setLoading(false);
      return;
    }

    try {
      const data = {
        name: form.name.trim(),
        email: form.email.trim().toLowerCase(),
        password: form.password,
        role: form.role,
      };

      if (form.role === 'mentor' && form.expertise.trim()) {
        data.expertise = form.expertise.split(',').map((s) => s.trim()).filter(Boolean);
      }

      await signup(data);
      showToast('Account created successfully! Welcome to DoubtDesk.');
      navigate('/dashboard');
    } catch (err) {
      setError(
        err.response?.data?.message ||
        'Signup failed — please check your details and try again'
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <PageTransition>
      <div className="auth-page">
        <div className="auth-container">
          <div className="auth-card glass-panel">
            <div className="auth-card-header">
              <span className="spatial-brand-dot" />
              <span className="mono faint" style={{ fontSize: '0.75rem' }}>CREATE ACCOUNT</span>
            </div>

            <h1 className="auth-headline">Join DoubtDesk</h1>
            <p className="dim" style={{ marginBottom: '24px', fontSize: '0.95rem' }}>
              Connect with CodingMates mentors and resolve doubts faster with AI.
            </p>

            <form className="auth-form" onSubmit={handleSubmit}>
              {error && <div className="auth-error">{error}</div>}

              <div className="form-group">
                <label htmlFor="signup-name">Full Name</label>
                <input
                  id="signup-name"
                  name="name"
                  type="text"
                  placeholder="e.g. Alex Taylor"
                  value={form.name}
                  onChange={handleChange}
                  required
                  minLength={2}
                />
              </div>

              <div className="form-group">
                <label htmlFor="signup-email">Email Address</label>
                <input
                  id="signup-email"
                  name="email"
                  type="email"
                  placeholder="alex@example.com"
                  value={form.email}
                  onChange={handleChange}
                  required
                />
              </div>

              <div className="form-group">
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <label htmlFor="signup-password">Password</label>
                  <span className="faint mono" style={{ fontSize: '0.7rem' }}>Min 8 chars + 1 digit</span>
                </div>
                <input
                  id="signup-password"
                  name="password"
                  type="password"
                  placeholder="Min 8 characters (with digit)"
                  value={form.password}
                  onChange={handleChange}
                  required
                  minLength={8}
                />
              </div>

              <div className="form-group">
                <label htmlFor="signup-role">Account Type</label>
                <select
                  id="signup-role"
                  name="role"
                  value={form.role}
                  onChange={handleChange}
                >
                  <option value="student">Student (Post &amp; Track Doubts)</option>
                  <option value="mentor">Mentor (Review &amp; Resolve Doubts)</option>
                </select>
              </div>

              {form.role === 'mentor' && (
                <div className="form-group">
                  <label htmlFor="signup-expertise">Technical Stack / Expertise</label>
                  <input
                    id="signup-expertise"
                    name="expertise"
                    type="text"
                    placeholder="React, Node.js, Express, MongoDB, Python"
                    value={form.expertise}
                    onChange={handleChange}
                  />
                  <span className="expertise-hint">Comma-separated list of topics you can assist with</span>
                </div>
              )}

              <button
                type="submit"
                className="btn btn-primary auth-submit"
                disabled={loading}
              >
                {loading ? 'Creating Account...' : 'Create Account →'}
              </button>
            </form>

            <div className="auth-footer">
              <p className="dim">
                Already have an account? <Link to="/login" className="accent">Sign in</Link>
              </p>
            </div>
          </div>
        </div>
      </div>
    </PageTransition>
  );
}
