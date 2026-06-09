import { useKeenSlider } from "keen-slider/react";
import { useState, useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { fetchPublishedBlogs } from "../../api/blogApi";
import { ArrowLeft, ArrowRight, Calendar, User } from "lucide-react";
import { Link } from "react-router-dom";

const BlogsSection = () => {
  const { data, isLoading } = useQuery({
    queryKey: ["publishedBlogs"],
    queryFn: fetchPublishedBlogs,
  });

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  const blogs = data?.blogs || [];
  const displayBlogs = blogs.slice(0, 6); // Limit to 6 blogs for the slider
  const blogCount = displayBlogs.length;

  // Determine if we should use slider or grid layout
  const useSlider = blogCount > 2;
  const shouldShowNavigation = blogCount > 3;

  // Configure slider based on blog count
  const sliderConfig = useMemo(() => {
    if (blogCount === 1) {
      return {
        loop: false,
        initial: 0,
        slides: {
          perView: 1,
          spacing: 24,
        },
        breakpoints: {
          "(min-width: 640px)": {
            slides: {
              perView: 1,
              spacing: 24,
            },
          },
          "(min-width: 1024px)": {
            slides: {
              perView: 1,
              spacing: 24,
            },
          },
        },
      };
    } else if (blogCount === 2) {
      return {
        loop: false,
        initial: 0,
        slides: {
          perView: 1,
          spacing: 24,
        },
        breakpoints: {
          "(min-width: 640px)": {
            slides: {
              perView: 2,
              spacing: 24,
            },
          },
          "(min-width: 1024px)": {
            slides: {
              perView: 2,
              spacing: 24,
            },
          },
        },
      };
    } else {
      return {
        loop: true,
        initial: 0,
        slides: {
          perView: 1,
          spacing: 24,
        },
        breakpoints: {
          "(min-width: 640px)": {
            slides: {
              perView: 2,
              spacing: 24,
            },
          },
          "(min-width: 1024px)": {
            slides: {
              perView: 3,
              spacing: 24,
            },
          },
        },
      };
    }
  }, [blogCount]);

  const [loaded, setLoaded] = useState(false);
  const [sliderRef, instanceRef] = useKeenSlider(
    {
      ...sliderConfig,
      created() {
        setLoaded(true);
      },
    },
    useSlider && blogCount > 2
      ? [
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
      : []
  );

  if (isLoading || blogs.length === 0) {
    return null; // Don't show the section if loading or no blogs
  }

  const PLACEHOLDER_IMG =
    "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='800' height='450' viewBox='0 0 800 450'%3E%3Crect width='800' height='450' fill='%23f1f5f9'/%3E%3Ctext x='50%25' y='50%25' dominant-baseline='middle' text-anchor='middle' font-family='sans-serif' font-size='18' fill='%2394a3b8'%3EPANTHM AI Labs%3C/text%3E%3C/svg%3E";

  const BlogCard = ({ blog }) => (
    <Link
      to={`/blogs/${blog.slug}`}
      className="group bg-white rounded-2xl overflow-hidden border border-slate-100 shadow-sm flex flex-col h-full"
    >
      <div className="relative overflow-hidden aspect-video">
        <img
          src={blog.imageUrl || PLACEHOLDER_IMG}
          alt={blog.imageAlt || blog.title}
          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
          loading="lazy"
        />
        <div className="absolute inset-0 bg-black/20 group-hover:bg-black/10 transition-colors"></div>
        {blog.categoryId && (
          <div className="absolute top-4 left-4 bg-white/90 backdrop-blur-sm px-3 py-1 rounded-full text-xs font-semibold text-primary uppercase tracking-wider">
            {blog.categoryId.name}
          </div>
        )}
      </div>

      <div className="p-6 flex flex-col flex-grow">
        <div className="flex items-center gap-4 text-xs text-slate-500 mb-3">
          <div className="flex items-center gap-1">
            <Calendar size={14} />
            <span>{formatDate(blog.publishDate || blog.createdAt)}</span>
          </div>
          <div className="flex items-center gap-1">
            <User size={14} />
            <span>
              {blog.author?.name || blog.authorId?.name || "Admin"}
            </span>
          </div>
        </div>

        <h3 className="text-xl font-bold text-slate-900 mb-3 line-clamp-2 group-hover:text-primary transition-colors">
          {blog.title}
        </h3>

        <p className="text-slate-600 line-clamp-3 mb-6 flex-grow">
          {blog.excerpt || "Read more about this article..."}
        </p>

        <span className="inline-flex items-center gap-2 text-primary font-semibold text-sm group-hover:gap-3 transition-all">
          Read Article <ArrowRight size={16} />
        </span>
      </div>
    </Link>
  );

  return (
    <section className="py-20 wrapper">
      <div className="text-center max-w-3xl mx-auto mb-12 space-y-4">
        <h2 data-aos="fade-up" className="section-heading">
          Latest Insights
        </h2>
        <p data-aos="fade-up" className="text-slate-600 text-lg">
          Explore our latest thoughts on technology, design, and innovation.
        </p>
      </div>

      <div data-aos="fade-up" className="relative">
        {useSlider ? (
          <>
            <div ref={sliderRef} className="keen-slider">
              {displayBlogs.map((blog) => (
                <div key={blog._id} className="keen-slider__slide">
                  <BlogCard blog={blog} />
                </div>
              ))}
            </div>

            {loaded &&
              instanceRef.current &&
              shouldShowNavigation &&
              displayBlogs.length > 0 && (
                <div className="flex items-center justify-center gap-4 mt-12">
                  <button
                    onClick={() => instanceRef.current?.prev()}
                    className="w-12 h-12 rounded-full border border-slate-200 flex items-center justify-center text-slate-600 hover:bg-primary hover:text-white hover:border-primary transition-all"
                    aria-label="Previous slide"
                  >
                    <ArrowLeft className="w-5 h-5" />
                  </button>
                  <button
                    onClick={() => instanceRef.current?.next()}
                    className="w-12 h-12 rounded-full border border-slate-200 flex items-center justify-center text-slate-600 hover:bg-primary hover:text-white hover:border-primary transition-all"
                    aria-label="Next slide"
                  >
                    <ArrowRight className="w-5 h-5" />
                  </button>
                </div>
              )}
          </>
        ) : (
          <div
            className={`grid gap-6 ${
              blogCount === 1
                ? "grid-cols-1 max-w-2xl mx-auto"
                : "grid-cols-1 sm:grid-cols-2"
            }`}
          >
            {displayBlogs.map((blog) => (
              <BlogCard key={blog._id} blog={blog} />
            ))}
          </div>
        )}
      </div>
    </section>
  );
};

export default BlogsSection;
