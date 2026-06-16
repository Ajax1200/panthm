import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import SEO from "../components/SEO";
import { ArrowRight, MapPin, Cpu, Globe } from "lucide-react";

// Mapped services for UX
const SERVICES = [
  { slug: "ai-calling-agency", name: "AI Calling & Telecalling Agents" },
  { slug: "web-development", name: "Custom Web Development" },
  { slug: "app-development", name: "Mobile App Development" },
  { slug: "game-development", name: "Interactive Game Studio" },
  { slug: "ux-ui-design", name: "UI/UX Experience Design" },
  { slug: "blockchain", name: "Web3 & Blockchain Solutions" },
  { slug: "infrastructure", name: "Cloud Infrastructure & DevOps" },
  { slug: "ai-automation", name: "Business Process AI Automation" }
];

const INDUSTRIES = [
  { slug: "real-estate", name: "Real Estate & PropTech" },
  { slug: "healthcare", name: "Healthcare & MedTech" },
  { slug: "finance", name: "Banking, Finance & FinTech" },
  { slug: "retail", name: "Retail & Consumer Goods" },
  { slug: "logistics", name: "Logistics & Supply Chain" },
  { slug: "ecommerce", name: "E-Commerce & Digital Stores" },
  { slug: "hospitality", name: "Hospitality & Leisure" },
  { slug: "education", name: "Education & EdTech" }
];

const LOCATIONS = [
  { slug: "pune", name: "Pune, India" },
  { slug: "mumbai", name: "Mumbai, India" },
  { slug: "bangalore", name: "Bangalore, India" },
  { slug: "dubai", name: "Dubai, UAE" },
  { slug: "london", name: "London, UK" },
  { slug: "new-york", name: "New York, USA" }
];

// High-value featured local solutions for search engine crawlability (SEO internal links)
const FEATURED_LINKS = [
  { service: "ai-calling-agency", serviceName: "AI Calling Agents", industry: "real-estate", industryName: "Real Estate", location: "pune", locationName: "Pune" },
  { service: "ai-calling-agency", serviceName: "AI Calling Agents", industry: "healthcare", industryName: "Healthcare", location: "mumbai", locationName: "Mumbai" },
  { service: "ai-calling-agency", serviceName: "AI Calling Agents", industry: "hospitality", industryName: "Hospitality", location: "pune", locationName: "Pune" },
  
  { service: "web-development", serviceName: "Web Development", industry: "ecommerce", industryName: "E-Commerce", location: "bangalore", locationName: "Bangalore" },
  { service: "web-development", serviceName: "Web Development", industry: "finance", industryName: "Finance", location: "mumbai", locationName: "Mumbai" },
  { service: "web-development", serviceName: "Web Development", industry: "real-estate", industryName: "Real Estate", location: "dubai", locationName: "Dubai" },

  { service: "ai-automation", serviceName: "AI Automation", industry: "logistics", industryName: "Logistics", location: "pune", locationName: "Pune" },
  { service: "ai-automation", serviceName: "AI Automation", industry: "retail", industryName: "Retail", location: "london", locationName: "London" },
  { service: "ai-automation", serviceName: "AI Automation", industry: "finance", industryName: "Finance", location: "new-york", locationName: "New York" },

  { service: "app-development", serviceName: "App Development", industry: "healthcare", industryName: "Healthcare", location: "pune", locationName: "Pune" },
  { service: "app-development", serviceName: "App Development", industry: "ecommerce", industryName: "E-Commerce", location: "mumbai", locationName: "Mumbai" },
  { service: "app-development", serviceName: "App Development", industry: "travel-tourism", industryName: "Travel & Tourism", location: "dubai", locationName: "Dubai" }
];

const SolutionsDirectory = () => {
  const navigate = useNavigate();
  const [selectedService, setSelectedService] = useState(SERVICES[0].slug);
  const [selectedIndustry, setSelectedIndustry] = useState(INDUSTRIES[0].slug);
  const [selectedLocation, setSelectedLocation] = useState(LOCATIONS[0].slug);

  const handleGo = () => {
    navigate(`/solutions/${selectedService}/${selectedIndustry}/${selectedLocation}`);
  };

  return (
    <div className="pt-32 pb-20 bg-slate-50 dark:bg-[#0a0a0a] min-h-screen">
      <SEO
        title="Solutions Directory"
        description="Browse custom engineering and AI automation solutions by service, industry, and location. Find targeted digital integrations by PANTHM AI Labs."
        keywords="AI solutions, custom engineering solutions, AI automation directory, business automation directory"
        url="https://panthm.com/solutions"
      />

      <div className="wrapper space-y-16">
        {/* Header */}
        <div className="text-center max-w-3xl mx-auto space-y-4">
          <h1 className="heading">
            Enterprise <span className="text-primary">Solutions Directory</span>
          </h1>
          <p className="text-slate-600 dark:text-slate-400 text-lg">
            Configure and explore custom-architected system blueprints optimized specifically for your industry, service requirements, and region.
          </p>
        </div>

        {/* Interactive Configuration Panel */}
        <div className="max-w-4xl mx-auto p-8 bg-white dark:bg-[#050505] rounded-3xl border border-slate-200 dark:border-white/10 shadow-xl space-y-8 relative overflow-hidden">
          <div className="absolute top-0 left-0 w-full h-1.5 bg-gradient-to-r from-primary via-purpleColor to-secondary"></div>
          
          <h3 className="text-xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <Cpu className="text-primary w-5 h-5" /> Interactive Blueprint Configurator
          </h3>

          <div className="grid md:grid-cols-3 gap-6">
            {/* Service Select */}
            <div className="space-y-2">
              <label className="text-sm font-semibold text-slate-500 dark:text-slate-400 flex items-center gap-1.5">
                Select Service
              </label>
              <select
                value={selectedService}
                onChange={(e) => setSelectedService(e.target.value)}
                className="w-full px-4 py-3 bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-xl text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all font-medium"
              >
                {SERVICES.map((s) => (
                  <option key={s.slug} value={s.slug}>{s.name}</option>
                ))}
              </select>
            </div>

            {/* Industry Select */}
            <div className="space-y-2">
              <label className="text-sm font-semibold text-slate-500 dark:text-slate-400 flex items-center gap-1.5">
                Select Industry
              </label>
              <select
                value={selectedIndustry}
                onChange={(e) => setSelectedIndustry(e.target.value)}
                className="w-full px-4 py-3 bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-xl text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all font-medium"
              >
                {INDUSTRIES.map((i) => (
                  <option key={i.slug} value={i.slug}>{i.name}</option>
                ))}
              </select>
            </div>

            {/* Location Select */}
            <div className="space-y-2">
              <label className="text-sm font-semibold text-slate-500 dark:text-slate-400 flex items-center gap-1.5">
                Select Location
              </label>
              <select
                value={selectedLocation}
                onChange={(e) => setSelectedLocation(e.target.value)}
                className="w-full px-4 py-3 bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-xl text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all font-medium"
              >
                {LOCATIONS.map((l) => (
                  <option key={l.slug} value={l.slug}>{l.name}</option>
                ))}
              </select>
            </div>
          </div>

          <div className="flex justify-center pt-4">
            <button
              onClick={handleGo}
              className="inline-flex items-center gap-2 px-8 py-3.5 rounded-full bg-primary text-white font-bold shadow-lg shadow-primary/25 hover:bg-primary/90 hover:-translate-y-0.5 transition-all duration-200"
            >
              Generate Custom Blueprint <ArrowRight size={18} />
            </button>
          </div>
        </div>

        {/* Featured Crawlable Links Grid (SEO Engine) */}
        <div className="space-y-8">
          <div className="max-w-2xl space-y-2">
            <h2 className="text-2xl md:text-3xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <Globe className="text-primary w-6 h-6" /> Featured Regional Blueprint Integrations
            </h2>
            <p className="text-slate-500 dark:text-slate-400 text-sm">
              Explore custom system integrations and AI optimizations mapped directly to prominent regional B2B sectors.
            </p>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {FEATURED_LINKS.map((link, idx) => (
              <Link
                key={idx}
                to={`/solutions/${link.service}/${link.industry}/${link.location}`}
                className="p-6 bg-white dark:bg-[#050505] rounded-2xl border border-slate-200 dark:border-white/10 shadow-sm hover:shadow-md hover:border-primary/50 dark:hover:border-primary/50 transition-all duration-200 group flex flex-col justify-between"
              >
                <div className="space-y-4">
                  <div className="flex items-center justify-between text-xs text-primary font-bold uppercase tracking-wider">
                    <span>{link.serviceName}</span>
                    <span className="px-2 py-0.5 bg-primary/10 rounded-full flex items-center gap-1 font-medium lowercase">
                      <MapPin size={10} /> {link.locationName}
                    </span>
                  </div>
                  
                  <h4 className="font-bold text-slate-900 dark:text-white text-base leading-snug group-hover:text-primary transition-colors">
                    Custom {link.serviceName} Architectures for {link.industryName} in {link.locationName}
                  </h4>
                  
                  <p className="text-slate-500 dark:text-slate-400 text-xs leading-relaxed line-clamp-2">
                    Discover how PANTHM's Consolidated Architecture drives efficiency and coordinates integrations specifically for {link.industryName} firms in {link.locationName}.
                  </p>
                </div>

                <div className="mt-4 pt-4 border-t border-slate-100 dark:border-white/5 flex items-center justify-between text-xs font-bold text-slate-400 group-hover:text-primary transition-colors">
                  <span>View Details</span>
                  <ArrowRight size={14} className="transform group-hover:translate-x-1 transition-transform" />
                </div>
              </Link>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default SolutionsDirectory;
