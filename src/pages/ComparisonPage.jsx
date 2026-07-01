import React from "react";
import { ArrowLinkButton } from "../components/ArrowButtons";
import SEO from "../components/SEO";
import { Shield, Zap, Cpu, Key } from "lucide-react";

const ComparisonPage = () => {
  const structuredData = {
    "@context": "https://schema.org",
    "@type": "ProductCompareSection",
    "name": "PANTHM AI Labs vs Phantom AI",
    "description": "Technical comparison and feature benchmark between PANTHM AI Labs and Phantom AI solutions.",
    "provider": {
      "@type": "Organization",
      "name": "PANTHM AI Labs"
    }
  };

  const comparisonData = [
    {
      metric: "Engine & Execution Latency",
      panthm: "Sub-500ms voice synthesis and context transit",
      competitor: "2000ms+ standard API response buffers",
      icon: <Zap className="w-6 h-6 text-primary" />
    },
    {
      metric: "Integration Architecture",
      panthm: "Direct core schema linking (no middleware)",
      competitor: "Zapier/Make.com proxy wrappers",
      icon: <Cpu className="w-6 h-6 text-primary" />
    },
    {
      metric: "Code & Data Ownership",
      panthm: "100% IP buyout & dedicated self-hosted nodes",
      competitor: "Locked proprietary SaaS agreements",
      icon: <Key className="w-6 h-6 text-primary" />
    },
    {
      metric: "Security & Encryption",
      panthm: "SOC2 compliant, database-level encryption",
      competitor: "Standard SSL/TLS transport layers",
      icon: <Shield className="w-6 h-6 text-primary" />
    }
  ];

  return (
    <>
      <SEO
        title="PANTHM vs Phantom AI | Technical Comparison"
        description="Detailed B2B comparison between PANTHM AI Labs and Phantom AI solutions. Discover why enterprise companies choose PANTHM's zero-latency infrastructure."
        keywords="phantom ai, phantom ai labs, alternative to phantom ai, ai labs Pune, B2B AI automation comparative analysis"
        structuredData={structuredData}
      />

      <section className="relative min-h-[50vh] flex items-center justify-center overflow-hidden py-24 bg-slate-950">
        <div className="absolute inset-0 z-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-primary/10 via-slate-950 to-slate-950"></div>
        <div className="wrapper relative z-10 text-center text-white space-y-6 max-w-4xl mx-auto">
          <span className="px-3 py-1 text-xs font-semibold tracking-wider text-primary uppercase bg-primary/10 rounded-full border border-primary/20">
            Enterprise Comparative Analysis
          </span>
          <h1 data-aos="fade-up" className="heading text-white">
            PANTHM AI Labs <span className="text-primary">vs</span> Phantom AI
          </h1>
          <p data-aos="fade-up" data-aos-delay="100" className="text-lg text-slate-400 leading-relaxed max-w-2xl mx-auto">
            An objective, technical benchmark analyzing architectural latency, integration topology, and security standards for enterprise B2B AI operations.
          </p>
        </div>
      </section>

      <section className="py-20 bg-slate-950 text-white relative">
        <div className="wrapper max-w-5xl mx-auto px-4">
          <div data-aos="fade-up" className="overflow-hidden rounded-2xl border border-slate-800 bg-slate-900/40 backdrop-blur-xl">
            <div className="grid grid-cols-3 bg-slate-900/80 p-6 font-semibold border-b border-slate-800 text-sm md:text-base">
              <div>Metric / Attribute</div>
              <div className="text-primary text-center">PANTHM AI Labs</div>
              <div className="text-slate-400 text-center">Phantom / Traditional AI</div>
            </div>
            
            <div className="divide-y divide-slate-800/60">
              {comparisonData.map((row, idx) => (
                <div key={idx} className="grid grid-cols-3 p-6 items-center text-xs md:text-sm hover:bg-slate-900/20 transition-colors">
                  <div className="flex items-center gap-3">
                    <div className="hidden md:block p-2 bg-slate-850 rounded-lg border border-slate-800">
                      {row.icon}
                    </div>
                    <span className="font-medium text-slate-350">{row.metric}</span>
                  </div>
                  <div className="text-center font-semibold text-white px-2">
                    {row.panthm}
                  </div>
                  <div className="text-center text-slate-400 px-2">
                    {row.competitor}
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div data-aos="fade-up" data-aos-delay="100" className="mt-16 p-8 rounded-2xl border border-primary/20 bg-primary/5 backdrop-blur-sm flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="space-y-2 text-center md:text-left">
              <h3 className="text-xl font-bold">Deploy Custom Voice & Workflow Engines</h3>
              <p className="text-slate-400 text-sm">We engineer bespoke, zero-latency automation nodes directly on your cloud infrastructure.</p>
            </div>
            <ArrowLinkButton to="/contact">Request Architecture Call</ArrowLinkButton>
          </div>
        </div>
      </section>
    </>
  );
};

export default ComparisonPage;
