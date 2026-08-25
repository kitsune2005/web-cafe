import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import logoFox from '../../assets/img/logo_fox_coffee.png';
import './Footer.css';

const Footer = () => {
  const [email, setEmail] = useState('');

  const handleSubscribe = (e) => {
    e.preventDefault();
    if (email) {
      alert(`Đăng ký thành công với email: ${email}`);
      setEmail('');
    }
  };

  return (
    <footer className="site-footer">
      <div className="container">
        <div className="footer-grid">
          
          {/* CỘT 1: LOGO & GIỚI THIỆU */}
          <div className="footer-col footer-brand">
            <Link to="/" className="footer-logo">
              <img src={logoFox} alt="The Mona Coffee Logo" />
            </Link>
            <p className="footer-brand-desc">
              Cà phê nguyên chất được chế biến 100% nguyên chất, không pha trộn với bất kỳ loại hạt cà phê nào khác.
            </p>
          </div>

          {/* CỘT 2: DANH MỤC */}
          <div className="footer-col">
            <h4 className="footer-heading">DANH MỤC</h4>
            <ul className="footer-links">
              <li><Link to="/">Trang chủ</Link></li>
              <li><Link to="/about">Giới thiệu</Link></li>
              <li><Link to="/products">Sản phẩm</Link></li>
              <li><Link to="/news">Tin tức</Link></li>
              <li><Link to="/contact">Liên hệ</Link></li>
            </ul>
          </div>

          {/* CỘT 3: HỖ TRỢ */}
          <div className="footer-col">
            <h4 className="footer-heading">HỖ TRỢ</h4>
            <ul className="footer-links">
              <li><Link to="/faq">Câu hỏi thường gặp</Link></li>
              <li><Link to="/customer-service">Dịch vụ khách hàng</Link></li>
              <li><Link to="/stores">Vị trí cửa hàng</Link></li>
              <li><Link to="/best-sellers">Sản phẩm bán chạy</Link></li>
              <li><Link to="/manufactures">Manufactures</Link></li>
            </ul>
          </div>

          {/* CỘT 4: CHÍNH SÁCH */}
          <div className="footer-col">
            <h4 className="footer-heading">CHÍNH SÁCH</h4>
            <ul className="footer-links">
              <li><Link to="/privacy-policy">Chính sách bảo mật</Link></li>
              <li><Link to="/shipping-policy">Chính sách giao nhận</Link></li>
              <li><Link to="/return-policy">Chính sách đổi trả</Link></li>
              <li><Link to="/warranty-policy">Chính sách bảo hành</Link></li>
              <li><Link to="/terms">Điều khoản &amp; điều kiện</Link></li>
            </ul>
          </div>

          {/* CỘT 5: ĐĂNG KÝ NHẬN TIN & MẠNG XÃ HỘI */}
          <div className="footer-col footer-newsletter">
            <h4 className="footer-heading">ĐĂNG KÝ NHẬN TIN TỨC</h4>
            <p className="newsletter-desc">
              Đăng ký ngay để nhận ngay các tin tức khuyến mãi mới nhất của chúng tôi
            </p>

            <form className="newsletter-form" onSubmit={handleSubscribe}>
              <input
                type="email"
                placeholder="Nhập email..."
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
              <button type="submit">ĐĂNG KÝ</button>
            </form>

            <div className="footer-social-wrap">
              <span className="social-label">THEO DÕI</span>
              <div className="social-icons">
                <a href="https://facebook.com" target="_blank" rel="noreferrer" aria-label="Facebook">
                  <i className="fa-brands fa-facebook-f"></i>
                </a>
                <a href="https://instagram.com" target="_blank" rel="noreferrer" aria-label="Instagram">
                  <i className="fa-brands fa-instagram"></i>
                </a>
                <a href="https://youtube.com" target="_blank" rel="noreferrer" aria-label="Youtube">
                  <i className="fa-brands fa-youtube"></i>
                </a>
              </div>
            </div>
          </div>

        </div>
      </div>
    </footer>
  );
};

export default Footer;