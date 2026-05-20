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
