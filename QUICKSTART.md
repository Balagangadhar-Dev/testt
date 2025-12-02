# Quick Start Guide

## Step 1: Get Your Gemini API Key

1. Visit [Google AI Studio](https://makersuite.google.com/app/apikey)
2. Sign in with your Google account
3. Click "Create API Key"
4. Copy the generated API key

## Step 2: Configure API Key

1. Open `src/config/api.js`
2. Split your API key into 3 parts. For example:
   - If your key is: `AIzaSyABC123XYZ789`
   - Split it as:
     - Part 1: `AIzaSy`
     - Part 2: `ABC123`
     - Part 3: `XYZ789`

3. Update the file:

```javascript
const API_KEY_PART1 = "AIzaSy";
const API_KEY_PART2 = "ABC123";  // Your middle part
const API_KEY_PART3 = "XYZ789";  // Your ending part
```

## Step 3: Run the App

```bash
# Development mode
npm run dev
```

Open your browser and visit: `http://localhost:5173`

## Step 4: Test the Application

1. Enter your name and PRN
2. Select a topic (e.g., "Data Structures")
3. Take the 20-minute test
4. View your beautiful report
5. Download as PDF or HTML

## Step 5: Deploy to GitHub Pages

### First-time setup:

1. Create a new repository on GitHub
2. Initialize git in your project:

```bash
git init
git add .
git commit -m "Initial commit"
git branch -M main
git remote add origin https://github.com/YOUR_USERNAME/YOUR_REPO_NAME.git
git push -u origin main
```

3. Go to repository Settings → Pages
4. Set Source to "GitHub Actions"

### The workflow will automatically deploy on every push to main!

Alternatively, use manual deployment:

```bash
npm run deploy
```

Your app will be live at: `https://YOUR_USERNAME.github.io/testt/`

## Important Security Notes

1. **Set API Quotas**: In Google AI Studio, set daily/monthly limits on your API key
2. **Referer Restrictions**: If possible, restrict the API key to your GitHub Pages domain
3. **Remove Before Public**: Before making the repo public, remove or rotate the API key

## Troubleshooting

### API Key Not Working
- Double-check the key is split correctly
- Ensure no extra spaces in the key parts
- Verify the key is enabled in Google AI Studio

### Build Errors
```bash
# Clear cache and reinstall
rm -rf node_modules package-lock.json
npm install
```

### Deployment Issues
- Ensure `vite.config.js` has the correct `base` value
- Check GitHub Pages is enabled in repository settings
- Wait 2-3 minutes after deployment for changes to appear

## Need Help?

Check the main README.md for detailed information or create an issue on GitHub.

Happy Testing! 🎓
