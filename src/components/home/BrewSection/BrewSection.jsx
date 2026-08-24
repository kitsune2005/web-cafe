import React, { useState, useEffect, useRef } from 'react';
import localData from '../../../data/data.json';
import './BrewSection.css';

const BrewSection = ({ brews: propBrews }) => {
  const trackRef = useRef(null);
  const [brews, setBrews] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);

  useEffect(() => {
    const loadFallbackData = () => {
      const fallback = propBrews || localData.brews || [
        { id: 1, name: "Kalita Wave", image: "https://cafengon.monamedia.net/wp-content/uploads/2025/01/galaxy-2.png" },
        { id: 2, name: "Chemex", image: "https://cafengon.monamedia.net/wp-content/uploads/2025/01/galaxy-5.png" },
        { id: 3, name: "Espresso", image: "https://cafengon.monamedia.net/wp-content/uploads/2025/01/galaxy-1.png" },
        { id: 4, name: "Pour-Over", image: "https://cafengon.monamedia.net/wp-content/uploads/2025/01/galaxy-6.png" },
        { id: 5, name: "Flash Brew", image: "https://cafengon.monamedia.net/wp-content/uploads/2025/01/galaxy-7.png" },
        { id: 6, name: "Máy Pha Tự Động", image: "https://cafengon.monamedia.net/wp-content/uploads/2025/01/galaxy-4.png" }
      ];
      setBrews(fallback);
    };

    const fetchBrews = async () => {
      try {
        const response = await fetch('http://localhost:5000/api/brews');
        if (response.ok) {
          const data = await response.json();
          setBrews(data.brews || data);
        } else {
          loadFallbackData();
        }
      } catch (error) {
        loadFallbackData();
      }
    };

    fetchBrews();
  }, [propBrews]);

  const totalPages = Math.ceil(brews.length / 6) || 1;

  const handleNext = () => {
    if (trackRef.current) {
      const containerWidth = trackRef.current.clientWidth;
      trackRef.current.scrollBy({ left: containerWidth, behavior: 'smooth' });
    }
  };

  const handlePrev = () => {
    if (trackRef.current) {
      const containerWidth = trackRef.current.clientWidth;
      trackRef.current.scrollBy({ left: -containerWidth, behavior: 'smooth' });
    }
  };

  const handleScroll = () => {
    if (trackRef.current) {
      const scrollLeft = trackRef.current.scrollLeft;
      const containerWidth = trackRef.current.clientWidth;
      const newIndex = Math.round(scrollLeft / containerWidth) + 1;
      if (newIndex !== currentPage && newIndex <= totalPages) {
        setCurrentPage(newIndex);
      }
    }
  };

  return (
    <section className="brew-section">
      <div className="container">
        {/* TIÊU ĐỀ */}
        <div className="brew-head">
          <h2 className="brew-title">KHÁM PHÁ HƯƠNG VỊ CÀ PHÊ ĐA DẠNG</h2>
          <p className="brew-desc">
            Tìm hiểu những kiến thức cơ bản về pha cà phê, bao gồm các phương pháp pha cà phê khác nhau.
          </p>
        </div>

        {/* CAROUSEL 6 CỘT */}
        <div className="brew-carousel-wrapper">
          <div 
            className="brews-track" 
            ref={trackRef}
            onScroll={handleScroll}
          >
            {brews.map((brew) => (
              <div className="brew-item" key={brew.id}>
                <div className="brew-circle-wrap">
                  <div className="brew-circle">
                    <img 
                      src={brew.image || brew.img} 
                      alt={brew.name} 
                      loading="lazy" 
                    />
                  </div>
                </div>
                <p className="brew-name">{brew.name}</p>
              </div>
            ))}
          </div>
        </div>

        {/* ĐIỀU HƯỚNG BÊN DƯỚI */}
        <div className="brew-controls">
          <button className="brew-nav-btn" onClick={handlePrev} aria-label="Trang trước">
            <i className="fa-solid fa-chevron-left"></i>
          </button>
          <span className="brew-page-num">
            {currentPage} / {totalPages}
          </span>
          <button className="brew-nav-btn" onClick={handleNext} aria-label="Trang sau">
            <i className="fa-solid fa-chevron-right"></i>
          </button>
        </div>
      </div>
    </section>
  );
};

export default BrewSection;