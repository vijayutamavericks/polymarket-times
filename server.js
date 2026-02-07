const express = require('express');
const axios = require('axios');
const cron = require('node-cron');

const app = express();
const PORT = process.env.PORT || 3000;

// Set up EJS templating
app.set('view engine', 'ejs');
app.use(express.static('public'));

// Store articles in memory (you can later use a database)
let articles = [];

// Check if Claude API key is available
const ANTHROPIC_API_KEY = process.env.ANTHROPIC_API_KEY;
const USE_AI = !!ANTHROPIC_API_KEY;

// Function to fetch Polymarket markets
async function fetchPolymarketMarkets() {
    try {
        const response = await axios.get('https://gamma-api.polymarket.com/markets?limit=20&closed=false');
        return response.data;
    } catch (error) {
        console.error('Error fetching Polymarket data:', error.message);
        return [];
    }
}

// Function to generate AI article using Claude
async function generateAIArticle(market) {
    if (!USE_AI) {
        return generateSimpleArticle(market);
    }

    try {
        const response = await axios.post(
            'https://api.anthropic.com/v1/messages',
            {
                model: 'claude-sonnet-4-5-20250929',
                max_tokens: 1024,
                messages: [{
                    role: 'user',
                    content: `Write a concise news article (150-200 words) about this prediction market:

Question: "${market.question}"
Current Probability: ${market.outcomePrices ? (parseFloat(market.outcomePrices[0]) * 100).toFixed(1) : 'N/A'}%
Category: ${market.category || 'General'}

Write it as a news article analyzing what this prediction market tells us about future events. Keep it objective and informative. Don't use phrases like "prediction market shows" - just report on the event itself.`
                }]
            },
            {
                headers: {
                    'x-api-key': ANTHROPIC_API_KEY,
                    'anthropic-version': '2023-06-01',
                    'content-type': 'application/json'
                }
            }
        );

        const aiSummary = response.data.content[0].text;

        return {
            id: market.id || Date.now(),
            title: market.question,
            summary: aiSummary,
            category: market.category || 'Politics',
            probability: market.outcomePrices ? (parseFloat(market.outcomePrices[0]) * 100).toFixed(1) : 'N/A',
            volume: market.volume || 0,
            image: market.image || 'https://via.placeholder.com/800x400',
            createdAt: new Date(),
            marketUrl: `https://polymarket.com/event/${market.slug || market.id}`
        };
    } catch (error) {
        console.error('Error generating AI article:', error.message);
        return generateSimpleArticle(market);
    }
}

// Fallback: generate simple article without AI
function generateSimpleArticle(market) {
    const article = {
        id: market.id || Date.now(),
        title: `${market.question}`,
        summary: market.description || `Analysis of the prediction market: ${market.question}`,
        category: market.category || 'Politics',
        probability: market.outcomePrices ? (parseFloat(market.outcomePrices[0]) * 100).toFixed(1) : 'N/A',
        volume: market.volume || 0,
        image: market.image || 'https://via.placeholder.com/800x400',
        createdAt: new Date(),
        marketUrl: `https://polymarket.com/event/${market.slug || market.id}`
    };
    return article;
}

// Use the AI version as the main function
async function generateArticle(market) {
    return await generateAIArticle(market);
}

// Update articles periodically
async function updateArticles() {
    console.log('Fetching latest Polymarket data...');
    const markets = await fetchPolymarketMarkets();
    
    if (markets && markets.length > 0) {
        const newArticles = await Promise.all(
            markets.slice(0, 15).map(market => generateArticle(market))
        );
        articles = newArticles;
        console.log(`Updated ${articles.length} articles`);
    }
}

// Schedule updates every hour
cron.schedule('0 * * * *', updateArticles);

// Initial fetch
updateArticles();

// Routes
app.get('/', (req, res) => {
    res.render('index', { 
        articles: articles,
        featured: articles[0] || null,
        recent: articles.slice(1, 6) || []
    });
});

app.get('/article/:id', (req, res) => {
    const article = articles.find(a => a.id == req.params.id);
    if (article) {
        res.render('article', { article });
    } else {
        res.redirect('/');
    }
});

app.listen(PORT, () => {
    console.log(`🚀 Polymarket Times running on http://localhost:${PORT}`);
});
