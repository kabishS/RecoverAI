/**
 * RecoverAI - Chart.js Analytics Visualizations
 * Renders fintech performance graphs, funnel analysis, and AI recovery yield charts.
 */

class RecoverCharts {
  constructor(store) {
    this.store = store;
    this.chartInstances = {};
  }

  destroyChart(id) {
    if (this.chartInstances[id]) {
      this.chartInstances[id].destroy();
      delete this.chartInstances[id];
    }
  }

  // Render Dashboard Overview Charts
  renderDashboardCharts() {
    const txs = this.store.getTransactions();
    const metrics = this.store.getMetrics();

    // 1. Recovery Funnel / Status Distribution Chart
    const statusCtx = document.getElementById('chartStatusDistribution');
    if (statusCtx) {
      this.destroyChart('statusDist');
      const recovered = metrics.recoveredCount;
      const atRisk = metrics.atRiskCount;
      const recovering = metrics.recoveringCount;
      const escalated = metrics.escalatedCount;
      const unrecoverable = metrics.unrecoverableCount;

      this.chartInstances['statusDist'] = new Chart(statusCtx, {
        type: 'doughnut',
        data: {
          labels: ['Recovered', 'At Risk', 'In Recovery Pipeline', 'Escalated to Human', 'Unrecoverable'],
          datasets: [{
            data: [recovered, atRisk, recovering, escalated, unrecoverable],
            backgroundColor: [
              '#10b981', // Emerald
              '#f43f5e', // Rose
              '#6366f1', // Indigo
              '#f59e0b', // Amber
              '#64748b'  // Slate
            ],
            borderWidth: 2,
            borderColor: '#1e293b'
          }]
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          plugins: {
            legend: {
              position: 'bottom',
              labels: { color: '#94a3b8', font: { size: 11, family: 'Inter' } }
            }
          },
          cutout: '70%'
        }
      });
    }

    // 2. Risk Level Breakdown Chart
    const riskCtx = document.getElementById('chartRiskBreakdown');
    if (riskCtx) {
      this.destroyChart('riskBreakdown');
      const high = txs.filter(t => t.riskLevel === 'High').length;
      const med = txs.filter(t => t.riskLevel === 'Medium').length;
      const low = txs.filter(t => t.riskLevel === 'Low').length;

      this.chartInstances['riskBreakdown'] = new Chart(riskCtx, {
        type: 'bar',
        data: {
          labels: ['Low Risk', 'Medium Risk', 'High Risk'],
          datasets: [{
            label: 'Transactions',
            data: [low, med, high],
            backgroundColor: ['#10b981', '#f59e0b', '#ef4444'],
            borderRadius: 6
          }]
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          plugins: {
            legend: { display: false }
          },
          scales: {
            x: { grid: { display: false }, ticks: { color: '#94a3b8' } },
            y: { grid: { color: '#334155' }, ticks: { color: '#94a3b8', stepSize: 5 } }
          }
        }
      });
    }

    // 3. 7-Day Recovery Trajectory Chart
    const trendCtx = document.getElementById('chartRecoveryTrend');
    if (trendCtx) {
      this.destroyChart('recoveryTrend');
      // Simulate/derive 7 day recovery progression
      const days = ['Day -6', 'Day -5', 'Day -4', 'Day -3', 'Day -2', 'Yesterday', 'Today'];
      const recoveredAmounts = [45000, 92000, 168000, 240000, 310000, 385000, metrics.totalRecovered];

      this.chartInstances['recoveryTrend'] = new Chart(trendCtx, {
        type: 'line',
        data: {
          labels: days,
          datasets: [
            {
              label: 'Cumulative Recovered (₹)',
              data: recoveredAmounts,
              borderColor: '#10b981',
              backgroundColor: 'rgba(16, 185, 129, 0.15)',
              fill: true,
              tension: 0.4,
              borderWidth: 3,
              pointBackgroundColor: '#10b981',
              pointRadius: 4
            },
            {
              label: 'Total Revenue at Risk (₹)',
              data: [500000, 500000, 500000, 500000, 500000, 500000, 500000],
              borderColor: '#f43f5e',
              borderDash: [5, 5],
              borderWidth: 2,
              fill: false,
              pointRadius: 0
            }
          ]
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          plugins: {
            legend: { labels: { color: '#94a3b8' } },
            tooltip: {
              callbacks: {
                label: (ctx) => `${ctx.dataset.label}: ₹${ctx.parsed.y.toLocaleString('en-IN')}`
              }
            }
          },
          scales: {
            x: { grid: { display: false }, ticks: { color: '#94a3b8' } },
            y: {
              grid: { color: '#334155' },
              ticks: {
                color: '#94a3b8',
                callback: (val) => `₹${(val / 1000).toFixed(0)}k`
              }
            }
          }
        }
      });
    }

    // 4. Failure Category Breakdown Chart
    const reasonCtx = document.getElementById('chartFailureCategories');
    if (reasonCtx) {
      this.destroyChart('failureCat');
      const catCounts = {};
      txs.forEach(t => {
        const type = t.failureType || 'Other';
        catCounts[type] = (catCounts[type] || 0) + 1;
      });

      this.chartInstances['failureCat'] = new Chart(reasonCtx, {
        type: 'polarArea',
        data: {
          labels: Object.keys(catCounts),
          datasets: [{
            data: Object.values(catCounts),
            backgroundColor: [
              'rgba(99, 102, 241, 0.7)',
              'rgba(16, 185, 129, 0.7)',
              'rgba(245, 158, 11, 0.7)',
              'rgba(244, 63, 94, 0.7)',
              'rgba(14, 165, 233, 0.7)',
              'rgba(168, 85, 247, 0.7)',
              'rgba(236, 72, 153, 0.7)',
              'rgba(34, 197, 94, 0.7)'
            ]
          }]
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          plugins: {
            legend: { position: 'right', labels: { color: '#94a3b8', font: { size: 10 } } }
          },
          scales: {
            r: { grid: { color: '#334155' }, ticks: { display: false } }
          }
        }
      });
    }
  }

  // Render Deep Analytics Page Charts
  renderAnalyticsCharts() {
    const txs = this.store.getTransactions();
    const metrics = this.store.getMetrics();

    // AI Action Efficiency
    const actionCtx = document.getElementById('chartActionEfficiency');
    if (actionCtx) {
      this.destroyChart('actionEfficiency');
      const actions = {
        'Retry payment': { total: 0, recovered: 0 },
        'Offer limited incentive': { total: 0, recovered: 0 },
        'Send payment reminder': { total: 0, recovered: 0 },
        'Generate payment link': { total: 0, recovered: 0 },
        'Escalate to human': { total: 0, recovered: 0 }
      };

      txs.forEach(t => {
        if (t.recoveryAction && actions[t.recoveryAction]) {
          actions[t.recoveryAction].total += 1;
          if (t.status === 'Recovered') {
            actions[t.recoveryAction].recovered += 1;
          }
        }
      });

      const labels = Object.keys(actions);
      const totalData = labels.map(l => actions[l].total);
      const recoveredData = labels.map(l => actions[l].recovered);

      this.chartInstances['actionEfficiency'] = new Chart(actionCtx, {
        type: 'bar',
        data: {
          labels: labels,
          datasets: [
            {
              label: 'Actions Executed',
              data: totalData,
              backgroundColor: '#6366f1',
              borderRadius: 6
            },
            {
              label: 'Successfully Recovered',
              data: recoveredData,
              backgroundColor: '#10b981',
              borderRadius: 6
            }
          ]
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          plugins: {
            legend: { labels: { color: '#94a3b8' } }
          },
          scales: {
            x: { grid: { display: false }, ticks: { color: '#94a3b8' } },
            y: { grid: { color: '#334155' }, ticks: { color: '#94a3b8' } }
          }
        }
      });
    }
  }
}

window.recoverCharts = new RecoverCharts(window.recoverStore);

