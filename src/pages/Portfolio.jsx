import React, { useState } from "react";
import { appPortfolio, webPortfolio, caseStudies } from "../data/portfolio";
import { ArrowUpRight, ArrowRight, X, CheckCircle, Cpu, ShieldAlert, Award } from "lucide-react";
import SEO from "../components/SEO";

const Portfolio = () => {
  const structuredData = {
    "@context": "https://schema.org",
    "@type": "CollectionPage",
    "name": "Portfolio & Case Studies - PANTHM AI Labs",
    "description": "View our portfolio of web development and mobile app development projects. Showcasing successful digital solutions across various industries.",
    "mainEntity": {
      "@type": "ItemList",
      "itemListElement": [
        ...caseStudies.map((item, index) => ({
          "@type": "ListItem",
          "position": index + 1,
          "item": {
            "@type": "CreativeWork",
            "name": item.title,
            "description": item.problem
          }
        })),
        ...webPortfolio.map((item, index) => ({
          "@type": "ListItem",
          "position": caseStudies.length + index + 1,
          "item": {
            "@type": "CreativeWork",
            "name": item.title,
            "url": item.link
          }
        })),
        ...appPortfolio.map((item, index) => ({
          "@type": "ListItem",
          "position": caseStudies.length + webPortfolio.length + index + 1,
          "item": {
            "@type": "SoftwareApplication",
            "name": item.title,
            "url": item.link
          }
        }))
      ]
    }
  };

  const [activeFilter, setActiveFilter] = useState("all");
  const [selectedCaseStudy, setSelectedCaseStudy] = useState(null);

  const filters = [
    { id: "all", label: "All Projects" },
    { id: "case", label: "Case Studies" },
    { id: "web", label: "Web Development" },
    { id: "app", label: "App Development" },
  ];

  const getFilteredPortfolio = () => {
    switch (activeFilter) {
      case "web":
        return [...caseStudies.filter(c => c.category === "web"), ...webPortfolio];
      case "app":
        return [...caseStudies.filter(c => c.category === "app"), ...appPortfolio];
      case "case":
        return caseStudies;
      default:
        return [...caseStudies, ...webPortfolio, ...appPortfolio];
    }
  };

  const filteredPortfolio = getFilteredPortfolio();

  return (
    <div className="pt-32 pb-20 bg-slate-50 dark:bg-[#0a0a0a] min-h-screen">
      <SEO
        title="Portfolio & Case Studies"
        description="Explore PANTHM AI Labs portfolio and detailed case studies showcasing successful web development, mobile app development, and AI voice integrations. View our proven B2B engineering solutions."
        keywords="PANTHM AI Labs portfolio, B2B case studies, AI calling case study, web development portfolio, mobile app portfolio, software development projects, case studies"
        structuredData={structuredData}
      />
      <div className="wrapper">
        <div className="text-center max-w-3xl mx-auto mb-16 space-y-4">
          <h1 data-aos="fade-up" className="heading">
            Our <span className="text-primary">Portfolio</span> &amp; Case Studies
          </h1>
          <p data-aos="fade-up" className="text-slate-600 dark:text-slate-400 text-lg">
            Showcasing our B2B expertise, technical systems engineering, and client success metrics.
          </p>
        </div>

        {/* Filter Buttons */}
        <div
          data-aos="fade-up"
          className="flex flex-wrap items-center justify-center gap-4 mb-12"
        >
          {filters.map((filter) => (
            <button
              key={filter.id}
              onClick={() => setActiveFilter(filter.id)}
              className={`px-6 py-3 rounded-full font-semibold transition-all duration-300 ${
                activeFilter === filter.id
                  ? "bg-primary text-white shadow-lg shadow-primary/30 scale-105"
                  : "bg-white dark:bg-white/5 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-white/10 border border-slate-200 dark:border-white/10"
              }`}
            >
              {filter.label}
            </button>
          ))}
        </div>

        {/* Portfolio Grid */}
        {filteredPortfolio.length === 0 ? (
          <div className="text-center py-20">
            <p className="text-slate-600 dark:text-slate-400 text-lg">No projects found.</p>
          </div>
        ) : (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-8">
            {filteredPortfolio.map((item, index) => {
              const isCS = item.isCaseStudy;
              return isCS ? (
                // Case Study Card
                <div
                  key={item.id}
                  onClick={() => setSelectedCaseStudy(item)}
                  data-aos="fade-up"
                  data-aos-delay={index * 100}
                  className="group relative rounded-2xl overflow-hidden shadow-lg hover:shadow-2xl transition-all duration-500 bg-white dark:bg-white/5 block cursor-pointer border border-primary/20 hover:border-primary/50"
                >
                  <div className="aspect-[4/3] overflow-hidden relative">
                    <img
                      loading="lazy"
                      src={item.img}
                      alt={item.title}
                      className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-900/40 to-transparent"></div>
                    <span className="absolute top-4 left-4 text-[10px] font-bold px-2.5 py-1 rounded-full bg-primary text-white uppercase tracking-wider shadow">
                      Case Study
                    </span>
                  </div>

                  <div className="absolute bottom-0 left-0 w-full p-6 text-white">
                    <div className="space-y-1.5 translate-y-2 group-hover:translate-y-0 transition-transform duration-300">
                      <p className="text-xs font-semibold text-primary/80 dark:text-primary-light">{item.client}</p>
                      <h3 className="text-lg font-bold leading-tight line-clamp-2 pr-4">{item.title}</h3>
                      <div className="flex items-center gap-1 text-xs text-slate-300 font-medium pt-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300 delay-100">
                        Read Case Study <ArrowRight size={12} className="group-hover:translate-x-1 transition-transform" />
                      </div>
                    </div>
                  </div>
                </div>
              ) : (
                // Standard Project Card
                <a
                  key={item.id}
                  href={item.link}
                  target="_blank"
                  rel="noopener noreferrer"
                  data-aos="fade-up"
                  data-aos-delay={index * 100}
                  className="group relative rounded-2xl overflow-hidden shadow-lg hover:shadow-2xl transition-all duration-500 bg-white dark:bg-white/5 block"
                >
                  <div className="aspect-[4/3] overflow-hidden relative">
                    <img
                      loading="lazy"
                      src={item.img}
                      alt={item.title}
                      className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/20 to-transparent"></div>
                  </div>

                  <div className="absolute bottom-0 left-0 w-full p-6 text-white translate-y-4 group-hover:translate-y-0 transition-transform duration-300">
                    <div className="flex items-center justify-between opacity-0 group-hover:opacity-100 transition-opacity duration-300 delay-100">
                      <h3 className="text-lg font-bold pr-4 leading-tight">{item.title}</h3>
                      <div className="w-10 min-w-10 h-10 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center hover:bg-white hover:text-primary transition-colors flex-shrink-0">
                        <ArrowUpRight size={20} />
                      </div>
                    </div>
                  </div>
                </a>
              );
            })}
          </div>
        )}
      </div>

      {/* Case Study Modal */}
      {selectedCaseStudy && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-md animate-in fade-in duration-300">
          <div className="bg-white dark:bg-[#0f172a] rounded-3xl border border-slate-100 dark:border-white/10 shadow-2xl max-w-3xl w-full max-h-[85vh] overflow-y-auto overflow-x-hidden relative animate-in slide-in-from-bottom-8 duration-300">
            {/* Top Banner Image with close button */}
            <div className="relative aspect-[21/9] w-full overflow-hidden bg-slate-100 dark:bg-slate-900 border-b border-slate-100 dark:border-white/10">
              <img
                src={selectedCaseStudy.img}
                alt={selectedCaseStudy.title}
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-slate-900 via-slate-900/40 to-transparent"></div>
              <button
                onClick={() => setSelectedCaseStudy(null)}
                className="absolute top-4 right-4 w-10 h-10 rounded-full bg-black/50 hover:bg-black/80 text-white flex items-center justify-center transition-colors z-10"
                aria-label="Close modal"
              >
                <X size={20} />
              </button>
              <div className="absolute bottom-4 left-6 right-6 text-white">
                <span className="text-[10px] font-bold px-2.5 py-1 rounded-full bg-primary text-white uppercase tracking-wider mb-2 inline-block shadow">
                  Case Study
                </span>
                <h2 className="text-2xl md:text-3xl font-bold leading-tight mt-1">
                  {selectedCaseStudy.title}
                </h2>
                <p className="text-slate-300 text-sm mt-1">
                  Client: <span className="font-semibold">{selectedCaseStudy.client}</span>
                </p>
              </div>
            </div>

            {/* Content */}
            <div className="p-6 md:p-8 space-y-8">
              {/* Problem & Solution Grid */}
              <div className="grid md:grid-cols-2 gap-8">
                <div className="space-y-3">
                  <h3 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
                    <ShieldAlert className="text-red-500 w-5 h-5 flex-shrink-0" />
                    The Problem
                  </h3>
                  <p className="text-slate-600 dark:text-slate-300 text-sm leading-relaxed">
                    {selectedCaseStudy.problem}
                  </p>
                </div>
                <div className="space-y-3">
                  <h3 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
                    <Cpu className="text-primary w-5 h-5 flex-shrink-0" />
                    Our Solution
                  </h3>
                  <p className="text-slate-600 dark:text-slate-300 text-sm leading-relaxed">
                    {selectedCaseStudy.solution}
                  </p>
                </div>
              </div>

              {/* Outcomes */}
              <div className="p-6 bg-slate-50 dark:bg-white/5 rounded-2xl border border-slate-100 dark:border-white/10 space-y-4">
                <h3 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
                  <Award className="text-amber-500 w-5 h-5 flex-shrink-0" />
                  Key Outcomes &amp; Results
                </h3>
                <ul className="grid sm:grid-cols-2 gap-4">
                  {selectedCaseStudy.outcome.map((item, idx) => (
                    <li key={idx} className="flex gap-2 text-sm text-slate-700 dark:text-slate-200 leading-normal">
                      <CheckCircle className="text-emerald-500 w-4 h-4 mt-0.5 flex-shrink-0" />
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Tech Stack Used */}
              <div className="space-y-3">
                <h3 className="text-sm font-semibold uppercase tracking-wider text-slate-400">
                  Technologies Implemented
                </h3>
                <div className="flex flex-wrap gap-2">
                  {selectedCaseStudy.tech.map((t, idx) => (
                    <span
                      key={idx}
                      className="px-3 py-1.5 text-xs font-semibold rounded-lg bg-slate-100 dark:bg-white/10 text-slate-700 dark:text-slate-300 border border-slate-200/50 dark:border-white/5"
                    >
                      {t}
                    </span>
                  ))}
                </div>
              </div>

              {/* Footer Action */}
              <div className="pt-6 border-t border-slate-100 dark:border-white/10 flex flex-col sm:flex-row items-center justify-between gap-4">
                <p className="text-sm text-slate-500 dark:text-slate-400 text-center sm:text-left">
                  Want to achieve similar results for your business?
                </p>
                <a
                  href="/contact"
                  onClick={() => setSelectedCaseStudy(null)}
                  className="px-6 py-3 rounded-full bg-primary hover:bg-primary/95 text-white font-semibold shadow-lg shadow-primary/30 transition-all text-sm flex items-center gap-2"
                >
                  Start Your Project <ArrowRight size={16} />
                </a>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Portfolio;
