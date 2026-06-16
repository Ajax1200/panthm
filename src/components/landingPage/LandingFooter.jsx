import { Facebook, Instagram, Linkedin, Twitter } from "lucide-react";
import React from "react";

const LandingFooter = () => {
  return (
    <footer className="bg-slate-900 text-white py-12 border-t border-slate-800">
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
  );
};

export default LandingFooter;
