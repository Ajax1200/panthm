import {
  BrowserRouter as Router,
  Navigate,
  Route,
  Routes,
} from "react-router-dom";
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

AOS.init({
  once: true,
  duration: 500,
  easing: "ease",
  offset: -500,
});

function App() {
  return (
    <Router>
      <Suspense fallback={<LoadingSpinner />}>
        <SpinnerContextProvider>
          <LoadingSpinnerContext />
          <ScrollToTop />
          <Toaster position="top-center" />
          <Routes>
            <Route
              path="/solutions/:service/:industry/:location"
              element={
                <>
                  <Header />
                  <IntersectionLanding />
                  <Footer />
                </>
              }
            />
            <Route
              path="/"
              element={
                <>
                  <Header />
                  <Home />
                  <Footer />
                </>
              }
            />
            <Route
              path="/about-us"
              element={
                <>
                  <Header />
                  <AboutUs />
                  <Footer />
                </>
              }
            />
            <Route
              path="/contact"
              element={
                <>
                  <Header />
                  <ContactUs />
                  <Footer />
                </>
              }
            />
            <Route path="/thank-you" element={<Thankyou />} />
            <Route
              path="/privacy-policy"
              element={
                <>
                  <Header />
                  <PrivacyPolicy />
                  <Footer />
                </>
              }
            />

            {/* Services */}
            <Route
              path="/services"
              element={
                <>
                  <Header /> <Services /> <Footer />
                </>
              }
            />
            <Route path="/services">
              <Route
                path=":name"
                element={
                  <>
                    <Header /> <ServiceDetails /> <Footer />
                  </>
                }
              />
            </Route>

            {/* Blogs */}
            <Route
              path="/blogs"
              element={
                <>
                  <Header /> <Blogs /> <Footer />
                </>
              }
            />
            <Route path="/blogs">
              <Route
                path=":slug"
                element={
                  <>
                    <Header /> <BlogDetails /> <Footer />
                  </>
                }
              />
            </Route>

            {/* Portfolio */}
            <Route
              path="/portfolio"
              element={
                <>
                  <Header /> <Portfolio /> <Footer />
                </>
              }
            />

            {/* Landing pages */}
            <Route
              path="/web-development"
              element={
                <>
                  <LandingHeader />
                  <LandingPage page="web" />
                  <LandingFooter />
                </>
              }
            />
            <Route
              path="/app-development"
              element={
                <>
                  <LandingHeader />
                  <LandingPage page="app" />
                  <LandingFooter />
                </>
              }
            />
            <Route
              path="/ai-calling-agency"
              element={
                <>
                  <LandingHeader />
                  <LandingPage page="ai-calling" />
                  <LandingFooter />
                </>
              }
            />
            <Route path="*" element={<NotFound />} />
          </Routes>
          <WhatsAppWidget />
          <CustomCursor />
        </SpinnerContextProvider>
      </Suspense>
    </Router>
  );
}

export default App;
