import React, { useRef, useState, useEffect } from 'react';
import { useHeaderLogic } from './useHeaderLogic.js';
import AuthModal from '../AuthModal/AuthModal';
import UserProfileModal from '../UserProfileModal/UserProfileModal';
import SettingsModal from '../SettingsModal/SettingsModal';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import logoFox from '../../assets/img/logo_fox_coffee.png';
import './Header.css';

import { useCart } from '../../context/CartContext';
import { useProduct } from '../../context/ProductContext';

const Header = () => {
  const {
    currentUser, loading, scrolled, searchOpen, setSearchOpen,
    mobileMenuOpen, setMobileMenuOpen, authModalOpen, setAuthModalOpen,
    userDropdownOpen, setUserDropdownOpen, navDropdown, setNavDropdown,
    profileOpen, setProfileOpen, searchRef, userMenuRef, navRef,
    handleLogout, menuItems
  } = useHeaderLogic();

  const { cartItems, removeFromCart } = useCart();
  const { products, formatPrice } = useProduct();
  const navigate = useNavigate();

  const [settingsOpen, setSettingsOpen] = useState(false);
  const location = useLocation();
  const navListRef = useRef(null);
  
  // Dùng Ref để thao tác trực tiếp mượt mà
  const indicatorRef = useRef(null);
  const [searchTerm, setSearchTerm] = useState('');

  const isDarkBannerPage = location.pathname === '/' || location.pathname.startsWith('/category') || location.pathname.startsWith("/news") || location.pathname.startsWith("/contact") || location.pathname.startsWith("/search");
  const isLightMode = !isDarkBannerPage;

  //   HÀM MỚI: Chỉ bám theo thẻ Active, phớt lờ Hover
  const updateActiveIndicator = () => {
    if (!navListRef.current || !indicatorRef.current) return;
    
    // Tìm thằng nào đang có class 'active'
    const activeEl = navListRef.current.querySelector('li.active');
    
    if (activeEl) {
      const navRect = navListRef.current.getBoundingClientRect();
      const elRect = activeEl.getBoundingClientRect();
      
      indicatorRef.current.style.left = `${elRect.left - navRect.left}px`;
      indicatorRef.current.style.width = `${elRect.width}px`;
      indicatorRef.current.style.opacity = '1';
    } else {
      // Nếu không trang nào active (ví dụ trang Giỏ hàng) thì giấu thanh line đi
      indicatorRef.current.style.opacity = '0';
    }
  };

  useEffect(() => {
    setNavDropdown(null);
    // Chạy khi vừa vào trang hoặc đổi trang
    const timer = setTimeout(updateActiveIndicator, 150);
    
    // Cập nhật lại thanh line khi xoay màn hình hoặc đổi size
    window.addEventListener('resize', updateActiveIndicator);
    
    return () => {
        clearTimeout(timer);
        window.removeEventListener('resize', updateActiveIndicator);
    };
  }, [location.pathname, menuItems]);

  const totalQuantity = cartItems.length; 
  const totalPrice = cartItems.reduce((total, item) => total + (item.price * item.quantity), 0);

  const searchResults = searchTerm.trim() === ''
    ? []
    : products.filter(p =>
      p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.category.toLowerCase().includes(searchTerm.toLowerCase())
    ).slice(0, 5);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (searchRef.current && !searchRef.current.contains(event.target)) {
        setSearchOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [searchRef, setSearchOpen]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    if (searchTerm.trim()) {
      setSearchOpen(false); 
      navigate(`/search?q=${encodeURIComponent(searchTerm.trim())}`); 
      setSearchTerm(''); 
    }
  };

  if (loading) return null;

  return (
    <>
      <header className={`site-header ${scrolled ? 'scrolled' : ''} ${isLightMode ? 'light-mode' : ''}`}>
        <div className="container header-inner">

          {mobileMenuOpen && (
              <div className="mobile-menu-overlay" onClick={() => setMobileMenuOpen(false)}></div>
          )}

          <nav className={`main-nav ${mobileMenuOpen ? 'open' : ''}`} ref={navRef}>
            <button className="close-mobile-menu" onClick={() => setMobileMenuOpen(false)}>
                <i className="fa-solid fa-xmark"></i>
            </button>

            {/*   Đã xóa sự kiện onMouseLeave ở thẻ ul */}
            <ul ref={navListRef} style={{ position: 'relative' }}>
              {menuItems.map((item, index) => {
                const isActive = location.pathname === item.link || (item.label.toLowerCase() === 'sản phẩm' && location.pathname.startsWith('/category'));
                return (
                  <li
                    key={index}
                    className={`${item.dropdown ? 'has-dropdown' : ''} ${isActive ? 'active' : ''}`}
                    //   Đã xóa sự kiện onMouseEnter ở thẻ li
                  >
                    <Link
                      to={item.link || '#'}
                      onClick={() => {
                        if (item.label.toLowerCase() === 'giới thiệu') window.scrollTo({ top: 0, behavior: 'smooth' });
                        if (item.dropdown) {
                            setNavDropdown(navDropdown === item.label ? null : item.label);
                        } else {
                            setMobileMenuOpen(false);
                        }
                      }}
                    >
                      {item.label}
                    </Link>

                    {item.dropdown && (
                      <ul className={`nav-dropdown ${navDropdown === item.label ? 'force-show' : ''}`}>
                        {item.label.toLowerCase() === 'sản phẩm' ? (
                          <>
                            <li><Link to="/category/nguyen-chat" onClick={() => { setNavDropdown(null); setMobileMenuOpen(false); }}>Cà phê nguyên chất</Link></li>
                            <li><Link to="/category/dong-goi" onClick={() => { setNavDropdown(null); setMobileMenuOpen(false); }}>Cà phê đóng gói</Link></li>
                            <li><Link to="/category/phin" onClick={() => { setNavDropdown(null); setMobileMenuOpen(false); }}>Cà phê phin</Link></li>
                          </>
                        ) : (
                          item.dropdown.map((sub, subIndex) => (
                            <li key={subIndex}>
                              <Link to={sub.link || '#'} onClick={() => { setNavDropdown(null); setMobileMenuOpen(false); }}>{sub.label}</Link>
                            </li>
                          ))
                        )}
                      </ul>
                    )}
                  </li>
                );
              })}
              
              {/* Thanh gạch dưới chỉ di chuyển khi state Active thay đổi */}
              <div className="nav-indicator" ref={indicatorRef}></div>
            </ul>

            <div className="mobile-user-bottom">
                {currentUser ? (
                    <div className="mobile-user-card" onClick={() => { setMobileMenuOpen(false); setProfileOpen(true); }}>
                        {currentUser.avatar ? (
                            <img src={currentUser.avatar} alt="Avatar" />
                        ) : (
                            <div className="m-avatar-placeholder">{currentUser.name.charAt(0).toUpperCase()}</div>
                        )}
                        <div className="m-user-info">
                            <span className="m-greeting">Xin chào,</span>
                            <span className="m-name">{currentUser.name}</span>
                        </div>
                    </div>
                ) : (
                    <div className="mobile-user-card login-btn" onClick={() => { setMobileMenuOpen(false); setAuthModalOpen(true); }}>
                        <div className="m-avatar-placeholder"><i className="fa-regular fa-user"></i></div>
                        <span className="m-name">Đăng nhập / Đăng ký</span>
                    </div>
                )}
            </div>
          </nav>

          <Link to="/" className="logo">
            <img src={logoFox} alt="Logo" />
          </Link>

          <div className="header-actions">
            <div className={`search-wrap ${searchOpen ? 'active' : ''}`} ref={searchRef}>
              <form className="search-form" role="search" onSubmit={handleSearchSubmit}>
                <input
                  type="text"
                  placeholder="Tìm kiếm"
                  aria-label="Tìm kiếm"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  onFocus={() => setSearchOpen(true)}
                />
                <button type="submit" aria-label="Tìm kiếm">
                  <i className="fa-solid fa-magnifying-glass"></i>
                </button>
              </form>

              {searchOpen && (
                <div className="search-dropdown">
                  {searchTerm.trim() === '' ? (
                    <div className="search-dropdown-block">
                      <h4>Sản phẩm bán chạy</h4>
                      <div className="search-tags">
                        <span className="tag-chip" onClick={() => { setSearchOpen(false); navigate('/search?q=Cà+phê'); }}>
                          <i className="fa-solid fa-magnifying-glass"></i> Cà phê
                        </span>
                        <span className="tag-chip" onClick={() => { setSearchOpen(false); navigate('/search?q=Đóng+gói'); }}>
                          <i className="fa-solid fa-magnifying-glass"></i> Đóng gói
                        </span>
                        <span className="tag-chip" onClick={() => { setSearchOpen(false); navigate('/search?q=Phin'); }}>
                          <i className="fa-solid fa-magnifying-glass"></i> Phin
                        </span>
                      </div>
                    </div>
                  ) : (
                    <div className="search-results">
                      {searchResults.length > 0 ? (
                        searchResults.map(product => (
                          <div
                            key={product.id}
                            className="search-result-item"
                            onClick={() => {
                              setSearchOpen(false);
                              setSearchTerm('');
                              navigate(`/product/${product.id}`);
                            }}
                          >
                            <img src={product.imageFront || product.img} alt={product.name} />
                            <div className="search-result-info">
                              <p className="search-result-name">{product.name}</p>
                              <p className="search-result-price">{formatPrice(product.price)}</p>
                            </div>
                          </div>
                        ))
                      ) : (
                        <div className="no-result">Không tìm thấy "{searchTerm}"</div>
                      )}
                    </div>
                  )}
                </div>
              )}
            </div>

            <Link to="/favorites" className="icon-btn" aria-label="Yêu thích"><i className="fa-regular fa-heart"></i></Link>

            {currentUser ? (
              <div className={`user-menu ${userDropdownOpen ? 'open' : ''}`} ref={userMenuRef}>
                <button className="icon-btn user-btn" onClick={() => setUserDropdownOpen(!userDropdownOpen)}>
                  <i className="fa-regular fa-user"></i>
                  <span className="user-name">{currentUser.name}</span>
                  <i className="fa-solid fa-chevron-down"></i>
                </button>
                {userDropdownOpen && (
                  <div className="user-dropdown">
                    <div className="user-dropdown-header">
                      {currentUser.avatar ? (
                        <img src={currentUser.avatar} alt="Avatar" className="user-avatar-img" />
                      ) : (
                        <span className="user-avatar">{currentUser.name.charAt(0).toUpperCase()}</span>
                      )}
                      <div>
                        <p className="user-email">{currentUser.email}</p>
                      </div>
                    </div>
                    <div className="user-dropdown-divider"></div>
                    <button className="user-dropdown-item" onClick={() => { setUserDropdownOpen(false); setProfileOpen(true); }}>
                      <i className="fa-solid fa-user"></i> Tài khoản của tôi
                    </button>
                    <Link to="/cart" className="user-dropdown-item" onClick={() => setUserDropdownOpen(false)}>
                      <i className="fa-solid fa-cart-shopping"></i> Giỏ hàng
                    </Link>
                    <Link to="/my-orders" className="user-dropdown-item" onClick={() => setUserDropdownOpen(false)}>
                      <i className="fa-solid fa-box"></i> Đơn hàng
                    </Link>
                    {currentUser.role === 'admin' && (
                      <Link to="/admin" className="user-dropdown-item" onClick={() => setUserDropdownOpen(false)}>
                        <i className="fa-solid fa-chart-line"></i> Trang Quản Trị
                      </Link>
                    )}
                    <button className="user-dropdown-item" onClick={() => { setUserDropdownOpen(false); setSettingsOpen(true); }}>
                      <i className="fa-solid fa-gear"></i> Cài đặt
                    </button>
                    <div className="user-dropdown-divider"></div>
                    <button onClick={handleLogout} className="user-dropdown-item logout-btn">
                      <i className="fa-solid fa-right-from-bracket"></i> Đăng xuất
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <button className="icon-btn" aria-label="Đăng nhập" onClick={() => setAuthModalOpen(true)}>
                <i className="fa-regular fa-user"></i>
              </button>
            )}

            <div className="cart-wrap">
              <Link to="/cart" className="icon-btn cart-btn" aria-label="Giỏ hàng">
                <i className="fa-solid fa-cart-shopping"></i>
                {totalQuantity > 0 && <span className="cart-count">{totalQuantity}</span>}
              </Link>

              <div className="mini-cart-dropdown">
                {cartItems.length === 0 ? (
                  <div className="mini-cart-empty">
                    <p>Không có sản phẩm trong giỏ hàng.</p>
                  </div>
                ) : (
                  <div className="mini-cart-has-items">
                    <ul className="mini-cart-list">
                      {cartItems.map((item, idx) => (
                        <li key={idx} className="mini-cart-item">
                          <img src={item.imageFront || item.img} alt={item.name} className="mc-img" />
                          <div className="mc-info">
                            <Link className="mc-name" to={`/product/${item.id}`}>{item.name}</Link>
                            <span className="mc-price">{item.quantity} x {(item.price).toLocaleString('vi-VN')}₫</span>
                          </div>
                          <button className="mc-remove" onClick={() => removeFromCart(item.id)}>
                            <i className="fa-solid fa-xmark"></i>
                          </button>
                        </li>
                      ))}
                    </ul>
                    <div className="mini-cart-total-wrap">
                      <span>TỔNG SỐ PHỤ:</span>
                      <span className="mc-total-price">{totalPrice.toLocaleString('vi-VN')}₫</span>
                    </div>
                    <div className="mini-cart-bottom">
                      <Link className="btn-view-cart" to="/cart">XEM GIỎ HÀNG</Link>
                      <Link className="btn-checkout" to="/checkout">THANH TOÁN</Link>
                    </div>
                  </div>
                )}
              </div>
            </div>

          </div>

          <button className="menu-toggle" aria-label="Menu" onClick={() => setMobileMenuOpen(true)}>
            <i className="fa-solid fa-bars"></i>
          </button>
        </div>
      </header>

      <AuthModal isOpen={authModalOpen} onClose={() => setAuthModalOpen(false)} />
      <UserProfileModal isOpen={profileOpen} onClose={() => setProfileOpen(false)} />
      <SettingsModal isOpen={settingsOpen} onClose={() => setSettingsOpen(false)} />
    </>
  );
};

export default Header;