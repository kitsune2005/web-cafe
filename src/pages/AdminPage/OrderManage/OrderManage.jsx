import React, { useState, useEffect } from 'react';
import '../Dashboard/Dashboard.css'; // Tận dụng lại CSS xịn xò của Dashboard

const OrderManage = () => {
    const [orders, setOrders] = useState([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [statusFilter, setStatusFilter] = useState('all');

    // STATE CHO MODAL XEM CHI TIẾT
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedOrder, setSelectedOrder] = useState(null);

    useEffect(() => {
        // Rút dữ liệu thật từ kho chung
        const savedOrders = JSON.parse(localStorage.getItem('my_orders')) || [];
        // Lấy danh sách và sắp xếp đơn mới nhất lên đầu
        setOrders(savedOrders.sort((a, b) => b.createdAt - a.createdAt));
    }, []);

    const formatPrice = (price) => new Intl.NumberFormat('vi-VN').format(price) + '₫';
    
    const formatDate = (timestamp) => {
        const d = new Date(timestamp);
        return d.toLocaleTimeString('vi-VN') + ' - ' + d.toLocaleDateString('vi-VN');
    };

    const renderStatusBadge = (status) => {
        switch (status) {
            case 'pending': return <span className="status-badge pending">Chờ xử lý</span>;
            case 'delivering': return <span className="status-badge warning">Đang giao</span>;
            case 'arrived': return <span className="status-badge warning">Shipper tới</span>;
            case 'received': return <span className="status-badge success">Hoàn thành</span>;
            case 'not_received': 
            case 'cancelled': return <span className="status-badge danger">Đã hủy / Lỗi</span>;
            default: return <span className="status-badge pending">Chưa rõ</span>;
        }
    };

    const handleViewDetails = (order) => {
        setSelectedOrder(order);
        setIsModalOpen(true);
    };

    // Bộ lọc kép: Tìm kiếm chuỗi + Lọc trạng thái
    const filteredOrders = orders.filter(o => {
        const matchSearch = o.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
                            (o.customerName && o.customerName.toLowerCase().includes(searchTerm.toLowerCase()));
        const matchStatus = statusFilter === 'all' || o.status === statusFilter;
        return matchSearch && matchStatus;
    });

    return (
        <div className="admin-dashboard-container">
            <div className="dashboard-header">
                <h2 className="dashboard-title">Quản lý Đơn hàng</h2>
                <p className="dashboard-subtitle">Theo dõi trạng thái giao hàng và doanh thu từ khách.</p>
            </div>

            <div className="dashboard-recent-orders">
                
                {/*   ĐÃ FIX: Bỏ class section-header để né đụng độ CSS. Dùng Flex hiện đại */}
                <div style={{ marginBottom: '1.5rem', display: 'flex', gap: '1rem', flexWrap: 'wrap', width: '100%' }}>
                    
                    {/* Ô Search: Dùng min() để tự co giãn, minWidth: 0 để cấm trào viền */}
                    <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center', background: '#fff', border: '1px solid #ddd', padding: '0.75rem 1rem', borderRadius: '0.5rem', flex: '1 1 min(100%, 25rem)' }}>
                        <i className="fa-solid fa-magnifying-glass" style={{ color: '#888' }}></i>
                        <input 
                            type="text" 
                            placeholder="Tìm theo mã đơn, tên khách hàng..." 
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            style={{ border: 'none', outline: 'none', width: '100%', fontSize: '0.875rem', minWidth: 0 }}
                        />
                    </div>

                    {/* Ô Dropdown: flex 1 1 12rem để tự động rớt dòng khi bị chật */}
                    <select 
                        value={statusFilter} 
                        onChange={(e) => setStatusFilter(e.target.value)}
                        style={{ padding: '0.75rem 1rem', border: '1px solid #ddd', borderRadius: '0.5rem', outline: 'none', color: '#555', fontWeight: '600', cursor: 'pointer', flex: '1 1 12rem', backgroundColor: '#fff', fontSize: '0.875rem' }}
                    >
                        <option value="all">Tất cả trạng thái</option>
                        <option value="pending">Chờ xử lý</option>
                        <option value="delivering">Đang giao</option>
                        <option value="arrived">Shipper tới</option>
                        <option value="received">Hoàn thành</option>
                        <option value="not_received">Đã hủy / Lỗi</option>
                    </select>
                </div>
                
                {/* BẢNG DANH SÁCH ĐƠN HÀNG */}
                <div className="table-responsive">
                    <table className="admin-table">
                        <thead>
                            <tr>
                                <th>MÃ ĐƠN</th>
                                <th>KHÁCH HÀNG</th>
                                <th>NGÀY ĐẶT</th>
                                <th>THANH TOÁN</th>
                                <th>TỔNG TIỀN</th>
                                <th>TRẠNG THÁI</th>
                                <th className="text-center" style={{textAlign: 'center'}}>CHI TIẾT</th>
                            </tr>
                        </thead>
                        <tbody>
                            {filteredOrders.length === 0 ? (
                                <tr><td colSpan="7" style={{textAlign: 'center', padding: '2rem', color: '#888'}}>Không tìm thấy đơn hàng nào!</td></tr>
                            ) : (
                                filteredOrders.map(order => (
                                    <tr key={order.id}>
                                        <td className="fw-bold">{order.id}</td>
                                        <td>{order.customerName || 'Khách vãng lai'}</td>
                                        <td style={{fontSize: '0.8125rem', color: '#666'}}>{formatDate(order.createdAt)}</td>
                                        <td>{order.paymentMethod || 'Tiền mặt'}</td>
                                        <td className="fw-bold text-brown">{formatPrice(order.total)}</td>
                                        <td>
                                            {renderStatusBadge(order.status)}
                                        </td>
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

            {/* MODAL HIỂN THỊ CHI TIẾT ĐƠN HÀNG GIỮA TRANG */}
            {isModalOpen && selectedOrder && (
                <div className="story-modal-overlay" style={{ zIndex: 9999 }}>
                    <div className="story-modal" style={{ width: '40.625rem', maxWidth: '95vw', paddingBottom: '0' }}>
                        <div className="modal-header">
                            <h3>Mã đơn: {selectedOrder.id}</h3>
                            <button className="btn-close" onClick={() => setIsModalOpen(false)}>
                                <i className="fa-solid fa-xmark"></i>
                            </button>
                        </div>
                        
                        <div className="modal-body" style={{ maxHeight: '60vh', overflowY: 'auto' }}>
                            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '1.25rem', marginBottom: '1.5rem', backgroundColor: '#f8f9fa', padding: '1rem', borderRadius: '0.5rem' }}>
                                <div style={{ flex: '1 1 12rem' }}>
                                    <p style={{marginBottom: '0.5rem'}}><strong><i className="fa-regular fa-user"></i> Khách hàng:</strong> {selectedOrder.customerName || 'Khách vãng lai'}</p>
                                    <p style={{marginBottom: '0.5rem'}}><strong><i className="fa-solid fa-phone"></i> Số ĐT:</strong> {selectedOrder.phone || 'Không có'}</p>
                                    <p style={{marginBottom: '0.5rem'}}><strong><i className="fa-solid fa-location-dot"></i> Địa chỉ:</strong> {selectedOrder.address || 'Không có'}</p>
                                </div>
                                <div style={{ flex: '1 1 12rem' }}>
                                    <p style={{marginBottom: '0.5rem'}}><strong><i className="fa-regular fa-clock"></i> Ngày đặt:</strong> {formatDate(selectedOrder.createdAt)}</p>
                                    <p style={{marginBottom: '0.5rem'}}><strong><i className="fa-solid fa-wallet"></i> Thanh toán:</strong> {selectedOrder.paymentMethod || 'Tiền mặt'}</p>
                                    <p style={{marginBottom: '0.5rem'}}><strong><i className="fa-solid fa-truck-fast"></i> Trạng thái:</strong> {renderStatusBadge(selectedOrder.status)}</p>
                                </div>
                            </div>

                            <h4 style={{ marginBottom: '0.625rem', color: '#382212' }}>Sản phẩm đã đặt</h4>
                            <div className="table-responsive">
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
                            </div>
                            
                            <div style={{ textAlign: 'right', marginTop: '1.25rem', paddingTop: '1rem', borderTop: '1px dashed #ddd', fontSize: '1.125rem' }}>
                                <span>Tổng cộng: </span>
                                <strong className="text-brown" style={{ fontSize: '1.5rem' }}>{formatPrice(selectedOrder.total)}</strong>
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

export default OrderManage;