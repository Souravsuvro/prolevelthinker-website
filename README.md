# ProLevelThinker website

Static multi-page site for ProLevelThinker (Ontario strategy · Sylhet engineering).
Live: https://prolevelthinker.vercel.app

## Phase A — wire real leads

Edit `assets/config.js` and push to `main`:

| Key | Where to get it |
|-----|-----------------|
| `WHATSAPP_NUMBER` | Your WhatsApp Business number, digits only (e.g. `88017XXXXXXXX`) |
| `FORMSPREE_ENDPOINT` | https://formspree.io → new form → endpoint URL |
| `GA_MEASUREMENT_ID` | Google Analytics 4 → Measurement ID (`G-…`) |
| `CALENDAR_URL` | Cal.com or Calendly public booking link |
| `CONTACT_EMAIL` | Public email shown in footer |

Until Formspree is set, the contact form falls back to WhatsApp with a pre-filled summary.

## Structure

- `/` homepage (services, work, tools, FAQ, contact)
- `/tools/*` free interactive tools
- `/portfolio/*` case concepts
- `/insights/*` guides
- Service pages, about, legal, teardowns

## Deploy

Connected to Vercel via GitHub `main`. Push to `main` auto-deploys.

```bash
git add .
git commit -m "Your message"
git push origin main
```
