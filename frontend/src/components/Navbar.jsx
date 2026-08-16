import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import './Navbar.css';

export default function Navbar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  // Don't render redundant navbar on auth pages (/login, /signup)
  if (location.pathname === '/login' || location.pathname === '/signup') {
    return null;
  }

  return (
    <header className="global-navbar">
      <Link to={user ? '/dashboard' : '/'} className="global-navbar__brand">
        <span className="global-navbar__dot" />
        <span className="global-navbar__title">DoubtDesk</span>
        <span className="global-navbar__sub faint mono">// CodingMates</span>
      </Link>

      <nav className="global-navbar__links">
        {user ? (
          <>
            <Link to="/dashboard" className="global-navbar__link">
              Dashboard
            </Link>
            <Link to="/faq" className="global-navbar__link kb-nav-link">
              📚 Knowledge Base
            </Link>
            <span className={`role-badge ${user.role || ''}`}>
              {user.role}
            </span>
            <button
              type="button"
              className="global-navbar__link global-navbar__logout"
              onClick={handleLogout}
            >
              Sign Out
            </button>
          </>
        ) : (
          <>
            <Link to="/login" className="global-navbar__link">
              Mentor Login
            </Link>
            <Link to="/signup">
              <button type="button" className="btn btn-sm btn-primary">
                Join Platform →
              </button>
            </Link>
          </>
        )}
      </nav>
    </header>
  );
}
