export const config = {
  matcher: [
    /*
     * Match all paths except:
     * - api (API endpoints)
     * - static (webpack/asset chunks)
     * - files with extensions (logo.png, sitemaps, robots.txt, favicon.ico, etc.)
     */
    '/((?!api|static|.*\\..*|favicon.ico|logo.png|social_card.png).*)',
  ],
};

const SITE_BASE = 'https://www.panthm.com';
const API_BASE = 'https://blogplatform-backend-cloudinary-tau.vercel.app/api';

const ENTITIES = {
  organization: "https://www.wikidata.org/wiki/Q110292708",
  ai: "https://www.wikidata.org/wiki/Q11660",
  softwareDev: "https://www.wikidata.org/wiki/Q638608",
  pune: "https://www.wikidata.org/wiki/Q1513",
};

const LOCALES = ['en', 'ar', 'de', 'es', 'fr', 'ja'];

// Helper to normalize strings (e.g. web-development -> Web Development)
const normalize = (slug) => {
  if (!slug) return '';
  return slug
    .split('-')
    .map((word) => {
      const lower = word.toLowerCase();
      if (lower === 'ai') return 'AI';
      if (lower === 'ux' || lower === 'ui') return lower.toUpperCase();
      return word.charAt(0).toUpperCase() + word.slice(1);
    })
    .join(' ');
};

// Construct alternate URLs for solutions pages
function getAlternates(locale, service, industry, location) {
  let tags = '';
  LOCALES.forEach((loc) => {
    const url = loc === 'en'
      ? `${SITE_BASE}/solutions/${service}/${industry}/${location}`
      : `${SITE_BASE}/solutions/${loc}/${service}/${industry}/${location}`;
    tags += `<link rel="alternate" hreflang="${loc}" href="${url}" />\n`;
  });
  tags += `<link rel="alternate" hreflang="x-default" href="${SITE_BASE}/solutions/${service}/${industry}/${location}" />`;
  return tags;
}

export default async function middleware(request) {
  const url = new URL(request.url);
  const userAgent = request.headers.get('user-agent') || '';

  // Identify search engine crawlers, social scrapers, and AI RAG bots
  const isBot = /bot|googlebot|bingbot|yandex|baidu|duckduck|crawler|spider|slurp|facebookexternalhit|linkedinbot|twitterbot|slackbot|discordbot|whatsapp|gptbot|chatgpt|openai|anthropic|claude|perplexity|cohere|google-extended|vertex|ai-overviews|searchgpt/i.test(userAgent);

  if (isBot) {
    const pathSegments = url.pathname.split('/').filter(Boolean);

    // ── Case A: Programmatic SEO Solutions Pages ──────────────────────────────
    if (pathSegments[0] === 'solutions') {
      let locale = 'en';
      let service = '';
      let industry = '';
      let location = '';

      if (LOCALES.includes(pathSegments[1])) {
        locale = pathSegments[1];
        service = pathSegments[2] || 'custom-software';
        industry = pathSegments[3] || 'enterprise';
        location = pathSegments[4] || 'global';
      } else {
        service = pathSegments[1] || 'custom-software';
        industry = pathSegments[2] || 'enterprise';
        location = pathSegments[3] || 'global';
      }

      const displayService = normalize(service);
      const displayIndustry = normalize(industry);
      const displayLocation = normalize(location);

      const title = `Bespoke ${displayService} for ${displayIndustry} in ${displayLocation} | PANTHM AI Labs`;
      const description = `PANTHM AI Labs deploys custom high-performance ${displayService} systems engineered specifically for ${displayIndustry} companies in ${displayLocation}. Powered by The PANTHM Consolidation Architecture (PCA).`;

      const alternates = getAlternates(locale, service, industry, location);

      const jsonLd = {
        "@context": "https://schema.org",
        "@type": "WebPage",
        "@id": `${url.href}#webpage`,
        "url": url.href,
        "name": title,
        "description": description,
        "isPartOf": {
          "@type": "WebSite",
          "@id": `${SITE_BASE}/#website`,
          "url": SITE_BASE,
          "name": "PANTHM AI Labs"
        },
        "about": [
          { "@type": "Thing", "name": displayService, "sameAs": ENTITIES.softwareDev },
          { "@type": "Thing", "name": displayLocation, "sameAs": ENTITIES.pune }
        ],
        "provider": {
          "@type": "Organization",
          "@id": `${SITE_BASE}/#organization`,
          "name": "PANTHM AI Labs",
          "url": SITE_BASE
        }
      };

      const html = `<!DOCTYPE html>
<html lang="${locale}">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${title}</title>
  <meta name="description" content="${description}">
  <meta name="robots" content="index, follow">
  <link rel="canonical" href="${url.href}">
  ${alternates}
  
  <!-- Open Graph -->
  <meta property="og:title" content="${title}">
  <meta property="og:description" content="${description}">
  <meta property="og:type" content="website">
  <meta property="og:url" content="${url.href}">
  <meta property="og:image" content="${SITE_BASE}/logo.png">
  
  <!-- Structured Data -->
  <script type="application/ld+json">
    ${JSON.stringify(jsonLd)}
  </script>
</head>
<body style="font-family: sans-serif; padding: 40px; line-height: 1.6; max-width: 800px; margin: 0 auto; background: #050505; color: #f1f5f9;">
  <header>
    <a href="${SITE_BASE}" style="color: #9B00FF; font-weight: bold; text-decoration: none;">PANTHM AI Labs</a>
  </header>
  <main style="margin-top: 40px;">
    <h1 style="font-size: 2.2rem; color: #ffffff;">Custom ${displayService} for ${displayIndustry} in ${displayLocation}</h1>
    <p style="font-size: 1.1rem; color: #94a3b8; margin-top: 20px;">
      PANTHM AI Labs designs, builds, and deploys high-velocity <strong>${displayService}</strong> platforms engineered specifically to meet the compliance, latency, and system integration needs of <strong>${displayIndustry}</strong> organizations operating in <strong>${displayLocation}</strong>.
    </p>
    
    <h2 style="color: #ffffff; margin-top: 40px;">The PANTHM Consolidation Architecture (PCA)</h2>
    <p>
      By wrapping user presentation, task queuing, conversational pipelines, and global data residency controls into a single consolidated codebase, we eliminate third-party SaaS middleware dependencies, Zapier friction, and double-billing server licenses.
    </p>
    
    <h3 style="color: #ffffff; margin-top: 30px;">Core Engineering Capabilities</h3>
    <ul>
      <li><strong>Low-Latency Interface & Data Ingestion (LLIDI)</strong>: Sub-500ms Largest Contentful Paint (LCP) speeds.</li>
      <li><strong>Asynchronous Back-Office Orchestration (ABOO)</strong>: Event-driven background loops running 24/7.</li>
      <li><strong>Deterministic Pipeline Engineering (DPE)</strong>: Context-aware AI voice agents and cold outreach systems.</li>
      <li><strong>Sovereign Compliance & Scalability (SCS)</strong>: Region-specific database zoning for local data regulations.</li>
    </ul>
  </main>
  <footer style="margin-top: 60px; border-t: 1px solid #1e293b; padding-top: 20px; font-size: 0.9rem; color: #64748b;">
    <p>&copy; ${new Date().getFullYear()} PANTHM AI Labs. All rights reserved. Icon Tower, Baner, Pune, India.</p>
  </footer>
</body>
</html>`;

      return new Response(html, {
        status: 200,
        headers: {
          'Content-Type': 'text/html; charset=utf-8',
          'Cache-Control': 'public, max-age=86400, stale-while-revalidate=3600'
        }
      });
    }

    // ── Case B: Dynamic Blog Pages ───────────────────────────────────────────
    if (pathSegments[0] === 'blogs' && pathSegments[1]) {
      const slug = pathSegments[1];
      try {
        const apiRes = await fetch(`${API_BASE}/blogs/${slug}`);
        const data = await apiRes.json();
        const blog = data.blog;

        if (!apiRes.ok || !blog) {
          return new Response('Blog Not Found', { status: 404 });
        }

        const title = blog.metaTitle || blog.title;
        const description = blog.metaDescription || blog.excerpt || 'Read our latest blog post.';
        const image = blog.mainImage || `${SITE_BASE}/logo.png`;

        const html = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <title>${title}</title>
  <meta name="description" content="${description}">
  <link rel="canonical" href="${url.href}">
  <meta property="og:title" content="${title}">
  <meta property="og:description" content="${description}">
  <meta property="og:image" content="${image}">
  <meta property="og:url" content="${url.href}">
  <meta property="og:type" content="article">
</head>
<body style="font-family: sans-serif; padding: 40px; color: #f1f5f9; background: #050505;">
  <h1>${blog.title}</h1>
  <p>${description}</p>
  <hr />
  <div style="margin-top: 20px;">
    ${blog.content}
  </div>
</body>
</html>`;

        return new Response(html, {
          status: 200,
          headers: {
            'Content-Type': 'text/html; charset=utf-8',
            'Cache-Control': 'public, max-age=3600, stale-while-revalidate=600'
          }
        });
      } catch (err) {
        console.error('Middleware blog fetch failed:', err);
      }
    }
  }

  // Humans load the React SPA bundles normally
}
