export const config = {
  matcher: '/blogs/:slug',
};

export default async function middleware(request) {
  const url = new URL(request.url);
  const userAgent = request.headers.get('user-agent') || '';
  
  // Detect social media crawlers and search engine bots
  const isBot = /bot|whatsapp|facebookexternalhit|linkedinbot|twitterbot|slackbot|discordbot|googlebot/i.test(userAgent);

  if (isBot) {
    const slug = url.pathname.split('/').pop();
    
    try {
      // Fetch blog details from the CMS API
      const apiRes = await fetch(`https://blogplatform-backend-cloudinary-tau.vercel.app/api/blogs/${slug}`);
      const data = await apiRes.json();
      const blog = data.blog;

      if (!apiRes.ok || !blog) {
        // Blog not found! Return a 404 status but serve the React app so it shows the 404 UI
        const indexHtmlRes = await fetch('https://www.panthm.com/index.html');
        const indexHtml = await indexHtmlRes.text();
        return new Response(indexHtml, {
          status: 404,
          headers: { 'Content-Type': 'text/html; charset=utf-8' }
        });
      }

      if (blog) {
        // Construct Open Graph Meta Tags
        const title = (blog.metaTitle || blog.title || 'Panthm Blog').replace(/"/g, '&quot;');
        const description = (blog.metaDescription || blog.shortDesc || 'Read our latest blog post on Panthm').replace(/"/g, '&quot;');
        const image = blog.mainImage || 'https://www.panthm.com/og-default.png';

        const html = `
          <!DOCTYPE html>
          <html lang="en">
          <head>
            <meta charset="UTF-8">
            <meta property="og:title" content="${title}">
            <meta property="og:description" content="${description}">
            <meta property="og:image" content="${image}">
            <meta property="og:url" content="${url.href}">
            <meta property="og:type" content="article">
            <meta name="twitter:card" content="summary_large_image">
            <meta name="twitter:title" content="${title}">
            <meta name="twitter:description" content="${description}">
            <meta name="twitter:image" content="${image}">
            <title>${title}</title>
          </head>
          <body>
            <h1>${title}</h1>
            <p>${description}</p>
            <img src="${image}" alt="Blog Image">
            <p>Loading full application...</p>
          </body>
          </html>
        `;

        return new Response(html, {
          status: 200,
          headers: { 
            'Content-Type': 'text/html; charset=utf-8',
            'Cache-Control': 'public, max-age=3600'
          }
        });
      }
    } catch (error) {
      console.error('Middleware Error:', error);
      // Let the request pass through to the React SPA on error
    }
  } else {
    // If it's a human, we can also check if the blog exists and force a 404 status
    const slug = url.pathname.split('/').pop();
    try {
      const apiRes = await fetch(`https://blogplatform-backend-cloudinary-tau.vercel.app/api/blogs/${slug}`);
      const data = await apiRes.json();
      if (!apiRes.ok || !data.blog) {
        const indexHtmlRes = await fetch('https://www.panthm.com/index.html');
        const indexHtml = await indexHtmlRes.text();
        return new Response(indexHtml, {
          status: 404,
          headers: { 'Content-Type': 'text/html; charset=utf-8' }
        });
      }
    } catch (error) {}
  }

  // For valid human users, do nothing (Vercel will automatically serve the React SPA index.html)
}
