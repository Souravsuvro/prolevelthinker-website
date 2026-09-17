/**
 * ProLevelThinker site configuration
 * ----------------------------------
 * SETUP (Phase A — required for real leads):
 *
 * 1. WhatsApp
 *    WHATSAPP_NUMBER = country code + number, no + or spaces
 *    Example Bangladesh: "8801712345678"
 *
 * 2. Formspree (contact form)
 *    Create a form at https://formspree.io → copy endpoint
 *    Example: "https://formspree.io/f/xxxxxxxx"
 *
 * 3. Google Analytics 4
 *    Create a GA4 property → Admin → Data streams → Measurement ID
 *    Example: "G-XXXXXXXXXX"
 *
 * 4. Calendar
 *    Cal.com or Calendly public booking URL
 *    Example: "https://cal.com/your-username/15min"
 *
 * Commit this file and push main — Vercel auto-deploys.
 */
window.PLT_CONFIG = {
  /* Integrations — replace placeholders with your real values */
  FORMSPREE_ENDPOINT: "",
  GA_MEASUREMENT_ID: "",

  /* WhatsApp — digits only, country code included */
  WHATSAPP_NUMBER: "8801700000000",
  WHATSAPP_DEFAULT_MESSAGE:
    "Hi ProLevelThinker — I need a website / SEO quote. Budget: ",

  /* Calendar booking */
  CALENDAR_URL: "https://cal.com/",

  /* Public contact (shown in footer when set) */
  CONTACT_EMAIL: "hello@prolevelthinker.com",
  CONTACT_PHONE: "",

  /* Brand */
  SITE_NAME: "ProLevelThinker",
  SITE_URL: "https://prolevelthinker.vercel.app",

  /* Feature flags */
  ENABLE_CHATBOT: true,
  ENABLE_EXIT_INTENT: true,
  ENABLE_STICKY_WHATSAPP: true
};
