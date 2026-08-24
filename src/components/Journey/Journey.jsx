import React from 'react';
import './Journey.css';

const Journey = ({ steps }) => {
  return (
    <section className="section wave-section journey-section">
      <svg className="wave wave-top" viewBox="0 0 1000 100" preserveAspectRatio="none">
        <path d="M421.9,6.5c22.6-2.5,51.5,0.4,75.5,5.3c23.6,4.9,70.9,23.5,100.5,35.7c75.8,32.2,133.7,44.5,192.6,49.7c23.6,2.1,48.7,3.5,103.4-2.5c54.7-6,106.2-25.6,106.2-25.6V0H0v30.3c0,0,72,32.6,158.4,30.5c39.2-0.7,92.8-6.7,134-22.4c21.2-8.1,52.2-18.2,79.7-24.2C399.3,7.9,411.6,7.5,421.9,6.5z" />
      </svg>
      <div className="container">
        <div className="journey-decor" aria-hidden="true">
          <img src="./img/_Pngtree_simple_coffee_cup_logo_5225200-removebg-preview.png" alt="decor ly cà phê" />
        </div>
        <div className="section-head center reveal">
          <h2 className="section-title text-uppercase text-brown">Hành trình sản xuất cà phê</h2>
          <p className="section-text">Khám phá quy trình chất lượng hàng đầu của sản phẩm cà phê tại cửa hàng của chúng tôi.</p>
        </div>
        <div className="carousel journey-carousel" data-visible="2">
          <div className="carousel-track journey-track">
            {steps.map(step => (
              <article className="journey-step reveal" key={step.id}>
                <div className="journey-img">
                  <img src={step.image} alt={step.title} loading="lazy" />
                </div>
                <div className="journey-content">
                  <h3>{step.title}</h3>
                  <p>{step.description}</p>
                  <a href="#" className="btn btn-primary btn-small">Khám phá</a>
                </div>
              </article>
            ))}
          </div>
          <div className="carousel-dots">
            <span className="active"></span>
            <span></span>
          </div>
        </div>
      </div>
      <svg className="wave wave-bottom" viewBox="0 0 1000 100" preserveAspectRatio="none">
        <path d="M421.9,6.5c22.6-2.5,51.5,0.4,75.5,5.3c23.6,4.9,70.9,23.5,100.5,35.7c75.8,32.2,133.7,44.5,192.6,49.7c23.6,2.1,48.7,3.5,103.4-2.5c54.7-6,106.2-25.6,106.2-25.6V0H0v30.3c0,0,72,32.6,158.4,30.5c39.2-0.7,92.8-6.7,134-22.4c21.2-8.1,52.2-18.2,79.7-24.2C399.3,7.9,411.6,7.5,421.9,6.5z" />
      </svg>
    </section>
  );
};

export default Journey;