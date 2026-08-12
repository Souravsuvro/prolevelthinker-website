/* ProLevelThinker — site interactions, form, analytics */

const config = window.PLT_CONFIG || {};

function loadGoogleAnalytics(measurementId) {
  if (!measurementId || typeof measurementId !== "string" || !measurementId.startsWith("G-")) {
    return;
  }
  window.dataLayer = window.dataLayer || [];
  function gtag() { window.dataLayer.push(arguments); }
  window.gtag = gtag;
  gtag("js", new Date());
  gtag("config", measurementId, { send_page_view: true });
  const script = document.createElement("script");
  script.async = true;
  script.src = "https://www.googletagmanager.com/gtag/js?id=" + encodeURIComponent(measurementId);
  document.head.appendChild(script);
}

function trackEvent(eventName, params) {
  if (typeof window.gtag === "function") {
    window.gtag("event", eventName, params || {});
  }
}

loadGoogleAnalytics(config.GA_MEASUREMENT_ID);

const menuButton = document.querySelector(".menu-toggle");
const navLinks = document.querySelector(".nav-links");
const navItems = document.querySelectorAll(".nav-links a");

function closeMenu() {
  if (!navLinks || !menuButton) return;
  navLinks.classList.remove("is-open");
  menuButton.setAttribute("aria-expanded", "false");
  menuButton.setAttribute("aria-label", "Open navigation menu");
}

if (menuButton && navLinks) {
  menuButton.addEventListener("click", () => {
    const isOpen = navLinks.classList.toggle("is-open");
    menuButton.setAttribute("aria-expanded", String(isOpen));
    menuButton.setAttribute("aria-label", isOpen ? "Close navigation menu" : "Open navigation menu");
  });
  navItems.forEach((item) => item.addEventListener("click", closeMenu));
  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape") closeMenu();
  });
}

const revealElements = document.querySelectorAll(".reveal");
const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

if (reducedMotion) {
  revealElements.forEach((element) => element.classList.add("is-visible"));
} else {
  const observer = new IntersectionObserver((entries, obs) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.classList.add("is-visible");
        obs.unobserve(entry.target);
      }
    });
  }, { threshold: 0.12 });
  revealElements.forEach((element) => observer.observe(element));
}

const filterButtons = document.querySelectorAll(".filter-button");
const projectCards = document.querySelectorAll(".project-card");

if (filterButtons.length && projectCards.length) {
  filterButtons.forEach((button) => {
    button.addEventListener("click", () => {
      const selected = button.dataset.filter;
      filterButtons.forEach((item) => item.setAttribute("aria-pressed", "false"));
      button.setAttribute("aria-pressed", "true");
      projectCards.forEach((card) => {
        const visible = selected === "all" || card.dataset.category === selected;
        card.hidden = !visible;
      });
      trackEvent("portfolio_filter", { filter: selected || "all" });
    });
  });
}

document.querySelectorAll('a[href="#contact"], a.nav-cta, a.button--light[href="#contact"]').forEach((el) => {
  el.addEventListener("click", () => {
    trackEvent("cta_click", {
      cta_text: (el.textContent || "").trim().slice(0, 80),
      cta_location: el.closest("section")?.id || (el.closest("header") ? "header" : "page")
    });
  });
});

document.querySelectorAll('a[href*="portfolio/"]').forEach((el) => {
  el.addEventListener("click", () => {
    const href = el.getAttribute("href") || "";
    const slug = href.replace(/^.*portfolio\//, "").replace(/\/$/, "") || "unknown";
    trackEvent("view_project", {
      project_slug: slug,
      link_text: (el.textContent || "").trim().slice(0, 80)
    });
  });
});

const projectForm = document.querySelector("#project-form");
const formStatus = document.querySelector("#form-status");

if (projectForm && formStatus) {
  let formStarted = false;

  projectForm.addEventListener("focusin", () => {
    if (!formStarted) {
      formStarted = true;
      trackEvent("form_start", { form_id: "project-form" });
    }
  }, true);

  projectForm.addEventListener("submit", async (event) => {
    event.preventDefault();

    if (!projectForm.checkValidity()) {
      formStatus.textContent = "Please complete all required fields before sending your inquiry.";
      formStatus.className = "form-status error";
      projectForm.reportValidity();
      trackEvent("form_error", { form_id: "project-form", reason: "validation" });
      return;
    }

    const endpoint = (config.FORMSPREE_ENDPOINT || "").trim();
    const submitButton = projectForm.querySelector('button[type="submit"]');

    if (!endpoint) {
      formStatus.textContent = "Form is almost ready. Add your Formspree endpoint in assets/config.js (FORMSPREE_ENDPOINT), then redeploy.";
      formStatus.className = "form-status error";
      trackEvent("form_error", { form_id: "project-form", reason: "missing_endpoint" });
      return;
    }

    if (submitButton) {
      submitButton.disabled = true;
      submitButton.setAttribute("aria-busy", "true");
    }

    formStatus.textContent = "Sending your inquiry…";
    formStatus.className = "form-status";

    try {
      const formData = new FormData(projectForm);
      const response = await fetch(endpoint, {
        method: "POST",
        body: formData,
        headers: { Accept: "application/json" }
      });

      if (response.ok) {
        formStatus.textContent = "Thank you. Your inquiry has been sent. We typically respond within one business day.";
        formStatus.className = "form-status success";
        projectForm.reset();
        formStarted = false;
        trackEvent("form_submit", { form_id: "project-form", status: "success" });
        trackEvent("generate_lead", { form_id: "project-form" });
      } else {
        let message = "Something went wrong. Please try again or email us directly.";
        try {
          const data = await response.json();
          if (data && data.error) message = data.error;
        } catch (_) {}
        formStatus.textContent = message;
        formStatus.className = "form-status error";
        trackEvent("form_submit", { form_id: "project-form", status: "error" });
      }
    } catch (_) {
      formStatus.textContent = "Network error. Please check your connection and try again, or reach out via WhatsApp/email.";
      formStatus.className = "form-status error";
      trackEvent("form_submit", { form_id: "project-form", status: "network_error" });
    } finally {
      if (submitButton) {
        submitButton.disabled = false;
        submitButton.removeAttribute("aria-busy");
      }
    }
  });
}

const yearEl = document.querySelector("#year");
if (yearEl) {
  yearEl.textContent = String(new Date().getFullYear());
}
