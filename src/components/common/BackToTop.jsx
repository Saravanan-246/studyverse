import { memo, useEffect, useState } from "react";
import { ArrowUp } from "lucide-react";

const BackToTop = memo(function BackToTop() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    let ticking = false;

    const onScroll = () => {
      if (!ticking) {
        window.requestAnimationFrame(() => {
          setVisible(window.scrollY > 360);
          ticking = false;
        });
        ticking = true;
      }
    };

    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const scrollToTop = () => {
    const prefersReduced = window.matchMedia(
      "(prefers-reduced-motion: reduce)"
    ).matches;

    window.scrollTo({
      top: 0,
      behavior: prefersReduced ? "auto" : "smooth",
    });
  };

  return (
    <button
      type="button"
      onClick={scrollToTop}
      aria-label="Back to top"
      aria-hidden={!visible}
      tabIndex={visible ? 0 : -1}
      style={{
        position: "fixed",
        right: "clamp(16px, 3vw, 32px)",
        bottom: "calc(clamp(16px, 3vw, 32px) + env(safe-area-inset-bottom, 0px))",
        zIndex: 95,
        display: "grid",
        placeItems: "center",
        width: "44px",
        height: "44px",
        border: "1px solid #282532",
        borderRadius: "0px",
        backgroundColor: "#282532",
        color: "#ffffff",
        cursor: "pointer",
        boxShadow: "0 10px 24px -10px rgba(40, 37, 50, 0.4)",
        opacity: visible ? 1 : 0,
        visibility: visible ? "visible" : "hidden",
        transform: visible ? "translateY(0)" : "translateY(10px)",
        transition:
          "opacity 200ms ease, transform 220ms cubic-bezier(0.19, 1, 0.22, 1), background-color 180ms ease, visibility 200ms",
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.backgroundColor = "#7654c8";
        e.currentTarget.style.borderColor = "#7654c8";
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.backgroundColor = "#282532";
        e.currentTarget.style.borderColor = "#282532";
      }}
    >
      <ArrowUp size={18} strokeWidth={2.2} aria-hidden="true" />
    </button>
  );
});

BackToTop.displayName = "BackToTop";
export default BackToTop;