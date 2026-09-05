/**
 * RecoverAI - Store & State Management Engine
 * Handles LocalStorage persistence, seed generation for 100 transactions totaling ₹5,00,000,
 * and immutable audit logging.
 */

const STORAGE_KEY = 'recoverai_state_v2';

// 100 Exact Transactions Generator summing to ₹5,00,000
function generate100DemoTransactions() {
  const customerNames = [
    "Aarav Sharma", "Priya Patel", "Rohan Mehta", "Ananya Iyer", "Vikram Malhotra",
    "Sneha Reddy", "Aditya Verma", "Kavita Rao", "Karan Singhania", "Pooja Hegde",
    "Rahul Deshmukh", "Neha Gupta", "Arjun Kapoor", "Meera Nambiar", "Siddharth Joshi",
    "Tanvi Kulkarni", "Deepak Chopra", "Ritu Sethi", "Gaurav Sen", "Swati Bhatt",
    "Manish Agarwal", "Divya Menon", "Amitabh Das", "Radhika Merchant", "Varun Dhawan",
    "Nisha Nair", "Sanjay Dutt", "Alia Mukherjee", "Nikhil Kamath", "Tara Sutaria",
    "Kunal Shah", "Bhavish Aggarwal", "Upasana Kamineni", "Harsh Jain", "Vineeta Singh",
    "Peyush Bansal", "Namita Thapar", "Aman Gupta", "Ritesh Agarwal", "Ghazal Alagh",
    "Vijay Shekhar", "Deepinder Goyal", "Falguni Nayar", "Sridhar Vembu", "Byju Raveendran",
    "Ashneer Grover", "Anupam Mittal", "Kabeer Biswas", "Virender Sehwag", "Mithali Raj",
    "Rohit Sundaram", "Shreya Ghoshal", "Ayushmann Roy", "Kriti Sanon", "Kartik Aaryan",
    "Kiara Advani", "Ranbir Kapoor", "Shraddha Kapoor", "Ishaan Khatter", "Janhvi Kapoor",
    "Sara Ali Khan", "Vicky Kaushal", "Katrina Kaif", "Ranveer Singh", "Deepika Padukone",
    "Virat Kohli", "Anushka Sharma", "MS Dhoni", "Sakshi Dhoni", "Hardik Pandya",
    "KL Rahul", "Athiya Shetty", "Jasprit Bumrah", "Sanjana Ganesan", "Rishabh Pant",
    "Shubman Gill", "Smriti Mandhana", "Harmanpreet Kaur", "Neeraj Chopra", "PV Sindhu",
    "Saina Nehwal", "Mary Kom", "Abhinav Bindra", "Viswanathan Anand", "Praggnanandhaa",
    "Gukesh D", "Vidit Gujrathi", "Harika Dronavalli", "Tania Sachdev", "Sunil Chhetri",
    "Bhaichung Bhutia", "Manpreet Singh", "Rani Rampal", "Sania Mirza", "Rohan Bopanna",
    "Leander Paes", "Mahesh Bhupathi", "Pankaj Advani", "Geeta Phogat", "Babita Phogat"
  ];

  const failureCategories = [
    { reason: "Insufficient balance / Account limit reached", risk: "Medium", type: "Insufficient Funds" },
    { reason: "Bank 3DS OTP expired or timed out", risk: "Low", type: "Network / Timeout" },
    { reason: "Card expired or invalid CVV provided", risk: "Medium", type: "Card Invalid" },
    { reason: "Abandoned checkout at final payment step", risk: "High", type: "Abandoned Checkout" },
    { reason: "B2B Net-30 invoice overdue > 5 days", risk: "High", type: "Overdue Invoice" },
    { reason: "Bank security gateway temporary downtime", risk: "Low", type: "Gateway Timeout" },
    { reason: "Do Not Honor - Issuer bank restriction", risk: "Medium", type: "Bank Decline" },
    { reason: "Daily transaction velocity limit exceeded", risk: "Low", type: "Velocity Limit" },
    { reason: "Recurring mandate authorization failed", risk: "Medium", type: "Mandate Failure" },
    { reason: "International card currency mismatch", risk: "Low", type: "Currency Error" }
  ];

  const channels = ["Credit Card", "UPI Autopay", "NetBanking", "Debit Card", "Razorpay Mandate", "Direct Invoice"];
  const tiers = ["VIP Enterprise", "Growth Tier", "Startup Tier", "Standard Retail", "Loyal Customer"];

  // Base structured amounts that sum EXACTLY to 500,000:
  // 10 high-value (10 * 15,000 = 150,000)
  // 20 mid-high (20 * 6,500 = 130,000)
  // 30 mid (30 * 3,500 = 105,000)
  // 25 small (25 * 2,200 = 55,000)
  // 15 entry (15 * 4,000 = 60,000)
  // Total = 100 items, Sum = 500,000
  const amounts = [];
  
  // High value (₹12,000 - ₹18,000)
  const highDeltas = [-2000, 1500, -1000, 3000, -2500, 1000, -500, 2000, -1500, 0];
  for (let i = 0; i < 10; i++) {
    amounts.push(15000 + highDeltas[i]);
  }

  // Mid-High (₹5,000 - ₹8,000)
  const midHighDeltas = [500, -500, 1000, -1000, 800, -800, 400, -400, 600, -600,
                         700, -700, 300, -300, 900, -900, 200, -200, 100, -100];
  for (let i = 0; i < 20; i++) {
    amounts.push(6500 + midHighDeltas[i]);
  }

  // Mid (₹2,500 - ₹4,500)
  const midDeltas = [200, -200, 400, -400, 300, -300, 500, -500, 100, -100,
                     250, -250, 350, -350, 150, -150, 450, -450, 50, -50,
                     300, -300, 200, -200, 100, -100, 400, -400, 0, 0];
  for (let i = 0; i < 30; i++) {
    amounts.push(3500 + midDeltas[i]);
  }

  // Small (₹1,500 - ₹2,900)
  const smallDeltas = [100, -100, 200, -200, 300, -300, 150, -150, 250, -250,
                       50, -50, 180, -180, 220, -220, 70, -70, 90, -90,
                       120, -120, 140, -140, 0];
  for (let i = 0; i < 25; i++) {
    amounts.push(2200 + smallDeltas[i]);
  }

  // Entry (₹3,000 - ₹5,000)
  const entryDeltas = [200, -200, 400, -400, 600, -600, 300, -300, 500, -500,
                       100, -100, 250, -250, 0];
  for (let i = 0; i < 15; i++) {
    amounts.push(4000 + entryDeltas[i]);
  }

  // Double check sum
  const sum = amounts.reduce((a, b) => a + b, 0);
  if (sum !== 500000) {
    amounts[amounts.length - 1] += (500000 - sum);
  }

  const transactions = [];
  const now = Date.now();

  for (let i = 0; i < 100; i++) {
    const cat = failureCategories[i % failureCategories.length];
    const daysOverdue = (i % 8); // 0 to 7 days
    const prevAttempts = (i % 4); // 0 to 3 attempts
    const customer = customerNames[i];
    const amount = amounts[i];
    const channel = channels[i % channels.length];
    const tier = tiers[i % tiers.length];

    transactions.push({
      id: `TXN-REC-${1000 + i + 1}`,
      customerName: customer,
      customerEmail: `${customer.toLowerCase().replace(/\s+/g, '.')}@example.com`,
      customerPhone: `+91 98${Math.floor(10000000 + Math.random() * 90000000)}`,
      amount: amount,
      originalAmount: amount,
      failureReason: cat.reason,
      failureType: cat.type,
      riskLevel: cat.risk,
      channel: channel,
      customerHistory: tier,
      previousAttempts: prevAttempts,
      daysOverdue: daysOverdue,
      status: 'At Risk', // 'At Risk', 'Diagnosed', 'Recovering', 'Recovered', 'Escalated', 'Unrecoverable'
      recoveryAction: null,
      recoveredAmount: 0,
      discountApplied: 0,
      aiDiagnosis: null,
      aiConfidence: null,
      aiExplanation: null,
      guardrailStatus: 'Compliant',
      createdAt: new Date(now - (daysOverdue * 86400000) - (i * 3600000)).toISOString(),
      updatedAt: new Date(now - (i * 1800000)).toISOString()
    });
  }

  return transactions;
}

class Store {
  constructor() {
    this.state = this.loadState();
  }

  loadState() {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) {
        const parsed = JSON.parse(raw);
        if (parsed && Array.isArray(parsed.transactions) && parsed.transactions.length > 0) {
          return parsed;
        }
      }
    } catch (e) {
      console.warn("Error reading localStorage, initializing fresh state:", e);
    }
    return this.getInitialState();
  }

  getInitialState() {
    const initialTransactions = generate100DemoTransactions();
    const state = {
      transactions: initialTransactions,
      auditLogs: [
        {
          id: `AUD-${Date.now()}-001`,
          timestamp: new Date().toISOString(),
          transactionId: "SYSTEM",
          customerName: "RecoverAI Engine",
          action: "SYSTEM_INITIALIZATION",
          decision: "Pre-seeded 100 At-Risk Transactions",
          reason: "Initialized standard demonstration portfolio valued at ₹5,00,000.",
          ruleCheck: "Bounded Rules Engine Armed (Max 3 retries, Max 2 reminders, Max 7 days, Max 10% discount)",
          status: "SUCCESS"
        }
      ],
      recoveryEvents: [],
      boundedRules: {
        maxRetries: 3,
        maxReminders: 2,
        maxRecoveryDays: 7,
        maxIncentivePercent: 10
      },
      lastReset: new Date().toISOString()
    };
    this.saveState(state);
    return state;
  }

  saveState(stateToSave) {
    const s = stateToSave || this.state;
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(s));
    } catch (e) {
      console.error("Error saving state to localStorage:", e);
    }
  }

  resetDemo() {
    const fresh = this.getInitialState();
    this.state = fresh;
    this.saveState(fresh);
    return fresh;
  }

  getTransactions() {
    return this.state.transactions || [];
  }

  getTransactionById(id) {
    return (this.state.transactions || []).find(t => t.id === id);
  }

  updateTransaction(id, updates) {
    const index = this.state.transactions.findIndex(t => t.id === id);
    if (index !== -1) {
      this.state.transactions[index] = {
        ...this.state.transactions[index],
        ...updates,
        updatedAt: new Date().toISOString()
      };
      this.saveState();
      return this.state.transactions[index];
    }
    return null;
  }

  logAudit(entry) {
    const log = {
      id: `AUD-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
      timestamp: new Date().toISOString(),
      transactionId: entry.transactionId || 'UNKNOWN',
      customerName: entry.customerName || 'N/A',
      action: entry.action || 'AI_DIAGNOSIS',
      decision: entry.decision || 'N/A',
      reason: entry.reason || 'Automated policy evaluation',
      ruleCheck: entry.ruleCheck || 'Compliant with Bounded Recovery Constraints',
      status: entry.status || 'INFO',
      details: entry.details || null
    };

    if (!Array.isArray(this.state.auditLogs)) {
      this.state.auditLogs = [];
    }
    this.state.auditLogs.unshift(log); // newest first
    // Cap at 500 logs to preserve storage
    if (this.state.auditLogs.length > 500) {
      this.state.auditLogs = this.state.auditLogs.slice(0, 500);
    }
    this.saveState();
    return log;
  }

  recordRecovery(tx, amountRecovered, paymentMethod = 'Razorpay Test Gateway', discount = 0) {
    const event = {
      id: `REC-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
      timestamp: new Date().toISOString(),
      transactionId: tx.id,
      customerName: tx.customerName,
      customerEmail: tx.customerEmail,
      originalAmount: tx.originalAmount || tx.amount,
      recoveredAmount: amountRecovered,
      discountApplied: discount,
      paymentMethod: paymentMethod,
      actionTaken: tx.recoveryAction || 'AI Autonomous Recovery',
      failureReason: tx.failureReason,
      status: 'RECOVERED'
    };

    if (!Array.isArray(this.state.recoveryEvents)) {
      this.state.recoveryEvents = [];
    }
    this.state.recoveryEvents.unshift(event);

    this.updateTransaction(tx.id, {
      status: 'Recovered',
      recoveredAmount: amountRecovered,
      discountApplied: discount,
      recoveredAt: new Date().toISOString()
    });

    this.logAudit({
      transactionId: tx.id,
      customerName: tx.customerName,
      action: 'REVENUE_RECOVERED',
      decision: `Recovered ₹${amountRecovered.toLocaleString('en-IN')}`,
      reason: `Settled via ${paymentMethod}. Discount applied: ${discount}%.`,
      ruleCheck: 'STOP_CONDITION_MET: Recovery workflow stopped immediately.',
      status: 'SUCCESS'
    });

    this.saveState();
    return event;
  }

  getAuditLogs() {
    return this.state.auditLogs || [];
  }

  getRecoveryEvents() {
    return this.state.recoveryEvents || [];
  }

  getMetrics() {
    const txs = this.state.transactions || [];
    const totalDemoRisk = txs.reduce((sum, t) => sum + Number(t.originalAmount || t.amount), 0);
    const totalRecovered = txs.reduce((sum, t) => sum + Number(t.recoveredAmount || 0), 0);
    const recoveredCount = txs.filter(t => t.status === 'Recovered').length;
    const atRiskCount = txs.filter(t => t.status === 'At Risk').length;
    const recoveringCount = txs.filter(t => t.status === 'Recovering' || t.status === 'Diagnosed').length;
    const escalatedCount = txs.filter(t => t.status === 'Escalated').length;
    const unrecoverableCount = txs.filter(t => t.status === 'Unrecoverable').length;
    const remainingRisk = txs
      .filter(t => t.status !== 'Recovered')
      .reduce((sum, t) => sum + Number(t.originalAmount || t.amount), 0);

    const recoveryRate = totalDemoRisk > 0 ? (totalRecovered / totalDemoRisk) * 100 : 0;
    const totalAttempts = txs.reduce((sum, t) => sum + Number(t.previousAttempts || 0), 0);

    return {
      totalDemoRisk,
      totalRecovered,
      remainingRisk,
      recoveryRate: Number(recoveryRate.toFixed(1)),
      totalCount: txs.length,
      recoveredCount,
      atRiskCount,
      recoveringCount,
      escalatedCount,
      unrecoverableCount,
      totalAttempts
    };
  }
}

// Global store instance
window.recoverStore = new Store();

