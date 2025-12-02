import { GoogleGenerativeAI } from '@google/generative-ai';
import { getGeminiApiKey } from '../config/api';

let genAI = null;
let model = null;

// Initialize Gemini AI
export const initializeGemini = () => {
  const apiKey = getGeminiApiKey();
  genAI = new GoogleGenerativeAI(apiKey);
  model = genAI.getGenerativeModel({ model: 'gemini-2.5-flash' });
};

// Generate initial test questions
export const generateTestQuestions = async (topic, studentInfo) => {
  if (!model) initializeGemini();

  const prompt = `You are an intelligent examiner conducting a comprehensive 20-minute test for a student on the topic: "${topic}".

Student Information:
- Name: ${studentInfo.name}
- PRN: ${studentInfo.prn}

INSTRUCTIONS:
1. Generate the FIRST question only (not all questions at once)
2. Mix question types: Multiple Choice (4 options), True/False, Descriptive, Scenario-based
3. Start with medium difficulty
4. Make questions engaging and practical
5. Format your response as JSON

CRITICAL RULES:
- Question text CAN include HTML formatting (like <pre><code> for code blocks)
- Options array MUST contain PLAIN TEXT ONLY - NO HTML TAGS
- If showing code in options, write it as plain text (e.g., "x = 10" not "<code>x = 10</code>")
- Points based on difficulty: MCQ/True-False = 5 points, Descriptive = 10 points, Scenario = 15 points

Required JSON format:
{
  "questionNumber": 1,
  "type": "mcq|descriptive|truefalse|scenario",
  "difficulty": "easy|medium|hard",
  "question": "The question text (HTML allowed here)",
  "options": ["Plain text option 1", "Plain text option 2", "Plain text option 3", "Plain text option 4"],
  "points": 5,
  "hint": "Optional hint text"
}

EXAMPLE - CORRECT:
{
  "questionNumber": 1,
  "type": "mcq",
  "difficulty": "easy",
  "question": "What is the output of: <pre><code>print(5 + 3)</code></pre>",
  "options": ["5 + 3", "53", "8", "Error"],
  "points": 5
}

For descriptive questions, set options to null.
Generate the first question now in JSON format only.`;

  try {
    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();

    // Extract JSON from the response
    const jsonMatch = text.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      return JSON.parse(jsonMatch[0]);
    }
    throw new Error('Invalid response format');
  } catch (error) {
    console.error('Error generating question:', error);
    throw error;
  }
};

// Generate next question based on previous answers
export const generateNextQuestion = async (topic, questionNumber, previousAnswers, studentPerformance) => {
  if (!model) initializeGemini();

  const performanceSummary = previousAnswers.slice(-3).map(a =>
    `Q${a.questionNumber}: ${a.isCorrect ? 'Correct' : 'Incorrect'} (${a.timeSpent}s)`
  ).join(', ');

  const prompt = `You are continuing a test on "${topic}". This is question ${questionNumber}.

Recent Performance: ${performanceSummary}
Current Score: ${studentPerformance.score}/${studentPerformance.maxScore}
Accuracy: ${studentPerformance.accuracy}%

INSTRUCTIONS:
1. Generate question ${questionNumber} based on student's performance
2. If student is doing well (>75% accuracy), increase difficulty
3. If student is struggling (<50% accuracy), provide easier questions with encouragement
4. Vary question types for engagement
5. Make it relevant and practical

CRITICAL RULES:
- Question text CAN include HTML formatting (like <pre><code> for code blocks)
- Options array MUST contain PLAIN TEXT ONLY - NO HTML TAGS IN OPTIONS
- If showing code in options, write it as plain text (e.g., "x = 10" not "<code>x = 10</code>")
- Points: MCQ/True-False = 5 points, Descriptive = 10 points, Scenario = 15 points

Required JSON format:
{
  "questionNumber": ${questionNumber},
  "type": "mcq|descriptive|truefalse|scenario",
  "difficulty": "easy|medium|hard",
  "question": "The question text (HTML allowed here for code blocks)",
  "options": ["Plain text option 1", "Plain text option 2", "Plain text option 3", "Plain text option 4"],
  "points": 5,
  "hint": "Optional hint text"
}

EXAMPLE - CORRECT FORMAT:
{
  "questionNumber": 2,
  "type": "mcq",
  "difficulty": "medium",
  "question": "Which code prints 'Hello'?<br><pre><code>print('Hello')</code></pre>",
  "options": ["print('Hello')", "echo 'Hello'", "console.log('Hello')", "printf('Hello')"],
  "points": 5
}

Generate question ${questionNumber} in JSON format only.`;

  try {
    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();

    const jsonMatch = text.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      return JSON.parse(jsonMatch[0]);
    }
    throw new Error('Invalid response format');
  } catch (error) {
    console.error('Error generating next question:', error);
    throw error;
  }
};

// Evaluate student's answer
export const evaluateAnswer = async (question, studentAnswer, timeSpent) => {
  if (!model) initializeGemini();

  const prompt = `Evaluate this student's answer:

Question Type: ${question.type}
Question: ${question.question}
${question.options ? `Correct Answer (if MCQ): ${question.correctAnswer || 'Not specified'}` : ''}
Student's Answer: ${studentAnswer}
Time Spent: ${timeSpent} seconds

INSTRUCTIONS:
1. Evaluate the answer thoroughly
2. For MCQs/True-False: Award FULL points (${question.points}) if correct, 0 if wrong - NO PARTIAL CREDIT
3. For descriptive: Award 0 to ${question.points} based on quality
4. Provide constructive feedback
5. Be encouraging but honest

SCORING RULES:
- MCQ/True-False: ${question.points} points if correct, 0 if wrong
- Descriptive: Partial credit allowed (0-${question.points})
- Scenario: Partial credit allowed (0-${question.points})

Required JSON format:
{
  "isCorrect": true|false,
  "pointsAwarded": (must be a number between 0 and ${question.points}),
  "feedback": "Detailed feedback for the student",
  "correctAnswer": "The correct/ideal answer (plain text, no HTML)",
  "keyPoints": ["key point 1", "key point 2"]
}

IMPORTANT: For MCQ/True-False, pointsAwarded must be either 0 or ${question.points} (no partial credit).
Respond in JSON format only.`;

  try {
    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();

    const jsonMatch = text.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      return JSON.parse(jsonMatch[0]);
    }
    throw new Error('Invalid response format');
  } catch (error) {
    console.error('Error evaluating answer:', error);
    throw error;
  }
};

// Generate final report insights
export const generateReportInsights = async (studentInfo, topic, answers, finalScore) => {
  if (!model) initializeGemini();

  const answersSummary = answers.map(a => ({
    q: a.questionNumber,
    correct: a.isCorrect,
    points: a.pointsAwarded,
    time: a.timeSpent
  }));

  const prompt = `Generate a comprehensive test report for:

Student: ${studentInfo.name} (${studentInfo.prn})
Topic: ${topic}
Final Score: ${finalScore.score}/${finalScore.maxScore} (${finalScore.percentage}%)
Total Questions: ${answers.length}
Correct: ${answers.filter(a => a.isCorrect).length}
Time: 20 minutes

Answers Summary: ${JSON.stringify(answersSummary)}

INSTRUCTIONS:
Generate detailed insights in JSON format:
{
  "grade": "A+|A|B+|B|C|D|F",
  "strengths": ["strength 1", "strength 2", "strength 3"],
  "weaknesses": ["weakness 1", "weakness 2"],
  "recommendations": ["recommendation 1", "recommendation 2", "recommendation 3"],
  "studyPlan": "Personalized study plan paragraph",
  "encouragement": "Motivational message",
  "topicMastery": {
    "conceptName1": 85,
    "conceptName2": 70,
    "conceptName3": 90
  }
}

Provide JSON only.`;

  try {
    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();

    const jsonMatch = text.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      return JSON.parse(jsonMatch[0]);
    }
    throw new Error('Invalid response format');
  } catch (error) {
    console.error('Error generating insights:', error);
    throw error;
  }
};
