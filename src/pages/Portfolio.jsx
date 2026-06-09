import React, { useState } from "react";
import { appPortfolio, webPortfolio } from "../data/portfolio";
import { ArrowUpRight } from "lucide-react";
import SEO from "../components/SEO";

const Portfolio = () => {
  const structuredData = {
    "@context": "https://schema.org",
    "@type": "CollectionPage",
    "name": "Portfolio - PANTHM AI Labs",
    "description": "View our portfolio of web development and mobile app development projects. Showcasing successful digital solutions across various industries.",
    "mainEntity": {
      "@type": "ItemList",
      "itemListElement": [
        ...webPortfolio.map((item, index) => ({
          "@type": "ListItem",
          "position": index + 1,
          "item": {
            "@type": "CreativeWork",
            "name": item.title,
            "url": item.link
          }
        })),
        ...appPortfolio.map((item, index) => ({
          "@type": "ListItem",
          "position": webPortfolio.length + index + 1,
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

  const filters = [
    { id: "all", label: "All Projects" },
    { id: "web", label: "Web Development" },
    { id: "app", label: "App Development" },
  ];

  const getFilteredPortfolio = () => {
    switch (activeFilter) {
      case "web":
        return webPortfolio;
      case "app":
        return appPortfolio;
      default:
        return [...webPortfolio, ...appPortfolio];
    }
  };

  const filteredPortfolio = getFilteredPortfolio();

  return (
    <div className="pt-32 pb-20 bg-slate-50 dark:bg-[#0a0a0a] min-h-screen">
      <SEO
        title="Portfolio"
        description="Explore PANTHM AI Labs portfolio showcasing successful web development and mobile app development projects. View our work across e-commerce, enterprise solutions, and innovative digital platforms."
        keywords="PANTHM AI Labs portfolio, web development portfolio, mobile app portfolio, software development projects, case studies, web development examples"
        structuredData={structuredData}
      />
      <div className="wrapper">
        <div className="text-center max-w-3xl mx-auto mb-16 space-y-4">
          <h1 data-aos="fade-up" className="heading">
            Our <span className="text-primary">Portfolio</span>
          </h1>
          <p data-aos="fade-up" className="text-slate-600 dark:text-slate-400 text-lg">
            Showcasing our expertise in delivering high-impact digital solutions
            across web and mobile platforms.
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
            {filteredPortfolio.map(({ img, id, title, link }, index) => (
              <a
                key={id}
                href={link}
                target="_blank"
                rel="noopener noreferrer"
                data-aos="fade-up"
                data-aos-delay={index * 100}
                className="group relative rounded-2xl overflow-hidden shadow-lg hover:shadow-2xl transition-all duration-500 bg-white dark:bg-white/5 block"
              >
                <div className="aspect-[4/3] overflow-hidden">
                  <img
                    loading="lazy"
                    src={img}
                    alt={title}
                    className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                </div>

                <div className="absolute bottom-0 left-0 w-full p-6 translate-y-4 group-hover:translate-y-0 transition-transform duration-300">
                  <div className="flex items-center justify-between text-white opacity-0 group-hover:opacity-100 transition-opacity duration-300 delay-100">
                    <h3 className="text-xl font-bold pr-4">{title}</h3>
                    <div className="w-10 min-w-10 h-10 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center hover:bg-white hover:text-primary transition-colors flex-shrink-0">
                      <ArrowUpRight size={20} />
                    </div>
                  </div>
                </div>
              </a>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Portfolio;

