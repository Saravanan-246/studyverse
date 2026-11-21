import { useEffect, useRef, useState } from "react";
import { ArrowRight } from "lucide-react";
import { MATERIALS } from "../../data/materials";
import "../../styles/preloader.css";

const COUNT = String(MATERIALS.length).padStart(2, "0");

const BEATS = [
  {
    code: "01",
    tag: "CURATED LIBRARY",
    lead: "Sharp focus.",
    accent: "Zero noise.",
    sub: "Structured aptitude, verbal, and core study volumes built for fast recall.",
  },
  {
    code: "02",
    tag: "INSTANT ACCESS",
    lead: `${COUNT} verified`,
    accent: "volumes.",
    sub: "Cleanly indexed PDFs ready to read inline or download in one click.",
  },
  {
    code: "03",
    tag: "WORKSPACE READY",
    lead: "Enter",
    accent: "StudyVerse.",
    sub: "Your distraction-free study desk is loaded and ready.",
  },
];

const STATUS_STEPS = [
  "INITIALIZING WORKSPACE",
  `INDEXING ${COUNT} STUDY VOLUMES`,
  "PREPARING DOCUMENT READER",
  "WORKSPACE READY",
];

const TOTAL_DURATION = 3300;
const EXIT_DURATION = 820;

export default function Preloader() {
  const [beatIndex, setBeatIndex] = useState(0);
  const [imgMissing, setImgMissing] = useState(false);
  const [exiting, setExiting] = useState(false);
  const [done, setDone] = useState(() => {
    if (typeof window === "undefined") return true;
    return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  });

  const barRef = useRef(null);
  const pctRef = useRef(null);
  const statusRef = useRef(null);
  const frameRef = useRef(null);
  const exitedRef = useRef(false);
  const exitTimerRef = useRef(0);

  useEffect(() => {
    if (done) return;

    let rafId = 0;
    const start = performance.now();

    const triggerExit = () => {
      if (exitedRef.current) return;
      exitedRef.current = true;
      if (barRef.current) barRef.current.style.transform = "scaleX(1)";
      if (pctRef.current) pctRef.current.textContent = "100%";
      if (statusRef.current) statusRef.current.textContent = STATUS_STEPS[3];
      setBeatIndex(2);
      setExiting(true);
      exitTimerRef.current = window.setTimeout(() => setDone(true), EXIT_DURATION);
    };

    const onKeyDown = (e) => {
      if (e.key === "Escape") triggerExit();
    };

    window.addEventListener("keydown", onKeyDown);

    const tick = (now) => {
      const raw = Math.min((now - start) / TOTAL_DURATION, 1);
      const eased = 1 - Math.pow(1 - raw, 2.2);
      const pct = Math.min(Math.round(eased * 100), 100);

      if (barRef.current) {
        barRef.current.style.transform = `scaleX(${eased})`;
      }
      if (pctRef.current) {
        pctRef.current.textContent = `${String(pct).padStart(2, "0")}%`;
      }
      if (statusRef.current) {
        const stepIdx = Math.min(
          Math.floor(eased * STATUS_STEPS.length),
          STATUS_STEPS.length - 1
        );
        statusRef.current.textContent = STATUS_STEPS[stepIdx];
      }

      const nextBeat = eased < 0.34 ? 0 : eased < 0.68 ? 1 : 2;
      setBeatIndex((prev) => (prev === nextBeat ? prev : nextBeat));

      if (raw < 1) {
        rafId = window.requestAnimationFrame(tick);
      } else {
        triggerExit();
      }
    };

    rafId = window.requestAnimationFrame(tick);

    return () => {
      window.cancelAnimationFrame(rafId);
      window.clearTimeout(exitTimerRef.current);
      window.removeEventListener("keydown", onKeyDown);
    };
  }, [done]);

  const handlePointerMove = (e) => {
    const el = frameRef.current;
    if (!el) return;
    const rect = el.getBoundingClientRect();
    const nx = (e.clientX - rect.left) / rect.width - 0.5;
    const ny = (e.clientY - rect.top) / rect.height - 0.5;
    el.style.setProperty("--rx", `${(-ny * 3.5).toFixed(2)}deg`);
    el.style.setProperty("--ry", `${(nx * 3.5).toFixed(2)}deg`);
  };

  const handlePointerLeave = () => {
    const el = frameRef.current;
    if (!el) return;
    el.style.setProperty("--rx", "0deg");
    el.style.setProperty("--ry", "0deg");
  };

  const handleSkip = () => {
    if (exitedRef.current) return;
    exitedRef.current = true;
    if (barRef.current) barRef.current.style.transform = "scaleX(1)";
    if (pctRef.current) pctRef.current.textContent = "100%";
    if (statusRef.current) statusRef.current.textContent = STATUS_STEPS[3];
    setExiting(true);
    exitTimerRef.current = window.setTimeout(() => setDone(true), EXIT_DURATION);
  };

  if (done) return null;

  return (
    <div
      className={`sv-pre${exiting ? " is-exiting" : ""}`}
      role="status"
      aria-label="Loading StudyVerse"
    >
      {/* Split Architectural Curtains */}
      <div className="sv-pre__curtain sv-pre__curtain--top" aria-hidden="true" />
      <div className="sv-pre__curtain sv-pre__curtain--bottom" aria-hidden="true" />

      {/* Center Seam Line */}
      <div className="sv-pre__seam" aria-hidden="true" />

      {/* Subtle Blueprint Grid */}
      <div className="sv-pre__grid" aria-hidden="true" />

      {/* Main Shell */}
      <div className="sv-pre__shell">
        <header className="sv-pre__top">
          <div className="sv-pre__brand">
            <span className="sv-pre__badge">SV</span>
            <span>STUDYVERSE</span>
            <span className="sv-pre__divider" aria-hidden="true" />
            <span className="sv-pre__edition">EDITION {new Date().getFullYear()}</span>
          </div>

          <button type="button" className="sv-pre__skip" onClick={handleSkip}>
            <span>SKIP</span>
            <ArrowRight size={13} strokeWidth={2.2} aria-hidden="true" />
          </button>
        </header>

        <div className="sv-pre__stage">
          {/* Left: Masked Editorial Typography */}
          <div className="sv-pre__copy-stack">
            {BEATS.map((beat, idx) => {
              const stateClass =
                idx === beatIndex
                  ? "is-active"
                  : idx < beatIndex
                  ? "is-past"
                  : "is-upcoming";

              return (
                <div
                  key={beat.code}
                  className={`sv-pre__beat ${stateClass}`}
                  aria-hidden={idx !== beatIndex}
                >
                  <div className="sv-pre__kicker">
                    <strong>{beat.code}</strong>
                    <i aria-hidden="true" />
                    <span>{beat.tag}</span>
                  </div>

                  <h2 className="sv-pre__title">
                    <span className="sv-pre__line-mask">
                      <span className="sv-pre__line-inner">{beat.lead}</span>
                    </span>
                    <span className="sv-pre__line-mask">
                      <span className="sv-pre__line-inner sv-pre__accent">
                        {beat.accent}
                      </span>
                    </span>
                  </h2>

                  <p className="sv-pre__sub">{beat.sub}</p>
                </div>
              );
            })}

            <div className="sv-pre__steps" aria-hidden="true">
              {BEATS.map((b, idx) => (
                <span
                  key={b.code}
                  className={`${idx < beatIndex ? "is-lit" : ""} ${
                    idx === beatIndex ? "is-current" : ""
                  }`}
                />
              ))}
            </div>
          </div>

          {/* Right: Sharp Glass Portrait Frame */}
          <div className="sv-pre__visual">
            <div
              ref={frameRef}
              className="sv-pre__frame"
              onPointerMove={handlePointerMove}
              onPointerLeave={handlePointerLeave}
            >
              <span className="sv-pre__tick sv-pre__tick--tl" aria-hidden="true" />
              <span className="sv-pre__tick sv-pre__tick--tr" aria-hidden="true" />
              <span className="sv-pre__tick sv-pre__tick--bl" aria-hidden="true" />
              <span className="sv-pre__tick sv-pre__tick--br" aria-hidden="true" />

              <div className="sv-pre__frame-inner">
                <div className="sv-pre__sheen" aria-hidden="true" />

                {!imgMissing ? (
                  <img
                    src="/preloader-hero.jpg"
                    alt=""
                    className="sv-pre__portrait"
                    onError={() => setImgMissing(true)}
                  />
                ) : (
                  <div className="sv-pre__fallback" aria-hidden="true">
                    <span>PLACE IMAGE AT</span>
                    <strong>public/preloader-hero.jpg</strong>
                  </div>
                )}

                <div className="sv-pre__caption">
                  <span>STUDY ARCHIVE</span>
                  <strong>{COUNT} VOLUMES</strong>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Telemetry Rail */}
        <footer className="sv-pre__bottom">
          <div className="sv-pre__telemetry">
            <span className="sv-pre__status-group">
              <i className="sv-pre__dot" aria-hidden="true" />
              <span ref={statusRef} className="sv-pre__status">
                {STATUS_STEPS[0]}
              </span>
            </span>

            <span ref={pctRef} className="sv-pre__pct">
              00%
            </span>
          </div>

          <div className="sv-pre__track">
            <div ref={barRef} className="sv-pre__fill" />
          </div>
        </footer>
      </div>
    </div>
  );
}