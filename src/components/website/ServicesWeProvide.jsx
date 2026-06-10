import React from "react";
import { services } from "../../data/services";
import { Link } from "react-router-dom";
import { ArrowRight, CheckCircle2 } from "lucide-react";
import { ArrowLinkButton } from "../ArrowButtons";

const slugify = (text) => text.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '');

const ServicesWeProvide = () => {
  return (
    <section id="services" className="py-20 bg-slate-50 dark:bg-[#0a0a0a]">
      <div className="wrapper">
        <div className="text-center max-w-3xl mx-auto mb-16 space-y-4">
          <h2 data-aos="fade-up" className="section-heading dark:text-white">
            Our Expertise
          </h2>
          <p data-aos="fade-up" className="text-slate-600 dark:text-slate-400 text-lg">
            Comprehensive digital solutions engineered for growth and scalability.
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {services.map((item, index) => (
            <div
              key={item.title}
              data-aos="fade-up"
              data-aos-delay={index * 100}
              className="group relative bg-white dark:bg-white/5 rounded-2xl p-8 shadow-sm hover:shadow-xl transition-all duration-300 border border-slate-100 dark:border-white/10 hover:border-primary/20 dark:hover:border-primary/50 flex flex-col h-full glow-border"
            >
              <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-primary to-secondary transform scale-x-0 group-hover:scale-x-100 transition-transform duration-500 rounded-t-2xl"></div>
              
              <div className="mb-6 relative">
                <div className="w-14 h-14 rounded-xl bg-primary/5 group-hover:bg-primary/10 flex items-center justify-center transition-colors duration-300">
                  <img
                    src={item.image}
                    alt={item.title}
                    className="w-8 h-8 object-contain"
                  />
                </div>
              </div>

              <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-3 group-hover:text-primary dark:group-hover:text-primary transition-colors">
                {item.title}
              </h3>
              
              <p className="text-slate-600 dark:text-slate-300 mb-6 flex-grow leading-relaxed">
                {item.shortDesc}
              </p>

              <div className="space-y-4">
                <div className="flex flex-wrap gap-2">
                  {item.technologies.slice(0, 3).map((tech) => (
                    <span
                      key={tech}
                      className="text-xs font-medium px-2.5 py-1 rounded-full bg-slate-100 dark:bg-white/10 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-white/5"
                    >
                      {tech}
                    </span>
                  ))}
                  {item.technologies.length > 3 && (
                    <span className="text-xs font-medium px-2.5 py-1 rounded-full bg-slate-50 dark:bg-white/5 text-slate-500 dark:text-slate-400 border border-slate-200 dark:border-white/5">
                      +{item.technologies.length - 3}
                    </span>
                  )}
                </div>

                <Link
                  to={`/services/${slugify(item.title)}`}
                  className="inline-flex items-center gap-2 text-primary font-semibold group-hover:gap-3 transition-all duration-300"
                >
                  Explore Service <ArrowRight size={18} />
                </Link>
              </div>
            </div>
          ))}
        </div>

        <div className="mt-16 text-center">
          <ArrowLinkButton to="/contact">Get a Custom Proposal</ArrowLinkButton>
        </div>
      </div>
    </section>
  );
};

export default ServicesWeProvide;
