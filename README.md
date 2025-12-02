# Student Knowledge Tester

An AI-powered interactive testing application that uses Google's Gemini AI to conduct comprehensive knowledge assessments.

## Features

- **Personalized Testing**: Enter your name and PRN to start
- **Multiple Topics**: Choose from 10+ predefined technical topics
- **AI-Powered Questions**: Gemini generates dynamic questions including:
  - Multiple Choice Questions (MCQ)
  - True/False
  - Descriptive Questions
  - Scenario-based Problems
- **Adaptive Difficulty**: Questions adjust based on student performance
- **20-Minute Test**: Comprehensive timed assessment
- **Beautiful Reports**: AI-generated insights with:
  - Performance overview
  - Strengths and weaknesses
  - Personalized study plan
  - Question-by-question review
- **Downloadable Reports**: Export as PDF or standalone HTML

## Setup Instructions

### 1. Install Dependencies

```bash
npm install
```

### 2. Configure Gemini API Key

1. Get your API key from [Google AI Studio](https://makersuite.google.com/app/apikey)
2. Open `src/config/api.js`
3. Split your API key into three parts and add them:

```javascript
const API_KEY_PART1 = "AIzaSy";
const API_KEY_PART2 = "YOUR_MIDDLE_PART"; // Add your middle part
const API_KEY_PART3 = "YOUR_END_PART";    // Add your ending part
```

**Security Note**: Set usage quotas on your API key in Google AI Studio to prevent abuse.

### 3. Run Development Server

```bash
npm run dev
```

Visit `http://localhost:5173` to see the application.

### 4. Build for Production

```bash
npm run build
```

## Deploy to GitHub Pages

### 1. Update `vite.config.js`

Change the `base` to match your repository name:

```javascript
base: '/your-repo-name/'
```

### 2. Deploy

```bash
npm run deploy
```

This will build the project and push it to the `gh-pages` branch.

### 3. Enable GitHub Pages

1. Go to your repository settings
2. Navigate to Pages section
3. Select `gh-pages` branch as the source
4. Save

Your app will be live at: `https://yourusername.github.io/your-repo-name/`

## Usage

1. **Welcome Screen**: Enter your name and PRN
2. **Topic Selection**: Choose a topic to test your knowledge
3. **Take Test**: Answer 20-minute AI-generated questions
4. **View Report**: Get detailed insights and download your report

## Technologies Used

- **React 18** - UI framework
- **Vite** - Build tool
- **Google Gemini AI** - Question generation and evaluation
- **Recharts** - Data visualization
- **html2canvas + jsPDF** - PDF generation

## Project Structure

```
testt/
├── src/
│   ├── components/
│   │   ├── Welcome.jsx
│   │   ├── TopicSelection.jsx
│   │   ├── TestPlayground.jsx
│   │   └── Report.jsx
│   ├── config/
│   │   └── api.js
│   ├── utils/
│   │   └── geminiService.js
│   ├── styles/
│   │   └── App.css
│   ├── App.jsx
│   └── main.jsx
├── index.html
├── package.json
└── vite.config.js
```

## Important Notes

- Remember to remove or rotate your API key before making the repository public
- Set appropriate usage quotas on your Gemini API key
- The API key will be visible in the client-side code (it's split for basic obfuscation only)

## License

MIT

## Contributing

Feel free to fork and submit pull requests!
