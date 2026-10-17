# PiDaily

Full daily utility app for Pi Network Pioneers.

## Features
- **Pi Authentication** — Login with your Pi identity inside Pi Browser
- **Notes** — Free (5 notes) / Premium (50 notes), local storage
- **Calculator** — Basic arithmetic
- **Countdown Timer** — Quick focus timers (1, 5, 10, 15, 25 min)
- **Daily Check-in** — Streak tracking
- **Tip Jar** — Send any amount of π to support the app
- **Premium Unlock** — 1 π one-time for higher limits

## Setup & Deploy
1. Clone or import this repo into Vercel
2. Add environment variable in Vercel:
   - `PI_API_KEY` = your server API key from Pi Developer Portal
3. Deploy
4. In Pi Browser → Develop → register the app and set the URL to your Vercel deployment
5. Open the Vercel URL **inside Pi Browser** to use it

## Sandbox vs Production
In `app/page.js`, the line:
```js
window.Pi.init({ version: '2.0', sandbox: true });
```
Set `sandbox: false` when you go live on Mainnet.

## Notes
- Premium status and notes are stored in localStorage (device-specific). For multi-device sync, add Supabase later.
- Always test payments in sandbox first.
- Incomplete payments are handled on next login.
