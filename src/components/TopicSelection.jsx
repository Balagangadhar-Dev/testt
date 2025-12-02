import { useState } from 'react';
import { TOPICS } from '../config/api';

function TopicSelection({ studentInfo, onTopicSelect }) {
  const [selectedTopic, setSelectedTopic] = useState(null);

  const handleTopicClick = (topic) => {
    setSelectedTopic(topic);
  };

  const handleStart = () => {
    if (selectedTopic) {
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
    </div>
  );
}

export default TopicSelection;
