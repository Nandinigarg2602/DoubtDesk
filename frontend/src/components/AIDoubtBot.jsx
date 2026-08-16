import { useState, useRef, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import api from '../api/axios';
import './AIDoubtBot.css';

const QUICK_PROMPTS = [
  '💡 Why does useEffect cause infinite re-renders?',
  '🔒 How does JWT token auth work in MERN?',
  '🍃 Fix Mongoose CastError on ObjectId',
  '🌐 How to resolve Express CORS policy errors?',
];

export default function AIDoubtBot() {
  const { user } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef(null);

  // Initialize welcome message with student name
  useEffect(() => {
    if (user && user.role === 'student') {
      const studentName = user.name ? user.name.split(' ')[0] : 'Student';
      setMessages([
        {
          id: 'init-1',
          sender: 'bot',
          text: `Hello ${studentName}! 👋 I am **DoubtBot**, your 24/7 AI Coding Mentor at CodingMates.\n\nAsk me any React, Express, Node.js, or MongoDB questions, paste your broken code snippets, or pick a quick prompt below to get started!`,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        },
      ]);
    }
  }, [user]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    if (isOpen) {
      scrollToBottom();
    }
  }, [messages, isOpen]);

  // Exclusively for authenticated students only: NOT available before login or to mentors
  if (!user || user.role !== 'student') {
    return null;
  }

  const handleSendMessage = async (textToSend) => {
    const query = textToSend || input;
    if (!query.trim() || loading) return;

    const userMsg = {
      id: `u-${Date.now()}`,
      sender: 'user',
      text: query,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    setMessages((prev) => [...prev, userMsg]);
    if (!textToSend) setInput('');
    setLoading(true);

    try {
      const res = await api.post('/ai/chat', {
        message: query,
      });

      const botMsg = {
        id: `b-${Date.now()}`,
        sender: 'bot',
        text: res.data.reply || 'Here is the technical breakdown of your query.',
        model: res.data.model || 'DoubtDesk Neural AI',
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };

      setMessages((prev) => [...prev, botMsg]);
    } catch (err) {
      const errorMsg = {
        id: `err-${Date.now()}`,
        sender: 'bot',
        text: '⚠️ I encountered an error connecting to the neural reasoning engine. Please verify your connection or try again in a moment.',
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };
      setMessages((prev) => [...prev, errorMsg]);
    } finally {
      setLoading(false);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const handleCopyCode = (codeText) => {
    navigator.clipboard.writeText(codeText);
  };

  // Helper to parse markdown-like code blocks and bold text cleanly
  const renderFormattedMessage = (content) => {
    const parts = content.split(/(```[\s\S]*?```)/g);

    return parts.map((part, index) => {
      if (part.startsWith('```') && part.endsWith('```')) {
        const lines = part.slice(3, -3).trim().split('\n');
        const language = lines[0].trim();
        const codeContent = language && !lines[0].includes(' ') && lines.length > 1
          ? lines.slice(1).join('\n')
          : lines.join('\n');

        return (
          <div key={index} className="doubtbot-code-container">
            <div className="doubtbot-code-header">
              <span className="mono" style={{ fontSize: '0.7rem', color: '#a855f7' }}>
                {language || 'javascript'}
              </span>
              <button
                type="button"
                className="doubtbot-copy-btn"
                onClick={() => handleCopyCode(codeContent)}
              >
                Copy Code
              </button>
            </div>
            <pre className="doubtbot-code-block mono">
              <code>{codeContent}</code>
            </pre>
          </div>
        );
      }

      // Render line-by-line text
      return (
        <div key={index} className="doubtbot-text-block">
          {part.split('\n').map((line, lIdx) => {
            if (!line.trim()) return <br key={lIdx} />;
            if (line.startsWith('### ')) {
              return <h4 key={lIdx} className="doubtbot-heading">{line.replace('### ', '')}</h4>;
            }
            if (line.startsWith('- ')) {
              return (
                <li key={lIdx} className="doubtbot-list-item">
                  {line.replace('- ', '')}
                </li>
              );
            }
            return <p key={lIdx} className="doubtbot-para">{line}</p>;
          })}
        </div>
      );
    });
  };

  return (
    <div className="doubtbot-root" aria-live="polite">
      {/* Floating Trigger Button */}
      {!isOpen && (
        <button
          type="button"
          className="doubtbot-fab"
          onClick={() => setIsOpen(true)}
          title="Open AI DoubtBot Tutor"
        >
          <span className="doubtbot-fab__sparkle">✨</span>
          <span className="doubtbot-fab__text">Ask DoubtBot (AI)</span>
          <span className="doubtbot-fab__pulse" />
        </button>
      )}

      {/* Floating Chat Window */}
      {isOpen && (
        <div className="doubtbot-window glass-panel">
          {/* Header */}
          <div className="doubtbot-header">
            <div className="doubtbot-brand">
              <div className="doubtbot-avatar">
                <span>🤖</span>
                <span className="doubtbot-online-dot" />
              </div>
              <div>
                <div className="doubtbot-title">DoubtBot · AI Senior Mentor</div>
                <div className="doubtbot-subtitle faint mono">CodingMates Neural Engine</div>
              </div>
            </div>

            <div className="doubtbot-actions">
              <button
                type="button"
                className="doubtbot-icon-btn"
                onClick={() => setIsOpen(false)}
                title="Minimize chat"
              >
                ✕
              </button>
            </div>
          </div>

          {/* Messages Stream */}
          <div className="doubtbot-messages">
            {messages.map((msg) => (
              <div
                key={msg.id}
                className={`doubtbot-msg doubtbot-msg--${msg.sender}`}
              >
                <div className="doubtbot-msg__header">
                  <span className="doubtbot-msg__name mono">
                    {msg.sender === 'bot' ? '✨ DoubtBot' : user.name}
                  </span>
                  <span className="doubtbot-msg__time faint mono">{msg.timestamp}</span>
                </div>

                <div className="doubtbot-msg__body">
                  {renderFormattedMessage(msg.text)}
                </div>
              </div>
            ))}

            {loading && (
              <div className="doubtbot-msg doubtbot-msg--bot">
                <div className="doubtbot-msg__header">
                  <span className="doubtbot-msg__name mono">✨ DoubtBot</span>
                  <span className="doubtbot-msg__time faint mono">analyzing...</span>
                </div>
                <div className="doubtbot-typing-indicator">
                  <span />
                  <span />
                  <span />
                </div>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>

          {/* Quick Prompts Carousel */}
          <div className="doubtbot-prompts-row">
            {QUICK_PROMPTS.map((prompt, idx) => (
              <button
                key={idx}
                type="button"
                className="doubtbot-prompt-pill"
                onClick={() => handleSendMessage(prompt)}
                disabled={loading}
              >
                {prompt}
              </button>
            ))}
          </div>

          {/* Input Bar */}
          <form
            className="doubtbot-input-bar"
            onSubmit={(e) => {
              e.preventDefault();
              handleSendMessage();
            }}
          >
            <input
              type="text"
              className="doubtbot-input"
              placeholder="Ask anything or paste code... (Press Enter)"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              disabled={loading}
            />
            <button
              type="submit"
              className="btn btn-sm btn-primary doubtbot-send-btn"
              disabled={loading || !input.trim()}
            >
              Send ↑
            </button>
          </form>
        </div>
      )}
    </div>
  );
}
