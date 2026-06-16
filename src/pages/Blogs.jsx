import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { ArrowRight, Calendar, User, Loader2, Filter, Search } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { fetchPublishedBlogsPaginated } from "../api/blogApi";
import { LoadingSpinner } from "../components/LoadingSpinner";
import SEO from "../components/SEO";

const BLOGS_PER_PAGE = 9;

const CATEGORIES = [
  "All",
  "AI & Automation",
  "SEO",
  "GEO",
  "Web Development",
  "SaaS",
];

// Local branded placeholder — no third-party dependency
const PLACEHOLDER_IMG =
  "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='800' height='450' viewBox='0 0 800 450'%3E%3Crect width='800' height='450' fill='%23f1f5f9'/%3E%3Ctext x='50%25' y='50%25' dominant-baseline='middle' text-anchor='middle' font-family='sans-serif' font-size='18' fill='%2394a3b8'%3EPANTHM AI Labs%3C/text%3E%3C/svg%3E";

const Blogs = () => {
  const [activeCategory, setActiveCategory] = useState("All");
  const [page, setPage] = useState(1);
  const [allBlogs, setAllBlogs] = useState([]);
  const [loadedPages, setLoadedPages] = useState(new Set());
  const [searchQuery, setSearchQuery] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");

  const structuredData = {
    "@context": "https://schema.org",
    "@type": "Blog",
    name: "PANTHM AI Labs Blog",
    description:
      "Insights, trends, and strategies from the forefront of digital innovation. Expert articles on web development, app development, AI, and technology.",
    publisher: {
      "@type": "Organization",
      name: "PANTHM AI Labs",
    },
  };

  const categoryFilter = activeCategory === "All" ? "" : activeCategory;

  // Debounce search query changes to prevent API spamming
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(searchQuery);
      setPage(1);
      setAllBlogs([]);
      setLoadedPages(new Set());
    }, 450);
    return () => clearTimeout(timer);
  }, [searchQuery]);

  const { data, isLoading, isFetching } = useQuery({
    queryKey: ["publishedBlogs", page, categoryFilter, debouncedSearch],
    queryFn: () => fetchPublishedBlogsPaginated(page, BLOGS_PER_PAGE, categoryFilter, debouncedSearch),
    keepPreviousData: true,
  });

  useEffect(() => {
    if (data?.blogs && !loadedPages.has(page)) {
      setAllBlogs((prev) =>
        page === 1 ? data.blogs : [...prev, ...(data.blogs || [])]
      );
      setLoadedPages((prev) => new Set([...prev, page]));
    }
  }, [data, page, loadedPages]);

  const handleCategoryChange = (cat) => {
    setActiveCategory(cat);
    setPage(1);
    setAllBlogs([]);
    setLoadedPages(new Set());
  };

  const handleLoadMore = () => {
    setPage((p) => p + 1);
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  const totalPages = data?.totalPages || 1;
  const hasMore = page < totalPages;
  const displayBlogs = allBlogs.length > 0 ? allBlogs : data?.blogs || [];

  if (isLoading && page === 1 && allBlogs.length === 0) {
    return (
      <div className="pt-32 pb-20 bg-slate-50 dark:bg-[#0a0a0a] min-h-screen flex items-center justify-center">
        <LoadingSpinner />
      </div>
    );
  }

  return (
    <div className="pt-32 pb-20 bg-slate-50 dark:bg-[#0a0a0a] min-h-screen">
      <SEO
        title="Blogs"
        description="Read insights, trends, and strategies from PANTHM AI Labs. We help companies launch new digital products, automate operations with AI, scale existing platforms, create immersive gaming experiences, and build brands."
        keywords="technology blog, web development blog, app development blog, AI blog, software development articles, tech insights, digital innovation blog"
        structuredData={structuredData}
      />
      <div className="wrapper">
        {/* Header */}
        <div className="text-center max-w-3xl mx-auto mb-12 space-y-4">
          <h1 data-aos="fade-up" className="heading">
            Our <span className="text-primary">Journal</span>
          </h1>
          <p data-aos="fade-up" className="text-slate-600 dark:text-slate-400 text-lg">
            Insights, trends, and strategies from the forefront of digital
            innovation.
          </p>
        </div>

        {/* Search Bar */}
        <div data-aos="fade-up" className="max-w-md mx-auto mb-10 relative">
          <input
            type="text"
            placeholder="Search articles by title, keywords or tags..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-12 pr-4 py-3.5 bg-white dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-full text-slate-800 dark:text-slate-100 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all shadow-sm"
          />
          <Search size={18} className="absolute left-4 top-1/2 transform -translate-y-1/2 text-slate-400" />
        </div>

        {/* Category Filter Pills */}
        <div
          data-aos="fade-up"
          className="flex flex-wrap items-center justify-center gap-3 mb-12"
        >
          <Filter size={16} className="text-slate-400" />
          {CATEGORIES.map((cat) => (
            <button
              key={cat}
              onClick={() => handleCategoryChange(cat)}
              className={`px-5 py-2 rounded-full text-sm font-medium transition-all duration-200 border ${
                activeCategory === cat
                  ? "bg-primary text-white border-primary shadow-md shadow-primary/20"
                  : "bg-white dark:bg-white/5 text-slate-600 dark:text-slate-300 border-slate-200 dark:border-white/10 hover:border-primary hover:text-primary dark:hover:border-primary dark:hover:text-primary"
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Blog Grid */}
        {displayBlogs.length === 0 && !isLoading ? (
          <div className="text-center py-24">
            <p className="text-slate-400 text-lg">
              No articles in this category yet. Check back soon!
            </p>
            <button
              onClick={() => handleCategoryChange("All")}
              className="mt-4 text-primary font-medium hover:underline"
            >
              View all articles →
            </button>
          </div>
        ) : (
          <>
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-8">
              {displayBlogs.map((blog, i) => (
                <div
                  key={blog._id}
                  data-aos="fade-up"
                  data-aos-delay={(i % 9) * 60}
                  className="group bg-white dark:bg-[#050505] rounded-2xl overflow-hidden border border-slate-100 dark:border-white/10 shadow-sm hover:shadow-xl transition-all duration-300 flex flex-col"
                >
                  <Link
                    to={`/blogs/${blog.slug}`}
                    className="relative overflow-hidden aspect-video block"
                  >
                    <img
                      src={blog.imageUrl || PLACEHOLDER_IMG}
                      alt={blog.imageAlt || blog.title}
                      className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                      loading="lazy"
                    />
                    <div className="absolute inset-0 bg-black/20 group-hover:bg-black/10 transition-colors" />
                    {blog.categoryId && (
                      <div className="absolute top-4 left-4 bg-white/90 dark:bg-black/60 backdrop-blur-sm px-3 py-1 rounded-full text-xs font-semibold text-primary uppercase tracking-wider">
                        {blog.categoryId.name}
                      </div>
                    )}
                  </Link>

                  <div className="p-6 flex flex-col flex-grow">
                    <div className="flex items-center gap-4 text-xs text-slate-500 dark:text-slate-400 mb-3">
                      <div className="flex items-center gap-1">
                        <Calendar size={14} />
                        <span>{formatDate(blog.publishDate || blog.createdAt)}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <User size={14} />
                        <span>{blog.author?.name || blog.authorId?.name || "PANTHM Editorial"}</span>
                      </div>
                    </div>

                    <Link
                      to={`/blogs/${blog.slug}`}
                      className="text-xl font-bold text-slate-900 dark:text-white mb-3 line-clamp-2 group-hover:text-primary transition-colors"
                    >
                      {blog.title}
                    </Link>

                    <p className="text-slate-600 dark:text-slate-300 line-clamp-3 mb-6 flex-grow">
                      {blog.excerpt || "Read more about this article..."}
                    </p>

                    <Link
                      to={`/blogs/${blog.slug}`}
                      className="inline-flex items-center gap-2 text-primary font-semibold text-sm group-hover:gap-3 transition-all"
                    >
                      Read Article <ArrowRight size={16} />
                    </Link>
                  </div>
                </div>
              ))}
            </div>

            {/* Load More Button */}
            {hasMore && (
              <div className="flex justify-center mt-14">
                <button
                  onClick={handleLoadMore}
                  disabled={isFetching}
                  className="inline-flex items-center gap-3 px-10 py-4 rounded-full bg-primary text-white font-semibold text-sm shadow-lg shadow-primary/25 hover:bg-primary/90 hover:-translate-y-0.5 transition-all duration-200 disabled:opacity-60 disabled:cursor-not-allowed disabled:translate-y-0"
                >
                  {isFetching ? (
                    <>
                      <Loader2 size={18} className="animate-spin" />
                      Loading...
                    </>
                  ) : (
                    <>
                      Load More Articles <ArrowRight size={18} />
                    </>
                  )}
                </button>
              </div>
            )}

            {/* Page indicator */}
            {data?.totalCount && (
              <p className="text-center text-slate-400 text-sm mt-6">
                Showing {displayBlogs.length} of {data.totalCount} articles
              </p>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default Blogs;
