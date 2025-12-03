import { useState } from 'react';
import { TOPICS } from '../config/api';

function TopicSelection({ studentInfo, onTopicSelect }) {
  const [selectedTopic, setSelectedTopic] = useState(null);
  const [customMode, setCustomMode] = useState(false);
  const [customTopic, setCustomTopic] = useState('');
  const [customSubtopics, setCustomSubtopics] = useState('');

  const handleTopicClick = (topic) => {
    setSelectedTopic(topic);
    setCustomMode(false);
  };

  const handleCustomMode = () => {
    setCustomMode(true);
    setSelectedTopic(null);
  };

  const handleStart = () => {
    if (customMode && customTopic.trim()) {
      // Create custom topic object
      const topic = {
        id: 'custom',
        name: customTopic.trim(),
        subtopics: customSubtopics.trim() ? customSubtopics.split(',').map(s => s.trim()).filter(s => s) : [],
        icon: '📝'
      };
      onTopicSelect(topic);
    } else if (selectedTopic) {
      onTopicSelect(selectedTopic);
    }
  };

  return (
    <div className="topic-container">
      <div className="topic-header">
        <img
          src="https://mitwpu.edu.in/uploads/images/MIT-WPU-logo-1.webp"
          alt="MIT-WPU Logo"
          style={{
            maxWidth: '250px',
            height: 'auto',
            marginBottom: '20px',
            filter: 'drop-shadow(0 0 10px rgba(0, 0, 0, 0.1))'
          }}
        />
        <h2>Select Your Assessment Topic</h2>
        <div className="student-info">
          <strong>{studentInfo.name}</strong> | PRN: {studentInfo.prn}
        </div>
      </div>

      {!customMode ? (
        <>
          <div className="topics-grid">
            {TOPICS.map((topic) => (
              <div
                key={topic.id}
                className={`topic-card ${selectedTopic?.id === topic.id ? 'selected' : ''}`}
                onClick={() => handleTopicClick(topic)}
              >
                <div className="topic-icon">{topic.icon}</div>
                <div className="topic-name">{topic.name}</div>
              </div>
            ))}
            <div
              className="topic-card"
              onClick={handleCustomMode}
              style={{ border: '2px dashed var(--primary)', cursor: 'pointer' }}
            >
              <div className="topic-icon">➕</div>
              <div className="topic-name">Custom Topic</div>
            </div>
          </div>

          <div className="topic-actions">
            <button
              className="btn btn-primary"
              onClick={handleStart}
              disabled={!selectedTopic}
            >
              Start 20-Minute Test →
            </button>
          </div>
        </>
      ) : (
        <div style={{ maxWidth: '600px', margin: '0 auto' }}>
          <div className="form-group">
            <label htmlFor="customTopic">Assessment Topic *</label>
            <input
              type="text"
              id="customTopic"
              value={customTopic}
              onChange={(e) => setCustomTopic(e.target.value)}
              placeholder="e.g., Machine Learning, Cloud Computing, etc."
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="customSubtopics">Subtopics (Optional)</label>
            <textarea
              id="customSubtopics"
              value={customSubtopics}
              onChange={(e) => setCustomSubtopics(e.target.value)}
              placeholder="Enter subtopics separated by commas&#10;e.g., Neural Networks, Deep Learning, CNN, RNN"
              rows="4"
              style={{
                width: '100%',
                padding: '14px 18px',
                background: 'var(--surface-light)',
                border: '2px solid var(--border)',
                borderRadius: '10px',
                color: 'var(--text)',
                fontSize: '1rem',
                fontFamily: 'inherit',
                resize: 'vertical'
              }}
            />
            <small style={{ color: 'var(--text-secondary)', fontSize: '0.85rem', marginTop: '5px', display: 'block' }}>
              AI will focus on these specific areas if provided
            </small>
          </div>

          <div className="topic-actions" style={{ display: 'flex', gap: '15px' }}>
            <button
              className="btn"
              onClick={() => {
                setCustomMode(false);
                setCustomTopic('');
                setCustomSubtopics('');
              }}
              style={{ background: 'var(--surface-light)', color: 'var(--text)', flex: '1' }}
            >
              ← Back to Topics
            </button>
            <button
              className="btn btn-primary"
              onClick={handleStart}
              disabled={!customTopic.trim()}
              style={{ flex: '2' }}
            >
              Start Custom Test →
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export default TopicSelection;
