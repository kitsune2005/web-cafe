import React from 'react';
import './Footer.css';

const Footer = () => {
    return (
        <footer className="site-footer">
            <div className="container footer-grid">
                <div className="footer-col footer-brand">
                    <a href="#" className="logo logo-light">
                        <img style={{ marginLeft: '-15px' }} src="./img/logo_fox_coffee.png" alt="" />
                    </a>
                    <p>Cà phê nguyên chất được chế biến 100% nguyên chất, không pha trộn với bất kỳ loại hạt cà phê nào khác.</p>
                </div>
                <div className="footer-col">
                    <h4>Danh mục</h4>
                    <ul>
                        <li><a href="#">Trang chủ</a></li>
                        <li><a href="#">Giới thiệu</a></li>
                        <li><a href="#">Sản phẩm</a></li>
                        <li><a href="#">Tin tức</a></li>
                        <li><a href="#">Liên hệ</a></li>
                    </ul>
                </div>
                <div className="footer-col">
                    <h4>Hỗ trợ</h4>
                    <ul>
                        <li><a href="#">Câu hỏi thường gặp</a></li>
                        <li><a href="#">Dịch vụ khách hàng</a></li>
                        <li><a href="#">Vị trí cửa hàng</a></li>
                        <li><a href="#">Sản phẩm bán chạy</a></li>
                        <li><a href="#">Manufactures</a></li>
                    </ul>
                </div>
                <div className="footer-col">
                    <h4>Chính sách</h4>
                    <ul>
                        <li><a href="#">Chính sách bảo mật</a></li>
                        <li><a href="#">Chính sách giao nhận</a></li>
                        <li><a href="#">Chính sách đổi trả</a></li>
                        <li><a href="#">Chính sách bảo hành</a></li>
                        <li><a href="#">Điều khoản &amp; điều kiện</a></li>
                    </ul>
                </div>
                <div className="footer-col footer-newsletter">
                    <h4>Đăng ký nhận tin tức</h4>
                    <p>Đăng ký ngay để nhận ngay các tin tức khuyến mãi mới nhất của chúng tôi</p>
                    <form className="newsletter-form" onSubmit={(e) => e.preventDefault()}>
                        <input type="email" placeholder="Nhập email..." required />
                        <button type="submit">ĐĂNG KÝ</button>
                    </form>
                    <div className="social-icons">
                        <h4 className="follow-heading">Theo dõi</h4>
                        <div>
                            <a href="#" aria-label="Facebook"><i className="fa-brands fa-facebook-f"></i></a>
                            <a href="#" aria-label="Instagram"><i className="fa-brands fa-instagram"></i></a>
                            <a href="#" aria-label="Youtube"><i className="fa-brands fa-youtube"></i></a>
                        </div>
                    </div>
                </div>
            </div>
        </footer>
    );
};

export default Footer;