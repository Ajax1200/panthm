import React from "react";
import { Link } from "react-router-dom";
import { Home, ArrowRight, FileSearch } from "lucide-react";
import SEO from "../components/SEO";

const NotFound = () => {
  return (
    <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center px-4">
      <SEO
        title="404 — Page Not Found"
        description="The page you're looking for doesn't exist. Return to PANTHM AI Labs homepage."
      />
      <div className="text-center max-w-2xl mx-auto space-y-8">
        {/* Big 404 number */}
        <div className="relative inline-block">
          <span className="text-[10rem] md:text-[14rem] font-black text-slate-100 leading-none select-none">
            404
          </span>
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="p-5 rounded-2xl bg-white shadow-xl border border-slate-100">
              <FileSearch className="w-16 h-16 text-primary" />
            </div>
          </div>
        </div>

        <div className="space-y-3">
          <h1 className="text-3xl md:text-4xl font-bold text-slate-900">
            Page Not Found
          </h1>
          <p className="text-slate-500 text-lg">
            The page you're looking for doesn't exist or has been moved.
          </p>
        </div>

        <div className="flex flex-wrap items-center justify-center gap-4">
          <Link
            to="/"
            className="inline-flex items-center gap-2 px-8 py-3.5 bg-primary text-white rounded-full font-semibold hover:bg-primary/90 transition-colors"
          >
            <Home size={18} />
            Go Home
          </Link>
          <Link
            to="/blogs"
            className="inline-flex items-center gap-2 px-8 py-3.5 border border-slate-200 bg-white text-slate-700 rounded-full font-semibold hover:border-primary hover:text-primary transition-all"
          >
            Read Our Blog <ArrowRight size={18} />
          </Link>
        </div>

        <div className="flex flex-wrap justify-center gap-6 text-sm text-slate-400 pt-4">
          {[
            { label: "Services", path: "/services" },
            { label: "Portfolio", path: "/portfolio" },
            { label: "About Us", path: "/about-us" },
            { label: "Contact", path: "/contact" },
          ].map((link) => (
            <Link
              key={link.path}
              to={link.path}
              className="hover:text-primary transition-colors"
            >
              {link.label}
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
};

export default NotFound;
