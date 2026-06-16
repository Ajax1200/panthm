import React from "react";
import {
  appDevelopmentServices,
  webDevelopmentServices,
  aiCallingServices,
} from "../../data/constant";
import { ArrowScrollButton } from "../ArrowButtons";

const LandingServices = ({ page }) => {
  let services;
  let title;

  if (page === "web") {
    services = webDevelopmentServices;
    title = "Our Web Development Services";
  } else if (page === "app") {
    services = appDevelopmentServices;
    title = "Our App Development Services";
  } else if (page === "ai-calling") {
    services = aiCallingServices;
    title = "Our AI Calling Capabilities";
  }

  return (
    <section id="services" className="py-20 bg-slate-50">
      <div className="wrapper">
        <div className="text-center max-w-3xl mx-auto mb-16 space-y-4">
          <h2 data-aos="fade-up" className="section-heading">
            {title}
          </h2>
          <p data-aos="fade-up" className="text-slate-600 text-lg">
            Comprehensive solutions tailored to elevate your digital presence and drive business growth.
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-8 mb-12">
          {services.map((item, i) => (
            <div
              key={item.title}
              data-aos="fade-up"
              data-aos-delay={i * 100}
              className="group relative bg-white rounded-3xl overflow-hidden shadow-lg hover:shadow-2xl transition-all duration-500 border border-slate-100"
            >
              <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-secondary/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>

              <div className="p-8 md:p-10 relative z-10 flex flex-col h-full">
                <div className="mb-6 overflow-hidden rounded-2xl aspect-video">
                  <img
                    src={item.image}
                    alt={item.title}
                    className="w-full h-full object-cover transform group-hover:scale-110 transition-transform duration-700"
                  />
                </div>

                <h3 className="text-2xl font-bold text-slate-900 mb-4 group-hover:text-primary transition-colors">
                  {item.title}
                </h3>

                <p className="text-slate-600 leading-relaxed mb-6 flex-grow">
                  {item.description}
                </p>
              </div>
            </div>
          ))}
        </div>

        <div className="text-center">
          <ArrowScrollButton to="contact">Request a quote</ArrowScrollButton>
        </div>
      </div>
    </section>
  );
};

export default LandingServices;
