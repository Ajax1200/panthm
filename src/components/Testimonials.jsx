import React from "react";
import { useKeenSlider } from "keen-slider/react";
import { ArrowLeft, ArrowRight, Star, Award } from "lucide-react";
import { testimonials } from "../data/constant";

const Testimonials = () => {
  const [loaded, setLoaded] = React.useState(false);
  const [sliderRef, instanceRef] = useKeenSlider(
    {
      loop: true,
      initial: 0,
      slides: {
        perView: 1,
        spacing: 25,
      },
      created() {
        setLoaded(true);
      },
    },
    [
      (slider) => {
        let timeout;
        let mouseOver = false;
        function clearNextTimeout() {
          clearTimeout(timeout);
        }
        function nextTimeout() {
          clearTimeout(timeout);
          if (mouseOver) return;
          timeout = setTimeout(() => {
            slider.next();
          }, 3000);
        }
        slider.on("created", () => {
          slider.container.addEventListener("mouseover", () => {
            mouseOver = true;
            clearNextTimeout();
          });
          slider.container.addEventListener("mouseout", () => {
            mouseOver = false;
            nextTimeout();
          });
          nextTimeout();
        });
        slider.on("dragStarted", clearNextTimeout);
        slider.on("animationEnded", nextTimeout);
        slider.on("updated", nextTimeout);
      },
    ]
  );

  return (
    <div className="wrapper">
      <div className="grid lg:grid-cols-2 gap-12 items-center">
        {/* Awards Section */}
        <div data-aos="fade-up" className="space-y-8">
          <div className="space-y-4">
            <h2 className="section-heading text-left dark:text-white">
              Recognized for Excellence
            </h2>
            <p className="text-slate-600 dark:text-slate-400 text-lg">
              Our commitment to quality and innovation has earned us recognition across the industry.
            </p>
          </div>

          <div className="grid sm:grid-cols-2 gap-4">
            {[
              "Leading Staff Augmentation Providers",
              "Best Software Development Firms",
              "Premier AI Development Experts",
              "Top App Development Agencies",
            ].map((text, idx) => (
              <div
                key={idx}
                className="p-4 bg-white dark:bg-white/5 rounded-xl shadow-sm border border-slate-100 dark:border-white/10 flex items-center gap-4 hover:shadow-md dark:hover:shadow-white/5 transition-shadow"
              >
                <div className="w-10 h-10 flex-shrink-0 bg-amber-50 dark:bg-amber-500/10 rounded-full flex items-center justify-center">
                  <Award className="text-amber-500 w-6 h-6" />
                </div>
                <p className="font-medium text-slate-800 dark:text-slate-200 text-sm leading-tight">{text}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Testimonials Slider */}
        <div
          data-aos="fade-up"
          className="bg-white dark:bg-white/5 p-8 md:p-10 rounded-3xl shadow-xl border border-slate-100 dark:border-white/10 relative overflow-hidden"
        >
          <div className="absolute -top-6 -right-6 w-20 h-20 bg-primary/10 rounded-full blur-xl"></div>
          <div className="absolute -bottom-6 -left-6 w-20 h-20 bg-secondary/10 rounded-full blur-xl"></div>
          
          <div className="mb-6 flex gap-1">
            {[...Array(5)].map((_, i) => (
              <Star key={i} className="w-5 h-5 fill-amber-400 text-amber-400" />
            ))}
          </div>

          <div ref={sliderRef} className="keen-slider mb-8 overflow-hidden">
            {testimonials.map((item) => (
              <div key={item.name} className="keen-slider__slide space-y-6">
                <p className="text-lg md:text-xl text-slate-700 dark:text-slate-300 italic leading-relaxed">
                  "{item.desc}"
                </p>
                <div className="flex items-center gap-4 pt-4 border-t border-slate-100 dark:border-white/10">
                  <img
                    src={item.img}
                    alt={item.name}
                    className="w-14 h-14 object-cover rounded-full ring-2 ring-primary/20"
                  />
                  <div>
                    <p className="font-bold text-slate-900 dark:text-white">{item.name}</p>
                    <p className="text-sm text-slate-500 dark:text-slate-400">{item.position}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {loaded && instanceRef.current && (
            <div className="flex items-center justify-end gap-3">
              <button
                onClick={() => instanceRef.current?.prev()}
                className="w-10 h-10 rounded-full border border-slate-200 dark:border-white/10 flex items-center justify-center text-slate-600 dark:text-slate-400 hover:bg-primary hover:text-white dark:hover:bg-primary dark:hover:border-primary transition-all"
                aria-label="Previous testimonial"
              >
                <ArrowLeft className="w-5 h-5" />
              </button>
              <button
                onClick={() => instanceRef.current?.next()}
                className="w-10 h-10 rounded-full border border-slate-200 dark:border-white/10 flex items-center justify-center text-slate-600 dark:text-slate-400 hover:bg-primary hover:text-white dark:hover:bg-primary dark:hover:border-primary transition-all"
                aria-label="Next testimonial"
              >
                <ArrowRight className="w-5 h-5" />
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Testimonials;
