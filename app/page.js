// app/page.js
'use client';
import { useState, useEffect } from 'react';
import './globals.css';

export default function Home() {
  const [question, setQuestion] = useState(null);
  const [language, setLanguage] = useState('en');
  const [theme, setTheme] = useState('dark');
  const [showCreate, setShowCreate] = useState(false);

  // Load random question
  const loadQuestion = async () => {
    try {
      const res = await fetch(`/api/question?language=${language}`);
      const data = await res.json();
      setQuestion(data);
      
      // Random background color for question card
      const colors = ['#FF6B6B', '#4ECDC4', '#FFD166', '#06D6A0', '#118AB2'];
      document.documentElement.style.setProperty('--primary', colors[Math.floor(Math.random() * colors.length)]);
      document.documentElement.style.setProperty('--primary-dark', colors[Math.floor(Math.random() * colors.length)]);
    } catch (error) {
      console.error('Failed to load question:', error);
    }
  };

  useEffect(() => {
    // Load initial question
    loadQuestion();
    
    // Set theme from localStorage
    const savedTheme = localStorage.getItem('theme') || 'dark';
    setTheme(savedTheme);
    document.body.className = `${savedTheme}-theme`;
  }, []);

  // Handle option selection/vote
  const handleVote = async (optionId) => {
    if (!question) return;
    
    try {
      await fetch('/api/vote', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ optionId })
      });
      
      // Reload question to show updated stats
      loadQuestion();
    } catch (error) {
      console.error('Failed to vote:', error);
    }
  };

  // Calculate percentages
  const calculatePercentages = () => {
    if (!question || !question.options) return [];
    
    const totalVotes = question.options.reduce((sum, opt) => sum + (opt.votes || 0), 0);
    
    return question.options.map(opt => ({
      ...opt,
      percentage: totalVotes > 0 ? ((opt.votes || 0) / totalVotes * 100).toFixed(1) : 0
    }));
  };

  const percentages = calculatePercentages();

  return (
    <div className="container">
      {/* Header */}
      <header>
        <div className="logo">
          <span style={{ fontSize: '40px' }}>?</span>
          <h1>TruthDare</h1>
        </div>
        
        <div className="controls">
          <select 
            value={language} 
            onChange={(e) => {
              setLanguage(e.target.value);
              loadQuestion();
            }}
          >
            <option value="en">English</option>
            <option value="id">Bahasa Indonesia</option>
            <option value="zh">中文</option>
          </select>
          
          <button 
            onClick={() => {
              const newTheme = theme === 'dark' ? 'light' : 'dark';
              setTheme(newTheme);
              document.body.className = `${newTheme}-theme`;
              localStorage.setItem('theme', newTheme);
            }}
          >
            {theme === 'dark' ? '☀️ Light' : '🌙 Dark'}
          </button>
          
          <button onClick={() => setShowCreate(true)}>
            + Create Question
          </button>
        </div>
      </header>

      {/* Main Question Card */}
      <main>
        {question && (
          <div className="question-card">
            <div className="question-header">
              <span className="category-badge">{question.category || 'General'}</span>
              <span className="question-id">#{question.id?.toString().slice(-4) || '0000'}</span>
            </div>
            
            <div className="question-text">
              {question.text || 'Loading question...'}
            </div>
            
            {/* Options Grid */}
            <div className="options-grid">
              {percentages.map((option, index) => (
                <div 
                  key={option.id || index}
                  className="option-card"
                  onClick={() => handleVote(option.id)}
                >
                  <div className="option-text">{option.text}</div>
                  <div className="option-stats">
                    <span className="percentage">{option.percentage}%</span>
                    <span className="votes">{option.votes || 0} votes</span>
                  </div>
                </div>
              ))}
            </div>
            
            <div className="stats-footer">
              <div className="total-votes">
                Total Votes: {percentages.reduce((sum, opt) => sum + (opt.votes || 0), 0)}
              </div>
            </div>
          </div>
        )}
        
        {/* Next Question Button */}
        <button onClick={loadQuestion} className="next-btn">
          Next Question →
        </button>
      </main>

      {/* Create Question Modal */}
      {showCreate && (
        <div className="modal-overlay" onClick={() => setShowCreate(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <h2>Create New Question</h2>
            <p style={{ marginBottom: '20px', color: '#666' }}>
              Submit a fun question for the game! (No inappropriate content)
            </p>
            
            <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
              <div>
                <label>Question Text</label>
                <textarea 
                  style={{
                    width: '100%',
                    padding: '15px',
                    borderRadius: '12px',
                    border: '2px solid #e0e0e0',
                    marginTop: '10px',
                    fontFamily: 'inherit'
                  }}
                  rows="3"
                />
              </div>
              
              <div>
                <label>Language</label>
                <select style={{ width: '100%', padding: '10px', marginTop: '10px' }}>
                  <option value="en">English</option>
                  <option value="id">Indonesian</option>
                  <option value="zh">Chinese</option>
                </select>
              </div>
              
              <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end' }}>
                <button 
                  onClick={() => setShowCreate(false)}
                  style={{ padding: '10px 20px', background: '#f0f0f0', border: 'none', borderRadius: '8px' }}
                >
                  Cancel
                </button>
                <button 
                  onClick={() => {
                    alert('Question submitted! (Backend integration needed)');
                    setShowCreate(false);
                  }}
                  style={{ padding: '10px 20px', background: '#6d5dfc', color: 'white', border: 'none', borderRadius: '8px' }}
                >
                  Submit
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
    }
