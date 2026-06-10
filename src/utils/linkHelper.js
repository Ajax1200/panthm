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
      url: "/services"
    },
    {
      words: [
        "Next-Gen E-Commerce",
        "e-commerce solutions",
        "custom web development",
        "Web Development"
      ],
      url: "/services"
    },
    {
      words: [
        "mobile application",
        "Flutter Cross-Platform",
        "hybrid apps",
        "App Development"
      ],
      url: "/services"
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
