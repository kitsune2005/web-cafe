import React, { useRef, useState, useEffect } from 'react';
import { useHeaderLogic } from './useHeaderLogic.js';
import AuthModal from '../AuthModal/AuthModal';
import UserProfileModal from '../UserProfileModal/UserProfileModal';
import SettingsModal from '../SettingsModal/SettingsModal'; 
import { Link, useLocation, useNavigate } from 'react-router-dom';
import logoFox from '../../assets/img/logo_fox_coffee.png';
import './Header.css';

// 👉 THÊM: Import Giỏ Hàng từ Context
import { useCart } from '../../context/CartContext';

const Header = () => {
  const {
    currentUser, loading, scrolled, searchOpen, setSearchOpen,
    mobileMenuOpen, setMobileMenuOpen, authModalOpen, setAuthModalOpen,
    userDropdownOpen, setUserDropdownOpen, navDropdown, setNavDropdown,
    profileOpen, setProfileOpen, searchRef, userMenuRef, navRef,
    handleLogout, menuItems
  } = useHeaderLogic();

  // 👉 THÊM: Rút dữ liệu từ Giỏ hàng Context
  const { cartItems, removeFromCart } = useCart();
  const navigate = useNavigate();

  const [settingsOpen, setSettingsOpen] = useState(false);
  const location = useLocation();
  const navListRef = useRef(null);
  const [indicatorStyle, setIndicatorStyle] = useState({ left: 0, width: 0, opacity: 0 });

  // ==============================================================
  // BÍ KÍP TẮC KÈ HOA Ở ĐÂY NÈ BOSS:
  const isDarkBannerPage = location.pathname === '/' || location.pathname.startsWith('/category');
  const isLightMode = !isDarkBannerPage;
  // ==============================================================

  const updateIndicator = (el) => {
    if (!el || !navListRef.current) return;
    const navRect = navListRef.current.getBoundingClientRect();
    const elRect = el.getBoundingClientRect();
    setIndicatorStyle({
      left: elRect.left - navRect.left,
      width: elRect.width,
      opacity: 1
    });
  };

  const resetIndicator = () => {
    const activeEl = navListRef.current?.querySelector('li.active');
    if (activeEl) {
      updateIndicator(activeEl);
    } else {
      setIndicatorStyle(prev => ({ ...prev, opacity: 0 }));
    }
  };

  useEffect(() => {
    setTimeout(resetIndicator, 100);
  }, [location.pathname, menuItems]);

  // 👉 TÍNH TOÁN GIỎ HÀNG: Tổng số lượng, Tổng tiền
  const totalQuantity = cartItems.reduce((total, item) => total + item.quantity, 0);
  const totalPrice = cartItems.reduce((total, item) => total + (item.price * item.quantity), 0);

  if (loading) return null;

  return (
    <>
      <header className={`site-header ${scrolled ? 'scrolled' : ''} ${isLightMode ? 'light-mode' : ''}`}>
        <div className="container header-inner">

          {/* Menu Desktop */}
          <nav className={`main-nav ${mobileMenuOpen ? 'open' : ''}`} ref={navRef}>
            <ul ref={navListRef} onMouseLeave={resetIndicator} style={{ position: 'relative' }}>
              {menuItems.map((item, index) => {
                const isActive = location.pathname === item.link || (item.label.toLowerCase() === 'sản phẩm' && location.pathname.startsWith('/category'));
                return (
                  <li
                    key={index}
                    className={`${item.dropdown ? 'has-dropdown' : ''} ${isActive ? 'active' : ''}`}
                    onMouseEnter={(e) => updateIndicator(e.currentTarget)}
                  >
                    <Link
                      to={item.link || '#'}
                      onClick={() => {
                        if (item.label.toLowerCase() === 'giới thiệu') window.scrollTo({ top: 0, behavior: 'smooth' });
                        if (item.dropdown) setNavDropdown(navDropdown === item.label ? null : item.label);
                      }}
                    >
                      {item.label}
                    </Link>

                    {item.dropdown && (
                      <ul className={`nav-dropdown ${navDropdown === item.label ? 'force-show' : ''}`}>
                        {item.label.toLowerCase() === 'sản phẩm' ? (
                          <>
                            <li><Link to="/category/nguyen-chat" onClick={() => setNavDropdown(null)}>Cà phê nguyên chất</Link></li>
                            <li><Link to="/category/dong-goi" onClick={() => setNavDropdown(null)}>Cà phê đóng gói</Link></li>
                            <li><Link to="/category/phin" onClick={() => setNavDropdown(null)}>Cà phê phin</Link></li>
                          </>
                        ) : (
                          item.dropdown.map((sub, subIndex) => (
                            <li key={subIndex}>
                              <Link to={sub.link || '#'} onClick={() => setNavDropdown(null)}>{sub.label}</Link>
                            </li>
                          ))
                        )}
                      </ul>
                    )}
                  </li>
                );
              })}
              <div className="nav-indicator" style={indicatorStyle}></div>
            </ul>
          </nav>

          {/* Logo */}
          <Link to="/" className="logo">
            <img src={logoFox} alt="Logo" />
          </Link>

          {/* Actions bên phải */}
          <div className="header-actions">
            
            {/* Search */}
            <div className={`search-wrap ${searchOpen ? 'active' : ''}`} ref={searchRef}>
              <form className="search-form" role="search" onSubmit={(e) => e.preventDefault()}>
                <input
                  type="text"
                  placeholder="Tìm kiếm"
                  aria-label="Tìm kiếm"
                  onFocus={() => setSearchOpen(true)}
                />
                <button type="submit" aria-label="Tìm kiếm">
                  <i className="fa-solid fa-magnifying-glass"></i>
                </button>
              </form>

              {searchOpen && (
                <div className="search-dropdown">
                  <div className="search-dropdown-block">
                    <h4>Sản phẩm bán chạy</h4>
                    <div className="search-tags">
                      <Link to="/products"><span className="tag-icon"><i className="fa-solid fa-magnifying-glass"></i></span>Cà phê</Link>
                      <Link to="/products"><span className="tag-icon"><i className="fa-solid fa-magnifying-glass"></i></span>Đóng gói</Link>
                      <Link to="/products"><span className="tag-icon"><i className="fa-solid fa-magnifying-glass"></i></span>Phin</Link>
                    </div>
                  </div>
                </div>
              )}
            </div>

            <Link to="/favorites" className="icon-btn" aria-label="Yêu thích"><i className="fa-regular fa-heart"></i></Link>

            {/* User Dropdown */}
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
                    
                    {/* 👉 ĐÃ THÊM: Link Giỏ hàng vào Menu User */}
                    <Link to="/cart" className="user-dropdown-item" onClick={() => setUserDropdownOpen(false)}>
                      <i className="fa-solid fa-cart-shopping"></i> Giỏ hàng
                    </Link>

                    <Link to="/my-orders" className="user-dropdown-item" onClick={() => setUserDropdownOpen(false)}>
                      <i className="fa-solid fa-box"></i> Đơn hàng
                    </Link>
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

            {/* 👉 BẮT ĐẦU: MINI CART DROPDOWN */}
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
                                        <img src={item.imageFront || item.img} alt={item.name} className="mc-img"/>
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
            {/* 👉 KẾT THÚC: MINI CART DROPDOWN */}

          </div>

          <button className="menu-toggle" aria-label="Menu" onClick={() => setMobileMenuOpen(!mobileMenuOpen)}>
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