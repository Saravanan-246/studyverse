/* =========================================================
   STUDYVERSE — EDITORIAL FOOTER
   ========================================================= */

import { memo } from "react";
import { ArrowUp, ArrowUpRight } from "lucide-react";
import { MATERIALS } from "../../data/materials";
import "../../styles/footer.css";

const FOOTER_LINKS = [
  { label: "Overview", href: "#home" },
  { label: "PDF Archive", href: "#materials" },
];

const Footer = memo(function Footer() {
  return (
    <footer className="sv-footer">
      <div className="sv-footer__inner">
        <div className="sv-footer__top">
          <div className="sv-footer__brand-col">
            <a href="#home" className="sv-footer__brand">
              <span className="sv-footer__mark" aria-hidden="true">
                S
              </span>
              <span className="sv-footer__wordmark">
                StudyVerse<span>.</span>
              </span>
            </a>

            <p className="sv-footer__tagline">
              A focused archive for reading and downloading study materials
              without clutter.
            </p>
          </div>

          <div className="sv-footer__nav-col">
            <span className="sv-footer__heading">INDEX</span>
            <nav className="sv-footer__nav" aria-label="Footer navigation">
              {FOOTER_LINKS.map((link) => (
                <a key={link.href} href={link.href} className="sv-footer__link">
                  <span>{link.label}</span>
                  <ArrowUpRight size={14} strokeWidth={2} aria-hidden="true" />
                </a>
              ))}
            </nav>
          </div>
        </div>

        <div className="sv-footer__bottom">
          <p className="sv-footer__copy">
            © {new Date().getFullYear()} StudyVerse · {MATERIALS.length} PDFs
            Indexed
          </p>

          <a href="#home" className="sv-footer__top-btn">
            <span>BACK TO TOP</span>
            <ArrowUp size={14} strokeWidth={2.2} aria-hidden="true" />
          </a>
        </div>
      </div>
    </footer>
  );
});

Footer.displayName = "Footer";
export default Footer;