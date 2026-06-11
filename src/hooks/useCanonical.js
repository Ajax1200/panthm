import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';

/**
 * A hook to automatically enforce the correct absolute canonical URL
 * for the current route, stripping any tracking parameters or duplicate domain aliases.
 * This ensures all SEO link juice consolidates to the "www" domain version.
 */
export const useCanonical = () => {
  const location = useLocation();

  useEffect(() => {
    // 1. Determine exact path without query parameters or hash
    const cleanPath = location.pathname;
    
    // 2. Construct the single source of truth URL
    const canonicalUrl = `https://www.panthm.com${cleanPath}`;

    // 3. Find existing canonical tag, or create a new one
    let canonicalLink = document.querySelector('link[rel="canonical"]');
    
    if (!canonicalLink) {
      canonicalLink = document.createElement('link');
      canonicalLink.setAttribute('rel', 'canonical');
      document.head.appendChild(canonicalLink);
    }

    // 4. Update the href attribute
    canonicalLink.setAttribute('href', canonicalUrl);
    
  }, [location.pathname]);
};
