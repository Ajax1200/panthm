import React, { lazy } from "react";
import ReactPlayer from "react-player";
import bannerVid from "../assets/vids/banner.mp4";
import {
  Ambulance,
  BrainCircuit,
  BriefcaseBusiness,
  Cloudy,
  CodeXml,
  Cpu,
  Quote,
  StickyNote,
  Store,
  Tv,
  CheckCircle2,
} from "lucide-react";
import howWeBuildCover from "../assets/images/how-we-build.jpeg";
import whyWorkWithUs1 from "../assets/images/whyworkwithus1.webp";
import whyWorkWithUs2 from "../assets/images/whyworkwithus2.webp";
import whyWorkWithUs3 from "../assets/images/whyworkwithus3.webp";
import whyWorkWithUs4 from "../assets/images/whyworkwithus4.webp";
import LandingServices from "../components/landingPage/LandingServices";
import { ArrowScrollButton } from "../components/ArrowButtons";
import Portfolio from "../components/Portfolio";

const ContactForm = lazy(() => import("../components/ContactForm"));
const Testimonials = lazy(() => import("../components/Testimonials"));

const industries = [
  { icon: Ambulance, title: "Healthcare" },
  { icon: BriefcaseBusiness, title: "Finance" },
  { icon: Cpu, title: "Technology" },
  { icon: Store, title: "Retail &\n E-commerce" },
  { icon: Cloudy, title: "SaaS" },
  { icon: StickyNote, title: "Business Services" },
  { icon: Tv, title: "Media & Entertainment" },
  { icon: BrainCircuit, title: "AI" },
];

const LandingPage = ({ page }) => {
  const isWeb = page === "web";
  const isApp = page === "app";
  const isAiCalling = page === "ai-calling";

  let title, subtitle, description;

  if (isWeb) {
    title = "Web Solutions";
    subtitle = "Web Development";
    description =
      "We design and develop user-centric websites that streamline your business processes, boost engagement, and deliver seamless experiences across devices.";
  } else if (isApp) {
    title = "App Solutions";
    subtitle = "App Development";
    description =
      "Our expert team creates innovative, user-friendly mobile applications that bring your ideas to life. Whether it’s Android, iOS, or cross-platform development.";
  } else if (isAiCalling) {
    title = "AI Voice Agents";
    subtitle = "AI Calling Agency";
    description =
      "Revolutionize your customer engagement with intelligent, human-like AI voice agents. Automate support, sales, and appointment setting with zero wait times.";
  }

  return (
    <>
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

        <div className="wrapper relative z-10 pt-20">
          <div className="max-w-4xl space-y-8">
            <div
              data-aos="fade-up"
              className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/10 backdrop-blur-md border border-white/20 text-white"
            >
              <CodeXml size={20} className="text-primary" />
              <span className="font-medium">{subtitle}</span>
            </div>

            <h1
              data-aos="fade-up"
              data-aos-delay="100"
              className="heading text-white leading-tight"
            >
              Empowering Your Business with Seamless
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-secondary block mt-2">
                {title}
              </span>
            </h1>

            <p
              data-aos="fade-up"
              data-aos-delay="200"
              className="text-lg md:text-xl text-slate-300 max-w-2xl leading-relaxed"
            >
              {description}
            </p>

            <div data-aos="fade-up" data-aos-delay="300" className="flex flex-wrap gap-4">
              <ArrowScrollButton to="contact">Get Started</ArrowScrollButton>
            </div>
          </div>
        </div>
      </section>

      <div className="relative z-20 wrapper mb-20">
        <ContactForm headline="Book A Free Consultation" />
      </div>

      <section className="bg-slate-50 py-20">
        <Testimonials />
      </section>

      <LandingServices page={page} />

      <Portfolio  />

      <section className="py-20 bg-slate-900 text-white">
        <div className="wrapper space-y-16">
          <div className="text-center max-w-3xl mx-auto space-y-4">
            <h2 data-aos="fade-up" className="section-heading text-white">
              Industries We Serve
            </h2>
            <p data-aos="fade-up" className="text-slate-400 text-lg">
              Using powerful, industry-specific software solutions, our team can help you achieve your business goals.
            </p>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-4">
            {industries.map((item, index) => {
              const IconComponent = item.icon;
              return (
                <div
                  data-aos="fade-up"
                  data-aos-delay={index * 50}
                  key={item.title}
                  className="group p-6 bg-slate-800/50 rounded-2xl border border-slate-700 hover:border-primary/50 hover:bg-slate-800 transition-all duration-300 text-center flex flex-col items-center gap-4"
                >
                  <div className="w-12 h-12 rounded-full bg-slate-700 flex items-center justify-center group-hover:bg-primary/20 group-hover:text-primary transition-colors">
                    <IconComponent size={24} />
                  </div>
                  <p className="font-medium text-sm text-slate-300 group-hover:text-white whitespace-pre-line">
                    {item.title}
                  </p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      <section className="py-20 bg-white">
        <div className="wrapper">
          <h2 data-aos="fade-up" className="section-heading text-center mb-16">
            How PANTHM AI Labs helps you deliver the best results
          </h2>

          <div className="grid md:grid-cols-3 lg:grid-cols-5 gap-6">
            {[
              {
                title: "Collaborative Partnerships",
                desc: "We foster strong partnerships by working closely with clients, ensuring alignment with your vision.",
                color: "bg-indigo-50 text-indigo-600",
              },
              {
                title: "Agility and Adaptability",
                desc: "Our team thrives on flexibility, quickly adapting to changing requirements and industry trends.",
                color: "bg-sky-50 text-sky-600",
              },
              {
                title: "Commitment to Quality",
                desc: "Quality is at the heart of everything we do, from initial planning to final delivery.",
                color: "bg-rose-50 text-rose-600",
              },
              {
                title: "Customer Satisfaction",
                desc: "Your satisfaction is our top priority. We go the extra mile to ensure our solutions exceed expectations.",
                color: "bg-amber-50 text-amber-600",
              },
              {
                title: "Transparency",
                desc: "We maintain open communication and take responsibility for delivering on our commitments.",
                color: "bg-emerald-50 text-emerald-600",
              },
            ].map((item, index) => (
              <div
                key={index}
                data-aos="fade-up"
                data-aos-delay={index * 100}
                className={`p-6 rounded-2xl ${item.color} hover:-translate-y-2 transition-transform duration-300`}
              >
                <div className="h-full flex flex-col gap-4">
                  <CheckCircle2 size={32} />
                  <h3 className="font-bold text-lg leading-tight">{item.title}</h3>
                  <p className="text-sm opacity-80">{item.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="py-20">
        <div className="wrapper">
          <div className="relative rounded-3xl overflow-hidden min-h-[400px] flex items-center">
            <img
              src={howWeBuildCover}
              alt="How we build"
              className="absolute inset-0 w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-slate-900/80"></div>

            <div className="relative z-10 p-8 md:p-16 max-w-2xl text-white space-y-6">
              <h3 data-aos="fade-up" className="text-3xl md:text-4xl font-bold">
                Ready to transform your business?
              </h3>
              <p data-aos="fade-up" data-aos-delay="100" className="text-lg text-slate-300">
                We prioritize your success, understand your unique needs, and deliver tailored solutions that drive your business growth.
              </p>
              <div data-aos="fade-up" data-aos-delay="200">
                <ArrowScrollButton to="contact">Let's Chat</ArrowScrollButton>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="py-20 bg-slate-50">
        <div className="wrapper space-y-16">
          <h2 data-aos="fade-up" className="section-heading text-center">
            Why Work With Us?
          </h2>

          <div className="space-y-8">
            {[
              {
                title: "Expertise & Innovation",
                desc: "Our team combines creativity, technical expertise, and a passion for excellence to bring your vision to life. With attention to detail and a client-first approach, we ensure every project meets your unique requirements.",
                img: whyWorkWithUs1,
                bg: "bg-indigo-600",
              },
              {
                title: "Comprehensive Solutions",
                desc: "At PANTHM AI Labs, we deliver excellence across web and app development, UI/UX design, game development, and blockchain solutions. Our expertise ensures innovative, scalable results tailored to your goals.",
                img: whyWorkWithUs2,
                bg: "bg-sky-500",
              },
              {
                title: "Digital Transformation",
                desc: "Transform your digital presence with our robust web and app solutions. From feature-rich websites to high-performing mobile apps, we ensure seamless functionality and cutting-edge design.",
                img: whyWorkWithUs3,
                bg: "bg-rose-500",
              },
              {
                title: "Industry Focus",
                desc: "We deliver tailored solutions across industries. From enhancing patient care in Healthcare to empowering E-commerce and driving innovation in Technology, we cater to diverse business needs.",
                img: whyWorkWithUs4,
                bg: "bg-emerald-600",
              },
            ].map((item, index) => (
              <div
                key={index}
                data-aos="fade-up"
                className={`${item.bg} rounded-3xl overflow-hidden text-white grid md:grid-cols-2 gap-8 items-center`}
              >
                <div className="p-8 md:p-12 space-y-6">
                  <h3 className="text-2xl md:text-3xl font-bold">{item.title}</h3>
                  <p className="text-white/90 text-lg leading-relaxed">{item.desc}</p>
                  <Quote className="w-12 h-12 text-white/20" />
                </div>
                <div className="h-64 md:h-full relative overflow-hidden flex items-end justify-center bg-white/5">
                  <img
                    src={item.img}
                    alt={item.title}
                    className="max-h-[90%] w-auto object-contain drop-shadow-2xl"
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <ContactForm id="contact" />
    </>
  );
};

export default LandingPage;
