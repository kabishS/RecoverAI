/**
 * RecoverAI - Main Application Controller & View Router
 */

let currentView = 'dashboard';
let isAuthenticated = true;
let currentUser = { name: "Kabish Fintech Ops", role: "Recovery Lead", email: "admin@recoverai.local" };

// Global Toast System
window.showToast = function(message, type = 'info') {
  const container = document.getElementById('toastContainer');
  if (!container) return;

  const toastEl = document.createElement('div');
  const bgClass = type === 'success' ? 'bg-success text-white' :
                  type === 'error' ? 'bg-danger text-white' :
                  type === 'warning' ? 'bg-warning text-dark' : 'bg-dark text-white border border-secondary';

  toastEl.className = `toast align-items-center ${bgClass} border-0 show shadow-lg mb-2`;
  toastEl.setAttribute('role', 'alert');
  toastEl.setAttribute('aria-live', 'assertive');
  toastEl.setAttribute('aria-atomic', 'true');

  const icon = type === 'success' ? '<i class="fas fa-check-circle me-2"></i>' :
               type === 'error' ? '<i class="fas fa-exclamation-circle me-2"></i>' :
               type === 'warning' ? '<i class="fas fa-exclamation-triangle me-2"></i>' : '<i class="fas fa-info-circle me-2"></i>';

  toastEl.innerHTML = `
    <div class="d-flex">
      <div class="toast-body d-flex align-items-center">
        ${icon} <span>${message}</span>
      </div>
      <button type="button" class="btn-close ${type === 'warning' ? '' : 'btn-close-white'} me-2 m-auto" data-bs-dismiss="toast" aria-label="Close"></button>
    </div>
  `;

  container.appendChild(toastEl);
  setTimeout(() => {
    toastEl.classList.remove('show');
    setTimeout(() => toastEl.remove(), 400);
  }, 4000);
};

// Global Header Stats Updater
window.updateHeaderStats = function() {
  const metrics = window.recoverStore.getMetrics();
  const topRisk = document.getElementById('headerRiskVal');
  const topRec = document.getElementById('headerRecoveredVal');
  const topRate = document.getElementById('headerRateVal');

  if (topRisk) topRisk.innerText = `₹${metrics.remainingRisk.toLocaleString('en-IN')}`;
  if (topRec) topRec.innerText = `₹${metrics.totalRecovered.toLocaleString('en-IN')}`;
  if (topRate) topRate.innerText = `${metrics.recoveryRate}%`;
};

// View Navigation Router
function navigateTo(viewName) {
  currentView = viewName;
  
  // Update sidebar active classes
  document.querySelectorAll('.nav-link-item').forEach(el => {
    if (el.getAttribute('data-view') === viewName) {
      el.classList.add('active');
    } else {
      el.classList.remove('active');
    }
  });

  // Render View
  renderCurrentView();

  // Scroll to top
  window.scrollTo({ top: 0, behavior: 'smooth' });
}

// Render the selected view template
window.renderCurrentView = function() {
  const container = document.getElementById('mainContentArea');
  if (!container) return;

  window.updateHeaderStats();

  switch (currentView) {
    case 'dashboard':
      container.innerHTML = getDashboardHTML();
      setTimeout(() => window.recoverCharts.renderDashboardCharts(), 50);
      break;

    case 'revenue-at-risk':
      container.innerHTML = getRevenueAtRiskHTML();
      attachRiskFilters();
      break;

    case 'ai-agent':
      container.innerHTML = getAIAgentConsoleHTML();
      attachAIAgentEvents();
      break;

    case 'demo-simulation':
      container.innerHTML = getDemoSimulationHTML();
      setTimeout(() => window.demoSimulation.updateProgressUI(), 50);
      break;

    case 'transactions':
      container.innerHTML = getTransactionsHTML();
      break;

    case 'recovery-history':
      container.innerHTML = getRecoveryHistoryHTML();
      break;

    case 'audit-logs':
      container.innerHTML = getAuditLogsHTML();
      break;

    case 'analytics':
      container.innerHTML = getAnalyticsHTML();
      setTimeout(() => window.recoverCharts.renderAnalyticsCharts(), 50);
      break;

    case 'settings':
      container.innerHTML = getSettingsHTML();
      break;

    default:
      container.innerHTML = getDashboardHTML();
      break;
  }
};

// ---------------- HTML VIEW GENERATORS ----------------

function getDashboardHTML() {
  const metrics = window.recoverStore.getMetrics();
  const txs = window.recoverStore.getTransactions();
  const recentAtRisk = txs.filter(t => t.status === 'At Risk').slice(0, 5);

  return `
    <div class="dashboard-view animate-fade-in">
      <!-- Welcome Banner -->
      <div class="welcome-banner p-4 rounded-4 mb-4 d-flex justify-content-between align-items-center flex-wrap gap-3">
        <div>
          <div class="d-flex align-items-center gap-2 mb-1">
            <span class="badge bg-primary-subtle text-primary border border-primary-subtle px-3 py-1 rounded-pill">
              <i class="fas fa-robot me-1"></i> Autonomous Mode Active
            </span>
            <span class="badge bg-success-subtle text-success border border-success-subtle px-3 py-1 rounded-pill">
              <i class="fas fa-shield-alt me-1"></i> Bounded Rules Guardrails Armed
            </span>
          </div>
          <h2 class="fw-bold text-white mb-1">RecoverAI Command Center</h2>
          <p class="text-secondary mb-0">Real-time revenue risk detection, Groq LLM diagnosis, and bounded Razorpay test recovery.</p>
        </div>
        <div class="d-flex gap-2">
          <button class="btn btn-primary px-4 py-2 rounded-3 shadow-sm d-flex align-items-center gap-2" onclick="navigateTo('demo-simulation')">
            <i class="fas fa-play-circle fs-5"></i>
            <span class="fw-semibold">100-Tx Demo Simulation</span>
          </button>
          <button class="btn btn-outline-light px-3 py-2 rounded-3" onclick="navigateTo('revenue-at-risk')">
            <i class="fas fa-search-dollar me-1"></i> View At-Risk
          </button>
        </div>
      </div>

      <!-- Demo Value Notice -->
      <div class="alert alert-dark border-secondary-subtle d-flex align-items-center gap-3 py-2 px-3 rounded-3 mb-4">
        <i class="fas fa-info-circle text-info fs-5"></i>
        <div class="small">
          <strong class="text-white">Simulated / Test Environment:</strong> All figures shown are part of the <strong>₹5,00,000 Demo Recovery Portfolio</strong> evaluated via Groq AI &amp; Razorpay Test Mode.
        </div>
      </div>

      <!-- Primary KPI Cards Row -->
      <div class="row g-3 mb-4">
        <div class="col-xl-3 col-md-6">
          <div class="card metric-card border-0 rounded-4 p-3 h-100 bg-surface">
            <div class="d-flex justify-content-between align-items-start mb-2">
              <span class="text-secondary text-uppercase fw-semibold small">Total Revenue at Risk</span>
              <div class="icon-bubble bg-danger-subtle text-danger rounded-circle p-2">
                <i class="fas fa-exclamation-triangle"></i>
              </div>
            </div>
            <h3 class="fw-bold text-white mb-1">₹${metrics.totalDemoRisk.toLocaleString('en-IN')}</h3>
            <div class="small text-secondary">
              <span class="text-danger fw-semibold"><i class="fas fa-arrow-up"></i> ${metrics.atRiskCount} at-risk cases</span> in pipeline
            </div>
          </div>
        </div>

        <div class="col-xl-3 col-md-6">
          <div class="card metric-card border-0 rounded-4 p-3 h-100 bg-surface">
            <div class="d-flex justify-content-between align-items-start mb-2">
              <span class="text-secondary text-uppercase fw-semibold small">Revenue Recovered</span>
              <div class="icon-bubble bg-success-subtle text-success rounded-circle p-2">
                <i class="fas fa-hand-holding-usd"></i>
              </div>
            </div>
            <h3 class="fw-bold text-success mb-1">₹${metrics.totalRecovered.toLocaleString('en-IN')}</h3>
            <div class="small text-secondary">
              <span class="text-success fw-semibold"><i class="fas fa-check-circle"></i> ${metrics.recoveredCount} settled</span> autonomously
            </div>
          </div>
        </div>

        <div class="col-xl-3 col-md-6">
          <div class="card metric-card border-0 rounded-4 p-3 h-100 bg-surface">
            <div class="d-flex justify-content-between align-items-start mb-2">
              <span class="text-secondary text-uppercase fw-semibold small">Recovery Rate</span>
              <div class="icon-bubble bg-primary-subtle text-primary rounded-circle p-2">
                <i class="fas fa-chart-pie"></i>
              </div>
            </div>
            <h3 class="fw-bold text-white mb-1">${metrics.recoveryRate}%</h3>
            <div class="progress mt-2" style="height: 6px;">
              <div class="progress-bar bg-success" role="progressbar" style="width: ${metrics.recoveryRate}%"></div>
            </div>
          </div>
        </div>

        <div class="col-xl-3 col-md-6">
          <div class="card metric-card border-0 rounded-4 p-3 h-100 bg-surface">
            <div class="d-flex justify-content-between align-items-start mb-2">
              <span class="text-secondary text-uppercase fw-semibold small">Bounded Guardrails</span>
              <div class="icon-bubble bg-warning-subtle text-warning rounded-circle p-2">
                <i class="fas fa-gavel"></i>
              </div>
            </div>
            <h3 class="fw-bold text-warning mb-1">${metrics.escalatedCount} <span class="fs-6 text-secondary fw-normal">Escalations</span></h3>
            <div class="small text-secondary">
              Strict Max 3 retries &amp; 10% incentive
            </div>
          </div>
        </div>
      </div>

      <!-- Visual Analytics Row -->
      <div class="row g-3 mb-4">
        <div class="col-lg-8">
          <div class="card border-0 rounded-4 p-4 bg-surface h-100">
            <div class="d-flex justify-content-between align-items-center mb-3">
              <div>
                <h5 class="fw-bold text-white mb-0">7-Day Revenue Recovery Trajectory</h5>
                <span class="small text-secondary">AI autonomous yield vs benchmark portfolio risk</span>
              </div>
              <span class="badge bg-dark text-secondary border border-secondary">Live Trajectory</span>
            </div>
            <div class="chart-container" style="position: relative; height: 260px;">
              <canvas id="chartRecoveryTrend"></canvas>
            </div>
          </div>
        </div>

        <div class="col-lg-4">
          <div class="card border-0 rounded-4 p-4 bg-surface h-100">
            <div class="d-flex justify-content-between align-items-center mb-3">
              <div>
                <h5 class="fw-bold text-white mb-0">Pipeline Distribution</h5>
                <span class="small text-secondary">Current lifecycle stage</span>
              </div>
            </div>
            <div class="chart-container" style="position: relative; height: 260px;">
              <canvas id="chartStatusDistribution"></canvas>
            </div>
          </div>
        </div>
      </div>

      <!-- Secondary Charts Row -->
      <div class="row g-3 mb-4">
        <div class="col-lg-6">
          <div class="card border-0 rounded-4 p-4 bg-surface h-100">
            <h5 class="fw-bold text-white mb-1">Risk Severity Breakdown</h5>
            <span class="small text-secondary mb-3 d-block">Categorization by transaction velocity, failure code & history</span>
            <div class="chart-container" style="position: relative; height: 200px;">
              <canvas id="chartRiskBreakdown"></canvas>
            </div>
          </div>
        </div>

        <div class="col-lg-6">
          <div class="card border-0 rounded-4 p-4 bg-surface h-100">
            <h5 class="fw-bold text-white mb-1">Root Failure Causes</h5>
            <span class="small text-secondary mb-3 d-block">Breakdown of underlying gateway and customer friction</span>
            <div class="chart-container" style="position: relative; height: 200px;">
              <canvas id="chartFailureCategories"></canvas>
            </div>
          </div>
        </div>
      </div>

      <!-- Live At-Risk Feed -->
      <div class="card border-0 rounded-4 p-4 bg-surface">
        <div class="d-flex justify-content-between align-items-center mb-3 flex-wrap gap-2">
          <div>
            <h5 class="fw-bold text-white mb-0">Immediate At-Risk Transactions</h5>
            <span class="small text-secondary">Pending AI autonomous action or Razorpay checkout</span>
          </div>
          <button class="btn btn-sm btn-outline-primary rounded-pill px-3" onclick="navigateTo('revenue-at-risk')">
            View All (${metrics.atRiskCount}) <i class="fas fa-arrow-right ms-1"></i>
          </button>
        </div>

        <div class="table-responsive">
          <table class="table table-dark table-hover align-middle mb-0 custom-table">
            <thead>
              <tr class="text-secondary small text-uppercase">
                <th>Tx ID / Customer</th>
                <th>Amount</th>
                <th>Failure Reason</th>
                <th>Risk Level</th>
                <th>Attempts</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              ${recentAtRisk.length === 0 ? `
                <tr>
                  <td colspan="6" class="text-center py-4 text-secondary">
                    <i class="fas fa-check-circle text-success fs-3 mb-2 d-block"></i>
                    All transactions in portfolio have been successfully processed or escalated!
                  </td>
                </tr>
              ` : recentAtRisk.map(tx => `
                <tr>
                  <td>
                    <div class="fw-bold text-white">${tx.customerName}</div>
                    <div class="small text-secondary font-monospace">${tx.id} • ${tx.customerHistory}</div>
                  </td>
                  <td>
                    <span class="fw-bold text-danger">₹${tx.amount.toLocaleString('en-IN')}</span>
                  </td>
                  <td>
                    <span class="badge bg-dark text-light border border-secondary fw-normal">
                      ${tx.failureReason}
                    </span>
                  </td>
                  <td>
                    <span class="badge ${tx.riskLevel === 'High' ? 'bg-danger' : tx.riskLevel === 'Medium' ? 'bg-warning text-dark' : 'bg-success'}">
                      ${tx.riskLevel}
                    </span>
                  </td>
                  <td>
                    <span class="badge bg-secondary-subtle text-secondary">${tx.previousAttempts}/3</span>
                  </td>
                  <td>
                    <div class="btn-group btn-group-sm">
                      <button class="btn btn-primary btn-sm rounded-start" onclick="handleAIDiagnoseModal('${tx.id}')">
                        <i class="fas fa-brain me-1"></i> AI Diagnose
                      </button>
                      <button class="btn btn-outline-success btn-sm rounded-end" onclick="handlePayTestCheckout('${tx.id}')" title="Pay with Razorpay Test Mode">
                        <i class="fas fa-credit-card me-1"></i> Pay Test
                      </button>
                    </div>
                  </td>
                </tr>
              `).join('')}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  `;
}

function getRevenueAtRiskHTML() {
  const txs = window.recoverStore.getTransactions();
  const atRisk = txs.filter(t => t.status === 'At Risk');

  return `
    <div class="risk-view animate-fade-in">
      <div class="d-flex justify-content-between align-items-center mb-4 flex-wrap gap-3">
        <div>
          <h2 class="fw-bold text-white mb-1">Revenue Risk Detection</h2>
          <p class="text-secondary mb-0">Identify and categorize failed payments, abandoned carts, and overdue invoices.</p>
        </div>
        <div class="d-flex gap-2">
          <button class="btn btn-primary d-flex align-items-center gap-2" onclick="handleBatchAIDiagnose()">
            <i class="fas fa-magic"></i> AI Diagnose All At-Risk (${atRisk.length})
          </button>
        </div>
      </div>

      <!-- Filters Row -->
      <div class="card border-0 rounded-4 p-3 bg-surface mb-4">
        <div class="row g-2 align-items-center">
          <div class="col-md-4">
            <div class="input-group input-group-sm">
              <span class="input-group-text bg-dark border-secondary text-secondary"><i class="fas fa-search"></i></span>
              <input type="text" id="filterSearch" class="form-control bg-dark border-secondary text-white" placeholder="Search customer, ID, or failure reason...">
            </div>
          </div>
          <div class="col-md-3">
            <select id="filterRisk" class="form-select form-select-sm bg-dark border-secondary text-white">
              <option value="ALL">All Risk Levels (Low, Med, High)</option>
              <option value="High">High Risk Only</option>
              <option value="Medium">Medium Risk Only</option>
              <option value="Low">Low Risk Only</option>
            </select>
          </div>
          <div class="col-md-3">
            <select id="filterFailureType" class="form-select form-select-sm bg-dark border-secondary text-white">
              <option value="ALL">All Failure Categories</option>
              <option value="Insufficient Funds">Insufficient Funds</option>
              <option value="Network / Timeout">Network / Timeout</option>
              <option value="Card Invalid">Card Invalid</option>
              <option value="Abandoned Checkout">Abandoned Checkout</option>
              <option value="Overdue Invoice">Overdue Invoice</option>
            </select>
          </div>
          <div class="col-md-2 text-end">
            <span class="text-secondary small" id="filteredCountText">Showing ${atRisk.length} records</span>
          </div>
        </div>
      </div>

      <!-- Table of At-Risk Items -->
      <div class="card border-0 rounded-4 p-4 bg-surface">
        <div class="table-responsive">
          <table class="table table-dark table-hover align-middle mb-0 custom-table" id="tableRiskItems">
            <thead>
              <tr class="text-secondary small text-uppercase">
                <th>Customer &amp; ID</th>
                <th>Amount</th>
                <th>Failure Diagnosis</th>
                <th>Risk Tier</th>
                <th>Attempts</th>
                <th>Overdue</th>
                <th class="text-end">AI Actions</th>
              </tr>
            </thead>
            <tbody id="riskTableBody">
              ${renderRiskTableRows(atRisk)}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  `;
}

function renderRiskTableRows(list) {
  if (list.length === 0) {
    return `
      <tr>
        <td colspan="7" class="text-center py-5 text-secondary">
          <i class="fas fa-shield-alt text-success fs-2 mb-2 d-block"></i>
          No at-risk transactions match the current filter.
        </td>
      </tr>
    `;
  }

  return list.map(tx => `
    <tr>
      <td>
        <div class="fw-bold text-white">${tx.customerName}</div>
        <div class="small text-secondary font-monospace">${tx.id} • ${tx.customerHistory}</div>
      </td>
      <td>
        <div class="fw-bold text-danger">₹${tx.amount.toLocaleString('en-IN')}</div>
        <div class="small text-secondary">${tx.channel}</div>
      </td>
      <td>
        <div class="text-light small fw-semibold">${tx.failureType}</div>
        <div class="text-secondary small text-truncate" style="max-width: 260px;" title="${tx.failureReason}">${tx.failureReason}</div>
      </td>
      <td>
        <span class="badge ${tx.riskLevel === 'High' ? 'bg-danger' : tx.riskLevel === 'Medium' ? 'bg-warning text-dark' : 'bg-success'}">
          ${tx.riskLevel} Risk
        </span>
      </td>
      <td>
        <span class="badge ${tx.previousAttempts >= 3 ? 'bg-danger' : 'bg-secondary'}">
          ${tx.previousAttempts}/3
        </span>
      </td>
      <td>
        <span class="text-secondary small">${tx.daysOverdue} days</span>
      </td>
      <td class="text-end">
        <div class="btn-group btn-group-sm">
          <button class="btn btn-primary btn-sm" onclick="handleAIDiagnoseModal('${tx.id}')">
            <i class="fas fa-brain me-1"></i> AI Diagnose
          </button>
          <button class="btn btn-outline-success btn-sm" onclick="handlePayTestCheckout('${tx.id}')">
            <i class="fas fa-credit-card me-1"></i> Pay
          </button>
        </div>
      </td>
    </tr>
  `).join('');
}

function attachRiskFilters() {
  const searchInput = document.getElementById('filterSearch');
  const riskSelect = document.getElementById('filterRisk');
  const typeSelect = document.getElementById('filterFailureType');
  const tbody = document.getElementById('riskTableBody');
  const countText = document.getElementById('filteredCountText');

  function updateTable() {
    const query = (searchInput.value || '').toLowerCase();
    const risk = riskSelect.value;
    const type = typeSelect.value;

    const txs = window.recoverStore.getTransactions().filter(t => t.status === 'At Risk');
    const filtered = txs.filter(t => {
      const matchSearch = t.customerName.toLowerCase().includes(query) ||
                          t.id.toLowerCase().includes(query) ||
                          t.failureReason.toLowerCase().includes(query);
      const matchRisk = risk === 'ALL' || t.riskLevel === risk;
      const matchType = type === 'ALL' || t.failureType === type;
      return matchSearch && matchRisk && matchType;
    });

    if (tbody) tbody.innerHTML = renderRiskTableRows(filtered);
    if (countText) countText.innerText = `Showing ${filtered.length} records`;
  }

  if (searchInput) searchInput.addEventListener('input', updateTable);
  if (riskSelect) riskSelect.addEventListener('change', updateTable);
  if (typeSelect) typeSelect.addEventListener('change', updateTable);
}

function getAIAgentConsoleHTML() {
  return `
    <div class="ai-console-view animate-fade-in">
      <div class="d-flex justify-content-between align-items-center mb-4 flex-wrap gap-3">
        <div>
          <h2 class="fw-bold text-white mb-1"><i class="fas fa-brain text-primary me-2"></i>AI Recovery Agent Console</h2>
          <p class="text-secondary mb-0">Powered by <strong>Groq LLaMA 3.3 70B</strong> with bounded recovery policy guardrails.</p>
        </div>
        <span class="badge bg-success-subtle text-success border border-success-subtle px-3 py-2 rounded-pill">
          <i class="fas fa-circle text-success me-1 fa-beat" style="font-size: 8px;"></i> Groq API Connected
        </span>
      </div>

      <!-- Policy Guardrails Box -->
      <div class="row g-3 mb-4">
        <div class="col-md-3">
          <div class="card border-0 rounded-4 p-3 bg-surface border-start border-primary border-4 h-100">
            <span class="text-secondary small text-uppercase fw-semibold">Max Retry Rule</span>
            <div class="fs-5 fw-bold text-white mt-1">3 Payment Retries</div>
            <span class="small text-secondary">Escalates to human after 3 failures</span>
          </div>
        </div>
        <div class="col-md-3">
          <div class="card border-0 rounded-4 p-3 bg-surface border-start border-info border-4 h-100">
            <span class="text-secondary small text-uppercase fw-semibold">Max Reminders Rule</span>
            <div class="fs-5 fw-bold text-white mt-1">2 Reminders Cap</div>
            <span class="small text-secondary">Prevents spam &amp; brand fatigue</span>
          </div>
        </div>
        <div class="col-md-3">
          <div class="card border-0 rounded-4 p-3 bg-surface border-start border-warning border-4 h-100">
            <span class="text-secondary small text-uppercase fw-semibold">Max Incentive Cap</span>
            <div class="fs-5 fw-bold text-white mt-1">10% Discount Cap</div>
            <span class="small text-secondary">Protects unit economics and margin</span>
          </div>
        </div>
        <div class="col-md-3">
          <div class="card border-0 rounded-4 p-3 bg-surface border-start border-success border-4 h-100">
            <span class="text-secondary small text-uppercase fw-semibold">Immediate Stop</span>
            <div class="fs-5 fw-bold text-white mt-1">Instant Termination</div>
            <span class="small text-secondary">Stops all actions upon payment</span>
          </div>
        </div>
      </div>

      <!-- Interactive Single Case Simulator -->
      <div class="row g-4">
        <div class="col-lg-6">
          <div class="card border-0 rounded-4 p-4 bg-surface h-100">
            <h5 class="fw-bold text-white mb-3"><i class="fas fa-sliders-h text-primary me-2"></i>Select Case for AI Diagnosis</h5>
            
            <div class="mb-3">
              <label class="form-label text-secondary small">Pick At-Risk Transaction</label>
              <select id="aiCaseSelect" class="form-select bg-dark border-secondary text-white">
                ${window.recoverStore.getTransactions().filter(t => t.status === 'At Risk').slice(0, 20).map(t => `
                  <option value="${t.id}">${t.id} - ${t.customerName} (₹${t.amount.toLocaleString('en-IN')}) - ${t.failureType}</option>
                `).join('')}
              </select>
            </div>

            <div id="aiSelectedCaseDetails" class="p-3 rounded-3 bg-dark border border-secondary mb-3 small">
              <!-- Selected details populated via JS -->
            </div>

            <button id="btnRunSingleDiagnosis" class="btn btn-primary w-100 py-2 rounded-3 fw-semibold">
              <i class="fas fa-microchip me-2"></i> Execute Groq AI Diagnosis &amp; Decision
            </button>
          </div>
        </div>

        <div class="col-lg-6">
          <div class="card border-0 rounded-4 p-4 bg-surface h-100">
            <h5 class="fw-bold text-white mb-3"><i class="fas fa-file-code text-info me-2"></i>AI Reasoning &amp; Guardrail Output</h5>
            
            <div id="aiOutputContainer" class="p-3 rounded-3 bg-dark border border-secondary text-secondary small font-monospace" style="min-height: 280px; overflow-y: auto;">
              <span class="text-muted fst-italic">// Select a transaction and click "Execute Groq AI Diagnosis" to inspect the live LLM reasoning, root cause diagnosis, and bounded action recommendation.</span>
            </div>

            <div id="aiActionExecutionButtons" class="mt-3 d-none">
              <!-- Populated when AI diagnosis arrives -->
            </div>
          </div>
        </div>
      </div>
    </div>
  `;
}

function attachAIAgentEvents() {
  const select = document.getElementById('aiCaseSelect');
  const details = document.getElementById('aiSelectedCaseDetails');
  const btnRun = document.getElementById('btnRunSingleDiagnosis');
  const output = document.getElementById('aiOutputContainer');
  const actionBtns = document.getElementById('aiActionExecutionButtons');

  function updateSelectedDetails() {
    if (!select || !details) return;
    const tx = window.recoverStore.getTransactionById(select.value);
    if (!tx) {
      details.innerHTML = '<span class="text-secondary">No transaction selected</span>';
      return;
    }
    details.innerHTML = `
      <div class="row g-2">
        <div class="col-6"><span class="text-secondary">Customer:</span> <strong class="text-white">${tx.customerName}</strong></div>
        <div class="col-6"><span class="text-secondary">Amount:</span> <strong class="text-danger">₹${tx.amount.toLocaleString('en-IN')}</strong></div>
        <div class="col-6"><span class="text-secondary">Failure:</span> <span class="text-warning">${tx.failureReason}</span></div>
        <div class="col-6"><span class="text-secondary">Customer Tier:</span> <span class="text-info">${tx.customerHistory}</span></div>
        <div class="col-6"><span class="text-secondary">Previous Retries:</span> <span class="badge ${tx.previousAttempts >= 3 ? 'bg-danger' : 'bg-secondary'}">${tx.previousAttempts}/3</span></div>
        <div class="col-6"><span class="text-secondary">Days Overdue:</span> <span class="text-white">${tx.daysOverdue} days</span></div>
      </div>
    `;
  }

  if (select) {
    select.addEventListener('change', updateSelectedDetails);
    updateSelectedDetails();
  }

  if (btnRun) {
    btnRun.addEventListener('click', async () => {
      const txId = select.value;
      const tx = window.recoverStore.getTransactionById(txId);
      if (!tx) return;

      btnRun.disabled = true;
      btnRun.innerHTML = '<i class="fas fa-spinner fa-spin me-2"></i> Querying Groq LLaMA 3.3...';
      output.innerHTML = '<span class="text-primary"><i class="fas fa-spinner fa-spin me-2"></i> Groq AI Agent analyzing payment telemetry, telemetry signals, and checking bounded rules...</span>';

      try {
        const diag = await window.recoverAIAgent.diagnoseTransaction(tx);
        
        output.innerHTML = `
          <div class="text-success mb-2 fw-bold">✓ DIAGNOSIS COMPLETED (${diag.source || 'Groq AI'})</div>
          <div class="mb-2"><span class="text-info">Root Cause:</span> ${diag.rootCause}</div>
          <div class="mb-2"><span class="text-info">Risk Score:</span> <span class="badge bg-dark border border-secondary">${diag.riskScore || 50}/100</span></div>
          <div class="mb-2"><span class="text-info">Recommended Action:</span> <strong class="text-warning">${diag.recommendedAction}</strong></div>
          ${diag.discountPercent > 0 ? `<div class="mb-2"><span class="text-info">Bounded Incentive:</span> <span class="text-success fw-bold">${diag.discountPercent}% Discount</span></div>` : ''}
          <div class="mb-2"><span class="text-info">Guardrails Check:</span> <span class="badge bg-success-subtle text-success">PASSED (Retries &lt;= 3, Discount &lt;= 10%, Days &lt;= 7)</span></div>
          <div class="mb-2"><span class="text-info">Explanation:</span> <span class="text-white">${diag.explanation || diag.diagnosis}</span></div>
        `;

        if (actionBtns) {
          actionBtns.classList.remove('d-none');
          actionBtns.innerHTML = `
            <div class="d-flex gap-2">
              <button class="btn btn-success flex-grow-1 py-2 fw-semibold" onclick="handleExecuteAIAction('${tx.id}', '${diag.recommendedAction}')">
                <i class="fas fa-bolt me-1"></i> Execute AI Action: "${diag.recommendedAction}"
              </button>
              <button class="btn btn-outline-info py-2" onclick="handlePayTestCheckout('${tx.id}')">
                <i class="fas fa-credit-card me-1"></i> Razorpay Pay
              </button>
            </div>
          `;
        }
      } catch (err) {
        output.innerHTML = `<span class="text-danger">Error running diagnosis: ${err.message}</span>`;
      } finally {
        btnRun.disabled = false;
        btnRun.innerHTML = '<i class="fas fa-microchip me-2"></i> Execute Groq AI Diagnosis &amp; Decision';
      }
    });
  }
}

function getDemoSimulationHTML() {
  const metrics = window.recoverStore.getMetrics();

  return `
    <div class="simulation-view animate-fade-in">
      <!-- Top Pitch Banner -->
      <div class="welcome-banner p-4 rounded-4 mb-4">
        <div class="d-flex justify-content-between align-items-center flex-wrap gap-3">
          <div>
            <span class="badge bg-primary-subtle text-primary border border-primary-subtle px-3 py-1 rounded-pill mb-2">
              <i class="fas fa-vial me-1"></i> Hackathon Demo Simulation Engine
            </span>
            <h2 class="fw-bold text-white mb-1">100-Transaction Autonomous Recovery Simulation</h2>
            <p class="text-secondary mb-0">
              Simulates real-world recovery across a batch of <strong>100 failed transactions valued at ₹5,00,000</strong>.
            </p>
          </div>
          <div class="text-end">
            <span class="badge bg-dark border border-secondary text-secondary p-2 font-monospace">
              Target Portfolio: ₹5,00,000.00
            </span>
          </div>
        </div>
      </div>

      <!-- Demo Value Notice -->
      <div class="alert alert-dark border-secondary-subtle d-flex align-items-center gap-3 py-2 px-3 rounded-3 mb-4">
        <i class="fas fa-info-circle text-info fs-5"></i>
        <div class="small">
          <strong class="text-white">Simulated / Test Data:</strong> These transactions demonstrate the end-to-end flow: <strong>₹5,00,000 Revenue at Risk → AI Recovery Actions → ₹X Recovered → Remaining Amount → Recovery Rate</strong>.
        </div>
      </div>

      <!-- Live Formula Flow Indicators -->
      <div class="card border-0 rounded-4 p-4 bg-surface mb-4">
        <div class="row g-3 align-items-center text-center">
          <div class="col-md-2 col-6">
            <span class="text-secondary small text-uppercase fw-semibold">1. Revenue at Risk</span>
            <div class="fs-4 fw-bold text-danger mt-1" id="simTotalRisk">₹${metrics.totalDemoRisk.toLocaleString('en-IN')}</div>
            <span class="badge bg-dark text-secondary">100 Transactions</span>
          </div>

          <div class="col-md-1 d-none d-md-block text-secondary fs-3">
            <i class="fas fa-arrow-right"></i>
          </div>

          <div class="col-md-3 col-6">
            <span class="text-secondary small text-uppercase fw-semibold">2. AI Actions Executed</span>
            <div class="fs-4 fw-bold text-primary mt-1">Autonomous</div>
            <span class="badge bg-primary-subtle text-primary">Bounded Guardrails</span>
          </div>

          <div class="col-md-1 d-none d-md-block text-secondary fs-3">
            <i class="fas fa-arrow-right"></i>
          </div>

          <div class="col-md-2 col-6">
            <span class="text-secondary small text-uppercase fw-semibold">3. Revenue Recovered</span>
            <div class="fs-4 fw-bold text-success mt-1" id="simTotalRecovered">₹${metrics.totalRecovered.toLocaleString('en-IN')}</div>
            <span class="badge bg-success-subtle text-success">Razorpay Settled</span>
          </div>

          <div class="col-md-1 d-none d-md-block text-secondary fs-3">
            <i class="fas fa-equals"></i>
          </div>

          <div class="col-md-2 col-6">
            <span class="text-secondary small text-uppercase fw-semibold">4. Recovery Rate</span>
            <div class="fs-4 fw-bold text-white mt-1" id="simRecoveryRate">${metrics.recoveryRate}%</div>
            <span class="badge bg-warning-subtle text-warning"><span id="simEscalatedCount">${metrics.escalatedCount}</span> Escalated</span>
          </div>
        </div>

        <!-- Animated Progress Bar -->
        <div class="mt-4">
          <div class="d-flex justify-content-between text-secondary small mb-1">
            <span>Autonomous Pipeline Progress</span>
            <span id="demoProgressText" class="fw-semibold text-white">0 / 100 Processed (0%)</span>
          </div>
          <div class="progress" style="height: 10px; background-color: #0f172a;">
            <div id="demoProgressBar" class="progress-bar progress-bar-striped progress-bar-animated bg-primary" role="progressbar" style="width: 0%;" aria-valuenow="0" aria-valuemin="0" aria-valuemax="100"></div>
          </div>
        </div>
      </div>

      <!-- Simulation Controls & Speed -->
      <div class="card border-0 rounded-4 p-3 bg-surface mb-4">
        <div class="d-flex justify-content-between align-items-center flex-wrap gap-3">
          <div class="d-flex gap-2 flex-wrap">
            <button id="btnStartSim" class="btn btn-primary px-4 py-2 rounded-3 fw-semibold shadow-sm" onclick="window.demoSimulation.startSimulation()">
              <i class="fas fa-play me-1"></i> Start Batch Simulation
            </button>
            <button id="btnPauseSim" class="btn btn-outline-warning px-3 py-2 rounded-3" disabled onclick="window.demoSimulation.pauseSimulation()">
              <i class="fas fa-pause me-1"></i> Pause
            </button>
            <button id="btnResetSim" class="btn btn-outline-danger px-3 py-2 rounded-3" onclick="window.demoSimulation.resetSimulation()">
              <i class="fas fa-undo me-1"></i> Reset Demo Portfolio
            </button>
          </div>

          <div class="d-flex align-items-center gap-2">
            <span class="text-secondary small fw-semibold">Simulation Speed:</span>
            <div class="btn-group btn-group-sm" role="group">
              <input type="radio" class="btn-check" name="simspeed" id="speedSlow" autocomplete="off" onchange="window.demoSimulation.setSpeed('slow')">
              <label class="btn btn-outline-secondary" for="speedSlow">Step-by-Step</label>

              <input type="radio" class="btn-check" name="simspeed" id="speedNormal" autocomplete="off" checked onchange="window.demoSimulation.setSpeed('normal')">
              <label class="btn btn-outline-secondary" for="speedNormal">Fast (300ms)</label>

              <input type="radio" class="btn-check" name="simspeed" id="speedInstant" autocomplete="off" onchange="window.demoSimulation.setSpeed('instant')">
              <label class="btn btn-outline-secondary" for="speedInstant">Ultra Batch</label>
            </div>
          </div>
        </div>
      </div>

      <!-- Live AI Terminal Logs Window -->
      <div class="card border-0 rounded-4 p-4 bg-surface">
        <div class="d-flex justify-content-between align-items-center mb-3">
          <div class="d-flex align-items-center gap-2">
            <span class="badge bg-danger rounded-circle p-1" style="width: 10px; height: 10px;"></span>
            <span class="badge bg-warning rounded-circle p-1" style="width: 10px; height: 10px;"></span>
            <span class="badge bg-success rounded-circle p-1" style="width: 10px; height: 10px;"></span>
            <span class="fw-bold text-white small font-monospace ms-2">Live Autonomous Recovery Terminal</span>
          </div>
          <span class="badge bg-dark border border-secondary text-secondary small font-monospace">Groq Engine &amp; Razorpay Rails</span>
        </div>

        <div id="demoTerminalLogs" class="terminal-logs-window p-3 rounded-3 font-monospace small" style="height: 380px; overflow-y: auto; background-color: #0b1120; border: 1px solid #1e293b;">
          <div class="text-muted font-monospace fst-italic">// Ready. Click "Start Batch Simulation" to initiate autonomous recovery across all 100 failed transactions (₹5,00,000 risk).</div>
        </div>
      </div>
    </div>
  `;
}

function getTransactionsHTML() {
  const txs = window.recoverStore.getTransactions();

  return `
    <div class="transactions-view animate-fade-in">
      <div class="d-flex justify-content-between align-items-center mb-4 flex-wrap gap-3">
        <div>
          <h2 class="fw-bold text-white mb-1">All Transactions &amp; Settlement Rails</h2>
          <p class="text-secondary mb-0">Inspect real-time telemetry, test payments via Razorpay SDK, and view transaction states.</p>
        </div>
        <span class="badge bg-dark border border-secondary text-secondary px-3 py-2">
          Total Records: ${txs.length}
        </span>
      </div>

      <div class="card border-0 rounded-4 p-4 bg-surface">
        <div class="table-responsive">
          <table class="table table-dark table-hover align-middle mb-0 custom-table">
            <thead>
              <tr class="text-secondary small text-uppercase">
                <th>Transaction ID</th>
                <th>Customer</th>
                <th>Amount</th>
                <th>Status</th>
                <th>Failure Diagnosis</th>
                <th>Action Taken</th>
                <th class="text-end">Razorpay Test Action</th>
              </tr>
            </thead>
            <tbody>
              ${txs.map(tx => `
                <tr>
                  <td class="font-monospace text-primary fw-bold">${tx.id}</td>
                  <td>
                    <div class="fw-semibold text-white">${tx.customerName}</div>
                    <div class="small text-secondary">${tx.customerEmail}</div>
                  </td>
                  <td>
                    <span class="fw-bold ${tx.status === 'Recovered' ? 'text-success' : 'text-danger'}">
                      ₹${(tx.recoveredAmount || tx.amount).toLocaleString('en-IN')}
                    </span>
                    ${tx.discountApplied > 0 ? `<div class="small text-warning">(-${tx.discountApplied}%)</div>` : ''}
                  </td>
                  <td>
                    <span class="badge ${
                      tx.status === 'Recovered' ? 'bg-success' :
                      tx.status === 'At Risk' ? 'bg-danger' :
                      tx.status === 'Escalated' ? 'bg-warning text-dark' :
                      tx.status === 'Unrecoverable' ? 'bg-secondary' : 'bg-primary'
                    }">
                      ${tx.status}
                    </span>
                  </td>
                  <td>
                    <div class="small text-light">${tx.failureType}</div>
                    <div class="small text-secondary text-truncate" style="max-width: 200px;">${tx.failureReason}</div>
                  </td>
                  <td>
                    <span class="small text-info">${tx.recoveryAction || 'Pending AI Action'}</span>
                  </td>
                  <td class="text-end">
                    ${tx.status === 'Recovered' ? `
                      <span class="badge bg-success-subtle text-success border border-success-subtle px-2 py-1">
                        <i class="fas fa-check me-1"></i> Settled
                      </span>
                    ` : `
                      <button class="btn btn-outline-success btn-sm" onclick="handlePayTestCheckout('${tx.id}')">
                        <i class="fas fa-credit-card me-1"></i> Pay Test Mode
                      </button>
                    `}
                  </td>
                </tr>
              `).join('')}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  `;
}

function getRecoveryHistoryHTML() {
  const events = window.recoverStore.getRecoveryEvents();
  const metrics = window.recoverStore.getMetrics();

  return `
    <div class="history-view animate-fade-in">
      <div class="d-flex justify-content-between align-items-center mb-4 flex-wrap gap-3">
        <div>
          <h2 class="fw-bold text-white mb-1"><i class="fas fa-history text-success me-2"></i>Revenue Recovery Ledger</h2>
          <p class="text-secondary mb-0">Auditable record of all autonomous settlements, payment links, and discounts.</p>
        </div>
        <div class="badge bg-success-subtle text-success border border-success-subtle px-3 py-2 fs-6">
          Total Recovered: ₹${metrics.totalRecovered.toLocaleString('en-IN')}
        </div>
      </div>

      <div class="card border-0 rounded-4 p-4 bg-surface">
        <div class="table-responsive">
          <table class="table table-dark table-hover align-middle mb-0 custom-table">
            <thead>
              <tr class="text-secondary small text-uppercase">
                <th>Timestamp</th>
                <th>Transaction &amp; Customer</th>
                <th>Amount Recovered</th>
                <th>Discount Applied</th>
                <th>Settlement Channel</th>
                <th>Recovery Trigger</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              ${events.length === 0 ? `
                <tr>
                  <td colspan="7" class="text-center py-5 text-secondary">
                    <i class="fas fa-receipt fs-3 mb-2 d-block"></i>
                    No recovery events recorded yet. Run the Demo Simulation or execute an AI action to see recovered revenue logged here.
                  </td>
                </tr>
              ` : events.map(e => `
                <tr>
                  <td class="small text-secondary font-monospace">
                    ${new Date(e.timestamp).toLocaleTimeString('en-GB')}
                  </td>
                  <td>
                    <div class="fw-bold text-white">${e.customerName}</div>
                    <div class="small text-secondary font-monospace">${e.transactionId}</div>
                  </td>
                  <td>
                    <span class="fw-bold text-success">₹${e.recoveredAmount.toLocaleString('en-IN')}</span>
                    ${e.originalAmount !== e.recoveredAmount ? `<div class="small text-secondary text-decoration-line-through">₹${e.originalAmount.toLocaleString('en-IN')}</div>` : ''}
                  </td>
                  <td>
                    ${e.discountApplied > 0 ? `<span class="badge bg-warning text-dark">${e.discountApplied}% OFF</span>` : '<span class="text-secondary">0%</span>'}
                  </td>
                  <td>
                    <span class="badge bg-dark border border-secondary text-light">${e.paymentMethod}</span>
                  </td>
                  <td>
                    <span class="small text-info">${e.actionTaken}</span>
                  </td>
                  <td>
                    <span class="badge bg-success"><i class="fas fa-check-circle me-1"></i> Settled</span>
                  </td>
                </tr>
              `).join('')}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  `;
}

function getAuditLogsHTML() {
  const logs = window.recoverStore.getAuditLogs();

  return `
    <div class="audit-view animate-fade-in">
      <div class="d-flex justify-content-between align-items-center mb-4 flex-wrap gap-3">
        <div>
          <h2 class="fw-bold text-white mb-1"><i class="fas fa-shield-alt text-primary me-2"></i>Audit Trail &amp; AI Decision Logs</h2>
          <p class="text-secondary mb-0">Immutable compliance log showing every AI decision, reason, and guardrail check.</p>
        </div>
        <button class="btn btn-outline-light btn-sm" onclick="downloadAuditCSV()">
          <i class="fas fa-download me-1"></i> Export Audit Logs
        </button>
      </div>

      <div class="card border-0 rounded-4 p-4 bg-surface">
        <div class="table-responsive">
          <table class="table table-dark table-hover align-middle mb-0 custom-table">
            <thead>
              <tr class="text-secondary small text-uppercase">
                <th>Log ID &amp; Time</th>
                <th>Tx / Target</th>
                <th>Action Event</th>
                <th>Decision Prescribed</th>
                <th>AI Justification &amp; Reason</th>
                <th>Guardrail Verification</th>
              </tr>
            </thead>
            <tbody>
              ${logs.map(l => `
                <tr>
                  <td class="font-monospace small">
                    <div class="text-secondary">${new Date(l.timestamp).toLocaleTimeString('en-GB')}</div>
                    <div class="text-muted" style="font-size: 10px;">${l.id}</div>
                  </td>
                  <td>
                    <span class="badge bg-dark border border-secondary font-monospace">${l.transactionId}</span>
                    <div class="small text-secondary">${l.customerName}</div>
                  </td>
                  <td>
                    <span class="badge ${l.status === 'SUCCESS' ? 'bg-success-subtle text-success border border-success-subtle' : l.status === 'WARNING' ? 'bg-warning-subtle text-warning border border-warning-subtle' : 'bg-secondary'}">
                      ${l.action}
                    </span>
                  </td>
                  <td class="fw-semibold text-white">${l.decision}</td>
                  <td class="small text-secondary" style="max-width: 280px;">${l.reason}</td>
                  <td>
                    <span class="small text-success"><i class="fas fa-check-circle me-1"></i> ${l.ruleCheck}</span>
                  </td>
                </tr>
              `).join('')}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  `;
}

function getAnalyticsHTML() {
  const metrics = window.recoverStore.getMetrics();

  return `
    <div class="analytics-view animate-fade-in">
      <div class="d-flex justify-content-between align-items-center mb-4 flex-wrap gap-3">
        <div>
          <h2 class="fw-bold text-white mb-1"><i class="fas fa-chart-line text-primary me-2"></i>Recovery Performance &amp; ROI Analytics</h2>
          <p class="text-secondary mb-0">Deep dive into AI recovery efficiency, channel conversion yield, and bounded cost metrics.</p>
        </div>
      </div>

      <!-- ROI Summary Metrics -->
      <div class="row g-3 mb-4">
        <div class="col-md-4">
          <div class="card border-0 rounded-4 p-4 bg-surface h-100">
            <span class="text-secondary small text-uppercase fw-semibold">Net Recovered Value</span>
            <div class="fs-2 fw-bold text-success mt-1">₹${metrics.totalRecovered.toLocaleString('en-IN')}</div>
            <span class="small text-secondary">Direct revenue recaptured without manual debt agency fees</span>
          </div>
        </div>
        <div class="col-md-4">
          <div class="card border-0 rounded-4 p-4 bg-surface h-100">
            <span class="text-secondary small text-uppercase fw-semibold">AI Conversion Rate</span>
            <div class="fs-2 fw-bold text-primary mt-1">${metrics.recoveryRate}%</div>
            <span class="small text-secondary">Autonomous recovery yield from ₹5,00,000 risk baseline</span>
          </div>
        </div>
        <div class="col-md-4">
          <div class="card border-0 rounded-4 p-4 bg-surface h-100">
            <span class="text-secondary small text-uppercase fw-semibold">Bounded Policy Compliance</span>
            <div class="fs-2 fw-bold text-warning mt-1">100%</div>
            <span class="small text-secondary">Zero guardrail violations (Retries &le; 3, Discount &le; 10%)</span>
          </div>
        </div>
      </div>

      <!-- Analytics Graph -->
      <div class="card border-0 rounded-4 p-4 bg-surface mb-4">
        <h5 class="fw-bold text-white mb-1">AI Action Efficiency Comparison</h5>
        <span class="small text-secondary mb-3 d-block">Comparison of actions executed vs successfully settled transactions</span>
        <div class="chart-container" style="position: relative; height: 320px;">
          <canvas id="chartActionEfficiency"></canvas>
        </div>
      </div>
    </div>
  `;
}

function getSettingsHTML() {
  return `
    <div class="settings-view animate-fade-in">
      <div class="d-flex justify-content-between align-items-center mb-4 flex-wrap gap-3">
        <div>
          <h2 class="fw-bold text-white mb-1"><i class="fas fa-sliders-h text-primary me-2"></i>System Configuration &amp; API Keys</h2>
          <p class="text-secondary mb-0">Manage Groq AI models, Razorpay Test credentials, and Bounded Recovery thresholds.</p>
        </div>
      </div>

      <div class="row g-4">
        <!-- AI & Gateway Config -->
        <div class="col-lg-6">
          <div class="card border-0 rounded-4 p-4 bg-surface h-100">
            <h5 class="fw-bold text-white mb-3">AI &amp; Payment Gateway Config</h5>
            
            <div class="mb-3">
              <label class="form-label text-secondary small">Groq AI API Status</label>
              <div class="input-group">
                <input type="password" class="form-control bg-dark border-secondary text-white font-monospace" value="gsk_live_api_key_configured" readonly>
                <span class="input-group-text bg-success-subtle text-success border-success-subtle"><i class="fas fa-check-circle me-1"></i> Active</span>
              </div>
              <div class="form-text text-secondary">Model: llama-3.3-70b-versatile / gpt-oss (Groq Ultra-fast inference)</div>
            </div>

            <div class="mb-3">
              <label class="form-label text-secondary small">Razorpay Test Key ID</label>
              <input type="text" class="form-control bg-dark border-secondary text-white font-monospace" value="rzp_test_TYNHyjYHC7s2ef" readonly>
            </div>

            <div class="mb-3">
              <label class="form-label text-secondary small">Razorpay Test Key Secret</label>
              <input type="password" class="form-control bg-dark border-secondary text-white font-monospace" value="••••••••••••••••••••••••" readonly>
            </div>
          </div>
        </div>

        <!-- Bounded Rules Customizer -->
        <div class="col-lg-6">
          <div class="card border-0 rounded-4 p-4 bg-surface h-100">
            <h5 class="fw-bold text-white mb-3">Bounded Recovery Guardrail Policy</h5>
            
            <div class="mb-3">
              <label class="form-label text-secondary small d-flex justify-content-between">
                <span>Maximum Payment Retries</span>
                <strong class="text-white">3 attempts</strong>
              </label>
              <input type="range" class="form-range" min="1" max="5" value="3" disabled>
            </div>

            <div class="mb-3">
              <label class="form-label text-secondary small d-flex justify-content-between">
                <span>Maximum Reminders</span>
                <strong class="text-white">2 reminders</strong>
              </label>
              <input type="range" class="form-range" min="1" max="4" value="2" disabled>
            </div>

            <div class="mb-3">
              <label class="form-label text-secondary small d-flex justify-content-between">
                <span>Maximum Incentive Discount Cap</span>
                <strong class="text-warning">10% Maximum</strong>
              </label>
              <input type="range" class="form-range" min="0" max="15" value="10" disabled>
            </div>

            <div class="mb-4">
              <label class="form-label text-secondary small d-flex justify-content-between">
                <span>Recovery SLA Window</span>
                <strong class="text-white">7 Days</strong>
              </label>
              <input type="range" class="form-range" min="3" max="14" value="7" disabled>
            </div>

            <div class="pt-3 border-top border-secondary">
              <button class="btn btn-outline-danger w-100 py-2 rounded-3" onclick="window.demoSimulation.resetSimulation()">
                <i class="fas fa-trash-restore me-2"></i> Reset 100-Transaction Portfolio to Initial State (₹5,00,000)
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  `;
}

// ---------------- ACTION HANDLERS ----------------

window.handleAIDiagnoseModal = async function(txId) {
  const tx = window.recoverStore.getTransactionById(txId);
  if (!tx) return;

  const modalEl = document.getElementById('aiDiagnoseModal');
  const modalBody = document.getElementById('aiDiagnoseModalBody');
  const modalTitle = document.getElementById('aiDiagnoseModalTitle');

  if (modalTitle) modalTitle.innerText = `AI Diagnosis: ${tx.id} (${tx.customerName})`;
  if (modalBody) {
    modalBody.innerHTML = `
      <div class="text-center py-4">
        <i class="fas fa-spinner fa-spin text-primary fs-2 mb-3"></i>
        <div class="text-white fw-semibold">Consulting Groq LLaMA 3.3 Engine...</div>
        <div class="text-secondary small">Evaluating bounded policy constraints &amp; customer profile</div>
      </div>
    `;
  }

  const bsModal = new bootstrap.Modal(modalEl);
  bsModal.show();

  try {
    const diag = await window.recoverAIAgent.diagnoseTransaction(tx);
    modalBody.innerHTML = `
      <div class="p-3 bg-dark rounded-3 border border-secondary mb-3">
        <div class="row g-2 small">
          <div class="col-6"><span class="text-secondary">Amount:</span> <strong class="text-danger">₹${tx.amount.toLocaleString('en-IN')}</strong></div>
          <div class="col-6"><span class="text-secondary">Failure:</span> <span class="text-light">${tx.failureReason}</span></div>
          <div class="col-6"><span class="text-secondary">Previous Retries:</span> <span class="badge bg-secondary">${tx.previousAttempts}/3</span></div>
          <div class="col-6"><span class="text-secondary">Overdue:</span> <span class="text-light">${tx.daysOverdue} days</span></div>
        </div>
      </div>

      <div class="mb-3">
        <div class="text-secondary small text-uppercase fw-semibold">Root Cause Diagnosis</div>
        <div class="text-white fw-semibold">${diag.rootCause || diag.diagnosis}</div>
      </div>

      <div class="mb-3">
        <div class="text-secondary small text-uppercase fw-semibold">Prescribed Recovery Action</div>
        <span class="badge bg-primary fs-6 py-2 px-3 mt-1">${diag.recommendedAction}</span>
      </div>

      ${diag.discountPercent > 0 ? `
        <div class="alert alert-warning py-2 mb-3 small">
          <i class="fas fa-tag me-1"></i> Bounded Incentive: <strong>${diag.discountPercent}% Discount</strong> recommended (Under 10% limit).
        </div>
      ` : ''}

      <div class="mb-3">
        <div class="text-secondary small text-uppercase fw-semibold">AI Decision Rationale</div>
        <p class="text-light small mb-0">${diag.explanation || diag.diagnosis}</p>
      </div>

      <div class="d-flex gap-2 mt-4">
        <button class="btn btn-success flex-grow-1 py-2 fw-semibold" onclick="handleExecuteAIAction('${tx.id}', '${diag.recommendedAction}'); bootstrap.Modal.getInstance(document.getElementById('aiDiagnoseModal')).hide();">
          <i class="fas fa-bolt me-1"></i> Execute AI Action
        </button>
        <button class="btn btn-outline-light py-2" data-bs-dismiss="modal">Close</button>
      </div>
    `;
  } catch (err) {
    modalBody.innerHTML = `<div class="alert alert-danger">Error: ${err.message}</div>`;
  }
};

window.handleExecuteAIAction = async function(txId, action) {
  const res = await window.recoverAIAgent.executeRecoveryAction(txId, action);
  if (res.status === 'Recovered') {
    window.showToast(`🎉 Recovered! ${res.outcomeDetails}`, 'success');
  } else if (res.status === 'Escalated') {
    window.showToast(`⚠️ Guardrail Hit: ${res.outcomeDetails}`, 'warning');
  } else {
    window.showToast(`Action Executed: ${res.outcomeDetails}`, 'info');
  }
  window.renderCurrentView();
};

window.handlePayTestCheckout = function(txId) {
  const tx = window.recoverStore.getTransactionById(txId);
  if (!tx) return;
  window.razorpayManager.openCheckout(tx);
};

window.handleBatchAIDiagnose = async function() {
  const atRisk = window.recoverStore.getTransactions().filter(t => t.status === 'At Risk');
  if (atRisk.length === 0) {
    window.showToast('No at-risk transactions to diagnose.', 'info');
    return;
  }
  window.showToast(`Triggering AI Diagnosis across ${atRisk.length} transactions...`, 'info');
  navigateTo('demo-simulation');
  window.demoSimulation.startSimulation();
};

window.downloadAuditCSV = function() {
  const logs = window.recoverStore.getAuditLogs();
  let csv = 'Log ID,Timestamp,Transaction ID,Customer,Action,Decision,Reason,Rule Check\n';
  logs.forEach(l => {
    csv += `"${l.id}","${l.timestamp}","${l.transactionId}","${l.customerName}","${l.action}","${l.decision}","${(l.reason || '').replace(/"/g, '""')}","${(l.ruleCheck || '').replace(/"/g, '""')}"\n`;
  });

  const blob = new Blob([csv], { type: 'text/csv' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `recoverai_audit_logs_${Date.now()}.csv`;
  a.click();
};

// Initialization
document.addEventListener('DOMContentLoaded', () => {
  // Navigation Links
  document.querySelectorAll('.nav-link-item').forEach(link => {
    link.addEventListener('click', (e) => {
      e.preventDefault();
      const view = link.getAttribute('data-view');
      if (view) navigateTo(view);
    });
  });

  // Render initial dashboard
  navigateTo('dashboard');
});

