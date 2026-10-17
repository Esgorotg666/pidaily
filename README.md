# PiDaily

Daily utility tools for Pi Network Pioneers.

## Features
- Pi authentication via Pi SDK
- Premium unlock with 1 π payment
- Built for Pi Browser

## Setup
1. Clone the repo
2. `npm install`
3. Create `.env.local` with `PI_API_KEY=your_key`
4. Deploy to Vercel
5. Register the app in Pi Developer Portal (inside Pi Browser) and point it to your Vercel URL

## Deploy
Connect this repo to Vercel. Add `PI_API_KEY` as an environment variable.

Set `sandbox: true` in `app/page.js` for testing, `false` for production.
