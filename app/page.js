// app/page.js
'use client';
import { useState, useEffect } from 'react';
import QuestionCard from '@/components/QuestionCard';
import CreateModal from '@/components/CreateModal';

export default function Home() {
  const [question, setQuestion] = useState(null);
  const [language, setLanguage] = useState('en');
  const [theme, setTheme] = useState('dark');
  const [showCreate, setShowCreate] = useState(false);

  const loadQuestion = async () => {
    const res = await fetch(`/api/question/random?language=${language}`);
    const data = await res.json();
    setQuestion(data);
    
    // Random background color
    document.body.style.backgroundColor = 
      ['#FF6B6B', '#4ECDC4', '#FFD166', '#06D6A0'][Math.floor(Math.random() * 4)];
  };

  useEffect(() => {
    loadQuestion();
    const savedTheme = localStorage.getItem('theme') || 'dark';
    setTheme(savedTheme);
    document.body.className = `${savedTheme}-theme`;
  }, []);

  const handleVote = async (optionId) => {
    await fetch('/api/vote', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ optionId })
    });
    loadQuestion(); // Reload to show updated stats
  };

  return (
    <div className={`container ${theme}`}>
      <header>
        <div className="logo">?</div>
        <h1>TruthDare</h1>
        
        <div className="controls">
          <select value={language} onChange={(e) => {
            setLanguage(e.target.value);
            loadQuestion();
          }}>
            <option value="en">English</option>
            <option value="id">Indonesian</option>
            <option value="zh">Chinese</option>
          </select>
          
          <button onClick={() => {
            const newTheme = theme === 'dark' ? 'light' : 'dark';
            setTheme(newTheme);
            document.body.className = `${newTheme}-theme`;
            localStorage.setItem('theme', newTheme);
          }}>
            {theme === 'dark' ? '☀️' : '🌙'}
          </button>
          
          <button onClick={() => setShowCreate(true)}>
            + Create
          </button>
        </div>
      </header>

      <main>
        {question && <QuestionCard question={question} onVote={handleVote} />}
        
        <button onClick={loadQuestion} className="next-btn">
          Next Question →
        </button>
      </main>

      {showCreate && <CreateModal onClose={() => setShowCreate(false)} />}
    </div>
  );
  }
