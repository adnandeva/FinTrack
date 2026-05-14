import { useState, useEffect } from "react";
import axios from "axios";
import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts";

const API = "https://fintrack-backend-srjv.onrender.com/api/expenses";

const CATEGORIES = [
  "Food & Dining",
  "Transport",
  "Housing",
  "Healthcare",
  "Shopping",
  "Entertainment",
  "Education",
  "Utilities",
  "Subscriptions",
  "Other",
];

const TYPES = ["Need", "Want", "Savings"];

const TYPE_COLORS = {
  Need: "#f59e0b",
  Want: "#a78bfa",
  Savings: "#10b981",
};

const TYPE_BG = {
  Need: "rgba(245,158,11,0.08)",
  Want: "rgba(167,139,250,0.08)",
  Savings: "rgba(16,185,129,0.08)",
};

const TYPE_BORDER = {
  Need: "rgba(245,158,11,0.25)",
  Want: "rgba(167,139,250,0.25)",
  Savings: "rgba(16,185,129,0.25)",
};

const PIE_COLORS = ["#f59e0b", "#a78bfa", "#10b981"];

function formatCurrency(n) {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(n);
}

function formatDate(dateStr) {
  return new Date(dateStr).toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

const CustomTooltip = ({ active, payload }) => {
  if (active && payload && payload.length) {
    const d = payload[0];
    return (
      <div
        style={{
          background: "#1a1a2e",
          border: "1px solid #2a2a4a",
          borderRadius: 10,
          padding: "10px 16px",
          fontFamily: "'Sora', sans-serif",
        }}
      >
        <p style={{ color: d.payload.color, fontWeight: 600, margin: 0 }}>
          {d.name}
        </p>
        <p style={{ color: "#e2e8f0", margin: "4px 0 0", fontSize: 13 }}>
          {formatCurrency(d.value)} &nbsp;·&nbsp;{" "}
          <span style={{ fontFamily: "'Space Mono', monospace" }}>
            {d.payload.percent}%
          </span>
        </p>
      </div>
    );
  }
  return null;
};

export default function App() {
  const [expenses, setExpenses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [deletingId, setDeletingId] = useState(null);
  const [activeTab, setActiveTab] = useState("dashboard");
  const [form, setForm] = useState({
    title: "",
    amount: "",
    category: "",
    type: "",
    date: new Date().toISOString().split("T")[0],
  });

  useEffect(() => {
    fetchExpenses();
  }, []);

  async function fetchExpenses() {
    try {
      const { data } = await axios.get(API);
      setExpenses(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }

  async function handleAdd(e) {
    e.preventDefault();
    if (!form.title || !form.amount || !form.category || !form.type) return;
    setSubmitting(true);
    try {
      const { data } = await axios.post(API, {
        ...form,
        amount: parseFloat(form.amount),
      });
      setExpenses((prev) => [data, ...prev]);
      setForm({
        title: "",
        amount: "",
        category: "",
        type: "",
        date: new Date().toISOString().split("T")[0],
      });
    } catch (err) {
      console.error(err);
    } finally {
      setSubmitting(false);
    }
  }

  async function handleDelete(id) {
    setDeletingId(id);
    try {
      await axios.delete(`${API}/${id}`);
      setExpenses((prev) => prev.filter((e) => e._id !== id));
    } catch (err) {
      console.error(err);
    } finally {
      setDeletingId(null);
    }
  }

  // Calculations
  const total = expenses.reduce((s, e) => s + e.amount, 0);
  const needs = expenses
    .filter((e) => e.type === "Need")
    .reduce((s, e) => s + e.amount, 0);
  const wants = expenses
    .filter((e) => e.type === "Want")
    .reduce((s, e) => s + e.amount, 0);
  const savings = expenses
    .filter((e) => e.type === "Savings")
    .reduce((s, e) => s + e.amount, 0);

  const needsPct = total ? Math.round((needs / total) * 100) : 0;
  const wantsPct = total ? Math.round((wants / total) * 100) : 0;
  const savingsPct = total ? Math.round((savings / total) * 100) : 0;

  const pieData = [
    { name: "Needs", value: needs, percent: needsPct, color: "#f59e0b" },
    { name: "Wants", value: wants, percent: wantsPct, color: "#a78bfa" },
    { name: "Savings", value: savings, percent: savingsPct, color: "#10b981" },
  ].filter((d) => d.value > 0);

  const insights = [
    {
      label: "Needs",
      actual: needsPct,
      target: 50,
      color: "#f59e0b",
      icon: "🏠",
      ok: needsPct <= 50,
      msg:
        needsPct <= 50
          ? "Within the 50% target."
          : `${needsPct - 50}% over the 50% limit.`,
    },
    {
      label: "Wants",
      actual: wantsPct,
      target: 30,
      color: "#a78bfa",
      icon: "🛍️",
      ok: wantsPct <= 30,
      msg:
        wantsPct <= 30
          ? "Within the 30% target."
          : `${wantsPct - 30}% over the 30% limit.`,
    },
    {
      label: "Savings",
      actual: savingsPct,
      target: 20,
      color: "#10b981",
      icon: "💰",
      ok: savingsPct >= 20,
      msg:
        savingsPct >= 20
          ? "Hitting the 20% goal. Nice."
          : `${20 - savingsPct}% short of the 20% goal.`,
    },
  ];

  return (
    <div style={styles.root}>
      {/* Background noise texture */}
      <div style={styles.noiseBg} />

      {/* Header */}
      <header style={styles.header}>
        <div style={styles.headerInner}>
          <div style={styles.logo}>
            <span style={styles.logoMark}>₹</span>
            <span style={styles.logoText}>FinTrack</span>
          </div>
          <nav style={styles.nav}>
            {["dashboard", "add", "history"].map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                style={{
                  ...styles.navBtn,
                  ...(activeTab === tab ? styles.navBtnActive : {}),
                }}
              >
                {tab === "dashboard"
                  ? "Dashboard"
                  : tab === "add"
                  ? "+ Add"
                  : "History"}
              </button>
            ))}
          </nav>
        </div>
      </header>

      <main style={styles.main}>
        {/* ── DASHBOARD ── */}
        {activeTab === "dashboard" && (
          <div>
            <div style={styles.pageTitle}>
              <h1 style={styles.h1}>Overview</h1>
              <p style={styles.sub}>
                {expenses.length} transactions tracked
              </p>
            </div>

            {/* Stat cards */}
            <div style={styles.statsGrid}>
              <StatCard
                label="Total Spent"
                value={formatCurrency(total)}
                accent="#e2e8f0"
                icon="📊"
              />
              <StatCard
                label="Needs"
                value={formatCurrency(needs)}
                accent="#f59e0b"
                icon="🏠"
                pct={needsPct}
              />
              <StatCard
                label="Wants"
                value={formatCurrency(wants)}
                accent="#a78bfa"
                icon="🛍️"
                pct={wantsPct}
              />
              <StatCard
                label="Savings"
                value={formatCurrency(savings)}
                accent="#10b981"
                icon="💰"
                pct={savingsPct}
              />
            </div>

            {/* Charts + Insights */}
            <div style={styles.chartsRow}>
              {/* Pie Chart */}
              <div style={styles.card}>
                <h2 style={styles.cardTitle}>Breakdown</h2>
                {pieData.length === 0 ? (
                  <div style={styles.emptyChart}>No data yet.</div>
                ) : (
                  <ResponsiveContainer width="100%" height={260}>
                    <PieChart>
                      <Pie
                        data={pieData}
                        cx="50%"
                        cy="50%"
                        innerRadius={68}
                        outerRadius={100}
                        paddingAngle={3}
                        dataKey="value"
                        strokeWidth={0}
                      >
                        {pieData.map((entry, i) => (
                          <Cell
                            key={entry.name}
                            fill={PIE_COLORS[i % PIE_COLORS.length]}
                          />
                        ))}
                      </Pie>
                      <Tooltip content={<CustomTooltip />} />
                      <Legend
                        formatter={(val) => (
                          <span style={{ color: "#94a3b8", fontSize: 13 }}>
                            {val}
                          </span>
                        )}
                      />
                    </PieChart>
                  </ResponsiveContainer>
                )}
                {/* Center label */}
                {pieData.length > 0 && (
                  <p style={styles.pieCenter}>{formatCurrency(total)}</p>
                )}
              </div>

              {/* Insights */}
              <div style={styles.card}>
                <h2 style={styles.cardTitle}>50 / 30 / 20 Rule</h2>
                <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
                  {insights.map((ins) => (
                    <InsightRow key={ins.label} {...ins} />
                  ))}
                </div>
                <div style={styles.ruleNote}>
                  Needs ≤ 50% · Wants ≤ 30% · Savings ≥ 20%
                </div>
              </div>
            </div>

            {/* Recent transactions */}
            <div style={{ ...styles.card, marginTop: 24 }}>
              <div style={styles.cardHeader}>
                <h2 style={styles.cardTitle}>Recent Transactions</h2>
                <button
                  style={styles.viewAll}
                  onClick={() => setActiveTab("history")}
                >
                  View all →
                </button>
              </div>
              {expenses.length === 0 ? (
                <EmptyState text="No expenses yet. Start tracking." />
              ) : (
                <div style={styles.expenseList}>
                  {expenses.slice(0, 5).map((exp) => (
                    <ExpenseRow
                      key={exp._id}
                      exp={exp}
                      onDelete={handleDelete}
                      deleting={deletingId === exp._id}
                    />
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {/* ── ADD EXPENSE ── */}
        {activeTab === "add" && (
          <div style={styles.addWrap}>
            <div style={styles.pageTitle}>
              <h1 style={styles.h1}>Add Expense</h1>
              <p style={styles.sub}>Log a new transaction</p>
            </div>
            <div style={{ ...styles.card, maxWidth: 540 }}>
              <form onSubmit={handleAdd} style={styles.form}>
                <FormField label="Title">
                  <input
                    style={styles.input}
                    placeholder="e.g. Swiggy lunch"
                    value={form.title}
                    onChange={(e) =>
                      setForm((f) => ({ ...f, title: e.target.value }))
                    }
                    required
                  />
                </FormField>

                <FormField label="Amount (₹)">
                  <input
                    style={styles.input}
                    type="number"
                    placeholder="0"
                    min="1"
                    value={form.amount}
                    onChange={(e) =>
                      setForm((f) => ({ ...f, amount: e.target.value }))
                    }
                    required
                  />
                </FormField>

                <FormField label="Category">
                  <select
                    style={styles.input}
                    value={form.category}
                    onChange={(e) =>
                      setForm((f) => ({ ...f, category: e.target.value }))
                    }
                    required
                  >
                    <option value="">Select category</option>
                    {CATEGORIES.map((c) => (
                      <option key={c} value={c}>
                        {c}
                      </option>
                    ))}
                  </select>
                </FormField>

                <FormField label="Type">
                  <div style={styles.typeRow}>
                    {TYPES.map((t) => (
                      <TypeChip
                        key={t}
                        label={t}
                        selected={form.type === t}
                        onClick={() => setForm((f) => ({ ...f, type: t }))}
                      />
                    ))}
                  </div>
                </FormField>

                <FormField label="Date">
                  <input
                    style={styles.input}
                    type="date"
                    value={form.date}
                    onChange={(e) =>
                      setForm((f) => ({ ...f, date: e.target.value }))
                    }
                    required
                  />
                </FormField>

                <button
                  type="submit"
                  style={{
                    ...styles.submitBtn,
                    opacity: submitting ? 0.6 : 1,
                  }}
                  disabled={submitting}
                >
                  {submitting ? "Adding…" : "Add Expense"}
                </button>
              </form>
            </div>
          </div>
        )}

        {/* ── HISTORY ── */}
        {activeTab === "history" && (
          <div>
            <div style={styles.pageTitle}>
              <h1 style={styles.h1}>History</h1>
              <p style={styles.sub}>{expenses.length} total transactions</p>
            </div>
            <div style={styles.card}>
              {loading ? (
                <div style={styles.loading}>Loading…</div>
              ) : expenses.length === 0 ? (
                <EmptyState text="Nothing here yet." />
              ) : (
                <div style={styles.expenseList}>
                  {expenses.map((exp) => (
                    <ExpenseRow
                      key={exp._id}
                      exp={exp}
                      onDelete={handleDelete}
                      deleting={deletingId === exp._id}
                    />
                  ))}
                </div>
              )}
            </div>
          </div>
        )}
      </main>
    </div>
  );
}

// ── Sub-components ──

function StatCard({ label, value, accent, icon, pct }) {
  return (
    <div style={{ ...styles.statCard, borderColor: `${accent}22` }}>
      <div style={styles.statTop}>
        <span style={styles.statIcon}>{icon}</span>
        {pct !== undefined && (
          <span style={{ ...styles.statPct, color: accent }}>
            {pct}%
          </span>
        )}
      </div>
      <div style={{ ...styles.statValue, color: accent }}>{value}</div>
      <div style={styles.statLabel}>{label}</div>
    </div>
  );
}

function InsightRow({ label, actual, target, color, icon, ok, msg }) {
  const barPct = Math.min((actual / Math.max(target * 1.5, actual + 10)) * 100, 100);
  return (
    <div>
      <div style={styles.insightHeader}>
        <span style={{ color }}>
          {icon} {label}
        </span>
        <span style={{ fontFamily: "'Space Mono', monospace", fontSize: 13, color }}>
          {actual}% / {target}%
        </span>
      </div>
      <div style={styles.barBg}>
        <div
          style={{
            ...styles.barFill,
            width: `${barPct}%`,
            background: ok ? color : "#ef4444",
          }}
        />
        {/* Target marker */}
        <div
          style={{
            ...styles.targetMarker,
            left: `${(target / Math.max(target * 1.5, actual + 10)) * 100}%`,
          }}
        />
      </div>
      <p
        style={{
          ...styles.insightMsg,
          color: ok ? "#64748b" : "#ef4444",
        }}
      >
        {ok ? "✓" : "⚠"} {msg}
      </p>
    </div>
  );
}

function ExpenseRow({ exp, onDelete, deleting }) {
  return (
    <div
      style={{
        ...styles.expRow,
        opacity: deleting ? 0.4 : 1,
        transition: "opacity 0.2s",
      }}
    >
      <div style={styles.expLeft}>
        <div
          style={{
            ...styles.expTypeDot,
            background: TYPE_BG[exp.type],
            border: `1px solid ${TYPE_BORDER[exp.type]}`,
          }}
        >
          <span style={{ color: TYPE_COLORS[exp.type], fontSize: 11, fontWeight: 600 }}>
            {exp.type}
          </span>
        </div>
        <div>
          <div style={styles.expTitle}>{exp.title}</div>
          <div style={styles.expMeta}>
            {exp.category} · {formatDate(exp.date)}
          </div>
        </div>
      </div>
      <div style={styles.expRight}>
        <span style={styles.expAmount}>{formatCurrency(exp.amount)}</span>
        <button
          style={styles.deleteBtn}
          onClick={() => onDelete(exp._id)}
          disabled={deleting}
          title="Delete"
        >
          ✕
        </button>
      </div>
    </div>
  );
}

function FormField({ label, children }) {
  return (
    <div style={styles.formField}>
      <label style={styles.label}>{label}</label>
      {children}
    </div>
  );
}

function TypeChip({ label, selected, onClick }) {
  return (
    <button
      type="button"
      onClick={onClick}
      style={{
        ...styles.typeChip,
        background: selected ? TYPE_BG[label] : "transparent",
        border: `1px solid ${selected ? TYPE_BORDER[label] : "#2a2a4a"}`,
        color: selected ? TYPE_COLORS[label] : "#64748b",
      }}
    >
      {label}
    </button>
  );
}

function EmptyState({ text }) {
  return (
    <div style={styles.empty}>
      <span style={{ fontSize: 32 }}>🪙</span>
      <p style={{ color: "#64748b", marginTop: 8 }}>{text}</p>
    </div>
  );
}

// ── Styles ──

const styles = {
  root: {
    minHeight: "100vh",
    background: "#080810",
    color: "#e2e8f0",
    fontFamily: "'Sora', sans-serif",
    position: "relative",
  },
  noiseBg: {
    position: "fixed",
    inset: 0,
    backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)' opacity='0.04'/%3E%3C/svg%3E")`,
    pointerEvents: "none",
    zIndex: 0,
  },
  header: {
    borderBottom: "1px solid #1a1a2e",
    background: "rgba(8,8,16,0.9)",
    backdropFilter: "blur(12px)",
    position: "sticky",
    top: 0,
    zIndex: 100,
  },
  headerInner: {
    maxWidth: 1100,
    margin: "0 auto",
    padding: "0 24px",
    height: 60,
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
  },
  logo: {
    display: "flex",
    alignItems: "center",
    gap: 8,
  },
  logoMark: {
    width: 32,
    height: 32,
    background: "linear-gradient(135deg, #10b981, #059669)",
    borderRadius: 8,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontSize: 16,
    fontWeight: 700,
    color: "#fff",
    fontFamily: "'Space Mono', monospace",
  },
  logoText: {
    fontSize: 18,
    fontWeight: 700,
    letterSpacing: "-0.02em",
    color: "#f1f5f9",
  },
  nav: {
    display: "flex",
    gap: 4,
  },
  navBtn: {
    background: "transparent",
    border: "none",
    color: "#64748b",
    fontSize: 14,
    fontFamily: "'Sora', sans-serif",
    fontWeight: 500,
    padding: "6px 14px",
    borderRadius: 8,
    cursor: "pointer",
    transition: "all 0.15s",
  },
  navBtnActive: {
    background: "#1a1a2e",
    color: "#e2e8f0",
  },
  main: {
    maxWidth: 1100,
    margin: "0 auto",
    padding: "32px 24px 64px",
    position: "relative",
    zIndex: 1,
  },
  pageTitle: {
    marginBottom: 28,
  },
  h1: {
    fontSize: 28,
    fontWeight: 700,
    letterSpacing: "-0.03em",
    color: "#f1f5f9",
    margin: 0,
  },
  sub: {
    color: "#475569",
    fontSize: 14,
    margin: "4px 0 0",
    fontFamily: "'Space Mono', monospace",
  },
  statsGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
    gap: 16,
    marginBottom: 24,
  },
  statCard: {
    background: "#0e0e1a",
    border: "1px solid",
    borderRadius: 16,
    padding: "20px 24px",
  },
  statTop: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
  },
  statIcon: {
    fontSize: 20,
  },
  statPct: {
    fontFamily: "'Space Mono', monospace",
    fontSize: 13,
    fontWeight: 700,
  },
  statValue: {
    fontFamily: "'Space Mono', monospace",
    fontSize: 22,
    fontWeight: 700,
    letterSpacing: "-0.02em",
    marginBottom: 4,
  },
  statLabel: {
    color: "#475569",
    fontSize: 13,
    fontWeight: 500,
  },
  chartsRow: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))",
    gap: 16,
  },
  card: {
    background: "#0e0e1a",
    border: "1px solid #1a1a2e",
    borderRadius: 16,
    padding: "24px",
    position: "relative",
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: 600,
    color: "#cbd5e1",
    margin: "0 0 20px",
    letterSpacing: "-0.01em",
  },
  cardHeader: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 20,
  },
  viewAll: {
    background: "transparent",
    border: "none",
    color: "#10b981",
    fontSize: 13,
    fontFamily: "'Sora', sans-serif",
    cursor: "pointer",
  },
  emptyChart: {
    height: 260,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    color: "#334155",
    fontFamily: "'Space Mono', monospace",
    fontSize: 13,
  },
  pieCenter: {
    position: "absolute",
    top: "50%",
    left: "50%",
    transform: "translate(-50%, -20px)",
    fontFamily: "'Space Mono', monospace",
    fontSize: 14,
    fontWeight: 700,
    color: "#94a3b8",
    pointerEvents: "none",
    margin: 0,
    textAlign: "center",
    whiteSpace: "nowrap",
  },
  insightHeader: {
    display: "flex",
    justifyContent: "space-between",
    fontSize: 14,
    fontWeight: 600,
    marginBottom: 8,
  },
  barBg: {
    height: 6,
    background: "#1a1a2e",
    borderRadius: 99,
    position: "relative",
    overflow: "visible",
  },
  barFill: {
    height: "100%",
    borderRadius: 99,
    transition: "width 0.6s cubic-bezier(0.4, 0, 0.2, 1)",
  },
  targetMarker: {
    position: "absolute",
    top: -3,
    width: 2,
    height: 12,
    background: "#334155",
    borderRadius: 1,
  },
  insightMsg: {
    fontSize: 12,
    marginTop: 6,
    margin: "6px 0 0",
  },
  ruleNote: {
    marginTop: 24,
    paddingTop: 16,
    borderTop: "1px solid #1a1a2e",
    fontSize: 12,
    color: "#334155",
    fontFamily: "'Space Mono', monospace",
    textAlign: "center",
  },
  expenseList: {
    display: "flex",
    flexDirection: "column",
    gap: 4,
  },
  expRow: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    padding: "12px 0",
    borderBottom: "1px solid #0f0f1f",
  },
  expLeft: {
    display: "flex",
    alignItems: "center",
    gap: 12,
    minWidth: 0,
  },
  expTypeDot: {
    padding: "3px 8px",
    borderRadius: 6,
    flexShrink: 0,
  },
  expTitle: {
    fontSize: 14,
    fontWeight: 500,
    color: "#cbd5e1",
    marginBottom: 2,
  },
  expMeta: {
    fontSize: 12,
    color: "#475569",
  },
  expRight: {
    display: "flex",
    alignItems: "center",
    gap: 12,
    flexShrink: 0,
  },
  expAmount: {
    fontFamily: "'Space Mono', monospace",
    fontSize: 14,
    fontWeight: 700,
    color: "#e2e8f0",
  },
  deleteBtn: {
    background: "transparent",
    border: "1px solid #1e2035",
    color: "#475569",
    width: 28,
    height: 28,
    borderRadius: 6,
    cursor: "pointer",
    fontSize: 11,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    transition: "all 0.15s",
  },
  addWrap: {
    maxWidth: 600,
  },
  form: {
    display: "flex",
    flexDirection: "column",
    gap: 20,
  },
  formField: {
    display: "flex",
    flexDirection: "column",
    gap: 8,
  },
  label: {
    fontSize: 13,
    fontWeight: 500,
    color: "#64748b",
    letterSpacing: "0.02em",
  },
  input: {
    background: "#080810",
    border: "1px solid #1a1a2e",
    borderRadius: 10,
    padding: "12px 14px",
    color: "#e2e8f0",
    fontSize: 14,
    fontFamily: "'Sora', sans-serif",
    outline: "none",
    width: "100%",
    boxSizing: "border-box",
    transition: "border-color 0.15s",
  },
  typeRow: {
    display: "flex",
    gap: 10,
  },
  typeChip: {
    flex: 1,
    padding: "10px",
    borderRadius: 10,
    cursor: "pointer",
    fontSize: 13,
    fontWeight: 600,
    fontFamily: "'Sora', sans-serif",
    transition: "all 0.15s",
  },
  submitBtn: {
    background: "linear-gradient(135deg, #10b981, #059669)",
    border: "none",
    borderRadius: 12,
    color: "#fff",
    fontSize: 15,
    fontWeight: 700,
    fontFamily: "'Sora', sans-serif",
    padding: "14px",
    cursor: "pointer",
    letterSpacing: "-0.01em",
    transition: "opacity 0.2s",
    marginTop: 4,
  },
  empty: {
    textAlign: "center",
    padding: "48px 0",
  },
  loading: {
    textAlign: "center",
    padding: "48px 0",
    color: "#334155",
    fontFamily: "'Space Mono', monospace",
  },
};