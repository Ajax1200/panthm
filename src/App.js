import {
  BrowserRouter as Router,
  Route,
  Routes,
  useLocation,
} from "react-router-dom";
import { AnimatePresence } from "framer-motion";
import AOS from "aos";
import "aos/dist/aos.css";
import SpinnerContextProvider, {
  LoadingSpinnerContext,
} from "./components/SpinnerContext";
import { lazy, Suspense } from "react";
import { LoadingSpinner } from "./components/LoadingSpinner";
import Header from "./components/website/Header";
import Footer from "./components/website/Footer";
import LandingHeader from "./components/landingPage/LandingHeader";
import LandingFooter from "./components/landingPage/LandingFooter";
import { Toaster } from "react-hot-toast";
import WhatsAppWidget from "./components/WhatsAppWidget";
import CustomCursor from "./components/website/CustomCursor";
import { ThemeProvider } from "./components/ThemeContext";
import { useCanonical } from "./hooks/useCanonical";
import { useEntropicPrefetcher } from "./hooks/useEntropicPrefetcher";
import ErrorBoundary from "./components/ErrorBoundary";
import ScrollProgressBar from "./components/website/ScrollProgressBar";
import PageTransition from "./components/website/PageTransition";

// Lazy loading components
const Home = lazy(() => import("./pages/Home"));
const AboutUs = lazy(() => import("./pages/AboutUs"));
const ServiceDetails = lazy(() => import("./pages/ServiceDetails"));
const Services = lazy(() => import("./pages/Services"));
const ScrollToTop = lazy(() => import("./components/ScrollToTop"));
const Blogs = lazy(() => import("./pages/Blogs"));
const BlogDetails = lazy(() => import("./pages/BlogDetails"));
const ContactUs = lazy(() => import("./pages/ContactUs"));
const LandingPage = lazy(() => import("./pages/LandingPage"));
const Thankyou = lazy(() => import("./pages/Thankyou"));
const Portfolio = lazy(() => import("./pages/Portfolio"));
const IntersectionLanding = lazy(() => import("./pages/IntersectionLanding"));
const PrivacyPolicy = lazy(() => import("./pages/PrivacyPolicy"));
const NotFound = lazy(() => import("./pages/NotFound"));
const SolutionsDirectory = lazy(() => import("./pages/SolutionsDirectory"));
const ComparisonPage = lazy(() => import("./pages/ComparisonPage"));

AOS.init({
  once: true,
  duration: 500,
  easing: "ease",
  offset: -500,
});

function AppContent() {
  const location = useLocation();
  useCanonical();
  useEntropicPrefetcher();

  return (
    <Suspense fallback={<LoadingSpinner />}>
      <SpinnerContextProvider>
      <LoadingSpinnerContext />
      <ScrollToTop />
      <ScrollProgressBar />
      <Toaster position="top-center" />
      <AnimatePresence mode="wait">
        <Routes location={location} key={location.pathname}>
            <Route
              path="/solutions/:service/:industry/:location"
              element={
                <PageTransition>
<Header />
                  <IntersectionLanding />
                  <Footer />
                </PageTransition>
              }
            />
            <Route
              path="/"
              element={
                <PageTransition>
<Header />
                  <Home />
                  <Footer />
                </PageTransition>
              }
            />
            <Route
              path="/about-us"
              element={
                <PageTransition>
<Header />
                  <AboutUs />
                  <Footer />
                </PageTransition>
              }
            />
            <Route
              path="/contact"
              element={
                <PageTransition>
<Header />
                  <ContactUs />
                  <Footer />
                </PageTransition>
              }
            />
            <Route path="/thank-you" element={<Thankyou />} />
            <Route
              path="/solutions"
              element={
                <PageTransition>
                  <Header />
                  <SolutionsDirectory />
                  <Footer />
                </PageTransition>
              }
            />
            <Route
              path="/privacy-policy"
              element={
                <PageTransition>
<Header />
                  <PrivacyPolicy />
                  <Footer />
                </PageTransition>
              }
            />

            {/* Services */}
            <Route
              path="/services"
              element={
                <PageTransition>
<Header /> <Services /> <Footer />
                </PageTransition>
              }
            />
            <Route path="/services">
              <Route
                path=":name"
                element={
                <PageTransition>
<Header /> <ServiceDetails /> <Footer />
                </PageTransition>
              }
              />
            </Route>

            {/* Blogs */}
            <Route
              path="/blogs"
              element={
                <PageTransition>
<Header /> <Blogs /> <Footer />
                </PageTransition>
              }
            />
            <Route path="/blogs">
              <Route
                path=":slug"
                element={
                <PageTransition>
<Header /> <BlogDetails /> <Footer />
                </PageTransition>
              }
              />
            </Route>

            {/* Portfolio */}
            <Route
              path="/portfolio"
              element={
                <PageTransition>
<Header /> <Portfolio /> <Footer />
                </PageTransition>
              }
            />

            {/* Landing pages */}
            <Route
              path="/web-development"
              element={
                <PageTransition>
<LandingHeader />
                  <LandingPage page="web" />
                  <LandingFooter />
                </PageTransition>
              }
            />
            <Route
              path="/app-development"
              element={
                <PageTransition>
<LandingHeader />
                  <LandingPage page="app" />
                  <LandingFooter />
                </PageTransition>
              }
            />
            <Route
              path="/ai-calling-agency"
              element={
                <PageTransition>
<LandingHeader />
                  <LandingPage page="ai-calling" />
                  <LandingFooter />
                </PageTransition>
              }
            />
            <Route
              path="/vs/phantom-ai"
              element={
                <PageTransition>
                  <Header />
                  <ComparisonPage />
                  <Footer />
                </PageTransition>
              }
            />
            <Route
              path="/vs/phantom"
              element={
                <PageTransition>
                  <Header />
                  <ComparisonPage />
                  <Footer />
                </PageTransition>
              }
            />
            <Route path="*" element={<PageTransition><NotFound /></PageTransition>} />
        </Routes>
      </AnimatePresence>
          <WhatsAppWidget />
          <CustomCursor />
        </SpinnerContextProvider>
      </Suspense>
  );
}

function App() {
  return (
    <ThemeProvider>
      <ErrorBoundary>
        <Router>
          <AppContent />
        </Router>
      </ErrorBoundary>
    </ThemeProvider>
  );
}

export default App;
