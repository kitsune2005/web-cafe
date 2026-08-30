import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import './Dashboard.css';

const Dashboard = () => {
    const [orders, setOrders] = useState([]);
    const [totalCustomers, setTotalCustomers] = useState(0); 
    const navigate = useNavigate();

    // STATE CHO MODAL XEM CHI TIẾT
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedOrder, setSelectedOrder] = useState(null);

    useEffect(() => {
        // 1. RÚT DỮ LIỆU ĐƠN HÀNG
        const savedOrders = JSON.parse(localStorage.getItem('my_orders')) || [];
        setOrders(savedOrders);

        // 2. RÚT DỮ LIỆU SỐ LƯỢNG TÀI KHOẢN KHÁCH HÀNG TỪ SERVER
        const fetchCustomerCount = async () => {
            try {
                const response = await fetch('http://localhost:5000/api/users');
                if (response.ok) {
                    const data = await response.json();
                    // Lọc ra những người có role là 'customer' (tránh đếm nhầm Admin)
                    const customersOnly = data.filter(u => u.role === 'customer');
                    setTotalCustomers(customersOnly.length);
                }
            } catch (error) {
                console.error("Lỗi khi đếm số lượng khách hàng:", error);
            }
        };
        fetchCustomerCount();
    }, []);

    // ==========================================
    // TÍNH TOÁN DỮ LIỆU THẬT CHO CÁC THẺ
    // ==========================================
    
    // 👉 ĐÃ SỬA: Lọc riêng những đơn "Hoàn thành" (received)
    const completedOrders = orders.filter(o => o.status === 'received');
    
    // Doanh thu chỉ cộng tiền từ đơn Hoàn thành
    const totalRevenue = completedOrders.reduce((sum, order) => sum + order.total, 0);
    
    // Tổng số đơn thì vẫn đếm tất cả để biết lượng traffic
    const totalOrders = orders.length; 
    
    // 👉 ĐÃ SỬA: Sản phẩm bán ra chỉ đếm từ đơn Hoàn thành
    const totalProductsSold = completedOrders.reduce((total, order) => {
        if (!order.items) return total;
        const itemsInOrder = order.items.reduce((sum, item) => sum + item.quantity, 0);
        return total + itemsInOrder;
    }, 0);

    // 👉 ĐÃ SỬA: Lấy 4 đơn mới nhất cho bảng gọn gàng
    const recentOrders = orders.slice(0, 4);

    const formatPrice = (price) => new Intl.NumberFormat('vi-VN').format(price) + '₫';
    
    const formatDate = (timestamp) => {
        const d = new Date(timestamp);
        return d.toLocaleTimeString('vi-VN') + ' - ' + d.toLocaleDateString('vi-VN');
    };

    const renderStatus = (status) => {
        switch (status) {
            case 'pending': return <span className="status-badge pending">Chờ xử lý</span>;
            case 'delivering': return <span className="status-badge warning">Đang giao</span>;
            case 'arrived': return <span className="status-badge warning">Shipper tới</span>;
            case 'received': return <span className="status-badge success">Hoàn thành</span>;
            case 'not_received': 
            case 'cancelled': return <span className="status-badge danger">Đã hủy</span>;
            default: return <span className="status-badge pending">Chưa rõ</span>;
        }
    };

    const handleViewDetails = (order) => {
        setSelectedOrder(order);
        setIsModalOpen(true);
    };

    return (
        <div className="admin-dashboard-container">
            <div className="dashboard-header">
                <h2 className="dashboard-title">Tổng quan hệ thống</h2>
                <p className="dashboard-subtitle">Chào mừng Boss Kitsune quay trở lại! Hôm nay doanh thu rất tốt. ☕📈</p>
            </div>

            {/* TẦNG 1: 4 THẺ THỐNG KÊ */}
            <div className="dashboard-stats-grid">
                <div className="stat-card">
                    <div className="stat-icon income"><i className="fa-solid fa-sack-dollar"></i></div>
                    <div className="stat-info">
                        <h3>TỔNG DOANH THU</h3>
                        <div className="stat-value">{formatPrice(totalRevenue)}</div>
                        <div className="stat-trend positive"><i className="fa-solid fa-arrow-trend-up"></i> +15.5%</div>
                    </div>
                </div>
                <div className="stat-card">
                    <div className="stat-icon orders"><i className="fa-solid fa-cart-shopping"></i></div>
                    <div className="stat-info">
                        <h3>ĐƠN HÀNG MỚI</h3>
                        <div className="stat-value">{totalOrders}</div>
                        <div className="stat-trend positive"><i className="fa-solid fa-arrow-trend-up"></i> Tăng trưởng</div>
                    </div>
                </div>
                <div className="stat-card">
                    <div className="stat-icon customers"><i className="fa-solid fa-users"></i></div>
                    <div className="stat-info">
                        <h3>KHÁCH HÀNG</h3>
                        <div className="stat-value">{totalCustomers}</div>
                        <div className="stat-trend positive"><i className="fa-solid fa-arrow-trend-up"></i> Đăng ký mới</div>
                    </div>
                </div>
                <div className="stat-card">
                    <div className="stat-icon products"><i className="fa-solid fa-mug-hot"></i></div>
                    <div className="stat-info">
                        <h3>SẢN PHẨM BÁN RA</h3>
                        <div className="stat-value">{totalProductsSold}</div>
                        <div className="stat-trend positive"><i className="fa-solid fa-arrow-trend-up"></i> Tăng trưởng</div>
                    </div>
                </div>
            </div>

            {/* TẦNG 2: 2 BIỂU ĐỒ TRỰC QUAN */}
            <div className="dashboard-charts-grid">
                <div className="chart-box">
                    <div className="chart-header">
                        <h3>Doanh thu 7 ngày qua</h3>
                        <select className="chart-filter">
                            <option>Tuần này</option>
                            <option>Tuần trước</option>
                        </select>
                    </div>
                    <div className="chart-content bar-chart-wrapper">
                        <div className="y-axis">
                            <span>10M</span><span>7.5M</span><span>5M</span><span>2.5M</span><span>0M</span>
                        </div>
                        <div className="bars-container">
                            <div className="bar-group"><div className="bar" style={{height: '40%'}}></div><span>T2</span></div>
                            <div className="bar-group"><div className="bar" style={{height: '35%'}}></div><span>T3</span></div>
                            <div className="bar-group"><div className="bar" style={{height: '50%'}}></div><span>T4</span></div>
                            <div className="bar-group"><div className="bar" style={{height: '45%'}}></div><span>T5</span></div>
                            <div className="bar-group"><div className="bar" style={{height: '60%'}}></div><span>T6</span></div>
                            <div className="bar-group"><div className="bar" style={{height: '85%'}}></div><span>T7</span></div>
                            <div className="bar-group"><div className="bar" style={{height: '92%'}}></div><span>CN</span></div>
                        </div>
                    </div>
                </div>

                <div className="chart-box">
                    <div className="chart-header">
                        <h3>Cơ cấu danh mục</h3>
                    </div>
                    <div className="chart-content donut-chart-wrapper">
                        <div className="donut-chart"></div>
                        <div className="donut-legend">
                            <span><i className="fa-solid fa-circle" style={{color: '#d5c8b8'}}></i> Cà phê Bột</span>
                            <span><i className="fa-solid fa-circle" style={{color: '#6f4323'}}></i> Cà phê Hạt</span>
                            <span><i className="fa-solid fa-circle" style={{color: '#b23a2c'}}></i> Dụng cụ pha</span>
                            <span><i className="fa-solid fa-circle" style={{color: '#e0e0e0'}}></i> Khác</span>
                        </div>
                    </div>
                </div>
            </div>

            {/* TẦNG 3: BẢNG ĐƠN HÀNG THỰC TẾ */}
            <div className="dashboard-recent-orders">
                <div className="section-header">
                    <h3>Đơn hàng gần đây</h3>
                    <button className="view-all-btn" onClick={() => navigate('/admin/orders')}>Xem tất cả</button>
                </div>
                
                <div className="table-responsive">
                    <table className="admin-table">
                        <thead>
                            <tr>
                                <th>MÃ ĐƠN</th>
                                <th>KHÁCH HÀNG</th>
                                <th>TỔNG TIỀN</th>
                                <th>TRẠNG THÁI</th>
                                <th className="text-center" style={{textAlign: 'center'}}>HÀNH ĐỘNG</th>
                            </tr>
                        </thead>
                        <tbody>
                            {recentOrders.length === 0 ? (
                                <tr><td colSpan="5" style={{textAlign: 'center', padding: '30px', color: '#888'}}>Chưa có đơn hàng nào</td></tr>
                            ) : (
                                recentOrders.map(order => (
                                    <tr key={order.id}>
                                        <td className="fw-bold">{order.id}</td>
                                        <td>{order.customerName || 'Khách vãng lai'}</td>
                                        <td className="fw-bold text-brown">{formatPrice(order.total)}</td>
                                        <td>{renderStatus(order.status)}</td>
                                        <td style={{textAlign: 'center'}}>
                                            <button className="action-btn view" title="Xem chi tiết" onClick={() => handleViewDetails(order)}>
                                                <i className="fa-solid fa-eye"></i>
                                            </button>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* MODAL HIỂN THỊ CHI TIẾT ĐƠN HÀNG */}
            {isModalOpen && selectedOrder && (
                <div className="story-modal-overlay">
                    <div className="story-modal" style={{ width: '650px', paddingBottom: '0' }}>
                        <div className="modal-header">
                            <h3>Mã đơn: {selectedOrder.id}</h3>
                            <button className="btn-close" onClick={() => setIsModalOpen(false)}>
                                <i className="fa-solid fa-xmark"></i>
                            </button>
                        </div>
                        
                        <div className="modal-body" style={{ maxHeight: '60vh', overflowY: 'auto' }}>
                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', marginBottom: '25px', backgroundColor: '#f8f9fa', padding: '15px', borderRadius: '8px' }}>
                                <div>
                                    <p style={{marginBottom: '8px'}}><strong><i className="fa-regular fa-user"></i> Khách hàng:</strong> {selectedOrder.customerName || 'Khách vãng lai'}</p>
                                    <p style={{marginBottom: '8px'}}><strong><i className="fa-solid fa-phone"></i> Số ĐT:</strong> {selectedOrder.phone || 'Không có'}</p>
                                    <p style={{marginBottom: '8px'}}><strong><i className="fa-solid fa-location-dot"></i> Địa chỉ:</strong> {selectedOrder.address || 'Không có'}</p>
                                </div>
                                <div>
                                    <p style={{marginBottom: '8px'}}><strong><i className="fa-regular fa-clock"></i> Ngày đặt:</strong> {formatDate(selectedOrder.createdAt)}</p>
                                    <p style={{marginBottom: '8px'}}><strong><i className="fa-solid fa-wallet"></i> Thanh toán:</strong> {selectedOrder.paymentMethod || 'Tiền mặt'}</p>
                                    <p style={{marginBottom: '8px'}}><strong><i className="fa-solid fa-truck-fast"></i> Trạng thái:</strong> {renderStatus(selectedOrder.status)}</p>
                                </div>
                            </div>

                            <h4 style={{ marginBottom: '10px', color: '#382212' }}>Sản phẩm đã đặt</h4>
                            <table className="admin-table">
                                <thead>
                                    <tr>
                                        <th>SẢN PHẨM</th>
                                        <th style={{textAlign: 'center'}}>SL</th>
                                        <th style={{textAlign: 'right'}}>ĐƠN GIÁ</th>
                                        <th style={{textAlign: 'right'}}>TẠM TÍNH</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {selectedOrder.items?.map((item, idx) => (
                                        <tr key={idx}>
                                            <td>{item.name}</td>
                                            <td style={{textAlign: 'center'}}>x{item.quantity}</td>
                                            <td style={{textAlign: 'right'}}>{formatPrice(item.price)}</td>
                                            <td style={{textAlign: 'right', fontWeight: 'bold'}}>{formatPrice(item.price * item.quantity)}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                            
                            <div style={{ textAlign: 'right', marginTop: '20px', paddingTop: '15px', borderTop: '1px dashed #ddd', fontSize: '18px' }}>
                                <span>Tổng cộng: </span>
                                <strong className="text-brown" style={{ fontSize: '24px' }}>{formatPrice(selectedOrder.total)}</strong>
                            </div>
                        </div>
                        
                        <div className="modal-footer" style={{ marginTop: '0' }}>
                            <button className="btn-cancel" onClick={() => setIsModalOpen(false)}>Đóng</button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Dashboard;