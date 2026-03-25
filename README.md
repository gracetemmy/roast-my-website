# Roast My Website 🔥

> AI-powered website roasting using voice — built for ElevenHacks Hackathon

A voice AI agent that analyzes any website and delivers brutally honest (but helpful) feedback with sass and humor.

## Demo

[Add your demo video link here]

## How It Works

```
You speak → "Roast apple.com"
     ↓
ElevenAgent captures your request
     ↓
Firecrawl scrapes & analyzes the website
     ↓
AI generates a savage (but constructive) roast
     ↓
ElevenAgent delivers it in a sassy voice
```

## Tech Stack

| Component | Technology |
|-----------|------------|
| Voice AI | [ElevenLabs Agents](https://elevenlabs.io) |
| Web Scraping | [Firecrawl](https://firecrawl.dev) |
| Backend | Node.js + Express |
| Frontend | React + Vite |

## Quick Start

### 1. Clone & Install

```bash
# Backend
cd backend
npm install
cp .env.example .env
# Add your FIRECRAWL_API_KEY to .env

# Frontend
cd ../frontend
npm install
cp .env.example .env
# Add your VITE_ELEVENLABS_AGENT_ID to .env
```

### 2. Create Your ElevenLabs Agent

1. Go to [ElevenLabs Dashboard](https://elevenlabs.io/app/conversational-ai)
2. Create a new Agent
3. Set the system prompt (see below)
4. Add a Custom Tool pointing to your backend
5. Copy the Agent ID to your frontend `.env`

### 3. Agent System Prompt

```
You are a brutally honest website critic with the personality of Gordon Ramsay mixed with a tech reviewer. Your name is "The Roast Master."

When a user gives you a URL or website name:
1. Use the roast-website tool to analyze it
2. Deliver a hilarious but constructive roast covering:
   - First impressions & visual design
   - Content quality & messaging
   - User experience red flags
   - Any obvious SEO issues

Rules:
- Be entertaining and sassy, but never mean-spirited
- Always end with ONE genuine compliment
- Keep roasts under 60 seconds
- If the tool fails, improvise with general website advice

Example roast style:
"Oh honey, this website looks like it was designed in 2005 and nobody bothered to tell it. That hero image is so pixelated I thought my glasses were broken. But I'll give credit where it's due - at least it loads fast. Probably because there's nothing ON it."
```

### 4. Custom Tool Configuration (ElevenLabs Dashboard)

**Tool Name:** `roast-website`

**Description:** Analyzes a website and returns content for roasting

**Endpoint:** `POST https://your-backend-url.com/api/roast-website`

**Parameters:**
```json
{
  "url": {
    "type": "string",
    "description": "The website URL to analyze and roast"
  }
}
```

### 5. Run Locally

```bash
# Terminal 1 - Backend
cd backend
npm run dev

# Terminal 2 - Frontend
cd frontend
npm run dev
```

Open http://localhost:3000 and start roasting!

## Deployment

### Backend (Railway/Render/Fly.io)
```bash
cd backend
# Deploy to your platform of choice
# Set FIRECRAWL_API_KEY environment variable
```

### Frontend (Vercel/Netlify)
```bash
cd frontend
npm run build
# Deploy dist folder
# Set VITE_ELEVENLABS_AGENT_ID environment variable
```

## API Endpoints

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/api/health` | GET | Health check |
| `/api/roast-website` | POST | Main roasting endpoint |
| `/api/analyze-website` | POST | Deep analysis with public opinion |

## Built With

- **ElevenLabs Conversational AI** - Voice agent platform
- **Firecrawl Search API** - Web scraping and search
- **React** - Frontend framework
- **Express** - Backend server

## Hackathon

Built for [ElevenHacks](https://elevenlabs.io) Hackathon

**Tags:** #ElevenHacks #Firecrawl

## License

MIT
