import React, { useState, useEffect } from "react";

const PLACEHOLDER_IMG =
  "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='800' height='450' viewBox='0 0 800 450'%3E%3Crect width='800' height='450' fill='%23f1f5f9'/%3E%3Ctext x='50%25' y='50%25' dominant-baseline='middle' text-anchor='middle' font-family='sans-serif' font-size='18' fill='%2394a3b8'%3EPANTHM AI Labs%3C/text%3E%3C/svg%3E";

const BlogImage = ({ src, alt, className, ...props }) => {
  const [currentSrc, setCurrentSrc] = useState(src || PLACEHOLDER_IMG);

  useEffect(() => {
    setCurrentSrc(src || PLACEHOLDER_IMG);
  }, [src]);

  const handleLoad = (e) => {
    if (e.target.naturalWidth === 1 && e.target.naturalHeight === 1) {
      setCurrentSrc(PLACEHOLDER_IMG);
    }
  };

  const handleError = () => {
    setCurrentSrc(PLACEHOLDER_IMG);
  };

  return (
    <img
      src={currentSrc}
      alt={alt}
      className={className}
      onLoad={handleLoad}
      onError={handleError}
      {...props}
    />
  );
};

export default BlogImage;
