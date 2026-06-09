import React from "react";
import { Link } from "react-router-dom";
import { logo } from "../data/constant";
import { Facebook, Instagram, Linkedin, Twitter, CheckCircle2 } from "lucide-react";

const Thankyou = () => {
  return (
    <div className="min-h-screen flex flex-col justify-between relative bg-slate-50 dark:bg-[#0a0a0a]">
      <div className="fixed top-0 left-0 py-4 z-50 w-full bg-white/80 dark:bg-[#050505]/80 backdrop-blur-md border-b border-slate-100 dark:border-white/10">
        <div className="wrapper flex items-center justify-between">
          <Link to="/" className="cursor-pointer">
            <img
              src={logo}
              alt="PANTHM AI Labs"
              className="h-10 md:h-12 object-contain"
            />
          </Link>
        </div>
      </div>
      
      <div className="flex-1 flex items-center justify-center pt-20">
        <div className="wrapper max-w-2xl text-center space-y-8">
          <div className="w-24 h-24 bg-green-100 rounded-full flex items-center justify-center mx-auto text-green-600 mb-6">
            <CheckCircle2 size={48} />
          </div>
          
          <h1 className="text-4xl md:text-5xl font-bold text-slate-900 dark:text-white">Thank You!</h1>
          <p className="text-xl text-slate-600 dark:text-slate-400 leading-relaxed">
            Your message has been successfully sent. Our team will review your inquiry and get back to you within 24 hours.
          </p>
          
          <div className="pt-8">
            <Link to="/" className="primary-btn px-8 py-3 rounded-full inline-flex items-center gap-2">
              Back to Home
            </Link>
          </div>
        </div>
      </div>

      <footer className="bg-slate-900 text-white py-8 border-t border-slate-800">
        <div className="wrapper flex flex-col md:flex-row justify-between items-center gap-6">
          <p className="text-slate-400 text-sm">
            Copyright &copy; {new Date().getFullYear()} PANTHM AI Labs. All rights reserved.
          </p>
          <div className="flex gap-6">
            {[
              { icon: Linkedin, link: "https://www.linkedin.com/company/110580934/" },
              { icon: Instagram, link: "/" },
              { icon: Facebook, link: "/" },
              { icon: Twitter, link: "/" },
            ].map((item, index) => (
              <a
                key={index}
                href={item.link}
                target={item.link.startsWith("http") ? "_blank" : "_self"}
                rel={item.link.startsWith("http") ? "noopener noreferrer" : undefined}
                className="text-slate-400 hover:text-primary transition-colors"
              >
                <item.icon size={20} />
              </a>
            ))}
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Thankyou;
