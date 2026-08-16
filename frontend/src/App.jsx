import { useState, useMemo } from 'react';
import { BrowserRouter, Routes, Route, useLocation } from 'react-router-dom';
import { useAuth } from './context/AuthContext';

// Atmosphere
import Background3D from './components/Background3D';
import Overlays from './components/Overlays';
import BootSequence from './components/BootSequence';
import ToastContainer from './components/Toast';
import Navbar from './components/Navbar';
import AIDoubtBot from './components/AIDoubtBot';
import ProtectedRoute from './components/ProtectedRoute';

// Pages
import Landing from './pages/Landing';
import Signup from './pages/Signup';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import DoubtDetail from './pages/DoubtDetail';
import KnowledgeBase from './pages/KnowledgeBase';

function AppContent() {
  const location = useLocation();
  const { user } = useAuth();

  // Determine 3D background context from route
  const bgContext = useMemo(() => {
    const path = location.pathname;
    if (path === '/') return 'hero';
    if (path === '/signup' || path === '/login') return 'auth';
    if (path === '/dashboard' || path === '/faq' || path === '/kb') {
      return user?.role === 'mentor' ? 'mentor' : 'student';
    }
    if (path.startsWith('/doubts/')) return 'progress';
    return 'default';
  }, [location.pathname, user?.role]);

  return (
    <>
      {/* Persistent minimal 3D background & subtle vignette */}
      <Background3D context={bgContext} />
      <Overlays />

      {/* Single Unified Global Navbar */}
      <Navbar />

      {/* 24/7 AI DoubtBot Floating Assistant */}
      <AIDoubtBot />

      {/* Routes */}
      <div style={{ position: 'relative', zIndex: 5 }}>
        <Routes>
          <Route path="/" element={<Landing />} />
          <Route path="/signup" element={<Signup />} />
          <Route path="/login" element={<Login />} />
          <Route
            path="/dashboard"
            element={
              <ProtectedRoute>
                <Dashboard />
              </ProtectedRoute>
            }
          />
          <Route
            path="/faq"
            element={
              <ProtectedRoute>
                <KnowledgeBase />
              </ProtectedRoute>
            }
          />
          <Route
            path="/kb"
            element={
              <ProtectedRoute>
                <KnowledgeBase />
              </ProtectedRoute>
            }
          />
          <Route
            path="/doubts/:id"
            element={
              <ProtectedRoute>
                <DoubtDetail />
              </ProtectedRoute>
            }
          />
        </Routes>
      </div>

      {/* Toasts */}
      <ToastContainer />
    </>
  );
}

function App() {
  const [booted, setBooted] = useState(false);
  const hasBooted = !!sessionStorage.getItem('dd_booted');

  return (
    <BrowserRouter>
      {!hasBooted && !booted && (
        <BootSequence onComplete={() => setBooted(true)} />
      )}
      <AppContent />
    </BrowserRouter>
  );
}

export default App;
