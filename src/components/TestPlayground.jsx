import { useState, useEffect, useRef } from 'react';
import { generateTestQuestions, generateNextQuestion, evaluateAnswer } from '../utils/geminiService';
import { TEST_CONFIG } from '../config/api';

function TestPlayground({ studentInfo, topic, onTestComplete }) {
  const [currentQuestion, setCurrentQuestion] = useState(null);
  const [questionNumber, setQuestionNumber] = useState(1);
  const [studentAnswer, setStudentAnswer] = useState('');
  const [selectedOption, setSelectedOption] = useState(null);
  const [answers, setAnswers] = useState([]);
  const [score, setScore] = useState(0);
  const [maxScore, setMaxScore] = useState(0);
  const [timeRemaining, setTimeRemaining] = useState(TEST_CONFIG.duration * 60); // in seconds
  const [loading, setLoading] = useState(true);
  const [showHint, setShowHint] = useState(false);
  const [questionStartTime, setQuestionStartTime] = useState(Date.now());
  const [isEvaluating, setIsEvaluating] = useState(false);
  const [lastResult, setLastResult] = useState(null);
  const [showResult, setShowResult] = useState(false);
  const [timerPaused, setTimerPaused] = useState(true); // Start paused until first question loads

  const timerRef = useRef(null);
  const timerPausedRef = useRef(true); // Start paused

  // Helper function to pause/resume timer
  const setTimerPausedState = (paused) => {
    timerPausedRef.current = paused;
    setTimerPaused(paused);
  };

  // Initialize first question
  useEffect(() => {
    loadFirstQuestion();

    // Start timer (only counts down when not paused)
    timerRef.current = setInterval(() => {
      setTimeRemaining((prev) => {
        // Don't count down if timer is paused (using ref to get latest value)
        if (timerPausedRef.current) return prev;

        if (prev <= 1) {
          clearInterval(timerRef.current);
          handleTestComplete();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const loadFirstQuestion = async () => {
    try {
      setLoading(true);
      const question = await generateTestQuestions(topic.name, studentInfo);
      setCurrentQuestion(question);
      setMaxScore((prev) => prev + question.points);
      setQuestionStartTime(Date.now());
      setLoading(false);

      // START TIMER NOW - first question is ready!
      setTimerPausedState(false);
    } catch (error) {
      console.error('Error loading question:', error);
      alert('Error loading question. Please check your API key configuration.');
      setLoading(false);
      // Start timer even on error so test doesn't hang
      setTimerPausedState(false);
    }
  };

  const loadNextQuestion = async () => {
    try {
      setLoading(true);
      const performance = {
        score,
        maxScore,
        accuracy: answers.length > 0 ? (answers.filter(a => a.isCorrect).length / answers.length) * 100 : 50
      };

      const question = await generateNextQuestion(
        topic.name,
        questionNumber + 1,
        answers,
        performance
      );

      setCurrentQuestion(question);
      setQuestionNumber((prev) => prev + 1);
      setMaxScore((prev) => prev + question.points);
      setStudentAnswer('');
      setSelectedOption(null);
      setShowHint(false);
      setQuestionStartTime(Date.now());
      setLoading(false);
    } catch (error) {
      console.error('Error loading next question:', error);
      setLoading(false);
    }
  };

  const handleSubmitAnswer = async () => {
    if (isEvaluating) return;

    const answer = currentQuestion.type === 'mcq' || currentQuestion.type === 'truefalse'
      ? selectedOption
      : studentAnswer;

    if (!answer || answer.trim() === '') {
      alert('Please provide an answer before submitting.');
      return;
    }

    // Pause timer while evaluating and loading next question
    setTimerPausedState(true);
    setIsEvaluating(true);
    const timeSpent = Math.floor((Date.now() - questionStartTime) / 1000);

    try {
      const evaluation = await evaluateAnswer(currentQuestion, answer, timeSpent);

      const answerRecord = {
        questionNumber,
        question: currentQuestion.question,
        type: currentQuestion.type,
        studentAnswer: answer,
        isCorrect: evaluation.isCorrect,
        pointsAwarded: evaluation.pointsAwarded,
        maxPoints: currentQuestion.points,
        feedback: evaluation.feedback,
        correctAnswer: evaluation.correctAnswer,
        timeSpent,
        usedHint: showHint
      };

      setAnswers((prev) => [...prev, answerRecord]);
      setScore((prev) => prev + evaluation.pointsAwarded);

      // Show result feedback
      setLastResult({
        isCorrect: evaluation.isCorrect,
        pointsAwarded: evaluation.pointsAwarded,
        maxPoints: currentQuestion.points,
        feedback: evaluation.feedback,
        correctAnswer: evaluation.correctAnswer
      });
      setShowResult(true);
      setIsEvaluating(false);

      // Wait 3 seconds before moving to next question
      setTimeout(async () => {
        setShowResult(false);
        setLastResult(null);

        // Check if we should continue or end the test
        if (timeRemaining > 60 && questionNumber < TEST_CONFIG.totalQuestions) {
          await loadNextQuestion();
          // Resume timer after next question loads
          setTimerPausedState(false);
        } else {
          handleTestComplete();
        }
      }, 3000);
    } catch (error) {
      console.error('Error evaluating answer:', error);
      alert('Error evaluating answer. Moving to next question.');
      setIsEvaluating(false);
      if (questionNumber < TEST_CONFIG.totalQuestions && timeRemaining > 60) {
        await loadNextQuestion();
      } else {
        handleTestComplete();
      }
      // Resume timer even on error
      setTimerPausedState(false);
    }
  };

  const handleTestComplete = () => {
    if (timerRef.current) clearInterval(timerRef.current);
    onTestComplete({
      studentInfo,
      topic,
      answers,
      score,
      maxScore,
      timeUsed: TEST_CONFIG.duration * 60 - timeRemaining
    });
  };

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const getTimerClass = () => {
    if (timeRemaining < 60) return 'timer danger';
    if (timeRemaining < 300) return 'timer warning';
    return 'timer';
  };

  if (loading && !currentQuestion) {
    return (
      <div className="test-container">
        <div className="loading">
          <div className="loading-spinner"></div>
          <div>Loading first question...</div>
          <div style={{ marginTop: '10px', fontSize: '0.9rem', opacity: '0.7' }}>
            ⏸️ Timer will start when question appears
          </div>
        </div>
      </div>
    );
  }

  if (!currentQuestion) {
    return (
      <div className="test-container">
        <div className="loading">
          <div>Error loading question. Please refresh the page.</div>
        </div>
      </div>
    );
  }

  const progress = (questionNumber / TEST_CONFIG.totalQuestions) * 100;

  return (
    <div className="test-container">
      <div className="test-header">
        <div className="test-info">
          <div className="info-item">
            <span className="info-label">Student</span>
            <span className="info-value">{studentInfo.name}</span>
          </div>
          <div className="info-item">
            <span className="info-label">Topic</span>
            <span className="info-value">{topic.name}</span>
          </div>
          <div className="info-item">
            <span className="info-label">Score</span>
            <span className="info-value">{score} pts</span>
          </div>
          <div className="info-item">
            <span className="info-label">Accuracy</span>
            <span className="info-value">
              {answers.length > 0
                ? Math.round((answers.filter(a => a.isCorrect).length / answers.length) * 100)
                : 0}%
            </span>
          </div>
          <div className="info-item">
            <span className="info-label">Question</span>
            <span className="info-value">{questionNumber}</span>
          </div>
        </div>
        <div className={getTimerClass()}>
          {timerPaused ? '⏸️' : '⏱️'} {formatTime(timeRemaining)}
          {timerPaused && (
            <span style={{ fontSize: '0.8rem', marginLeft: '8px', opacity: '0.8' }}>
              (Paused)
            </span>
          )}
        </div>
      </div>

      <div className="progress-bar">
        <div className="progress-fill" style={{ width: `${progress}%` }}></div>
      </div>

      {showResult && lastResult ? (
        <div className={`result-card ${lastResult.isCorrect ? 'correct' : 'incorrect'}`}>
          <div className="result-header">
            <span className="result-icon">
              {lastResult.isCorrect ? '✅' : '❌'}
            </span>
            <span className="result-title">
              {lastResult.isCorrect ? 'Correct!' : 'Incorrect'}
            </span>
            <span className="result-points">
              +{lastResult.pointsAwarded}/{lastResult.maxPoints} points
            </span>
          </div>
          <div className="result-feedback">{lastResult.feedback}</div>
          {!lastResult.isCorrect && (
            <div className="result-answer">
              <strong>Correct Answer:</strong> {lastResult.correctAnswer}
            </div>
          )}
          <div className="result-total">
            Your Total Score: <strong>{score} points</strong>
          </div>
          <div style={{ textAlign: 'center', marginTop: '15px', color: 'var(--text-secondary)', fontSize: '0.9rem' }}>
            Loading next question...
          </div>
        </div>
      ) : (
        <div className="question-card">
        <div className="question-header">
          <span className="question-type">
            {currentQuestion.type.toUpperCase()} - {currentQuestion.difficulty}
          </span>
          <span className="question-points">⭐ {currentQuestion.points} points</span>
        </div>

        <div
          className="question-text"
          dangerouslySetInnerHTML={{ __html: currentQuestion.question }}
        />

        {(currentQuestion.type === 'mcq' || currentQuestion.type === 'truefalse') && currentQuestion.options && (
          <div className="options-container">
            {currentQuestion.options.map((option, index) => (
              <button
                key={index}
                className={`option-button ${selectedOption === option ? 'selected' : ''}`}
                onClick={() => setSelectedOption(option)}
                disabled={isEvaluating}
              >
                {String.fromCharCode(65 + index)}. {option}
              </button>
            ))}
          </div>
        )}

        {(currentQuestion.type === 'descriptive' || currentQuestion.type === 'scenario') && (
          <textarea
            className="answer-textarea"
            value={studentAnswer}
            onChange={(e) => setStudentAnswer(e.target.value)}
            placeholder="Type your answer here..."
            disabled={isEvaluating}
          />
        )}

        {showHint && currentQuestion.hint && (
          <div className="hint-box">
            💡 <strong>Hint:</strong> {currentQuestion.hint}
          </div>
        )}

        <div className="question-actions">
          <div>
            {currentQuestion.hint && !showHint && (
              <button
                className="btn hint-button"
                onClick={() => setShowHint(true)}
                disabled={isEvaluating}
              >
                💡 Show Hint (-5 points)
              </button>
            )}
          </div>
          <button
            className="btn btn-primary"
            onClick={handleSubmitAnswer}
            disabled={isEvaluating || (!studentAnswer && !selectedOption)}
          >
            {isEvaluating ? 'Evaluating...' : 'Submit Answer →'}
          </button>
        </div>
      </div>
      )}
    </div>
  );
}

export default TestPlayground;
