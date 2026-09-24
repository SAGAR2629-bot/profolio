import React, { useState, useEffect, useRef } from 'react';
import './RetroImageSlider.css';

export default function RetroImageSlider({ images = [], title = "ARCHIVE IMAGERY" }) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isLightboxOpen, setIsLightboxOpen] = useState(false);
  const [imgErrors, setImgErrors] = useState({});
  const touchStartX = useRef(null);

  const total = images ? images.length : 0;
  const safeIndex = total > 0 ? (currentIndex % total + total) % total : 0;
  const currentImg = total > 0 ? images[safeIndex] : null;

  // Keyboard navigation
  useEffect(() => {
    if (total <= 0) return;
    const handleKeyDown = (e) => {
      if (e.key === 'ArrowLeft') {
        setCurrentIndex((prev) => (prev === 0 ? total - 1 : prev - 1));
      }
      if (e.key === 'ArrowRight') {
        setCurrentIndex((prev) => (prev === total - 1 ? 0 : prev + 1));
      }
      if (e.key === 'Escape' && isLightboxOpen) {
        setIsLightboxOpen(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isLightboxOpen, total]);

  if (total === 0 || !currentImg) {
    return null;
  }

  const goToPrev = () => {
    setCurrentIndex((prev) => (prev === 0 ? total - 1 : prev - 1));
  };

  const goToNext = () => {
    setCurrentIndex((prev) => (prev === total - 1 ? 0 : prev + 1));
  };

  // Touch swipe support
  const handleTouchStart = (e) => {
    touchStartX.current = e.touches[0].clientX;
  };

  const handleTouchEnd = (e) => {
    if (touchStartX.current === null) return;
    const diff = touchStartX.current - e.changedTouches[0].clientX;
    if (diff > 40) goToNext();
    else if (diff < -40) goToPrev();
    touchStartX.current = null;
  };

  const handleImgError = (idx) => {
    setImgErrors((prev) => ({ ...prev, [idx]: true }));
  };

  const isVideoMedia = (img) => {
    if (!img) return false;
    if (img.media_type === 'VIDEO') return true;
    const url = (img.url || '').toLowerCase();
    return (
      url.endsWith('.mp4') ||
      url.endsWith('.webm') ||
      url.endsWith('.mov') ||
      url.endsWith('.m4v') ||
      url.endsWith('.ogv') ||
      url.includes('youtube.com/') ||
      url.includes('youtu.be/') ||
      url.includes('vimeo.com/')
    );
  };

  const getEmbedUrl = (url) => {
    if (!url) return null;
    const ytMatch = url.match(/(?:youtu\.be\/|youtube\.com\/(?:embed\/|v\/|watch\?v=|watch\?.+&v=))([\w-]{11})/);
    if (ytMatch) {
      return `https://www.youtube.com/embed/${ytMatch[1]}?autoplay=0&rel=0`;
    }
    const vimeoMatch = url.match(/vimeo\.com\/(?:channels\/(?:\w+\/)?|groups\/([^\/]*)\/videos\/|album\/(\d+)\/video\/|)(\d+)/);
    if (vimeoMatch) {
      return `https://player.vimeo.com/video/${vimeoMatch[3]}`;
    }
    return null;
  };

  const mediaTypeLabel = currentImg.media_type || (isVideoMedia(currentImg) ? "VIDEO" : "OTHER");

  return (
    <div className="retro-slider-container">
      {/* Slider Header Control Deck */}
      <div className="retro-slider-header">
        <div className="retro-slider-title">
          <span className="retro-slider-dot"></span>
          <span className="retro-slider-title-text">{title}</span>
          <span className="retro-slider-type-badge">[{mediaTypeLabel}]</span>
        </div>
        {total > 1 && (
          <div className="retro-slider-counter">
            [{String(currentIndex + 1).padStart(2, '0')} / {String(total).padStart(2, '0')}]
          </div>
        )}
      </div>

      {/* Main Viewport */}
      <div
        className="retro-slider-viewport"
        onTouchStart={handleTouchStart}
        onTouchEnd={handleTouchEnd}
      >
        {imgErrors[safeIndex] || !currentImg.url ? (
          <div className="retro-slider-fallback">
            <div className="retro-slider-fallback-grid">
              <span className="fallback-chip">TELEMETRY_LOGGED</span>
              <span className="fallback-title">{currentImg.caption || "MEDIA DATA ATTACHED"}</span>
              <span className="fallback-sub">MEDIA TYPE: {mediaTypeLabel}</span>
            </div>
          </div>
        ) : isVideoMedia(currentImg) ? (
          <div className="retro-slider-video-container">
            {getEmbedUrl(currentImg.url) ? (
              <iframe
                src={getEmbedUrl(currentImg.url)}
                title={currentImg.caption || "Project Video Stream"}
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
                className="retro-slider-iframe"
              />
            ) : (
              <video
                key={currentImg.url}
                src={currentImg.url}
                controls
                playsInline
                preload="metadata"
                className="retro-slider-video"
                onError={() => handleImgError(safeIndex)}
              />
            )}
            <div className="retro-slider-video-badge">
              <span>▶ VIDEO STREAM</span>
            </div>
          </div>
        ) : (
          <img
            src={currentImg.url}
            alt={currentImg.alt || `Slide ${currentIndex + 1}`}
            className="retro-slider-main-image"
            onClick={() => setIsLightboxOpen(true)}
            onError={() => handleImgError(safeIndex)}
            title="Click to expand (Lightbox)"
          />
        )}

        {total > 1 && (
          <>
            <button
              type="button"
              className="retro-slider-nav-btn prev"
              onClick={goToPrev}
              aria-label="Previous Image"
            >
              ◀
            </button>
            <button
              type="button"
              className="retro-slider-nav-btn next"
              onClick={goToNext}
              aria-label="Next Image"
            >
              ▶
            </button>
          </>
        )}

        {currentImg.caption && (
          <div className="retro-slider-caption">
            <span className="caption-tag">[{mediaTypeLabel}]</span> {currentImg.caption}
          </div>
        )}
      </div>

      {/* Thumbnail Strip */}
      {total > 1 && (
        <div className="retro-slider-thumbnails">
          {images.map((img, idx) => (
            <button
              key={img.id || idx}
              type="button"
              className={`retro-slider-thumb-btn ${idx === currentIndex ? 'active' : ''} ${isVideoMedia(img) ? 'is-video-thumb' : ''}`}
              onClick={() => setCurrentIndex(idx)}
              aria-label={`View media ${idx + 1}`}
            >
              {isVideoMedia(img) ? (
                <div className="thumb-video-glyph">
                  <span className="thumb-video-icon">▶</span>
                  <span className="thumb-video-tag">VIDEO</span>
                </div>
              ) : imgErrors[idx] || !img.url ? (
                <div className="thumb-fallback-box">#{idx + 1}</div>
              ) : (
                <img
                  src={img.url}
                  alt={img.alt || `Thumb ${idx + 1}`}
                  onError={() => handleImgError(idx)}
                />
              )}
              {img.is_cover && <span className="thumb-cover-tag">COVER</span>}
            </button>
          ))}
        </div>
      )}

      {/* Lightbox Modal */}
      {isLightboxOpen && (
        <div className="retro-lightbox-overlay" onClick={() => setIsLightboxOpen(false)}>
          <div className="retro-lightbox-content" onClick={(e) => e.stopPropagation()}>
            <div className="retro-lightbox-bar">
              <span className="retro-lightbox-label">
                [SYSTEM INSPECTION — {currentIndex + 1} OF {total} // {mediaTypeLabel}]
              </span>
              <button
                type="button"
                className="retro-lightbox-close"
                onClick={() => setIsLightboxOpen(false)}
              >
                [ CLOSE ✕ ]
              </button>
            </div>
            <div className="retro-lightbox-img-wrap">
              {isVideoMedia(currentImg) ? (
                getEmbedUrl(currentImg.url) ? (
                  <iframe
                    src={getEmbedUrl(currentImg.url)}
                    title="Lightbox Video"
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    allowFullScreen
                    className="retro-lightbox-iframe"
                  />
                ) : (
                  <video
                    src={currentImg.url}
                    controls
                    autoPlay
                    playsInline
                    className="retro-lightbox-video"
                  />
                )
              ) : (
                <img src={currentImg.url} alt={currentImg.alt || "Lightbox View"} />
              )}
            </div>
            {currentImg.caption && (
              <div className="retro-lightbox-caption">
                <span className="caption-type-tag">[{mediaTypeLabel}]</span> {currentImg.caption}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
