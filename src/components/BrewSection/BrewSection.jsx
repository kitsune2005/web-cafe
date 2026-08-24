import React from 'react';
import './BrewSection.css';

const BrewSection = ({ brews }) => {
  return (
    <section className="section brew-section">
      <div className="container">
        <div className="section-head center reveal">
          <h2 className="section-title text-uppercase text-brown">Khám Phá Hương Vị Cà Phê Đa Dạng</h2>
          <p className="section-text">Tìm hiểu những kiến thức cơ bản về pha cà phê, bao gồm các phương pháp pha cà phê khác nhau.</p>
        </div>
        <div className="carousel" data-visible="6">
          <div className="carousel-track brews-track">
            {brews.map(brew => (
              <article className="brew-item reveal" key={brew.id}>
                <div className="brew-circle">
                  <img src={brew.image} alt={brew.name} loading="lazy" />
                </div>
                <p>{brew.name}</p>
              </article>
            ))}
          </div>
          <div className="carousel-nav">
            <button className="carousel-prev"><i className="fa-solid fa-chevron-left"></i></button>
            <span className="carousel-counter"><span>1</span> / <span>3</span></span>
            <button className="carousel-next"><i className="fa-solid fa-chevron-right"></i></button>
          </div>
        </div>
      </div>
    </section>
  );
};

export default BrewSection;