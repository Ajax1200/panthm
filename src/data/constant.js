import { CodeXml, NotebookPen, Rocket } from "lucide-react";
import logo from "../assets/logo/logo.png";

export { logo };

// company
export const companyDetails = {
  name: "PANTHM AI Labs",
  address:
    "Icon Tower Office No. 702 Sr 114/5 ,115/1 ,114/6/3 BANER, Pune MAHARASHTRA-411045",
  phone: "+917558646366",
  email: "info@panthm.com",
};

// working process
export const workingProcess = [
  {
    step: 1,
    title: "Strategic Discovery",
    description:
      "We decode your vision through immersive workshops and data-driven analysis. Our architects map out a digital trajectory that aligns perfectly with your enterprise goals and future scalability needs.",
    icon: NotebookPen,
  },
  {
    step: 2,
    title: "Futuristic Engineering",
    description:
      "Our engineers craft pixel-perfect interfaces and robust backends using next-gen technologies. We prioritize performance, security, and an ultra-smooth user experience that feels years ahead of the curve.",
    icon: CodeXml,
  },
  {
    step: 3,
    title: "Launch & Evolution",
    description:
      "We execute a flawless deployment with rigorous automated testing. Post-launch, we provide AI-driven insights and continuous optimization to ensure your digital asset evolves with the market.",
    icon: Rocket,
  },
];

// web development services
export const webDevelopmentServices = [
  {
    id: 1,
    title: "Next-Gen E-Commerce",
    image: require("../assets/images/landingpage/ecommerce.webp"),
    description:
      "Revolutionize retail with AI-powered storefronts. We build immersive shopping experiences that predict user behavior and maximize conversion through intelligent design.",
  },
  {
    id: 2,
    title: "Social Ecosystems",
    image: require("../assets/images/landingpage/socialmedia.webp"),
    description:
      "Architecting digital communities with real-time interaction. Our platforms foster deep engagement through seamless connectivity and dynamic content algorithms.",
  },
  {
    id: 3,
    title: "High-Impact Landing",
    image: require("../assets/images/landingpage/landing.webp"),
    description:
      "Captivate audiences instantly with motion-rich landing pages. We combine psychological triggers with stunning aesthetics to turn visitors into loyal advocates.",
  },
  {
    id: 4,
    title: "Bespoke Digital Solutions",
    image: require("../assets/images/landingpage/customweb.webp"),
    description:
      "Tailored digital architectures for unique business challenges. We blend creativity with logic to deliver custom web solutions that defy convention.",
  },
];

// app development services
export const appDevelopmentServices = [
  {
    id: 1,
    title: "iOS Excellence",
    image: require("../assets/images/landingpage/ios.webp"),
    description:
      "Native iOS experiences crafted with Swift precision. We leverage the full power of the Apple ecosystem to deliver fluid, intuitive, and powerful applications.",
  },
  {
    id: 2,
    title: "Android Innovation",
    image: require("../assets/images/landingpage/android.webp"),
    description:
      "Scalable Android solutions for the global market. Our apps are engineered for performance across the fragmented device landscape, ensuring consistent quality.",
  },
  {
    id: 3,
    title: "Flutter Cross-Platform",
    image: require("../assets/images/landingpage/flutter.webp"),
    description:
      "One codebase, infinite possibilities. We utilize Flutter to deploy stunning, native-like applications across mobile, web, and desktop with unmatched speed.",
  },
  {
    id: 4,
    title: "Hybrid Agility",
    image: require("../assets/images/landingpage/hybrid.webp"),
    description:
      "Cost-effective versatility without compromise. Our hybrid solutions bridge the gap between web and mobile, offering rapid deployment and easy maintenance.",
  },
];

// ai calling services
export const aiCallingServices = [
  {
    id: 1,
    title: "Intelligent Inbound Support",
    image: require("../assets/images/services/aicalling1.webp"),
    description:
      "Resolve customer queries instantly with AI agents that understand context and emotion. Provide 24/7 support without the wait times.",
  },
  {
    id: 2,
    title: "Proactive Outbound Sales",
    image: require("../assets/images/services/aicalling2.webp"),
    description:
      "Supercharge lead generation with human-like AI callers. Qualify leads, conduct surveys, and drive sales with persuasive conversations.",
  },
  {
    id: 3,
    title: "Automated Appointment Setting",
    image: require("../assets/images/services/aicalling3.webp"),
    description:
      "Streamline your scheduling process. Our AI negotiates times, handles cancellations, and integrates directly with your calendar.",
  },
  {
    id: 4,
    title: "Real-Time Sentiment Analysis",
    image: require("../assets/images/ai-telecalling.png"),
    description:
      "Understand your customers better. Our agents analyze tone and sentiment to adapt their approach and ensure satisfaction.",
  },
];

// testimonials
export const testimonials = [
  {
    name: "Shane Caldwell",
    position: "Managing Partner, B2B Advisory Group",
    desc: `PANTHM AI Labs rebuilt our corporate web infrastructure with outstanding efficiency. Their engineering capability and attention to detail on security and performance helped us establish a highly professional B2B presence.`,
    img: require("../assets/images/testimonials/1.jpg"),
  },
  {
    name: "Khaled Al-Fayed",
    position: "Product Director, Immersive CX Ltd.",
    desc: `The team at PANTHM delivered exceptional custom development support. They integrated seamlessly with our designers to execute complex, high-performance web animations and responsive interfaces. Highly recommended.`,
    img: require("../assets/images/testimonials/2.jpg"),
  },
  {
    name: "Akash Sharma",
    position: "Founder & CEO, RetailScale Enterprise",
    desc: `PANTHM built both our high-traffic e-commerce web platform and our mobile applications. Our online sales increased by 40% within three months of launch due to their lightning-fast performance and seamless checkout flows.`,
    img: require("../assets/images/testimonials/3.jpg"),
  },
  {
    name: "Ali Mahmoud",
    position: "Technical Director, PropTech MENA",
    desc: `An elite engineering firm. They delivered our real-estate portal on time and with zero latency. Their ability to handle complex map integrations and automated property updates has been a game changer for our business in Dubai.`,
    img: require("../assets/images/testimonials/4.jpg"),
  },
];

