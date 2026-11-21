import { useEffect, useRef, useState } from "react";
import { MATERIALS } from "../../data/materials";
import "../../styles/navbar.css";

const NAV_ITEMS = [
  { label: "Overview", href: "#home" },
  { label: "Archive", href: "#materials", count: MATERIALS.length },
];

export default function Navbar() {
  const [activeIndex, setActiveIndex] = useState(0);
  const [scrolled, setScrolled] = useState(false);
  const progressRef = useRef(null);

  useEffect(() => {
    const sections = NAV_ITEMS.map(({ href }) =>
      document.querySelector(href)
    ).filter(Boolean);

    if (!sections.length) return;

    const observer = new IntersectionObserver(
      (entries) => {
        if (window.scrollY < 60) {
          setActiveIndex(0);
          return;
        }

        const visible = entries
          .filter((entry) => entry.isIntersecting)
          .sort((a, b) => b.intersectionRatio - a.intersectionRatio)[0];

        if (!visible) return;

        const idx = NAV_ITEMS.findIndex(
          ({ href }) => href === `#${visible.target.id}`
        );
        if (idx !== -1) setActiveIndex(idx);
      },
      {
        rootMargin: "-20% 0px -55% 0px",
        threshold: [0.1, 0.35, 0.65],
      }
    );

    sections.forEach((sec) => observer.observe(sec));
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    let rafId = 0;

    const syncScroll = () => {
      const y = window.scrollY;
      const maxScroll =
        document.documentElement.scrollHeight - window.innerHeight;
      const ratio = maxScroll > 0 ? Math.min(Math.max(y / maxScroll, 0), 1) : 0;

      setScrolled(y > 24);
      if (y < 60) setActiveIndex(0);

      if (progressRef.current) {
        progressRef.current.style.transform = `scaleX(${ratio})`;
      }
      rafId = 0;
    };

    const onScroll = () => {
      if (!rafId) {
        rafId = window.requestAnimationFrame(syncScroll);
      }
    };

    syncScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => {
      window.removeEventListener("scroll", onScroll);
      if (rafId) window.cancelAnimationFrame(rafId);
    };
  }, []);

  return (
    <header className={`sv-hd ${scrolled ? "is-scrolled" : ""}`}>
      <div className="sv-hd__bar">
        <a
          href="#home"
          className="sv-hd__wordmark"
          onClick={() => setActiveIndex(0)}
        >
          StudyVerse<span>.</span>
        </a>

        <nav className="sv-hd__nav" aria-label="Primary navigation">
          {NAV_ITEMS.map((item, idx) => {
            const isActive = activeIndex === idx;
            return (
              <a
                key={item.href}
                href={item.href}
                aria-current={isActive ? "page" : undefined}
                className={`sv-hd__link ${isActive ? "is-active" : ""}`}
                onClick={() => setActiveIndex(idx)}
              >
                <span>{item.label}</span>
                {typeof item.count === "number" && (
                  <strong>{String(item.count).padStart(2, "0")}</strong>
                )}
              </a>
            );
          })}
        </nav>
      </div>

      <div className="sv-hd__progress" aria-hidden="true">
        <div ref={progressRef} className="sv-hd__progress-fill" />
      </div>
    </header>
  );
}