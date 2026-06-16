/**
 * Reusable utility to add semantic internal links to text/HTML content.
 * Splits by HTML tags to safely apply link wrappers only on text nodes.
 */
export const addSemanticLinks = (html) => {
  if (!html) return "";

  const linkMap = [
    {
      words: [
        "AI Voice SDR Agents",
        "AI Voice SDR Agent",
        "AI Voice SDR",
        "AI Voice Agent",
        "AI Calling Agency",
        "AI Calling",
        "Voice SDR"
      ],
      url: "/ai-calling-agency"
    },
    {
      words: [
        "Next-Gen E-Commerce",
        "e-commerce solutions",
        "custom web development",
        "Web Development"
      ],
      url: "/web-development"
    },
    {
      words: [
        "mobile application",
        "Flutter Cross-Platform",
        "hybrid apps",
        "App Development"
      ],
      url: "/app-development"
    },
    {
      words: [
        "The PANTHM Consolidation Architecture",
        "Consolidation Architecture",
        "PCA"
      ],
      url: "/"
    },
    {
      words: [
        "schedule a consultation",
        "partner with us",
        "contact us"
      ],
      url: "/contact"
    }
  ];

  const escapeRegExp = (string) => string.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

  // Split HTML safely by tags, keeping the tags in the array
  const tokens = html.split(/(<[^>]+>)/g);

  // Prevent linking the same general category multiple times per page
  const linkedCategories = new Set();

  const processedTokens = tokens.map((token, idx) => {
    // If it's a tag, check if it is already an anchor tag <a> to prevent nesting links
    if (token.startsWith("<")) {
      return token;
    }

    let text = token;
    for (let catIdx = 0; catIdx < linkMap.length; catIdx++) {
      if (linkedCategories.has(catIdx)) continue;

      const mapping = linkMap[catIdx];
      for (const word of mapping.words) {
        const regex = new RegExp(`\\b(${escapeRegExp(word)})\\b`, "gi");
        if (regex.test(text)) {
          // Wrap the first occurrence in an anchor tag
          text = text.replace(regex, `<a href="${mapping.url}" class="text-primary hover:underline font-semibold">$1</a>`);
          linkedCategories.add(catIdx);
          break; // Go to next category mapping
        }
      }
    }
    return text;
  });

  return processedTokens.join("");
};

/**
 * Automatically injects SEO-optimized alt tags and Cloudinary next-gen formats 
 * (WebP/AVIF compression) into raw HTML strings.
 */
export const optimizeHtmlImages = (html, blogTitle) => {
  if (!html) return "";
  
  // Create a temporary DOM element to safely parse and modify HTML
  // (We use regex here since it runs on both server and client, but for a React SPA, regex is safer than full DOM parsing in strings)
  
  let optimized = html;

  // 1. Inject alt attributes if missing or empty
  optimized = optimized.replace(/<img alt=""([^>]+)>/gi, (match, attrs) => {
    let newAttrs = attrs;
    if (!/alt\s*=\s*(['"])(.*?)\1/i.test(attrs) || /alt\s*=\s*(['"])\1/i.test(attrs)) {
      // Remove empty alt if it exists
      newAttrs = newAttrs.replace(/alt\s*=\s*(['"])\1/gi, "");
      // Inject descriptive alt
      newAttrs += ` alt="Illustration for ${blogTitle.replace(/"/g, '&quot;')}"`;
    }
    return `<img alt=""${newAttrs}>`;
  });

  // 2. Add Cloudinary transforms (f_auto, q_auto)
  optimized = optimized.replace(/(res\.cloudinary\.com\/[^/]+\/image\/upload\/)(v\d+\/.*?\.(jpg|jpeg|png|gif|webp))/gi, (match, p1, p2) => {
    // If it already has f_auto or q_auto, don't duplicate
    if (p1.includes('f_auto') || p2.includes('f_auto')) return match;
    return `${p1}f_auto,q_auto/${p2}`;
  });

  return optimized;
};

/**
 * Extracts <h2> and <h3> tags from HTML, assigns them an ID, and generates a Table of Contents.
 */
export const generateTocAndAddIds = (html) => {
  if (!html) return { html: "", toc: [] };

  const toc = [];
  let tocIndex = 0;

  const updatedHtml = html.replace(/<(h[23])([^>]*)>(.*?)<\/\1>/gi, (match, tag, attrs, content) => {
    let idMatch = attrs.match(/id\s*=\s*(['"])(.*?)\1/i);
    let id = idMatch ? idMatch[2] : null;

    const textContent = content.replace(/<[^>]*>/g, '').trim();

    if (!id) {
      id = textContent.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
      if (!id) id = `heading-${tocIndex}`;
      
      // Inject the ID if it doesn't have one
      attrs = `${attrs} id="${id}"`;
    }

    if (textContent) {
      toc.push({
        id,
        text: textContent,
        level: tag.toLowerCase() === 'h2' ? 2 : 3
      });
      tocIndex++;
    }

    return `<${tag}${attrs}>${content}</${tag}>`;
  });

  return { html: updatedHtml, toc };
};
