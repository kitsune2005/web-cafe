import React from 'react';
import './Feature.css';

const Feature = () => {
  return (
    <section className="section">
      <div className="container">
        <div className="feature-card reveal">
          <div className="feature-content">
            <div className="feature-top text-center">
              <h2 className="section-title text-uppercase text-brown">SỰ VƯỢT TRỘI HÀNG ĐẦU</h2>
              <p className="section-text mx-auto">
                Khám phá yếu tố chất lượng hàng đầu của sản phẩm cà phê tại cửa hàng của chúng tôi,
                nơi mang đến cho bạn trải nghiệm thưởng thức cà phê nguyên chất tuyệt vời nhất.
              </p>
              <ol className="numbered-list center-list">
                <li><span className="num">01</span><span className="label">Hạt cà phê chất lượng cao</span></li>
                <li><span className="num">02</span><span className="label">Rang xay tại chỗ</span></li>
                <li><span className="num">03</span><span className="label">Đa dạng sản phẩm</span></li>
              </ol>
              <a href="#" className="btn btn-primary">Khám Phá Ngay</a>
            </div>

            <div className="feature-footer marquee-footer">
              <div className="marquee-track-footer">
                <span><i className="fa-solid fa-leaf"></i> Không chất bảo quản</span>
                <span><i className="fa-solid fa-truck-fast"></i> Giao hàng miễn phí cho đơn hàng trên 3tr</span>
                <span><i className="fa-solid fa-seedling"></i> Cà phê đảm bảo chất lượng</span>
                <span><i className="fa-solid fa-leaf"></i> Không chất bảo quản</span>
                <span><i className="fa-solid fa-truck-fast"></i> Giao hàng miễn phí cho đơn hàng trên 3tr</span>
                <span><i className="fa-solid fa-seedling"></i> Cà phê đảm bảo chất lượng</span>
              </div>
            </div>
          </div>
          <div className="feature-image">
            <img src="./img/vi-dang-cafe-3.jpg" alt="Ly cà phê latte art" loading="lazy" />
          </div>
        </div>
      </div>
    </section>
  );
};

export default Feature;