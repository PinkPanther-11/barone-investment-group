const header = document.querySelector("[data-header]");
const nav = document.querySelector("[data-nav]");
const navToggle = document.querySelector("[data-nav-toggle]");

const toolData = {
  compound: {
    kicker: "Calculator",
    title: "Compound Interest Calculator",
    copy: "Adjust the inputs to see an educational estimate of future value, total contributions, and growth.",
    html: `
      <label>Monthly contribution <input id="compound-monthly" type="number" min="0" value="250" /></label>
      <label>Years <input id="compound-years" type="number" min="1" value="10" /></label>
      <label>Annual return assumption (%) <input id="compound-rate" type="number" min="0" value="7" step="0.5" /></label>
      <div class="spark-bars" id="compound-bars" aria-hidden="true"></div>
      <div class="result-box"><span>Estimated future value</span><strong id="compound-result">$43,520</strong><small id="compound-note">$30,000 contributed</small></div>
    `,
    init: () => {
      const monthly = document.querySelector("#compound-monthly");
      const years = document.querySelector("#compound-years");
      const rate = document.querySelector("#compound-rate");
      const result = document.querySelector("#compound-result");
      const note = document.querySelector("#compound-note");
      const bars = document.querySelector("#compound-bars");
      const update = () => {
        const m = Number(monthly.value) || 0;
        const y = Math.max(1, Number(years.value) || 1);
        const r = (Number(rate.value) || 0) / 100 / 12;
        const months = y * 12;
        const contributed = m * months;
        const total = r === 0 ? contributed : m * (((1 + r) ** months - 1) / r);
        result.textContent = formatCurrency(total);
        note.textContent = `${formatCurrency(contributed)} contributed`;
        renderBars(bars, [0.2, 0.34, 0.48, 0.67, 0.82, 1].map((scale) => total * scale));
      };
      [monthly, years, rate].forEach((input) => input.addEventListener("input", update));
      update();
    },
  },
  credit: {
    kicker: "Calculator",
    title: "Credit Utilization Calculator",
    copy: "Estimate your utilization ratio. Lower utilization can be healthier, but this is educational only.",
    html: `
      <label>Current card balance <input id="credit-balance" type="number" min="0" value="450" /></label>
      <label>Total credit limit <input id="credit-limit" type="number" min="1" value="2500" /></label>
      <div class="spark-bars" id="credit-bars" aria-hidden="true"></div>
      <div class="result-box"><span>Utilization</span><strong id="credit-result">18%</strong><small id="credit-note">Generally, many learners aim to understand the 30% threshold.</small></div>
    `,
    init: () => {
      const balance = document.querySelector("#credit-balance");
      const limit = document.querySelector("#credit-limit");
      const result = document.querySelector("#credit-result");
      const note = document.querySelector("#credit-note");
      const bars = document.querySelector("#credit-bars");
      const update = () => {
        const b = Number(balance.value) || 0;
        const l = Math.max(1, Number(limit.value) || 1);
        const pct = Math.round((b / l) * 100);
        result.textContent = `${pct}%`;
        note.textContent = pct <= 30 ? "This is below 30% in this example." : "This is above 30% in this example.";
        renderBars(bars, [pct, 30, 10, Math.max(0, pct - 10)], ["Now", "30", "10", "Gap"]);
      };
      [balance, limit].forEach((input) => input.addEventListener("input", update));
      update();
    },
  },
  budget: {
    kicker: "Planner",
    title: "Budget Builder",
    copy: "Create a simple monthly split across needs, wants, saving, and debt payoff.",
    html: `
      <label>Monthly income <input id="budget-income" type="number" min="0" value="2200" /></label>
      <div class="spark-bars" id="budget-bars" aria-hidden="true"></div>
      <div class="result-box"><span>Example split</span><strong id="budget-result">$1,100 needs</strong><small id="budget-note">$660 wants, $440 saving/debt</small></div>
    `,
    init: () => {
      const income = document.querySelector("#budget-income");
      const result = document.querySelector("#budget-result");
      const note = document.querySelector("#budget-note");
      const bars = document.querySelector("#budget-bars");
      const update = () => {
        const value = Number(income.value) || 0;
        result.textContent = `${formatCurrency(value * 0.5)} needs`;
        note.textContent = `${formatCurrency(value * 0.3)} wants, ${formatCurrency(value * 0.2)} saving/debt`;
        renderBars(bars, [value * 0.5, value * 0.3, value * 0.2], ["Needs", "Wants", "Save"]);
      };
      income.addEventListener("input", update);
      update();
    },
  },
  salary: {
    kicker: "Career",
    title: "Salary Breakdown Calculator",
    copy: "Translate a salary into planning numbers. Actual taxes and deductions vary.",
    html: `
      <label>Annual salary <input id="salary-income" type="number" min="0" value="60000" /></label>
      <label>Estimated deduction rate (%) <input id="salary-tax" type="number" min="0" max="60" value="25" /></label>
      <div class="spark-bars" id="salary-bars" aria-hidden="true"></div>
      <div class="result-box"><span>Estimated monthly take-home</span><strong id="salary-result">$3,750</strong><small id="salary-note">$865 per week</small></div>
    `,
    init: () => {
      const income = document.querySelector("#salary-income");
      const tax = document.querySelector("#salary-tax");
      const result = document.querySelector("#salary-result");
      const note = document.querySelector("#salary-note");
      const bars = document.querySelector("#salary-bars");
      const update = () => {
        const annual = Number(income.value) || 0;
        const deduction = Math.min(60, Math.max(0, Number(tax.value) || 0)) / 100;
        const takeHome = annual * (1 - deduction);
        result.textContent = formatCurrency(takeHome / 12);
        note.textContent = `${formatCurrency(takeHome / 52)} per week`;
        renderBars(bars, [annual / 12, takeHome / 12, takeHome / 52], ["Gross", "Net", "Week"]);
      };
      [income, tax].forEach((input) => input.addEventListener("input", update));
      update();
    },
  },
  afford: {
    kicker: "Decision",
    title: "Can I Afford This? Analyzer",
    copy: "Compare a purchase with monthly income and savings goals before buying.",
    html: `
      <label>Purchase cost <input id="afford-cost" type="number" min="0" value="300" /></label>
      <label>Monthly income <input id="afford-income" type="number" min="1" value="2200" /></label>
      <div class="spark-bars" id="afford-bars" aria-hidden="true"></div>
      <div class="result-box"><span>Purchase as income share</span><strong id="afford-result">14%</strong><small id="afford-note">Pause and compare this with your goals.</small></div>
    `,
    init: () => {
      const cost = document.querySelector("#afford-cost");
      const income = document.querySelector("#afford-income");
      const result = document.querySelector("#afford-result");
      const note = document.querySelector("#afford-note");
      const bars = document.querySelector("#afford-bars");
      const update = () => {
        const c = Number(cost.value) || 0;
        const i = Math.max(1, Number(income.value) || 1);
        const pct = Math.round((c / i) * 100);
        result.textContent = `${pct}%`;
        note.textContent = pct <= 10 ? "Low relative to monthly income in this example." : "Worth reviewing against savings priorities.";
        renderBars(bars, [c, i * 0.1, i * 0.2], ["Cost", "10%", "20%"]);
      };
      [cost, income].forEach((input) => input.addEventListener("input", update));
      update();
    },
  },
  finder: {
    kicker: "AI",
    title: "AI Finance Tool Finder",
    copy: "Pick your current question and get a responsible AI workflow to try.",
    html: `
      <label>What are you working on?
        <select id="finder-topic">
          <option value="budget">Budgeting</option>
          <option value="career">Internship search</option>
          <option value="resume">Resume</option>
          <option value="research">Investing research</option>
          <option value="coding">Coding automation</option>
        </select>
      </label>
      <div class="spark-bars" id="finder-bars" aria-hidden="true"></div>
      <div class="result-box"><span>Recommended workflow</span><strong id="finder-result">AI Budgeting Workflow</strong><small id="finder-note">Ask AI to categorize expenses, then verify every output.</small></div>
    `,
    init: () => {
      const topic = document.querySelector("#finder-topic");
      const result = document.querySelector("#finder-result");
      const note = document.querySelector("#finder-note");
      const bars = document.querySelector("#finder-bars");
      const workflows = {
        budget: ["AI Budgeting Workflow", "Ask AI to categorize expenses, then verify every output."],
        career: ["AI Internship Networking Workflow", "Use AI to research firms and draft outreach you personalize."],
        resume: ["AI Resume Improvement Workflow", "Use AI to tighten bullets, then fact-check every claim."],
        research: ["AI Investing Research Workflow", "Use AI to summarize sources and generate questions, not final decisions."],
        coding: ["AI Coding + Automation Workflow", "Use AI to create small scripts, formulas, and trackers with fake test data first."],
      };
      const update = () => {
        const [title, text] = workflows[topic.value];
        result.textContent = title;
        note.textContent = text;
        renderBars(bars, topic.value === "coding" ? [9, 6, 8] : [6, 8, 5], ["Impact", "Ease", "Reuse"]);
      };
      topic.addEventListener("input", update);
      update();
    },
  },
};

const testimonials = [
  {
    copy: "The AI workflow angle makes finance feel less intimidating. It gives me a starting point instead of another lecture.",
    name: "Student builder",
  },
  {
    copy: "The tools make money decisions feel more concrete. I can see the tradeoff before I make the choice.",
    name: "Early career learner",
  },
  {
    copy: "It feels practical and professional without pretending there is a shortcut to wealth.",
    name: "Finance student",
  },
];

function formatCurrency(value) {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0,
  }).format(value);
}

function renderBars(container, values, labels = []) {
  const max = Math.max(...values, 1);
  container.innerHTML = values
    .map((value, index) => {
      const height = Math.max(18, Math.round((value / max) * 104));
      const label = labels[index] || `${index + 1}`;
      return `<span style="height:${height}px"><i>${label}</i></span>`;
    })
    .join("");
}

function updateHeader() {
  header.classList.toggle("is-scrolled", window.scrollY > 20);
}

function openTool(toolKey) {
  const tool = toolData[toolKey];
  if (!tool) return;

  document.querySelectorAll("[data-tool-card]").forEach((card) => {
    card.classList.toggle("is-active", card.dataset.toolCard === toolKey);
  });

  document.querySelector("#tool-panel-kicker").textContent = tool.kicker;
  document.querySelector("#tool-panel-title").textContent = tool.title;
  document.querySelector("#tool-panel-copy").textContent = tool.copy;
  document.querySelector("#tool-preview").innerHTML = tool.html;
  tool.init();
}

navToggle.addEventListener("click", () => {
  const isOpen = nav.classList.toggle("is-open");
  navToggle.setAttribute("aria-expanded", String(isOpen));
  header.classList.toggle("is-open", isOpen);
});

nav.addEventListener("click", (event) => {
  if (event.target.matches("a")) {
    nav.classList.remove("is-open");
    navToggle.setAttribute("aria-expanded", "false");
    header.classList.remove("is-open");
  }
});

document.querySelectorAll('a[href^="#"]').forEach((link) => {
  link.addEventListener("click", (event) => {
    const target = document.querySelector(link.getAttribute("href"));
    if (!target) return;
    event.preventDefault();
    target.scrollIntoView({ behavior: "smooth", block: "start" });
  });
});

window.addEventListener("scroll", updateHeader, { passive: true });
updateHeader();

const observer = new IntersectionObserver(
  (entries) => {
    for (const entry of entries) {
      if (entry.isIntersecting) entry.target.classList.add("is-visible");
    }
  },
  { threshold: 0.16 }
);

document.querySelectorAll(".reveal").forEach((item) => observer.observe(item));

const counterObserver = new IntersectionObserver(
  (entries) => {
    for (const entry of entries) {
      if (!entry.isIntersecting || entry.target.dataset.counted) continue;
      entry.target.dataset.counted = "true";
      const target = Number(entry.target.dataset.target);
      let current = 0;
      const steps = Math.max(1, target);
      const timer = setInterval(() => {
        current += 1;
        entry.target.textContent = String(Math.min(current, target));
        if (current >= steps) clearInterval(timer);
      }, 70);
      if (target === 0) entry.target.textContent = "0";
    }
  },
  { threshold: 0.6 }
);

document.querySelectorAll("[data-counter]").forEach((counter) => counterObserver.observe(counter));

document.querySelectorAll("[data-tool-open]").forEach((button) => {
  button.addEventListener("click", () => openTool(button.dataset.toolOpen));
});
openTool("compound");

let testimonialIndex = 0;
const testimonialCopy = document.querySelector("#testimonial-copy");
const testimonialName = document.querySelector("#testimonial-name");

function showTestimonial(index) {
  testimonialIndex = (index + testimonials.length) % testimonials.length;
  testimonialCopy.textContent = `"${testimonials[testimonialIndex].copy}"`;
  testimonialName.textContent = testimonials[testimonialIndex].name;
}

document.querySelector("[data-carousel-next]").addEventListener("click", () => showTestimonial(testimonialIndex + 1));
document.querySelector("[data-carousel-prev]").addEventListener("click", () => showTestimonial(testimonialIndex - 1));
setInterval(() => showTestimonial(testimonialIndex + 1), 7000);

document.querySelectorAll(".faq-item button").forEach((button) => {
  button.addEventListener("click", () => {
    const item = button.closest(".faq-item");
    const isOpen = item.classList.toggle("is-open");
    button.setAttribute("aria-expanded", String(isOpen));
  });
});

const newsletter = document.querySelector("[data-newsletter]");
const formMessage = document.querySelector("[data-form-message]");

newsletter.addEventListener("submit", (event) => {
  event.preventDefault();
  const emailInput = newsletter.querySelector('input[name="email"]');
  const email = emailInput.value.trim();
  const isValid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  newsletter.classList.remove("is-success", "is-shaking");

  if (!isValid) {
    formMessage.textContent = "Enter a valid email address to join the list.";
    newsletter.classList.add("is-shaking");
    return;
  }

  formMessage.textContent = "You're on the preview list. Connect a real email service before launch.";
  newsletter.classList.add("is-success");
  newsletter.reset();
});

const canvas = document.querySelector("#market-canvas");
const ctx = canvas.getContext("2d");
let tick = 0;

function drawMarketCanvas() {
  const width = canvas.width;
  const height = canvas.height;
  ctx.clearRect(0, 0, width, height);

  const gradient = ctx.createLinearGradient(0, 0, width, height);
  gradient.addColorStop(0, "rgba(215,181,109,0.18)");
  gradient.addColorStop(0.5, "rgba(255,255,255,0.05)");
  gradient.addColorStop(1, "rgba(215,181,109,0.12)");
  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, width, height);

  ctx.strokeStyle = "rgba(255,255,255,0.08)";
  ctx.lineWidth = 1;
  for (let x = 0; x < width; x += 72) {
    ctx.beginPath();
    ctx.moveTo(x, 0);
    ctx.lineTo(x, height);
    ctx.stroke();
  }
  for (let y = 0; y < height; y += 72) {
    ctx.beginPath();
    ctx.moveTo(0, y);
    ctx.lineTo(width, y);
    ctx.stroke();
  }

  ctx.lineWidth = 5;
  const lineGradient = ctx.createLinearGradient(0, 0, width, 0);
  lineGradient.addColorStop(0, "rgba(255,255,255,0.7)");
  lineGradient.addColorStop(0.45, "rgba(242,217,144,0.95)");
  lineGradient.addColorStop(1, "rgba(215,181,109,0.55)");
  ctx.strokeStyle = lineGradient;
  ctx.beginPath();
  for (let x = 0; x <= width; x += 16) {
    const base = height * 0.68 - x * 0.22;
    const wave = Math.sin((x + tick * 2) / 52) * 34 + Math.cos((x + tick) / 29) * 14;
    const y = base + wave;
    if (x === 0) ctx.moveTo(x, y);
    else ctx.lineTo(x, y);
  }
  ctx.stroke();

  for (let i = 0; i < 42; i += 1) {
    const x = ((i * 83 + tick * 0.7) % (width + 80)) - 40;
    const y = height * 0.16 + Math.sin(i * 1.7 + tick / 34) * 185 + i * 9;
    ctx.fillStyle = i % 4 === 0 ? "rgba(242,217,144,0.66)" : "rgba(255,255,255,0.25)";
    ctx.beginPath();
    ctx.arc(x, y, i % 4 === 0 ? 3.5 : 2, 0, Math.PI * 2);
    ctx.fill();
  }

  tick += 1;
  requestAnimationFrame(drawMarketCanvas);
}

drawMarketCanvas();
