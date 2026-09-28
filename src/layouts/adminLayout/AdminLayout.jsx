import React, { useState, useEffect, useRef } from 'react';
import { NavLink, Outlet, useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useProduct } from '../../context/ProductContext';
import Swal from 'sweetalert2';
import './AdminLayout.css';

const AdminLayout = () => {
  const { currentUser, logout } = useAuth();
  const navigate = useNavigate();
  const { products } = useProduct();

  const [alerts, setAlerts] = useState([]);
  const [dismissedAlerts, setDismissedAlerts] = useState([]); 
  const [isAlertOpen, setIsAlertOpen] = useState(false);
  const alertRef = useRef(null);

  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  const isFirstScan = useRef(true);
  const knownData = useRef({ users: 0, contacts: 0, problemIds: [] });

  const fireImmediateProblemAlert = (order) => {
    const isCancel = String(order.status).toLowerCase().includes('hủy') || order.status === 'cancelled';
    const titleStatus = isCancel ? 'ĐƠN HÀNG BỊ HỦY' : 'SỰ CỐ GIAO HÀNG';
    const colorStatus = '#fa5252';

    const itemsHtml = order.items?.map(i => `<li style="margin-bottom:5px">${i.name} <b style="color:${colorStatus}">x${i.quantity}</b></li>`).join('') || 'Không có chi tiết';

    Swal.fire({
      title: `🚨 ${titleStatus}!`,
      html: `
        <div style="text-align: left; padding: 15px; font-size: 14px; background: #fff5f5; border: 1px dashed ${colorStatus}; border-radius: 8px;">
          <p style="margin: 0 0 8px;"><b>Mã đơn:</b> <strong>${order.id}</strong></p>
          <p style="margin: 0 0 8px;"><b>Trạng thái:</b> <span style="color:${colorStatus}; font-weight:bold;">${isCancel ? 'Đã hủy' : 'Khách chưa nhận được hàng'}</span></p>
          <p style="margin: 0 0 8px;"><b>Khách hàng:</b> <strong>${order.displayCustomerName || 'Khách vãng lai'}</strong></p>
          <p style="margin: 0 0 8px;"><b>Ngày đặt:</b> ${new Date(order.createdAt).toLocaleString('vi-VN')}</p>
          <p style="margin: 0 0 8px;"><b>Chi tiết món:</b></p>
          <ul style="padding-left: 20px; margin: 0 0 15px;">${itemsHtml}</ul>
          <hr style="border-top: 1px dashed ${colorStatus}; margin: 15px 0;"/>
          <h3 style="color: ${colorStatus}; text-align: right; margin: 0;">Tổng hóa đơn: ${order.total?.toLocaleString('vi-VN')}₫</h3>
        </div>
      `,
      icon: 'error',
      confirmButtonColor: colorStatus,
      confirmButtonText: 'Đã tiếp nhận'
    });
  };

  useEffect(() => {
    const fetchSafe = async (url) => {
      try {
        const res = await fetch(url);
        if (res.ok) return await res.json();
        return [];
      } catch (error) {
        return [];
      }
    };

    const scanSystem = async () => {
      let currentIssues = [];

      const apiOrders = await fetchSafe('http://localhost:5000/orders');
      const allUsers = await fetchSafe('http://localhost:5000/users');
      const allContacts = await fetchSafe('http://localhost:5000/contacts');

      const localMyOrders = JSON.parse(localStorage.getItem('my_orders')) || [];
      const localOrders = JSON.parse(localStorage.getItem('orders')) || [];
      
      const combinedOrders = [...apiOrders, ...localOrders, ...localMyOrders];
      const uniqueOrdersMap = new Map();
      combinedOrders.forEach(o => uniqueOrdersMap.set(o.id, o)); 
      const finalOrders = Array.from(uniqueOrdersMap.values());

      const isProblemOrder = (status) => {
        if(!status) return false;
        const s = String(status).toLowerCase();
        return s === 'not_received' || s === 'cancelled' || s.includes('hủy') || s.includes('lỗi');
      };

      const getCustomerName = (order) => {
        if (order.customerName) return order.customerName; 
        if (order.shipping && order.shipping.name) return order.shipping.name; 
        
        const matchedUser = allUsers.find(u => String(u.id) === String(order.customerId));
        if (matchedUser && matchedUser.name) return matchedUser.name;
        if (matchedUser && matchedUser.email) return matchedUser.email; 
        
        return `Tài khoản (ID: ${order.customerId || 'Ẩn'})`;
      };

      if (isFirstScan.current) {
        knownData.current.users = allUsers.length;
        knownData.current.contacts = allContacts.length;
        knownData.current.problemIds = finalOrders.filter(o => isProblemOrder(o.status)).map(o => o.id);
        isFirstScan.current = false;
      } else {
        if (allUsers.length > knownData.current.users) knownData.current.users = allUsers.length;
        if (allContacts.length > knownData.current.contacts) knownData.current.contacts = allContacts.length;
        
        const currentProblems = finalOrders.filter(o => isProblemOrder(o.status));
        currentProblems.forEach(o => {
          if (!knownData.current.problemIds.includes(o.id)) {
            knownData.current.problemIds.push(o.id);
            const enrichedOrder = { ...o, displayCustomerName: getCustomerName(o) };
            fireImmediateProblemAlert(enrichedOrder); 
          }
        });
      }

      const problemOrdersList = finalOrders.filter(o => isProblemOrder(o.status));
      problemOrdersList.forEach(order => {
        const isCancel = String(order.status).toLowerCase().includes('hủy') || order.status === 'cancelled';
        currentIssues.push({
          id: `order_${order.id}`,
          type: isCancel ? 'cancel' : 'report',
          title: isCancel ? 'Đơn hàng bị hủy' : 'Khách báo chưa nhận hàng!',
          desc: `Mã đơn: ${order.id}`,
          link: '/admin/orders',
          searchText: order.id, 
          time: new Date(order.createdAt || Date.now()).toLocaleTimeString('vi-VN'),
          orderData: { ...order, displayCustomerName: getCustomerName(order) } 
        });
      });

      if (allUsers.length > 0) {
          const latestUser = allUsers[allUsers.length - 1];
          currentIssues.push({ 
              id: `user_${latestUser.id}`, type: 'low_stock', 
              title: '🎉 Có tài khoản mới', desc: latestUser.email || latestUser.name || 'Người dùng mới', 
              link: '/admin/customers', searchText: latestUser.email || latestUser.name, time: 'Mới cập nhật' 
          });
      }
      
      if (allContacts.length > 0) {
          const latestContact = allContacts[allContacts.length - 1];
          currentIssues.push({ 
              id: `contact_${latestContact.id}`, type: 'low_stock', 
              title: '📩 Có người gửi liên hệ', desc: latestContact.email || latestContact.name || 'Tin nhắn mới', 
              link: '/admin/contacts', searchText: latestContact.email || latestContact.name, time: 'Mới cập nhật' 
          });
      }

      if (products && products.length > 0) {
        products.forEach(prod => {
          if (prod.stock <= 0) {
            currentIssues.push({
              id: `stock_out_${prod.id}`, type: 'out_of_stock',
              title: 'SẢN PHẨM ĐÃ HẾT HÀNG', desc: `${prod.name}`,
              link: '/admin/products', searchText: prod.name, time: 'Cảnh báo kho'
            });
          } else if (prod.stock <= 5) {
            currentIssues.push({
              id: `stock_low_${prod.id}`, type: 'low_stock',
              title: `Sắp hết hàng (còn ${prod.stock})`, desc: `${prod.name}`,
              link: '/admin/products', searchText: prod.name, time: 'Cảnh báo kho'
            });
          }
        });
      }

      const finalAlerts = currentIssues.filter(issue => !dismissedAlerts.includes(issue.id));
      setAlerts(finalAlerts);
    };

    scanSystem(); 
    const interval = setInterval(scanSystem, 5000); 
    return () => clearInterval(interval);
  }, [products, dismissedAlerts]);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (alertRef.current && !alertRef.current.contains(event.target)) {
        setIsAlertOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

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
        navigate('/'); 
      }
    });
  };

  const handleAlertClick = (alert) => {
    setDismissedAlerts(prev => [...prev, alert.id]);
    setIsAlertOpen(false);

    if (alert.type === 'cancel' || alert.type === 'report') {
      const order = alert.orderData;
      const colorStatus = alert.type === 'cancel' ? '#868e96' : '#fa5252';
      const itemsHtml = order.items?.map(i => `<li style="margin-bottom:5px">${i.name} <b style="color:${colorStatus}">x${i.quantity}</b></li>`).join('') || 'Không có chi tiết';

      Swal.fire({
        title: `Chi tiết đơn: ${order.id}`,
        html: `
          <div style="text-align: left; padding: 15px; font-size: 14px; background: #fff; border: 1px dashed ${colorStatus}; border-radius: 8px;">
            <p style="margin: 0 0 8px;"><b>Trạng thái:</b> <span style="color:${colorStatus}; font-weight:bold;">${alert.title}</span></p>
            <p style="margin: 0 0 8px;"><b>Khách hàng:</b> <strong>${order.displayCustomerName || 'Khách vãng lai'}</strong></p>
            <p style="margin: 0 0 8px;"><b>Ngày đặt:</b> ${new Date(order.createdAt).toLocaleString('vi-VN')}</p>
            <p style="margin: 0 0 8px;"><b>Chi tiết món:</b></p>
            <ul style="padding-left: 20px; margin: 0 0 15px;">${itemsHtml}</ul>
            <hr style="border-top: 1px dashed ${colorStatus}; margin: 15px 0;"/>
            <h3 style="color: ${colorStatus}; text-align: right; margin: 0;">Tổng: ${order.total?.toLocaleString('vi-VN')}₫</h3>
          </div>
        `,
        icon: alert.type === 'cancel' ? 'info' : 'warning',
        confirmButtonColor: '#6f4323',
        confirmButtonText: 'Đã xem'
      });
      return; 
    }

    navigate(alert.link);

    setTimeout(() => {
      if (!alert.searchText) return;
      
      const walker = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT, null, false);
      let foundNode = null;
      let node; 
      
      while ((node = walker.nextNode())) {
        if (node.nodeValue.toLowerCase().includes(alert.searchText.toString().toLowerCase())) {
          foundNode = node;
          break;
        }
      }

      if (foundNode) {
        let parent = foundNode.parentElement;
        while (parent && parent.tagName !== 'TR' && parent.tagName !== 'LI' && !parent.className.includes('card') && parent.tagName !== 'BODY') {
          parent = parent.parentElement;
        }

        if (parent && parent.tagName !== 'BODY') {
          const originalBg = parent.style.backgroundColor;
          const originalBorder = parent.style.border;
          
          parent.style.transition = 'all 0.5s ease-in-out';
          parent.style.backgroundColor = '#ffe3e3';
          parent.style.border = '2px solid #fa5252';
          
          parent.scrollIntoView({ behavior: 'smooth', block: 'center' });

          setTimeout(() => {
            parent.style.backgroundColor = originalBg;
            parent.style.border = originalBorder;
          }, 5000);
        }
      }
    }, 800); 
  };

  return (
    <div className="admin-container">
      
      {isSidebarOpen && (
        <div className="admin-sidebar-overlay" onClick={() => setIsSidebarOpen(false)}></div>
      )}

      <aside className={`admin-sidebar ${isSidebarOpen ? 'open' : ''}`}>
        <div className="admin-sidebar-header">
          <i className="fa-solid fa-mug-hot" style={{ color: '#ff6b6b', fontSize: '24px' }}></i>
          <h2>AdminPanel</h2>
        </div>
        
        <nav className="admin-sidebar-menu">
          <NavLink to="/admin/dashboard" onClick={() => setIsSidebarOpen(false)} className={({isActive}) => `admin-menu-item ${isActive ? 'active' : ''}`}>
            <i className="fa-solid fa-house"></i> Dashboard
          </NavLink>
          <NavLink to="/admin/orders" onClick={() => setIsSidebarOpen(false)} className={({isActive}) => `admin-menu-item ${isActive ? 'active' : ''}`}>
            <i className="fa-solid fa-clipboard-list"></i> Order
          </NavLink>
          <NavLink to="/admin/products" onClick={() => setIsSidebarOpen(false)} className={({isActive}) => `admin-menu-item ${isActive ? 'active' : ''}`}>
            <i className="fa-solid fa-utensils"></i> Menus
          </NavLink>
          <NavLink to="/admin/news" onClick={() => setIsSidebarOpen(false)} className={({isActive}) => `admin-menu-item ${isActive ? 'active' : ''}`}>
            <i className="fa-regular fa-newspaper"></i>Tin tức
          </NavLink>
          <NavLink to="/admin/contacts" onClick={() => setIsSidebarOpen(false)} className={({isActive}) => `admin-menu-item ${isActive ? 'active' : ''}`}>
            <i className="fa-regular fa-envelope"></i>Liên hệ
          </NavLink>
          <NavLink to="/admin/customers" onClick={() => setIsSidebarOpen(false)} className={({isActive}) => `admin-menu-item ${isActive ? 'active' : ''}`}>
            <i className="fa-solid fa-users"></i> Customer
          </NavLink>
          <NavLink to="/admin/product-story" onClick={() => setIsSidebarOpen(false)} className={({isActive}) => `admin-menu-item ${isActive ? 'active' : ''}`}>
            <i className="fa-solid fa-book-open"></i> Tiểu sử sản phẩm
          </NavLink>
        </nav>

        <div style={{ padding: '20px', marginTop: 'auto' }}>
          <button 
            onClick={handleLogout}
            style={{ width: '100%', padding: '12px', background: '#ffe3e3', color: '#ff4d4f', border: 'none', borderRadius: '8px', fontWeight: 'bold', cursor: 'pointer' }}
          >
            <i className="fa-solid fa-right-from-bracket"></i> Đăng xuất
          </button>
        </div>
      </aside>

      <main className="admin-main">
        
        <header className="admin-header">
          
          <div className="admin-header-left">
            <button className="mobile-menu-btn" onClick={() => setIsSidebarOpen(true)}>
              <i className="fa-solid fa-bars"></i>
            </button>
          </div>

          <div className="admin-header-actions">
            <div className="alert-bell-wrapper" ref={alertRef}>
              <button 
                  className={`admin-icon-btn btn-noti ${alerts.length > 0 ? 'has-alert' : ''}`}
                  onClick={() => setIsAlertOpen(!isAlertOpen)}
              >
                  <i className={alerts.length > 0 ? "fa-solid fa-bell fa-shake" : "fa-regular fa-bell"}></i>
                  {alerts.length > 0 && <span className="alert-badge">{alerts.length}</span>}
              </button>

              {isAlertOpen && (
                  <div className="alert-dropdown">
                      <div className="alert-dropdown-header">
                          <h4>Cảnh báo hệ thống</h4>
                          <span className="alert-count">{alerts.length} vấn đề</span>
                      </div>
                      
                      <div className="alert-list">
                          {alerts.length === 0 ? (
                              <div className="alert-empty">Hệ thống đang hoạt động ổn định.</div>
                          ) : (
                              alerts.map(alert => (
                                  <div 
                                      className={`alert-item ${alert.type}`} 
                                      key={alert.id} 
                                      onClick={() => handleAlertClick(alert)}
                                      style={{ cursor: 'pointer' }}
                                  >
                                      <div className="alert-icon">
                                          {alert.type === 'report' && <i className="fa-solid fa-triangle-exclamation"></i>}
                                          {alert.type === 'cancel' && <i className="fa-solid fa-ban"></i>}
                                          {alert.type === 'out_of_stock' && <i className="fa-solid fa-box-open"></i>}
                                          {alert.type === 'low_stock' && <i className="fa-solid fa-boxes-stacked"></i>}
                                      </div>
                                      <div className="alert-info">
                                          <p className="alert-title">{alert.title}</p>
                                          <p className="alert-desc">{alert.desc}</p>
                                      </div>
                                      <span className="alert-time">{alert.time}</span>
                                  </div>
                              ))
                          )}
                      </div>
                  </div>
              )}
            </div>
            
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginLeft: '15px' }}>
              <img 
                src={currentUser?.avatar || "https://ui-avatars.com/api/?name=Admin"} 
                alt="Admin" 
                style={{ width: '40px', height: '40px', borderRadius: '50%', objectFit: 'cover' }}
              />
            </div>
          </div>
        </header>

        <div className="admin-content">
          <Outlet /> 
        </div>

      </main>
    </div>
  );
};

export default AdminLayout;