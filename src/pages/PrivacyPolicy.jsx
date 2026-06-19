import React from "react";
import SEO from "../components/SEO";

const PrivacyPolicy = () => {
  return (
    <div className="pt-24 min-h-screen bg-gradient-to-b from-[#030712] via-[#0B0F19] to-[#030712] text-slate-100 selection:bg-amber-400 selection:text-black">
      <SEO
        title="Privacy Policy - PANTHM Automations & Tools"
        description="Privacy Policy for PANTHM tools, including the LinkedIn Sales Navigator Automator and Meta WhatsApp API integrations. Read about how we collect, store, and protect your data."
        keywords="privacy policy, LinkedIn Sales Navigator Automator, Meta WhatsApp API, WhatsApp Business, data privacy, Chrome extension"
        url="https://panthm.com/privacy-policy"
      />

      <div className="wrapper max-w-4xl mx-auto px-6 py-12 md:py-20 space-y-12">
        <div className="text-center space-y-4">
          <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight leading-tight">
            Privacy Policy
          </h1>
          <p className="text-amber-400 font-semibold uppercase tracking-wider text-sm">
            LinkedIn Sales Navigator Automator & Meta WhatsApp API Integrations
          </p>
        </div>

        <div className="prose prose-invert max-w-none space-y-8 bg-[#0B0F19]/60 backdrop-blur-xl border border-white/5 p-8 md:p-12 rounded-3xl shadow-[0_0_30px_rgba(0,0,0,0.3)]">
          
          <section className="space-y-3">
            <h2 className="text-xl md:text-2xl font-bold text-slate-100 flex items-center gap-3">
              <span className="text-amber-400 font-mono">1.</span> DATA COLLECTION
            </h2>
            <p className="text-slate-300 leading-relaxed text-sm md:text-base">
              LinkedIn Sales Navigator Automator runs entirely locally inside your Google Chrome browser. We do not collect, store, or transmit any personally identifiable information, browsing history, or LinkedIn account credentials to external servers. For Meta WhatsApp API services, we process phone numbers, template contents, and delivery statuses solely to execute API requests requested by the user.
            </p>
          </section>

          <div className="h-[1px] bg-white/5"></div>

          <section className="space-y-3">
            <h2 className="text-xl md:text-2xl font-bold text-slate-100 flex items-center gap-3">
              <span className="text-amber-400 font-mono">2.</span> DATA STORAGE
            </h2>
            <p className="text-slate-300 leading-relaxed text-sm md:text-base">
              All custom message templates, daily execution limits, and logging histories are stored locally inside the user's browser via Chrome's secure local storage API. Meta WhatsApp API request logs are temporarily cached for transient delivery verification and are not retained long-term on our servers.
            </p>
          </section>

          <div className="h-[1px] bg-white/5"></div>

          <section className="space-y-3">
            <h2 className="text-xl md:text-2xl font-bold text-slate-100 flex items-center gap-3">
              <span className="text-amber-400 font-mono">3.</span> META WHATSAPP API COMPLIANCE
            </h2>
            <p className="text-slate-300 leading-relaxed text-sm md:text-base">
              Our integrations with the Meta WhatsApp Business API comply fully with the Meta Developer Policies and WhatsApp Business Terms of Service. We do not share message contents or phone directories with unauthorized third parties. All communication flows utilize standard secure HTTPS protocols specified by Meta.
            </p>
          </section>

          <div className="h-[1px] bg-white/5"></div>

          <section className="space-y-3">
            <h2 className="text-xl md:text-2xl font-bold text-slate-100 flex items-center gap-3">
              <span className="text-amber-400 font-mono">4.</span> DATA SHARING
            </h2>
            <p className="text-slate-300 leading-relaxed text-sm md:text-base">
              We do not sell, trade, or transfer any user information or data handled by our automation tools to third parties.
            </p>
          </section>

          <div className="h-[1px] bg-white/5"></div>

          <section className="space-y-3">
            <h2 className="text-xl md:text-2xl font-bold text-slate-100 flex items-center gap-3">
              <span className="text-amber-400 font-mono">5.</span> CONTACT
            </h2>
            <p className="text-slate-300 leading-relaxed text-sm md:text-base">
              For questions, contact support at{" "}
              <a 
                href="mailto:info@panthm.com" 
                className="text-amber-400 hover:text-amber-300 underline transition-colors"
              >
                info@panthm.com
              </a>
            </p>
          </section>

        </div>
      </div>
    </div>
  );
};

export default PrivacyPolicy;
