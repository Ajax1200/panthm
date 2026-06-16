import React from "react";
import {
  appPortfolio,
  webPortfolio,
} from "../data/portfolio";
import { ArrowUpRight } from "lucide-react";

const Portfolio = ({ page }) => {
  let portfolioList;

  if (page === "web") {
    portfolioList = webPortfolio;
  } else if (page === "app") {
    portfolioList = appPortfolio;
  }  else {
    portfolioList = webPortfolio.slice(0, 3).concat(appPortfolio.slice(0, 3));
  }
  return (
    <section className="py-20 bg-slate-50 dark:bg-[#0a0a0a]">
      <div className="wrapper">
        <div className="text-center max-w-3xl mx-auto mb-16 space-y-4">
          <h2 data-aos="fade-up" className="section-heading">
            Our Recent Work
          </h2>
          <p data-aos="fade-up" className="text-slate-600 dark:text-slate-400 text-lg">
            Showcasing our expertise in delivering high-impact digital solutions.
          </p>
        </div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-8">
          {portfolioList.map(({ img, id, title, link }, index) => (
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
                  <h3 className="text-xl font-bold">{title}</h3>
                  <div className="w-10 min-w-10 h-10 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center hover:bg-white hover:text-primary transition-colors">
                    <ArrowUpRight size={20} />
                  </div>
                </div>
              </div>
            </a>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Portfolio;
