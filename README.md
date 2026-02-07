# The Polymarket Times

AI-powered news from Polymarket prediction markets with Atlantic-style design.

## 🚀 Quick Start (Step-by-Step for Non-Developers)

### Step 1: Install Node.js
1. Go to https://nodejs.org
2. Download the LTS version (Long Term Support)
3. Install it (just click Next, Next, Finish)
4. Restart your computer

### Step 2: Set Up the Project
1. Open VS Code
2. Click "File" → "Open Folder"
3. Navigate to where you saved this project folder
4. Open the Terminal in VS Code: View → Terminal (or Ctrl + `)

### Step 3: Install Dependencies
In the terminal, type these commands one at a time:

```bash
npm install
```

Wait for it to finish (you'll see a progress bar).

### Step 4: Test Locally
In the terminal, type:

```bash
npm run dev
```

You should see: "🚀 Polymarket Times running on http://localhost:3000"

Open your browser and go to: http://localhost:3000

You should see your website!

## 📦 Deploy to Your Domain (FREE OPTIONS)

### Option 1: Render.com (RECOMMENDED - Easiest)

**Step-by-step:**

1. **Push to GitHub:**
   - In VS Code terminal:
   ```bash
   git init
   git add .
   git commit -m "Initial commit"
   git branch -M main
   git remote add origin https://github.com/YOUR_USERNAME/polymarket-times.git
   git push -u origin main
   ```

2. **Deploy on Render:**
   - Go to https://render.com
   - Click "Sign Up" (use your GitHub account)
   - Click "New" → "Web Service"
   - Connect your GitHub repository
   - Settings:
     - Name: polymarket-times
     - Build Command: `npm install`
     - Start Command: `npm start`
   - Click "Create Web Service"
   - Wait 2-3 minutes for deployment

3. **Connect Your Domain:**
   - In Render dashboard, click "Settings"
   - Scroll to "Custom Domain"
   - Add: thepolymarkettimes.com
   - Copy the DNS instructions
   - Go to your domain registrar (where you bought the domain)
   - Add the CNAME record as instructed
   - Wait 5-60 minutes for DNS to update

### Option 2: Railway.app

1. Go to https://railway.app
2. Sign up with GitHub
3. Click "New Project" → "Deploy from GitHub repo"
4. Select your repository
5. Add custom domain in settings

### Option 3: Vercel

1. Go to https://vercel.com
2. Sign up with GitHub
3. Click "Import Project"
4. Select your repository
5. Deploy settings:
   - Build Command: Leave empty
   - Output Directory: Leave empty
6. Add custom domain in project settings

## 🔧 Customization

### Change Colors
Edit `/public/css/style.css`:
- Line 18-23: Change colors in `:root` section

### Add AI-Generated Content
To integrate Claude API for better articles:

1. Get API key from https://console.anthropic.com
2. Install the Anthropic SDK:
   ```bash
   npm install @anthropic-ai/sdk
   ```
3. Add to `server.js` (replace the `generateArticle` function):

```javascript
const Anthropic = require('@anthropic-ai/sdk');
const anthropic = new Anthropic({
    apiKey: 'your-api-key-here'
});

async function generateArticle(market) {
    try {
        const message = await anthropic.messages.create({
            model: "claude-sonnet-4-5-20250929",
            max_tokens: 1024,
            messages: [{
                role: "user",
                content: `Write a news article about this prediction market: "${market.question}". Current probability: ${market.outcomePrices ? (parseFloat(market.outcomePrices[0]) * 100).toFixed(1) : 'N/A'}%. Keep it under 200 words.`
            }]
        });
        
        return {
            id: market.id || Date.now(),
            title: market.question,
            summary: message.content[0].text,
            category: market.category || 'Politics',
            probability: market.outcomePrices ? (parseFloat(market.outcomePrices[0]) * 100).toFixed(1) : 'N/A',
            volume: market.volume || 0,
            image: market.image || 'https://via.placeholder.com/800x400',
            createdAt: new Date(),
            marketUrl: `https://polymarket.com/event/${market.slug || market.id}`
        };
    } catch (error) {
        console.error('Error generating article:', error);
        return generateArticle(market); // Fallback to simple version
    }
}
```

## 📝 How It Works

1. **Server** (`server.js`): Fetches Polymarket data every hour
2. **Templates** (`views/`): Display the data in Atlantic style
3. **Styles** (`public/css/`): Make it look professional
4. **Automatic Updates**: New markets fetched every hour

## 🐛 Troubleshooting

**Problem:** "Port 3000 already in use"
**Solution:** Change PORT in server.js or run: `npx kill-port 3000`

**Problem:** Website not updating
**Solution:** The cron job runs every hour. Force update by restarting the server (Ctrl+C, then `npm run dev`)

**Problem:** No articles showing
**Solution:** Check console for errors. Polymarket API might be down temporarily.

## 📞 Support

- Polymarket API Docs: https://docs.polymarket.com
- Render Docs: https://render.com/docs
- Need help? Check server logs in your terminal

## 🎯 Next Steps

1. ✅ Get it running locally
2. ✅ Push to GitHub
3. ✅ Deploy to Render
4. ✅ Connect your domain
5. 🔄 Add Claude API for AI articles
6. 🎨 Customize colors/design
7. 📊 Add analytics (Google Analytics)

Good luck! 🚀
