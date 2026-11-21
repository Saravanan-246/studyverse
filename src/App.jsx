import { memo, useEffect } from "react";
import { MotionConfig } from "motion/react";

import Preloader from "./components/common/Preloader";
import Navbar from "./components/layout/Navbar";
import Hero from "./sections/Hero";
import MaterialShowcase from "./sections/MaterialShowcase";
import Footer from "./components/layout/Footer";
import BackToTop from "./components/common/BackToTop";

const App = memo(function App() {
  useEffect(() => {
    if (!window.location.hash) {
      window.scrollTo({ top: 0, left: 0, behavior: "instant" });
    }
  }, []);

  return (
    <MotionConfig reducedMotion="user">
      <div className="sv-app" id="top">
        <a
          href="#main-content"
          className="sr-only focus:not-sr-only focus:fixed focus:top-3 focus:left-3 focus:z-[10000] focus:bg-[#282532] focus:px-4 focus:py-2 focus:text-xs focus:font-semibold focus:text-white"
        >
          Skip to content
        </a>

        <Preloader />
        <Navbar />

        <main id="main-content" className="sv-main" tabIndex={-1}>
          <Hero />
          <MaterialShowcase />
        </main>

        <Footer />
        <BackToTop />
      </div>
    </MotionConfig>
  );
});

App.displayName = "StudyVerseApp";

export default App;