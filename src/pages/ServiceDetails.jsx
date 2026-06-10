import React, { lazy } from "react";
import { Navigate, useParams } from "react-router-dom";
import { services } from "../data/services";
import SEO from "../components/SEO";
import { companyDetails } from "../data/constant";

const BlogsSection = lazy(() => import("../components/website/BlogsSection"));

const slugify = (text) => text.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '');

const ServiceDetails = () => {
  const { name } = useParams();
  const data = services.find((service) => service.title === name || slugify(service.title) === name);
  if (!data) return <Navigate to="/" />;

  const structuredData = {
    "@context": "https://schema.org",
    "@type": "Service",
    "serviceType": data.title,
    "provider": {
      "@type": "Organization",
      "name": companyDetails.name,
      "url": "https://panthm.com"
    },
    "description": data.shortDesc,
    "areaServed": "Worldwide",
    "hasOfferCatalog": {
      "@type": "OfferCatalog",
      "name": data.title,
      "itemListElement": data.technologies.map((tech, index) => ({
        "@type": "Offer",
        "itemOffered": {
          "@type": "Service",
          "name": tech
        },
        "position": index + 1
      }))
    }
  };

  return (
    <div className="pt-20 bg-white dark:bg-[#0a0a0a] min-h-screen">
      <SEO
        title={data.title}
        description={data.shortDesc || `Professional ${data.title} services by PANTHM AI Labs. Expert team delivering cutting-edge solutions using ${data.technologies.join(", ")}.`}
        keywords={`${data.title}, ${data.technologies.join(", ")}, software development, web development, app development, technology services`}
        image={data.image}
        url={`https://panthm.com/services/${encodeURIComponent(data.title)}`}
        structuredData={structuredData}
      />
      <div className="bg-slate-900 dark:bg-[#050505] py-20 text-white border-b border-white/5">
        <div className="wrapper">
          <h1 className="heading max-w-4xl text-white">{data.title}</h1>
        </div>
      </div>
      
      <div className="wrapper py-20 space-y-20">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          <div className="space-y-6">
            <div
              className="prose prose-lg prose-slate dark:prose-invert"
              dangerouslySetInnerHTML={{ __html: data.html.firstSection }}
            ></div>
          </div>
          <div className="rounded-2xl overflow-hidden shadow-xl">
            <img
              src={data.detailsPageImages.first}
              className="w-full h-full object-cover"
              alt={data.title}
            />
          </div>
        </div>

        <div className="grid lg:grid-cols-2 gap-12 items-center">
          <div className="order-2 lg:order-1 rounded-2xl overflow-hidden shadow-xl">
            <img
              src={data.detailsPageImages.second}
              className="w-full h-full object-cover"
              alt={data.title}
            />
          </div>
          <div className="order-1 lg:order-2 space-y-6">
            <div
              className="prose prose-lg prose-slate dark:prose-invert"
              dangerouslySetInnerHTML={{ __html: data.html.secondSection }}
            ></div>
          </div>
        </div>

        <div className="grid lg:grid-cols-2 gap-12 items-center">
          <div className="space-y-6">
            <div
              className="prose prose-lg prose-slate dark:prose-invert"
              dangerouslySetInnerHTML={{ __html: data.html.thirdSection }}
            ></div>
          </div>
          <div className="rounded-2xl overflow-hidden shadow-xl">
            <img
              src={data.detailsPageImages.third}
              className="w-full h-full object-cover"
              alt={data.title}
            />
          </div>
        </div>
      </div>
      
      <div className="bg-slate-50 dark:bg-[#050505] py-20 border-t border-slate-100 dark:border-white/5">
        <BlogsSection />
      </div>
    </div>
  );
};

export default ServiceDetails;
