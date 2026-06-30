import React, { lazy, useState } from "react";
import { Navigate, useParams, Link } from "react-router-dom";
import { services } from "../data/services";
import SEO from "../components/SEO";
import { companyDetails } from "../data/constant";
import { ChevronDown, CheckCircle2, ShieldCheck, Zap, Sparkles, Code2, ArrowRight } from "lucide-react";

const BlogsSection = lazy(() => import("../components/website/BlogsSection"));

const slugify = (text) => text.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '');

const serviceFaqs = {
  "AI Calling Agency": [
    { q: "What is the response latency of your AI voice agents?", a: "Our custom voice agents operate at sub-500ms conversational response latency, making them indistinguishable from human SDRs in natural conversation flows." },
    { q: "How do your voice agents handle complex customer questions?", a: "When a conversation reaches highly nuanced logic or complex questions, the agent executes a seamless human handoff, transferring the call and full transcript to a live member of your team." },
    { q: "Can the voice agent write data directly into our CRM?", a: "Yes. We code direct integration modules from first principles to write lead records, booking logs, and sentiment analysis scores directly into your CRM database." }
  ],
  "Web Development": [
    { q: "Do you build custom web applications or use pre-made templates?", a: "We write all corporate portals and web products from first principles. We don't use bloated templates, ensuring maximum page speed and customized control." },
    { q: "How do you optimize website performance for Google search algorithms?", a: "We optimize Largest Contentful Paint (LCP) and Interaction to Next Paint (INP) to sub-200ms levels using Next.js rendering, clean CSS structure, and optimized asset delivery networks." },
    { q: "Can you integrate our existing third-party business software?", a: "Yes. We orchestrate API connections between your website, ERP systems, local databases, and third-party SaaS tools to automate data updates." }
  ],
  "App Development": [
    { q: "Do you develop native mobile apps or cross-platform hybrid apps?", a: "We develop both native apps (Swift for iOS, Kotlin for Android) and high-performance cross-platform apps using Flutter or React Native, depending on your performance and launch requirements." },
    { q: "How do you handle App Store and Google Play submissions?", a: "We handle the entire App Store Optimization (ASO) and submission process, ensuring all guidelines, privacy policies, and verification steps are completed successfully." },
    { q: "What security measures do you implement in mobile applications?", a: "We enforce end-to-end SSL pinning, biometric authentication, secure local keychain storage, and code obfuscation to protect user data from reverse engineering." }
  ],
  "Game Development": [
    { q: "Which game engines do you use for development?", a: "We use Unity and Unreal Engine depending on target platforms and graphical fidelity requirements, along with custom C++ modules for low-level physics and networking." },
    { q: "Do you handle 3D asset modeling and animation in-house?", a: "Yes, our studio has dedicated 3D artists, animators, and sound engineers to deliver cohesive creative assets and high-fidelity textures." },
    { q: "Can you build multiplayer systems with real-time networking?", a: "Yes. We design high-scale backends using custom game server hosting, WebSockets, and state-sync protocols to support real-time competitive gameplay." }
  ],
  "UX-UI Design": [
    { q: "What is your approach to user interface (UI) and user experience (UX) design?", a: "Our approach is human-centered. We conduct user journey mapping, design interactive wireframes, and run user testing sprints to eliminate conversion friction." },
    { q: "Which design tools do you utilize for prototyping?", a: "We primarily use Figma for real-time collaboration, interactive prototyping, and component-based design systems that speed up the coding phase." },
    { q: "How do you ensure accessibility (a11y) in your designs?", a: "We design according to WCAG 2.1 AA standards, ensuring proper color contrast ratios, screen reader compatibility, and clear keyboard focus indicators." }
  ],
  "Blockchain": [
    { q: "Which smart contract languages and chains do you support?", a: "We write smart contracts in Solidity and Rust, deploying on Ethereum, Solana, and EVM-compatible networks, with gas optimization and strict security auditing." },
    { q: "What is your process for auditing smart contracts for security vulnerabilities?", a: "We execute automated static analysis scans, run manual line-by-line code reviews, and build simulated test harnesses to prevent re-entrancy and overflow bugs." },
    { q: "Can you build decentralized applications (dApps) from scratch?", a: "Yes. We build complete Web3 portals, integrating wallets like MetaMask, Phantom, and WalletConnect with decentralized backends and IPFS storage." }
  ],
  "Infrastructure": [
    { q: "Which cloud providers do you design architectures for?", a: "We design and deploy on AWS, Google Cloud (GCP), and Microsoft Azure, selecting services that optimize cost, latency, and data compliance." },
    { q: "How do you implement Infrastructure as Code (IaC)?", a: "We write modular Terraform blueprints to define your network VPC, security groups, and serverless compute clusters, enabling reproducible environment setups." },
    { q: "Do you set up automated continuous integration and delivery (CI/CD) pipelines?", a: "Yes, we automate deployment pipelines using GitHub Actions, GitLab CI, or Jenkins to test, containerize, and deploy code securely with zero downtime." }
  ],
  "AI Automation": [
    { q: "Can you automate workflows between apps that do not have public APIs?", a: "Yes. In addition to standard API connections via Zapier/Make, we write custom browser automation scripts and Robotic Process Automation (RPA) tools to sync legacy software." },
    { q: "How do you handle unstructured data like PDF invoices or email text?", a: "We implement Intelligent Document Processing (IDP) using OCR models and LLMs to classify, extract, and format text data from scanned documents automatically." },
    { q: "What is the typical operational efficiency gain after automation?", a: "Clients typically see an 80% reduction in manual data entry times and a 100% reduction in human input errors within the first month of deployment." }
  ],
  "Data Analytics": [
    { q: "How do you sync data from multiple business tools into a single dashboard?", a: "We build automated ETL (Extract, Transform, Load) pipelines to pull data from your marketing, sales, and financial APIs into centralized data warehouses like BigQuery." },
    { q: "Which business intelligence (BI) tools do you implement?", a: "We design and deploy custom reports in Tableau, PowerBI, and build bespoke web-based React analytics panels for tailored client requirements." },
    { q: "Do you offer machine learning modeling for predictive analytics?", a: "Yes. We build custom models for customer lifetime value (LTV) forecasting, churn prediction, inventory demand spikes, and anomaly detection." }
  ]
};

const ServiceDetails = () => {
  const { name } = useParams();
  const data = services.find((service) => service.title === name || slugify(service.title) === name);
  const [openFaq, setOpenFaq] = useState(null);

  if (!data) return <Navigate to="/" />;

  // Force clean kebab-case URLs (e.g. redirect Game%20Development to game-development)
  if (name !== slugify(data.title)) {
    return <Navigate to={`/services/${slugify(data.title)}`} replace />;
  }

  const faqs = serviceFaqs[data.title] || [];

  const structuredData = {
    "@context": "https://schema.org",
    "@type": "Service",
    "serviceType": data.title,
    "provider": {
      "@type": "Organization",
      "name": companyDetails.name,
      "url": "https://panthm.com"
    },
    "description": data.shortDesc,
    "areaServed": "Worldwide",
    "hasOfferCatalog": {
      "@type": "OfferCatalog",
      "name": data.title,
      "itemListElement": data.technologies.map((tech, index) => ({
        "@type": "Offer",
        "itemOffered": {
          "@type": "Service",
          "name": tech
        },
        "position": index + 1
      }))
    }
  };

  return (
    <div className="pt-20 bg-white dark:bg-[#0a0a0a] min-h-screen">
      <SEO
        title={data.title}
        description={data.shortDesc || `Professional ${data.title} services by PANTHM AI Labs. Expert team delivering cutting-edge solutions using ${data.technologies.join(", ")}.`}
        keywords={`${data.title}, ${data.technologies.join(", ")}, software development, web development, app development, technology services`}
        image={data.image}
        url={`https://panthm.com/services/${slugify(data.title)}`}
        structuredData={structuredData}
        faqs={faqs.map(faq => ({ question: faq.q, answer: faq.a }))}
      />
      <div className="bg-slate-900 dark:bg-[#050505] py-24 text-white border-b border-white/5 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-primary/10 to-secondary/10 pointer-events-none"></div>
        <div className="wrapper relative z-10 space-y-4">
          <Link to="/services" className="text-primary hover:underline text-sm font-semibold flex items-center gap-1.5 w-fit">
            ← Back to Services
          </Link>
          <h1 className="heading max-w-4xl text-white mt-2">{data.title}</h1>
          <p className="text-slate-400 max-w-2xl text-lg leading-relaxed">{data.shortDesc}</p>
        </div>
      </div>
      
      <div className="wrapper py-20 space-y-24">
        {/* Grids with Images */}
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          <div className="space-y-6">
            <div
              className="prose prose-lg prose-slate dark:prose-invert"
              dangerouslySetInnerHTML={{ __html: data.html.firstSection }}
            ></div>
          </div>
          <div className="rounded-2xl overflow-hidden shadow-xl aspect-video border border-slate-100 dark:border-white/5">
            <img
              src={data.detailsPageImages.first}
              className="w-full h-full object-cover"
              alt={data.title}
            />
          </div>
        </div>

        {/* Technologies Grid */}
        <div className="p-8 bg-slate-50 dark:bg-white/5 rounded-3xl border border-slate-100 dark:border-white/10 space-y-6">
          <div className="space-y-2">
            <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-400">
              Core Technologies &amp; Frameworks
            </h3>
            <p className="text-slate-600 dark:text-slate-300 text-sm">
              We leverage enterprise-grade technologies to construct stable, scalable infrastructures.
            </p>
          </div>
          <div className="flex flex-wrap gap-3">
            {data.technologies.map((tech, idx) => (
              <span
                key={idx}
                className="px-4 py-2 text-sm font-semibold rounded-xl bg-white dark:bg-white/10 text-slate-800 dark:text-slate-200 border border-slate-200 dark:border-white/5 shadow-sm"
              >
                {tech}
              </span>
            ))}
          </div>
        </div>

        <div className="grid lg:grid-cols-2 gap-12 items-center">
          <div className="order-2 lg:order-1 rounded-2xl overflow-hidden shadow-xl aspect-video border border-slate-100 dark:border-white/5">
            <img
              src={data.detailsPageImages.second}
              className="w-full h-full object-cover"
              alt={data.title}
            />
          </div>
          <div className="order-1 lg:order-2 space-y-6">
            <div
              className="prose prose-lg prose-slate dark:prose-invert"
              dangerouslySetInnerHTML={{ __html: data.html.secondSection }}
            ></div>
          </div>
        </div>

        {/* Methodology Timeline */}
        <div className="space-y-8">
          <div className="text-center max-w-2xl mx-auto space-y-2">
            <h2 className="text-2xl md:text-3xl font-bold text-slate-900 dark:text-white">Our Engineering Process</h2>
            <p className="text-slate-500 dark:text-slate-400 text-sm">
              A structured lifecycle that ensures precision, performance, and deterministic outcomes.
            </p>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-5 gap-6">
            {[
              { s: "01", t: "Discovery", d: "Deep-dive scoping and database planning", i: Sparkles },
              { s: "02", t: "Architecture", d: "Database mapping & interface flow", i: Code2 },
              { s: "03", t: "Engineering", d: "Clean first-principles code logic", i: Code2 },
              { s: "04", t: "QA & Audit", d: "Security reviews & speed testing", i: ShieldCheck },
              { s: "05", t: "Deployment", d: "Global edge CDN launch", i: Zap }
            ].map((step, idx) => (
              <div key={idx} className="p-6 bg-slate-50 dark:bg-white/5 rounded-2xl border border-slate-100 dark:border-white/10 relative group">
                <span className="text-3xl font-black text-primary/10 absolute top-4 right-4">{step.s}</span>
                <step.i className="text-primary w-6 h-6 mb-4" />
                <h4 className="font-bold text-slate-900 dark:text-white text-base mb-1">{step.t}</h4>
                <p className="text-slate-500 dark:text-slate-400 text-xs leading-relaxed">{step.d}</p>
              </div>
            ))}
          </div>
        </div>

        <div className="grid lg:grid-cols-2 gap-12 items-center">
          <div className="space-y-6">
            <div
              className="prose prose-lg prose-slate dark:prose-invert"
              dangerouslySetInnerHTML={{ __html: data.html.thirdSection }}
            ></div>
          </div>
          <div className="rounded-2xl overflow-hidden shadow-xl aspect-video border border-slate-100 dark:border-white/5">
            <img
              src={data.detailsPageImages.third}
              className="w-full h-full object-cover"
              alt={data.title}
            />
          </div>
        </div>

        {/* Dynamic FAQ Accordion */}
        {faqs.length > 0 && (
          <div className="space-y-8 pt-8 border-t border-slate-100 dark:border-white/10">
            <div className="max-w-2xl space-y-2">
              <h2 className="text-2xl md:text-3xl font-bold text-slate-900 dark:text-white">Service FAQs</h2>
              <p className="text-slate-500 dark:text-slate-400 text-sm">
                Common technical and operational questions regarding our {data.title} services.
              </p>
            </div>
            <div className="space-y-4 max-w-4xl">
              {faqs.map((faq, idx) => {
                const isOpen = openFaq === idx;
                return (
                  <div key={idx} className="border border-slate-100 dark:border-white/10 rounded-2xl bg-slate-50/50 dark:bg-white/5 overflow-hidden transition-all duration-300">
                    <button
                      onClick={() => setOpenFaq(isOpen ? null : idx)}
                      className="w-full px-6 py-5 flex items-center justify-between text-left gap-4 font-bold text-slate-800 dark:text-slate-100 focus:outline-none"
                    >
                      <span className="text-base md:text-lg">{faq.q}</span>
                      <ChevronDown
                        size={20}
                        className={`text-slate-400 dark:text-slate-500 transition-transform duration-300 flex-shrink-0 ${
                          isOpen ? "transform rotate-180 text-primary" : ""
                        }`}
                      />
                    </button>
                    <div
                      className={`transition-all duration-300 ease-in-out overflow-hidden ${
                        isOpen ? "max-h-[300px] border-t border-slate-100 dark:border-white/5" : "max-h-0"
                      }`}
                    >
                      <div className="px-6 py-5 text-sm md:text-base text-slate-600 dark:text-slate-300 leading-relaxed bg-white/20 dark:bg-black/20">
                        {faq.a}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>
      
      <div className="bg-slate-50 dark:bg-[#050505] py-20 border-t border-slate-100 dark:border-white/5">
        <BlogsSection />
      </div>
    </div>
  );
};

export default ServiceDetails;
