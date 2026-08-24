import React from 'react';
import './Instagram.css';

const Instagram = ({ images }) => {
  return (
    <section className="section instagram">
      <div className="container">
        <div className="section-head center reveal">
          <h2 className="section-title">Theo dõi trên Instagram</h2>
          <p className="section-text">
            Khám phá thế giới đa dạng của cà phê thông qua những hình ảnh tuyệt đẹp. Đắm chìm trong hương vị đậm đà và
            thơm ngon của cà phê, cùng tận hưởng sự sáng tạo và cảm nhận sâu lắng từ mỗi giọt cà phê.
            Hãy để chúng tôi dẫn bạn vào cuộc hành trình khám phá vị ngon và thú vị của cà phê!
          </p>
        </div>
        <div className="instagram-grid">
          {images.map((img, idx) => (
            <div className="insta-img reveal" key={idx}>
              <img src={img} alt={`Instagram cà phê ${idx + 1}`} loading="lazy" />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Instagram;