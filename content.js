// TruthCart Content Script
const SERVERLESS_URL = "http://localhost:3000/api/analyze"; // Update with your deployed URL

if (!document.getElementById("truthcart-widget")) {
  let currentMode = 'fast';

  const widget = document.createElement("div");
  widget.id = "truthcart-widget";
  widget.innerHTML = `
    <div class="tc-badge" title="TruthCart">TC</div>
    <div class="tc-panel hidden" id="tc-panel">
      <div class="tc-header">
        <div style="flex: 1; padding-right: 10px;">
          <div id="tc-product" class="tc-product-title">Checking product...</div>
          <div id="tc-status-line" class="tc-status">Initializing...</div>
        </div>
        <div style="display: flex; align-items: center; gap: 8px;">
           <button id="tc-refresh" class="tc-refresh-btn" title="Fetch latest discussions">↻</button>
           <div id="tc-score" class="tc-score-badge">--</div>
        </div>
      </div>
      <div id="tc-body">
        <div id="tc-quotes" class="tc-quotes"></div>
        <ul id="tc-flags" class="tc-flags"></ul>
      </div>
      <div class="tc-footer">
        <button id="tc-btn-fast" class="tc-btn tc-btn-active">Fast Scan</button>
        <button id="tc-btn-deep" class="tc-btn">Deep Research</button>
      </div>
    </div>
  `;
  document.body.appendChild(widget);

  const badge = widget.querySelector(".tc-badge");
  const panel = widget.querySelector("#tc-panel");
  const btnFast = widget.querySelector("#tc-btn-fast");
  const btnDeep = widget.querySelector("#tc-btn-deep");
  const btnRefresh = widget.querySelector("#tc-refresh");

  badge.onclick = () => panel.classList.toggle("hidden");

  // Extract product title heuristically
  const productTitle =
    document.querySelector("#productTitle")?.innerText ||
    document.querySelector("h1")?.innerText ||
    document.title.split("|")[0] ||
    document.title;

  document.getElementById("tc-product").innerText = productTitle.substring(0, 50) + (productTitle.length > 50 ? "..." : "");

  const runAnalysis = async (mode) => {
    currentMode = mode;

    // Reset UI
    document.getElementById("tc-status-line").innerText = mode === 'deep' ? "Thinking deeply..." : "Scanning fast...";
    document.getElementById("tc-score").innerText = "⏳";
    document.getElementById("tc-quotes").innerHTML = "";
    document.getElementById("tc-flags").innerHTML = "";
    
    // Toggle Button States
    if (mode === 'deep') {
        btnDeep.classList.add('tc-btn-active');
        btnFast.classList.remove('tc-btn-active');
    } else {
        btnFast.classList.add('tc-btn-active');
        btnDeep.classList.remove('tc-btn-active');
    }

    // Animation for refresh button
    btnRefresh.classList.add('tc-spin');

    try {
      const resp = await fetch(SERVERLESS_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          product_name: productTitle,
          brand_name: null,
          product_url: location.href,
          mode: mode
        })
      });

      const data = await resp.json();

      if (!data || typeof data.trust_score !== "number") {
        document.getElementById("tc-status-line").innerText = "Analysis unavailable";
        document.getElementById("tc-score").innerText = "Err";
        return;
      }

      document.getElementById("tc-status-line").innerText = data.status_text || data.status;
      document.getElementById("tc-score").innerText = data.trust_score;
      document.getElementById("tc-score").className = `tc-score-badge score-${data.status.toLowerCase()}`;

      // Quotes
      const quotesEl = document.getElementById("tc-quotes");
      (data.quote_snippets || []).slice(0, 2).forEach(q => {
        const p = document.createElement("p");
        p.innerText = `"${q.text}"`;
        const s = document.createElement("span");
        s.innerText = ` — ${q.source}`;
        p.appendChild(s);
        quotesEl.appendChild(p);
      });

      // Flags
      const flagsEl = document.getElementById("tc-flags");
      (data.red_flag_bullets || []).slice(0, 3).forEach(f => {
        const li = document.createElement("li");
        li.innerText = f;
        flagsEl.appendChild(li);
      });

    } catch (err) {
      console.error("TruthCart error", err);
      document.getElementById("tc-status-line").innerText = "Network Error";
      document.getElementById("tc-score").innerText = "!";
    } finally {
        btnRefresh.classList.remove('tc-spin');
    }
  };

  btnFast.onclick = () => runAnalysis('fast');
  btnDeep.onclick = () => runAnalysis('deep');
  btnRefresh.onclick = () => runAnalysis(currentMode);

  // Auto-run fast analysis on load
  runAnalysis('fast');
}