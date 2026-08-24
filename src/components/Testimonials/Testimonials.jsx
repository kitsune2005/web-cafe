import React from 'react';
import './Testimonials.css';

const Testimonials = ({ testimonials }) => {
  return (
    <section className="section testimonials">
      <div className="container">
        <div className="section-head center reveal">
          <h2 className="section-title">Khách hàng đánh giá</h2>
          <p className="section-text">Nhâm nhi mỗi ngày với những loại cà phê đặc biệt như Arabica, Robusta, Espresso và nhiều hơn nữa!</p>
        </div>
        <div className="carousel" data-visible="3">
          <div className="carousel-track testimonials-track">
            {testimonials.map(t => (
              <article className="testimonial-card reveal" key={t.id}>
                <div className="rating">
                  {[...Array(t.rating)].map((_, i) => <i className="fa-solid fa-star" key={i}></i>)}
                </div>
                <h3>{t.title}</h3>
                <p>{t.content}</p>
                <p className="testimonial-author"><strong>{t.author}</strong> - Khách hàng</p>
              </article>
            ))}
          </div>
          <div className="carousel-nav">
            <button className="carousel-prev"><i className="fa-solid fa-chevron-left"></i></button>
            <span className="carousel-counter"><span>1</span> / <span>4</span></span>
            <button className="carousel-next"><i className="fa-solid fa-chevron-right"></i></button>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Testimonials;