import React, { useState } from "react";
import img from "../assets/images/work-process.webp";
import { workingProcess } from "../data/constant";
import { ChevronDown } from "lucide-react";

const WorkProcess = () => {
  const [currentIdx, setCurrentIdx] = useState(0);

  return (
    <section className="relative py-20 overflow-hidden">
      <div className="absolute inset-0 z-0">
        <img
          src={img}
          className="w-full h-full object-cover opacity-20"
          alt="Work Process Background"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-white via-white/90 to-white/80 dark:from-[#0a0a0a] dark:via-[#0a0a0a]/90 dark:to-[#0a0a0a]/80"></div>
      </div>

      <div className="wrapper relative z-10 grid lg:grid-cols-2 gap-12 items-center">
        <div data-aos="fade-up" className="space-y-8">
          <div className="space-y-4">
            <h2 className="section-heading dark:text-white">How We Build Success</h2>
            <p className="text-slate-600 dark:text-slate-400 text-lg">
              Our proven methodology ensures transparency, efficiency, and exceptional results at every stage.
            </p>
          </div>

          <div className="space-y-4">
            {workingProcess.map((item, i) => (
              <div
                key={item.title}
                className={`rounded-xl border transition-all duration-300 overflow-hidden ${
                  currentIdx === i
                    ? "bg-white dark:bg-white/10 border-primary/20 dark:border-primary/50 shadow-lg"
                    : "bg-white/50 dark:bg-white/5 border-slate-200 dark:border-white/10 hover:bg-white dark:hover:bg-white/10"
                }`}
              >
                <button
                  onClick={() => setCurrentIdx(i)}
                  className="w-full flex items-center justify-between p-5 text-left"
                >
                  <div className="flex items-center gap-4">
                    <div
                      className={`w-10 h-10 rounded-full flex items-center justify-center transition-colors ${
                        currentIdx === i
                          ? "bg-primary text-white"
                          : "bg-slate-100 dark:bg-white/10 text-slate-500 dark:text-slate-400"
                      }`}
                    >
                      <item.icon size={20} />
                    </div>
                    <span
                      className={`text-lg font-semibold transition-colors ${
                        currentIdx === i ? "text-slate-900 dark:text-white" : "text-slate-600 dark:text-slate-400"
                      }`}
                    >
                      {item.title}
                    </span>
                  </div>
                  <ChevronDown
                    className={`w-5 h-5 text-slate-400 transition-transform duration-300 ${
                      currentIdx === i ? "rotate-180 text-primary" : ""
                    }`}
                  />
                </button>
                <div
                  className={`grid transition-all duration-300 ease-in-out ${
                    currentIdx === i
                      ? "grid-rows-[1fr] opacity-100"
                      : "grid-rows-[0fr] opacity-0"
                  }`}
                >
                  <div className="overflow-hidden">
                    <div className="p-5 pt-0 text-slate-600 dark:text-slate-300 leading-relaxed border-t border-slate-100/50 dark:border-white/10 mx-5 mt-2">
                      {item.description}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div data-aos="fade-up" className="relative hidden lg:block h-full min-h-[600px]">
           <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-secondary/5 rounded-3xl border border-slate-100 dark:border-white/10"></div>
           {/* You can add a dynamic illustration or image here based on the active step if desired */}
           <div className="absolute inset-0 flex items-center justify-center p-10">
              <div className="relative w-full h-full rounded-2xl overflow-hidden shadow-2xl">
                  <img src={img} alt="Process" className="w-full h-full object-cover" />
                  <div className="absolute inset-0 bg-primary/10 mix-blend-overlay"></div>
              </div>
           </div>
        </div>
      </div>
    </section>
  );
};

export default WorkProcess;
