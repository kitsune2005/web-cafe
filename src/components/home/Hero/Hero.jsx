import React from 'react';
import './Hero.css';
import videoBanner from '../../../assets/img/[TVC] DaHill Coffee Dự án tốt nghiệp đạt điểm cao nhất FPoly Cần Thơ (45s) - Cao đẳng FPT Polytechnic (1080p, h264).mp4';

const Hero = () => {
  return (
    <section className="hero">
      <div className="hero-media">
        <video className="hero-video" autoPlay muted loop playsInline poster="hero-poster.jpg">
          <source src={videoBanner} type="video/mp4" />
        </video>
        <div className="hero-overlay"></div>
      </div>
    </section>
  );
};

export default Hero;