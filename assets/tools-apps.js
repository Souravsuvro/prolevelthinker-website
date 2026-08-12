/* ProLevelThinker — interactive tools (stack matcher, scope builder, meta checker) */
(function () {
  function track(name, params) {
    if (window.PLT && window.PLT.trackEvent) window.PLT.trackEvent(name, params || {});
    else if (typeof window.gtag === "function") window.gtag("event", name, params || {});
  }
  function wa(msg, src) {
    if (window.PLT && window.PLT.openWhatsApp) window.PLT.openWhatsApp(msg, src);
  }

  function initStackMatcher() {
    var root = document.getElementById("stack-matcher-app");
    if (!root) return;
    var scores = { wordpress: 0, shopify: 0, nextjs: 0 };
    var i = 0;
    var steps = [
      { q: "What is the primary goal of this site?", options: [
        { t: "Brochure / lead generation", w: 2, s: 0, n: 1 },
        { t: "Sell products online", w: 0, s: 3, n: 1 },
        { t: "Custom product / portal / SaaS", w: 0, s: 0, n: 3 },
        { t: "Content / blog heavy", w: 3, s: 0, n: 1 } ] },
      { q: "Who will update content after launch?", options: [
        { t: "Non-technical staff", w: 3, s: 2, n: 0 },
        { t: "Marketing + light technical help", w: 2, s: 2, n: 1 },
        { t: "Developers on the team", w: 1, s: 1, n: 3 },
        { t: "Mostly us (agency care plan)", w: 2, s: 2, n: 2 } ] },
      { q: "Rough build budget (BDT)?", options: [
        { t: "Under ৳50,000", w: 3, s: 1, n: 0 },
        { t: "৳50,000–৳150,000", w: 2, s: 2, n: 1 },
        { t: "৳150,000–৳400,000", w: 1, s: 2, n: 2 },
        { t: "৳400,000+", w: 1, s: 1, n: 3 } ] },
      { q: "Which integrations matter most?", options: [
        { t: "Forms, WhatsApp, basic analytics", w: 3, s: 1, n: 1 },
        { t: "Payments, inventory, shipping", w: 1, s: 3, n: 1 },
        { t: "Custom APIs, auth, databases", w: 0, s: 0, n: 3 },
        { t: "Not sure yet", w: 2, s: 1, n: 1 } ] },
      { q: "Ideal launch window?", options: [
        { t: "2–4 weeks", w: 3, s: 2, n: 0 },
        { t: "1–2 months", w: 2, s: 2, n: 1 },
        { t: "2–4 months (build it right)", w: 1, s: 1, n: 3 },
        { t: "Flexible", w: 2, s: 2, n: 2 } ] }
    ];
    function render() {
      if (i >= steps.length) return result();
      var step = steps[i];
      var pct = Math.round((i / steps.length) * 100);
      root.innerHTML = '<div class="tool-progress"><i style="width:' + pct + '%"></i></div><div class="tool-question"><h3>' + (i + 1) + ". " + step.q + '</h3><div class="tool-options"></div></div>';
      var box = root.querySelector(".tool-options");
      step.options.forEach(function (opt) {
        var b = document.createElement("button");
        b.type = "button"; b.textContent = opt.t;
        b.addEventListener("click", function () {
          scores.wordpress += opt.w; scores.shopify += opt.s; scores.nextjs += opt.n; i++; render();
        });
        box.appendChild(b);
      });
    }
    function result() {
      var best = "wordpress";
      if (scores.shopify >= scores.wordpress && scores.shopify >= scores.nextjs) best = "shopify";
      if (scores.nextjs >= scores.wordpress && scores.nextjs >= scores.shopify) best = "nextjs";
      var map = {
        wordpress: { name: "WordPress", blurb: "Best for editable pages, blogs, and service sites without a full engineering team.", why: ["Familiar editor for non-technical updates", "Strong for SEO content structure", "Faster launch for brochure / lead-gen sites"], link: "../../wordpress-shopify-ai-websites/" },
        shopify: { name: "Shopify", blurb: "Best when selling products is the core job — payments, catalog, and checkout.", why: ["Built-in commerce and payments", "Mobile-ready storefront patterns", "Less custom code for standard e-commerce"], link: "../../wordpress-shopify-ai-websites/" },
        nextjs: { name: "Next.js / custom", blurb: "Best for products, portals, and performance-critical apps.", why: ["Full control of UX and data", "APIs, auth, and complex workflows", "Scales with engineering, not theme limits"], link: "../../web-design-development/" }
      };
      var r = map[best];
      track("stack_matcher_complete", { stack: best });
      root.innerHTML = '<div class="tool-result"><p class="eyebrow">Recommended stack</p><div class="score" style="font-size:clamp(1.8rem,4vw,2.6rem)">' + r.name + '</div><p><strong>' + r.blurb + '</strong></p><ul class="features" style="text-align:left;max-width:480px;margin:16px auto">' + r.why.map(function (x) { return "<li>" + x + "</li>"; }).join("") + '</ul><p class="proof-line">Guidance only — final choice follows discovery.</p><div class="micro-cta-row"><a class="button" href="' + r.link + '">See related service →</a><button type="button" class="button button--whatsapp" id="sm-wa">Discuss on WhatsApp</button><button type="button" class="button button--outline" id="sm-retry">Retake quiz</button></div></div>';
      root.querySelector("#sm-wa").addEventListener("click", function () {
        wa("Hi ProLevelThinker — stack matcher recommended " + r.name + ". I'd like to discuss fit for my project.", "stack_matcher");
      });
      root.querySelector("#sm-retry").addEventListener("click", function () {
        scores = { wordpress: 0, shopify: 0, nextjs: 0 }; i = 0; render();
      });
    }
    render();
  }

  function initScopeBuilder() {
    var root = document.getElementById("scope-builder-app");
    if (!root) return;
    var data = { business: "", goal: "", pages: [], features: [], timeline: "", budget: "", notes: "" };
    var step = 0;
    var pageOpts = ["Home", "About", "Services", "Service detail", "Portfolio", "Blog", "Contact", "Shop", "Pricing", "FAQ"];
    var featureOpts = ["Contact form", "WhatsApp CTA", "Blog / CMS", "Online store", "Booking", "User login", "Dashboard", "Multi-language", "SEO package", "Analytics"];
    function esc(s) { return String(s).replace(/&/g, "&").replace(/</g, "<").replace(/>/g, ">").replace(/"/g, """); }
    function nav(html) {
      return '<div class="tool-progress"><i style="width:' + Math.round((step / 6) * 100) + '%"></i></div>' + html +
        '<div class="micro-cta-row" style="margin-top:20px">' + (step > 0 ? '<button type="button" class="button button--outline" id="sb-back">Back</button>' : '') +
        '<button type="button" class="button" id="sb-next">' + (step === 5 ? "Generate brief" : "Continue") + '</button></div>';
    }
    function render() {
      var html = "";
      if (step === 0) html = nav('<div class="tool-question"><h3>1. Business name</h3><div class="field"><input id="sb-business" placeholder="e.g. Green Leaf Clinic" value="' + esc(data.business) + '"></div></div>');
      else if (step === 1) html = nav('<div class="tool-question"><h3>2. Primary goal</h3><div class="tool-options" id="sb-goals"></div></div>');
      else if (step === 2) html = nav('<div class="tool-question"><h3>3. Pages you need</h3><p style="color:var(--muted);font-size:.9rem">Select all that apply</p><div class="tool-options" id="sb-pages"></div></div>');
      else if (step === 3) html = nav('<div class="tool-question"><h3>4. Features</h3><div class="tool-options" id="sb-features"></div></div>');
      else if (step === 4) html = nav('<div class="tool-question"><h3>5. Timeline & budget</h3><div class="field"><label>Timeline</label><select id="sb-timeline"><option value="">Select</option><option>2–4 weeks</option><option>1–2 months</option><option>2–3 months</option><option>Flexible</option></select></div><div class="field"><label>Budget band</label><select id="sb-budget"><option value="">Select</option><option>Under ৳50,000</option><option>৳50,000–৳100,000</option><option>৳100,000–৳250,000</option><option>৳250,000+</option><option>Need guidance</option></select></div></div>');
      else if (step === 5) html = nav('<div class="tool-question"><h3>6. Anything else?</h3><div class="field"><textarea id="sb-notes" rows="4" placeholder="Competitors, integrations, brand notes…">' + esc(data.notes) + '</textarea></div></div>');
      else { showBrief(); return; }
      root.innerHTML = html;
      wire();
    }
    function wire() {
      var back = root.querySelector("#sb-back");
      var next = root.querySelector("#sb-next");
      if (back) back.addEventListener("click", function () { step--; render(); });
      if (step === 1) {
        ["Generate leads", "Sell products", "Launch a product/app", "Rebuild an existing site"].forEach(function (g) {
          var b = document.createElement("button"); b.type = "button"; b.textContent = g;
          if (data.goal === g) b.classList.add("is-selected");
          b.addEventListener("click", function () {
            data.goal = g;
            root.querySelectorAll("#sb-goals button").forEach(function (x) { x.classList.remove("is-selected"); });
            b.classList.add("is-selected");
          });
          root.querySelector("#sb-goals").appendChild(b);
        });
      }
      if (step === 2) {
        pageOpts.forEach(function (p) {
          var b = document.createElement("button"); b.type = "button"; b.textContent = p;
          if (data.pages.indexOf(p) !== -1) b.classList.add("is-selected");
          b.addEventListener("click", function () {
            var ix = data.pages.indexOf(p);
            if (ix === -1) { data.pages.push(p); b.classList.add("is-selected"); }
            else { data.pages.splice(ix, 1); b.classList.remove("is-selected"); }
          });
          root.querySelector("#sb-pages").appendChild(b);
        });
      }
      if (step === 3) {
        featureOpts.forEach(function (f) {
          var b = document.createElement("button"); b.type = "button"; b.textContent = f;
          if (data.features.indexOf(f) !== -1) b.classList.add("is-selected");
          b.addEventListener("click", function () {
            var ix = data.features.indexOf(f);
            if (ix === -1) { data.features.push(f); b.classList.add("is-selected"); }
            else { data.features.splice(ix, 1); b.classList.remove("is-selected"); }
          });
          root.querySelector("#sb-features").appendChild(b);
        });
      }
      if (step === 4) {
        if (data.timeline) root.querySelector("#sb-timeline").value = data.timeline;
        if (data.budget) root.querySelector("#sb-budget").value = data.budget;
      }
      if (next) next.addEventListener("click", function () {
        if (step === 0) {
          data.business = (root.querySelector("#sb-business") || {}).value || "";
          if (!data.business.trim()) { alert("Please enter a business name."); return; }
        }
        if (step === 1 && !data.goal) { alert("Select a primary goal."); return; }
        if (step === 2 && data.pages.length === 0) { alert("Select at least one page."); return; }
        if (step === 4) {
          data.timeline = root.querySelector("#sb-timeline").value;
          data.budget = root.querySelector("#sb-budget").value;
        }
        if (step === 5) data.notes = (root.querySelector("#sb-notes") || {}).value || "";
        step++; render();
      });
    }
    function showBrief() {
      track("scope_builder_complete", { pages: data.pages.length });
      var text = "PROJECT BRIEF — ProLevelThinker\nBusiness: " + data.business + "\nGoal: " + data.goal + "\nPages: " + data.pages.join(", ") + "\nFeatures: " + (data.features.join(", ") || "—") + "\nTimeline: " + (data.timeline || "—") + "\nBudget: " + (data.budget || "—") + "\nNotes: " + (data.notes || "—") + "\n";
      root.innerHTML = '<div class="tool-result" style="text-align:left"><p class="eyebrow">Your project brief</p><h3 style="margin:0 0 12px">' + esc(data.business) + '</h3><p><strong>Goal:</strong> ' + esc(data.goal) + '</p><p><strong>Pages:</strong> ' + esc(data.pages.join(", ")) + '</p><p><strong>Features:</strong> ' + esc(data.features.join(", ") || "—") + '</p><p><strong>Timeline:</strong> ' + esc(data.timeline || "—") + ' · <strong>Budget:</strong> ' + esc(data.budget || "—") + '</p>' + (data.notes ? '<p><strong>Notes:</strong> ' + esc(data.notes) + '</p>' : '') + '<div class="micro-cta-row"><button type="button" class="button button--whatsapp" id="sb-wa">Send brief on WhatsApp</button><button type="button" class="button button--outline" id="sb-copy">Copy brief</button><button type="button" class="button button--outline" id="sb-restart">Start over</button></div><p class="proof-line">Starting point — we refine scope before quoting.</p></div>';
      root.querySelector("#sb-wa").addEventListener("click", function () { wa("Hi ProLevelThinker — here is my project brief:\n\n" + text, "scope_builder"); });
      root.querySelector("#sb-copy").addEventListener("click", function () { if (navigator.clipboard) navigator.clipboard.writeText(text); this.textContent = "Copied!"; });
      root.querySelector("#sb-restart").addEventListener("click", function () {
        data = { business: "", goal: "", pages: [], features: [], timeline: "", budget: "", notes: "" }; step = 0; render();
      });
    }
    render();
  }

  function initMetaChecker() {
    var root = document.getElementById("meta-checker-app");
    if (!root) return;
    root.innerHTML = '<div class="tool-card"><h3>Check your snippet</h3><p>Titles ~50–60 characters and descriptions ~140–160 characters tend to display cleanly in Google.</p><div class="field"><label for="mc-title">Meta title</label><input id="mc-title" placeholder="e.g. Web Design in Dhaka | Your Brand" maxlength="120"></div><div class="field"><label for="mc-desc">Meta description</label><textarea id="mc-desc" rows="3" placeholder="One or two sentences that earn the click…" maxlength="320"></textarea></div><button type="button" class="button" id="mc-run">Check snippet</button><div id="mc-out" style="margin-top:20px"></div></div>';
    function esc(s) { return String(s).replace(/&/g, "&").replace(/</g, "<").replace(/>/g, ">"); }
    root.querySelector("#mc-run").addEventListener("click", function () {
      var title = (root.querySelector("#mc-title").value || "").trim();
      var desc = (root.querySelector("#mc-desc").value || "").trim();
      if (!title && !desc) return;
      track("meta_checker_run", { title_len: title.length, desc_len: desc.length });
      var tips = [], tScore = 0, dScore = 0;
      if (title.length >= 30 && title.length <= 60) tScore = 40;
      else if (title.length > 0 && title.length < 30) { tScore = 20; tips.push("Title is short — add a benefit or keyword."); }
      else if (title.length > 60) { tScore = 15; tips.push("Title may truncate (aim ≤60 characters)."); }
      else tips.push("Add a title.");
      if (desc.length >= 120 && desc.length <= 160) dScore = 40;
      else if (desc.length > 0 && desc.length < 120) { dScore = 22; tips.push("Description could say more (aim ~140–160)."); }
      else if (desc.length > 160) { dScore = 18; tips.push("Description may truncate (aim ≤160)."); }
      else tips.push("Add a meta description.");
      if (/\b(you|your|free|get|book|call)\b/i.test(desc)) dScore += 5;
      var total = Math.min(100, tScore + dScore + 15);
      root.querySelector("#mc-out").innerHTML = '<div class="tool-result" style="text-align:left"><p class="eyebrow">SERP-style preview</p><div style="padding:14px 16px;border-radius:12px;background:#fff;border:1px solid var(--line);margin-bottom:16px"><div style="color:#1a0dab;font-size:1.1rem;font-weight:600">' + esc(title || "Page title preview") + '</div><div style="color:#006621;font-size:.85rem;margin:4px 0">prolevelthinker.vercel.app › example</div><div style="color:#4d5156;font-size:.92rem">' + esc(desc || "Meta description preview.") + '</div></div><div class="score" style="font-size:2rem">' + total + ' <small style="font-size:1rem;color:var(--muted)">/ 100</small></div><p><strong>Title:</strong> ' + title.length + ' chars · <strong>Description:</strong> ' + desc.length + ' chars</p>' + (tips.length ? '<ul class="features">' + tips.map(function (t) { return "<li>" + esc(t) + "</li>"; }).join("") + '</ul>' : '<p>Looks solid for length.</p>') + '<div class="micro-cta-row"><button type="button" class="button button--whatsapp" id="mc-wa">Get a full SEO review</button></div></div>';
      root.querySelector("#mc-wa").addEventListener("click", function () {
        wa("Hi ProLevelThinker — I checked my meta tags (title " + title.length + " chars, description " + desc.length + " chars). I'd like a fuller SEO review.", "meta_checker");
      });
    });
  }

  function boot() {
    initStackMatcher();
    initScopeBuilder();
    initMetaChecker();
  }
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", boot);
  else boot();
})();
