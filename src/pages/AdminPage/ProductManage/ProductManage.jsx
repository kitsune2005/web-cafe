import React from 'react';
import './ProductManage.css';

const ProductManage = () => {
  // Dữ liệu mẫu giống trong ảnh thiết kế
  const menuList = [
    { id: 1, name: 'Salad cá hồi', category: 'Food/Noodle', img: 'https://images.unsplash.com/photo-1512621776951-a57141f2eefd?w=200&h=200&fit=crop' },
    { id: 2, name: 'Cá hồi áp chảo', category: 'Food/Noodle', img: 'https://images.unsplash.com/photo-1467003909585-2f8a72700288?w=200&h=200&fit=crop' },
    { id: 3, name: 'Mỳ ý', category: 'Food/Noodle', img: 'https://images.unsplash.com/photo-1621996311227-2e4d9ea7c897?w=200&h=200&fit=crop' },
    { id: 4, name: 'Salad ức gà', category: 'Food/Healthy', img: 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=200&h=200&fit=crop' },
    { id: 5, name: 'Bò bít tết', category: 'Food/Meat', img: 'https://images.unsplash.com/photo-1600891964092-4316c288032e?w=200&h=200&fit=crop' },
    { id: 6, name: 'Mỳ xào hải sản', category: 'Food/Noodle', img: 'https://images.unsplash.com/photo-1585032226651-759b368d7246?w=200&h=200&fit=crop' },
  ];

  return (
    <div className="product-manage-page">
      
      {/* KHU VỰC BÊN TRÁI: DANH SÁCH SẢN PHẨM */}
      <div className="product-list-section">
        <div className="page-header">
          <h3>Menu List</h3>
          <div className="breadcrumb">
            <i className="fa-solid fa-house"></i> Home 
            <i className="fa-solid fa-chevron-right"></i> Menu 
            <i className="fa-solid fa-chevron-right"></i> Menu list
          </div>
        </div>

        <div className="product-grid">
          {menuList.map(item => (
            <div className="admin-pro-card" key={item.id}>
              <img src={item.img} alt={item.name} className="admin-pro-img" />
              <h4 className="admin-pro-title">{item.name}</h4>
              <p className="admin-pro-cat">{item.category}</p>
              
              <div className="admin-pro-actions">
                <button className="action-dot-btn btn-view" title="View"><i className="fa-regular fa-eye"></i></button>
                <button className="action-dot-btn btn-edit" title="Edit"><i className="fa-solid fa-pen-to-square"></i></button>
                <button className="action-dot-btn btn-del" title="Delete"><i className="fa-regular fa-trash-can"></i></button>
                <button className="action-dot-btn btn-dup" title="Duplicate"><i className="fa-regular fa-copy"></i></button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* KHU VỰC BÊN PHẢI: THỐNG KÊ (DASHBOARD MINI) */}
      <div className="product-stats-section">
        
        {/* Card 1: Tổng doanh thu */}
        <div className="stat-card">
          <div className="stat-title">Tổng doanh thu</div>
          <div className="stat-value val-green">500,000 VNĐ</div>
          <div className="stat-chart-mock" style={{ backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 30' preserveAspectRatio='none'%3E%3Cpath d='M0,30 L10,25 L30,28 L50,15 L70,20 L90,5 L100,10' fill='none' stroke='%2320c997' stroke-width='2'/%3E%3C/svg%3E")` }}></div>
          <div className="stat-footer" style={{justifyContent: 'flex-end'}}>
            <a href="#report" className="stat-link" style={{color: '#20c997'}}>View Report</a>
          </div>
        </div>

        {/* Card 2: Tổng số lượt truy cập */}
        <div className="stat-card">
          <div className="stat-title">Tổng số lượt truy cập</div>
          <div className="stat-value val-orange">326</div>
          <div className="stat-chart-mock" style={{ backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 30' preserveAspectRatio='none'%3E%3Cpath d='M0,25 L20,20 L40,28 L60,10 L80,18 L100,5' fill='none' stroke='%23ff6b6b' stroke-width='2'/%3E%3C/svg%3E")` }}></div>
          <div className="stat-footer">
            <div className="stat-badges">
              <span className="stat-badge badge-live">Live</span>
              <span className="stat-badge badge-visitors">4 Visitors</span>
            </div>
            <a href="#live" className="stat-link" style={{color: '#20c997'}}>See Live View</a>
          </div>
        </div>

        {/* Card 3: Tỷ lệ khách hàng */}
        <div className="stat-card">
          <div className="stat-title">Tỷ lệ khách hàng</div>
          <div className="stat-value val-dark">5.22 %</div>
          <div className="stat-chart-mock" style={{ backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 30' preserveAspectRatio='none'%3E%3Cpath d='M0,30 L20,28 L40,20 L60,25 L80,10 L100,15 L100,30 L0,30 Z' fill='%23ffe3e3' stroke='%23ff6b6b' stroke-width='1'/%3E%3C/svg%3E")` }}></div>
        </div>

      </div>

    </div>
  );
};

export default ProductManage;