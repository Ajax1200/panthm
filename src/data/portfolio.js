// portfolio images (web development)
export const webPortfolio = [
  {
    id: 2,
    img: require("../assets/images/portfolio/web-development/cold-creekcap.webp"),
    title: "B2B Financial Advisory Website",
    link: "#",
  },
  {
    id: 3,
    img: require("../assets/images/portfolio/web-development/think-reality.webp"),
    title: "Real Estate & Property Management Portal",
    link: "#",
  },
  {
    id: 4,
    img: require("../assets/images/portfolio/web-development/akash-mega-mart.webp"),
    title: "Multi-Store E-Commerce Web Portal",
    link: "#",
  },
  {
    id: 5,
    img: require("../assets/images/portfolio/web-development/midwam.webp"),
    title: "Interactive Experience & Media Agency Website",
    link: "#",
  },
];

// portfolio images (app development)
export const appPortfolio = [
  {
    id: 1,
    img: require("../assets/images/portfolio/app-development/akash_mega_mart-app.webp"),
    title: "Retail E-Commerce Mobile Application",
    link: "#",
  },
  {
    id: 2,
    img: require("../assets/images/portfolio/app-development/feelit_app.webp"),
    title: "Interactive Social Sharing Mobile Application",
    link: "#",
  },
  {
    id: 3,
    img: require("../assets/images/portfolio/app-development/klikomics.webp"),
    title: "Healthcare Genomics Mobile Application",
    link: "#",
  },
  {
    id: 4,
    img: require("../assets/images/portfolio/app-development/autosnap-app.webp"),
    title: "Automotive Inspection & Diagnostics Application",
    link: "#",
  },
  {
    id: 5,
    img: require("../assets/images/portfolio/app-development/rentop.webp"),
    title: "Peer-to-Peer Vehicle Rental Application",
    link: "#",
  },
];

// detailed case studies (problem, solution, outcome, tech)
export const caseStudies = [
  {
    id: "cs-1",
    isCaseStudy: true,
    category: "web",
    img: require("../assets/images/ai-telecalling.png"),
    title: "AI Voice Agents for Support Automation",
    client: "Multi-Store E-Commerce Group",
    problem: "The client faced overwhelming customer support call volumes during seasonal sales, resulting in wait times over 20 minutes, high support staff burn-out, and abandoned checkouts.",
    solution: "PANTHM AI Labs engineered an emotionally intelligent AI voice agent integrated with Twilio, OpenAI, and the client's internal inventory/order tracking APIs. The agent speaks with natural human intonation and is capable of resolving common support issues like tracking shipments, issuing returns, and checking item availability in real-time.",
    outcome: [
      "Resolved 82% of inbound support calls without human agent intervention.",
      "Reduced average customer wait time from 20 minutes to 0 seconds (instant response).",
      "Boosted sales conversion rates by 40% through automated cart-recovery and checkout assistance calls.",
      "Achieved a 95% customer satisfaction rating on post-call automated surveys."
    ],
    tech: ["Twilio Voice API", "OpenAI GPT-4", "Python", "Node.js", "Redis"]
  },
  {
    id: "cs-2",
    isCaseStudy: true,
    category: "web",
    img: require("../assets/images/landingpage/customweb.webp"),
    title: "Real-Time Property Engine & Next.js Portal",
    client: "Real Estate Enterprise Dubai",
    problem: "The UAE-based real estate platform suffered from database lockouts and high latency (averaging 4.5s page loads) during high-traffic launch campaigns, leading to lost client inquiries and poor search engine rankings.",
    solution: "We refactored their legacy database into a high-availability MongoDB replica set and deployed an Elasticsearch search index. We then rebuilt their frontend in Next.js, implementing advanced image optimization, local caching strategies, and smooth vector-based map tracking.",
    outcome: [
      "Reduced average search page load latency by 75% (sub-200ms loads).",
      "Increased organic search traffic (SEO) by 55% within 90 days.",
      "Boosted B2B lead capture rate by 28% due to zero-latency filtering.",
      "Guaranteed 99.99% system uptime during major offshore project launch campaigns."
    ],
    tech: ["Next.js", "MongoDB", "Elasticsearch", "Google Maps API", "Docker", "AWS"]
  },
  {
    id: "cs-3",
    isCaseStudy: true,
    category: "app",
    img: require("../assets/images/portfolio/app-development/rentop.webp"),
    title: "Logistics Booking & Fleet Management Mobile App",
    client: "Peer-to-Peer Rental Platform",
    problem: "The client needed a unified, secure mobile application supporting real-time GPS tracking, vehicle key-sharing integrations, and instant payment collections across both iOS and Android platforms, built under a strict 3-month launch window.",
    solution: "PANTHM developed a cross-platform mobile application using Flutter. The app features real-time vehicle mapping, Stripe & Apple Pay integrations, custom Bluetooth packages for vehicle unlock codes, and background location services for trip tracking.",
    outcome: [
      "Designed, coded, and deployed native apps to the App Store and Google Play in 12 weeks.",
      "Achieved a 4.8/5.0 star app store rating with zero critical crash reports.",
      "Successfully processed over 10,000 car/bike bookings in the first month post-launch.",
      "Enhanced vehicle security by tracking locations with sub-5 meter accuracy."
    ],
    tech: ["Flutter / Dart", "Node.js / Express", "MongoDB", "Google Maps SDK", "Stripe API", "CoreBluetooth"]
  }
];


