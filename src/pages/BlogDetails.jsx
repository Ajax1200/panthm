import React, { useState } from "react";
import { useParams, Navigate, Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { fetchBlogBySlug } from "../api/blogApi";
import {
  Calendar,
  User,
  Clock,
  Linkedin,
  Twitter,
  MessageCircle,
  Link2,
  Check,
  ArrowLeft,
} from "lucide-react";
import { LoadingSpinner } from "../components/LoadingSpinner";
import SEO from "../components/SEO";
import BlogImage from "../components/website/BlogImage";
import { companyDetails } from "../data/constant";
import { addSemanticLinks, optimizeHtmlImages, generateTocAndAddIds } from "../utils/linkHelper";
import { lazy, Suspense } from "react";

const BlogsSection = lazy(() => import("../components/website/BlogsSection"));

// Local branded placeholder
const PLACEHOLDER_IMG =
  "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='800' height='450' viewBox='0 0 800 450'%3E%3Crect width='800' height='450' fill='%23f1f5f9'/%3E%3Ctext x='50%25' y='50%25' dominant-baseline='middle' text-anchor='middle' font-family='sans-serif' font-size='18' fill='%2394a3b8'%3EPANTHM AI Labs%3C/text%3E%3C/svg%3E";

// Sticky social share sidebar
const ShareSidebar = ({ url, title }) => {
  const [copied, setCopied] = useState(false);

  const encodedUrl = encodeURIComponent(url);
  const encodedTitle = encodeURIComponent(title);

  const shareLinks = [
    {
      label: "Share on LinkedIn",
      href: `https://www.linkedin.com/shareArticle?mini=true&url=${encodedUrl}&title=${encodedTitle}`,
      icon: Linkedin,
      color: "hover:bg-[#0A66C2] hover:border-[#0A66C2] hover:text-white",
    },
    {
      label: "Share on X / Twitter",
      href: `https://twitter.com/intent/tweet?url=${encodedUrl}&text=${encodedTitle}`,
      icon: Twitter,
      color: "hover:bg-[#1DA1F2] hover:border-[#1DA1F2] hover:text-white",
    },
    {
      label: "Share on WhatsApp",
      href: `https://wa.me/?text=${encodedTitle}%20${encodedUrl}`,
      icon: MessageCircle,
      color: "hover:bg-[#25D366] hover:border-[#25D366] hover:text-white",
    },
  ];

  const handleCopy = () => {
    navigator.clipboard.writeText(url);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <aside className="hidden xl:flex flex-col items-center gap-3 sticky top-32 self-start" aria-label="Social Share Sidebar">
      <span className="text-xs text-slate-400 font-medium uppercase tracking-widest rotate-0 mb-1">
        Share
      </span>
      {shareLinks.map(({ label, href, icon: Icon, color }) => (
        <a
          key={label}
          href={href}
          target="_blank"
          rel="noopener noreferrer"
          title={label}
          className={`w-11 h-11 rounded-full border border-slate-200 dark:border-white/10 bg-white dark:bg-white/5 flex items-center justify-center text-slate-500 dark:text-slate-400 transition-all duration-200 shadow-sm ${color}`}
        >
          <Icon size={18} />
        </a>
      ))}
      <button
        onClick={handleCopy}
        title="Copy link"
        className={`w-11 h-11 rounded-full border flex items-center justify-center transition-all duration-200 shadow-sm ${
          copied
            ? "bg-emerald-500 border-emerald-500 text-white"
            : "border-slate-200 dark:border-white/10 bg-white dark:bg-[#050505] text-slate-500 dark:text-slate-400 hover:bg-slate-900 hover:border-slate-900 hover:text-white dark:hover:bg-white dark:hover:text-slate-900"
        }`}
      >
        {copied ? <Check size={18} /> : <Link2 size={18} />}
      </button>
    </aside>
  );
};

// Mobile share bar (bottom of article on smaller screens)
const MobileShareBar = ({ url, title }) => {
  const [copied, setCopied] = useState(false);
  const encodedUrl = encodeURIComponent(url);
  const encodedTitle = encodeURIComponent(title);

  return (
    <aside className="xl:hidden flex items-center gap-3 pt-8 border-t border-slate-100 dark:border-white/10" aria-label="Mobile Social Share">
      <span className="text-sm font-semibold text-slate-700 dark:text-slate-300 mr-2">Share:</span>
      <a
        href={`https://www.linkedin.com/shareArticle?mini=true&url=${encodedUrl}&title=${encodedTitle}`}
        target="_blank"
        rel="noopener noreferrer"
        className="w-10 h-10 rounded-full bg-[#0A66C2] flex items-center justify-center text-white hover:opacity-80 transition-opacity"
      >
        <Linkedin size={16} />
      </a>
      <a
        href={`https://twitter.com/intent/tweet?url=${encodedUrl}&text=${encodedTitle}`}
        target="_blank"
        rel="noopener noreferrer"
        className="w-10 h-10 rounded-full bg-[#1DA1F2] flex items-center justify-center text-white hover:opacity-80 transition-opacity"
      >
        <Twitter size={16} />
      </a>
      <a
        href={`https://wa.me/?text=${encodedTitle}%20${encodedUrl}`}
        target="_blank"
        rel="noopener noreferrer"
        className="w-10 h-10 rounded-full bg-[#25D366] flex items-center justify-center text-white hover:opacity-80 transition-opacity"
      >
        <MessageCircle size={16} />
      </a>
      <button
        onClick={() => {
          navigator.clipboard.writeText(url);
          setCopied(true);
          setTimeout(() => setCopied(false), 2000);
        }}
        className={`w-10 h-10 rounded-full flex items-center justify-center text-white transition-all ${
          copied ? "bg-emerald-500" : "bg-slate-700 hover:bg-slate-900"
        }`}
      >
        {copied ? <Check size={16} /> : <Link2 size={16} />}
      </button>
    </aside>
  );
};

const BlogDetails = () => {
  const { slug } = useParams();
  const { data, isLoading, isError, error } = useQuery({
    queryKey: ["blog", slug],
    queryFn: () => fetchBlogBySlug(slug),
    enabled: !!slug,
  });

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  const calculateReadTime = (content) => {
    if (!content) return "5 min read";
    const text = content.replace(/<[^>]*>/g, "");
    const words = text.split(/\s+/).length;
    const readTime = Math.ceil(words / 200);
    return `${readTime} min read`;
  };

  if (isLoading) {
    return (
      <div className="pt-20 min-h-screen flex items-center justify-center">
        <LoadingSpinner />
      </div>
    );
  }

  if (isError || !data?.success || !data?.blog) {
    if (error?.message?.includes("404") || !data?.success) {
      return <Navigate to="/blogs" replace />;
    }
    return (
      <div className="pt-20 pb-20 min-h-screen">
        <div className="wrapper">
          <div className="text-center max-w-3xl mx-auto">
            <h1 className="heading mb-4">Error Loading Blog</h1>
            <p className="text-slate-600 dark:text-slate-400 text-lg">
              {error?.message || "Failed to load blog. Please try again later."}
            </p>
          </div>
        </div>
      </div>
    );
  }

  const blog = data.blog;
  const articleUrl = `https://panthm.com/blogs/${blog.slug}`;

  const structuredData = {
    "@context": "https://schema.org",
    "@type": "BlogPosting",
    headline: blog.title,
    description: blog.excerpt || blog.metaDescription || "",
    image: blog.imageUrl || blog.image || "",
    datePublished: blog.publishDate || blog.createdAt,
    dateModified: blog.updatedAt || blog.createdAt,
    author: {
      "@type": "Organization",
      name: blog.author?.name || blog.authorId?.name || "PANTHM Editorial Team",
      url: "https://panthm.com",
    },
    publisher: {
      "@type": "Organization",
      name: companyDetails.name,
      logo: {
        "@type": "ImageObject",
        url: "https://panthm.com/logo.png",
      },
    },
    mainEntityOfPage: {
      "@id": `${articleUrl}#webpage`,
    },
    keywords: (Array.isArray(blog.metaKeywords) ? blog.metaKeywords.join(", ") : blog.metaKeywords) || blog.tags?.join(", ") || "",
  };

  const { html: processedHtml, toc } = blog.content ? generateTocAndAddIds(optimizeHtmlImages(addSemanticLinks(blog.content), blog.title)) : { html: null, toc: [] };

  return (
    <main className="pt-20">
      <SEO
        title={blog.title}
        description={
          blog.excerpt ||
          blog.metaDescription ||
          `Read ${blog.title} on PANTHM AI Labs blog.`
        }
        keywords={
          (Array.isArray(blog.metaKeywords) ? blog.metaKeywords.join(", ") : blog.metaKeywords) ||
          blog.tags?.join(", ") ||
          "technology, web development, software development"
        }
        image={blog.imageUrl || blog.image}
        url={articleUrl}
        type="article"
        structuredData={structuredData}
      />

      {/* Hero */}
      <div className="bg-slate-900 py-20 text-white relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-primary/20 to-secondary/20" />
        <div className="wrapper relative z-10 max-w-4xl mx-auto text-center space-y-6">
          {blog.categoryId && (
            <span className="inline-block px-4 py-1.5 rounded-full bg-primary/20 border border-primary/30 text-primary text-xs font-semibold uppercase tracking-widest">
              {blog.categoryId.name}
            </span>
          )}
          <h1 className="text-3xl md:text-5xl font-bold leading-tight">
            {blog.title}
          </h1>
          <div className="flex items-center justify-center gap-6 text-sm text-slate-300 flex-wrap">
            <time dateTime={blog.publishDate || blog.createdAt} className="flex items-center gap-2">
              <Calendar size={16} />
              {formatDate(blog.publishDate || blog.createdAt)}
            </time>
            <span className="flex items-center gap-2">
              <User size={16} />
              {blog.author?.name || blog.authorId?.name || "PANTHM Editorial"}
            </span>
            <span className="flex items-center gap-2">
              <Clock size={16} /> {calculateReadTime(blog.content)}
            </span>
          </div>
        </div>
      </div>

      {/* Article body with sticky share sidebar */}
      <div className="wrapper py-12">
        <div className="max-w-5xl mx-auto">
          {/* Back link */}
          <nav aria-label="Breadcrumb">
            <Link
              to="/blogs"
              className="inline-flex items-center gap-2 text-slate-500 dark:text-slate-400 hover:text-primary transition-colors text-sm mb-8 group"
            >
              <ArrowLeft size={16} className="group-hover:-translate-x-1 transition-transform" />
              Back to Journal
            </Link>
          </nav>

          <article className="flex gap-10 items-start">
            {/* Sticky share sidebar (desktop) */}
            <ShareSidebar url={articleUrl} title={blog.title} />

            {/* Main content */}
            <div className="flex-1 min-w-0">
              {(blog.imageUrl || blog.image) && (
                <div className="rounded-2xl overflow-hidden shadow-xl mb-10">
                  <BlogImage
                    src={blog.imageUrl || blog.image}
                    className="w-full aspect-video object-cover"
                    alt={blog.imageAlt || blog.title}
                  />
                </div>
              )}

              {toc && toc.length > 0 && (
                <nav className="mb-10 bg-slate-50 dark:bg-slate-900/50 p-6 rounded-2xl border border-slate-100 dark:border-white/5" aria-label="Table of Contents">
                  <h2 className="text-xl font-bold mb-4 text-slate-900 dark:text-white">Table of Contents</h2>
                  <ul className="space-y-2">
                    {toc.map((item, index) => (
                      <li key={index} className={`${item.level === 3 ? 'ml-4' : ''}`}>
                        <a 
                          href={`#${item.id}`}
                          className="text-slate-600 dark:text-slate-400 hover:text-primary transition-colors text-sm"
                        >
                          {item.text}
                        </a>
                      </li>
                    ))}
                  </ul>
                </nav>
              )}

              {processedHtml ? (
                <div className="prose prose-lg prose-slate dark:prose-invert max-w-none">
                  <div
                    dangerouslySetInnerHTML={{ __html: processedHtml }}
                    className="reset-html"
                  />
                </div>
              ) : (
                <div className="prose prose-lg prose-slate dark:prose-invert max-w-none">
                  <p className="text-slate-600 dark:text-slate-400 text-lg">{blog.excerpt}</p>
                </div>
              )}

              {/* Tags */}
              {blog.tags && blog.tags.length > 0 && (
                <div className="mt-10 pt-8 border-t border-slate-200 dark:border-white/10">
                  <div className="flex flex-wrap gap-2">
                    {blog.tags.map((tag, index) => (
                      <span
                        key={index}
                        className="px-4 py-2 bg-primary/10 text-primary rounded-full text-sm font-medium"
                      >
                        #{tag}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Mobile share bar */}
              <MobileShareBar url={articleUrl} title={blog.title} />
            </div>
          </article>
        </div>
      </div>

      {/* Related Articles */}
      <div className="bg-slate-50 dark:bg-[#0a0a0a] py-20">
        <Suspense fallback={null}>
          <BlogsSection />
        </Suspense>
      </div>
    </main>
  );
};

export default BlogDetails;
