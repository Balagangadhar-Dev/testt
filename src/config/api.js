// Split API key for basic obfuscation
// Remember to set usage quotas on your Gemini API key
const API_KEY_PART1 = "AIzaSyAYy-bYwY";
const API_KEY_PART2 = "Mwx_vxF2n_UkxY"; // Add your middle part here
const API_KEY_PART3 = "E1oNSol4ayU"; // Add your ending part here

// Concatenate the API key parts
export const getGeminiApiKey = () => {
  return API_KEY_PART1 + API_KEY_PART2 + API_KEY_PART3;
};

// Predefined topics for testing
export const TOPICS = [
  { id: 'data-structures', name: 'Data Structures', icon: '🗂️' },
  { id: 'algorithms', name: 'Algorithms', icon: '⚙️' },
  { id: 'web-development', name: 'Web Development', icon: '🌐' },
  { id: 'databases', name: 'Databases', icon: '💾' },
  { id: 'operating-systems', name: 'Operating Systems', icon: '🖥️' },
  { id: 'networking', name: 'Computer Networks', icon: '🌐' },
  { id: 'oops', name: 'Object Oriented Programming', icon: '🎯' },
  { id: 'python', name: 'Python Programming', icon: '🐍' },
  { id: 'javascript', name: 'JavaScript', icon: '⚡' },
  { id: 'react', name: 'React.js', icon: '⚛️' }
];

// Test configuration
export const TEST_CONFIG = {
  duration: 20, // minutes
  totalQuestions: 15, // approximate number of questions (aim for 75-100 total points)
  scoreWeights: {
    mcq: 5,           // 5 points per MCQ/True-False question
    descriptive: 10,  // 10 points per descriptive question
    scenario: 15      // 15 points per scenario question
  }
};
