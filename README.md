# RecoverAI – AI-Powered Autonomous Revenue Recovery Agent

RecoverAI is a modern, fintech-grade revenue recovery web application built for hackathon demonstration. It detects lost revenue (failed payments, abandoned checkouts, overdue invoices), diagnoses root causes using **Groq AI (LLaMA 3.3 70B)**, and executes autonomous, bounded recovery actions via **Razorpay Test Mode**.

---

## 🌟 Key Highlights & Hackathon Demo Features

### 1. **100-Transaction Demo Simulation (₹5,00,000 Portfolio)**
* **Baseline Risk**: 100 failed transactions across consumer checkouts, B2B invoices, and subscription mandates totaling exactly **₹5,00,000**.
* **Live Batch Pipeline**: Run the agent at normal, 5x, or ultra-fast batch speeds.
* **Real-Time Recovery Ticker**:
  $$\text{₹5,00,000 Revenue at Risk} \longrightarrow \text{AI Bounded Actions} \longrightarrow \text{₹X Recovered} \longrightarrow \text{Remaining Risk} \longrightarrow \text{Z\% Recovery Rate}$$
* **Simulated/Test Labeling**: Clearly annotated compliance headers distinguishing test portfolio simulations from live funds.

### 2. **Bounded Recovery Guardrails**
RecoverAI operates within strict, automated boundary policies:
* **Max 3 Retries**: Halts automated gateway retries after 3 failures to preserve customer trust and fraud scores.
* **Max 2 Reminders**: Prevents communication spam.
* **Max 7-Day Window**: Stops autonomous recovery after 7 days and classifies transaction as unrecoverable / manual collections.
* **Max 10% Incentive Cap**: Strict discount limit to protect business unit economics.
* **Immediate Stop Condition**: Any successful Razorpay settlement immediately halts all subsequent recovery attempts.
* **Human Escalation**: High-risk or boundary-exceeding transactions are automatically routed to human operators.

### 3. **AI Diagnosis & Reason Engine (Groq LLaMA 3.3)**
* Analyzes payment telemetry, gateway error codes, customer tier, days overdue, and attempt count.
* Prescribes one of 6 discrete actions:
  1. `Retry payment`
  2. `Send payment reminder`
  3. `Generate payment link`
  4. `Offer limited incentive`
  5. `Escalate to human`
  6. `Stop recovery`

### 4. **Razorpay Test Mode Integration**
* Real **Razorpay Checkout SDK Modal** triggering test transactions.
* Order creation API (`/api/razorpay/create-order`), payment signature verification (`/api/razorpay/verify-payment`), and smart payment link generation.
* Real-time LocalStorage state synchronization and audit trail generation.

### 5. **Interactive Visual Analytics (Chart.js)**
* 7-Day Revenue Trajectory Line Graph
* Pipeline Status Doughnut
* Risk Severity Breakdown
* Root Failure Causes Polar Chart
* AI Action Efficiency Comparison

---

## 🚀 Quick Start Guide

### Prerequisites
* [Node.js](https://nodejs.org/) (v18 or higher recommended)
* NPM

### 1. Install Dependencies
```bash
npm install
```

### 2. Environment Configuration
The `.env` file is pre-configured with the Groq API key and Razorpay Test credentials:
```env
PORT=3000
GROQ_API_KEY=your_groq_api_key_here
RAZORPAY_KEY_ID=your_razorpay_key_id_here
RAZORPAY_KEY_SECRET=your_razorpay_key_secret_here
```

### 3. Start the Server
```bash
npm start
```
Open your browser at: **`http://localhost:3000`**

---

## 📂 Project Structure

```
RecoverAI/
├── .env                       # Environment credentials
├── .env.example               # Template environment file
├── package.json               # Node dependencies & start scripts
├── render.yaml                # Render deployment configuration
├── README.md                  # Documentation & Pitch guide
├── server.js                  # Express backend (Groq AI & Razorpay endpoints)
└── public/                    # Frontend assets
    ├── index.html             # Main dashboard UI shell
    ├── css/
    │   └── styles.css         # Fintech dark theme styling
    └── js/
        ├── store.js           # LocalStorage engine & 100-txn ₹5L seeder
        ├── ai-agent.js        # Groq AI diagnosis & guardrail logic
        ├── razorpay-integration.js # Razorpay SDK checkout integration
        ├── charts.js          # Chart.js analytics graphs
        ├── demo-simulation.js # 100-txn batch recovery simulation runner
        └── app.js             # View router & interactive UI controllers
```

---

## 🌐 Deploy to Render

1. Push this repository to GitHub / GitLab.
2. Log into [Render](https://render.com/) and click **New + Web Service**.
3. Connect your repository.
4. Render will automatically detect `render.yaml` or use:
   - **Environment**: Node
   - **Build Command**: `npm install`
   - **Start Command**: `npm start`
5. Add the Environment Variables:
   - `GROQ_API_KEY`
   - `RAZORPAY_KEY_ID`
   - `RAZORPAY_KEY_SECRET`
6. Deploy!

