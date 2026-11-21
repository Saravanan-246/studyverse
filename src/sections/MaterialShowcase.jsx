import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  ArrowUpRight,
  Check,
  ChevronLeft,
  ChevronRight,
  Download,
  Eye,
  FileText,
  Search,
  X,
} from "lucide-react";
import { MATERIALS } from "../data/materials";
import {
  downloadBatchPdfs,
  downloadSinglePdf,
  encodePdfUrl,
} from "../utils/pdfUtils";
import "../styles/materials.css";

export default function MaterialShowcase() {
  const [query, setQuery] = useState("");
  const [activeSubject, setActiveSubject] = useState("All");
  const [selectedIds, setSelectedIds] = useState([]);
  const [activePdf, setActivePdf] = useState(null);
  const [iframeLoading, setIframeLoading] = useState(false);
  const [downloadingMode, setDownloadingMode] = useState("");
  const [downloadProgress, setDownloadProgress] = useState("");

  const lastTriggerRef = useRef(null);
  const searchInputRef = useRef(null);

  const subjectTabs = useMemo(() => {
    const counts = new Map();
    MATERIALS.forEach((item) => {
      counts.set(item.subject, (counts.get(item.subject) || 0) + 1);
    });

    return [
      { name: "All", count: MATERIALS.length },
      ...Array.from(counts.entries()).map(([name, count]) => ({ name, count })),
    ];
  }, []);

  const filteredMaterials = useMemo(() => {
    const trimmed = query.trim().toLowerCase();
    return MATERIALS.filter((item) => {
      const matchesSubject =
        activeSubject === "All" || item.subject === activeSubject;
      const matchesQuery =
        !trimmed ||
        item.title.toLowerCase().includes(trimmed) ||
        item.subject.toLowerCase().includes(trimmed) ||
        item.code.toLowerCase().includes(trimmed);
      return matchesSubject && matchesQuery;
    });
  }, [query, activeSubject]);

  const selectedMaterials = useMemo(
    () => MATERIALS.filter((item) => selectedIds.includes(item.id)),
    [selectedIds]
  );

  const allFilteredSelected =
    filteredMaterials.length > 0 &&
    filteredMaterials.every((item) => selectedIds.includes(item.id));

  const activeReaderList = useMemo(() => {
    if (!activePdf) return [];
    const inFiltered = filteredMaterials.some((m) => m.id === activePdf.id);
    return inFiltered ? filteredMaterials : MATERIALS;
  }, [activePdf, filteredMaterials]);

  const activeReaderIndex = useMemo(() => {
    if (!activePdf) return -1;
    return activeReaderList.findIndex((m) => m.id === activePdf.id);
  }, [activePdf, activeReaderList]);

  const toggleSelect = (id) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  const toggleSelectAll = () => {
    if (allFilteredSelected) {
      const filteredSet = new Set(filteredMaterials.map((item) => item.id));
      setSelectedIds((prev) => prev.filter((id) => !filteredSet.has(id)));
    } else {
      const merged = new Set([
        ...selectedIds,
        ...filteredMaterials.map((item) => item.id),
      ]);
      setSelectedIds(Array.from(merged));
    }
  };

  const handleBatchDownload = async (itemsToDownload, mode) => {
    if (!itemsToDownload.length || downloadingMode) return;
    setDownloadingMode(mode);
    setDownloadProgress(`0/${itemsToDownload.length}`);

    try {
      await downloadBatchPdfs(itemsToDownload, (current, total) => {
        setDownloadProgress(`${current}/${total}`);
      });
    } finally {
      setDownloadingMode("");
      setDownloadProgress("");
    }
  };

  const openReader = (item, triggerEl = null) => {
    if (triggerEl) lastTriggerRef.current = triggerEl;
    setIframeLoading(true);
    setActivePdf(item);
  };

  const closeReader = useCallback(() => {
    setActivePdf(null);
    setIframeLoading(false);
    window.requestAnimationFrame(() => {
      lastTriggerRef.current?.focus();
    });
  }, []);

  const stepReader = useCallback(
    (delta) => {
      if (activeReaderList.length <= 1 || activeReaderIndex === -1) return;
      const nextIndex =
        (activeReaderIndex + delta + activeReaderList.length) %
        activeReaderList.length;
      setIframeLoading(true);
      setActivePdf(activeReaderList[nextIndex]);
    },
    [activeReaderList, activeReaderIndex]
  );

  // Reader modal keyboard navigation & scroll lock
  useEffect(() => {
    if (!activePdf) return;

    const handleKeyDown = (event) => {
      if (event.key === "Escape") {
        closeReader();
      } else if (event.key === "ArrowRight") {
        stepReader(1);
      } else if (event.key === "ArrowLeft") {
        stepReader(-1);
      }
    };

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    window.addEventListener("keydown", handleKeyDown);

    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [activePdf, closeReader, stepReader]);

  const isBusy = Boolean(downloadingMode);

  return (
    <section
      className="sv-materials"
      id="materials"
      aria-labelledby="sv-materials-heading"
    >
      <div className="sv-materials__inner">
        {/* Section Header */}
        <div className="sv-materials__header">
          <div className="sv-materials__title-block">
            <div className="sv-materials__eyebrow">
              <span>02</span>
              <i aria-hidden="true" />
              <span>PDF ARCHIVE</span>
              <span className="sv-materials__count">
                {String(filteredMaterials.length).padStart(2, "0")} OF{" "}
                {String(MATERIALS.length).padStart(2, "0")}
              </span>
            </div>
            <h2 id="sv-materials-heading">
              Read online or download <span>everything.</span>
            </h2>
          </div>

          <div className="sv-materials__bulk-actions">
            <button
              type="button"
              className="sv-btn sv-btn--violet"
              disabled={isBusy || !filteredMaterials.length}
              onClick={() => handleBatchDownload(filteredMaterials, "all")}
            >
              <Download size={15} strokeWidth={2.2} aria-hidden="true" />
              <span>
                {downloadingMode === "all"
                  ? `Downloading ${downloadProgress}...`
                  : `Download All (${filteredMaterials.length})`}
              </span>
            </button>
          </div>
        </div>

        {/* Subject Tabs, Search & Select All */}
        <div className="sv-materials__toolbar">
          <div
            className="sv-materials__tabs"
            role="tablist"
            aria-label="Filter PDFs by subject"
          >
            {subjectTabs.map((tab) => {
              const isActive = activeSubject === tab.name;
              return (
                <button
                  key={tab.name}
                  type="button"
                  role="tab"
                  aria-selected={isActive}
                  className={`sv-materials__tab ${isActive ? "is-active" : ""}`}
                  onClick={() => setActiveSubject(tab.name)}
                >
                  <span>{tab.name}</span>
                  <small>{String(tab.count).padStart(2, "0")}</small>
                </button>
              );
            })}
          </div>

          <div className="sv-materials__controls">
            <div className="sv-materials__search">
              <Search size={15} strokeWidth={2} aria-hidden="true" />
              <input
                ref={searchInputRef}
                type="text"
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                placeholder="Search title, code, topic..."
                aria-label="Search study PDFs"
              />
              {query && (
                <button
                  type="button"
                  className="sv-materials__search-clear"
                  aria-label="Clear search"
                  onClick={() => {
                    setQuery("");
                    searchInputRef.current?.focus();
                  }}
                >
                  <X size={13} strokeWidth={2.3} />
                </button>
              )}
            </div>

            <button
              type="button"
              className="sv-materials__select-all"
              onClick={toggleSelectAll}
              disabled={!filteredMaterials.length}
            >
              <span
                className={`sv-checkbox-box ${
                  allFilteredSelected ? "is-checked" : ""
                }`}
                aria-hidden="true"
              >
                {allFilteredSelected && <Check size={12} strokeWidth={3} />}
              </span>
              <span>
                {allFilteredSelected ? "Deselect All" : "Select All"}
              </span>
            </button>
          </div>
        </div>

        {/* Document Index List */}
        {filteredMaterials.length === 0 ? (
          <div className="sv-materials__empty">
            <p>
              No study documents matched
              {query.trim() ? ` "${query.trim()}"` : " this filter"}.
            </p>
            <button
              type="button"
              className="sv-btn sv-btn--outline"
              onClick={() => {
                setQuery("");
                setActiveSubject("All");
              }}
            >
              Reset Filters
            </button>
          </div>
        ) : (
          <div className="sv-materials__list" role="list">
            {filteredMaterials.map((item, index) => {
              const isSelected = selectedIds.includes(item.id);
              return (
                <article
                  key={item.id}
                  role="listitem"
                  className={`sv-pdf-row ${isSelected ? "is-selected" : ""}`}
                >
                  <div className="sv-pdf-row__left">
                    <button
                      type="button"
                      className="sv-checkbox-hit"
                      aria-label={`Select ${item.title}`}
                      aria-pressed={isSelected}
                      onClick={() => toggleSelect(item.id)}
                    >
                      <span
                        className={`sv-checkbox-box ${
                          isSelected ? "is-checked" : ""
                        }`}
                        aria-hidden="true"
                      >
                        {isSelected && <Check size={12} strokeWidth={3} />}
                      </span>
                    </button>

                    <span className="sv-pdf-row__num">
                      {String(index + 1).padStart(2, "0")}
                    </span>

                    <div className="sv-pdf-row__info">
                      <div className="sv-pdf-row__meta-top">
                        <span className="sv-pdf-row__code">{item.code}</span>
                        <span className="sv-pdf-row__dot" aria-hidden="true">
                          /
                        </span>
                        <span className="sv-pdf-row__subject">
                          {item.subject}
                        </span>
                      </div>

                      <h3 className="sv-pdf-row__title">
                        <button
                          type="button"
                          className="sv-pdf-row__title-btn"
                          onClick={(e) => openReader(item, e.currentTarget)}
                        >
                          {item.title}
                        </button>
                      </h3>
                    </div>
                  </div>

                  <div className="sv-pdf-row__right">
                    <span className="sv-pdf-row__specs">
                      {item.size || "PDF"}
                    </span>

                    <div className="sv-pdf-row__actions">
                      <button
                        type="button"
                        className="sv-btn sv-btn--outline"
                        onClick={(e) => openReader(item, e.currentTarget)}
                      >
                        <Eye size={15} strokeWidth={2} aria-hidden="true" />
                        <span>Read</span>
                      </button>

                      <button
                        type="button"
                        className="sv-btn sv-btn--ink"
                        onClick={() =>
                          downloadSinglePdf(item.fileUrl, item.fileName)
                        }
                      >
                        <Download size={15} strokeWidth={2} aria-hidden="true" />
                        <span>Download</span>
                      </button>
                    </div>
                  </div>
                </article>
              );
            })}
          </div>
        )}
      </div>

      {/* Floating Selection Action Dock */}
      {selectedMaterials.length > 0 && (
        <div
          className="sv-selection-dock"
          role="region"
          aria-label="Selected PDFs actions"
        >
          <div className="sv-selection-dock__info">
            <span className="sv-selection-dock__count">
              {String(selectedMaterials.length).padStart(2, "0")}
            </span>
            <span>
              {selectedMaterials.length === 1 ? "VOLUME" : "VOLUMES"} SELECTED
            </span>
          </div>

          <div className="sv-selection-dock__actions">
            <button
              type="button"
              className="sv-dock-btn sv-dock-btn--ghost"
              disabled={isBusy}
              onClick={() => setSelectedIds([])}
            >
              Clear
            </button>

            <button
              type="button"
              className="sv-dock-btn sv-dock-btn--violet"
              disabled={isBusy}
              onClick={() =>
                handleBatchDownload(selectedMaterials, "selected")
              }
            >
              <Download size={14} strokeWidth={2.2} aria-hidden="true" />
              <span>
                {downloadingMode === "selected"
                  ? `Downloading ${downloadProgress}...`
                  : `Download (${selectedMaterials.length})`}
              </span>
            </button>
          </div>
        </div>
      )}

      {/* Inline PDF Reader Modal */}
      {activePdf && (
        <div
          className="sv-reader-backdrop"
          role="dialog"
          aria-modal="true"
          aria-labelledby="sv-reader-title"
          onClick={(event) => {
            if (event.target === event.currentTarget) {
              closeReader();
            }
          }}
        >
          <div className="sv-reader">
            <div className="sv-reader__bar">
              <div className="sv-reader__title-group">
                <div className="sv-reader__nav-step">
                  <button
                    type="button"
                    className="sv-reader__icon-btn"
                    aria-label="Previous PDF"
                    disabled={activeReaderList.length <= 1}
                    onClick={() => stepReader(-1)}
                  >
                    <ChevronLeft size={17} strokeWidth={2.2} />
                  </button>
                  <button
                    type="button"
                    className="sv-reader__icon-btn"
                    aria-label="Next PDF"
                    disabled={activeReaderList.length <= 1}
                    onClick={() => stepReader(1)}
                  >
                    <ChevronRight size={17} strokeWidth={2.2} />
                  </button>
                </div>

                <div className="sv-reader__heading-meta">
                  <span className="sv-reader__code">
                    {activeReaderIndex !== -1 &&
                      `${String(activeReaderIndex + 1).padStart(
                        2,
                        "0"
                      )}/${String(activeReaderList.length).padStart(
                        2,
                        "0"
                      )} · `}
                    {activePdf.code} · {activePdf.subject}
                  </span>
                  <h3 id="sv-reader-title">{activePdf.title}</h3>
                </div>
              </div>

              <div className="sv-reader__controls">
                <button
                  type="button"
                  className="sv-btn sv-btn--violet"
                  onClick={() =>
                    downloadSinglePdf(activePdf.fileUrl, activePdf.fileName)
                  }
                >
                  <Download size={15} strokeWidth={2.2} aria-hidden="true" />
                  <span>Download</span>
                </button>

                <a
                  href={encodePdfUrl(activePdf.fileUrl)}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="sv-btn sv-btn--outline sv-reader__ext-btn"
                  aria-label="Open PDF in new browser tab"
                  title="Open in new tab"
                >
                  <ArrowUpRight size={16} strokeWidth={2} aria-hidden="true" />
                </a>

                <button
                  type="button"
                  className="sv-reader__close"
                  aria-label="Close PDF reader"
                  onClick={closeReader}
                >
                  <X size={18} strokeWidth={2.2} />
                </button>
              </div>
            </div>

            {/* Mobile Native Viewer Banner */}
            <div className="sv-reader__mobile-bar">
              <span>Viewing embedded preview</span>
              <a
                href={encodePdfUrl(activePdf.fileUrl)}
                target="_blank"
                rel="noopener noreferrer"
              >
                <FileText size={13} strokeWidth={2.1} aria-hidden="true" />
                <span>Open Fullscreen Tab</span>
              </a>
            </div>

            <div className="sv-reader__frame-wrap">
              {iframeLoading && (
                <div className="sv-reader__loading" aria-live="polite">
                  <span>LOADING DOCUMENT...</span>
                </div>
              )}
              <iframe
                key={activePdf.id}
                src={`${encodePdfUrl(activePdf.fileUrl)}#toolbar=1&navpanes=0`}
                title={activePdf.title}
                className="sv-reader__iframe"
                onLoad={() => setIframeLoading(false)}
              />
            </div>
          </div>
        </div>
      )}
    </section>
  );
}