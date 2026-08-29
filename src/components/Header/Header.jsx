import React, { useRef, useState, useEffect } from 'react';
import { useHeaderLogic } from './useHeaderLogic.js';
import AuthModal from '../AuthModal/AuthModal';
import UserProfileModal from '../UserProfileModal/UserProfileModal';
import SettingsModal from '../SettingsModal/SettingsModal'; 
import { Link, useLocation } from 'react-router-dom';
import logoFox from '../../assets/img/logo_fox_coffee.png';
import './Header.css';

const Header = () => {
  const {
    currentUser,
    loading,
    scrolled,
    searchOpen,
    setSearchOpen,
    mobileMenuOpen,
    setMobileMenuOpen,
    authModalOpen,
    setAuthModalOpen,
    userDropdownOpen,
    setUserDropdownOpen,
    navDropdown,
    setNavDropdown,
    profileOpen,
    setProfileOpen,
    searchRef,
    userMenuRef,
    navRef,
    handleLogout,
    menuItems
  } = useHeaderLogic();

  // ----- THÊM STATE QUẢN LÝ ĐÓNG/MỞ BẢNG CÀI ĐẶT -----
  const [settingsOpen, setSettingsOpen] = useState(false);

  // ----- LOGIC CHO HIỆU ỨNG GẠCH CHÂN (MAGIC LINE) -----
  const location = useLocation();
  const navListRef = useRef(null);
  const [indicatorStyle, setIndicatorStyle] = useState({ left: 0, width: 0, opacity: 0 });

  // ==============================================================
  // ĐÃ SỬA Ở ĐÂY: Khai báo các trang có Banner tối màu (cần chữ trắng)
  // ==============================================================
  const hasDarkBanner = location.pathname === '/' || 
                        location.pathname === '/products' || 
                        location.pathname.startsWith('/category');

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

  if (loading) return null;

  return (
    <>
      {/* ==============================================================
          ĐÃ SỬA Ở ĐÂY: Áp dụng điều kiện hasDarkBanner vào class
      ============================================================== */}
      <header className={`site-header ${scrolled ? 'scrolled' : ''} ${!hasDarkBanner ? 'light-mode' : ''}`}>
        <div className="container header-inner">

          {/* Menu Desktop */}
          <nav className={`main-nav ${mobileMenuOpen ? 'open' : ''}`} ref={navRef}>
            <ul ref={navListRef} onMouseLeave={resetIndicator} style={{ position: 'relative' }}>
              {menuItems.map((item, index) => {
                const isActive = location.pathname === item.link;
                return (
                  <li
                    key={index}
                    className={`${item.dropdown ? 'has-dropdown' : ''} ${isActive ? 'active' : ''}`}
                    onMouseEnter={(e) => updateIndicator(e.currentTarget)}
                  >
                    <Link
                      to={item.link || '#'}
                      onClick={() => {
                        if (item.label.toLowerCase() === 'giới thiệu') {
                          window.scrollTo({ top: 0, behavior: 'smooth' });
                        }
                        if (item.dropdown) {
                          setNavDropdown(navDropdown === item.label ? null : item.label);
                        }
                      }}
                    >
                      {item.label}
                    </Link>

                    {item.dropdown && (
                      <ul className={`nav-dropdown ${navDropdown === item.label ? 'force-show' : ''}`}>
                        
                        {/* ===============================================================
                            ĐÃ GẮN CỨNG LINK CATEGORY CHO MENU "SẢN PHẨM" Ở ĐÂY NÈ BOSS
                        =============================================================== */}
                        {item.label.toLowerCase() === 'sản phẩm' ? (
                          <>
                            <li>
                              <Link to="/category/nguyen-chat" onClick={() => setNavDropdown(null)}>Cà phê nguyên chất</Link>
                            </li>
                            <li>
                              <Link to="/category/dong-goi" onClick={() => setNavDropdown(null)}>Cà phê đóng gói</Link>
                            </li>
                            <li>
                              <Link to="/category/hat" onClick={() => setNavDropdown(null)}>Cà phê hạt</Link>
                            </li>
                          </>
                        ) : (
                          /* Render các menu con khác (nếu có) bình thường */
                          item.dropdown.map((sub, subIndex) => (
                            <li key={subIndex}>
                              <Link to={sub.link || '#'} onClick={() => setNavDropdown(null)}>
                                {sub.label}
                              </Link>
                            </li>
                          ))
                        )}
                        {/* =============================================================== */}

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
                      <Link to="/products"><span className="tag-icon"><i className="fa-solid fa-magnifying-glass"></i></span>Nguyên chất</Link>
                      <Link to="/products"><span className="tag-icon"><i className="fa-solid fa-magnifying-glass"></i></span>Rang xay</Link>
                    </div>
                  </div>
                  <div className="search-dropdown-block">
                    <h4>Sản phẩm nổi bật</h4>
                    <ul className="search-results-list">
                      <li>
                        <div className="search-result-thumb">
                          <img src="https://cafengon.monamedia.net/wp-content/uploads/2024/12/san-pham-3-191x300.png" alt="" />
                        </div>
                        <div className="search-result-info">
                          <Link to="/product/1" className="search-result-name">Cà Phê Enchanted Espresso</Link>
                          <span className="search-result-price">2,679,000₫</span>
                        </div>
                      </li>
                      <li>
                        <div className="search-result-thumb">
                          <img src="https://cafengon.monamedia.net/wp-content/uploads/2024/12/san-pham-2-191x300.png" alt="" />
                        </div>
                        <div className="search-result-info">
                          <Link to="/product/2" className="search-result-name">Cà Phê Emerald Burst</Link>
                          <span className="search-result-price">2,119,000₫</span>
                        </div>
                      </li>
                    </ul>
                  </div>
                </div>
              )}
            </div>

            {/* Yêu thích */}
            <Link to="/favorites" className="icon-btn" aria-label="Yêu thích"><i className="fa-regular fa-heart"></i></Link>

            {/* User Dropdown */}
            {currentUser ? (
              <div className={`user-menu ${userDropdownOpen ? 'open' : ''}`} ref={userMenuRef}>
                <button
                  className="icon-btn user-btn"
                  onClick={() => setUserDropdownOpen(!userDropdownOpen)}
                >
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

                    <button
                      className="user-dropdown-item"
                      onClick={() => {
                        setUserDropdownOpen(false);
                        setProfileOpen(true);
                      }}
                    >
                      <i className="fa-solid fa-user"></i> Tài khoản của tôi
                    </button>

                    <Link to="/admin/orders" className="user-dropdown-item" onClick={() => setUserDropdownOpen(false)}>
                      <i className="fa-solid fa-box"></i> Đơn hàng
                    </Link>

                    {/* Button gọi Settings Modal */}
                    <button 
                      className="user-dropdown-item" 
                      onClick={() => {
                        setUserDropdownOpen(false);
                        setSettingsOpen(true);
                      }}
                    >
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
              <button
                className="icon-btn"
                aria-label="Đăng nhập"
                onClick={() => setAuthModalOpen(true)}
              >
                <i className="fa-regular fa-user"></i>
              </button>
            )}

            {/* Giỏ hàng */}
            <Link to="/cart" className="icon-btn cart-btn" aria-label="Giỏ hàng">
              <i className="fa-solid fa-cart-shopping"></i><span className="cart-count">2</span>
            </Link>
          </div>

          {/* Toggle Menu Mobile */}
          <button className="menu-toggle" aria-label="Menu" onClick={() => setMobileMenuOpen(!mobileMenuOpen)}>
            <i className="fa-solid fa-bars"></i>
          </button>
        </div>
      </header>

      {/* Modals */}
      <AuthModal isOpen={authModalOpen} onClose={() => setAuthModalOpen(false)} />
      <UserProfileModal isOpen={profileOpen} onClose={() => setProfileOpen(false)} />
      <SettingsModal isOpen={settingsOpen} onClose={() => setSettingsOpen(false)} />
    </>
  );
};

export default Header;