import React from 'react';
import { useHeaderLogic } from './useHeaderLogic.js';
import AuthModal from '../AuthModal/AuthModal'; 
import UserProfileModal from '../UserProfileModal/UserProfileModal';
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

  if (loading) return null;

  return (
    <>
      <header className={`site-header ${scrolled ? 'scrolled' : ''}`}>
        <div className="container header-inner">
          
          {/* Menu Desktop */}
          <nav className={`main-nav ${mobileMenuOpen ? 'open' : ''}`} ref={navRef}>
            <ul>
              {menuItems.map((item, index) => (
                <li key={index} className={item.dropdown ? 'has-dropdown' : ''}>
                  <a 
                    href={item.link} 
                    onClick={() => setNavDropdown(item.dropdown ? item.label : null)}
                  >
                    {item.label}
                  </a>
                  {item.dropdown && navDropdown === item.label && (
                    <ul className="nav-dropdown">
                      {item.dropdown.map((sub, subIndex) => (
                        <li key={subIndex}>
                          <a href={sub.link}>{sub.label}</a>
                        </li>
                      ))}
                    </ul>
                  )}
                </li>
              ))}
            </ul>
          </nav>

          {/* Logo */}
          <a href="#" className="logo">
            <img src="./src/img/logo_fox_coffee.png" alt="Logo" />
          </a>

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
                      <a href="#"><span className="tag-icon"><i className="fa-solid fa-magnifying-glass"></i></span>Cà phê</a>
                      <a href="#"><span className="tag-icon"><i className="fa-solid fa-magnifying-glass"></i></span>Nguyên chất</a>
                      <a href="#"><span className="tag-icon"><i className="fa-solid fa-magnifying-glass"></i></span>Rang xay</a>
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
                          <a href="#" className="search-result-name">Cà Phê Enchanted Espresso</a>
                          <span className="search-result-price">2,679,000₫</span>
                        </div>
                      </li>
                      <li>
                        <div className="search-result-thumb">
                          <img src="https://cafengon.monamedia.net/wp-content/uploads/2024/12/san-pham-2-191x300.png" alt="" />
                        </div>
                        <div className="search-result-info">
                          <a href="#" className="search-result-name">Cà Phê Emerald Burst</a>
                          <span className="search-result-price">2,119,000₫</span>
                        </div>
                      </li>
                    </ul>
                  </div>
                </div>
              )}
            </div>

            {/* Yêu thích */}
            <a href="#" className="icon-btn" aria-label="Yêu thích"><i className="fa-regular fa-heart"></i></a>

            {/* User Dropdown / Auth Button */}
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
                      <span className="user-avatar">{currentUser.name.charAt(0).toUpperCase()}</span>
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

                    <a href="#" className="user-dropdown-item">
                      <i className="fa-solid fa-box"></i> Đơn hàng
                    </a>
                    <a href="#" className="user-dropdown-item">
                      <i className="fa-solid fa-gear"></i> Cài đặt
                    </a>
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
            <a href="#" className="icon-btn cart-btn" aria-label="Giỏ hàng">
              <i className="fa-solid fa-cart-shopping"></i><span className="cart-count">2</span>
            </a>
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
    </>
  );
};

export default Header;