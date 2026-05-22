const params = new URLSearchParams(window.location.search);
const key = params.get("topic") || params.get("workflow") || params.get("tool") || "investing";
const type = document.querySelector("[data-detail-type]")?.dataset.detailType;
const content = window.BIG_CONTENT;
const lessonToolMap = {
  investing: ["compound", "budget"],
  credit: ["credit"],
  budgeting: ["budget"],
  ai: ["budget", "compound", "credit", "debt_planner"],
  careers: ["budget", "compound"],
  entrepreneurship: ["budget", "compound"],
  diversification: ["compound"],
  stocks: ["compound"],
  etfs: ["compound"],
  reset: ["budget", "credit"],
  debt_payoff: ["debt_planner", "budget"],
  taxes_paychecks: ["budget"],
  insurance_risk: ["budget"],
};

function money(value) {
  return new Intl.NumberFormat("en-US", { style: "currency", currency: "USD", maximumFractionDigits: 0 }).format(value);
}

function list(items) {
  return items.map((item) => `<li>${item}</li>`).join("");
}

function slugTitle(slug) {
  return slug
    .split("-")
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ");
}

function logoDomain(app) {
  if (app.logoDomain || app.domain) return app.logoDomain || app.domain;
  try {
    return new URL(app.url).hostname.replace(/^www\./, "");
  } catch {
    return "";
  }
}

function logoMarkup(item, className = "app-logo-wrap") {
  const domain = logoDomain(item);
  const logo = item.logo || (domain ? `https://logo.clearbit.com/${domain}` : "");
  const backupLogo = domain ? `https://www.google.com/s2/favicons?domain=${domain}&sz=128` : "";
  const fallback = item.name ? item.name.charAt(0) : "B";
  if (!logo && !backupLogo) return `<span class="${className}">${fallback}</span>`;
  const src = logo || backupLogo;
  return `<span class="${className}">
    <img src="${src}" alt="${item.name} logo" loading="lazy" onerror="${backupLogo && src !== backupLogo ? `this.onerror=null;this.src='${backupLogo}'` : `this.replaceWith(document.createTextNode('${fallback}'))`}" />
  </span>`;
}

function renderApps(apps = []) {
  const section = document.querySelector("#recommended-apps");
  const container = document.querySelector("#detail-apps");
  if (!section || !container) return;
  if (!apps.length) {
    section.hidden = true;
    container.innerHTML = "";
    return;
  }
  section.hidden = false;
  container.innerHTML = apps
    .map((app) => {
      return `<a class="app-card" href="${app.url}" target="_blank" rel="noopener noreferrer">
        ${logoMarkup(app)}
        <span class="app-copy">
          <strong>${app.name}</strong>
          <span>${app.note}</span>
          <small>${app.cost || "Check website for pricing"}</small>
        </span>
      </a>`;
    })
    .join("");
}

function renderLessonTools(currentKey, toolKeys = []) {
  const section = document.querySelector("#chapter-tools");
  const container = document.querySelector("#detail-tools");
  if (!section || !container) return;
  const keys = toolKeys.length ? toolKeys : lessonToolMap[currentKey] || [];
  const tools = keys
    .map((toolKey) => [toolKey, content.tools?.[toolKey]])
    .filter(([, tool]) => Boolean(tool));
  if (!tools.length) {
    section.hidden = true;
    container.innerHTML = "";
    return;
  }
  section.hidden = false;
  container.innerHTML = tools
    .map(
      ([toolKey, tool]) => `<a class="lesson-tool-card" href="tool.html?tool=${toolKey}">
        <span>Interactive tool</span>
        <strong>${tool.title}</strong>
        <p>${tool.summary}</p>
        <small>Open tool</small>
      </a>`
    )
    .join("");
}

function renderRelated(collection, currentKey, hrefPrefix, limit = 3) {
  const container = document.querySelector("#related-links");
  if (!container) return;
  const items = Object.entries(collection)
    .filter(([itemKey]) => itemKey !== currentKey)
    .slice(0, limit)
    .map(([itemKey, item]) => {
      const title = item.title || slugTitle(itemKey);
      const summary = item.summary || "Continue exploring this topic.";
      return `<a class="related-card" href="${hrefPrefix}${itemKey}"><span>${title}</span><p>${summary}</p></a>`;
    });
  container.innerHTML = items.join("");
}

function setupCopyButtons() {
  document.querySelectorAll("[data-copy-target]").forEach((button) => {
    button.addEventListener("click", async () => {
      const target = document.querySelector(`#${button.dataset.copyTarget}`);
      const text = target?.textContent.trim();
      if (!text) return;
      try {
        await navigator.clipboard.writeText(text);
        button.textContent = "Copied";
      } catch {
        button.textContent = "Select and copy";
      }
      setTimeout(() => {
        button.textContent = "Copy prompt";
      }, 1600);
    });
  });
}

function missing() {
  document.querySelector("#detail-title").textContent = "Page not found";
  document.querySelector("#detail-summary").textContent = "This topic is not available yet.";
}

function renderLesson() {
  const item = content.lessons[key];
  if (!item) return missing();

  // Mark this chapter as completed in localStorage
  try {
    const done = JSON.parse(localStorage.getItem('completedChapters') || '[]');
    if (!done.includes(key)) { done.push(key); localStorage.setItem('completedChapters', JSON.stringify(done)); }
  } catch(e) {}
  document.title = `${item.title} | Barone Investment Group`;
  document.querySelector("#detail-eyebrow").textContent = item.eyebrow;
  document.querySelector("#detail-title").textContent = item.title;
  document.querySelector("#detail-summary").textContent = item.summary;
  document.querySelector("#detail-audience").textContent = item.audience;
  document.querySelector("#detail-outcomes").innerHTML = list(item.outcomes);
  const quickWin = document.querySelector("#module-quick-win");
  const moduleNav = document.querySelector("#module-nav");
  if (quickWin) quickWin.textContent = item.checklist?.[0] || "Start with one small action from the checklist below.";
  if (moduleNav) {
    moduleNav.innerHTML = item.sections
      .map(
        (section, index) =>
          `<a href="#lesson-step-${index + 1}">
            <span>${String(index + 1).padStart(2, "0")}</span>
            <strong>${section.title}</strong>
          </a>`
      )
      .join("");
  }
  document.querySelector("#detail-sections").innerHTML = item.sections
    .map(
      (section, index) => `<article class="module-lesson-card" id="lesson-step-${index + 1}">
        <div class="lesson-step-num">${String(index + 1).padStart(2, "0")}</div>
        <div>
          <p class="panel-label">${index === 0 ? "Start Here" : "Lesson Step"}</p>
          <h2>${section.title}</h2>
          <p>${section.body}</p>
        </div>
      </article>`
    )
    .join("");
  document.querySelector("#detail-checklist").innerHTML = list(item.checklist);
  document.querySelector("#detail-prompt").textContent = item.prompt;
  renderLessonTools(key, item.tools);
  renderApps(item.apps);

  // Next chapter guide path
  const CHAPTER_ORDER = ['reset','budgeting','credit','debt_payoff','investing','ai','careers','taxes_paychecks','insurance_risk'];
  const CHAPTER_LABELS = {
    reset: 'Money Reset', budgeting: 'Budgeting', credit: 'Credit', debt_payoff: 'Debt Payoff',
    investing: 'Investing', ai: 'AI & Finance', careers: 'Careers', taxes_paychecks: 'Taxes & Paychecks', insurance_risk: 'Insurance'
  };
  const currentIdx = CHAPTER_ORDER.indexOf(key);
  const nextKey   = (currentIdx >= 0 && currentIdx < CHAPTER_ORDER.length - 1) ? CHAPTER_ORDER[currentIdx + 1] : null;
  const nextItem  = nextKey ? content.lessons[nextKey] : null;
  const chapterNum = currentIdx >= 0 ? currentIdx + 1 : null;
  const main = document.querySelector('main');

  if (nextItem) {
    const el = document.createElement('section');
    el.className = 'next-chapter-banner';
    el.innerHTML = `
      <div class="next-chapter-inner">
        <div class="next-chapter-copy">
          <p class="eyebrow">Chapter ${chapterNum + 1} of ${CHAPTER_ORDER.length} &mdash; Up next</p>
          <h2>${nextItem.title}</h2>
          <p>${nextItem.summary}</p>
        </div>
        <a class="button primary" href="lesson.html?topic=${nextKey}">Continue &rarr;</a>
      </div>
    `;
    main.appendChild(el);
  } else if (currentIdx === CHAPTER_ORDER.length - 1) {
    const el = document.createElement('section');
    el.className = 'next-chapter-banner next-chapter-final';
    el.innerHTML = `
      <div class="next-chapter-inner">
        <div class="next-chapter-copy">
          <p class="eyebrow">You finished all ${CHAPTER_ORDER.length} chapters</p>
          <h2>Now put it into practice.</h2>
          <p>Use the interactive tools to run real numbers on your own situation and build the habit of thinking before you spend.</p>
        </div>
        <a class="button primary" href="index.html#tools">Open the tools &rarr;</a>
      </div>
    `;
    main.appendChild(el);
  }

  // ── Lesson hero rising-dots canvas ──────────────────────────────────────
  (function() {
    const cv = document.getElementById('lesson-hero-canvas');
    if (!cv) return;
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    const ctx = cv.getContext('2d');
    let pts = [], raf;
    function resize() {
      cv.width  = cv.offsetWidth  || cv.parentElement.offsetWidth;
      cv.height = cv.offsetHeight || cv.parentElement.offsetHeight || 280;
    }
    function init() {
      resize();
      const n = Math.floor((cv.width * cv.height) / 22000);
      pts = Array.from({ length: Math.max(18, Math.min(n, 40)) }, () => ({
        x: Math.random() * cv.width,
        y: cv.height + Math.random() * cv.height,
        vy: -(0.18 + Math.random() * 0.28),
        r:  0.8 + Math.random() * 1.4,
        a:  0.08 + Math.random() * 0.18
      }));
    }
    function draw() {
      ctx.clearRect(0, 0, cv.width, cv.height);
      for (const p of pts) {
        p.y += p.vy;
        if (p.y < -6) { p.y = cv.height + 6; p.x = Math.random() * cv.width; }
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(215,181,109,${p.a})`;
        ctx.fill();
      }
      raf = requestAnimationFrame(draw);
    }
    init(); draw();
    window.addEventListener('resize', () => { cancelAnimationFrame(raf); init(); draw(); }, { passive: true });
  })();

  // ── Typewriter on AI prompt panel ───────────────────────────────────────
  (function() {
    const promptEl = document.querySelector('#detail-prompt');
    if (!promptEl || window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    const fullText = promptEl.textContent;
    promptEl.textContent = '';
    let started = false;
    const io = new IntersectionObserver((entries) => {
      if (!started && entries[0].isIntersecting) {
        started = true;
        io.disconnect();
        let i = 0;
        const speed = Math.max(18, Math.min(38, Math.round(3800 / fullText.length)));
        const timer = setInterval(() => {
          promptEl.textContent = fullText.slice(0, ++i);
          if (i >= fullText.length) clearInterval(timer);
        }, speed);
      }
    }, { threshold: 0.5 });
    const panel = promptEl.closest('.prompt-panel') || promptEl;
    io.observe(panel);
  })();

  // Scroll progress bar
  const progressBar = document.getElementById('lesson-progress');
  if (progressBar) {
    const updateProgress = () => {
      const scrollTop = window.scrollY;
      const docHeight = document.documentElement.scrollHeight - window.innerHeight;
      progressBar.style.width = (docHeight > 0 ? Math.min(100, (scrollTop / docHeight) * 100) : 0) + '%';
    };
    window.addEventListener('scroll', updateProgress, { passive: true });
    updateProgress();
  }

  // Money type badge
  (function() {
    try {
      const stored = localStorage.getItem('bigProfile');
      if (!stored) return;
      const p = JSON.parse(stored);
      if (!p || !p.name) return;
      const shortName = p.name.replace(/^The\s+/, '');
      const badge = document.createElement('a');
      badge.href = 'index.html#quiz';
      badge.className = 'money-type-badge';
      badge.setAttribute('aria-label', 'Your money type: ' + p.name + '. Click to retake quiz.');
      badge.innerHTML = `<span class="badge-emoji">${p.emoji}</span><span class="badge-name">${shortName}</span><span class="badge-retake">retake</span>`;
      document.body.appendChild(badge);
    } catch(e) {}
  })();
}

function renderWorkflow() {
  const item = content.workflows[key];
  if (!item) return missing();
  document.title = `${item.title} | Barone Investment Group`;
  document.querySelector("#detail-title").textContent = item.title;
  document.querySelector("#detail-summary").textContent = item.summary;
  document.querySelector("#workflow-steps").innerHTML = list(item.steps);
  document.querySelector("#workflow-automation").textContent = item.automation;
  document.querySelector("#workflow-prompt").textContent = item.prompt;

  const toolsContainer = document.querySelector("#workflow-tools");
  if (toolsContainer && item.resources && item.resources.length) {
    toolsContainer.innerHTML = item.resources
      .map(
        (r) =>
          `<a class="workflow-tool-chip" href="${r.url}" target="_blank" rel="noopener noreferrer">
            ${logoMarkup(r, "workflow-logo-wrap")}
            <span class="workflow-tool-copy">
              <strong>${r.name}</strong>
              <span>${r.note}</span>
            </span>
          </a>`
      )
      .join("");
  }

  renderRelated(content.workflows, key, "workflow.html?workflow=");
}

function drawChart(values, labels, colors = ["#60a5fa", "#f2d990", "#22c55e", "#fb7185", "#a78bfa"]) {
  const canvas = document.querySelector("#tool-page-chart");
  const ctx = canvas.getContext("2d");
  const width = canvas.width;
  const height = canvas.height;
  ctx.clearRect(0, 0, width, height);
  ctx.fillStyle = "rgba(255,255,255,0.04)";
  ctx.fillRect(0, 0, width, height);
  const max = Math.max(...values, 1);
  const gap = 16;
  const barWidth = (width - gap * (values.length + 1)) / values.length;
  values.forEach((value, index) => {
    const barHeight = (value / max) * (height - 72);
    const x = gap + index * (barWidth + gap);
    const y = height - barHeight - 36;
    const gradient = ctx.createLinearGradient(0, y, 0, height);
    gradient.addColorStop(0, colors[index % colors.length]);
    gradient.addColorStop(1, "rgba(255,255,255,0.16)");
    ctx.fillStyle = gradient;
    ctx.fillRect(x, y, barWidth, barHeight);
    ctx.fillStyle = "rgba(255,255,255,0.78)";
    ctx.font = "18px sans-serif";
    ctx.fillText(labels[index], x, height - 10);
  });
}

function pageControl(label, id, min, max, value, step = 1, prefix = "", suffix = "") {
  return `<label class="tool-control-row"><span>${label} <strong id="${id}-value">${prefix}${value}${suffix}</strong></span><input id="${id}" type="range" min="${min}" max="${max}" value="${value}" step="${step}" /></label>`;
}

function setPageControlValue(id, value, prefix = "", suffix = "") {
  const target = document.querySelector(`#${id}-value`);
  if (target) target.textContent = `${prefix}${value}${suffix}`;
}

function monthsToPayoff(balance, apr, payment) {
  const b = Math.max(0, balance);
  const pay = Math.max(0, payment);
  const r = Math.max(0, apr) / 100 / 12;
  if (!b) return 0;
  if (!pay) return 999;
  if (r === 0) return Math.ceil(b / pay);
  if (pay <= b * r) return 999;
  return Math.ceil(-Math.log(1 - (b * r) / pay) / Math.log(1 + r));
}

const toolRenderers = {
  compound() {
    const controls = document.querySelector("#tool-page-controls");
    controls.innerHTML = `
      ${pageControl("Starting amount", "p-start", 0, 25000, 1000, 250, "$")}
      ${pageControl("Monthly contribution", "p-monthly", 25, 2000, 250, 25, "$")}
      ${pageControl("Years", "p-years", 1, 40, 20, 1, "", " yrs")}
      ${pageControl("Return assumption", "p-rate", 0, 12, 7, 0.5, "", "%")}
    `;
    const update = () => {
      const s = Number(document.querySelector("#p-start").value);
      const m = Number(document.querySelector("#p-monthly").value);
      const y = Number(document.querySelector("#p-years").value);
      const rate = Number(document.querySelector("#p-rate").value);
      setPageControlValue("p-start", s, "$");
      setPageControlValue("p-monthly", m, "$");
      setPageControlValue("p-years", y, "", " yrs");
      setPageControlValue("p-rate", rate, "", "%");
      const r = rate / 100 / 12;
      const values = [5, 10, 15, 20, 30].map((year) => {
        const months = Math.min(year, y) * 12;
        return s * (1 + r) ** months + (r === 0 ? m * months : m * (((1 + r) ** months - 1) / r));
      });
      drawChart(values, ["5y", "10y", "15y", "20y", "30y"], ["#38bdf8", "#60a5fa", "#f2d990", "#22c55e", "#a78bfa"]);
      const months = y * 12;
      const total = s * (1 + r) ** months + (r === 0 ? m * months : m * (((1 + r) ** months - 1) / r));
      const contributed = s + m * months;
      document.querySelector("#tool-page-result").textContent = money(total);
      document.querySelector("#tool-page-note").textContent = `${money(contributed)} contributed, ${money(Math.max(0, total - contributed))} estimated growth`;
    };
    controls.querySelectorAll("input").forEach((input) => input.addEventListener("input", update));
    update();
  },
  credit() {
    const controls = document.querySelector("#tool-page-controls");
    controls.innerHTML = `
      ${pageControl("Balance", "p-balance", 0, 10000, 1250, 50, "$")}
      ${pageControl("Limit", "p-limit", 500, 20000, 5000, 100, "$")}
    `;
    const update = () => {
      const balance = Number(document.querySelector("#p-balance").value);
      const limit = Number(document.querySelector("#p-limit").value);
      setPageControlValue("p-balance", balance, "$");
      setPageControlValue("p-limit", limit, "$");
      const pct = Math.round((balance / limit) * 100);
      drawChart([pct, 30, 10], ["current", "30%", "10%"], [pct > 30 ? "#ef4444" : pct > 10 ? "#f59e0b" : "#22c55e", "#f59e0b", "#22c55e"]);
      document.querySelector("#tool-page-result").textContent = `${pct}%`;
      document.querySelector("#tool-page-note").textContent = `${money(Math.max(0, balance - limit * 0.3))} to reach 30%, ${money(Math.max(0, balance - limit * 0.1))} to reach 10%`;
    };
    controls.querySelectorAll("input").forEach((input) => input.addEventListener("input", update));
    update();
  },
  budget() {
    const controls = document.querySelector("#tool-page-controls");
    controls.innerHTML = `
      ${pageControl("Take-home income", "p-income", 800, 9000, 3200, 100, "$")}
      ${pageControl("Housing", "p-housing", 0, 4000, 1100, 50, "$")}
      ${pageControl("Food + transport", "p-basics", 0, 2500, 650, 25, "$")}
      ${pageControl("Debt minimums", "p-budget-debt", 0, 2000, 250, 25, "$")}
      ${pageControl("Subscriptions + fun", "p-flex", 0, 2000, 500, 25, "$")}
    `;
    const update = () => {
      const income = Number(document.querySelector("#p-income").value);
      const housing = Number(document.querySelector("#p-housing").value);
      const basics = Number(document.querySelector("#p-basics").value);
      const debt = Number(document.querySelector("#p-budget-debt").value);
      const flex = Number(document.querySelector("#p-flex").value);
      ["p-income", "p-housing", "p-basics", "p-budget-debt", "p-flex"].forEach((id) => setPageControlValue(id, Number(document.querySelector(`#${id}`).value), "$"));
      const leftover = income - housing - basics - debt - flex;
      drawChart([housing, basics, debt, flex, Math.max(0, leftover)], ["home", "basics", "debt", "fun", "left"], ["#60a5fa", "#2dd4bf", "#fb7185", "#a78bfa", "#f2d990"]);
      const status = leftover / Math.max(income, 1) >= 0.15 ? "Healthy" : leftover / Math.max(income, 1) >= 0.03 ? "Tight" : "Risky";
      document.querySelector("#tool-page-result").textContent = status;
      document.querySelector("#tool-page-note").textContent = `${money(leftover)} leftover, about ${money(Math.max(0, leftover / 4.33))}/week flexible`;
    };
    controls.querySelectorAll("input").forEach((input) => input.addEventListener("input", update));
    update();
  },
  salary() {
    const controls = document.querySelector("#tool-page-controls");
    controls.innerHTML = `
      <label>Salary <input id="p-salary" type="range" min="20000" max="160000" value="65000" step="1000" /></label>
      <label>Deduction % <input id="p-tax" type="range" min="0" max="45" value="25" /></label>
    `;
    const update = () => {
      const salary = Number(document.querySelector("#p-salary").value);
      const tax = Number(document.querySelector("#p-tax").value) / 100;
      const net = salary * (1 - tax);
      drawChart([salary / 12, net / 12, net / 52], ["gross/mo", "net/mo", "net/wk"]);
      document.querySelector("#tool-page-result").textContent = money(net / 12);
      document.querySelector("#tool-page-note").textContent = `${money(net / 52)} estimated weekly take-home`;
    };
    controls.querySelectorAll("input").forEach((input) => input.addEventListener("input", update));
    update();
  },
  afford() {
    const controls = document.querySelector("#tool-page-controls");
    controls.innerHTML = `
      <label>Purchase <input id="p-cost" type="range" min="25" max="5000" value="400" step="25" /></label>
      <label>Monthly income <input id="p-afford-income" type="range" min="500" max="8000" value="2500" step="100" /></label>
    `;
    const update = () => {
      const cost = Number(document.querySelector("#p-cost").value);
      const income = Number(document.querySelector("#p-afford-income").value);
      const pct = Math.round((cost / income) * 100);
      drawChart([cost, income * 0.1, income * 0.2], ["cost", "10%", "20%"]);
      document.querySelector("#tool-page-result").textContent = `${pct}%`;
      document.querySelector("#tool-page-note").textContent = `${money(cost)} compared with ${money(income)} monthly income`;
    };
    controls.querySelectorAll("input").forEach((input) => input.addEventListener("input", update));
    update();
  },
  finder() {
    const controls = document.querySelector("#tool-page-controls");
    controls.innerHTML = `
      <label>Need score <input id="p-need" type="range" min="1" max="10" value="7" /></label>
      <label>Confidence <input id="p-confidence" type="range" min="1" max="10" value="4" /></label>
    `;
    const update = () => {
      const need = Number(document.querySelector("#p-need").value);
      const confidence = Number(document.querySelector("#p-confidence").value);
      drawChart([need, confidence, 10 - confidence], ["need", "skill", "gap"]);
      document.querySelector("#tool-page-result").textContent = need > confidence ? "Use a guided workflow" : "Use a checklist";
      document.querySelector("#tool-page-note").textContent = "AI should help structure the task, not make the final decision.";
    };
    controls.querySelectorAll("input").forEach((input) => input.addEventListener("input", update));
    update();
  },
  emergency() {
    const controls = document.querySelector("#tool-page-controls");
    controls.innerHTML = `
      <label>Monthly expenses <input id="p-expenses" type="range" min="500" max="6000" value="1800" step="100" /></label>
    `;
    const update = () => {
      const e = Number(document.querySelector("#p-expenses").value);
      drawChart([e, e * 3, e * 6], ["1 mo", "3 mo", "6 mo"]);
      document.querySelector("#tool-page-result").textContent = money(e * 3);
      document.querySelector("#tool-page-note").textContent = `3-month target based on ${money(e)}/mo expenses`;
    };
    controls.querySelector("input").addEventListener("input", update);
    update();
  },
  debt_planner() {
    const controls = document.querySelector("#tool-page-controls");
    controls.innerHTML = `
      ${pageControl("Balance", "p-debt-balance", 500, 30000, 6000, 250, "$")}
      ${pageControl("APR", "p-debt-rate", 0, 36, 22, 0.5, "", "%")}
      ${pageControl("Minimum payment", "p-debt-pay", 25, 1000, 180, 25, "$")}
      ${pageControl("Extra payment", "p-debt-extra", 0, 1000, 100, 25, "$")}
    `;
    const update = () => {
      const b = Number(document.querySelector("#p-debt-balance").value);
      const apr = Number(document.querySelector("#p-debt-rate").value);
      const pay = Number(document.querySelector("#p-debt-pay").value);
      const extraPay = Number(document.querySelector("#p-debt-extra").value);
      setPageControlValue("p-debt-balance", b, "$");
      setPageControlValue("p-debt-rate", apr, "", "%");
      setPageControlValue("p-debt-pay", pay, "$");
      setPageControlValue("p-debt-extra", extraPay, "$");
      const base = monthsToPayoff(b, apr, pay);
      const optimized = monthsToPayoff(b, apr, pay + extraPay);
      drawChart([Math.min(base, 120), Math.min(optimized, 120), Math.max(0, Math.min(base - optimized, 120))], ["min", "extra", "saved"], ["#fb7185", "#22c55e", "#f2d990"]);
      document.querySelector("#tool-page-result").textContent = optimized >= 999 ? "Won't pay off" : `${optimized} months`;
      document.querySelector("#tool-page-note").textContent = optimized < 999 && base < 999 ? `${Math.max(0, base - optimized)} months faster than minimum-only` : "Increase monthly payment above interest charge";
    };
    controls.querySelectorAll("input").forEach((input) => input.addEventListener("input", update));
    update();
  },
  email_gen() {
    const controls = document.querySelector("#tool-page-controls");
    controls.innerHTML = `
      <label>Your role
        <select id="p-email-role">
          <option value="student">College student</option>
          <option value="recent">Recent graduate</option>
          <option value="career">Early-career professional</option>
        </select>
      </label>
      <label>Contact type
        <select id="p-email-target">
          <option value="analyst">Analyst / Associate</option>
          <option value="recruiter">Recruiter</option>
          <option value="alumni">Alumni in finance</option>
        </select>
      </label>
    `;
    const templates = {
      analyst: {
        student: "Hi [Name], I'm a [Year] studying [Major] at [School] and am genuinely interested in [Company]'s work in [Area]. I'd love to learn about your path into the role. Would you be open to a 15-minute call? Thanks, [Your Name]",
        recent: "Hi [Name], I recently graduated in [Field] and am focused on [Company]'s approach to [Area]. I'd value any insight into how you approached your first year. Would a brief call work? Best, [Your Name]",
        career: "Hi [Name], I'm currently in [Role] and following [Company]'s work closely. I'd appreciate 15 minutes to hear your perspective on [Topic]. Happy to work around your schedule. Best, [Your Name]",
      },
      recruiter: {
        student: "Hi [Name], I'm a [Year] at [School] targeting finance internships for [Season]. Is [Company] recruiting for [Role]? I'd love to learn about the process. Thank you, [Your Name]",
        recent: "Hi [Name], I'm a recent grad with [Skill] experience and strong interest in [Company]. Are there any open [Role] positions I could apply for? Thank you, [Your Name]",
        career: "Hi [Name], I'm transitioning into [Field] with background in [Current Area]. I'd love to explore fit for any open roles at [Company]. Best, [Your Name]",
      },
      alumni: {
        student: "Hi [Name], I found your profile through [School]'s alumni network. I'm studying [Major] and would value 15 minutes to hear how you broke into finance. No pressure at all. [Your Name]",
        recent: "Hi [Name], we share [School] as alumni. I'm navigating my first year in finance and would love a quick conversation about your experience. [Your Name]",
        career: "Hi [Name], fellow [School] grad here. I'm considering a move toward [Area] and would value your perspective given your path. [Your Name]",
      },
    };
    const canvas = document.querySelector("#tool-page-chart");
    canvas.style.display = "none";
    const resultEl = document.querySelector("#tool-page-result");
    const noteEl = document.querySelector("#tool-page-note");
    const update = () => {
      const role = document.querySelector("#p-email-role").value;
      const target = document.querySelector("#p-email-target").value;
      const tmpl = templates[target]?.[role] || "";
      resultEl.textContent = "Template ready";
      noteEl.textContent = tmpl;
    };
    controls.querySelectorAll("select").forEach((sel) => sel.addEventListener("change", update));
    update();
  },
  invest_guide() {
    const controls = document.querySelector("#tool-page-controls");
    controls.innerHTML = `
      <label>Your experience level
        <select id="p-guide-level">
          <option value="zero">Complete beginner (never invested)</option>
          <option value="aware">Aware but haven't started yet</option>
          <option value="some">Have a brokerage, unsure what to do</option>
        </select>
      </label>
    `;
    const paths = {
      zero: { steps: [3, 5, 8, 10], labels: ["Step 1", "Step 2", "Step 3", "Step 4"], note: "Open account → Learn index funds → Invest $25 → Build the habit" },
      aware: { steps: [5, 8, 10, 9], labels: ["Compare", "Open IRA", "First ETF", "Review"], note: "Compare brokerages → Open Roth IRA → Buy VTI → Set 90-day review" },
      some: { steps: [7, 8, 10, 9], labels: ["Audit", "Automate", "Fees", "Model"], note: "Audit holdings → Automate contributions → Cut fees → Model growth" },
    };
    const canvas = document.querySelector("#tool-page-chart");
    if (canvas) canvas.style.display = "block";
    const update = () => {
      const level = document.querySelector("#p-guide-level").value;
      const { steps, labels, note } = paths[level];
      drawChart(steps, labels);
      document.querySelector("#tool-page-result").textContent = "Your roadmap";
      document.querySelector("#tool-page-note").textContent = note;
    };
    controls.querySelector("select").addEventListener("change", update);
    update();
  },
};

function renderTool() {
  const item = content.tools[key];
  if (!item) return missing();
  document.title = `${item.title} | Barone Investment Group`;
  document.querySelector("#detail-title").textContent = item.title;
  document.querySelector("#detail-summary").textContent = item.summary;
  document.querySelector("#tool-inputs").innerHTML = list(item.inputs);
  document.querySelector("#tool-use-cases").innerHTML = list(item.useCases);
  (toolRenderers[key] || toolRenderers.compound)();
  renderRelated(content.tools, key, "tool.html?tool=");
}

if (type === "lesson") renderLesson();
if (type === "workflow") renderWorkflow();
if (type === "tool") renderTool();
setupCopyButtons();
