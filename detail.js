const params = new URLSearchParams(window.location.search);
const key = params.get("topic") || params.get("workflow") || params.get("tool") || "investing";
const type = document.querySelector("[data-detail-type]")?.dataset.detailType;
const content = window.BIG_CONTENT;

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
  document.title = `${item.title} | Barone Investment Group`;
  document.querySelector("#detail-eyebrow").textContent = item.eyebrow;
  document.querySelector("#detail-title").textContent = item.title;
  document.querySelector("#detail-summary").textContent = item.summary;
  document.querySelector("#detail-audience").textContent = item.audience;
  document.querySelector("#detail-outcomes").innerHTML = list(item.outcomes);
  document.querySelector("#detail-sections").innerHTML = item.sections
    .map((section) => `<article class="detail-panel"><h2>${section.title}</h2><p>${section.body}</p></article>`)
    .join("");
  document.querySelector("#detail-checklist").innerHTML = list(item.checklist);
  document.querySelector("#detail-prompt").textContent = item.prompt;
  renderRelated(content.lessons, key, "lesson.html?topic=");
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
            <strong>${r.name}</strong>
            <span>${r.note}</span>
          </a>`
      )
      .join("");
  }

  renderRelated(content.workflows, key, "workflow.html?workflow=");
}

function drawChart(values, labels) {
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
    gradient.addColorStop(0, "#f2d990");
    gradient.addColorStop(1, "#8f7138");
    ctx.fillStyle = gradient;
    ctx.fillRect(x, y, barWidth, barHeight);
    ctx.fillStyle = "rgba(255,255,255,0.78)";
    ctx.font = "18px sans-serif";
    ctx.fillText(labels[index], x, height - 10);
  });
}

const toolRenderers = {
  compound() {
    const controls = document.querySelector("#tool-page-controls");
    controls.innerHTML = `
      <label>Monthly contribution <input id="p-monthly" type="range" min="25" max="1200" value="250" step="25" /></label>
      <label>Years <input id="p-years" type="range" min="1" max="40" value="15" /></label>
      <label>Return assumption <input id="p-rate" type="range" min="1" max="12" value="7" step="0.5" /></label>
    `;
    const update = () => {
      const m = Number(document.querySelector("#p-monthly").value);
      const y = Number(document.querySelector("#p-years").value);
      const r = Number(document.querySelector("#p-rate").value) / 100 / 12;
      const values = [5, 10, 15, 20, 30].map((year) => {
        const months = Math.min(year, y) * 12;
        return r === 0 ? m * months : m * (((1 + r) ** months - 1) / r);
      });
      drawChart(values, ["5y", "10y", "15y", "20y", "30y"]);
      document.querySelector("#tool-page-result").textContent = money(values[Math.min(2, values.length - 1)]);
      document.querySelector("#tool-page-note").textContent = `${money(m * y * 12)} contributed over ${y} years`;
    };
    controls.querySelectorAll("input").forEach((input) => input.addEventListener("input", update));
    update();
  },
  credit() {
    const controls = document.querySelector("#tool-page-controls");
    controls.innerHTML = `
      <label>Balance <input id="p-balance" type="range" min="0" max="5000" value="900" step="50" /></label>
      <label>Limit <input id="p-limit" type="range" min="500" max="10000" value="3000" step="100" /></label>
    `;
    const update = () => {
      const balance = Number(document.querySelector("#p-balance").value);
      const limit = Number(document.querySelector("#p-limit").value);
      const pct = Math.round((balance / limit) * 100);
      drawChart([pct, 30, 10], ["current", "30%", "10%"]);
      document.querySelector("#tool-page-result").textContent = `${pct}%`;
      document.querySelector("#tool-page-note").textContent = `${money(balance)} balance on ${money(limit)} limit`;
    };
    controls.querySelectorAll("input").forEach((input) => input.addEventListener("input", update));
    update();
  },
  budget() {
    const controls = document.querySelector("#tool-page-controls");
    controls.innerHTML = `<label>Monthly income <input id="p-income" type="range" min="500" max="8000" value="2500" step="100" /></label>`;
    const update = () => {
      const income = Number(document.querySelector("#p-income").value);
      drawChart([income * 0.5, income * 0.3, income * 0.2], ["needs", "wants", "save"]);
      document.querySelector("#tool-page-result").textContent = money(income);
      document.querySelector("#tool-page-note").textContent = "50/30/20 example split";
    };
    controls.querySelector("input").addEventListener("input", update);
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
      <label>Balance <input id="p-debt-balance" type="range" min="500" max="20000" value="4500" step="250" /></label>
      <label>APR (%) <input id="p-debt-rate" type="range" min="5" max="30" value="19" step="0.5" /></label>
      <label>Monthly payment <input id="p-debt-pay" type="range" min="25" max="1000" value="150" step="25" /></label>
    `;
    const monthsTo = (b, apr, pay) => {
      const r = apr / 100 / 12;
      if (pay <= 0 || b <= 0) return 0;
      if (r === 0) return Math.ceil(b / pay);
      if (pay <= b * r) return 999;
      return Math.ceil(-Math.log(1 - (b * r) / pay) / Math.log(1 + r));
    };
    const update = () => {
      const b = Number(document.querySelector("#p-debt-balance").value);
      const apr = Number(document.querySelector("#p-debt-rate").value);
      const pay = Number(document.querySelector("#p-debt-pay").value);
      const base = monthsTo(b, apr, pay);
      const extra = monthsTo(b, apr, pay + 50);
      drawChart([Math.min(base, 120), Math.min(extra, 120), Math.min(base * 0.6, 120)], ["base", "+$50", "min"]);
      document.querySelector("#tool-page-result").textContent = base >= 999 ? "Won't pay off" : `${base} months`;
      document.querySelector("#tool-page-note").textContent = base < 999 && extra < base ? `Add $50/mo → saves ~${base - extra} months` : "Increase monthly payment above interest charge";
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
