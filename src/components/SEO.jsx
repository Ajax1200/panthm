import { useEffect } from "react";
import { useLocation } from "react-router-dom";
import { companyDetails } from "../data/constant";

const SEO = ({
  title,
  description,
  keywords,
  image,
  url,
  type = "website",
  structuredData,
}) => {
  const location = useLocation();
  const baseUrl = "https://panthm.com"; // Update with your actual domain
  const currentUrl = `${baseUrl}${location.pathname}`;
  const ogImage = image || `${baseUrl}/logo.png`;
  const pageTitle = title
    ? `${title} | ${companyDetails.name}`
    : `${companyDetails.name} - Building Intelligent Products That Redefine Industries`;

  useEffect(() => {
    // Update document title
    document.title = pageTitle;

    // Update or create meta tags
    const updateMetaTag = (name, content, attribute = "name") => {
      let element = document.querySelector(`meta[${attribute}="${name}"]`);
      if (!element) {
        element = document.createElement("meta");
        element.setAttribute(attribute, name);
        document.head.appendChild(element);
      }
      element.setAttribute("content", content);
    };

    // Basic meta tags
    updateMetaTag("description", description || "");
    updateMetaTag("keywords", keywords || "");
    updateMetaTag("author", companyDetails.name);
    updateMetaTag("robots", "index, follow");
    updateMetaTag("googlebot", "index, follow");

    // Open Graph tags
    updateMetaTag("og:title", pageTitle, "property");
    updateMetaTag("og:description", description || "", "property");
    updateMetaTag("og:image", ogImage, "property");
    updateMetaTag("og:url", url || currentUrl, "property");
    updateMetaTag("og:type", type, "property");
    updateMetaTag("og:site_name", companyDetails.name, "property");
    updateMetaTag("og:locale", "en_US", "property");

    // Twitter Card tags
    updateMetaTag("twitter:card", "summary_large_image");
    updateMetaTag("twitter:title", pageTitle);
    updateMetaTag("twitter:description", description || "");
    updateMetaTag("twitter:image", ogImage);

    // Canonical URL
    let canonical = document.querySelector('link[rel="canonical"]');
    if (!canonical) {
      canonical = document.createElement("link");
      canonical.setAttribute("rel", "canonical");
      document.head.appendChild(canonical);
    }
    canonical.setAttribute("href", url || currentUrl);

    // Add structured data
    if (structuredData) {
      let script = document.querySelector('script[type="application/ld+json"]');
      if (!script) {
        script = document.createElement("script");
        script.setAttribute("type", "application/ld+json");
        document.head.appendChild(script);
      }
      script.textContent = JSON.stringify(structuredData);
    }
  }, [title, description, keywords, image, url, type, structuredData, currentUrl, pageTitle, ogImage]);

  return null;
};

export default SEO;

