import React, { lazy, useEffect, useRef, useState } from "react";
import ReactPlayer from "react-player";
import bannerVid from "../assets/vids/banner.mp4";
import {
  Ambulance,
  ArrowRight,
  BrainCircuit,
  BriefcaseBusiness,
  Cloudy,
  CodeXml,
  Cpu,
  Quote,
  StickyNote,
  Store,
  Tv,
  Zap,
  Shield,
  Users,
  Target,
  BarChart,
  Phone,
} from "lucide-react";
import { ReactComponent as icon1 } from "../assets/svg/services/Web Development.svg";
import { ReactComponent as icon2 } from "../assets/svg/services/App Development.svg";
import { Link } from "react-router-dom";
import howWeBuildCover from "../assets/images/how-we-build.jpeg";
import whyWorkWithUs1 from "../assets/images/whyworkwithus1.png";
import whyWorkWithUs2 from "../assets/images/whyworkwithus2.png";
import whyWorkWithUs3 from "../assets/images/whyworkwithus3.png";
import whyWorkWithUs4 from "../assets/images/whyworkwithus4.png";
import { ArrowLinkButton } from "../components/ArrowButtons";
import SEO from "../components/SEO";
import { companyDetails } from "../data/constant";

import TechMarquee from '../components/TechMarquee';

const ContactForm = lazy(() => import("../components/ContactForm"));
const BlogsSection = lazy(() => import("../components/website/BlogsSection"));
const Testimonials = lazy(() => import("../components/Testimonials"));
const ServicesWeProvide = lazy(() =>
  import("../components/website/ServicesWeProvide")
);

const bannerServices = [
  {
    id: 1,
    title: "Web Development",
    icon: icon1,
    desc: "Architecting high-performance digital ecosystems that drive conversion and engagement.",
    landingPageLink: "/web-development",
  },
  {
    id: 2,
    title: "App Development",
    icon: icon2,
    desc: "Crafting intuitive, native-quality mobile experiences for the connected world.",
    landingPageLink: "/app-development",
  },
  {
    id: 3,
    title: "AI Calling Agency",
    icon: Phone,
    desc: "Deploy intelligent voice agents that handle support, sales, and scheduling 24/7.",
    landingPageLink: "/ai-calling-agency",
  },
];

const industries = [
  { icon: Ambulance, title: "Healthcare" },
  { icon: BriefcaseBusiness, title: "Finance" },
  { icon: Cpu, title: "Deep Tech" },
  { icon: Store, title: "E-commerce" },
  { icon: Cloudy, title: "SaaS" },
  { icon: StickyNote, title: "Enterprise" },
  { icon: Tv, title: "Media" },
  { icon: BrainCircuit, title: "AI & ML" },
];

// Animated counter that triggers count-up on scroll into view
const AnimatedCounter = ({ stat, idx }) => {
  const [count, setCount] = useState(0);
  const ref = useRef(null);
  const hasAnimated = useRef(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !hasAnimated.current) {
          hasAnimated.current = true;
          const duration = 1500;
          const steps = 60;
          const increment = stat.value / steps;
          let current = 0;
          const timer = setInterval(() => {
            current += increment;
            if (current >= stat.value) {
              setCount(stat.value);
              clearInterval(timer);
            } else {
              setCount(Math.floor(current));
            }
          }, duration / steps);
        }
      },
      { threshold: 0.3 }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, [stat.value]);

  return (
    <div
      ref={ref}
      data-aos="fade-up"
      data-aos-delay={idx * 80}
      className="text-center group"
    >
      <div className="text-4xl md:text-5xl font-black text-slate-900 dark:text-white mb-2 tabular-nums">
        <span>{count}</span>
        <span className="text-primary">{stat.suffix}</span>
      </div>
      <p className="text-slate-500 font-medium text-sm md:text-base">{stat.label}</p>
    </div>
  );
};

const Home = () => {
  const structuredData = {
    "@context": "https://schema.org",
    "@type": "Organization",
    "name": companyDetails.name,
    "url": "https://panthm.com",
    "logo": "https://panthm.com/logo.png",
    "description": "Leading technology company specializing in web development, mobile app development, AI solutions, blockchain, and game development.",
    "address": {
      "@type": "PostalAddress",
      "streetAddress": "Icon Tower Office No. 702 Sr 114/5 ,115/1 ,114/6/3 BANER",
      "addressLocality": "Pune",
      "addressRegion": "Maharashtra",
      "postalCode": "411045",
      "addressCountry": "IN"
    },
    "contactPoint": {
      "@type": "ContactPoint",
      "telephone": "+917558646366",
      "contactType": "customer service",
      "email": "info@panthm.com"
    },
    "sameAs": [
      "https://www.linkedin.com/company/panthm-ai-labs",
      "https://x.com/panthmailabs",
      "https://www.facebook.com/panthm"
    ],
    "areaServed": "Worldwide",
    "knowsAbout": [
      "Web Development",
      "Mobile App Development",
      "AI Solutions",
      "Blockchain Development",
      "Game Development",
      "UI/UX Design",
      "Cloud Infrastructure",
      "Data Analytics"
    ]
  };

  return (
    <>
      <SEO
        title="Home"
        description="PANTHM AI Labs - Leading technology company specializing in web development, mobile app development, AI solutions, Data Analytics, blockchain, and game development. Transform your digital presence with cutting-edge technology."
        keywords="web development, app development, AI solutions, data analytics services, business intelligence dashboards, blockchain development, game development, mobile app development, React development, Node.js, Python, machine learning, software development company, Pune, India"
        structuredData={structuredData}
      />
      {/* Hero Section */}
      <section className="relative min-h-screen flex items-center overflow-hidden banner">
        <div className="absolute inset-0 z-0">
          <ReactPlayer
            url={bannerVid}
            playing
            muted
            loop
            playsinline
            width="100%"
            height="100%"
            className="react-player opacity-60"
            style={{ objectFit: "cover", width: "100%", height: "100%" }}
          />
          <div className="absolute inset-0 bg-gradient-to-r from-slate-900/90 to-slate-900/40"></div>
        </div>

        <div className="wrapper relative z-10 pt-20 pb-10 w-full">
          <div className="max-w-4xl space-y-8">
            <div
              data-aos="fade-up"
              className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/10 backdrop-blur-md border border-white/20 text-white text-sm font-medium"
            >
              <CodeXml size={16} className="text-primary" />
              <span>Next-Gen IT & AI Solutions</span>
            </div>

            <h1 data-aos="fade-up" data-aos-delay="100" className="heading text-white leading-tight">
              Forging the Future of <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary via-purpleColor to-secondary">
                Digital Intelligence
              </span>
            </h1>

            <p data-aos="fade-up" data-aos-delay="200" className="text-lg md:text-xl text-slate-300 max-w-2xl leading-relaxed">
              We empower visionary enterprises with cutting-edge web, mobile, and AI technologies.
              Transform your digital presence into a growth engine.
            </p>

            <div data-aos="fade-up" data-aos-delay="300" className="flex flex-wrap gap-4">
              <Link to="/contact" className="liquid-glass-button text-lg px-8 py-4">
                Start Your Journey <ArrowRight size={20} />
              </Link>
              <Link to="/services" className="px-8 py-4 rounded-full border border-white/30 text-white font-medium hover:bg-white/10 transition-all backdrop-blur-sm">
                Explore Services
              </Link>
            </div>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 mt-20">
            {bannerServices.map((item, index) => (
              <div
                key={item.id}
                data-aos="fade-up"
                data-aos-delay={400 + index * 100}
                className="group p-8 rounded-2xl liquid-glass-card"
              >
                <div className="flex justify-between items-start mb-6">
                  <div className="p-4 rounded-xl bg-gradient-to-br from-primary/20 to-secondary/20 group-hover:from-primary/30 group-hover:to-secondary/30 transition-all">
                    <item.icon strokeWidth={0} className="w-10 h-10 fill-white" />
                  </div>
                  <Link
                    to={item.landingPageLink}
                    className="w-10 h-10 flex items-center justify-center rounded-full bg-white/10 hover:bg-primary hover:text-white transition-all"
                  >
                    <ArrowRight size={20} className="text-white" />
                  </Link>
                </div>
                <h3 className="text-2xl font-bold text-white mb-3">{item.title}</h3>
                <p className="text-slate-300 leading-relaxed">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Animated Stats Counter Section */}
      <section className="py-16 bg-white dark:bg-[#050505] border-b border-slate-100 dark:border-white/5">
        <div className="wrapper">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {[
              { label: "Projects Delivered", value: 50, suffix: "+" },
              { label: "Industries Served", value: 12, suffix: "+" },
              { label: "Client Satisfaction", value: 98, suffix: "%" },
              { label: "Years of Excellence", value: 5, suffix: "+" },
            ].map((stat, idx) => (
              <AnimatedCounter key={stat.label} stat={stat} idx={idx} />
            ))}
          </div>
        </div>
      </section>

      {/* Tech Stack Marquee */}
      <TechMarquee />

      {/* Testimonials Section */}
      <section className="bg-slate-50 dark:bg-[#0a0a0a] py-20 gradient-mesh relative overflow-hidden">
        <div className="floating-orb orb-3"></div>
        <div className="relative z-10">
          <Testimonials />
        </div>
      </section>

      {/* Services Section */}
      <ServicesWeProvide />

      {/* Industries Section */}
      <section className="py-20 bg-white dark:bg-[#050505] relative overflow-hidden noise-overlay">
        <div className="floating-orb orb-1"></div>
        <div className="floating-orb orb-2"></div>
        <div className="absolute top-0 right-0 w-1/3 h-full bg-slate-50 dark:bg-white/5 skew-x-12 z-0"></div>
        <div className="wrapper relative z-10 space-y-12">
          <div className="text-center max-w-3xl mx-auto space-y-4">
            <h2 data-aos="fade-up" className="section-heading dark:text-white">
              Industries We Revolutionize
            </h2>
            <p data-aos="fade-up" className="text-slate-600 dark:text-slate-400 text-lg">
              Deploying industry-specific intelligence to solve complex challenges across sectors.
            </p>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {industries.map((item, index) => (
              <div
                data-aos="fade-up"
                data-aos-delay={index * 50}
                key={item.title}
                className="group p-6 bg-white dark:bg-[#0a0a0a] rounded-2xl shadow-sm border border-slate-100 dark:border-white/10 hover:shadow-xl hover:border-primary/20 dark:hover:border-primary/50 transition-all duration-300 flex flex-col items-center gap-4 text-center"
              >
                <div className="p-4 rounded-full bg-slate-50 dark:bg-white/5 group-hover:bg-primary/10 transition-colors duration-300">
                  <item.icon className="w-8 h-8 text-slate-400 dark:text-slate-500 group-hover:text-primary dark:group-hover:text-primary transition-colors duration-300" />
                </div>
                <p className="font-semibold text-slate-700 dark:text-slate-200 group-hover:text-slate-900 dark:group-hover:text-white transition-colors">
                  {item.title}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How We Build Section */}
      <section className="py-20 bg-slate-900 text-white relative overflow-hidden">
        <div className="absolute inset-0 bg-white/5 opacity-10"></div>
        <div className="wrapper relative z-10">
          <div className="text-center max-w-3xl mx-auto mb-16 space-y-4">
            <h2 data-aos="fade-up" className="section-heading text-white">
              The PANTHM Advantage
            </h2>
            <p data-aos="fade-up" className="text-slate-400 text-lg">
              Our methodology blends strategic foresight with engineering excellence.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {[
              {
                icon: Users,
                title: "Collaborative Synergy",
                desc: "We don't just work for you; we work with you. Your vision combined with our expertise creates unstoppable momentum.",
                color: "from-blue-500 to-cyan-500",
              },
              {
                icon: Zap,
                title: "Agile Velocity",
                desc: "In a fast-paced digital world, speed is currency. We deliver rapid iterations without compromising on quality.",
                color: "from-amber-500 to-orange-500",
              },
              {
                icon: Shield,
                title: "Uncompromising Quality",
                desc: "We adhere to the highest standards of code quality, security, and performance. Excellence is our baseline.",
                color: "from-pink-500 to-rose-500",
              },
              {
                icon: Target,
                title: "Client-Centricity",
                desc: "Your success is our north star. We tailor every solution to meet your specific business objectives.",
                color: "from-purple-500 to-indigo-500",
              },
              {
                icon: BarChart,
                title: "Radical Transparency",
                desc: "No black boxes. We maintain open lines of communication and provide real-time insights into project progress.",
                color: "from-emerald-500 to-teal-500",
              },
            ].map((item, index) => (
              <div
                key={item.title}
                data-aos="fade-up"
                data-aos-delay={index * 100}
                className={`p-8 rounded-2xl bg-white/5 border border-white/10 hover:bg-white/10 transition-all duration-300 group ${index === 3 || index === 4 ? "md:col-span-1.5" : ""}`}
              >
                <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${item.color} flex items-center justify-center mb-6 shadow-lg`}>
                  <item.icon className="text-white" size={24} />
                </div>
                <h3 className="text-xl font-bold mb-3">{item.title}</h3>
                <p className="text-slate-400 leading-relaxed">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 wrapper">
        <div
          data-aos="fade-up"
          className="relative rounded-3xl overflow-hidden min-h-[400px] flex items-center"
        >
          <div className="absolute inset-0">
            <img
              src={howWeBuildCover}
              alt="CTA Background"
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-r from-slate-900/90 via-slate-900/70 to-transparent"></div>
          </div>

          <div className="relative z-10 p-10 md:p-16 max-w-2xl space-y-6">
            <h2 className="text-3xl md:text-5xl font-bold text-white leading-tight">
              Ready to Architect <br /> Your Digital Future?
            </h2>
            <p className="text-lg text-slate-300">
              Join forces with PANTHM AI Labs and transform your innovative ideas into market-leading reality.
            </p>
            <div className="pt-4">
              <Link to="/contact" className="liquid-glass-button text-lg inline-flex">
                Start a Conversation <ArrowRight size={20} />
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Why Work With Us Section */}
      <section className="py-20 bg-slate-50 dark:bg-[#050505] gradient-mesh noise-overlay">
        <div className="wrapper space-y-12">
          <div className="text-center max-w-3xl mx-auto space-y-4">
            <h2 data-aos="fade-up" className="section-heading dark:text-white">
              Why Industry Leaders Choose Us
            </h2>
            <p data-aos="fade-up" className="text-slate-600 dark:text-slate-400 text-lg">
              We deliver more than just code; we deliver competitive advantage.
            </p>
          </div>

          <div className="grid gap-8">
            {[
              {
                title: "Expertise Meets Innovation",
                desc: "Our team combines deep technical expertise with a passion for innovation. We don't just follow trends; we set them.",
                img: whyWorkWithUs1,
                bg: "bg-indigo-600",
                reverse: false,
              },
              {
                title: "Holistic Digital Solutions",
                desc: "From AI to Blockchain, Web to Mobile, we offer a comprehensive suite of services to cover every aspect of your digital journey.",
                img: whyWorkWithUs2,
                bg: "bg-sky-500",
                reverse: true,
              },
              {
                title: "Results-Driven Approach",
                desc: "We focus on tangible outcomes. Every pixel we design and every line of code we write is aimed at driving your business growth.",
                img: whyWorkWithUs3,
                bg: "bg-rose-500",
                reverse: false,
              },
              {
                title: "Global Standards, Local Touch",
                desc: "We bring world-class development standards while maintaining personalized, attentive service for every client.",
                img: whyWorkWithUs4,
                bg: "bg-emerald-500",
                reverse: true,
              },
            ].map((item, index) => (
              <div
                key={index}
                data-aos="fade-up"
                className={`${item.bg} rounded-3xl overflow-hidden shadow-xl text-white grid md:grid-cols-2 items-center min-h-[400px]`}
              >
                <div className={`p-10 md:p-16 space-y-6 ${item.reverse ? "md:order-2" : ""}`}>
                  <h3 className="text-3xl font-bold">{item.title}</h3>
                  <p className="text-white/90 text-lg leading-relaxed">{item.desc}</p>
                  <Quote className="w-12 h-12 text-white/20" />
                </div>
                <div className={`h-full relative ${item.reverse ? "md:order-1" : ""}`}>
                  <div className="absolute inset-0 bg-black/10"></div>
                  <img
                    src={item.img}
                    alt={item.title}
                    className="w-full h-full object-cover md:absolute inset-0"
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <BlogsSection />
      <ContactForm />
    </>
  );
};

export default Home;
