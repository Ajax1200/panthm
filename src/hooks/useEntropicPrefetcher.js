import { useEffect } from "react";

export function useEntropicPrefetcher() {
  useEffect(() => {
    // Check if speculative execution or standard link prefetching is supported
    const supportsSpeculationRules =
      HTMLScriptElement.supports && HTMLScriptElement.supports("speculationrules");

    const prefetchedUrls = new Set();

    // Store state of cursor vectors
    let lastX = null;
    let lastY = null;
    let lastTime = null;
    let velocityX = 0;
    let velocityY = 0;

    // Prefetch a target URL securely
    const triggerPrefetch = (url) => {
      if (!url || prefetchedUrls.has(url)) return;
      prefetchedUrls.add(url);

      try {
        if (supportsSpeculationRules) {
          const specScript = document.createElement("script");
          specScript.type = "speculationrules";
          specScript.textContent = JSON.stringify({
            prefetch: [
              {
                source: "list",
                urls: [url],
              },
            ],
          });
          document.head.appendChild(specScript);
          console.log(`[QEPE] Speculative prefetch triggered for: ${url}`);
        } else {
          // Standard browser fallback
          const link = document.createElement("link");
          link.rel = "prefetch";
          link.href = url;
          document.head.appendChild(link);
          console.log(`[QEPE] Fallback prefetch triggered for: ${url}`);
        }
      } catch (e) {
        console.warn("[QEPE] Prefetch failed:", e);
      }
    };

    const handleMouseMove = (e) => {
      const { clientX: x, clientY: y } = e;
      const now = performance.now();

      if (lastX !== null && lastY !== null && lastTime !== null) {
        const dt = now - lastTime;
        if (dt > 10) {
          // Kinematic Vector Calculations: Velocity V = (dx/dt, dy/dt)
          velocityX = (x - lastX) / dt;
          velocityY = (y - lastY) / dt;
        }
      }

      lastX = x;
      lastY = y;
      lastTime = now;

      // Speed check: If pointer is practically static, we do not project trajectory
      const velocityMagnitude = Math.sqrt(velocityX * velocityX + velocityY * velocityY);
      if (velocityMagnitude < 0.15) return;

      // Scan for all visible local hyperlinks in viewport
      const links = document.querySelectorAll("a");
      const candidates = [];

      links.forEach((link) => {
        const href = link.getAttribute("href");
        // Only target internal site links, ignoring external paths or hashes
        if (!href || href.startsWith("http") || href.startsWith("#") || href.startsWith("tel:") || href.startsWith("mailto:")) return;
        if (prefetchedUrls.has(href)) return;

        const rect = link.getBoundingClientRect();
        // Skip links outside the current viewport
        if (rect.bottom < 0 || rect.right < 0 || rect.top > window.innerHeight || rect.left > window.innerWidth) return;

        // Centroid of link bounding box C = (cx, cy)
        const cx = rect.left + rect.width / 2;
        const cy = rect.top + rect.height / 2;

        // Displacement vector D = C - P
        const dx = cx - x;
        const dy = cy - y;
        const distance = Math.sqrt(dx * dx + dy * dy);

        if (distance < 600 && distance > 10) {
          // Vector Dot Product & Cosine Similarity: cos(theta) = (V . D) / (|V| * |D|)
          const dotProduct = velocityX * dx + velocityY * dy;
          const cosTheta = dotProduct / (velocityMagnitude * distance);

          candidates.push({
            url: href,
            cosTheta: Math.max(0, cosTheta),
            distance,
          });
        }
      });

      if (candidates.length === 0) return;

      // Calculate gravitational potentials: P_i = cos(theta)^alpha / distance^beta
      const alpha = 2.0; // Direction weighting
      const beta = 1.2;  // Distance decay weighting

      let totalPotential = 0;
      const metrics = candidates.map((c) => {
        const potential = Math.pow(c.cosTheta, alpha) / (Math.pow(c.distance, beta) + 1e-5);
        totalPotential += potential;
        return { ...c, potential };
      });

      if (totalPotential === 0) return;

      // Probability Distribution: p_i = P_i / Sum(P_j)
      const distribution = metrics.map((m) => ({
        url: m.url,
        prob: m.potential / totalPotential,
      }));

      // Shannon Entropy: H = -Sum(p_i * log2(p_i))
      let entropy = 0;
      distribution.forEach((d) => {
        if (d.prob > 0) {
          entropy -= d.prob * Math.log2(d.prob);
        }
      });

      // Find the candidate link with the absolute maximum probability
      const maxCandidate = distribution.reduce((max, item) => (item.prob > max.prob ? item : max), distribution[0]);

      // Intent Collapse Threshold: Trigger prefetch if probability of a route dominates
      // or if entropy is extremely low (meaning user trajectory is deterministic)
      if (maxCandidate.prob > 0.85 || (entropy < 0.7 && maxCandidate.prob > 0.6)) {
        triggerPrefetch(maxCandidate.url);
      }
    };

    window.addEventListener("mousemove", handleMouseMove, { passive: true });

    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
    };
  }, []);
}
