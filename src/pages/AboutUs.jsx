import React, { lazy } from "react";
import bannerImg from "../assets/images/aboutus-banner.webp";
import ourValuesBg from "../assets/images/our-values-bg.jpeg";
import { ArrowRight, Gem, MessagesSquare, PersonStanding, CheckCircle2 } from "lucide-react";
import img1 from "../assets/images/aboutus-1.png";
import img2 from "../assets/images/aboutus-2.png";
import { Link } from "react-router-dom";
import { ArrowLinkButton } from "../components/ArrowButtons";
import SEO from "../components/SEO";
import { companyDetails } from "../data/constant";

const ContactForm = lazy(() => import("../components/ContactForm"));
const WorkProcess = lazy(() => import("../components/WorkProcess"));
const Testimonials = lazy(() => import("../components/Testimonials"));
const ServicesWeProvide = lazy(() =>
  import("../components/website/ServicesWeProvide")
);

const AboutUs = () => {
  const structuredData = {
    "@context": "https://schema.org",
    "@type": "AboutPage",
    "mainEntity": {
      "@type": "Organization",
      "name": companyDetails.name,
      "description": "Building intelligent products that redefine industries.",
      "foundingDate": "2020",
      "numberOfEmployees": "50-100",
      "address": {
        "@type": "PostalAddress",
        "streetAddress": "Icon Tower Office No. 702 Sr 114/5 ,115/1 ,114/6/3 BANER",
        "addressLocality": "Pune",
        "addressRegion": "Maharashtra",
        "postalCode": "411045",
        "addressCountry": "IN"
      }
    }
  };

  return (
    <>
      <SEO
        title="About Us"
        description="Learn about PANTHM AI Labs. We help companies launch new digital products, automate operations with AI, scale existing platforms, create immersive gaming experiences, and build brands. Expert team delivering innovative digital solutions."
        keywords="about PANTHM AI Labs, software development company Pune, technology company India, web development company, app development team, AI solutions provider, data analytics consulting"
        structuredData={structuredData}
      />
      {/* Hero Section */}
      <section className="relative min-h-[60vh] flex items-center justify-center overflow-hidden">
        <div className="absolute inset-0 z-0">
          <img
            src={bannerImg}
            alt="About Us Banner"
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-slate-900/80"></div>
        </div>
        
        <div className="wrapper relative z-10 text-center text-white space-y-6 max-w-4xl mx-auto pt-20">
          <h1 data-aos="fade-up" className="heading text-white">
            Architecting the <span className="text-primary">Digital Future</span>
          </h1>
          <p data-aos="fade-up" data-aos-delay="100" className="text-lg md:text-xl text-slate-300 leading-relaxed">
            We are a collective of visionaries, engineers, and strategists dedicated to transforming complex challenges into elegant digital solutions.
          </p>
          <div data-aos="fade-up" data-aos-delay="200" className="pt-4">
            <ArrowLinkButton to="/contact">Partner With Us</ArrowLinkButton>
          </div>
        </div>
      </section>

      <ServicesWeProvide />

      <section className="bg-slate-50 dark:bg-[#0a0a0a] py-20">
        <Testimonials />
      </section>

      {/* Values Section */}
      <section className="relative py-20 overflow-hidden">
        <div className="absolute inset-0 z-0">
          <img
            src={ourValuesBg}
            alt="Values Background"
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-slate-900/90"></div>
        </div>

        <div className="wrapper relative z-10">
          <div className="text-center max-w-3xl mx-auto mb-16 space-y-4">
            <h2 data-aos="fade-up" className="section-heading text-white">
              Our Core Values
            </h2>
            <p data-aos="fade-up" className="text-slate-400 text-lg">
              The principles that guide our innovation and define our culture.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {[
              {
                title: "Integrity First",
                desc: "We believe in radical transparency and honest communication. Trust is the foundation of every successful partnership we build.",
                Icon: MessagesSquare,
              },
              {
                title: "Relentless Innovation",
                desc: "We don't just adapt to change; we drive it. Our team constantly explores new technologies to keep you ahead of the curve.",
                Icon: PersonStanding,
              },
              {
                title: "Client Obsession",
                desc: "Your success is our only metric. We immerse ourselves in your business to deliver solutions that create real value.",
                Icon: Gem,
              },
            ].map(({ title, desc, Icon }, index) => (
              <div
                key={title}
                data-aos="fade-up"
                data-aos-delay={index * 100}
                className="p-8 bg-white/5 dark:bg-white/5 backdrop-blur-md border border-slate-200 dark:border-white/10 rounded-2xl hover:bg-white/10 transition-all duration-300 group"
              >
                <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-primary to-secondary flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300 shadow-lg">
                  <Icon className="text-white" size={28} />
                </div>
                <h3 className="text-xl font-bold text-white mb-3">{title}</h3>
                <p className="text-slate-300 leading-relaxed">{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Feature Grid Section */}
      <section className="py-20 wrapper">
        <div className="grid lg:grid-cols-2 gap-8">
          {/* Card 1 */}
          <div data-aos="fade-up" className="group relative rounded-3xl overflow-hidden min-h-[400px]">
            <img
              src={img1}
              alt="Hire Developers"
              className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/50 to-transparent"></div>
            <div className="absolute bottom-0 left-0 w-full p-8 md:p-12">
              <h3 className="text-2xl md:text-3xl font-bold text-white mb-4">
                Build Your Dream Team
              </h3>
              <p className="text-slate-300 mb-6">
                Access top-tier talent for your next project. Our developers are ready to integrate seamlessly with your team.
              </p>
              <Link
                to="/contact"
                className="inline-flex items-center gap-2 text-white font-semibold hover:text-primary transition-colors"
              >
                Hire Developers <ArrowRight size={20} />
              </Link>
            </div>
          </div>

          {/* Card 2 */}
          <div data-aos="fade-up" className="flex flex-col gap-8">
            <div className="relative rounded-3xl overflow-hidden flex-grow min-h-[300px] group">
              <img
                src={img2}
                alt="Partnership"
                className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
              />
              <div className="absolute inset-0 bg-gradient-to-br from-primary/90 to-secondary/90 mix-blend-multiply"></div>
              <div className="absolute inset-0 p-8 md:p-12 flex flex-col justify-center text-white">
                <h3 className="text-2xl font-bold mb-4">
                  Strategic Partnerships
                </h3>
                <p className="text-white/90 mb-6">
                  We collaborate with industry leaders like Optimizely to deliver world-class digital experiences.
                </p>
                <Link
                  to="/contact"
                  className="inline-flex items-center gap-2 text-white font-semibold hover:underline"
                >
                  Learn More <ArrowRight size={20} />
                </Link>
              </div>
            </div>

            <div className="bg-slate-900 dark:bg-white/5 dark:border dark:border-white/10 rounded-3xl p-8 md:p-12 text-white">
              <h3 className="text-xl font-bold mb-6">Latest Insights</h3>
              <ul className="space-y-4">
                {[
                  "The Future of AI in Business 2025",
                  "Web Development Trends You Can't Ignore",
                  "Maximizing ROI with UX/UI Design",
                ].map((item, i) => (
                  <li key={i} className="flex items-start gap-3 group cursor-pointer">
                    <CheckCircle2 className="w-5 h-5 text-primary flex-shrink-0 mt-1" />
                    <span className="text-slate-300 group-hover:text-white transition-colors border-b border-transparent group-hover:border-white/50">
                      {item}
                    </span>
                  </li>
                ))}
              </ul>
              <div className="mt-8 pt-8 border-t border-white/10">
                <Link
                  to="/blogs"
                  className="inline-flex items-center gap-2 text-primary hover:text-white transition-colors font-medium"
                >
                  Read Our Blog <ArrowRight size={18} />
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      <WorkProcess />
      <ContactForm />
    </>
  );
};

export default AboutUs;
