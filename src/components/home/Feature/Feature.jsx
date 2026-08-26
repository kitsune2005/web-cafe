import React from 'react';
import { Link } from 'react-router-dom';
import latteCoffeCup from '../../../assets/img/vi-dang-cafe-3.jpg';
import './Feature.css';

const Feature = () => {
  return (
    <section className="feature-section">
      <div className="container">
        <div className="feature-container-card">
          
          {/* NỬA TRÁI (Nội dung trên + Dải ticker dưới) */}
          <div className="feature-left-col">
            <div className="feature-body">
              {/* Tiêu đề lướt từ trái vào */}
              <h2 className="feature-heading" data-aos="fade-right">SỰ VƯỢT TRỘI HÀNG ĐẦU</h2>
              
              {/* Đoạn mô tả lướt từ trái vào, trễ 100ms */}
              <p className="feature-summary" data-aos="fade-right" data-aos-delay="100">
                Khám phá yếu tố chất lượng hàng đầu của sản phẩm cà phê tại cửa hàng của chúng tôi,
                nơi mang đến cho bạn trải nghiệm thưởng thức cà phê nguyên chất tuyệt vời nhất.
              </p>

              <div className="feature-checklist">
                {/* 3 check-row lướt vào lần lượt với độ trễ tăng dần */}
                <div className="check-row" data-aos="fade-right" data-aos-delay="200">
                  <span className="check-num">01</span>
                  <span className="check-title">Hạt cà phê chất lượng cao</span>
                </div>
                <div className="check-row" data-aos="fade-right" data-aos-delay="300">
                  <span className="check-num">02</span>
                  <span className="check-title">Rang xay tại chỗ</span>
                </div>
                <div className="check-row" data-aos="fade-right" data-aos-delay="400">
                  <span className="check-num">03</span>
                  <span className="check-title">Đa dạng sản phẩm</span>
                </div>
              </div>

              {/* Nút bấm nổi từ dưới lên */}
              <div className="feature-action" data-aos="fade-up" data-aos-delay="500">
                <Link to="/products" className="btn-explore">
                  Khám Phá Ngay
                </Link>
              </div>
            </div>

            {/* DẢI TICKER NẰM GỌN Ở ĐÁY CỘT TRÁI - Trượt lên cuối cùng */}
            <div className="feature-bottom-ticker" data-aos="fade-up" data-aos-delay="600">
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

          {/* NỬA PHẢI (Ảnh tràn full chiều cao) - Lướt từ mép phải vào */}
          <div className="feature-right-col" data-aos="fade-left" data-aos-delay="200">
            <img 
              src={latteCoffeCup}
              alt="Ly cà phê latte" 
            />
          </div>

        </div>
      </div>
    </section>
  );
};

export default Feature;