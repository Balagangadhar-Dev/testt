import { useState } from 'react';
import Welcome from './components/Welcome';
import TopicSelection from './components/TopicSelection';
import TestPlayground from './components/TestPlayground';
import Report from './components/Report';
import './styles/App.css';

function App() {
  const [currentScreen, setCurrentScreen] = useState('welcome');
  const [studentInfo, setStudentInfo] = useState(null);
  const [selectedTopic, setSelectedTopic] = useState(null);
  const [testData, setTestData] = useState(null);

  const handleWelcomeComplete = (info) => {
    setStudentInfo(info);
    setCurrentScreen('topic-selection');
  };

  const handleTopicSelect = (topic) => {
    setSelectedTopic(topic);
    setCurrentScreen('test');
  };

  const handleTestComplete = (data) => {
    setTestData(data);
    setCurrentScreen('report');
  };

  const handleRestart = () => {
    setCurrentScreen('welcome');
    setStudentInfo(null);
    setSelectedTopic(null);
    setTestData(null);
  };

  return (
    <div className="app-container">
      {currentScreen === 'welcome' && (
        <Welcome onStart={handleWelcomeComplete} />
      )}

      {currentScreen === 'topic-selection' && (
        <TopicSelection
          studentInfo={studentInfo}
          onTopicSelect={handleTopicSelect}
        />
      )}

      {currentScreen === 'test' && (
        <TestPlayground
          studentInfo={studentInfo}
          topic={selectedTopic}
          onTestComplete={handleTestComplete}
        />
      )}

      {currentScreen === 'report' && (
        <Report
          testData={testData}
          onRestart={handleRestart}
        />
      )}
    </div>
  );
}

export default App;
