import React, { useContext } from "react";
import img from "../assets/images/contact-form.webp";
import { Link, useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import toast from "react-hot-toast";
import { SpinnerContext } from "./SpinnerContext";
import { companyDetails } from "../data/constant";
import { Send, User, Mail, Phone, Building, MessageSquare } from "lucide-react";

const ContactForm = ({ headline, id }) => {
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
      company: "",
      message: "",
    },
  });

  // handle form submit click
  const handleFormSubmit = async (values) => {
    setSpinner(true);

    var emailBody = "Name: " + values.name + "\n\n";
    emailBody += "Email: " + values.email + "\n\n";
    values.company && (emailBody += "Company: " + values.company + "\n\n");
    emailBody += "Phone: " + values.phone + "\n\n";
    emailBody += "Message:\n" + values.message;

    // Construct the request payload
    var payload = {
      to: companyDetails.email,
      subject: "Contact Form Submission - PANTHM AI Labs",
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
    <div id={id} className="wrapper py-20">
      <div className="bg-white dark:bg-[#050505] rounded-3xl shadow-xl overflow-hidden border border-slate-100 dark:border-white/10 grid lg:grid-cols-2">
        <div data-aos="fade-up" className="p-8 md:p-12 lg:p-16 bg-slate-50 dark:bg-white/5">
          <h3 className="text-2xl md:text-3xl font-bold text-slate-900 dark:text-white mb-2">
            {headline ? headline : "Let’s build something great together."}
          </h3>
          <p className="text-slate-600 dark:text-slate-400 mb-8">
            Fill out the form below and our team will get back to you within 24 hours.
          </p>
          
          <form
            onSubmit={handleSubmit(handleFormSubmit)}
            className="space-y-5"
          >
            <div className="grid md:grid-cols-2 gap-5">
              <div className="space-y-1">
                <div className="relative">
                  <User className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 w-5 h-5" />
                  <input
                    type="text"
                    className="w-full pl-10 pr-4 py-3 bg-white dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-xl focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all dark:text-white"
                    placeholder="Full Name"
                    {...register("name", {
                      required: "Full name is required",
                      validate: (val) => val.trim() !== "" || "Full name is required",
                    })}
                  />
                </div>
                <small className="text-red-500 text-xs ml-1">{errors.name?.message}</small>
              </div>

              <div className="space-y-1">
                <div className="relative">
                  <Building className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 w-5 h-5" />
                  <input
                    type="text"
                    className="w-full pl-10 pr-4 py-3 bg-white dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-xl focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all dark:text-white"
                    placeholder="Company (Optional)"
                    {...register("company")}
                  />
                </div>
              </div>
            </div>

            <div className="space-y-1">
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 w-5 h-5" />
                <input
                  type="email"
                  className="w-full pl-10 pr-4 py-3 bg-white dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-xl focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all dark:text-white"
                  placeholder="Email Address"
                  {...register("email", {
                    required: "Email is required",
                    pattern: {
                      value: /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/,
                      message: "Entered email is invalid",
                    },
                  })}
                />
              </div>
              <small className="text-red-500 text-xs ml-1">{errors.email?.message}</small>
            </div>

            <div className="space-y-1">
              <div className="relative">
                <Phone className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 w-5 h-5" />
                <input
                  type="tel"
                  className="w-full pl-10 pr-4 py-3 bg-white dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-xl focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all dark:text-white"
                  placeholder="Phone Number"
                  {...register("phone", {
                    required: "Phone number is required",
                    pattern: {
                      value: /^\+?[0-9]{10,15}$/,
                      message: "Entered phone number is invalid",
                    },
                  })}
                />
              </div>
              <small className="text-red-500 text-xs ml-1">{errors.phone?.message}</small>
            </div>

            <div className="space-y-1">
              <div className="relative">
                <MessageSquare className="absolute left-3 top-4 text-slate-400 w-5 h-5" />
                <textarea
                  className="w-full pl-10 pr-4 py-3 bg-white dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-xl focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all min-h-[120px] dark:text-white"
                  placeholder="Tell us about your project..."
                  {...register("message", {
                    required: "Message is required",
                    validate: (val) => val.trim() !== "" || "Message is required",
                  })}
                />
              </div>
              <small className="text-red-500 text-xs ml-1">{errors.message?.message}</small>
            </div>

            <button
              disabled={isSubmitting}
              className="w-full primary-btn py-4 rounded-xl flex items-center justify-center gap-2 group"
            >
              {isSubmitting ? "Sending..." : "Send Message"}
              {!isSubmitting && <Send className="w-4 h-4 group-hover:translate-x-1 transition-transform" />}
            </button>
          </form>
        </div>

        <div data-aos="fade-up" className="relative hidden lg:block h-full min-h-[600px]">
          <img 
            src={img} 
            alt="Contact Us" 
            className="absolute inset-0 w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-br from-primary/20 to-secondary/20 mix-blend-multiply"></div>
          <div className="absolute bottom-0 left-0 w-full p-12 bg-gradient-to-t from-black/80 to-transparent text-white">
            <h4 className="text-2xl font-bold mb-2">Ready to Innovate?</h4>
            <p className="text-slate-200">Join hundreds of successful businesses that trust PANTHM AI Labs for their digital transformation.</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ContactForm;
