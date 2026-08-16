import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import CinematicBackground from '../components/CinematicBackground';
import './Landing.css';

export default function LandingPage() {
  const [scrollProgress, setScrollProgress] = useState(0);

  useEffect(() => {
    const handleScroll = () => {
      const totalScroll = document.documentElement.scrollHeight - window.innerHeight;
      const progress = totalScroll > 0 ? window.scrollY / totalScroll : 0;
      setScrollProgress(Math.min(1, Math.max(0, progress)));
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <div className="spatial-landing">
      {/* 1. Spatial Video Portal that zooms with scroll */}
      <CinematicBackground scrollProgress={scrollProgress} />

      {/* ── STAGE 1: THE THRESHOLD (HERO) ── */}
      <section className="stage stage-hero">
        <div className="stage-container">
          <div className="spatial-hero-content">
            <div className="spatial-tag mono">
              <span className="spatial-tag-pulse" />
              <span>THE CODING RESOLUTION GATEWAY</span>
            </div>

            <h1 className="spatial-hero-title">
              From Stuck to Shipped. <br />
              <span className="accent-glow-text">Resolve Doubts in Real Time.</span>
            </h1>

            <p className="spatial-hero-sub">
              Step into the full-stack doubt resolution engine. Instant AI code diagnostics
              paired with dedicated 1-on-1 mentor guidance for bootcamp developers.
            </p>

            <div className="spatial-hero-actions">
              <Link to="/signup">
                <button className="btn btn-primary btn-glow" style={{ padding: '14px 30px', fontSize: '1rem' }}>
                  Enter DoubtDesk →
                </button>
              </Link>
              <Link to="/login">
                <button className="btn btn-spatial" style={{ padding: '14px 30px', fontSize: '1rem' }}>
                  Mentor Portal
                </button>
              </Link>
            </div>
          </div>

          <div className="spatial-scroll-indicator">
            <span className="mono faint" style={{ fontSize: '0.6875rem', letterSpacing: '0.2em' }}>
              SCROLL TO ENTER GATEWAY
            </span>
            <div className="spatial-scroll-arrow">↓</div>
          </div>
        </div>
      </section>

      {/* ── STAGE 2: THE SPATIAL PIPELINE (HOW IT WORKS) ── */}
      <section className="stage stage-pipeline">
        <div className="stage-container">
          <div className="stage-title-block">
            <span className="spatial-eyebrow mono">STAGE 01 // TRAJECTORY</span>
            <h2 className="stage-heading">How Every Doubt Moves Through the Light</h2>
          </div>

          {/* Symmetrically Flanked Spatial HUD Nodes around the Portal Center */}
          <div className="spatial-hud-grid">
            {/* Left Flank Card */}
            <div className="spatial-card spatial-card--left glass-panel">
              <div className="spatial-card-header">
                <span className="spatial-card-num mono">01</span>
                <span className="subject-tag">Student Post</span>
              </div>
              <h3 className="spatial-card-title">Queue Your Roadblock</h3>
              <p className="spatial-card-desc">
                Encountering an async loop, missing token, or MongoDB CastError?
                Post your issue with a subject tag into the active queue.
              </p>
              <div className="spatial-connector-line spatial-connector-line--right" />
            </div>

            {/* Center Spatial Light Corridor Space */}
            <div className="spatial-corridor-spacer" aria-hidden="true" />

            {/* Right Flank Card */}
            <div className="spatial-card spatial-card--right glass-panel">
              <div className="spatial-card-header">
                <span className="spatial-card-num mono">02</span>
                <span className="ai-badge">✨ AI First-Responder</span>
              </div>
              <h3 className="spatial-card-title">Instant AI Diagnostics</h3>
              <p className="spatial-card-desc">
                Before a mentor even picks up the ticket, our neural analyzer identifies the root cause
                and generates a verified code diff fix.
              </p>
              <div className="spatial-connector-line spatial-connector-line--left" />
            </div>
          </div>

          {/* Third Bottom Card */}
          <div className="spatial-hud-bottom">
            <div className="spatial-card spatial-card--center glass-panel">
              <div className="spatial-card-header">
                <span className="spatial-card-num mono">03</span>
                <span className="status-badge resolved">✓ Mentor Approved</span>
              </div>
              <h3 className="spatial-card-title">1-on-1 Mentor Solution &amp; Resolution</h3>
              <p className="spatial-card-desc">
                CodingMates mentors review your code in threaded discussions, guide you through best practices,
                and mark your doubt permanently resolved.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ── STAGE 3: THE NEURAL ENGINE (AI SHOWCASE) ── */}
      <section className="stage stage-ai">
        <div className="stage-container">
          <div className="spatial-ai-console glass-panel">
            <div className="spatial-ai-header">
              <div className="spatial-ai-title-wrap">
                <div className="ai-badge">
                  <span>✨</span> NEURAL DEBUG ENGINE
                </div>
                <span className="mono faint" style={{ fontSize: '0.8rem' }}>Sub-Second Code Triage</span>
              </div>
              <div className="spatial-ai-status mono">
                <span className="spatial-status-dot" /> ACTIVE REALTIME INFERENCE
              </div>
            </div>

            <div className="spatial-ai-body">
              <div className="spatial-ai-info">
                <h3 style={{ fontSize: '1.6rem', color: '#fff', marginBottom: '12px' }}>
                  Never stay stuck on runtime errors.
                </h3>
                <p style={{ color: 'var(--text-secondary)', fontSize: '1rem', lineHeight: 1.7, marginBottom: '20px' }}>
                  DoubtDesk analyzes full-stack React, Express, Node.js, and MongoDB codebases.
                  It detects unhandled promises, lifecycle re-renders, and authentication leaks on the fly.
                </p>

                <div className="spatial-perks-list mono">
                  <div>⚡ Live before-and-after code diffs</div>
                  <div>⚡ In-thread ELI5 concept breakdowns</div>
                  <div>⚡ Automatic similar solved doubts matching</div>
                </div>
              </div>

              <div className="spatial-terminal glass-panel">
                <div className="spatial-terminal-top mono">
                  <span className="faint">diagnostic_stream.diff</span>
                  <span className="status-badge resolved" style={{ fontSize: '0.65rem' }}>Match Found</span>
                </div>
                <pre className="spatial-terminal-code mono">
                  <p style={{ color: '#f87171' }}>- useEffect(() =&gt; &#123; fetchData(state); &#125;, [state]);</p>
                  <p style={{ color: '#34d399', marginTop: '8px' }}>+ useEffect(() =&gt; &#123; let mounted = true; fetchData().then(...); return () =&gt; &#123; mounted = false; &#125;; &#125;, []);</p>
                  <div style={{ marginTop: '12px', borderTop: '1px solid rgba(255,255,255,0.08)', paddingTop: '8px' }}>
                    <span className="faint" style={{ fontSize: '0.75rem' }}>// Fix: Stabilized lifecycle dependency reference</span>
                  </div>
                </pre>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── STAGE 4: THE GATEWAY OF MASTERY (CTA) ── */}
      <section className="stage stage-cta">
        <div className="stage-container text-center">
          <div className="spatial-cta-card glass-panel">
            <span className="spatial-eyebrow mono">STAGE 04 // DESTINATION</span>
            <h2 className="spatial-cta-title">
              Ready to Step Into the Future of Coding Education?
            </h2>
            <p className="spatial-cta-desc">
              Built at CodingMates (OPC) Pvt. Ltd. "Learn Today, Lead Tomorrow."
              Join students and mentors resolving blockers and shipping clean code.
            </p>

            <div className="spatial-cta-actions">
              <Link to="/signup">
                <button className="btn btn-primary btn-glow" style={{ padding: '16px 36px', fontSize: '1.05rem' }}>
                  Create Student Account →
                </button>
              </Link>
              <Link to="/login">
                <button className="btn btn-spatial" style={{ padding: '16px 36px', fontSize: '1.05rem' }}>
                  Mentor Access
                </button>
              </Link>
            </div>

            <footer className="spatial-credit mono faint">
              CodingMates (OPC) Pvt. Ltd. · Dhuri, Punjab · Full-Stack MERN Doubt Resolution Platform
            </footer>
          </div>
        </div>
      </section>
    </div>
  );
}
