import React from "react";
import { CheckCircle2 } from "lucide-react";

const caseStudies = [
  {
    title: "Global Supply Chain Logistics",
    clientIndustry: "Logistics & Freight",
    problem: "The client was managing thousands of daily inbound supplier queries via email and phone, leading to 24+ hour response times and severe operational bottlenecks.",
    solution: "We deployed a custom AI Voice Agent architecture integrated with their ERP. The system intercepts inbound calls, identifies the supplier via caller ID, and instantly provides accurate shipment statuses and automated invoice processing with sub-second latency.",
    outcome: [
      "Reduced average response time from 24 hours to 500ms",
      "Automated 82% of tier-1 support calls",
      "Saved over $40,000 monthly in call-center operational costs"
    ]
  },
  {
    title: "Enterprise E-Commerce Scaling",
    clientIndustry: "Retail & E-Commerce",
    problem: "A major regional retailer was experiencing 15+ second page load times during peak sale events, causing a 60% cart abandonment rate and constant server crashes.",
    solution: "Our engineering team completely re-architected their monolithic platform into a decoupled headless architecture using Next.js, optimized React, and a globally distributed Edge caching layer.",
    outcome: [
      "Reduced Largest Contentful Paint (LCP) from 15.2s to 0.8s",
      "Achieved 99.99% uptime during Black Friday traffic surges",
      "Boosted conversion rates by 34%, generating $2M+ in additional revenue"
    ]
  }
];

const CaseStudies = () => {
  return (
    <section className="py-20 lg:py-32 bg-slate-50 dark:bg-slate-900 border-t border-slate-200 dark:border-slate-800" id="case-studies">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-3xl mx-auto mb-16 lg:mb-20">
          <div className="inline-block py-1 px-3 rounded-full bg-primary/10 border border-primary/20 text-primary font-medium text-sm mb-6">
            Proven Results
          </div>
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold mb-6 text-slate-900 dark:text-white tracking-tight">
            Case Studies & Success Stories
          </h2>
          <p className="text-lg md:text-xl text-slate-600 dark:text-slate-400">
            Real impact we've driven for leading enterprises through custom engineering and AI automation.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12">
          {caseStudies.map((study, index) => (
            <div key={index} className="bg-white dark:bg-slate-800 rounded-3xl p-8 lg:p-10 border border-slate-200 dark:border-slate-700 shadow-xl shadow-slate-200/20 dark:shadow-none hover:-translate-y-1 transition-transform duration-300">
              <div className="mb-6">
                <span className="text-sm font-semibold uppercase tracking-wider text-primary mb-2 block">
                  {study.clientIndustry}
                </span>
                <h3 className="text-2xl md:text-3xl font-bold text-slate-900 dark:text-white">
                  {study.title}
                </h3>
              </div>
              
              <div className="space-y-6">
                <div>
                  <h4 className="text-sm font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wide mb-2">The Challenge</h4>
                  <p className="text-slate-700 dark:text-slate-300 leading-relaxed">
                    {study.problem}
                  </p>
                </div>
                
                <div>
                  <h4 className="text-sm font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wide mb-2">Our Solution</h4>
                  <p className="text-slate-700 dark:text-slate-300 leading-relaxed">
                    {study.solution}
                  </p>
                </div>
                
                <div className="pt-4 border-t border-slate-100 dark:border-slate-700">
                  <h4 className="text-sm font-bold text-slate-900 dark:text-white uppercase tracking-wide mb-4">Key Outcomes</h4>
                  <ul className="space-y-3">
                    {study.outcome.map((point, i) => (
                      <li key={i} className="flex items-start gap-3">
                        <CheckCircle2 className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />
                        <span className="text-slate-700 dark:text-slate-300 font-medium">{point}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default CaseStudies;
