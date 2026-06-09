import React, { lazy } from "react";
import bannerImg from "../assets/images/services-banner.webp";
import { ArrowLinkButton } from "../components/ArrowButtons";
import { ArrowRight } from "lucide-react";
import SEO from "../components/SEO";

const ContactForm = lazy(() => import("../components/ContactForm"));
const ServicesWeProvide = lazy(() => import("../components/website/ServicesWeProvide"));

const Services = () => {
  const structuredData = {
    "@context": "https://schema.org",
    "@type": "Service",
    "serviceType": "Software Development Services",
    "provider": {
      "@type": "Organization",
      "name": "PANTHM AI Labs"
    },
    "areaServed": "Worldwide",
    "hasOfferCatalog": {
      "@type": "OfferCatalog",
      "name": "Software Development Services",
      "itemListElement": [
        {
          "@type": "Offer",
          "itemOffered": {
            "@type": "Service",
            "name": "Web Development"
          }
        },
        {
          "@type": "Offer",
          "itemOffered": {
            "@type": "Service",
            "name": "App Development"
          }
        },
        {
          "@type": "Offer",
          "itemOffered": {
            "@type": "Service",
            "name": "AI Solutions"
          }
        },
        {
          "@type": "Offer",
          "itemOffered": {
            "@type": "Service",
            "name": "Data Analytics"
          }
        }
      ]
    }
  };

  return (
    <>
      <SEO
        title="Services"
        description="Comprehensive software development services including web development, mobile app development, AI solutions, Data Analytics, blockchain, game development, and UI/UX design. Expert team delivering cutting-edge technology solutions."
        keywords="web development services, mobile app development services, AI solutions, data analytics services, business intelligence, blockchain development, game development, UI/UX design, software development services, custom software development"
        structuredData={structuredData}
      />
      {/* Hero Section */}
      <section className="relative min-h-[60vh] flex items-center justify-center overflow-hidden">
        <div className="absolute inset-0 z-0">
          <img
            src={bannerImg}
            alt="Services Banner"
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-slate-900/80"></div>
        </div>
        
        <div className="wrapper relative z-10 text-center text-white space-y-6 max-w-4xl mx-auto pt-20">
          <h1 data-aos="fade-up" className="heading text-white">
            Engineering <span className="text-primary">Excellence</span>
          </h1>
          <p data-aos="fade-up" data-aos-delay="100" className="text-lg md:text-xl text-slate-300 leading-relaxed">
            We specialize in delivering innovative software solutions that empower businesses to succeed in the digital age. From web platforms to immersive games, we bring your vision to life.
          </p>
          <div data-aos="fade-up" data-aos-delay="200" className="pt-4">
            <ArrowLinkButton to="/contact">Start Your Project</ArrowLinkButton>
          </div>
        </div>
      </section>

      <ServicesWeProvide />
      <ContactForm />
    </>
  );
};

export default Services;
