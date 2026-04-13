"use client";

import { useState, useCallback } from "react";
import { Github, Activity, AlertTriangle, CheckCircle, Info, Loader2, ExternalLink } from "lucide-react";

// ── Types ──────────────────────────────────────────────────────────────────

interface BorrowerInputs {
  loan_amount: number;
  income: number;
  credit_score: number;
  employment_years: number;
  debt_to_income: number;
  loan_purpose: string;
}

interface RiskResult {
  risk_label: "low" | "medium" | "high";
  default_probability: number;
  confidence: number;
}

// ── Constants ──────────────────────────────────────────────────────────────

const LOAN_PURPOSES = [
  { value: "mortgage",  label: "Mortgage" },
  { value: "personal",  label: "Personal Loan" },
  { value: "auto",      label: "Auto Loan" },
  { value: "education", label: "Education" },
  { value: "business",  label: "Business" },
];

const DEFAULTS: BorrowerInputs = {
  loan_amount: 25000,
  income: 65000,
  credit_score: 680,
  employment_years: 4,
  debt_to_income: 0.32,
  loan_purpose: "personal",
};

// ── Helper components ──────────────────────────────────────────────────────

function SliderField({
  label,
  value,
  min,
  max,
  step,
  format,
  onChange,
}: {
  label: string;
  value: number;
  min: number;
  max: number;
  step: number;
  format: (v: number) => string;
  onChange: (v: number) => void;
}) {
  const pct = ((value - min) / (max - min)) * 100;
  return (
    <div className="space-y-2">
      <div className="flex justify-between items-baseline">
        <label className="text-xs font-medium text-zinc-400 uppercase tracking-wide">{label}</label>
        <span className="text-sm font-mono text-amber-400">{format(value)}</span>
      </div>
      <div className="relative">
        <input
          type="range"
          min={min}
          max={max}
          step={step}
          value={value}
          onChange={(e) => onChange(Number(e.target.value))}
          className="w-full h-1.5 rounded-full appearance-none cursor-pointer bg-zinc-700"
          style={{
            background: `linear-gradient(to right, rgb(245,158,11) 0%, rgb(245,158,11) ${pct}%, rgb(63,63,70) ${pct}%, rgb(63,63,70) 100%)`,
          }}
        />
      </div>
    </div>
  );
}

function RiskGauge({ probability }: { probability: number }) {
  // Draw a semi-circle gauge from 0 to 180 degrees
  const radius = 70;
  const cx = 90;
  const cy = 90;
  const startAngle = 180; // left
  const endAngle = 0;     // right
  const angle = 180 - probability * 180; // needle angle in degrees

  const toRad = (deg: number) => (deg * Math.PI) / 180;

  const arcPath = (startDeg: number, endDeg: number, r: number) => {
    const x1 = cx + r * Math.cos(toRad(startDeg));
    const y1 = cy - r * Math.sin(toRad(startDeg));
    const x2 = cx + r * Math.cos(toRad(endDeg));
    const y2 = cy - r * Math.sin(toRad(endDeg));
    return `M ${x1} ${y1} A ${r} ${r} 0 0 0 ${x2} ${y2}`;
  };

  const needleX = cx + (radius - 10) * Math.cos(toRad(angle));
  const needleY = cy - (radius - 10) * Math.sin(toRad(angle));

  return (
    <svg viewBox="0 0 180 100" className="w-full max-w-[220px]">
      {/* Track */}
      <path d={arcPath(startAngle, endAngle, radius)} fill="none" stroke="rgb(63,63,70)" strokeWidth="14" strokeLinecap="round" />
      {/* Green zone 0–35% */}
      <path d={arcPath(180, 180 - 0.35 * 180, radius)} fill="none" stroke="rgb(34,197,94)" strokeWidth="14" strokeLinecap="round" opacity="0.7" />
      {/* Amber zone 35–60% */}
      <path d={arcPath(180 - 0.35 * 180, 180 - 0.60 * 180, radius)} fill="none" stroke="rgb(245,158,11)" strokeWidth="14" opacity="0.7" />
      {/* Red zone 60–100% */}
      <path d={arcPath(180 - 0.60 * 180, endAngle, radius)} fill="none" stroke="rgb(239,68,68)" strokeWidth="14" strokeLinecap="round" opacity="0.7" />
      {/* Needle */}
      <line
        x1={cx} y1={cy}
        x2={needleX} y2={needleY}
        stroke="white" strokeWidth="2.5" strokeLinecap="round"
        style={{ transition: "all 0.6s cubic-bezier(0.34,1.56,0.64,1)" }}
      />
      <circle cx={cx} cy={cy} r="4" fill="white" />
      {/* Probability label */}
      <text x={cx} y={cy + 18} textAnchor="middle" className="fill-white" fontSize="14" fontWeight="700" fontFamily="monospace">
        {(probability * 100).toFixed(1)}%
      </text>
      <text x={cx} y={cy + 30} textAnchor="middle" className="fill-zinc-400" fontSize="8" fontFamily="monospace">
        default probability
      </text>
    </svg>
  );
}

function RiskBadge({ label }: { label: "low" | "medium" | "high" }) {
  const config = {
    low:    { color: "bg-green-900/40 text-green-300 border-green-700/50",  icon: CheckCircle,    text: "Low Risk" },
    medium: { color: "bg-amber-900/40 text-amber-300 border-amber-700/50",  icon: AlertTriangle,  text: "Medium Risk" },
    high:   { color: "bg-red-900/40 text-red-300 border-red-700/50",        icon: AlertTriangle,  text: "High Risk" },
  }[label];

  const Icon = config.icon;
  return (
    <span className={`inline-flex items-center gap-2 px-4 py-2 rounded-full border text-sm font-semibold ${config.color}`}>
      <Icon size={15} />
      {config.text}
    </span>
  );
}

// ── Main section ───────────────────────────────────────────────────────────

export default function RiskDemoSection() {
  const [inputs, setInputs] = useState<BorrowerInputs>(DEFAULTS);
  const [result, setResult] = useState<RiskResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [hasRequested, setHasRequested] = useState(false);

  const update = useCallback(<K extends keyof BorrowerInputs>(key: K, val: BorrowerInputs[K]) => {
    setInputs((prev) => ({ ...prev, [key]: val }));
    // Clear result when inputs change
    setResult(null);
    setError(null);
  }, []);

  const handlePredict = async () => {
    const apiUrl = process.env.NEXT_PUBLIC_RISK_API_URL;
    if (!apiUrl) {
      setError("API endpoint not configured. Set NEXT_PUBLIC_RISK_API_URL.");
      return;
    }
    setLoading(true);
    setError(null);
    setHasRequested(true);

    try {
      const res = await fetch(`${apiUrl}/predict`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(inputs),
      });

      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data?.detail ?? `Server error ${res.status}`);
      }

      const data: RiskResult = await res.json();
      setResult(data);
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : "Request failed";
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  const fmtCurrency = (v: number) =>
    new Intl.NumberFormat("en-US", { style: "currency", currency: "USD", maximumFractionDigits: 0 }).format(v);

  const fmtPct = (v: number) => `${(v * 100).toFixed(0)}%`;

  return (
    <div className="animate-fade-in-up space-y-10">

      {/* ── Header ─────────────────────────────────────────────── */}
      <div>
        <div className="flex flex-wrap items-center gap-3 mb-3">
          <span className="text-xs font-medium px-2.5 py-1 rounded-full border bg-yellow-900/30 text-yellow-300 border-yellow-800/50">
            ML · FinTech
          </span>
          <span className="text-xs font-medium px-2.5 py-1 rounded-full border bg-green-900/30 text-green-300 border-green-700/50 flex items-center gap-1">
            <Activity size={11} />
            Live Demo
          </span>
        </div>
        <h1 className="text-3xl font-bold text-zinc-100 mb-1">Financial Risk Pipeline</h1>
        <p className="text-sm text-amber-500/80 font-mono mb-4">
          Random Forest Loan Default Predictor — FastAPI · scikit-learn · SMOTE
        </p>
        <p className="text-zinc-400 leading-relaxed max-w-2xl">
          This model was built during my internship at Inditrade Capital, where I developed a
          risk-scoring system to flag high-risk loan accounts for the collections team — achieving
          78% precision on the minority default class.
        </p>
        <a
          href="https://github.com/kbaylake/financial-risk-pipeline"
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-2 mt-4 text-sm text-zinc-400 hover:text-amber-400 transition-colors"
        >
          <Github size={15} />
          kbaylake/financial-risk-pipeline
          <ExternalLink size={12} />
        </a>
      </div>

      {/* ── How it works ───────────────────────────────────────── */}
      <div className="border border-zinc-800 rounded-xl bg-zinc-900/40 p-5">
        <div className="flex items-center gap-2 mb-3">
          <Info size={14} className="text-amber-500 flex-shrink-0" />
          <h2 className="text-sm font-semibold text-zinc-300 uppercase tracking-widest">How it works</h2>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-sm text-zinc-400 leading-relaxed">
          <div>
            <p className="text-amber-400 font-mono text-xs mb-1">01 / Input</p>
            <p>
              Enter a borrower&apos;s financial profile — loan size, income, credit score,
              employment history, debt-to-income ratio, and loan purpose.
            </p>
          </div>
          <div>
            <p className="text-amber-400 font-mono text-xs mb-1">02 / Model</p>
            <p>
              A Random Forest (300 trees) trained on 6,000 synthetic-but-realistic borrower
              records scores the inputs. SMOTE oversampling fixes the natural class imbalance
              (~18% default rate) so the model doesn&apos;t ignore rare defaults.
            </p>
          </div>
          <div>
            <p className="text-amber-400 font-mono text-xs mb-1">03 / Output</p>
            <p>
              The API returns a default probability, a confidence score (how far from the
              50% decision boundary), and a risk label — green for low, amber for medium,
              red for high.
            </p>
          </div>
        </div>
      </div>

      {/* ── Demo widget ────────────────────────────────────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

        {/* Inputs panel */}
        <div className="border border-zinc-800 rounded-xl bg-zinc-900/40 p-6 space-y-5">
          <h2 className="text-sm font-bold text-zinc-300 uppercase tracking-widest">Borrower Profile</h2>

          <SliderField
            label="Loan Amount"
            value={inputs.loan_amount}
            min={1000} max={500000} step={1000}
            format={fmtCurrency}
            onChange={(v) => update("loan_amount", v)}
          />
          <SliderField
            label="Annual Income"
            value={inputs.income}
            min={15000} max={300000} step={1000}
            format={fmtCurrency}
            onChange={(v) => update("income", v)}
          />
          <SliderField
            label="Credit Score"
            value={inputs.credit_score}
            min={300} max={850} step={1}
            format={(v) => v.toString()}
            onChange={(v) => update("credit_score", v)}
          />
          <SliderField
            label="Employment (years)"
            value={inputs.employment_years}
            min={0} max={40} step={0.5}
            format={(v) => `${v} yr${v !== 1 ? "s" : ""}`}
            onChange={(v) => update("employment_years", v)}
          />
          <SliderField
            label="Debt-to-Income Ratio"
            value={inputs.debt_to_income}
            min={0} max={0.85} step={0.01}
            format={fmtPct}
            onChange={(v) => update("debt_to_income", v)}
          />

          {/* Loan purpose */}
          <div className="space-y-2">
            <label className="text-xs font-medium text-zinc-400 uppercase tracking-wide">
              Loan Purpose
            </label>
            <div className="flex flex-wrap gap-2">
              {LOAN_PURPOSES.map(({ value, label }) => (
                <button
                  key={value}
                  onClick={() => update("loan_purpose", value)}
                  className={`text-xs px-3 py-1.5 rounded-md border transition-colors ${
                    inputs.loan_purpose === value
                      ? "border-amber-600 bg-amber-900/30 text-amber-300"
                      : "border-zinc-700 bg-zinc-800/60 text-zinc-400 hover:border-zinc-600"
                  }`}
                >
                  {label}
                </button>
              ))}
            </div>
          </div>

          <button
            onClick={handlePredict}
            disabled={loading}
            className="w-full flex items-center justify-center gap-2 py-3 rounded-lg bg-amber-600 hover:bg-amber-500 disabled:bg-zinc-700 disabled:text-zinc-500 text-zinc-950 font-semibold text-sm transition-colors"
          >
            {loading ? (
              <>
                <Loader2 size={16} className="animate-spin" />
                Analysing…
              </>
            ) : (
              <>
                <Activity size={16} />
                Run Risk Assessment
              </>
            )}
          </button>
        </div>

        {/* Result panel */}
        <div className={`border rounded-xl p-6 flex flex-col items-center justify-center space-y-5 transition-colors duration-500 ${
          result?.risk_label === "low"    ? "border-green-800/50 bg-green-950/20" :
          result?.risk_label === "medium" ? "border-amber-800/50 bg-amber-950/20" :
          result?.risk_label === "high"   ? "border-red-800/50 bg-red-950/20" :
          "border-zinc-800 bg-zinc-900/40"
        }`}>

          {!hasRequested && !loading && (
            <div className="text-center">
              <p className="text-zinc-500 text-sm">Adjust the borrower profile and click</p>
              <p className="text-amber-500/70 text-sm font-mono">Run Risk Assessment</p>
              <p className="text-zinc-600 text-xs mt-4">
                The model will call the live FastAPI endpoint and return<br />
                a risk label, probability, and confidence score.
              </p>
            </div>
          )}

          {loading && (
            <div className="text-center space-y-3">
              <Loader2 size={32} className="animate-spin text-amber-500 mx-auto" />
              <p className="text-zinc-400 text-sm">Calling model API…</p>
            </div>
          )}

          {error && !loading && (
            <div className="text-center space-y-2">
              <AlertTriangle size={28} className="text-red-400 mx-auto" />
              <p className="text-red-400 text-sm font-mono">{error}</p>
              <p className="text-zinc-600 text-xs">
                Deploy the API and set NEXT_PUBLIC_RISK_API_URL to enable the live demo.
              </p>
            </div>
          )}

          {result && !loading && !error && (
            <>
              <RiskGauge probability={result.default_probability} />

              <RiskBadge label={result.risk_label} />

              <div className="grid grid-cols-2 gap-4 w-full text-center">
                <div className="border border-zinc-800 rounded-lg p-3 bg-zinc-900/50">
                  <p className="text-xs text-zinc-500 uppercase tracking-wide mb-1">Default Prob.</p>
                  <p className="text-xl font-bold font-mono text-zinc-100">
                    {(result.default_probability * 100).toFixed(1)}%
                  </p>
                </div>
                <div className="border border-zinc-800 rounded-lg p-3 bg-zinc-900/50">
                  <p className="text-xs text-zinc-500 uppercase tracking-wide mb-1">Confidence</p>
                  <p className="text-xl font-bold font-mono text-zinc-100">
                    {(result.confidence * 100).toFixed(1)}%
                  </p>
                </div>
              </div>

              {/* Risk tier explanation */}
              <p className="text-xs text-zinc-500 text-center max-w-xs">
                {result.risk_label === "low" &&
                  "This borrower profile sits below the 35% default threshold — the model considers this a manageable lending risk."}
                {result.risk_label === "medium" &&
                  "Probability falls between 35–60%. This borrower warrants closer review before approval."}
                {result.risk_label === "high" &&
                  "Default probability exceeds 60%. The model flags this profile as high-risk — likely declined under standard lending criteria."}
              </p>
            </>
          )}
        </div>
      </div>

      {/* ── Architecture note ──────────────────────────────────── */}
      <div className="border border-zinc-800 rounded-xl bg-zinc-900/40 p-5">
        <h2 className="text-sm font-bold text-zinc-300 uppercase tracking-widest mb-4">Architecture</h2>
        <pre className="text-xs text-zinc-500 font-mono leading-relaxed overflow-x-auto whitespace-pre">
{`Browser sliders  →  POST /predict  →  FastAPI (Railway)
                                           │
                              StandardScaler.transform()
                                           │
                          RandomForestClassifier.predict_proba()
                                           │
                     risk_label + default_probability + confidence
                                           │
                       ◀────── JSON response ──────────`}
        </pre>
        <p className="text-xs text-zinc-600 mt-3 font-mono">
          Model baked into Docker image at build time via{" "}
          <span className="text-amber-700">python train.py</span> —
          zero cold-start latency on Railway.
        </p>
      </div>

    </div>
  );
}
