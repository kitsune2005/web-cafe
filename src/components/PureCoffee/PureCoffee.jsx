import React, { useEffect, useRef } from 'react';
import './PureCoffee.css';
import { useReveal } from '../../hooks/useReveal';

const PureCoffee = ({ categories }) => {
  const revealRef = useReveal();

  return (
    <section className="section pure-coffee" ref={revealRef}>
      <div className="container">
        <div className="pure-flex">
          <div className="pure-left">
            <div className="pc-intro reveal">
              <h2 className="section-title text-uppercase text-brown">Cà phê nguyên chất</h2>
              <p className="section-text">
                Cà phê nguyên chất được chế biến 100% nguyên chất, không pha trộn với bất kỳ loại hạt cà phê nào khác. Đây là loại cà phê được trồng, thu hoạch và chế biến một cách cẩn thận để giữ nguyên hương vị và chất lượng tốt nhất.
              </p>
              <a href="#" className="link-arrow">Khám phá <span><i className="fa-solid fa-arrow-right"></i></span></a>
            </div>

            <div className="pc-image reveal">
              <img src="./src/img/—Pngtree—flying cup of coffee with_15739217.png" alt="Ly cà phê & hạt cà phê" loading="lazy" />
            </div>
          </div>

          <div className="pure-right">
            <div className="pc-right-header">
              <div className="pc-heading reveal reveal-delay-1">
                <h2 className="section-title text-uppercase text-brown">Thơm ngon<br />chất lượng</h2>
              </div>
              <div className="pc-text reveal reveal-delay-2">
                <p className="section-text">
                  Những hạt cà phê này thường được trồng theo phương pháp bền vững, không sử dụng hóa chất độc hại, tôn trọng môi trường và người lao động.
                </p>
              </div>
            </div>

            <div className="pc-categories">
              <div className="carousel" data-visible="3">
                <div className="carousel-track">
                  {categories.map(cat => (
                    <article className="category-card reveal" key={cat.id}>
                      <div className="category-img round">
                        <img src={cat.image} alt={cat.name} loading="lazy" />
                      </div>
                      <h3>{cat.name}</h3>
                    </article>
                  ))}
                </div>
                <div className="carousel-nav">
                  <button className="carousel-prev"><i className="fa-solid fa-chevron-left"></i></button>
                  <span className="carousel-counter"><span>1</span> / <span>2</span></span>
                  <button className="carousel-next"><i className="fa-solid fa-chevron-right"></i></button>
                </div>
              </div>
            </div>
          </div>
        </div>
        <div className="pc-decor" aria-hidden="true">
          <img src="./src/img/icon-coffee-4-e1736934867109-removebg-preview.png" alt="decor khói" />
        </div>
      </div>
    </section>
  );
};

export default PureCoffee;