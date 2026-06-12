import React, { useState } from "react";
import { ChevronDown } from "lucide-react";

export const faqData = [
  {
    question: "What is The PANTHM Consolidation Architecture (PCA)?",
    answer: "The PANTHM Consolidation Architecture (PCA) is an integrated systems architecture protocol that collapses presentation interfaces, asynchronous backend task queues, outbound lead generation systems, and global edge hosting into a single consolidated codebase. This replaces fragmented SaaS platforms, eliminating inter-system latency, data mismatch, and human operational overhead."
  },
  {
    question: "How do PANTHM's AI Voice SDR Agents work?",
    answer: "Our voice agents are custom-trained neural voice engines operating at sub-500ms response latency. They understand natural context, intent, and user sentiment in real-time. We configure them for automated outbound lead qualification, outbound sales development (SDR), inbound customer support, and advanced appointment scheduling directly synced to calendar systems."
  },
  {
    question: "Do you support custom CRM and database integrations?",
    answer: "Yes. We code custom integrations from first principles. We connect user presentation layers directly with Mongoose/MongoDB databases and existing corporate CRM/ERP systems. By eliminating middle-tier services like Zapier, we reduce API transit delays and secure data integrity."
  },
  {
    question: "How does PANTHM ensure compliance and scalability?",
    answer: "We host all application assets on globally distributed serverless edge networks, delivering sub-500ms Largest Contentful Paint (LCP) speeds. We configure data residency logic within localized edge database setups to comply fully with regulatory frameworks in the EU, UAE, and Australia."
  }
];

const FAQItem = ({ question, answer, isOpen, onClick }) => {
  return (
    <div className="border border-slate-100 dark:border-white/10 rounded-2xl bg-white/50 dark:bg-white/5 backdrop-blur-md transition-all duration-300 hover:border-primary/30 dark:hover:border-primary/50 overflow-hidden">
      <button
        onClick={onClick}
        className="w-full px-6 py-5 flex items-center justify-between text-left gap-4 font-bold text-slate-800 dark:text-slate-100 focus:outline-none"
      >
        <span className="text-base md:text-lg">{question}</span>
        <ChevronDown
          size={20}
          className={`text-slate-400 dark:text-slate-500 transition-transform duration-300 flex-shrink-0 ${
            isOpen ? "transform rotate-180 text-primary" : ""
          }`}
        />
      </button>
      <div
        className={`transition-all duration-300 ease-in-out ${
          isOpen ? "max-h-[500px] border-t border-slate-100 dark:border-white/5" : "max-h-0"
        } overflow-hidden`}
      >
        <div className="px-6 py-5 text-sm md:text-base text-slate-700 dark:text-slate-200 leading-relaxed bg-slate-50/30 dark:bg-black/30">
          {answer}
        </div>
      </div>
    </div>
  );
};

const FAQ = () => {
  const [openIndex, setOpenIndex] = useState(null);

  const handleToggle = (index) => {
    setOpenIndex(openIndex === index ? null : index);
  };

  return (
    <section className="py-24 relative overflow-hidden bg-white dark:bg-[#050505] border-t border-slate-100 dark:border-white/5 noise-overlay">
      {/* Floating ambient glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-primary/5 rounded-full blur-[120px] pointer-events-none"></div>

      <div className="wrapper relative z-10 max-w-4xl mx-auto">
        <div className="text-center max-w-2xl mx-auto mb-16 space-y-4">
          <h2 data-aos="fade-up" className="section-heading">
            Frequently Asked <span className="text-primary bg-clip-text text-transparent bg-gradient-to-r from-primary to-secondary">Questions</span>
          </h2>
          <p data-aos="fade-up" data-aos-delay="100" className="text-slate-500 dark:text-slate-400 text-base md:text-lg">
            Understand how our custom architectures and automated systems eliminate operational friction.
          </p>
        </div>

        <div data-aos="fade-up" data-aos-delay="200" className="space-y-4">
          {faqData.map((faq, index) => (
            <FAQItem
              key={index}
              question={faq.question}
              answer={faq.answer}
              isOpen={openIndex === index}
              onClick={() => handleToggle(index)}
            />
          ))}
        </div>
      </div>
    </section>
  );
};

export default FAQ;
