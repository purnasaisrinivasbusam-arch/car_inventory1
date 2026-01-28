import React, { useState, useEffect } from 'react';

export default function MediaModal({ isOpen, onClose, mediaUrls, initialIndex = 0 }) {
  const [currentIndex, setCurrentIndex] = useState(initialIndex);

  useEffect(() => {
    setCurrentIndex(initialIndex);
  }, [initialIndex]);

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (!isOpen) return;

      switch (e.key) {
        case 'Escape':
          onClose();
          break;
        case 'ArrowLeft':
          goToPrevious();
          break;
        case 'ArrowRight':
          goToNext();
          break;
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, currentIndex]);

  const goToPrevious = () => {
    setCurrentIndex((prev) => (prev > 0 ? prev - 1 : mediaUrls.length - 1));
  };

  const goToNext = () => {
    setCurrentIndex((prev) => (prev < mediaUrls.length - 1 ? prev + 1 : 0));
  };

  const currentMedia = mediaUrls[currentIndex];
  const isVideo = currentMedia && (currentMedia.includes('.mp4') || currentMedia.includes('.webm') || currentMedia.includes('.ogg'));

  if (!isOpen || !mediaUrls.length) return null;

  return (
    <div className="modal fade show d-block" style={{ backgroundColor: 'rgba(0,0,0,0.8)' }} onClick={onClose}>
      <div className="modal-dialog modal-lg modal-dialog-centered" onClick={(e) => e.stopPropagation()}>
        <div className="modal-content">
          <div className="modal-header">
            <h5 className="modal-title">Media</h5>
            <button type="button" className="btn-close" onClick={onClose}></button>
          </div>
          <div className="modal-body text-center position-relative">
            {mediaUrls.length > 1 && (
              <>
                <button
                  type="button"
                  className="btn btn-light position-absolute start-0 top-50 translate-middle-y ms-3"
                  onClick={goToPrevious}
                  style={{ zIndex: 10 }}
                >
                  ‹
                </button>
                <button
                  type="button"
                  className="btn btn-light position-absolute end-0 top-50 translate-middle-y me-3"
                  onClick={goToNext}
                  style={{ zIndex: 10 }}
                >
                  ›
                </button>
              </>
            )}
            {isVideo ? (
              <video
                src={currentMedia.startsWith('http') ? currentMedia : `https://car-inventory1-hc9s.onrender.com${currentMedia}`}
                controls
                autoPlay
                className="w-100"
              />
            ) : (
              <img
                src={currentMedia.startsWith('http') ? currentMedia : `https://car-inventory1-hc9s.onrender.com${currentMedia}`}
                alt="Media"
                className="img-fluid"
              />
            )}
            {mediaUrls.length > 1 && (
              <div className="position-absolute bottom-0 start-50 translate-middle-x mb-3 text-white">
                {currentIndex + 1} / {mediaUrls.length}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
