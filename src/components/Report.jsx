import { useState, useEffect, useRef } from 'react';
import { generateReportInsights } from '../utils/geminiService';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';

function Report({ testData, onRestart }) {
  const [insights, setInsights] = useState(null);
  const [loading, setLoading] = useState(true);
  const reportRef = useRef(null);

  useEffect(() => {
    loadInsights();
  }, []);

  const loadInsights = async () => {
    try {
      const finalScore = {
        score: testData.score,
        maxScore: testData.maxScore,
        percentage: Math.round((testData.score / testData.maxScore) * 100)
      };

      const aiInsights = await generateReportInsights(
        testData.studentInfo,
        testData.topic.name,
        testData.answers,
        finalScore
      );

      setInsights(aiInsights);
      setLoading(false);
    } catch (error) {
      console.error('Error generating insights:', error);
      // Provide default insights if API fails
      setInsights({
        grade: calculateGrade(testData.score, testData.maxScore),
        strengths: ['Completed the test'],
        weaknesses: ['Review missed questions'],
        recommendations: ['Practice more on weak areas'],
        studyPlan: 'Keep practicing to improve your skills.',
        encouragement: 'Great effort! Keep learning!',
        topicMastery: {}
      });
      setLoading(false);
    }
  };

  const calculateGrade = (score, maxScore) => {
    const percentage = (score / maxScore) * 100;
    if (percentage >= 90) return 'A+';
    if (percentage >= 80) return 'A';
    if (percentage >= 70) return 'B+';
    if (percentage >= 60) return 'B';
    if (percentage >= 50) return 'C';
    if (percentage >= 40) return 'D';
    return 'F';
  };

  const downloadPDF = async () => {
    const element = reportRef.current;
    const canvas = await html2canvas(element, {
      scale: 2,
      useCORS: true,
      logging: false
    });

    const imgData = canvas.toDataURL('image/png');
    const pdf = new jsPDF('p', 'mm', 'a4');
    const pdfWidth = pdf.internal.pageSize.getWidth();
    const pdfHeight = pdf.internal.pageSize.getHeight();
    const imgWidth = canvas.width;
    const imgHeight = canvas.height;
    const ratio = Math.min(pdfWidth / imgWidth, pdfHeight / imgHeight);
    const imgX = (pdfWidth - imgWidth * ratio) / 2;
    const imgY = 0;

    pdf.addImage(imgData, 'PNG', imgX, imgY, imgWidth * ratio, imgHeight * ratio);
    pdf.save(`${testData.studentInfo.name}_${testData.topic.name}_Report.pdf`);
  };

  const downloadHTML = () => {
    const element = reportRef.current;
    const htmlContent = `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${testData.studentInfo.name} - Test Report</title>
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background: #f0f0f0; padding: 20px; }
    .report-container { max-width: 1000px; margin: 0 auto; background: white; border-radius: 15px; overflow: hidden; box-shadow: 0 10px 40px rgba(0,0,0,0.1); }
    .report-hero { background: linear-gradient(135deg, #0f3557 0%, #1a4d7a 50%, #3b7fc4 100%); color: white; padding: 60px 40px; text-align: center; }
    .report-hero h1 { font-size: 2.5rem; margin-bottom: 10px; }
    .report-hero img { max-width: 250px; margin-bottom: 20px; filter: brightness(0) invert(1); }
    .grade-badge { display: inline-block; width: 120px; height: 120px; background: white; color: #1a4d7a; border-radius: 50%; font-size: 3rem; font-weight: 700; margin: 20px auto; box-shadow: 0 10px 30px rgba(26,77,122,0.3); line-height: 120px; }
    .report-section { padding: 40px; border-bottom: 1px solid #e2e8f0; }
    .report-section h2 { color: #1a4d7a; margin-bottom: 25px; font-size: 1.8rem; }
    .stats-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 20px; margin-bottom: 30px; }
    .stat-card { background: linear-gradient(135deg, #e7f2fa 0%, #d1e7f7 100%); padding: 25px; border-radius: 10px; text-align: center; border: 1px solid #b8d4f1; }
    .stat-value { font-size: 2.5rem; font-weight: 700; color: #0f3557; margin-bottom: 5px; }
    .stat-label { color: #64748b; font-size: 0.9rem; }
    ul { list-style: none; margin: 20px 0; }
    ul li { padding: 12px 0; padding-left: 30px; position: relative; }
    ul li:before { content: "✓"; position: absolute; left: 0; color: #10b981; font-weight: bold; }
    .question-review { margin-bottom: 20px; padding: 20px; background: #f8fafc; border-radius: 10px; border-left: 4px solid #cbd5e1; }
    .question-review.correct { border-left-color: #10b981; }
    .question-review.incorrect { border-left-color: #ef4444; }
  </style>
</head>
<body>
  ${element.innerHTML}
</body>
</html>
    `;

    const blob = new Blob([htmlContent], { type: 'text/html' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${testData.studentInfo.name}_${testData.topic.name}_Report.html`;
    a.click();
    URL.revokeObjectURL(url);
  };

  if (loading) {
    return (
      <div className="test-container">
        <div className="loading">
          <div className="loading-spinner"></div>
          <div>Generating your personalized report...</div>
        </div>
      </div>
    );
  }

  const percentage = Math.round((testData.score / testData.maxScore) * 100);
  const correctAnswers = testData.answers.filter(a => a.isCorrect).length;
  const avgTimePerQuestion = Math.round(testData.timeUsed / testData.answers.length);

  return (
    <div style={{ padding: '20px', background: 'linear-gradient(135deg, #f8f9fa 0%, #e8f1f8 50%, #f8f9fa 100%)', minHeight: '100vh' }}>
      <div className="report-container" ref={reportRef}>
        <div className="report-hero">
          <img
            src="https://mitwpu.edu.in/uploads/images/MIT-WPU-logo-1.webp"
            alt="MIT-WPU Logo"
            style={{
              maxWidth: '280px',
              height: 'auto',
              marginBottom: '20px',
              filter: 'brightness(0) invert(1) drop-shadow(0 0 10px rgba(255,255,255,0.3))'
            }}
          />
          <h1>{testData.studentInfo.name}</h1>
          <div className="report-prn">PRN: {testData.studentInfo.prn}</div>
          <div className="grade-badge">{insights.grade}</div>
          <h2>Assessment Report - {testData.topic.name}</h2>
          <p style={{ fontSize: '0.9rem', opacity: '0.9', marginTop: '10px' }}>
            MIT World Peace University, Pune
          </p>
        </div>

        <div className="report-section">
          <h2>📊 Performance Overview</h2>
          <div className="stats-grid">
            <div className="stat-card">
              <div className="stat-value">{testData.score}</div>
              <div className="stat-label">Total Score</div>
            </div>
            <div className="stat-card">
              <div className="stat-value">{percentage}%</div>
              <div className="stat-label">Percentage</div>
            </div>
            <div className="stat-card">
              <div className="stat-value">{correctAnswers}/{testData.answers.length}</div>
              <div className="stat-label">Correct Answers</div>
            </div>
            <div className="stat-card">
              <div className="stat-value">{avgTimePerQuestion}s</div>
              <div className="stat-label">Avg Time/Question</div>
            </div>
          </div>
        </div>

        {insights.strengths && insights.strengths.length > 0 && (
          <div className="report-section">
            <h2>💪 Strengths</h2>
            <ul className="insights-list">
              {insights.strengths.map((strength, index) => (
                <li key={index}>{strength}</li>
              ))}
            </ul>
          </div>
        )}

        {insights.weaknesses && insights.weaknesses.length > 0 && (
          <div className="report-section">
            <h2>📈 Areas for Improvement</h2>
            <ul className="insights-list weaknesses">
              {insights.weaknesses.map((weakness, index) => (
                <li key={index}>{weakness}</li>
              ))}
            </ul>
          </div>
        )}

        {insights.recommendations && insights.recommendations.length > 0 && (
          <div className="report-section">
            <h2>💡 Recommendations</h2>
            <ul className="insights-list">
              {insights.recommendations.map((rec, index) => (
                <li key={index}>{rec}</li>
              ))}
            </ul>
          </div>
        )}

        {insights.studyPlan && (
          <div className="report-section">
            <h2>📚 Personalized Study Plan</h2>
            <p style={{ lineHeight: '1.8', color: '#475569' }}>{insights.studyPlan}</p>
          </div>
        )}

        <div className="report-section">
          <h2>📝 Question-by-Question Review</h2>
          {testData.answers.map((answer, index) => (
            <div
              key={index}
              className={`question-review ${answer.isCorrect ? 'correct' : 'incorrect'}`}
            >
              <div className="question-review-header">
                <span>Question {answer.questionNumber} - {answer.type.toUpperCase()}</span>
                <span>{answer.pointsAwarded}/{answer.maxPoints} points</span>
              </div>
              <div dangerouslySetInnerHTML={{ __html: answer.question }} style={{ margin: '10px 0', fontWeight: '600' }} />
              <div className="review-answer">
                <strong>Your Answer:</strong> {answer.studentAnswer}
              </div>
              {!answer.isCorrect && (
                <div className="review-answer" style={{ marginTop: '5px' }}>
                  <strong>Correct Answer:</strong> {answer.correctAnswer}
                </div>
              )}
              <div style={{ marginTop: '10px', color: '#64748b', fontSize: '0.9rem' }}>
                {answer.feedback}
              </div>
            </div>
          ))}
        </div>

        {insights.encouragement && (
          <div className="report-section" style={{ textAlign: 'center', background: '#f8fafc' }}>
            <h2>🎉 {insights.encouragement}</h2>
          </div>
        )}
      </div>

      <div className="report-actions" style={{ maxWidth: '1000px', margin: '30px auto', textAlign: 'center' }}>
        <button className="btn btn-download" onClick={downloadPDF}>
          📄 Download as PDF
        </button>
        <button className="btn btn-download btn-secondary" onClick={downloadHTML}>
          🌐 Download as HTML
        </button>
        <button className="btn btn-secondary" onClick={onRestart} style={{ marginLeft: '15px' }}>
          🔄 Take Another Test
        </button>
      </div>
    </div>
  );
}

export default Report;
