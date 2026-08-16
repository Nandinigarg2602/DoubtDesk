import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import PageTransition from '../components/PageTransition';
import './Auth.css';

export default function Login() {
  const { login } = useAuth();
  const { showToast } = useToast();
  const navigate = useNavigate();

  const [form, setForm] = useState({ email: '', password: '' });
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

    try {
      const cleanEmail = form.email.trim().toLowerCase();
      await login(cleanEmail, form.password);
      showToast('Welcome back! Logged in successfully.');
      navigate('/dashboard');
    } catch (err) {
      setError(
        err.response?.data?.message ||
        'Login failed — please verify your email and password'
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
              <span className="mono faint" style={{ fontSize: '0.75rem' }}>DOUBTDESK AUTH GATEWAY</span>
            </div>

            <h1 className="auth-headline">Sign In</h1>
            <p className="dim" style={{ marginBottom: '24px', fontSize: '0.95rem' }}>
              Access your student doubt tracker or mentor resolution queue.
            </p>

            <form className="auth-form" onSubmit={handleSubmit}>
              {error && <div className="auth-error">{error}</div>}

              <div className="form-group">
                <label htmlFor="login-email">Email Address</label>
                <input
                  id="login-email"
                  name="email"
                  type="email"
                  placeholder="your.email@example.com"
                  value={form.email}
                  onChange={handleChange}
                  required
                />
              </div>

              <div className="form-group">
                <label htmlFor="login-password">Password</label>
                <input
                  id="login-password"
                  name="password"
                  type="password"
                  placeholder="Enter your password"
                  value={form.password}
                  onChange={handleChange}
                  required
                />
              </div>

              <button
                type="submit"
                className="btn btn-primary auth-submit"
                disabled={loading}
              >
                {loading ? 'Authenticating...' : 'Sign In →'}
              </button>
            </form>

            <div className="auth-footer">
              <p className="dim">
                New to CodingMates? <Link to="/signup" className="accent">Create an account</Link>
              </p>
            </div>
          </div>
        </div>
      </div>
    </PageTransition>
  );
}
