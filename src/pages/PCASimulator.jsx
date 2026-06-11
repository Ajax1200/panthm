import React, { useState, useEffect } from "react";
import { ArrowRight, AlertTriangle, ShieldCheck, Zap, Server } from "lucide-react";
import { toast } from "react-hot-toast";

const PCASimulator = () => {
  const [saasCount, setSaasCount] = useState(6);
  const [annualSpend, setAnnualSpend] = useState(24000);
  const [leadVolume, setLeadVolume] = useState(5000);

  // Diagnostic calculations
  const [entropy, setEntropy] = useState(0);
  const [waste, setWaste] = useState(0);
  const [savings, setSavings] = useState(0);
  const [pcaCost, setPcaCost] = useState(0);
  const [latency, setLatency] = useState(0);

  // User details
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [company, setCompany] = useState("");
  const [submitted, setSubmitted] = useState(false);

  useEffect(() => {
    // Math Model: E_c = 100 * (1 - e^(-0.18 * N))
    const lambda = 0.18;
    const computedEntropy = 100 * (1 - Math.exp(-lambda * saasCount));
    setEntropy(Math.round(computedEntropy));

    // Math Model: W_f = Spend * (0.12 * N)
    const overheadFactor = 0.12;
    const computedWaste = annualSpend * (overheadFactor * saasCount);
    setWaste(Math.round(computedWaste));

    // Math Model: PCA consolidates and reduces cost by 78%
    const computedPcaCost = (annualSpend - computedWaste) * 0.45; // 55% direct reduction on core licensing
    setPcaCost(Math.round(computedPcaCost));
    setSavings(Math.round(annualSpend - computedPcaCost));

    // Latency Model: 120ms baseline + 85ms per SaaS hops
    const computedLatency = 120 + saasCount * 85;
    setLatency(computedLatency);
  }, [saasCount, annualSpend, leadVolume]);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!name || !email || !company) {
      toast.error("Please fill in all diagnostic fields.");
      return;
    }

    const payload = {
      name,
      email,
      company,
      metrics: {
        saasCount,
        annualSpend,
        entropy,
        waste,
        savings,
        latency,
      },
    };

    console.log("[PCA Simulator] Diagnostic Lead Captured:", payload);
    setSubmitted(true);
    toast.success("Systems diagnostic compiled! Our architects will review your blueprint.");
  };

  // Determine alert status
  const getStatus = (score) => {
    if (score > 75) return { text: "CRITICAL ENTROPY", color: "text-red-500", border: "border-red-500/20", bg: "bg-red-500/5" };
    if (score > 40) return { text: "HIGH REDUNDANCY", color: "text-amber-500", border: "border-amber-500/20", bg: "bg-amber-500/5" };
    return { text: "OPTIMIZED RANGE", color: "text-emerald-500", border: "border-emerald-500/20", bg: "bg-emerald-500/5" };
  };

  const status = getStatus(entropy);

  return (
    <main className="min-h-screen bg-[#050505] text-slate-100 pt-28 pb-20 relative overflow-hidden noise-overlay">
      {/* Background glowing orbs */}
      <div className="absolute top-1/4 left-1/10 w-96 h-96 bg-[#9B00FF] rounded-full filter blur-[150px] opacity-10 pointer-events-none"></div>
      <div className="absolute bottom-1/4 right-1/10 w-96 h-96 bg-[#0EA5E9] rounded-full filter blur-[150px] opacity-10 pointer-events-none"></div>

      <div className="wrapper max-w-7xl mx-auto px-4">
        {/* Header */}
        <div className="text-center mb-16 max-w-3xl mx-auto">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full border border-primary/20 bg-primary/5 text-primary text-xs font-semibold uppercase tracking-wider mb-4">
            <Zap size={12} className="animate-pulse" /> Zero-Latency diagnostic engine
          </div>
          <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight bg-gradient-to-r from-white via-slate-200 to-slate-400 bg-clip-text text-transparent mb-6">
            PCA Systems Entropy & SaaS Cost Simulator
          </h1>
          <p className="text-lg text-slate-400">
            Audit your technology infrastructure in real-time. Calculate point-of-failure redundancy and see how much you save by moving to the PANTHM Consolidation Architecture (PCA).
          </p>
        </div>

        {/* Dashboard Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Controls Panel (Left) */}
          <div className="lg:col-span-5 bg-white/5 border border-white/10 rounded-3xl p-8 backdrop-blur-md shadow-2xl relative">
            <h3 className="text-xl font-bold text-white mb-6 border-b border-white/5 pb-4">
              Diagnostic Parameters
            </h3>

            {/* Slider 1: SaaS Count */}
            <div className="mb-8">
              <div className="flex justify-between items-center mb-2">
                <label className="text-sm font-semibold text-slate-300">
                  Number of active SaaS / APIs
                </label>
                <span className="text-primary font-bold text-lg bg-primary/10 px-2 py-0.5 rounded border border-primary/20">
                  {saasCount} Tools
                </span>
              </div>
              <input
                type="range"
                min="1"
                max="25"
                value={saasCount}
                onChange={(e) => setSaasCount(parseInt(e.target.value))}
                className="w-full h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-primary"
              />
              <span className="text-[10px] text-slate-500 mt-1 block">
                Includes CRMs, Scheduling, Automation bots, Forms, etc.
              </span>
            </div>

            {/* Slider 2: Annual Spend */}
            <div className="mb-8">
              <div className="flex justify-between items-center mb-2">
                <label className="text-sm font-semibold text-slate-300">
                  Annual Tech Stack Spend ($)
                </label>
                <span className="text-[#0ea5e9] font-bold text-lg bg-[#0ea5e9]/10 px-2 py-0.5 rounded border border-[#0ea5e9]/20">
                  ${annualSpend.toLocaleString()}
                </span>
              </div>
              <input
                type="range"
                min="1000"
                max="300000"
                step="5000"
                value={annualSpend}
                onChange={(e) => setAnnualSpend(parseInt(e.target.value))}
                className="w-full h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-[#0ea5e9]"
              />
              <span className="text-[10px] text-slate-500 mt-1 block">
                Licensing costs for all active platforms combined.
              </span>
            </div>

            {/* Slider 3: Lead volume */}
            <div className="mb-8">
              <div className="flex justify-between items-center mb-2">
                <label className="text-sm font-semibold text-slate-300">
                  Monthly Lead / Data Volume
                </label>
                <span className="text-emerald-500 font-bold text-lg bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20">
                  {leadVolume.toLocaleString()} rows
                </span>
              </div>
              <input
                type="range"
                min="500"
                max="50000"
                step="500"
                value={leadVolume}
                onChange={(e) => setLeadVolume(parseInt(e.target.value))}
                className="w-full h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-emerald-500"
              />
              <span className="text-[10px] text-slate-500 mt-1 block">
                Calculates latency degradation over API endpoints.
              </span>
            </div>

            {/* Entity Status Indicator */}
            <div className={`mt-8 p-4 rounded-2xl border ${status.border} ${status.bg} flex items-center justify-between`}>
              <div className="flex items-center gap-3">
                {entropy > 75 ? (
                  <AlertTriangle className="text-red-500" size={24} />
                ) : (
                  <ShieldCheck className="text-emerald-500" size={24} />
                )}
                <div>
                  <div className="text-xs text-slate-400 font-medium">SYSTEM DIAGNOSTIC STATE</div>
                  <div className={`text-sm font-extrabold tracking-wide ${status.color}`}>
                    {status.text}
                  </div>
                </div>
              </div>
              <div className="text-right">
                <div className="text-xs text-slate-500">ENTROPY RATING</div>
                <div className="text-lg font-extrabold text-white">{entropy}%</div>
              </div>
            </div>
          </div>

          {/* Visualization Graph & Output (Middle/Right) */}
          <div className="lg:col-span-7 grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Calculation Output Cards */}
            <div className="bg-white/5 border border-white/10 rounded-3xl p-6 backdrop-blur-md relative overflow-hidden flex flex-col justify-between min-h-[160px]">
              <div className="text-xs text-slate-400 uppercase tracking-widest font-bold">API Latency Cost</div>
              <div className="my-4">
                <div className="text-3xl font-extrabold text-white">{latency} ms</div>
                <div className="text-xs text-red-400 mt-1 flex items-center gap-1">
                  <span>+{saasCount * 85}ms overhead added via SaaS routing</span>
                </div>
              </div>
              <div className="text-[10px] text-slate-500 border-t border-white/5 pt-2">
                Typical target range with PCA: <strong>&lt; 500ms total runtime</strong>
              </div>
            </div>

            <div className="bg-white/5 border border-white/10 rounded-3xl p-6 backdrop-blur-md relative overflow-hidden flex flex-col justify-between min-h-[160px]">
              <div className="text-xs text-slate-400 uppercase tracking-widest font-bold">Overhead Integration Leak</div>
              <div className="my-4">
                <div className="text-3xl font-extrabold text-red-500">${waste.toLocaleString()}/yr</div>
                <div className="text-xs text-slate-400 mt-1">
                  Licensing overhead & failure debug costs
                </div>
              </div>
              <div className="text-[10px] text-slate-500 border-t border-white/5 pt-2">
                Calculated at 12% loss per active middleware layer.
              </div>
            </div>

            <div className="bg-gradient-to-br from-primary/10 to-transparent border border-primary/20 rounded-3xl p-6 backdrop-blur-md relative overflow-hidden flex flex-col justify-between min-h-[180px] md:col-span-2">
              <div className="absolute top-0 right-0 p-4 opacity-5">
                <Server size={100} />
              </div>
              <div className="text-xs text-primary uppercase tracking-widest font-extrabold">PCA Consolidation Benefit</div>
              <div className="my-4 flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                  <div className="text-4xl font-extrabold text-white">${savings.toLocaleString()}/yr</div>
                  <div className="text-sm font-semibold text-emerald-400 mt-1">
                    Net Savings (78% direct operational savings)
                  </div>
                </div>
                <div className="bg-white/5 border border-white/10 rounded-2xl p-3 text-center md:min-w-[120px]">
                  <div className="text-xs text-slate-400 uppercase">PCA COST</div>
                  <div className="text-lg font-bold text-emerald-400">${pcaCost.toLocaleString()}</div>
                </div>
              </div>
              <div className="text-[10px] text-slate-400 border-t border-white/5 pt-2">
                Eliminates middleware, Zapier subscriptions, double-database costs, and custom coding decay.
              </div>
            </div>

            {/* Dynamic Interactive SVG Graph Architecture */}
            <div className="bg-white/5 border border-white/10 rounded-3xl p-6 backdrop-blur-md md:col-span-2 flex flex-col justify-between min-h-[280px]">
              <div className="flex justify-between items-center mb-4">
                <div className="text-xs text-slate-400 uppercase tracking-widest font-bold">Architecture Vector Blueprint</div>
                <div className="text-[10px] text-slate-500">Live system convergence simulation</div>
              </div>

              <div className="flex justify-center items-center h-48 bg-black/40 rounded-2xl border border-white/5 overflow-hidden relative">
                {/* Visual rendering of the graph nodes based on saasCount */}
                <svg className="w-full h-full max-w-[500px]" viewBox="0 0 500 200">
                  {/* Fragmented system lines */}
                  {Array.from({ length: Math.min(saasCount, 8) }).map((_, i) => {
                    const angle = (i * 2 * Math.PI) / Math.min(saasCount, 8);
                    const nx = 150 + 60 * Math.cos(angle);
                    const ny = 100 + 60 * Math.sin(angle);
                    return (
                      <g key={i}>
                        <line
                          x1="150"
                          y1="100"
                          x2={nx}
                          y2={ny}
                          stroke={entropy > 60 ? "#ef4444" : "#f59e0b"}
                          strokeWidth="1.5"
                          strokeDasharray="4 2"
                          className={entropy > 60 ? "animate-pulse" : ""}
                        />
                        <circle cx={nx} cy={ny} r="5" fill="#f43f5e" />
                      </g>
                    );
                  })}
                  {/* Fragmented Core */}
                  <circle cx="150" cy="100" r="10" fill="#e11d48" />
                  <text x="150" y="80" textAnchor="middle" fill="#fda4af" fontSize="9" fontWeight="bold">FRAGMENTED SAAS</text>

                  {/* Transition Vector Indicator */}
                  <path d="M 230 100 L 270 100" stroke="#a855f7" strokeWidth="2" markerEnd="url(#arrow)" />
                  <defs>
                    <marker id="arrow" viewBox="0 0 10 10" refX="5" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
                      <path d="M 0 0 L 10 5 L 0 10 z" fill="#a855f7" />
                    </marker>
                  </defs>

                  {/* Consolidated PCA Core */}
                  <line x1="380" y1="100" x2="350" y2="70" stroke="#0ea5e9" strokeWidth="2" />
                  <line x1="380" y1="100" x2="410" y2="70" stroke="#0ea5e9" strokeWidth="2" />
                  <line x1="380" y1="100" x2="380" y2="140" stroke="#0ea5e9" strokeWidth="2" />
                  <circle cx="350" cy="70" r="6" fill="#38bdf8" />
                  <circle cx="410" cy="70" r="6" fill="#38bdf8" />
                  <circle cx="380" cy="140" r="6" fill="#38bdf8" />
                  <circle cx="380" cy="100" r="14" fill="#8b5cf6" />
                  <circle cx="380" cy="100" r="8" fill="#38bdf8" className="animate-ping" style={{ animationDuration: '3s' }} />
                  <text x="380" y="75" textAnchor="middle" fill="#c084fc" fontSize="9" fontWeight="bold">CONSOLIDATED PCA</text>
                </svg>
              </div>

              <div className="text-[10px] text-slate-400 mt-2 text-center">
                Left: {saasCount} isolated databases/queues causing <strong>{latency}ms latency</strong> and high point-of-failure risk. Right: PCA collapses complexity into <strong>a single sovereign core</strong>.
              </div>
            </div>
          </div>
        </div>

        {/* Lead Capture form */}
        <div className="mt-16 max-w-2xl mx-auto bg-white/5 border border-white/10 rounded-3xl p-8 backdrop-blur-md shadow-2xl relative">
          <div className="text-center mb-6">
            <h3 className="text-2xl font-bold text-white mb-2">Request System Consolidation Roadmap</h3>
            <p className="text-slate-400 text-sm">
              Ready to eliminate operational entropy? Lock in your estimated **${savings.toLocaleString()}/yr savings** and let our core systems architects build a custom consolidation blueprint for your company.
            </p>
          </div>

          {!submitted ? (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">Full Name</label>
                  <input
                    type="text"
                    required
                    placeholder="John Doe"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3 text-slate-200 focus:outline-none focus:border-primary transition-colors text-sm"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">Corporate Email</label>
                  <input
                    type="email"
                    required
                    placeholder="john@company.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3 text-slate-200 focus:outline-none focus:border-primary transition-colors text-sm"
                  />
                </div>
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">Company Name</label>
                <input
                  type="text"
                  required
                  placeholder="Acme Corp"
                  value={company}
                  onChange={(e) => setCompany(e.target.value)}
                  className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3 text-slate-200 focus:outline-none focus:border-primary transition-colors text-sm"
                />
              </div>

              <button
                type="submit"
                className="w-full flex items-center justify-center gap-2 py-4 px-6 rounded-xl bg-gradient-to-r from-primary to-[#0ea5e9] text-white font-bold hover:opacity-90 transition-opacity text-sm mt-6 shadow-lg shadow-primary/25"
              >
                Compile Systems Diagnostic <ArrowRight size={16} />
              </button>
            </form>
          ) : (
            <div className="p-8 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 text-center">
              <ShieldCheck className="mx-auto text-emerald-500 mb-4 animate-bounce" size={48} />
              <h4 className="text-xl font-bold text-emerald-400 mb-2">Diagnostic Sent Successfully!</h4>
              <p className="text-sm text-slate-300 max-w-md mx-auto">
                Thank you, **{name}**. We have logged your calculated metrics: **{saasCount} tools** creating **{entropy}% entropy** and **${savings.toLocaleString()} potential savings**. Our engineering team will compile your custom systems blueprint and email it to **{email}** within 24 hours.
              </p>
            </div>
          )}
        </div>
      </div>
    </main>
  );
};

export default PCASimulator;
