import React from 'react';
import { Link } from 'react-router-dom';
import './Feature.css';

const Feature = () => {
  return (
    <section className="feature-section">
      <div className="container">
        <div className="feature-container-card">
          
          {/* NỬA TRÁI (Nội dung trên + Dải ticker dưới) */}
          <div className="feature-left-col">
            <div className="feature-body">
              <h2 className="feature-heading">SỰ VƯỢT TRỘI HÀNG ĐẦU</h2>
              
              <p className="feature-summary">
                Khám phá yếu tố chất lượng hàng đầu của sản phẩm cà phê tại cửa hàng của chúng tôi,
                nơi mang đến cho bạn trải nghiệm thưởng thức cà phê nguyên chất tuyệt vời nhất.
              </p>

              <div className="feature-checklist">
                <div className="check-row">
                  <span className="check-num">01</span>
                  <span className="check-title">Hạt cà phê chất lượng cao</span>
                </div>
                <div className="check-row">
                  <span className="check-num">02</span>
                  <span className="check-title">Rang xay tại chỗ</span>
                </div>
                <div className="check-row">
                  <span className="check-num">03</span>
                  <span className="check-title">Đa dạng sản phẩm</span>
                </div>
              </div>

              <div className="feature-action">
                <Link to="/products" className="btn-explore">
                  Khám Phá Ngay
                </Link>
              </div>
            </div>

            {/* DẢI TICKER NẰM GỌN Ở ĐÁY CỘT TRÁI */}
            <div className="feature-bottom-ticker">
              <div className="ticker-inner">
                <span className="ticker-item"><i className="fa-solid fa-leaf"></i> Không chất bảo quản</span>
                <span className="ticker-item"><i className="fa-solid fa-truck-fast"></i> Giao hàng miễn phí cho đơn hàng trên 3tr</span>
                <span className="ticker-item"><i className="fa-solid fa-seedling"></i> Cà phê đảm bảo chất lượng</span>
                <span className="ticker-item"><i className="fa-solid fa-leaf"></i> Không chất bảo quản</span>
                <span className="ticker-item"><i className="fa-solid fa-truck-fast"></i> Giao hàng miễn phí cho đơn hàng trên 3tr</span>
                <span className="ticker-item"><i className="fa-solid fa-seedling"></i> Cà phê đảm bảo chất lượng</span>
              </div>
            </div>
          </div>

          {/* NỬA PHẢI (Ảnh tràn full chiều cao) */}
          <div className="feature-right-col">
            <img 
              src="./src/assets/img/vi-dang-cafe-3.jpg" 
              alt="Ly cà phê latte" 
            />
          </div>

        </div>
      </div>
    </section>
  );
};

export default Feature;