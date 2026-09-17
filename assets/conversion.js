/* ProLevelThinker conversion layer — WhatsApp, chatbot, forms, GA4, tools hooks */
(function () {
"use strict";

function resolveConfigSrc() {
  var src = "/assets/config.js";
  var scripts = document.getElementsByTagName("script");
  for (var i = 0; i < scripts.length; i++) {
    if (scripts[i].src && scripts[i].src.indexOf("main.js") !== -1) {
      src = scripts[i].src.replace(/main\.js(\?.*)?$/, "config.js");
      break;
    }
  }
  return src;
}

function ensureConfig(cb) {
  if (window.PLT_CONFIG) {
    cb();
    return;
  }
  var s = document.createElement("script");
  s.src = resolveConfigSrc();
  s.onload = cb;
  s.onerror = cb;
  document.head.appendChild(s);
}

function loadConversionCss() {
  var href = "/assets/conversion.css";
  var scripts = document.getElementsByTagName("script");
  for (var i = 0; i < scripts.length; i++) {
    if (scripts[i].src && scripts[i].src.indexOf("conversion.js") !== -1) {
      href = scripts[i].src.replace(/conversion\.js(\?.*)?$/, "conversion.css");
      break;
    }
  }
  if (document.querySelector('link[href*="conversion.css"]')) return;
  var l = document.createElement("link");
  l.rel = "stylesheet";
  l.href = href;
  document.head.appendChild(l);
}

function loadGoogleAnalytics(measurementId) {
  if (!measurementId || typeof measurementId !== "string" || measurementId.indexOf("G-") !== 0) {
    return;
  }
  window.dataLayer = window.dataLayer || [];
  function gtag() {
    window.dataLayer.push(arguments);
  }
  window.gtag = gtag;
  gtag("js", new Date());
  gtag("config", measurementId, { send_page_view: true });
  var s = document.createElement("script");
  s.async = true;
  s.src = "https://www.googletagmanager.com/gtag/js?id=" + encodeURIComponent(measurementId);
  document.head.appendChild(s);
}

function trackEvent(eventName, params) {
  if (typeof window.gtag === "function") {
    window.gtag("event", eventName, params || {});
  }
}

function boot() {
  loadConversionCss();
  var config = window.PLT_CONFIG || {};
  loadGoogleAnalytics(config.GA_MEASUREMENT_ID);

  window.PLT = window.PLT || {};
  window.PLT.trackEvent = trackEvent;
  window.PLT.config = config;

  function waLink(message) {
    var num = String(config.WHATSAPP_NUMBER || "").replace(/\D/g, "");
    var text = message || config.WHATSAPP_DEFAULT_MESSAGE || "Hi ProLevelThinker";
    return "https://wa.me/" + num + "?text=" + encodeURIComponent(text);
  }

  function openWhatsApp(message, source) {
    trackEvent("whatsapp_click", { source: source || "unknown" });
    window.open(waLink(message), "_blank", "noopener,noreferrer");
  }
  window.PLT.openWhatsApp = openWhatsApp;

  /* Sticky WhatsApp */
  if (config.ENABLE_STICKY_WHATSAPP !== false) {
    var fab = document.createElement("a");
    fab.className = "wa-float";
    fab.href = "#";
    fab.setAttribute("aria-label", "Chat on WhatsApp");
    fab.innerHTML =
      '<span class="wa-float__icon" aria-hidden="true">💬</span><span class="wa-float__label">WhatsApp</span>';
    fab.addEventListener("click", function (e) {
      e.preventDefault();
      openWhatsApp(null, "sticky_button");
    });
    document.body.appendChild(fab);
  }

  /* Inline WhatsApp + calendar links */
  document.addEventListener("click", function (e) {
    var el = e.target.closest(".js-whatsapp");
    if (el) {
      e.preventDefault();
      openWhatsApp(el.getAttribute("data-message") || null, el.getAttribute("data-source") || "inline");
      return;
    }
    el = e.target.closest(".js-calendar");
    if (el && config.CALENDAR_URL && config.CALENDAR_URL.indexOf("cal.com/") !== -1 && config.CALENDAR_URL.length > 16) {
      e.preventDefault();
      trackEvent("calendar_click", { source: el.getAttribute("data-source") || "inline" });
      window.open(config.CALENDAR_URL, "_blank", "noopener,noreferrer");
    }
  });

  /* Year */
  var yearEl = document.getElementById("year");
  if (yearEl) yearEl.textContent = String(new Date().getFullYear());

  /* Mobile menu */
  var toggle = document.querySelector(".menu-toggle");
  var nav = document.getElementById("primary-navigation");
  if (toggle && nav) {
    toggle.addEventListener("click", function () {
      var open = toggle.getAttribute("aria-expanded") === "true";
      toggle.setAttribute("aria-expanded", open ? "false" : "true");
      nav.classList.toggle("is-open", !open);
    });
  }

  /* Reveal */
  if ("IntersectionObserver" in window) {
    var io = new IntersectionObserver(
      function (entries) {
        entries.forEach(function (entry) {
          if (entry.isIntersecting) {
            entry.target.classList.add("is-visible");
            io.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.12 }
    );
    document.querySelectorAll(".reveal").forEach(function (el) {
      io.observe(el);
    });
  } else {
    document.querySelectorAll(".reveal").forEach(function (el) {
      el.classList.add("is-visible");
    });
  }

  /* Portfolio filters */
  var filterBar = document.querySelector(".filter-bar");
  if (filterBar) {
    filterBar.addEventListener("click", function (e) {
      var btn = e.target.closest(".filter-button");
      if (!btn) return;
      var filter = btn.getAttribute("data-filter") || "all";
      filterBar.querySelectorAll(".filter-button").forEach(function (b) {
        b.setAttribute("aria-pressed", b === btn ? "true" : "false");
      });
      document.querySelectorAll(".project-card").forEach(function (card) {
        var cat = card.getAttribute("data-category") || "";
        card.style.display = filter === "all" || cat === filter ? "" : "none";
      });
      trackEvent("portfolio_filter", { filter: filter });
    });
  }

  /* Project form */
  var projectForm = document.getElementById("project-form");
  var formStatus = document.getElementById("form-status");
  if (projectForm && formStatus) {
    projectForm.addEventListener("focusin", function once() {
      trackEvent("form_start", { form_id: "project-form" });
      projectForm.removeEventListener("focusin", once);
    });
    projectForm.addEventListener("submit", function (e) {
      e.preventDefault();
      if (!projectForm.checkValidity()) {
        formStatus.textContent = "Please complete the required fields before sending your inquiry.";
        formStatus.className = "form-status error";
        projectForm.reportValidity();
        trackEvent("form_error", { form_id: "project-form", reason: "validation" });
        return;
      }
      var endpoint = (config.FORMSPREE_ENDPOINT || "").trim();
      var submitButton = projectForm.querySelector('button[type="submit"]');
      if (!endpoint) {
        var nameEl = projectForm.querySelector('[name="name"]');
        var msgEl = projectForm.querySelector('[name="message"]');
        var svcEl = projectForm.querySelector('[name="service"]');
        var summary =
          "Hi ProLevelThinker — project inquiry from " +
          ((nameEl && nameEl.value) || "a visitor") +
          ". Need: " +
          ((svcEl && svcEl.value) || "website / SEO") +
          ". Details: " +
          ((msgEl && msgEl.value) || "(see contact form)");
        formStatus.textContent =
          "Opening WhatsApp with your details… (Connect Formspree in config.js for email delivery.)";
        formStatus.className = "form-status success";
        trackEvent("form_fallback_whatsapp", { form_id: "project-form" });
        openWhatsApp(summary, "project_form_fallback");
        return;
      }
      if (submitButton) {
        submitButton.disabled = true;
        submitButton.setAttribute("aria-busy", "true");
      }
      formStatus.textContent = "Sending your inquiry…";
      formStatus.className = "form-status";
      fetch(endpoint, {
        method: "POST",
        body: new FormData(projectForm),
        headers: { Accept: "application/json" }
      })
        .then(function (response) {
          if (response.ok) {
            formStatus.textContent =
              "Thank you. Your inquiry has been sent. We typically respond within one business day.";
            formStatus.className = "form-status success";
            projectForm.reset();
            trackEvent("form_submit", { form_id: "project-form", status: "success" });
          } else {
            throw new Error("bad status");
          }
        })
        .catch(function () {
          formStatus.textContent =
            "Something went wrong sending the form. Please try WhatsApp or email us directly.";
          formStatus.className = "form-status error";
          trackEvent("form_submit", { form_id: "project-form", status: "error" });
        })
        .finally(function () {
          if (submitButton) {
            submitButton.disabled = false;
            submitButton.removeAttribute("aria-busy");
          }
        });
    });
  }

  /* Quick lead form */
  var quickForm = document.getElementById("quick-lead-form");
  var quickStatus = document.getElementById("quick-lead-status");
  if (quickForm) {
    quickForm.addEventListener("submit", function (e) {
      e.preventDefault();
      if (!quickForm.checkValidity()) {
        quickForm.reportValidity();
        return;
      }
      var name = (document.getElementById("quick-name") || {}).value || "";
      var phone = (document.getElementById("quick-phone") || {}).value || "";
      var msg =
        "Hi ProLevelThinker — quick lead from " +
        name +
        ". WhatsApp: " +
        phone +
        ". I'd like a website / SEO quote.";
      if (quickStatus) {
        quickStatus.textContent = "Opening WhatsApp…";
      }
      trackEvent("quick_lead_submit", { form_id: "quick-lead" });
      openWhatsApp(msg, "quick_lead_form");
    });
  }

  if (config.ENABLE_CHATBOT !== false) {
    initChatbot(config, trackEvent, openWhatsApp, waLink);
  }
  if (config.ENABLE_EXIT_INTENT !== false) {
    initExitIntent(config, trackEvent, openWhatsApp);
  }
}

function initChatbot(config, trackEvent, openWhatsApp, waLink) {
  var state = { step: 0, need: "", budget: "", timeline: "", name: "", contact: "" };
  var launcher = document.createElement("button");
  launcher.type = "button";
  launcher.className = "plt-chat-launcher";
  launcher.setAttribute("aria-label", "Open chat");
  launcher.textContent = "💬";
  var panel = document.createElement("div");
  panel.className = "plt-chat";
  panel.hidden = true;
  panel.innerHTML =
    '<div class="plt-chat__header"><div><strong>ProLevelThinker</strong><span>Quick questions · then WhatsApp</span></div>' +
    '<button type="button" class="plt-chat__close" aria-label="Close">×</button></div>' +
    '<div class="plt-chat__body" role="log" aria-live="polite"></div>' +
    '<div class="plt-chat__input-row" hidden><input type="text" placeholder="Type here…" aria-label="Your reply"><button type="button">Send</button></div>';
  document.body.appendChild(launcher);
  document.body.appendChild(panel);
  var body = panel.querySelector(".plt-chat__body");
  var inputRow = panel.querySelector(".plt-chat__input-row");
  var input = inputRow.querySelector("input");
  var sendBtn = inputRow.querySelector("button");

  function bot(text) {
    var m = document.createElement("div");
    m.className = "plt-chat__msg plt-chat__msg--bot";
    m.textContent = text;
    body.appendChild(m);
    body.scrollTop = body.scrollHeight;
  }
  function user(text) {
    var m = document.createElement("div");
    m.className = "plt-chat__msg plt-chat__msg--user";
    m.textContent = text;
    body.appendChild(m);
    body.scrollTop = body.scrollHeight;
  }
  function options(list) {
    var wrap = document.createElement("div");
    wrap.className = "plt-chat__options";
    list.forEach(function (item) {
      var b = document.createElement("button");
      b.type = "button";
      b.className = "plt-chat__option";
      b.textContent = item;
      b.addEventListener("click", function () {
        wrap.remove();
        onAnswer(item);
      });
      wrap.appendChild(b);
    });
    body.appendChild(wrap);
    body.scrollTop = body.scrollHeight;
  }
  function onAnswer(val) {
    user(val);
    if (state.step === 0) {
      state.need = val;
      state.step = 1;
      bot("Rough budget?");
      options(["Under ৳50,000", "৳50,000–৳100,000", "৳100,000–৳250,000", "৳250,000+", "Not sure"]);
    } else if (state.step === 1) {
      state.budget = val;
      state.step = 2;
      bot("Timeline?");
      options(["2 weeks", "1 month", "Exploring"]);
    } else if (state.step === 2) {
      state.timeline = val;
      state.step = 3;
      inputRow.hidden = false;
      bot("Your name?");
      input.placeholder = "Name";
      input.focus();
    } else if (state.step === 3) {
      state.name = val;
      state.step = 4;
      bot("Phone or email? (WhatsApp preferred)");
      input.placeholder = "+880… or email";
      input.focus();
    } else if (state.step === 4) {
      state.contact = val;
      state.step = 5;
      inputRow.hidden = true;
      trackEvent("chat_qualified", { need: state.need, budget: state.budget });
      bot("Thanks " + state.name + ". Continue on WhatsApp or stay here for FAQs.");
      options(["Open WhatsApp", "Just browsing"]);
    } else if (state.step === 5) {
      if (val === "Open WhatsApp") {
        var summary =
          "Hi ProLevelThinker — " +
          state.name +
          " (" +
          state.contact +
          "). Need: " +
          state.need +
          ". Budget: " +
          state.budget +
          ". Timeline: " +
          state.timeline +
          ".";
        trackEvent("whatsapp_handoff", { source: "chatbot" });
        openWhatsApp(summary, "chatbot");
      } else {
        bot("No problem. Browse the free tools or pricing — we’re here when you’re ready.");
      }
    }
  }
  function startFlow() {
    body.innerHTML = "";
    state = { step: 0, need: "", budget: "", timeline: "", name: "", contact: "" };
    inputRow.hidden = true;
    bot("What do you need?");
    options(["Website", "Shopify", "SEO", "Not sure"]);
  }
  launcher.addEventListener("click", function () {
    panel.hidden = false;
    launcher.classList.add("is-hidden");
    trackEvent("chat_open", {});
    if (!body.childNodes.length) startFlow();
  });
  panel.querySelector(".plt-chat__close").addEventListener("click", function () {
    panel.hidden = true;
    launcher.classList.remove("is-hidden");
  });
  function sendText() {
    var v = (input.value || "").trim();
    if (!v) return;
    input.value = "";
    onAnswer(v);
  }
  sendBtn.addEventListener("click", sendText);
  input.addEventListener("keydown", function (e) {
    if (e.key === "Enter") {
      e.preventDefault();
      sendText();
    }
  });
}

function initExitIntent(config, trackEvent, openWhatsApp) {
  var shown = false;
  document.addEventListener("mouseout", function (e) {
    if (shown || e.clientY > 0 || e.relatedTarget) return;
    if (window.innerWidth < 900) return;
    shown = true;
    trackEvent("exit_intent_shown", {});
    var backdrop = document.createElement("div");
    backdrop.className = "plt-modal-backdrop";
    backdrop.innerHTML =
      '<div class="plt-modal" role="dialog" aria-modal="true">' +
      "<h2>Before you go</h2>" +
      "<p>Want a free 15-minute look at your site or a rough quote on WhatsApp?</p>" +
      '<div class="plt-modal__actions">' +
      '<button type="button" class="button button--whatsapp" data-act="wa">WhatsApp us</button>' +
      '<button type="button" class="button button--outline" data-act="close">Just browsing</button>' +
      "</div>" +
      '<button type="button" class="plt-modal__close" data-act="close">Close</button></div>';
    document.body.appendChild(backdrop);
    backdrop.addEventListener("click", function (ev) {
      var act = ev.target.getAttribute("data-act");
      if (act === "wa") openWhatsApp(null, "exit_intent");
      if (act === "wa" || act === "close" || ev.target === backdrop) backdrop.remove();
    });
  });
}

if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", function () {
    ensureConfig(boot);
  });
} else {
  ensureConfig(boot);
}
})();
