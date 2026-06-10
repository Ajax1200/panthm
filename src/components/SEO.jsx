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
  const baseUrl = "https://panthm.com"; // Canonical domain
  const currentUrl = `${baseUrl}${location.pathname}`;
  const ogImage = image || `${baseUrl}/logo.png`;
  const pageTitle = title
    ? `${title} | ${companyDetails.name}`
    : `${companyDetails.name} - Building Intelligent Products That Redefine Industries`;

  // 1. Generate Dynamic Breadcrumbs based on pathname
  const pathSegments = location.pathname.split("/").filter(Boolean);
  const breadcrumbItems = [
    {
      "@type": "ListItem",
      "position": 1,
      "name": "Home",
      "item": baseUrl
    }
  ];

  let accumulatedPath = "";
  pathSegments.forEach((segment, idx) => {
    accumulatedPath += `/${segment}`;
    const name = segment
      .split("-")
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join(" ");
    
    breadcrumbItems.push({
      "@type": "ListItem",
      "position": idx + 2,
      "name": name,
      "item": `${baseUrl}${accumulatedPath}`
    });
  });

  const breadcrumbSchema = {
    "@type": "BreadcrumbList",
    "@id": `${currentUrl}#breadcrumb`,
    "itemListElement": breadcrumbItems
  };

  // 2. Generate Unified Graph Schema
  const organizationSchema = {
    "@type": "Organization",
    "@id": `${baseUrl}/#organization`,
    "name": "PANTHM AI Labs",
    "url": baseUrl,
    "logo": {
      "@type": "ImageObject",
      "@id": `${baseUrl}/#logo`,
      "url": `${baseUrl}/logo.png`,
      "caption": "PANTHM AI Labs Logo"
    },
    "image": {
      "@id": `${baseUrl}/#logo`
    },
    "sameAs": [
      "https://www.wikidata.org/wiki/Q11660", // Artificial Intelligence
      "https://www.wikidata.org/wiki/Q280615", // Software development
      "https://www.wikidata.org/wiki/Q1538",    // Pune, India
      "https://www.linkedin.com/company/panthm-ai-labs",
      "https://x.com/panthmailabs"
    ],
    "description": "PANTHM AI Labs builds intelligent products that redefine industries, specializing in custom software engineering, low-latency AI voice agents, and conversational workflows."
  };

  const websiteSchema = {
    "@type": "WebSite",
    "@id": `${baseUrl}/#website`,
    "url": baseUrl,
    "name": "PANTHM AI Labs",
    "publisher": {
      "@id": `${baseUrl}/#organization`
    }
  };

  const webpageSchema = {
    "@type": "WebPage",
    "@id": `${currentUrl}#webpage`,
    "url": currentUrl,
    "name": pageTitle,
    "description": description || "",
    "isPartOf": {
      "@id": `${baseUrl}/#website`
    },
    "breadcrumb": {
      "@id": `${currentUrl}#breadcrumb`
    }
  };

  const graphSchema = {
    "@context": "https://schema.org",
    "@graph": [
      organizationSchema,
      websiteSchema,
      webpageSchema,
      breadcrumbSchema
    ]
  };

  // Merge page-specific structured data into the unified graph
  if (structuredData) {
    const normalizedData = Array.isArray(structuredData) ? structuredData : [structuredData];
    normalizedData.forEach(item => {
      const cleanedItem = { ...item };
      delete cleanedItem["@context"]; // Remove duplicate context tags inside the graph
      
      // Link the entity back to our webpage schema
      if (!cleanedItem.isPartOf && cleanedItem["@type"] !== "Organization" && cleanedItem["@type"] !== "WebSite") {
        cleanedItem.isPartOf = { "@id": `${currentUrl}#webpage` };
      }
      
      graphSchema["@graph"].push(cleanedItem);
    });
  }

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

    // Add unified structured data script, replacing any previous instance
    let script = document.querySelector('script[id="panthm-ld-json"]');
    if (!script) {
      script = document.createElement("script");
      script.setAttribute("id", "panthm-ld-json");
      script.setAttribute("type", "application/ld+json");
      document.head.appendChild(script);
    }
    script.textContent = JSON.stringify(graphSchema, null, 2);
  }, [title, description, keywords, image, url, type, structuredData, currentUrl, pageTitle, ogImage, location.pathname]);

  return null;
};

export default SEO;

