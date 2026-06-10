import React, { lazy, useContext } from "react";
import banner from "../assets/images/contactus-banner.jpg";
import { Mail, MapPin, PhoneCall, ArrowRight, MessageSquare } from "lucide-react";
import { companyDetails } from "../data/constant";
import { Link, useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import { useForm } from "react-hook-form";
import { SpinnerContext } from "../components/SpinnerContext";
import SEO from "../components/SEO";

const MapComponent = lazy(() => import("../components/website/MapComponent"));

const ContactUs = () => {
  const structuredData = {
    "@context": "https://schema.org",
    "@type": "ContactPage",
    "mainEntity": {
      "@type": "Organization",
      "name": companyDetails.name,
      "contactPoint": {
        "@type": "ContactPoint",
        "telephone": companyDetails.phone,
        "contactType": "customer service",
        "email": companyDetails.email,
        "areaServed": "Worldwide",
        "availableLanguage": "English"
      },
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
  const { setSpinner } = useContext(SpinnerContext);
  const navigate = useNavigate();
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm({
    mode: "all",
    defaultValues: {
      name: "",
      email: "",
      phone: "",
      subject: "",
      message: "",
    },
  });

  // handle form submit click
  const handleFormSubmit = async (values) => {
    setSpinner(true);

    var emailBody = "Name: " + values.name + "\n\n";
    emailBody += "Email: " + values.email + "\n\n";
    emailBody += "Phone: " + values.phone + "\n\n";
    emailBody += "Message:\n" + values.message;

    // Construct the request payload
    var payload = {
      to: companyDetails.email,
      subject: values.subject,
      body: emailBody,
      name:"Panthm AI Labs"
    };

    await fetch("https://send-mail-redirect-boostmysites.vercel.app/send-email", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
    })
      .then((response) => response.json())
      .then((res) => {
        if (res.error) {
          toast.error(res.error);
        } else {
          toast.success("Email sent successfully");
          reset();
          navigate("/thank-you");
        }
      })
      .catch((error) => {
        toast.error(error.message);
      })
      .finally(() => setSpinner(false));
  };
  return (
    <div className="pt-20">
      <SEO
        title="Contact Us"
        description="Get in touch with PANTHM AI Labs. We help companies launch new digital products, automate operations with AI, scale existing platforms, create immersive gaming experiences, and build brands."
        keywords="contact PANTHM AI Labs, software development company contact, web development company Pune, app development contact, AI solutions contact"
        structuredData={structuredData}
      />
      {/* Hero Section */}
      <section className="relative h-[50vh] min-h-[400px] flex items-center justify-center overflow-hidden">
        <div className="absolute inset-0 z-0">
          <img
            src={banner}
            alt="Contact Us Banner"
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-slate-900/80"></div>
        </div>
        
        <div className="wrapper relative z-10 text-center text-white space-y-6 max-w-4xl mx-auto">
          <h1 data-aos="fade-up" className="heading text-white">
            Let's Start a <span className="text-primary">Conversation</span>
          </h1>
          <p data-aos="fade-up" data-aos-delay="100" className="text-lg md:text-xl text-slate-300 leading-relaxed max-w-2xl mx-auto">
            Whether you have a question about our services, pricing, or just want to say hello, our team is ready to answer all your questions.
          </p>
        </div>
      </section>

      {/* Contact Info Cards */}
      <section className="py-20 bg-slate-50 dark:bg-[#0a0a0a]">
        <div className="wrapper">
          <div className="grid md:grid-cols-3 gap-8 -mt-32 relative z-20">
            {[
              {
                icon: MapPin,
                title: "Visit Us",
                content: companyDetails.address,
                link: null,
              },
              {
                icon: PhoneCall,
                title: "Call Us",
                content: companyDetails.phone,
                link: `tel:${companyDetails.phone}`,
              },
              {
                icon: Mail,
                title: "Email Us",
                content: companyDetails.email,
                link: `mailto:${companyDetails.email}`,
              },
            ].map((item, index) => (
              <div
                key={index}
                data-aos="fade-up"
                data-aos-delay={index * 100}
                className="bg-white dark:bg-white/5 p-8 rounded-2xl shadow-xl border border-slate-100 dark:border-white/10 flex flex-col items-center text-center hover:-translate-y-2 transition-transform duration-300"
              >
                <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mb-6 text-primary">
                  <item.icon size={32} />
                </div>
                <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-3">{item.title}</h3>
                {item.link ? (
                  <Link
                    to={item.link}
                    className="text-slate-600 dark:text-slate-300 hover:text-primary transition-colors"
                  >
                    {item.content}
                  </Link>
                ) : (
                  <p className="text-slate-600 dark:text-slate-300">{item.content}</p>
                )}
              </div>
            ))}
          </div>

          <div className="mt-20 grid lg:grid-cols-2 gap-12 items-center">
            <div data-aos="fade-up" className="space-y-6">
              <h2 className="section-heading text-left">
                Get in Touch
              </h2>
              <p className="text-slate-600 dark:text-slate-300 text-lg leading-relaxed">
                We're excited to collaborate with you on your next big idea! Whether you need a cutting-edge website, a dynamic mobile app, or innovative AI solutions, our team is ready to help.
              </p>

              {/* WhatsApp quick-connect */}
              <a
                href={`https://wa.me/${companyDetails.phone}?text=Hi%20PANTHM%20AI%20Labs%2C%20I%27d%20like%20to%20discuss%20a%20project.`}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-3 px-6 py-4 rounded-2xl bg-[#25D366] text-white font-semibold hover:bg-[#1ebe5e] transition-all duration-200 shadow-lg shadow-[#25D366]/20 hover:-translate-y-0.5 w-full sm:w-auto justify-center sm:justify-start"
              >
                <MessageSquare size={22} />
                Chat Instantly on WhatsApp
                <ArrowRight size={18} className="ml-auto sm:ml-0" />
              </a>
              <p className="text-slate-400 text-sm -mt-2">or fill the form below ↓</p>
              
              <div className="bg-white dark:bg-white/5 p-8 rounded-2xl shadow-lg border border-slate-100 dark:border-white/10">
                <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-4">
                  <div className="grid md:grid-cols-2 gap-4">
                    <div className="space-y-1">
                      <input
                        type="text"
                        className="w-full px-4 py-3 bg-slate-50 dark:bg-[#050505] border border-slate-200 dark:border-white/10 dark:text-white dark:placeholder:text-slate-500 rounded-xl focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all"
                        placeholder="Full Name"
                        {...register("name", { required: "Required" })}
                      />
                      <small className="text-red-500 text-xs">{errors.name?.message}</small>
                    </div>
                    <div className="space-y-1">
                      <input
                        type="email"
                        className="w-full px-4 py-3 bg-slate-50 dark:bg-[#050505] border border-slate-200 dark:border-white/10 dark:text-white dark:placeholder:text-slate-500 rounded-xl focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all"
                        placeholder="Email Address"
                        {...register("email", { 
                          required: "Required",
                          pattern: {
                            value: /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/,
                            message: "Invalid email",
                          },
                        })}
                      />
                      <small className="text-red-500 text-xs">{errors.email?.message}</small>
                    </div>
                  </div>
                  
                  <div className="grid md:grid-cols-2 gap-4">
                    <div className="space-y-1">
                      <input
                        type="tel"
                        className="w-full px-4 py-3 bg-slate-50 dark:bg-[#050505] border border-slate-200 dark:border-white/10 dark:text-white dark:placeholder:text-slate-500 rounded-xl focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all"
                        placeholder="Phone Number"
                        {...register("phone", { required: "Required" })}
                      />
                      <small className="text-red-500 text-xs">{errors.phone?.message}</small>
                    </div>
                    <div className="space-y-1">
                      <input
                        type="text"
                        className="w-full px-4 py-3 bg-slate-50 dark:bg-[#050505] border border-slate-200 dark:border-white/10 dark:text-white dark:placeholder:text-slate-500 rounded-xl focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all"
                        placeholder="Subject"
                        {...register("subject", { required: "Required" })}
                      />
                      <small className="text-red-500 text-xs">{errors.subject?.message}</small>
                    </div>
                  </div>

                  <div className="space-y-1">
                    <textarea
                      className="w-full px-4 py-3 bg-slate-50 dark:bg-[#050505] border border-slate-200 dark:border-white/10 dark:text-white dark:placeholder:text-slate-500 rounded-xl focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all min-h-[120px]"
                      placeholder="Your Message"
                      {...register("message", { required: "Required" })}
                    />
                    <small className="text-red-500 text-xs">{errors.message?.message}</small>
                  </div>

                  <button
                    disabled={isSubmitting}
                    className="w-full primary-btn py-4 rounded-xl flex items-center justify-center gap-2 group"
                  >
                    {isSubmitting ? "Sending..." : "Send Message"}
                    {!isSubmitting && <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />}
                  </button>
                </form>
              </div>
            </div>

            <div data-aos="fade-up" className="h-full min-h-[400px] rounded-2xl overflow-hidden shadow-lg border border-slate-200">
              <MapComponent />
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default ContactUs;
