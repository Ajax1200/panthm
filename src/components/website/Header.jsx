import React, { useState, useEffect, useRef } from "react";
import { Link, useLocation } from "react-router-dom";
import Drawer from "react-modern-drawer";
import { Divide as Hamburger } from "hamburger-react";
import "react-modern-drawer/dist/index.css";
import { X, ArrowRight, ChevronDown, Moon, Sun } from "lucide-react";
import { companyDetails, logo } from "../../data/constant";
import { services } from "../../data/services";
import { useTheme } from "../ThemeContext";

const slugify = (text) => text.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '');

const serviceLinks = services.map(service => ({
  name: service.title,
  path: `/services/${slugify(service.title)}`
}));

const links = [
  { name: "Home", path: "/" },
  { name: "About Us", path: "/about-us" },
  { name: "Services", path: "/services", hasDropdown: true },
  { name: "Portfolio", path: "/portfolio" },
  { name: "Blogs", path: "/blogs" },
  { name: "Contact Us", path: "/contact" },
];

const Header = () => {
  const { isDarkMode, toggleTheme } = useTheme();
  const [isOpen, setIsOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [servicesOpen, setServicesOpen] = useState(false);
  const { pathname } = useLocation();
  const dropdownRef = useRef(null);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Close dropdown on outside click
  useEffect(() => {
    const handleClick = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setServicesOpen(false);
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
        <Link to="/" className="cursor-pointer z-50">
          <img
            src={logo}
            alt="PANTHM AI Labs"
            className="h-10 md:h-12 object-contain dark:invert dark:hue-rotate-180 transition-all duration-300"
          />
        </Link>

        {/* Desktop Navigation */}
        <nav className="hidden lg:flex items-center gap-8 bg-white/50 dark:bg-white/5 backdrop-blur-sm px-8 py-3 rounded-full border border-white/40 dark:border-white/10 shadow-sm dark:shadow-none">
          {links.map((link) =>
            link.hasDropdown ? (
              <div key={link.name} className="relative" ref={dropdownRef}>
                <button
                  onClick={() => setServicesOpen((o) => !o)}
                  className={`text-sm font-medium transition-all duration-300 hover:text-primary flex items-center gap-1 ${
                    pathname.startsWith("/services") ? "text-primary" : "text-slate-600 dark:text-slate-300"
                  }`}
                >
                  {link.name}
                  <ChevronDown
                    size={14}
                    className={`transition-transform duration-200 ${servicesOpen ? "rotate-180" : ""}`}
                  />
                </button>

                {/* Dropdown */}
                {servicesOpen && (
                  <div className="absolute top-full left-1/2 -translate-x-1/2 mt-3 w-56 bg-white dark:bg-[#0f172a] rounded-2xl shadow-xl dark:shadow-2xl dark:shadow-black/50 border border-slate-100 dark:border-white/10 overflow-hidden z-50 animate-in fade-in slide-in-from-top-2 duration-150">
                    <div className="p-2">
                      {serviceLinks.map((svc) => (
                        <Link
                          key={svc.path}
                          to={svc.path}
                          onClick={() => setServicesOpen(false)}
                          className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm text-slate-700 dark:text-slate-300 hover:bg-primary/5 hover:text-primary dark:hover:text-primary transition-colors font-medium"
                        >
                          <span className="w-1.5 h-1.5 rounded-full bg-primary/40 flex-shrink-0" />
                          {svc.name}
                        </Link>
                      ))}
                      <div className="border-t border-slate-100 dark:border-white/10 mt-2 pt-2">
                        <Link
                          to="/services"
                          onClick={() => setServicesOpen(false)}
                          className="flex items-center justify-between px-4 py-2.5 rounded-xl text-sm font-semibold text-primary hover:bg-primary/5 transition-colors"
                        >
                          View All Services
                          <ArrowRight size={14} />
                        </Link>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <Link
                key={link.name}
                to={link.path}
                className={`text-sm font-medium transition-all duration-300 hover:text-primary relative group ${
                  pathname === link.path ? "text-primary" : "text-slate-600 dark:text-slate-300"
                }`}
              >
                {link.name}
                <span
                  className={`absolute -bottom-1 left-0 w-0 h-0.5 bg-primary transition-all duration-300 group-hover:w-full ${
                    pathname === link.path ? "w-full" : ""
                  }`}
                />
              </Link>
            )
          )}
        </nav>

        <div className="hidden lg:flex items-center gap-4">
          <button 
            onClick={toggleTheme}
            className="w-10 h-10 rounded-full flex items-center justify-center bg-slate-100 dark:bg-white/10 text-slate-600 dark:text-slate-300 hover:bg-primary hover:text-white dark:hover:bg-primary dark:hover:text-white transition-all duration-300"
            aria-label="Toggle Dark Mode"
          >
            {isDarkMode ? <Sun size={18} /> : <Moon size={18} />}
          </button>
          <Link
            to={`https://wa.me/${companyDetails.phone}`}
            className="primary-btn text-sm px-6 py-2.5"
          >
            Let's Talk <ArrowRight size={18} />
          </Link>
        </div>

        {/* Mobile Menu Toggle */}
        <div className="lg:hidden z-50">
          <Hamburger
            toggled={isOpen}
            toggle={setIsOpen}
            size={24}
            color="#0F172A"
            rounded
          />
        </div>
      </div>

      {/* Mobile Drawer */}
      <Drawer
        open={isOpen}
        onClose={() => setIsOpen(false)}
        direction="right"
        className="!w-full sm:!w-[350px] !bg-white/95 dark:!bg-[#0a0a0a]/95 !backdrop-blur-xl border-l border-transparent dark:border-white/10"
      >
        <div className="h-full flex flex-col p-6 dark:text-slate-200">
          <div className="flex justify-between items-center mb-10">
            <img src={logo} alt="logo" className="h-10 object-contain dark:invert dark:hue-rotate-180 transition-all duration-300" />
            <div className="flex items-center gap-2">
              <button 
                onClick={toggleTheme}
                className="p-2 hover:bg-slate-100 dark:hover:bg-white/10 rounded-full transition-colors"
                aria-label="Toggle Dark Mode"
              >
                {isDarkMode ? <Sun size={20} className="text-slate-300" /> : <Moon size={20} className="text-slate-600" />}
              </button>
              <button
                onClick={() => setIsOpen(false)}
                className="p-2 hover:bg-slate-100 dark:hover:bg-white/10 rounded-full transition-colors"
              >
                <X size={24} className="text-slate-900 dark:text-slate-300" />
              </button>
            </div>
          </div>

          <nav className="flex flex-col gap-2">
            {links.map((link) =>
              link.hasDropdown ? (
                <div key={link.name}>
                  <Link
                    to={link.path}
                    onClick={() => setIsOpen(false)}
                    className={`text-2xl font-semibold transition-colors block py-2 ${
                      pathname.startsWith("/services")
                        ? "text-primary"
                        : "text-slate-800 dark:text-slate-200 hover:text-primary dark:hover:text-primary"
                    }`}
                  >
                    {link.name}
                  </Link>
                  <div className="ml-4 mt-1 flex flex-col gap-1 border-l-2 border-slate-100 dark:border-white/10 pl-4">
                    {serviceLinks.map((svc) => (
                      <Link
                        key={svc.path}
                        to={svc.path}
                        onClick={() => setIsOpen(false)}
                        className="text-base text-slate-600 dark:text-slate-400 hover:text-primary dark:hover:text-primary transition-colors py-1"
                      >
                        {svc.name}
                      </Link>
                    ))}
                  </div>
                </div>
              ) : (
                <Link
                  key={link.name}
                  to={link.path}
                  onClick={() => setIsOpen(false)}
                  className={`text-2xl font-semibold transition-colors py-2 ${
                    pathname === link.path
                      ? "text-primary"
                      : "text-slate-800 dark:text-slate-200 hover:text-primary dark:hover:text-primary"
                  }`}
                >
                  {link.name}
                </Link>
              )
            )}
          </nav>

          <div className="mt-auto">
            <Link
              to={`https://wa.me/${companyDetails.phone}`}
              className="primary-btn w-full justify-center py-4 text-lg"
              onClick={() => setIsOpen(false)}
            >
              Start Project
            </Link>
          </div>
        </div>
      </Drawer>
    </header>
  );
};

export default Header;
