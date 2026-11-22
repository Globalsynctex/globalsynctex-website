/*!
 * Global Synctex – website assistant (pop-up chat)
 * Drop-in: <script src="/gs-assistant.js" defer></script> just before </body>
 * No cookies, no tracking, no server. Enquiries are handed off to WhatsApp or email.
 */
(function () {
  "use strict";

  /* ---------- Settings (edit these) ---------- */
  var CFG = {
    name: "Global Synctex Assistant",
    whatsapp: "919082227801",
    email: "vaishalik@globalsynctex.com",
    enquiryAnchor: "#enquire",
    popupDelayMs: 8000,          // greeting bubble appears after 8 s (0 = never)
    accent: "#1e40af",           // button / header colour
    accentText: "#ffffff"
  };

  /* ---------- Knowledge base (from the site's FAQ & How-we-work) ---------- */
  var KB = [
    { k: ["manufacturer", "factory own", "do you make", "manufacture"],
      a: "We're a <b>sourcing agent</b>, not a manufacturer. We work with vetted Indian mills and factories and manage everything from shortlist to shipment, so you have one point of contact." },
    { k: ["what can you source", "products", "fabric", "fabrics", "outdoor", "performance", "workwear", "hi-vis", "hivis", "suiting", "shirting", "medical", "uniform", "coated", "laminated", "softshell", "swim", "base layer"],
      a: "We source outdoor &amp; performance fabrics and garments (shells, softshell, insulation, hiking, cycling, swim, resort wear, base layers), plus workwear &amp; hi-vis, coated and laminated fabrics, suiting, shirting and medical uniform fabrics." },
    { k: ["moq", "minimum", "min order", "quantity", "order size"],
      a: "MOQs depend on the mill, construction and finish. Every option we shortlist shows the mill's MOQ, price and lead time side by side so you can compare." },
    { k: ["lead time", "delivery time", "how long", "timeline", "weeks"],
      a: "Lead times vary by mill and finish. Each shortlisted option comes with its own lead time, and we follow bulk production through to shipment with updates at every stage." },
    { k: ["quality", "inspection", "aql", "inspect", "qc"],
      a: "We agree test methods and pass levels before bulk, collect lab reports, and inspect at the factory against your approved sample and AQL level before shipment." },
    { k: ["test", "testing", "lab", "compliance", "certificate", "report"],
      a: "We coordinate lab testing and compliance: test methods and pass levels are agreed up front, and reports and certificates are shared with you before bulk ships." },
    { k: ["eco", "sustainable", "sustainability", "recycled", "pfas", "pfc", "c0", "dwr", "oeko", "organic", "lyocell", "grs", "tpu"],
      a: "Yes – options include GRS recycled polyester &amp; nylon, recycled TPU, PFC-free (C0) DWR, OEKO-TEX tested fabrics, lyocell and organic cotton. Certificates are shared with the quotation." },
    { k: ["social", "audit", "ethical", "bsci", "sedex", "smeta"],
      a: "Many of our partner mills hold social compliance audits. We check before shortlisting and share the current report or certificate with each quotation." },
    { k: ["fee", "fees", "commission", "cost", "charge", "price", "pricing"],
      a: "Our fees are agreed in writing for each project. You can read how sourcing-agent fees typically work here: <a href=\"/textile-sourcing-agent-india-commission-fees.html\">Sourcing agent fees</a>. For pricing on a specific fabric, share a brief and we'll send options with prices." },
    { k: ["country", "countries", "usa", "canada", "uk", "europe", "latin", "ship to", "where"],
      a: "We work with brands in the USA, Canada, UK, Europe and Latin America. We're based in Thane, Mumbai, India." },
    { k: ["process", "how do you work", "how it works", "steps", "how does it work"],
      a: "1) Share your brief  2) Get a shortlist of mills with specs &amp; prices  3) Samples, lab dips &amp; testing  4) Factory inspection against your approved sample &amp; AQL  5) We follow bulk through to shipment." },
    { k: ["sample", "swatch", "lab dip", "strike"],
      a: "Yes – we arrange samples, swatches, lab dips and strike-offs once you've picked from the shortlist. Want to start a request now?", flow: true },
    { k: ["catalog", "catalogue", "pdf", "brochure"],
      a: "Here are our catalogues: <a href=\"/Global_Synctex_Outdoor_Outerwear_Fabrics.pdf\" target=\"_blank\" rel=\"noopener\">Outdoor &amp; outerwear fabrics</a> · <a href=\"/Global_Synctex_Workwear_AW28_SS28.pdf\" target=\"_blank\" rel=\"noopener\">Workwear AW28/SS28</a> · <a href=\"/sourcing-team-how-we-work.pdf\" target=\"_blank\" rel=\"noopener\">How we work</a>" },
    { k: ["mill", "supplier", "introduce", "partner with you"],
      a: "Are you an Indian mill or factory? We'd be glad to hear from you – use the <a href=\"#enquire\">enquiry form</a> (choose \"Introduce your mill\") or message us on WhatsApp." },
    { k: ["who", "founder", "about", "vaishali", "experience"],
      a: "Global Synctex was founded by Vaishali Khairnar, who has around 25 years in Indian textiles." },
    { k: ["contact", "phone", "call", "email", "whatsapp", "talk", "human", "person"],
      a: "You can reach Vaishali directly on WhatsApp (+91 90822 27801) or by email at vaishalik@globalsynctex.com.", contact: true },
    { k: ["hello", "hi", "hey", "good morning", "good evening", "namaste"],
      a: "Hello! 👋 How can I help with your textile sourcing today?" }
  ];

  /* ---------- Helpers ---------- */
  function esc(s) { return String(s).replace(/[&<>"']/g, function (c) { return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]; }); }
  function store(k, v) { try { if (v === undefined) return sessionStorage.getItem(k); sessionStorage.setItem(k, v); } catch (e) { return null; } }
  function waLink(text) { return "https://wa.me/" + CFG.whatsapp + "?text=" + encodeURIComponent(text); }
  function mailLink(subj, body) { return "mailto:" + CFG.email + "?subject=" + encodeURIComponent(subj) + "&body=" + encodeURIComponent(body); }

  function match(q) {
    q = " " + q.toLowerCase() + " ";
    var best = null, score = 0;
    KB.forEach(function (item) {
      var s = 0;
      item.k.forEach(function (w) { if (q.indexOf(w) !== -1) s += w.length; });
      if (s > score) { score = s; best = item; }
    });
    return best;
  }

  /* ---------- Styles ---------- */
  var css = "" +
    "#gsa-root,#gsa-root *{box-sizing:border-box;font-family:inherit}" +
    "#gsa-root{position:fixed;right:20px;bottom:20px;z-index:2147483000;font-size:15px;line-height:1.45;color:#1d2329}" +
    "#gsa-btn{width:60px;height:60px;border-radius:50%;border:0;cursor:pointer;background:" + CFG.accent + ";color:" + CFG.accentText + ";box-shadow:0 6px 20px rgba(0,0,0,.22);display:flex;align-items:center;justify-content:center;transition:transform .2s}" +
    "#gsa-btn:hover{transform:scale(1.06)}#gsa-btn svg{width:28px;height:28px}" +
    "#gsa-dot{position:absolute;top:2px;right:2px;width:14px;height:14px;border-radius:50%;background:#e5484d;border:2px solid #fff;display:none}" +
    "#gsa-bubble{position:absolute;right:0;bottom:74px;width:260px;background:#fff;border-radius:14px;padding:14px 34px 14px 14px;box-shadow:0 8px 28px rgba(0,0,0,.18);cursor:pointer;display:none;animation:gsaUp .35s ease}" +
    "#gsa-bubble b{display:block;margin-bottom:2px}#gsa-bubble .x{position:absolute;top:6px;right:8px;border:0;background:none;font-size:18px;cursor:pointer;color:#888}" +
    "#gsa-panel{position:absolute;right:0;bottom:74px;width:370px;max-width:calc(100vw - 40px);height:540px;max-height:calc(100vh - 110px);background:#fff;border-radius:16px;box-shadow:0 12px 40px rgba(0,0,0,.25);display:none;flex-direction:column;overflow:hidden;animation:gsaUp .25s ease}" +
    "#gsa-panel.open{display:flex}" +
    ".gsa-head{background:" + CFG.accent + ";color:" + CFG.accentText + ";padding:14px 16px;display:flex;align-items:center;gap:10px}" +
    ".gsa-head .av{width:36px;height:36px;border-radius:50%;background:rgba(255,255,255,.18);display:flex;align-items:center;justify-content:center;font-weight:700}" +
    ".gsa-head .t{flex:1}.gsa-head .t b{display:block;font-size:15px}.gsa-head .t span{font-size:12px;opacity:.85}" +
    ".gsa-head button{background:none;border:0;color:inherit;font-size:22px;cursor:pointer;line-height:1}" +
    ".gsa-body{flex:1;overflow-y:auto;padding:14px;background:#f5f7f8}" +
    ".gsa-msg{max-width:86%;padding:9px 12px;border-radius:14px;margin:0 0 8px;word-wrap:break-word}" +
    ".gsa-msg a{color:" + CFG.accent + ";font-weight:600}" +
    ".gsa-bot{background:#fff;border:1px solid #e3e8eb;border-bottom-left-radius:4px}" +
    ".gsa-me{background:" + CFG.accent + ";color:" + CFG.accentText + ";margin-left:auto;border-bottom-right-radius:4px}" +
    ".gsa-chips{display:flex;flex-wrap:wrap;gap:6px;margin:2px 0 10px}" +
    ".gsa-chip{border:1px solid " + CFG.accent + ";color:" + CFG.accent + ";background:#fff;border-radius:999px;padding:6px 11px;font-size:13px;cursor:pointer}" +
    ".gsa-chip:hover{background:" + CFG.accent + ";color:" + CFG.accentText + "}" +
    ".gsa-cta{display:flex;gap:8px;margin:4px 0 10px}" +
    ".gsa-cta a{flex:1;text-align:center;padding:9px;border-radius:10px;text-decoration:none;font-weight:600;font-size:14px}" +
    ".gsa-wa{background:#25d366;color:#fff}.gsa-em{background:#fff;color:" + CFG.accent + ";border:1px solid " + CFG.accent + "}" +
    ".gsa-typing{display:inline-flex;gap:4px}.gsa-typing i{width:6px;height:6px;border-radius:50%;background:#9aa5ab;animation:gsaB 1s infinite}" +
    ".gsa-typing i:nth-child(2){animation-delay:.15s}.gsa-typing i:nth-child(3){animation-delay:.3s}" +
    "#gsa-root form.gsa-foot{display:flex;grid-template-columns:none;gap:0;margin:0;padding:0;border:0;border-top:1px solid #e3e8eb;border-radius:0;box-shadow:none;background:#fff}" +
    "#gsa-root .gsa-foot input{flex:1;width:auto;margin:0;border:0;border-radius:0;box-shadow:none;padding:14px;font-size:16px;color:#1d2329;outline:none;background:transparent}" +
    "#gsa-root .gsa-foot button{margin:0;border:0;background:none;padding:0 16px;cursor:pointer;color:" + CFG.accent + ";font-weight:700}" +
    ".gsa-note{font-size:11px;color:#7a868c;text-align:center;padding:4px 0 6px;background:#fff}" +
    "@keyframes gsaUp{from{opacity:0;transform:translateY(10px)}to{opacity:1;transform:none}}" +
    "@keyframes gsaB{0%,80%,100%{opacity:.3}40%{opacity:1}}" +
    "@media (max-width:480px){#gsa-root{right:12px;bottom:12px}#gsa-panel{position:fixed;inset:0;width:100%;max-width:none;height:100%;max-height:none;border-radius:0}}";

  /* ---------- Markup ---------- */
  var root = document.createElement("div");
  root.id = "gsa-root";
  root.innerHTML =
    '<style>' + css + '</style>' +
    '<div id="gsa-bubble" role="button" tabindex="0"><button class="x" aria-label="Dismiss">×</button>' +
      '<b>Hi there 👋</b>Looking for a fabric or a mill in India? I can help you get started.</div>' +
    '<div id="gsa-panel" role="dialog" aria-label="' + esc(CFG.name) + '">' +
      '<div class="gsa-head"><div class="av">GS</div><div class="t"><b>' + esc(CFG.name) + '</b><span>Typically replies on WhatsApp within a day</span></div>' +
      '<button id="gsa-close" aria-label="Close chat">×</button></div>' +
      '<div class="gsa-body" id="gsa-body" aria-live="polite"></div>' +
      '<form class="gsa-foot" id="gsa-form"><input id="gsa-in" type="text" placeholder="Type your question…" autocomplete="off" aria-label="Your message"><button type="submit">Send</button></form>' +
      '<div class="gsa-note">Nothing you type here is stored. Enquiries open in WhatsApp or email.</div>' +
    '</div>' +
    '<button id="gsa-btn" aria-label="Open chat"><span id="gsa-dot"></span>' +
      '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>' +
    '</button>';

  function $(id) { return document.getElementById(id); }

  /* ---------- Chat engine ---------- */
  var flow = null; // guided enquiry state
  var started = false;

  function scroll() { var b = $("gsa-body"); b.scrollTop = b.scrollHeight; }

  function addMsg(html, who) {
    var d = document.createElement("div");
    d.className = "gsa-msg " + (who === "me" ? "gsa-me" : "gsa-bot");
    d.innerHTML = html;
    $("gsa-body").appendChild(d); scroll();
  }

  function bot(html, after) {
    var t = document.createElement("div");
    t.className = "gsa-msg gsa-bot";
    t.innerHTML = '<span class="gsa-typing"><i></i><i></i><i></i></span>';
    $("gsa-body").appendChild(t); scroll();
    setTimeout(function () { t.innerHTML = html; scroll(); if (after) after(); }, 550);
  }

  function chips(list) {
    var w = document.createElement("div");
    w.className = "gsa-chips";
    list.forEach(function (c) {
      var b = document.createElement("button");
      b.type = "button"; b.className = "gsa-chip"; b.textContent = c.label;
      b.onclick = function () { w.remove(); addMsg(esc(c.label), "me"); c.go(); };
      w.appendChild(b);
    });
    $("gsa-body").appendChild(w); scroll();
  }

  function contactButtons(text, subj) {
    var w = document.createElement("div");
    w.className = "gsa-cta";
    w.innerHTML = '<a class="gsa-wa" target="_blank" rel="noopener" href="' + waLink(text) + '">WhatsApp</a>' +
                  '<a class="gsa-em" href="' + mailLink(subj || "Enquiry from website", text) + '">Email</a>';
    $("gsa-body").appendChild(w); scroll();
  }

  function mainMenu() {
    chips([
      { label: "Start a fabric enquiry", go: startFlow },
      { label: "What can you source?", go: function () { answer("what can you source"); } },
      { label: "MOQs & lead times", go: function () { answer("moq"); } },
      { label: "Sustainable fabrics", go: function () { answer("sustainable"); } },
      { label: "Talk to Vaishali", go: function () { answer("contact"); } }
    ]);
  }

  function answer(q) {
    var m = match(q);
    if (!m) {
      bot("I'm not sure about that one, but Vaishali can answer directly. Message her with your question:", function () {
        contactButtons("Hi Vaishali, I have a question from your website: " + q, "Question from website");
        chips([{ label: "Start a fabric enquiry", go: startFlow }, { label: "Other questions", go: menuAgain }]);
      });
      return;
    }
    bot(m.a, function () {
      if (m.contact) contactButtons("Hi Vaishali, I found you on globalsynctex.com and would like to discuss a sourcing requirement.");
      if (m.flow) chips([{ label: "Yes, start a request", go: startFlow }, { label: "Not now", go: menuAgain }]);
      else chips([{ label: "Start a fabric enquiry", go: startFlow }, { label: "Other questions", go: menuAgain }]);
    });
  }

  function menuAgain() { bot("What else can I help with?", mainMenu); }

  /* Guided enquiry → WhatsApp / email */
  var STEPS = [
    { key: "type", q: "Great! What are you looking for?",
      opts: ["Outdoor / performance fabric", "Workwear / hi-vis", "Suiting / shirting", "Medical uniform fabric", "Finished garments", "Something else"] },
    { key: "spec", q: "Tell me a little about the spec – e.g. composition, GSM, width, finish (or type “skip”)." },
    { key: "qty", q: "Roughly what quantity?", opts: ["Under 1,000 m", "1,000 – 5,000 m", "5,000 m +", "Not sure yet"] },
    { key: "date", q: "Target delivery date?", opts: ["Within 2 months", "2 – 4 months", "4 months +", "Flexible"] },
    { key: "country", q: "Which country are you based in?" },
    { key: "name", q: "Last one – your name and company?" }
  ];

  function startFlow() { flow = { i: 0, data: {} }; ask(); }

  function ask() {
    var s = STEPS[flow.i];
    bot(s.q, function () {
      if (s.opts) chips(s.opts.map(function (o) { return { label: o, go: function () { take(o); } }; }));
      $("gsa-in").focus();
    });
  }

  function take(v) {
    var s = STEPS[flow.i];
    flow.data[s.key] = /^skip$/i.test(v) ? "—" : v;
    flow.i++;
    if (flow.i < STEPS.length) ask(); else finishFlow();
  }

  function finishFlow() {
    var d = flow.data; flow = null;
    var text =
      "Hi Vaishali, new sourcing enquiry from globalsynctex.com\n\n" +
      "• Looking for: " + d.type + "\n" +
      "• Spec: " + d.spec + "\n" +
      "• Quantity: " + d.qty + "\n" +
      "• Target date: " + d.date + "\n" +
      "• Country: " + d.country + "\n" +
      "• Name / company: " + d.name;
    bot("Thanks, " + esc(d.name.split(/[ ,]/)[0]) + "! Here's your brief – tap one to send it. Attach a tech pack or swatch photo if you have one.", function () {
      addMsg(esc(text).replace(/\n/g, "<br>"), "bot");
      contactButtons(text, "Sourcing enquiry – " + d.type);
      chips([{ label: "Use the full enquiry form", go: function () { closePanel(); location.hash = CFG.enquiryAnchor; } }, { label: "Other questions", go: menuAgain }]);
    });
  }

  /* ---------- Open / close ---------- */
  function openPanel() {
    $("gsa-bubble").style.display = "none";
    $("gsa-dot").style.display = "none";
    $("gsa-panel").classList.add("open");
    store("gsa_seen", "1");
    if (!started) {
      started = true;
      bot("Hi! 👋 I'm the Global Synctex assistant. We help overseas brands source fabrics and garments from vetted Indian mills.", function () {
        bot("What would you like to do?", mainMenu);
      });
    }
    setTimeout(function () { $("gsa-in").focus(); }, 300);
  }
  function closePanel() { $("gsa-panel").classList.remove("open"); }

  function init() {
    document.body.appendChild(root);
    $("gsa-btn").onclick = function () { $("gsa-panel").classList.contains("open") ? closePanel() : openPanel(); };
    $("gsa-close").onclick = closePanel;
    $("gsa-bubble").onclick = function (e) {
      if (e.target.classList.contains("x")) { $("gsa-bubble").style.display = "none"; store("gsa_seen", "1"); e.stopPropagation(); return; }
      openPanel();
    };
    $("gsa-form").onsubmit = function (e) {
      e.preventDefault();
      var v = $("gsa-in").value.trim(); if (!v) return;
      $("gsa-in").value = "";
      document.querySelectorAll("#gsa-body .gsa-chips").forEach(function (c) { c.remove(); });
      addMsg(esc(v), "me");
      if (flow) take(v); else answer(v);
    };
    document.addEventListener("keydown", function (e) { if (e.key === "Escape") closePanel(); });

    if (CFG.popupDelayMs && !store("gsa_seen")) {
      setTimeout(function () {
        if ($("gsa-panel").classList.contains("open")) return;
        $("gsa-bubble").style.display = "block";
        $("gsa-dot").style.display = "block";
      }, CFG.popupDelayMs);
    }
  }

  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", init); else init();
})();
