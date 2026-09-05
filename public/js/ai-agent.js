/**
 * RecoverAI - AI Recovery Agent Engine
 * Communicates with Groq AI API via backend, enforces strict bounded recovery guardrails,
 * and executes autonomous recovery pipelines.
 */

class AIAgentEngine {
  constructor(store) {
    this.store = store;
    this.isProcessing = false;
  }

  // Diagnose single transaction via Groq API
  async diagnoseTransaction(tx) {
    try {
      const response = await fetch('/api/ai/diagnose', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(tx)
      });

      if (!response.ok) {
        throw new Error(`AI Diagnosis HTTP Error ${response.status}`);
      }

      const diagnosis = await response.json();
      return diagnosis;
    } catch (err) {
      console.warn('Backend Groq diagnosis unavailable, using client-side fallback:', err);
      return this.clientFallbackDiagnosis(tx);
    }
  }

  // Client-side fallback rule engine
  clientFallbackDiagnosis(tx) {
    const attempts = Number(tx.previousAttempts) || 0;
    const days = Number(tx.daysOverdue) || 0;
    const reason = (tx.failureReason || '').toLowerCase();
    const history = (tx.customerHistory || '').toLowerCase();
    const amount = Number(tx.amount) || 0;

    // Guardrail: Max 3 retries
    if (attempts >= 3) {
      return {
        diagnosis: "Bounded Limit Reached: Max 3 failed attempts recorded. Automated retries suspended.",
        rootCause: "Persistent instrument failure or strict bank decline.",
        riskScore: 85,
        recommendedAction: "Escalate to human",
        actionParameters: { channel: "Senior Support Agent", priority: "High" },
        discountPercent: 0,
        incentiveText: "",
        boundedRulesCheck: {
          maxRetriesExceeded: true,
          maxRemindersExceeded: false,
          maxDaysExceeded: days > 7,
          maxIncentiveRespected: true,
          guardrailTriggered: "MAX_RETRIES_EXCEEDED"
        },
        explanation: "Automated retry cap of 3 reached. Human intervention required to prevent customer dissatisfaction.",
        source: "Client-Guardrails-Engine"
      };
    }

    // Guardrail: Max 7 days overdue
    if (days > 7) {
      return {
        diagnosis: `Bounded Limit Reached: Transaction overdue by ${days} days (> 7 days allowed window).`,
        rootCause: "Stale transaction beyond SLA.",
        riskScore: 90,
        recommendedAction: "Stop recovery",
        actionParameters: { reason: "Expired 7-day recovery SLA" },
        discountPercent: 0,
        incentiveText: "",
        boundedRulesCheck: {
          maxRetriesExceeded: false,
          maxRemindersExceeded: false,
          maxDaysExceeded: true,
          maxIncentiveRespected: true,
          guardrailTriggered: "MAX_DAYS_EXCEEDED"
        },
        explanation: "Autonomous recovery halts after 7 days as per company risk governance.",
        source: "Client-Guardrails-Engine"
      };
    }

    if (reason.includes('insufficient') || reason.includes('funds') || reason.includes('balance')) {
      return {
        diagnosis: "Temporary balance insufficiency. High probability of settlement within 24 hours.",
        rootCause: "Customer account liquidity timing mismatch.",
        riskScore: 40,
        recommendedAction: "Send payment reminder",
        actionParameters: { channel: "WhatsApp & SMS with Razorpay Link", smartDelay: "24h" },
        discountPercent: 0,
        incentiveText: "",
        boundedRulesCheck: {
          maxRetriesExceeded: false,
          maxRemindersExceeded: false,
          maxDaysExceeded: false,
          maxIncentiveRespected: true,
          guardrailTriggered: "NONE"
        },
        explanation: "Scheduled low-friction reminder to capture funds upon customer deposit.",
        source: "Client-Rule-Engine"
      };
    }

    if (reason.includes('timeout') || reason.includes('network') || reason.includes('gateway') || reason.includes('velocity')) {
      return {
        diagnosis: "Transient banking network failure. Transaction is technically retryable without user intervention.",
        rootCause: "Inter-bank 3DS gateway timeout.",
        riskScore: 25,
        recommendedAction: "Retry payment",
        actionParameters: { backoffMinutes: 15, route: "Secondary Razorpay Gateway" },
        discountPercent: 0,
        incentiveText: "",
        boundedRulesCheck: {
          maxRetriesExceeded: false,
          maxRemindersExceeded: false,
          maxDaysExceeded: false,
          maxIncentiveRespected: true,
          guardrailTriggered: "NONE"
        },
        explanation: "Low risk payment retry scheduled via redundant banking rails.",
        source: "Client-Rule-Engine"
      };
    }

    if (reason.includes('abandoned') || reason.includes('checkout')) {
      const discount = (history.includes('vip') || amount > 5000) ? 8 : 5;
      return {
        diagnosis: "Checkout drop-off detected. Buyer hesitated at payment authorization.",
        rootCause: "Price friction or cart distraction.",
        riskScore: 55,
        recommendedAction: "Offer limited incentive",
        actionParameters: { discountCode: `RECOVER${discount}`, validHours: 24 },
        discountPercent: discount,
        incentiveText: `Exclusive ${discount}% recovery discount applied.`,
        boundedRulesCheck: {
          maxRetriesExceeded: false,
          maxRemindersExceeded: false,
          maxDaysExceeded: false,
          maxIncentiveRespected: true,
          guardrailTriggered: "NONE"
        },
        explanation: `Bounded discount of ${discount}% (under 10% ceiling) created to convert abandoned buyer.`,
        source: "Client-Rule-Engine"
      };
    }

    // Default: Card or Mandate issue
    return {
      diagnosis: "Payment instrument authorization decline.",
      rootCause: "Card limits or authorization restrictions.",
      riskScore: 60,
      recommendedAction: "Generate payment link",
      actionParameters: { methods: ["UPI", "NetBanking", "Cards"] },
      discountPercent: 0,
      incentiveText: "",
      boundedRulesCheck: {
        maxRetriesExceeded: false,
        maxRemindersExceeded: false,
        maxDaysExceeded: false,
        maxIncentiveRespected: true,
        guardrailTriggered: "NONE"
      },
      explanation: "Generated multi-channel Razorpay Smart Link enabling UPI & Alternate Cards.",
      source: "Client-Rule-Engine"
    };
  }

  // Execute the AI recommended action
  async executeRecoveryAction(txId, customAction = null) {
    const tx = this.store.getTransactionById(txId);
    if (!tx) return { error: "Transaction not found" };

    if (tx.status === 'Recovered') {
      return { error: "Transaction already recovered. Bounded rules prohibit further action." };
    }

    // Step 1: Diagnose
    const aiResult = await this.diagnoseTransaction(tx);
    const actionToTake = customAction || aiResult.recommendedAction;

    // Log AI Diagnosis in Audit Trail
    this.store.logAudit({
      transactionId: tx.id,
      customerName: tx.customerName,
      action: 'AI_DIAGNOSIS_COMPLETED',
      decision: actionToTake,
      reason: aiResult.explanation || aiResult.diagnosis,
      ruleCheck: `Guardrails Checked: Retries <= 3 (${tx.previousAttempts}/3), Days <= 7 (${tx.daysOverdue}/7), Incentive <= 10% (${aiResult.discountPercent || 0}%)`,
      status: 'SUCCESS'
    });

    let newStatus = 'Recovering';
    let outcomeDetails = '';

    // Step 2: Enforce Action Rules
    switch (actionToTake) {
      case 'Retry payment': {
        const nextAttempts = (tx.previousAttempts || 0) + 1;
        if (nextAttempts > 3) {
          newStatus = 'Escalated';
          outcomeDetails = 'Bounded limit exceeded: 3 retries reached. Transferred to human support.';
        } else {
          // Simulate smart retry success rate (70% probability for network/timeout issues)
          const isSuccess = Math.random() < 0.75;
          if (isSuccess) {
            newStatus = 'Recovered';
            this.store.recordRecovery(tx, tx.amount, 'Razorpay Smart Auto-Retry', 0);
            outcomeDetails = `Payment successfully re-authorized on attempt #${nextAttempts}. ₹${tx.amount.toLocaleString('en-IN')} recovered!`;
          } else {
            newStatus = nextAttempts >= 3 ? 'Escalated' : 'Recovering';
            outcomeDetails = `Retry attempt #${nextAttempts} failed. Updated retry counter.`;
          }
        }
        this.store.updateTransaction(tx.id, {
          previousAttempts: nextAttempts,
          recoveryAction: actionToTake,
          aiDiagnosis: aiResult.diagnosis,
          status: newStatus
        });
        break;
      }

      case 'Offer limited incentive': {
        const discount = Math.min(aiResult.discountPercent || 5, 10); // Hard clamp at 10%
        const discountedAmount = Math.round(tx.amount * (1 - (discount / 100)));
        // Simulate high conversion on incentive (85% success)
        const isSuccess = Math.random() < 0.85;
        if (isSuccess) {
          newStatus = 'Recovered';
          this.store.recordRecovery(tx, discountedAmount, 'Razorpay Incentive Checkout', discount);
          outcomeDetails = `Customer accepted ${discount}% discount. ₹${discountedAmount.toLocaleString('en-IN')} recovered (Original: ₹${tx.amount.toLocaleString('en-IN')})!`;
        } else {
          newStatus = 'Recovering';
          outcomeDetails = `Special ${discount}% incentive link sent to ${tx.customerEmail}. Awaiting customer payment.`;
        }
        this.store.updateTransaction(tx.id, {
          recoveryAction: actionToTake,
          aiDiagnosis: aiResult.diagnosis,
          discountApplied: discount,
          status: newStatus
        });
        break;
      }

      case 'Send payment reminder': {
        // Simulate reminder conversion (75% success)
        const isSuccess = Math.random() < 0.75;
        if (isSuccess) {
          newStatus = 'Recovered';
          this.store.recordRecovery(tx, tx.amount, 'Razorpay Reminder Link', 0);
          outcomeDetails = `Customer paid via WhatsApp reminder link! ₹${tx.amount.toLocaleString('en-IN')} recovered.`;
        } else {
          newStatus = 'Recovering';
          outcomeDetails = `Automated smart reminder sent to ${tx.customerPhone} with 1-click Razorpay payment link.`;
        }
        this.store.updateTransaction(tx.id, {
          recoveryAction: actionToTake,
          aiDiagnosis: aiResult.diagnosis,
          status: newStatus
        });
        break;
      }

      case 'Generate payment link': {
        // Simulate payment link resolution (80% success)
        const isSuccess = Math.random() < 0.80;
        if (isSuccess) {
          newStatus = 'Recovered';
          this.store.recordRecovery(tx, tx.amount, 'Razorpay Smart Payment Link (UPI/Cards)', 0);
          outcomeDetails = `Payment link settled by customer via UPI Autopay. ₹${tx.amount.toLocaleString('en-IN')} recovered!`;
        } else {
          newStatus = 'Recovering';
          outcomeDetails = `Razorpay Smart Link generated: https://rzp.io/i/plink_${tx.id.toLowerCase()}`;
        }
        this.store.updateTransaction(tx.id, {
          recoveryAction: actionToTake,
          aiDiagnosis: aiResult.diagnosis,
          status: newStatus
        });
        break;
      }

      case 'Escalate to human': {
        newStatus = 'Escalated';
        outcomeDetails = 'Escalation ticket #ESC-' + Date.now().toString().slice(-4) + ' dispatched to Collections & VIP Support Desk.';
        this.store.updateTransaction(tx.id, {
          recoveryAction: actionToTake,
          aiDiagnosis: aiResult.diagnosis,
          status: newStatus
        });
        this.store.logAudit({
          transactionId: tx.id,
          customerName: tx.customerName,
          action: 'HUMAN_ESCALATION_DISPATCHED',
          decision: 'Escalated to Human Agent',
          reason: 'Bounded rules limit or high fraud/complexity score.',
          ruleCheck: 'SLA Limit Enforced: Auto-recovery paused.',
          status: 'WARNING'
        });
        break;
      }

      case 'Stop recovery': {
        newStatus = 'Unrecoverable';
        outcomeDetails = 'Recovery permanently halted due to 7-day expiration SLA / customer opt-out.';
        this.store.updateTransaction(tx.id, {
          recoveryAction: actionToTake,
          aiDiagnosis: aiResult.diagnosis,
          status: newStatus
        });
        this.store.logAudit({
          transactionId: tx.id,
          customerName: tx.customerName,
          action: 'RECOVERY_STOPPED',
          decision: 'Stop Recovery (Unrecoverable)',
          reason: 'Transaction is beyond 7-day recovery boundary.',
          ruleCheck: 'TERMINATION_GUARDRAIL_APPLIED',
          status: 'INFO'
        });
        break;
      }
    }

    return {
      success: true,
      transactionId: tx.id,
      diagnosis: aiResult,
      actionTaken: actionToTake,
      status: newStatus,
      outcomeDetails: outcomeDetails
    };
  }
}

window.recoverAIAgent = new AIAgentEngine(window.recoverStore);

