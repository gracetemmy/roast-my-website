import express from 'express';
import cors from 'cors';
import Firecrawl from '@mendable/firecrawl-js';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();

// Allow ALL origins including file:// and null
app.use(cors({
  origin: '*',
  methods: ['GET', 'POST', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

app.use(express.json());

// Serve frontend from parent directory
app.use(express.static(path.join(__dirname, '..')));

// Initialize Firecrawl
const firecrawl = new Firecrawl({ apiKey: process.env.FIRECRAWL_API_KEY });

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', service: 'roast-my-website' });
});

/**
 * Main endpoint for ElevenAgent tool integration
 * Scrapes a website and returns content for roasting
 * Has fallback to search if direct scrape fails
 */
app.post('/api/roast-website', async (req, res) => {
  try {
    let { url } = req.body;

    if (!url) {
      return res.status(400).json({ error: 'URL is required' });
    }

    // Ensure URL has protocol
    if (!url.startsWith('http://') && !url.startsWith('https://')) {
      url = 'https://' + url;
    }

    // Extract domain for fallback searches
    const domain = url.replace(/^https?:\/\//, '').split('/')[0];

    console.log(`🔥 Roasting website: ${url}`);

    let result = null;
    let method = 'scrape';

    // Method 1: Try direct scraping first
    try {
      result = await firecrawl.scrapeUrl(url, {
        formats: ['markdown', 'html'],
        onlyMainContent: true,
        timeout: 30000
      });
    } catch (scrapeError) {
      console.log(`Direct scrape failed for ${url}: ${scrapeError.message}`);
    }

    // Method 2: If scrape failed, try search as fallback
    if (!result || !result.success) {
      console.log(`Trying search fallback for: ${domain}`);
      method = 'search';

      try {
        // Use Firecrawl Search API - response has data.web array
        const searchResult = await firecrawl.search(`${domain} website`, {
          limit: 3,
          scrapeOptions: { formats: ['markdown'] }
        });

        // Firecrawl v2 returns { success, data: { web: [...] } }
        const webResults = searchResult.data?.web || searchResult.data || [];

        if (searchResult.success && webResults.length > 0) {
          // Find the most relevant result (matching domain)
          const relevant = webResults.find(r =>
            r.url && r.url.includes(domain)
          ) || webResults[0];

          result = {
            success: true,
            title: relevant.title || domain,
            description: relevant.description || relevant.snippet || '',
            markdown: relevant.markdown || relevant.content || `Information about ${domain}`,
            metadata: { source: 'search', url: relevant.url }
          };
        }
      } catch (searchError) {
        console.log(`Search fallback also failed: ${searchError.message}`);
      }
    }

    // Method 3: If everything failed, return basic info so UI can still work
    if (!result || !result.success) {
      console.log(`All methods failed, returning basic info for: ${domain}`);
      return res.json({
        success: true, // Mark success so frontend can still generate a roast
        data: {
          url: url,
          title: domain,
          description: `Website at ${domain}`,
          content: `This is ${domain}. The site has strong protection against automated access, which could mean they either have something to hide or take security seriously. Without being able to peek inside, we can only judge by reputation and what the URL tells us.`,
          metadata: { blocked: true, reason: 'Site has bot protection' }
        },
        warning: 'Site blocked direct access - roast based on limited info'
      });
    }

    // Return structured data for the LLM to roast
    res.json({
      success: true,
      data: {
        url: url,
        title: result.title || result.metadata?.title || domain,
        description: result.description || result.metadata?.description || '',
        content: result.markdown || 'No content available',
        metadata: { ...result.metadata, method }
      }
    });

  } catch (error) {
    console.error('Error scraping website:', error);

    // Even on error, return something usable
    const domain = req.body.url?.replace(/^https?:\/\//, '').split('/')[0] || 'unknown';
    res.json({
      success: true,
      data: {
        url: req.body.url,
        title: domain,
        description: '',
        content: `Couldn't fully analyze ${domain} due to: ${error.message}. But we can still roast what we know!`,
        metadata: { error: true, message: error.message }
      },
      warning: 'Partial analysis due to error'
    });
  }
});

/**
 * Analyze endpoint - provides structured analysis for better roasts
 * Uses Firecrawl Search to find site info and public opinions
 */
app.post('/api/analyze-website', async (req, res) => {
  try {
    const { url } = req.body;

    if (!url) {
      return res.status(400).json({ error: 'URL is required' });
    }

    const domain = url.replace(/^https?:\/\//, '').split('/')[0];

    // Search for the site plus reviews/opinions about it
    const [siteResults, reviewResults] = await Promise.all([
      firecrawl.search(`${domain}`, {
        limit: 1,
        scrapeOptions: { formats: ['markdown', 'links'] }
      }),
      firecrawl.search(`${domain} review OR opinion`, {
        limit: 3,
        tbs: 'qdr:y' // Past year
      })
    ]);

    // Handle Firecrawl v2 response structure
    const siteWeb = siteResults.data?.web || siteResults.data || [];
    const reviewWeb = reviewResults.data?.web || reviewResults.data || [];

    res.json({
      success: true,
      site: siteWeb[0] || null,
      publicOpinion: reviewWeb
    });

  } catch (error) {
    console.error('Error analyzing website:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`🔥 Roast My Website API running on http://localhost:${PORT}`);
  console.log(`📡 ElevenAgent tool endpoint: POST /api/roast-website`);
});
