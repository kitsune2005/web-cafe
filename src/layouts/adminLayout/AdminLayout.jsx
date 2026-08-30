import React from 'react';
import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import Swal from 'sweetalert2';
import './AdminLayout.css';

const AdminLayout = () => {
  const { currentUser, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    Swal.fire({
      title: 'Đăng xuất?',
      text: 'Bạn có chắc muốn thoát khỏi trang quản trị?',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#ff6b6b',
      cancelButtonColor: '#888',
      confirmButtonText: 'Đăng xuất'
    }).then((result) => {
      if (result.isConfirmed) {
        logout();
        navigate('/'); // Đẩy về trang chủ Client
      }
    });
  };

  return (
    <div className="admin-container">
      
      {/* SIDEBAR BÊN TRÁI */}
      <aside className="admin-sidebar">
        <div className="admin-sidebar-header">
          <i className="fa-solid fa-mug-hot" style={{ color: '#ff6b6b', fontSize: '24px' }}></i>
          <h2>AdminPanel</h2>
        </div>
        
        <nav className="admin-sidebar-menu">
          <NavLink to="/admin/dashboard" className={({isActive}) => `admin-menu-item ${isActive ? 'active' : ''}`}>
            <i className="fa-solid fa-house"></i> Dashboard
          </NavLink>
          
          <NavLink to="/admin/orders" className={({isActive}) => `admin-menu-item ${isActive ? 'active' : ''}`}>
            <i className="fa-solid fa-clipboard-list"></i> Order
          </NavLink>
          
          <NavLink to="/admin/products" className={({isActive}) => `admin-menu-item ${isActive ? 'active' : ''}`}>
            <i className="fa-solid fa-utensils"></i> Menus
          </NavLink>
          
          <NavLink to="/admin/customers" className={({isActive}) => `admin-menu-item ${isActive ? 'active' : ''}`}>
            <i className="fa-solid fa-users"></i> Customer
          </NavLink>
          
          {/* 👉 ĐÃ SỬA: Đổi link thành /admin/product-story và icon quyển sách */}
          <NavLink to="/admin/product-story" className={({isActive}) => `admin-menu-item ${isActive ? 'active' : ''}`}>
            <i className="fa-solid fa-book-open"></i> Tiểu sử sản phẩm
          </NavLink>
        </nav>

        {/* Nút đăng xuất góc dưới */}
        <div style={{ padding: '20px', marginTop: 'auto' }}>
          <button 
            onClick={handleLogout}
            style={{ width: '100%', padding: '12px', background: '#ffe3e3', color: '#ff4d4f', border: 'none', borderRadius: '8px', fontWeight: 'bold', cursor: 'pointer' }}
          >
            <i className="fa-solid fa-right-from-bracket"></i> Đăng xuất
          </button>
        </div>
      </aside>

      {/* KHU VỰC BÊN PHẢI */}
      <main className="admin-main">
        
        {/* HEADER ADMIN */}
        <header className="admin-header">
          <div className="admin-header-search">
            <i className="fa-solid fa-magnifying-glass" style={{ color: '#888' }}></i>
            <input type="text" placeholder="Search..." />
          </div>

          <div className="admin-header-actions">
            <button className="admin-icon-btn btn-expand"><i className="fa-solid fa-expand"></i></button>
            <button className="admin-icon-btn btn-noti"><i className="fa-regular fa-bell"></i></button>
            <button className="admin-icon-btn btn-mail"><i className="fa-regular fa-envelope"></i></button>
            <button className="admin-icon-btn btn-setting"><i className="fa-solid fa-gear"></i></button>
            
            {/* Avatar Admin */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginLeft: '15px' }}>
              <img 
                src={currentUser?.avatar || "https://ui-avatars.com/api/?name=Admin"} 
                alt="Admin" 
                style={{ width: '40px', height: '40px', borderRadius: '50%', objectFit: 'cover' }}
              />
            </div>
          </div>
        </header>

        {/* NỘI DUNG CHÍNH (Được Inject từ Router) */}
        <div className="admin-content">
          <Outlet /> {/* Các trang Dashboard, Orders, Products sẽ hiển thị ở đây */}
        </div>

      </main>
    </div>
  );
};

export default AdminLayout;