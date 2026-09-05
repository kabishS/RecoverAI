/**
 * RecoverAI - 100-Transaction Demo Simulation Engine
 * Runs autonomous multi-agent simulation across 100 failed transactions valued at ₹5,00,000.
 * Demonstrates: Detect -> Diagnose -> Decide -> Act -> Measure -> Stop with strict bounded rules.
 */

class DemoSimulationEngine {
  constructor(store, agent) {
    this.store = store;
    this.agent = agent;
    this.isRunning = false;
    this.isPaused = false;
    this.speed = 'normal'; // 'slow' (1200ms), 'normal' (300ms), 'instant' (10ms)
    this.currentIndex = 0;
    this.timer = null;
  }

  setSpeed(speed) {
    this.speed = speed;
  }

  getDelay() {
    if (this.speed === 'slow') return 1200;
    if (this.speed === 'instant') return 30;
    return 350; // normal
  }

  logTerminal(message, type = 'info') {
    const term = document.getElementById('demoTerminalLogs');
    if (!term) return;

    const time = new Date().toLocaleTimeString('en-GB', { hour12: false });
    const line = document.createElement('div');
    line.className = `terminal-line terminal-${type} mb-1 animate-fade-in`;

    let badge = 'LOG';
    if (type === 'ai') badge = 'AI AGENT';
    if (type === 'success') badge = 'RECOVERED';
    if (type === 'guardrail') badge = 'GUARDRAIL';
    if (type === 'warning') badge = 'ESCALATED';

    line.innerHTML = `<span class="text-secondary font-monospace">[${time}]</span> <span class="badge-term badge-term-${type}">[${badge}]</span> <span class="log-text">${message}</span>`;
    
    term.appendChild(line);
    term.scrollTop = term.scrollHeight;

    // Keep max 200 lines in DOM
    if (term.childNodes.length > 200) {
      term.removeChild(term.firstChild);
    }
  }

  updateProgressUI() {
    const txs = this.store.getTransactions();
    const metrics = this.store.getMetrics();
    const processedCount = txs.filter(t => t.status !== 'At Risk').length;
    const progressPercent = Math.round((processedCount / 100) * 100);

    // Update Progress Bar
    const pBar = document.getElementById('demoProgressBar');
    const pText = document.getElementById('demoProgressText');
    if (pBar) {
      pBar.style.width = `${progressPercent}%`;
      pBar.setAttribute('aria-valuenow', progressPercent);
    }
    if (pText) {
      pText.innerText = `${processedCount} / 100 Processed (${progressPercent}%)`;
    }

    // Update Counter Badges
    const riskEl = document.getElementById('simTotalRisk');
    const recEl = document.getElementById('simTotalRecovered');
    const remEl = document.getElementById('simRemainingRisk');
    const rateEl = document.getElementById('simRecoveryRate');
    const escEl = document.getElementById('simEscalatedCount');

    if (riskEl) riskEl.innerText = `₹${metrics.totalDemoRisk.toLocaleString('en-IN')}`;
    if (recEl) recEl.innerText = `₹${metrics.totalRecovered.toLocaleString('en-IN')}`;
    if (remEl) remEl.innerText = `₹${metrics.remainingRisk.toLocaleString('en-IN')}`;
    if (rateEl) rateEl.innerText = `${metrics.recoveryRate}%`;
    if (escEl) escEl.innerText = `${metrics.escalatedCount}`;

    // Update global header stats if present
    if (window.updateHeaderStats) {
      window.updateHeaderStats();
    }
  }

  async startSimulation() {
    if (this.isRunning && !this.isPaused) return;

    this.isRunning = true;
    this.isPaused = false;

    this.toggleSimulationControls(true);
    this.logTerminal("🚀 Initiating RecoverAI Autonomous Batch Pipeline for 100 Failed Transactions (₹5,00,000 Risk)...", "ai");
    this.logTerminal("🔒 Bounded Recovery Constraints Verified: Max 3 Retries, Max 2 Reminders, 7 Days Window, 10% Discount Cap.", "guardrail");

    this.runNextStep();
  }

  pauseSimulation() {
    this.isPaused = true;
    if (this.timer) clearTimeout(this.timer);
    this.logTerminal("⏸️ Simulation paused by user.", "warning");
    this.toggleSimulationControls(false);
  }

  resetSimulation() {
    if (this.timer) clearTimeout(this.timer);
    this.isRunning = false;
    this.isPaused = false;
    this.currentIndex = 0;
    this.store.resetDemo();
    this.updateProgressUI();

    const term = document.getElementById('demoTerminalLogs');
    if (term) {
      term.innerHTML = '<div class="text-muted font-monospace fst-italic">// Terminal reset. Ready to run 100-Transaction ₹5,00,000 demo simulation.</div>';
    }

    this.toggleSimulationControls(false);
    if (window.renderCurrentView) {
      window.renderCurrentView();
    }
    if (window.showToast) {
      window.showToast("Demo Portfolio Reset: 100 Failed Transactions (₹5,00,000 at risk)", "info");
    }
  }

  toggleSimulationControls(running) {
    const btnStart = document.getElementById('btnStartSim');
    const btnPause = document.getElementById('btnPauseSim');
    const btnReset = document.getElementById('btnResetSim');

    if (btnStart) {
      btnStart.disabled = running && !this.isPaused;
      btnStart.innerHTML = running ? '<i class="fas fa-spinner fa-spin me-1"></i> Running...' : '<i class="fas fa-play me-1"></i> Start Batch Simulation';
    }
    if (btnPause) {
      btnPause.disabled = !running || this.isPaused;
    }
    if (btnReset) {
      btnReset.disabled = running && !this.isPaused;
    }
  }

  async runNextStep() {
    if (!this.isRunning || this.isPaused) return;

    const txs = this.store.getTransactions();
    // Find next un-recovered / at-risk transaction
    const pendingTxs = txs.filter(t => t.status === 'At Risk');

    if (pendingTxs.length === 0) {
      this.isRunning = false;
      this.toggleSimulationControls(false);
      this.updateProgressUI();
      const metrics = this.store.getMetrics();
      this.logTerminal(`🎯 BATCH SIMULATION COMPLETE! Recovered ₹${metrics.totalRecovered.toLocaleString('en-IN')} out of ₹${metrics.totalDemoRisk.toLocaleString('en-IN')} (${metrics.recoveryRate}% Recovery Rate).`, "success");
      this.logTerminal("🛑 All workflows terminated strictly under Bounded Recovery Rules.", "guardrail");
      if (window.showToast) {
        window.showToast(`✨ Demo Simulation Completed! ${metrics.recoveryRate}% recovered (₹${metrics.totalRecovered.toLocaleString('en-IN')})`, 'success');
      }
      return;
    }

    const tx = pendingTxs[0];
    this.logTerminal(`[Detecting] ${tx.id} | ${tx.customerName} | ₹${tx.amount.toLocaleString('en-IN')} | Issue: "${tx.failureReason}"`, "info");

    try {
      // Execute AI recovery
      const result = await this.agent.executeRecoveryAction(tx.id);

      if (result.status === 'Recovered') {
        this.logTerminal(`[Decided & Acted] -> Action: ${result.actionTaken} -> ✅ SUCCESS: Recovered ₹${tx.amount.toLocaleString('en-IN')} for ${tx.customerName}`, "success");
      } else if (result.status === 'Escalated') {
        this.logTerminal(`[Bounded Guardrail Hit] -> Action: ${result.actionTaken} -> ⚠️ Escalated to Human Support (${result.outcomeDetails})`, "warning");
      } else if (result.status === 'Unrecoverable') {
        this.logTerminal(`[Termination Rule] -> Action: ${result.actionTaken} -> 🛑 Recovery Stopped (Overdue > 7 days)`, "guardrail");
      } else {
        this.logTerminal(`[Action Scheduled] -> Action: ${result.actionTaken} -> Status: ${result.status}`, "ai");
      }
    } catch (e) {
      console.error("Simulation step error:", e);
    }

    this.updateProgressUI();

    // Schedule next step
    this.timer = setTimeout(() => {
      this.runNextStep();
    }, this.getDelay());
  }
}

window.demoSimulation = new DemoSimulationEngine(window.recoverStore, window.recoverAIAgent);

