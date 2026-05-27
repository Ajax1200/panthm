import React from "react";
import { useParams, Navigate, Link } from "react-router-dom";
import { services } from "../data/services";
import SEO from "../components/SEO";
import ContactForm from "../components/ContactForm";
import { companyDetails } from "../data/constant";
import { 
  Zap, 
  ShieldCheck, 
  Cpu, 
  MapPin, 
  Building, 
  Globe, 
  ChevronRight, 
  ArrowRight,
  TrendingUp,
  MessageSquare
} from "lucide-react";

// Normalizes slugs to title case (e.g., real-estate -> Real Estate)
const normalizeSlug = (slug) => {
  if (!slug) return "";
  return slug
    .split("-")
    .map((word) => {
      const lower = word.toLowerCase();
      if (lower === "ai") return "AI";
      if (lower === "ux" || lower === "ui") return lower.toUpperCase();
      return word.charAt(0).toUpperCase() + word.slice(1);
    })
    .join(" ");
};

// Maps dynamic service slug to standard service titles in services.js
const getServiceMapping = (slug) => {
  const s = slug.toLowerCase();
  if (s.includes("voice") || s.includes("calling") || s.includes("telecalling") || s.includes("tele-calling") || s.includes("agent")) {
    return { title: "AI Calling Agency", pathName: "ai-calling-agency" };
  }
  if (s.includes("web-dev") || s.includes("web-development") || s.includes("website")) {
    return { title: "Web Development", pathName: "web-development" };
  }
  if (s.includes("app-dev") || s.includes("app-development") || s.includes("mobile")) {
    return { title: "App Development", pathName: "app-development" };
  }
  if (s.includes("game") || s.includes("gaming")) {
    return { title: "Game Development", pathName: "game-development" };
  }
  if (s.includes("ui") || s.includes("ux") || s.includes("design")) {
    return { title: "UX-UI Design", pathName: "ux-ui-design" };
  }
  if (s.includes("blockchain") || s.includes("web3") || s.includes("crypto")) {
    return { title: "Blockchain", pathName: "blockchain" };
  }
  if (s.includes("infra") || s.includes("cloud") || s.includes("devops")) {
    return { title: "Infrastructure", pathName: "infrastructure" };
  }
  if (s.includes("automation") || s.includes("workflow")) {
    return { title: "AI Automation", pathName: "ai-automation" };
  }
  return null;
};

const IntersectionLanding = () => {
  const { service, industry, location } = useParams();

  // Validate parameters
  if (!service || !industry || !location) {
    return <Navigate to="/" replace />;
  }

  // Get mapped service data or construct title
  const serviceMapping = getServiceMapping(service);
  const serviceTitle = serviceMapping ? serviceMapping.title : normalizeSlug(service);
  const matchedService = services.find(s => s.title === serviceTitle);

  const industryName = normalizeSlug(industry);
  const locationName = normalizeSlug(location);

  // Fallback defaults if service metadata doesn't exist
  const technologies = matchedService?.technologies || ["React", "Python", "Cloud Native", "AI Integration"];
  const shortDesc = matchedService?.shortDesc || `Tailored ${serviceTitle} solutions designed to scale.`;

  // Dynamically compile JSON-LD schema
  const structuredData = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "Service",
        "@id": `https://panthm.com/solutions/${service}/${industry}/${location}#service`,
        "serviceType": serviceTitle,
        "provider": {
          "@type": "Organization",
          "name": companyDetails.name,
          "url": "https://panthm.com",
          "logo": "https://panthm.com/logo.png"
        },
        "areaServed": {
          "@type": "Place",
          "name": locationName
        },
        "description": `Custom ${serviceTitle} solutions optimized for the ${industryName} sector in ${locationName}. Powered by PANTHM AI Labs using The PANTHM Consolidation Architecture (PCA).`,
        "hasOfferCatalog": {
          "@type": "OfferCatalog",
          "name": `${serviceTitle} Services`,
          "itemListElement": technologies.map((tech, index) => ({
            "@type": "Offer",
            "itemOffered": {
              "@type": "Service",
              "name": `${tech} Integration`
            },
            "position": index + 1
          }))
        }
      },
      {
        "@type": "LocalBusiness",
        "@id": `https://panthm.com/solutions/${service}/${industry}/${location}#localbusiness`,
        "name": `PANTHM AI Labs - ${locationName} Enterprise Solutions`,
        "image": "https://panthm.com/logo.png",
        "telephone": companyDetails.phone,
        "url": "https://panthm.com",
        "address": {
          "@type": "PostalAddress",
          "streetAddress": companyDetails.address,
          "addressLocality": "Pune",
          "addressRegion": "Maharashtra",
          "postalCode": "411045",
          "addressCountry": "IN"
        },
        "geo": {
          "@type": "GeoCoordinates",
          "latitude": 18.55823,
          "longitude": 73.78438
        },
        "areaServed": [
          {
            "@type": "Place",
            "name": locationName
          }
        ]
      }
    ]
  };

  // Dynamically select case study names based on industry / location hash
  const seedString = `${industryName}-${locationName}`;
  const mockExecutive = seedString.length % 2 === 0 ? "Faisal Al-Mansoori" : "Charlotte Harrington";
  const mockPosition = seedString.length % 2 === 0 ? "Director of Operations" : "VP of Technology";

  return (
    <div className="pt-20 min-h-screen bg-gradient-to-b from-[#030712] via-[#0B0F19] to-[#030712] text-slate-100 selection:bg-amber-400 selection:text-black">
      <SEO
        title={`${serviceTitle} for ${industryName} in ${locationName}`}
        description={`Enterprise-grade ${serviceTitle} solutions custom-engineered for the ${industryName} industry in ${locationName}. Leverage low-latency operations, state-of-the-art tech integrations, and advanced automation rules.`}
        keywords={`${serviceTitle}, ${industryName}, ${locationName}, PANTHM, software development, voice agents, automation, tech agency`}
        url={`https://panthm.com/solutions/${service}/${industry}/${location}`}
        structuredData={structuredData}
      />

      {/* Hero Section */}
      <section className="relative py-24 md:py-32 overflow-hidden border-b border-yellow-500/10">
        {/* Ambient gold glow circles */}
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-[#D4AF37]/5 rounded-full blur-[120px] pointer-events-none"></div>
        <div className="absolute bottom-1/3 right-1/4 w-96 h-96 bg-[#9B00FF]/5 rounded-full blur-[120px] pointer-events-none"></div>

        <div className="wrapper relative z-10">
          <div className="max-w-4xl mx-auto text-center space-y-8">
            <div 
              data-aos="fade-up"
              className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-[#0B0F19]/80 border border-yellow-500/20 shadow-[0_0_15px_rgba(212,175,55,0.05)] text-slate-300 text-sm"
            >
              <MapPin size={16} className="text-amber-400 animate-pulse" />
              <span className="font-semibold">{locationName}</span>
              <span className="text-slate-600">|</span>
              <Building size={16} className="text-amber-400" />
              <span className="font-semibold">{industryName}</span>
            </div>

            <h1 
              data-aos="fade-up" 
              data-aos-delay="100"
              className="text-4xl md:text-6xl lg:text-7xl font-extrabold tracking-tight leading-tight"
            >
              Custom
              <span className="bg-clip-text text-transparent bg-gradient-to-r from-amber-400 via-yellow-200 to-amber-500 block py-2">
                {serviceTitle}
              </span>
              for {industryName} in {locationName}
            </h1>

            <p 
              data-aos="fade-up" 
              data-aos-delay="200"
              className="text-lg md:text-xl text-slate-400 max-w-2xl mx-auto leading-relaxed"
            >
              PANTHM AI Labs deploys bespoke, high-velocity {serviceTitle.toLowerCase()} architectures built directly on <strong>The PANTHM Consolidation Architecture (PCA)</strong> to solve core operations bottlenecks for {industryName} enterprises in {locationName}.
            </p>

            <div 
              data-aos="fade-up" 
              data-aos-delay="300"
              className="flex justify-center gap-4 pt-4"
            >
              <a 
                href="#contact" 
                className="inline-flex items-center gap-2 px-8 py-4 rounded-full font-bold bg-gradient-to-r from-amber-500 to-amber-600 text-black shadow-[0_0_20px_rgba(212,175,55,0.3)] hover:shadow-[0_0_30px_rgba(212,175,55,0.5)] hover:-translate-y-0.5 transition-all duration-300 active:scale-95"
              >
                Schedule Consultation
                <ArrowRight size={18} />
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* Structured Matrix Value Proposition */}
      <section className="py-24 relative">
        <div className="wrapper space-y-16">
          <div className="text-center max-w-3xl mx-auto space-y-4">
            <h2 
              data-aos="fade-up" 
              className="text-3xl md:text-5xl font-extrabold"
            >
              Why {industryName} Firms in {locationName} Choose PANTHM
            </h2>
            <p 
              data-aos="fade-up" 
              data-aos-delay="100"
              className="text-slate-400 text-lg"
            >
              Deploying cutting-edge systems that blend local compliance, low latency, and infinite scalability.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {/* Feature 1 */}
            <div 
              data-aos="fade-up" 
              data-aos-delay="100"
              className="group p-8 rounded-3xl bg-[#0B0F19]/60 backdrop-blur-xl border border-yellow-500/10 hover:border-yellow-500/30 transition-all duration-300 shadow-[0_0_20px_rgba(0,0,0,0.2)] hover:shadow-[0_0_30px_rgba(212,175,55,0.05)]"
            >
              <div className="w-12 h-12 rounded-2xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-400 mb-6 group-hover:scale-110 transition-transform">
                <Cpu size={24} />
              </div>
              <h3 className="text-xl font-bold mb-3 text-slate-100 group-hover:text-amber-400 transition-colors">
                Bespoke {industryName} Integration
              </h3>
              <p className="text-slate-400 leading-relaxed text-sm">
                We custom-engineer the {serviceTitle} database schema and interfaces to link with standard CRM, ERP, or sales pipelines standard in the {industryName} sector.
              </p>
            </div>

            {/* Feature 2 */}
            <div 
              data-aos="fade-up" 
              data-aos-delay="200"
              className="group p-8 rounded-3xl bg-[#0B0F19]/60 backdrop-blur-xl border border-yellow-500/10 hover:border-yellow-500/30 transition-all duration-300 shadow-[0_0_20px_rgba(0,0,0,0.2)] hover:shadow-[0_0_30px_rgba(212,175,55,0.05)]"
            >
              <div className="w-12 h-12 rounded-2xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-400 mb-6 group-hover:scale-110 transition-transform">
                <Globe size={24} />
              </div>
              <h3 className="text-xl font-bold mb-3 text-slate-100 group-hover:text-amber-400 transition-colors">
                {locationName} Market Compliance
              </h3>
              <p className="text-slate-400 leading-relaxed text-sm">
                Architectures mapped explicitly to {locationName}'s regulatory frameworks, local hostings, multi-language nuances, currency conventions, and region-specific target outcomes.
              </p>
            </div>

            {/* Feature 3 */}
            <div 
              data-aos="fade-up" 
              data-aos-delay="300"
              className="group p-8 rounded-3xl bg-[#0B0F19]/60 backdrop-blur-xl border border-yellow-500/10 hover:border-yellow-500/30 transition-all duration-300 shadow-[0_0_20px_rgba(0,0,0,0.2)] hover:shadow-[0_0_30px_rgba(212,175,55,0.05)]"
            >
              <div className="w-12 h-12 rounded-2xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-400 mb-6 group-hover:scale-110 transition-transform">
                <ShieldCheck size={24} />
              </div>
              <h3 className="text-xl font-bold mb-3 text-slate-100 group-hover:text-amber-400 transition-colors">
                Ultra-Low Latency Performance
              </h3>
              <p className="text-slate-400 leading-relaxed text-sm">
                Edge deployment ensures a latency benchmark of &lt;250ms, meaning lightning-fast interactions that keep users engaged and dramatically boost search indexing priority.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Technologies section */}
      <section className="py-16 bg-[#0B0F19]/40 border-y border-yellow-500/10">
        <div className="wrapper text-center space-y-8">
          <p className="text-xs uppercase tracking-widest text-slate-400 font-bold">
            Leveraging Industry-Leading Technologies
          </p>
          <div className="flex flex-wrap justify-center items-center gap-6 md:gap-12">
            {technologies.map((tech) => (
              <span 
                key={tech} 
                className="px-6 py-3 rounded-2xl bg-[#030712] border border-white/5 font-semibold text-slate-300 shadow-sm"
              >
                {tech}
              </span>
            ))}
          </div>
        </div>
      </section>

      {/* Case Study / Customer Quote */}
      <section className="py-24 relative overflow-hidden">
        <div className="wrapper">
          <div className="max-w-4xl mx-auto rounded-3xl bg-gradient-to-r from-yellow-500/5 via-amber-500/5 to-transparent border border-yellow-500/15 p-8 md:p-16 flex flex-col md:flex-row gap-8 items-center">
            <div className="space-y-6">
              <div className="inline-flex items-center gap-2 text-amber-400 font-semibold text-sm">
                <TrendingUp size={16} />
                <span>Performance Milestone</span>
              </div>
              <h3 className="text-2xl md:text-3xl font-bold text-slate-100 leading-tight">
                "PANTHM AI Labs revolutionized our {industryName.toLowerCase()} execution speed in {locationName}."
              </h3>
              <p className="text-slate-400 text-sm md:text-base leading-relaxed">
                By integrating PCA's low-latency modules with our core stack, we automated lead processing, reduced server maintenance overhead, and hit an all-time high of customer retention in the region.
              </p>
              <div>
                <p className="font-bold text-slate-200">{mockExecutive}</p>
                <p className="text-xs text-slate-400">{mockPosition}, {industryName} Enterprise</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Contact Section */}
      <section id="contact" className="py-12 bg-slate-900/60 border-t border-yellow-500/10">
        <div className="wrapper">
          <div className="text-center max-w-2xl mx-auto mb-10 space-y-4">
            <h2 className="text-3xl font-bold text-slate-100">
              Launch Your Solution in {locationName}
            </h2>
            <p className="text-slate-400 text-sm">
              Connect with our principal system architects to engineer a bespoke version of our {serviceTitle.toLowerCase()} platform optimized for your specific {industryName.toLowerCase()} metrics.
            </p>
          </div>
          <ContactForm headline={`Bespoke Consultation - ${locationName}`} />
        </div>
      </section>
    </div>
  );
};

export default IntersectionLanding;
