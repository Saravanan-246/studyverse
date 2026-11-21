import { memo, useEffect, useState } from "react";
import { ArrowDown, Download } from "lucide-react";
import { MATERIALS } from "../data/materials";
import { downloadBatchPdfs } from "../utils/pdfUtils";
import "../styles/hero.css";

const ROTATING_WORDS = ["fast.", "offline.", "clean.", "free."];

const TICKER_ITEMS = [
  "QUANTITATIVE APTITUDE",
  "VERBAL ABILITY",
  "LOGICAL REASONING",
  "CORE STUDY UNITS",
  "INSTANT BROWSER READER",
  "ONE-CLICK BATCH PDF",
];

const Hero = memo(function Hero() {
  const [wordIndex, setWordIndex] = useState(0);

  useEffect(() => {
    const id = window.setInterval(() => {
      setWordIndex((prev) => (prev + 1) % ROTATING_WORDS.length);
    }, 2600);
    return () => window.clearInterval(id);
  }, []);

  return (
    <section className="sv-hero" id="home" aria-labelledby="sv-hero-heading">
      <div className="sv-hero__inner">
        <div className="sv-hero__header-row">
          <span className="sv-hero__kicker">01 — STUDYVERSE ARCHIVE</span>
          <span className="sv-hero__count">
            {String(MATERIALS.length).padStart(2, "0")} VOLUMES INDEXED
          </span>
        </div>

        <div className="sv-hero__center">
          <h1 id="sv-hero-heading" className="sv-hero__display">
            <span className="sv-hero__line">
              <span className="sv-hero__line-inner">Read clean.</span>
            </span>
            <span className="sv-hero__line">
              <span className="sv-hero__line-inner sv-hero__line-inner--delay">
                Download{" "}
                <span className="sv-hero__rotator" aria-live="polite">
                  {ROTATING_WORDS.map((word, idx) => {
                    const isCurrent = idx === wordIndex;
                    const isPrev =
                      idx ===
                      (wordIndex - 1 + ROTATING_WORDS.length) %
                        ROTATING_WORDS.length;

                    return (
                      <span
                        key={word}
                        className={`sv-hero__word${
                          isCurrent ? " is-active" : isPrev ? " is-exit" : ""
                        }`}
                        aria-hidden={!isCurrent}
                      >
                        {word}
                      </span>
                    );
                  })}
                </span>
              </span>
            </span>
          </h1>
        </div>

        <div className="sv-hero__bottom-group">
          <div className="sv-hero__marquee" aria-hidden="true">
            <div className="sv-hero__marquee-track">
              {[...TICKER_ITEMS, ...TICKER_ITEMS].map((item, idx) => (
                <span key={`${item}-${idx}`} className="sv-hero__marquee-item">
                  <span>{item}</span>
                  <i />
                </span>
              ))}
            </div>
          </div>

          <div className="sv-hero__footer-row">
            <p className="sv-hero__lead">
              Direct access to curated aptitude, verbal, and core unit PDFs—built
              for instant browser reading and zero-clutter offline study.
            </p>

            <div className="sv-hero__actions">
              <a
                href="#materials"
                className="sv-hero__cta sv-hero__cta--primary"
              >
                <span>Browse PDFs</span>
                <ArrowDown
                  size={16}
                  strokeWidth={2.2}
                  className="sv-hero__icon-down"
                  aria-hidden="true"
                />
              </a>

              <button
                type="button"
                className="sv-hero__cta sv-hero__cta--ghost"
                onClick={() => downloadBatchPdfs(MATERIALS)}
              >
                <Download
                  size={15}
                  strokeWidth={2}
                  className="sv-hero__icon-dl"
                  aria-hidden="true"
                />
                <span>Download All ({MATERIALS.length})</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
});

Hero.displayName = "Hero";
export default Hero;