import React, { useState, useEffect, useRef } from "react";
import { Link, useLocation } from "react-router-dom";
import { Divide as Hamburger } from "hamburger-react";
import { X, ArrowRight, ChevronDown, Moon, Sun, PhoneCall, Calculator, Network } from "lucide-react";
import { logo } from "../../data/constant";
import { services } from "../../data/services";
import { useTheme } from "../ThemeContext";
import { getContextualWhatsAppUrl } from "../../utils/whatsappHelper";

const slugify = (text) => text.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '');

const serviceLinks = services.map(service => ({
  name: service.title,
  path: `/services/${slugify(service.title)}`
}));

const toolLinks = [
  {
    name: "Voice AI Agent Demo",
    path: "https://call.panthm.com",
    isExternal: true,
    desc: "Live sub-340ms WebRTC conversational demo",
    icon: PhoneCall
  },
  {
    name: "AI ROI Calculator",
    path: "/tools/ai-roi-calculator",
    desc: "Calculate savings for automated SDRs & support",
    icon: Calculator
  },
  {
    name: "Sovereign Mesh Simulator",
    path: "/#sovereign-mesh",
    desc: "Live load & latency benchmark simulator",
    icon: Network
  }
];

const links = [
  { name: "About Us", path: "/about-us" },
  { name: "Services", path: "/services", hasDropdown: true, type: "services" },
  { name: "AI Tools", path: "/tools/ai-roi-calculator", hasDropdown: true, type: "tools" },
  { name: "Voice AI Demo", path: "https://call.panthm.com", isExternal: true, badge: "Live" },
  { name: "Portfolio", path: "/portfolio" },
  { name: "Blogs", path: "/blogs" },
  { name: "Contact", path: "/contact" },
];

const Header = () => {
  const { isDarkMode, toggleTheme } = useTheme();
  const [isOpen, setIsOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [activeDropdown, setActiveDropdown] = useState(null);
  const [mobileServicesOpen, setMobileServicesOpen] = useState(false);
  const [mobileToolsOpen, setMobileToolsOpen] = useState(false);
  const { pathname } = useLocation();
  const dropdownContainerRef = useRef(null);

  const handleNavigation = (path) => {
    setIsOpen(false);
    setActiveDropdown(null);

    if (path.includes("#")) {
      const [targetPath, hash] = path.split("#");
      const isCurrentHome = pathname === "/" || targetPath === "" || targetPath === "/";

      if (isCurrentHome && pathname === "/") {
        setTimeout(() => {
          const element = document.getElementById(hash);
          if (element) {
            element.scrollIntoView({ behavior: "smooth", block: "start" });
          }
        }, 50);
      }
    }
  };

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Lock body scroll when drawer is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
      document.body.setAttribute("data-drawer-open", "true");
    } else {
      document.body.style.overflow = "unset";
      document.body.removeAttribute("data-drawer-open");
    }
    return () => {
      document.body.style.overflow = "unset";
      document.body.removeAttribute("data-drawer-open");
    };
  }, [isOpen]);

  // Close desktop dropdown on outside click
  useEffect(() => {
    const handleClick = (e) => {
      if (dropdownContainerRef.current && !dropdownContainerRef.current.contains(e.target)) {
        setActiveDropdown(null);
      }
    };
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  return (
    <header
      className={`fixed top-0 left-0 w-full z-50 transition-all duration-300 ${
        scrolled
          ? "py-3 bg-white/80 dark:bg-[#050505]/80 backdrop-blur-md shadow-lg shadow-slate-200/50 dark:shadow-none dark:border-b dark:border-white/10"
          : "py-5 bg-transparent"
      }`}
    >
      <div className="wrapper flex items-center justify-between">
        <Link to="/" className="cursor-pointer z-50" aria-label="PANTHM AI Labs Home">
          <img
            src={logo}
            alt="PANTHM AI Labs Logo"
            width={180}
            height={48}
            className="h-10 md:h-12 object-contain dark:invert dark:hue-rotate-180 transition-all duration-300"
          />
        </Link>

        {/* Desktop Navigation */}
        <nav 
          ref={dropdownContainerRef}
          className="hidden lg:flex items-center gap-7 bg-white/60 dark:bg-white/5 backdrop-blur-md px-7 py-2.5 rounded-full border border-white/40 dark:border-white/10 shadow-sm dark:shadow-none"
        >
          {links.map((link) =>
            link.hasDropdown ? (
              <div key={link.name} className="relative">
                <button
                  onClick={() => setActiveDropdown(activeDropdown === link.type ? null : link.type)}
                  className={`text-sm font-semibold transition-all duration-300 hover:text-primary flex items-center gap-1.5 py-1 whitespace-nowrap ${
                    (link.type === "services" && pathname.startsWith("/services")) ||
                    (link.type === "tools" && pathname.startsWith("/tools"))
                      ? "text-primary"
                      : "text-slate-700 dark:text-slate-200"
                  }`}
                >
                  {link.name}
                  <ChevronDown
                    size={14}
                    className={`transition-transform duration-200 ${
                      activeDropdown === link.type ? "rotate-180 text-primary" : ""
                    }`}
                  />
                </button>

                {/* Services Dropdown */}
                {link.type === "services" && activeDropdown === "services" && (
                  <div className="absolute top-full left-1/2 -translate-x-1/2 mt-3 w-64 bg-white dark:bg-[#0b0f19] rounded-2xl shadow-xl dark:shadow-2xl dark:shadow-black/70 border border-slate-100 dark:border-white/10 overflow-hidden z-50 animate-in fade-in slide-in-from-top-2 duration-150 p-2">
                    {serviceLinks.map((svc) => (
                      <Link
                        key={svc.path}
                        to={svc.path}
                        onClick={() => setActiveDropdown(null)}
                        className="flex items-center gap-2.5 px-3.5 py-2.5 rounded-xl text-sm text-slate-700 dark:text-slate-300 hover:bg-primary/10 hover:text-primary dark:hover:text-primary transition-colors font-medium"
                      >
                        <span className="w-1.5 h-1.5 rounded-full bg-primary/60 flex-shrink-0" />
                        {svc.name}
                      </Link>
                    ))}
                    <div className="border-t border-slate-100 dark:border-white/10 mt-1 pt-1.5">
                      <Link
                        to="/services"
                        onClick={() => setActiveDropdown(null)}
                        className="flex items-center justify-between px-3.5 py-2 rounded-xl text-xs font-bold uppercase tracking-wider text-primary hover:bg-primary/10 transition-colors"
                      >
                        View All Services
                        <ArrowRight size={13} />
                      </Link>
                    </div>
                  </div>
                )}

                {/* AI Tools Dropdown */}
                {link.type === "tools" && activeDropdown === "tools" && (
                  <div className="absolute top-full left-1/2 -translate-x-1/2 mt-3 w-80 bg-white dark:bg-[#0b0f19] rounded-2xl shadow-xl dark:shadow-2xl dark:shadow-black/70 border border-slate-100 dark:border-white/10 overflow-hidden z-50 animate-in fade-in slide-in-from-top-2 duration-150 p-2.5 space-y-1">
                    <div className="px-3 py-1.5 mb-1 text-[11px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500">
                      Live AI Tools & Simulators
                    </div>
                    {toolLinks.map((tool) => {
                      const Icon = tool.icon;
                      if (tool.isExternal || tool.path.startsWith("http")) {
                        return (
                          <a
                            key={tool.name}
                            href={tool.path}
                            target="_blank"
                            rel="noopener noreferrer"
                            onClick={() => setActiveDropdown(null)}
                            className="flex items-start gap-3 p-2.5 rounded-xl text-slate-700 dark:text-slate-300 hover:bg-primary/10 hover:text-primary dark:hover:text-white transition-all group"
                          >
                            <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center text-primary group-hover:bg-primary group-hover:text-white transition-colors flex-shrink-0 mt-0.5">
                              <Icon size={16} />
                            </div>
                            <div className="flex-1 min-w-0">
                              <div className="text-sm font-bold flex items-center gap-1.5">
                                {tool.name}
                              </div>
                              <div className="text-[11px] text-slate-500 dark:text-slate-400 line-clamp-1">
                                {tool.desc}
                              </div>
                            </div>
                          </a>
                        );
                      }
                      return (
                        <Link
                          key={tool.path}
                          to={tool.path}
                          onClick={() => handleNavigation(tool.path)}
                          className="flex items-start gap-3 p-2.5 rounded-xl text-slate-700 dark:text-slate-300 hover:bg-primary/10 hover:text-primary dark:hover:text-white transition-all group"
                        >
                          <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center text-primary group-hover:bg-primary group-hover:text-white transition-colors flex-shrink-0 mt-0.5">
                            <Icon size={16} />
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="text-sm font-bold flex items-center gap-1.5">
                              {tool.name}
                            </div>
                            <div className="text-[11px] text-slate-500 dark:text-slate-400 line-clamp-1">
                              {tool.desc}
                            </div>
                          </div>
                        </Link>
                      );
                    })}
                  </div>
                )}
              </div>
            ) : link.isExternal || link.path.startsWith("http") ? (
              <a
                key={link.name}
                href={link.path}
                target="_blank"
                rel="noopener noreferrer"
                className="text-sm font-semibold transition-all duration-300 hover:text-primary relative group py-1 whitespace-nowrap flex items-center gap-1.5 text-slate-700 dark:text-slate-200"
              >
                {link.name}
                {link.badge && (
                  <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-full bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30 flex items-center gap-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                    {link.badge}
                  </span>
                )}
                <span className="absolute -bottom-0.5 left-0 w-0 h-0.5 bg-primary transition-all duration-300 group-hover:w-full" />
              </a>
            ) : (
              <Link
                key={link.name}
                to={link.path}
                className={`text-sm font-semibold transition-all duration-300 hover:text-primary relative group py-1 whitespace-nowrap ${
                  pathname === link.path ? "text-primary" : "text-slate-700 dark:text-slate-200"
                }`}
              >
                {link.name}
                <span
                  className={`absolute -bottom-0.5 left-0 w-0 h-0.5 bg-primary transition-all duration-300 group-hover:w-full ${
                    pathname === link.path ? "w-full" : ""
                  }`}
                />
              </Link>
            )
          )}
        </nav>

        <div className="flex items-center gap-3 md:gap-4">
          <button 
            onClick={toggleTheme}
            className="w-10 h-10 rounded-full flex items-center justify-center bg-slate-100 dark:bg-white/10 text-slate-600 dark:text-slate-300 hover:bg-primary hover:text-white dark:hover:bg-primary dark:hover:text-white transition-all duration-300"
            aria-label="Toggle Dark Mode"
          >
            {isDarkMode ? <Sun size={18} /> : <Moon size={18} />}
          </button>
          
          <a
            href={getContextualWhatsAppUrl(pathname)}
            target="_blank"
            rel="noopener noreferrer"
            className="hidden lg:flex liquid-glass-button text-sm px-6 py-2.5 whitespace-nowrap"
          >
            Let's Talk <ArrowRight size={18} />
          </a>

          {/* Mobile Menu Toggle */}
          <button
            onClick={() => setIsOpen(!isOpen)}
            className="lg:hidden z-50 p-1 rounded-md focus:outline-none"
            aria-label="Toggle Mobile Menu"
          >
            <Hamburger
              toggled={isOpen}
              toggle={setIsOpen}
              size={24}
              color={isDarkMode ? "#ffffff" : "#0F172A"}
              rounded
            />
          </button>
        </div>
      </div>

      {/* ── Native Mobile Slide-over Drawer ── */}
      {/* 1. Backdrop */}
      <div
        className={`fixed inset-0 bg-black/60 backdrop-blur-sm z-[99998] transition-opacity duration-300 lg:hidden ${
          isOpen ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none"
        }`}
        onClick={() => setIsOpen(false)}
        aria-hidden="true"
      />

      {/* 2. Drawer Panel */}
      <div
        className={`fixed inset-y-0 right-0 h-[100dvh] w-[85%] max-w-[360px] bg-white dark:bg-[#07090e] text-slate-900 dark:text-white z-[99999] shadow-2xl border-l border-slate-200 dark:border-slate-800 transition-transform duration-300 ease-in-out transform lg:hidden flex flex-col pointer-events-auto ${
          isOpen ? "translate-x-0" : "translate-x-full pointer-events-none"
        }`}
        style={{ WebkitOverflowScrolling: "touch" }}
      >
        {/* Drawer Header */}
        <div className="flex justify-between items-center p-5 border-b border-slate-100 dark:border-slate-800/80 flex-shrink-0">
          <Link to="/" onClick={() => setIsOpen(false)}>
            <img 
              src={logo} 
              alt="PANTHM Logo" 
              width={140}
              height={38}
              className="h-8 object-contain dark:invert dark:hue-rotate-180 transition-all duration-300" 
            />
          </Link>
          <button
            type="button"
            onClick={() => setIsOpen(false)}
            className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800/60 rounded-full transition-colors cursor-pointer"
            aria-label="Close Menu"
          >
            <X size={22} className="text-slate-900 dark:text-slate-300" />
          </button>
        </div>

        {/* Featured Voice Demo Callout in Mobile Drawer */}
        <div className="px-5 pt-4 pb-1 flex-shrink-0">
          <a
            href="https://call.panthm.com"
            className="flex items-center justify-between p-3.5 rounded-2xl bg-gradient-to-r from-primary/15 via-emerald-500/10 to-primary/10 border border-primary/25 hover:border-primary/50 transition-all text-slate-900 dark:text-white group cursor-pointer"
          >
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-primary text-white flex items-center justify-center shadow-md shadow-primary/30 group-hover:scale-105 transition-transform flex-shrink-0">
                <PhoneCall size={18} />
              </div>
              <div>
                <div className="text-sm font-bold flex items-center gap-1.5">
                  Voice AI Agent Demo
                  <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping" />
                </div>
                <div className="text-[11px] text-slate-500 dark:text-slate-400">
                  Sub-340ms Conversational Call &rarr;
                </div>
              </div>
            </div>
            <ArrowRight size={16} className="text-primary group-hover:translate-x-1 transition-transform flex-shrink-0" />
          </a>
        </div>

        {/* Scrollable Navigation Body */}
        <div className="flex-1 min-h-0 overflow-y-auto px-6 py-4 space-y-1 overscroll-contain">
          {links.map((link) =>
            link.hasDropdown ? (
              <div key={link.name} className="border-b border-slate-100 dark:border-slate-800/50">
                <button
                  type="button"
                  onClick={() => {
                    if (link.type === "services") setMobileServicesOpen((prev) => !prev);
                    if (link.type === "tools") setMobileToolsOpen((prev) => !prev);
                  }}
                  className="w-full flex items-center justify-between py-3.5 text-left cursor-pointer group"
                  aria-expanded={link.type === "services" ? mobileServicesOpen : mobileToolsOpen}
                >
                  <span
                    className={`text-xl font-bold transition-colors ${
                      (link.type === "services" && pathname.startsWith("/services")) ||
                      (link.type === "tools" && pathname.startsWith("/tools"))
                        ? "text-primary"
                        : "text-slate-900 dark:text-slate-100 group-hover:text-primary"
                    }`}
                  >
                    {link.name}
                  </span>
                  <div className="p-1.5 rounded-lg bg-slate-100 dark:bg-slate-800/80 text-slate-600 dark:text-slate-300 group-hover:text-primary transition-all">
                    <ChevronDown
                      size={18}
                      className={`transition-transform duration-200 ${
                        (link.type === "services" && mobileServicesOpen) ||
                        (link.type === "tools" && mobileToolsOpen)
                          ? "rotate-180 text-primary"
                          : ""
                      }`}
                    />
                  </div>
                </button>

                {/* Mobile Services Accordion */}
                {link.type === "services" && mobileServicesOpen && (
                  <div className="ml-2 mb-3 flex flex-col gap-1 border-l-2 border-primary/40 pl-3 py-1 space-y-1 animate-in fade-in duration-150">
                    {serviceLinks.map((svc) => (
                      <Link
                        key={svc.path}
                        to={svc.path}
                        onClick={() => setIsOpen(false)}
                        className="text-sm font-medium text-slate-600 dark:text-slate-300 hover:text-primary dark:hover:text-primary transition-colors py-2 flex items-center gap-2 text-left w-full cursor-pointer block"
                      >
                        <span className="w-1.5 h-1.5 rounded-full bg-primary/60 flex-shrink-0" />
                        {svc.name}
                      </Link>
                    ))}
                    <Link
                      to="/services"
                      onClick={() => setIsOpen(false)}
                      className="text-xs font-bold uppercase tracking-wider text-primary pt-2 pb-1 flex items-center gap-1 hover:underline text-left w-full cursor-pointer block"
                    >
                      View All Services <ArrowRight size={12} />
                    </Link>
                  </div>
                )}

                {/* Mobile AI Tools Accordion */}
                {link.type === "tools" && mobileToolsOpen && (
                  <div className="ml-2 mb-3 flex flex-col gap-1 border-l-2 border-primary/40 pl-3 py-1 space-y-1 animate-in fade-in duration-150">
                    {toolLinks.map((tool) => {
                      if (tool.isExternal || tool.path.startsWith("http")) {
                        return (
                          <a
                            key={tool.name}
                            href={tool.path}
                            className="text-sm font-semibold text-slate-700 dark:text-slate-200 hover:text-primary dark:hover:text-primary transition-colors py-2.5 flex items-center justify-between text-left w-full cursor-pointer group"
                          >
                            <span className="flex items-center gap-2 font-semibold">
                              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse flex-shrink-0" />
                              {tool.name}
                            </span>
                            <span className="text-[10px] uppercase font-bold px-2 py-0.5 rounded-full bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30">
                              Live
                            </span>
                          </a>
                        );
                      }
                      return (
                        <Link
                          key={tool.path}
                          to={tool.path}
                          onClick={() => handleNavigation(tool.path)}
                          className="text-sm font-medium text-slate-600 dark:text-slate-300 hover:text-primary dark:hover:text-primary transition-colors py-2 flex items-center gap-2 text-left w-full cursor-pointer block"
                        >
                          <span className="w-1.5 h-1.5 rounded-full bg-primary/60 flex-shrink-0" />
                          {tool.name}
                        </Link>
                      );
                    })}
                  </div>
                )}
              </div>
            ) : link.isExternal || link.path.startsWith("http") ? (
              <a
                key={link.name}
                href={link.path}
                className="text-xl font-bold transition-colors py-3.5 border-b border-slate-100 dark:border-slate-800/50 flex items-center justify-between w-full text-left text-slate-900 dark:text-slate-100 hover:text-primary dark:hover:text-primary group cursor-pointer"
              >
                <div className="flex items-center gap-2.5">
                  <PhoneCall size={18} className="text-primary" />
                  <span>{link.name}</span>
                </div>
                {link.badge && (
                  <span className="text-xs font-bold px-2.5 py-0.5 rounded-full bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30 flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                    {link.badge}
                  </span>
                )}
              </a>
            ) : (
              <Link
                key={link.name}
                to={link.path}
                onClick={() => setIsOpen(false)}
                className={`text-xl font-bold transition-colors py-3.5 border-b border-slate-100 dark:border-slate-800/50 block w-full text-left cursor-pointer ${
                  pathname === link.path
                    ? "text-primary"
                    : "text-slate-900 dark:text-slate-100 hover:text-primary dark:hover:text-primary"
                }`}
              >
                {link.name}
              </Link>
            )
          )}
        </div>

        {/* Footer CTA Button */}
        <div className="p-6 border-t border-slate-100 dark:border-slate-800/80 flex-shrink-0 bg-white dark:bg-[#07090e]">
          <Link
            to="/contact"
            onClick={() => setIsOpen(false)}
            className="primary-btn w-full justify-center py-4 text-base font-bold flex items-center gap-2 rounded-xl shadow-lg shadow-primary/20 cursor-pointer pointer-events-auto active:scale-95 transition-transform"
          >
            Start Project <ArrowRight size={18} />
          </Link>
        </div>
      </div>
    </header>
  );
};

export default Header;
