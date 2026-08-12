/* ProLevelThinker conversion layer — loaded by main.js */
(function () {
  function resolveConfigSrc() {
    var src = "/assets/config.js";
    var scripts = document.getElementsByTagName("script");
    for (var i = 0; i < scripts.length; i++) {
      if (scripts[i].src && scripts[i].src.indexOf("conversion.js") !== -1) {
        src = scripts[i].src.replace(/conversion\.js(\?.*)?$/, "config.js");
        break;
      }
    }
    return src;
  }
  function ensureConfig(cb) {
    if (window.PLT_CONFIG) { cb(); return; }
    var s = document.createElement("script");
    s.src = resolveConfigSrc();
    s.onload = cb;
    s.onerror = cb;
    document.head.appendChild(s);
  }
  function loadConversionCss() {
    var links = document.getElementsByTagName("link");
    var base = "/assets/";
    for (var i = 0; i < links.length; i++) {
      if (links[i].href && links[i].href.indexOf("style.css") !== -1) {
        base = links[i].href.replace(/style\.css(\?.*)?$/, "");
        break;
      }
    }
    var l = document.createElement("link");
    l.rel = "stylesheet";
    l.href = base + "conversion.css";
    document.head.appendChild(l);
  }
  loadConversionCss();
  function boot() {
    var config = window.PLT_CONFIG || {};
    function loadGoogleAnalytics(measurementId) {
      if (!measurementId || typeof measurementId !== "string" || measurementId.indexOf("G-") !== 0) return;
      window.dataLayer = window.dataLayer || [];
      function gtag() { window.dataLayer.push(arguments); }
      window.gtag = gtag;
      gtag("js", new Date());
      gtag("config", measurementId, { send_page_view: true });
      var script = document.createElement("script");
      script.async = true;
      script.src = "https://www.googletagmanager.com/gtag/js?id=" + encodeURIComponent(measurementId);
      document.head.appendChild(script);
    }
    function trackEvent(eventName, params) {
      if (typeof window.gtag === "function") window.gtag("event", eventName, params || {});
    }
    loadGoogleAnalytics(config.GA_MEASUREMENT_ID);
    function waNumber() { return String(config.WHATSAPP_NUMBER || "").replace(/\D/g, ""); }
    function waLink(message) {
      var num = waNumber();
      if (!num) return "#contact";
      var text = message || config.WHATSAPP_DEFAULT_MESSAGE || "Hi ProLevelThinker — I need a quote.";
      return "https://wa.me/" + num + "?text=" + encodeURIComponent(text);
    }
    function openWhatsApp(message, source) {
      trackEvent("whatsapp_click", { source: source || "unknown" });
      window.open(waLink(message), "_blank", "noopener,noreferrer");
    }
    window.PLT = window.PLT || {};
    window.PLT.openWhatsApp = openWhatsApp;
    window.PLT.waLink = waLink;
    window.PLT.trackEvent = trackEvent;
    if (config.ENABLE_STICKY_WHATSAPP !== false && waNumber()) {
      var waBtn = document.createElement("a");
      waBtn.className = "wa-float";
      waBtn.href = waLink();
      waBtn.target = "_blank";
      waBtn.rel = "noopener noreferrer";
      waBtn.setAttribute("aria-label", "Chat on WhatsApp");
      waBtn.innerHTML = '<span class="wa-float__icon" aria-hidden="true">💬</span><span class="wa-float__label">WhatsApp</span>';
      waBtn.addEventListener("click", function () { trackEvent("whatsapp_click", { source: "sticky_button" }); });
      document.body.appendChild(waBtn);
    }
    document.querySelectorAll("a.js-whatsapp, a[data-whatsapp]").forEach(function (el) {
      el.addEventListener("click", function (e) {
        e.preventDefault();
        openWhatsApp(el.getAttribute("data-message") || null, el.getAttribute("data-source") || "inline");
      });
      if (!el.getAttribute("href") || el.getAttribute("href") === "#") el.href = waLink(el.getAttribute("data-message") || null);
    });
    var menuButton = document.querySelector(".menu-toggle");
    var navLinks = document.querySelector(".nav-links");
    var navItems = document.querySelectorAll(".nav-links a");
    function closeMenu() {
      if (!navLinks || !menuButton) return;
      navLinks.classList.remove("is-open");
      menuButton.setAttribute("aria-expanded", "false");
    }
    if (menuButton && navLinks) {
      menuButton.addEventListener("click", function () {
        var isOpen = navLinks.classList.toggle("is-open");
        menuButton.setAttribute("aria-expanded", String(isOpen));
      });
      navItems.forEach(function (item) { item.addEventListener("click", closeMenu); });
    }
    var revealElements = document.querySelectorAll(".reveal");
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      revealElements.forEach(function (el) { el.classList.add("is-visible"); });
    } else {
      var observer = new IntersectionObserver(function (entries, obs) {
        entries.forEach(function (entry) {
          if (entry.isIntersecting) { entry.target.classList.add("is-visible"); obs.unobserve(entry.target); }
        });
      }, { threshold: 0.12 });
      revealElements.forEach(function (el) { observer.observe(el); });
    }
    var filterButtons = document.querySelectorAll(".filter-button");
    var projectCards = document.querySelectorAll(".project-card");
    if (filterButtons.length && projectCards.length) {
      filterButtons.forEach(function (button) {
        button.addEventListener("click", function () {
          var selected = button.dataset.filter;
          filterButtons.forEach(function (item) { item.setAttribute("aria-pressed", "false"); });
          button.setAttribute("aria-pressed", "true");
          projectCards.forEach(function (card) {
            card.hidden = !(selected === "all" || card.dataset.category === selected);
          });
          trackEvent("portfolio_filter", { filter: selected || "all" });
        });
      });
    }
    document.querySelectorAll('a[href="#contact"], a.nav-cta').forEach(function (el) {
      el.addEventListener("click", function () {
        trackEvent("cta_click", { cta_text: (el.textContent || "").trim().slice(0, 80) });
      });
    });
    document.querySelectorAll('a[href*="portfolio/"]').forEach(function (el) {
      el.addEventListener("click", function () {
        var href = el.getAttribute("href") || "";
        var slug = href.replace(/^.*portfolio\//, "").replace(/\/$/, "") || "unknown";
        trackEvent("view_project", { project_slug: slug });
      });
    });
    var projectForm = document.querySelector("#project-form");
    var formStatus = document.querySelector("#form-status");
    if (projectForm && formStatus) {
      var formStarted = false;
      projectForm.addEventListener("focusin", function () {
        if (!formStarted) { formStarted = true; trackEvent("form_start", { form_id: "project-form" }); }
      }, true);
      projectForm.addEventListener("submit", function (event) {
        event.preventDefault();
        if (!projectForm.checkValidity()) {
          formStatus.textContent = "Please complete all required fields.";
          formStatus.className = "form-status error";
          projectForm.reportValidity();
          return;
        }
        var endpoint = (config.FORMSPREE_ENDPOINT || "").trim();
        var submitButton = projectForm.querySelector('button[type="submit"]');
        if (!endpoint) {
          formStatus.textContent = "Add FORMSPREE_ENDPOINT in assets/config.js, then redeploy.";
          formStatus.className = "form-status error";
          return;
        }
        if (submitButton) { submitButton.disabled = true; }
        formStatus.textContent = "Sending…";
        fetch(endpoint, { method: "POST", body: new FormData(projectForm), headers: { Accept: "application/json" } })
          .then(function (response) {
            if (response.ok) {
              formStatus.textContent = "Thank you. We typically respond within one business day.";
              formStatus.className = "form-status success";
              projectForm.reset();
              formStarted = false;
              trackEvent("form_submit", { form_id: "project-form", status: "success" });
              trackEvent("generate_lead", { form_id: "project-form" });
            } else {
              formStatus.textContent = "Something went wrong. Try WhatsApp.";
              formStatus.className = "form-status error";
            }
          })
          .catch(function () {
            formStatus.textContent = "Network error. Please try WhatsApp.";
            formStatus.className = "form-status error";
          })
          .finally(function () { if (submitButton) submitButton.disabled = false; });
      });
    }
    var quickForm = document.querySelector("#quick-lead-form");
    var quickStatus = document.querySelector("#quick-lead-status");
    if (quickForm && quickStatus) {
      quickForm.addEventListener("submit", function (e) {
        e.preventDefault();
        if (!quickForm.checkValidity()) { quickForm.reportValidity(); return; }
        var name = (quickForm.querySelector('[name="name"]') || {}).value || "";
        var phone = (quickForm.querySelector('[name="phone"]') || {}).value || "";
        trackEvent("form_submit", { form_id: "quick-lead", status: "success" });
        trackEvent("generate_lead", { form_id: "quick-lead" });
        var msg = "Hi ProLevelThinker — I'm " + name.trim() + ". WhatsApp: " + phone.trim() + ". I'd like a website / SEO quote.";
        var endpoint = (config.FORMSPREE_ENDPOINT || "").trim();
        if (endpoint) {
          fetch(endpoint, { method: "POST", body: new FormData(quickForm), headers: { Accept: "application/json" } }).catch(function () {});
        }
        quickStatus.textContent = "Opening WhatsApp…";
        quickStatus.className = "quick-lead__status form-status success";
        openWhatsApp(msg, "quick_lead_form");
      });
    }
    if (config.ENABLE_CHATBOT !== false) initChatbot(config, trackEvent, openWhatsApp);
    if (config.ENABLE_EXIT_INTENT !== false) initExitIntent(config, trackEvent, openWhatsApp);
    if (document.getElementById("health-score-app")) initHealthScore(trackEvent, openWhatsApp, config);
    if (document.getElementById("estimator-app")) initEstimator(trackEvent, openWhatsApp, config);
    document.querySelectorAll("a.js-calendar").forEach(function (el) {
      var url = config.CALENDAR_URL || el.getAttribute("href") || "#contact";
      el.href = url;
      el.addEventListener("click", function () { trackEvent("calendar_click", { source: el.getAttribute("data-source") || "inline" }); });
    });
    var yearEl = document.querySelector("#year");
    if (yearEl) yearEl.textContent = String(new Date().getFullYear());
  }
  function initChatbot(config, trackEvent, openWhatsApp) {
    if (document.querySelector(".plt-chat-launcher")) return;
    var state = { step: 0, answers: {} };
    var steps = [
      { id: "need", bot: "Planning a website or growth work? Pick what you need.", options: [
        { label: "New website", value: "website" }, { label: "Shopify / store", value: "shopify" },
        { label: "SEO / marketing", value: "seo" }, { label: "Custom web app", value: "custom" },
        { label: "Just browsing", value: "browse" } ] },
      { id: "budget", bot: "Rough budget range?", options: [
        { label: "Under ৳50,000", value: "under_50k" }, { label: "৳50k–৳100k", value: "50_100k" },
        { label: "৳100k–৳250k", value: "100_250k" }, { label: "৳250k+", value: "250k_plus" },
        { label: "Not sure yet", value: "unsure" } ] },
      { id: "timeline", bot: "When do you want to start?", options: [
        { label: "ASAP / 2 weeks", value: "asap" }, { label: "Within a month", value: "month" },
        { label: "Exploring options", value: "exploring" } ] },
      { id: "contact", bot: "Your name helps us personalize the next step.", input: true, placeholder: "Your name" }
    ];
    var launcher = document.createElement("button");
    launcher.type = "button";
    launcher.className = "plt-chat-launcher";
    launcher.setAttribute("aria-label", "Open chat");
    launcher.innerHTML = "💬";
    document.body.appendChild(launcher);
    var panel = document.createElement("div");
    panel.className = "plt-chat";
    panel.hidden = true;
    panel.innerHTML = '<div class="plt-chat__header"><div><strong>ProLevelThinker</strong><span>Usually replies in minutes</span></div><button type="button" class="plt-chat__close" aria-label="Close">×</button></div><div class="plt-chat__body" id="plt-chat-body"></div>';
    document.body.appendChild(panel);
    var body = panel.querySelector("#plt-chat-body");
    function addBot(text) { var d = document.createElement("div"); d.className = "plt-chat__msg plt-chat__msg--bot"; d.textContent = text; body.appendChild(d); body.scrollTop = body.scrollHeight; }
    function addUser(text) { var d = document.createElement("div"); d.className = "plt-chat__msg plt-chat__msg--user"; d.textContent = text; body.appendChild(d); body.scrollTop = body.scrollHeight; }
    function clearOptions() { var old = body.querySelector(".plt-chat__options, .plt-chat__input-row"); if (old) old.remove(); }
    function showStep() {
      clearOptions();
      if (state.step >= steps.length) { finishChat(); return; }
      var step = steps[state.step];
      addBot(step.bot);
      if (step.input) {
        var row = document.createElement("div");
        row.className = "plt-chat__input-row";
        row.innerHTML = '<input type="text" placeholder="' + (step.placeholder || "") + '" /><button type="button">Next</button>';
        body.appendChild(row);
        var input = row.querySelector("input");
        var btn = row.querySelector("button");
        function submitName() {
          var v = (input.value || "").trim();
          if (!v) { input.focus(); return; }
          state.answers.name = v; addUser(v); state.step++; showStep();
        }
        btn.addEventListener("click", submitName);
        input.addEventListener("keydown", function (e) { if (e.key === "Enter") submitName(); });
        input.focus();
      } else {
        var opts = document.createElement("div");
        opts.className = "plt-chat__options";
        step.options.forEach(function (opt) {
          var b = document.createElement("button");
          b.type = "button"; b.className = "plt-chat__option"; b.textContent = opt.label;
          b.addEventListener("click", function () {
            state.answers[step.id] = opt.value; addUser(opt.label);
            if (opt.value === "browse") {
              addBot("Browse at your pace. WhatsApp is always available if a question comes up.");
              clearOptions(); trackEvent("chat_qualified", { intent: "browse" }); return;
            }
            if (opt.value === "custom") {
              addBot("Custom apps need a short discovery call. Opening WhatsApp…");
              state.step = steps.length; setTimeout(finishChat, 500); return;
            }
            state.step++; showStep();
          });
          opts.appendChild(b);
        });
        body.appendChild(opts);
      }
      body.scrollTop = body.scrollHeight;
    }
    function finishChat() {
      clearOptions();
      var a = state.answers;
      var summary = "Hi ProLevelThinker — I'm " + (a.name || "a visitor") + ". Need: " + (a.need || "—") + ". Budget: " + (a.budget || "—") + ". Timeline: " + (a.timeline || "—") + ".";
      addBot("Thanks" + (a.name ? ", " + a.name : "") + ". Choose how to continue:");
      var opts = document.createElement("div");
      opts.className = "plt-chat__options";
      var wa = document.createElement("button");
      wa.type = "button"; wa.className = "plt-chat__option"; wa.textContent = "Talk on WhatsApp";
      wa.addEventListener("click", function () {
        trackEvent("whatsapp_handoff", { source: "chatbot" });
        trackEvent("chat_qualified", { intent: a.need || "unknown" });
        openWhatsApp(summary, "chatbot");
      });
      var cal = document.createElement("button");
      cal.type = "button"; cal.className = "plt-chat__option"; cal.textContent = "Book a free call";
      cal.addEventListener("click", function () {
        trackEvent("calendar_click", { source: "chatbot" });
        var url = config.CALENDAR_URL || "#contact";
        if (url.indexOf("http") === 0) window.open(url, "_blank", "noopener"); else window.location.href = url;
      });
      opts.appendChild(wa); opts.appendChild(cal); body.appendChild(opts);
    }
    launcher.addEventListener("click", function () {
      panel.hidden = false; launcher.classList.add("is-hidden"); trackEvent("chat_open", {});
      if (state.step === 0 && body.children.length === 0) showStep();
    });
    panel.querySelector(".plt-chat__close").addEventListener("click", function () {
      panel.hidden = true; launcher.classList.remove("is-hidden");
    });
    setTimeout(function () {
      if (panel.hidden && !sessionStorage.getItem("plt_chat_nudged")) {
        launcher.style.boxShadow = "0 0 0 4px rgba(39,107,255,0.35), 0 12px 32px rgba(7,26,51,0.35)";
        sessionStorage.setItem("plt_chat_nudged", "1");
      }
    }, 12000);
  }
  function initExitIntent(config, trackEvent, openWhatsApp) {
    if (sessionStorage.getItem("plt_exit_shown")) return;
    if (window.matchMedia("(max-width: 820px)").matches) return;
    var shown = false;
    function show() {
      if (shown) return;
      shown = true;
      sessionStorage.setItem("plt_exit_shown", "1");
      trackEvent("exit_intent_shown", {});
      var backdrop = document.createElement("div");
      backdrop.className = "plt-modal-backdrop";
      backdrop.innerHTML = '<div class="plt-modal" role="dialog" aria-modal="true"><h2>Before you go — free website review</h2><p>Get a practical health score, or message us on WhatsApp for a quick estimate.</p><div class="plt-modal__actions"><a class="button" href="/tools/website-health-score/">Get the health score →</a><button type="button" class="button button--whatsapp" id="exit-wa">WhatsApp estimate</button></div><button type="button" class="plt-modal__close" id="exit-dismiss">No thanks</button></div>';
      document.body.appendChild(backdrop);
      function close() { backdrop.remove(); }
      backdrop.querySelector("#exit-dismiss").addEventListener("click", close);
      backdrop.addEventListener("click", function (e) { if (e.target === backdrop) close(); });
      backdrop.querySelector("#exit-wa").addEventListener("click", function () {
        trackEvent("whatsapp_click", { source: "exit_intent" });
        openWhatsApp(null, "exit_intent");
        close();
      });
    }
    document.addEventListener("mouseout", function (e) {
      if (e.clientY < 8 && e.relatedTarget == null) show();
    });
  }
  function initHealthScore(trackEvent, openWhatsApp, config) {
    var root = document.getElementById("health-score-app");
    var questions = [
      { q: "Is your site mobile-friendly on a real phone?", options: [{ t: "Yes, polished", s: 20 }, { t: "Mostly OK", s: 12 }, { t: "Awkward", s: 4 }, { t: "No site yet", s: 0 }] },
      { q: "Can a visitor tell what you offer in 5 seconds?", options: [{ t: "Very clear CTA", s: 20 }, { t: "Somewhat clear", s: 12 }, { t: "Confusing", s: 5 }, { t: "No site yet", s: 0 }] },
      { q: "How does speed feel on mobile data?", options: [{ t: "Fast", s: 15 }, { t: "Acceptable", s: 10 }, { t: "Slow", s: 3 }, { t: "No site yet", s: 0 }] },
      { q: "Do you appear for local searches in Bangladesh?", options: [{ t: "Yes, regularly", s: 20 }, { t: "Sometimes", s: 12 }, { t: "Rarely", s: 4 }, { t: "Not sure", s: 8 }] },
      { q: "Trust signals: reviews, about, contact?", options: [{ t: "Strong", s: 15 }, { t: "Partial", s: 9 }, { t: "Weak", s: 3 }, { t: "No site yet", s: 0 }] },
      { q: "Easy contact (form, WhatsApp, phone)?", options: [{ t: "Multiple paths", s: 10 }, { t: "One path", s: 6 }, { t: "Hard to find", s: 2 }, { t: "No site yet", s: 0 }] }
    ];
    var idx = 0, score = 0;
    function render() {
      if (idx >= questions.length) { showResult(); return; }
      var q = questions[idx];
      var pct = Math.round((idx / questions.length) * 100);
      root.innerHTML = '<div class="tool-progress"><i style="width:' + pct + '%"></i></div><div class="tool-question"><h3>' + (idx + 1) + ". " + q.q + '</h3><div class="tool-options"></div></div>';
      var box = root.querySelector(".tool-options");
      q.options.forEach(function (opt) {
        var b = document.createElement("button");
        b.type = "button"; b.textContent = opt.t;
        b.addEventListener("click", function () { score += opt.s; idx++; render(); });
        box.appendChild(b);
      });
    }
    function showResult() {
      trackEvent("health_score_complete", { score: score });
      var label = score >= 80 ? "Strong foundation" : score >= 55 ? "Solid — clear gaps" : "High opportunity";
      root.innerHTML = '<div class="tool-result"><p class="eyebrow">Your website health score</p><div class="score">' + score + ' <small style="font-size:1rem;color:var(--muted)">/ 100</small></div><p><strong>' + label + '</strong></p><div class="micro-cta-row"><button type="button" class="button button--whatsapp" id="hs-wa">Discuss on WhatsApp</button><a class="button button--outline js-calendar" href="#contact">Book a free call</a></div><p class="proof-line">Ontario strategy · Sylhet engineering</p></div>';
      root.querySelector("#hs-wa").addEventListener("click", function () {
        openWhatsApp("Hi ProLevelThinker — my website health score was " + score + "/100. I'd like a short review.", "health_score");
      });
      var cal = root.querySelector(".js-calendar");
      if (cal && config.CALENDAR_URL) cal.href = config.CALENDAR_URL;
    }
    render();
  }
  function initEstimator(trackEvent, openWhatsApp, config) {
    var root = document.getElementById("estimator-app");
    var state = { pages: "5", platform: "wordpress", extras: [] };
    function estimate() {
      var base = 35000;
      if (state.pages === "6-10") base = 55000;
      if (state.pages === "11+") base = 85000;
      if (state.platform === "shopify") base = Math.round(base * 1.15);
      if (state.platform === "custom") base = Math.max(150000, base * 2);
      if (state.extras.indexOf("seo") !== -1) base += 25000;
      if (state.extras.indexOf("ecommerce") !== -1) base += 40000;
      if (state.extras.indexOf("care") !== -1) base += 15000;
      return { low: base, high: Math.round(base * 1.35) };
    }
    function render() {
      var e = estimate();
      root.innerHTML = '<div class="tool-card"><h3>Indicative project range (৳)</h3><p>Planning ranges — not a fixed quote.</p><div class="field"><label>Core pages</label><select id="est-pages"><option value="5">Up to 5</option><option value="6-10">6–10</option><option value="11+">11+</option></select></div><div class="field"><label>Platform</label><select id="est-platform"><option value="wordpress">WordPress / builder</option><option value="shopify">Shopify</option><option value="custom">Custom (React / Next.js)</option></select></div><div class="field"><label>Extras</label><label class="consent"><input type="checkbox" id="ex-seo"> SEO foundations</label><label class="consent"><input type="checkbox" id="ex-ecom"> E-commerce</label><label class="consent"><input type="checkbox" id="ex-care"> 3-month care</label></div><div class="tool-result" style="margin-top:16px"><div class="score" style="font-size:2rem">৳' + e.low.toLocaleString() + " – ৳" + e.high.toLocaleString() + '</div><div class="micro-cta-row"><button type="button" class="button button--whatsapp" id="est-wa">Get this on WhatsApp</button><a class="button button--outline" href="/#contact">Full form</a></div></div></div>';
      root.querySelector("#est-pages").value = state.pages;
      root.querySelector("#est-platform").value = state.platform;
      function sync() {
        state.pages = root.querySelector("#est-pages").value;
        state.platform = root.querySelector("#est-platform").value;
        state.extras = [];
        if (root.querySelector("#ex-seo").checked) state.extras.push("seo");
        if (root.querySelector("#ex-ecom").checked) state.extras.push("ecommerce");
        if (root.querySelector("#ex-care").checked) state.extras.push("care");
        render();
      }
      ["#est-pages", "#est-platform", "#ex-seo", "#ex-ecom", "#ex-care"].forEach(function (sel) {
        root.querySelector(sel).addEventListener("change", sync);
      });
      root.querySelector("#est-wa").addEventListener("click", function () {
        var e2 = estimate();
        trackEvent("estimator_complete", { low: e2.low, high: e2.high });
        openWhatsApp("Hi ProLevelThinker — estimator showed roughly ৳" + e2.low + "–৳" + e2.high + ". I'd like a real quote.", "estimator");
      });
    }
    render();
  }
  ensureConfig(boot);
})();
