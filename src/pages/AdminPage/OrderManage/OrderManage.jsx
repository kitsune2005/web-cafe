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

    // 👉 ĐÃ SỬA: Biến thành hàm Render Badge tĩnh, không cho phép bấm chọn nữa
    const renderStatusBadge = (status) => {
        switch (status) {
            case 'pending': return <span className="status-badge pending">Chờ xử lý</span>;
            case 'delivering': return <span className="status-badge warning">Đang giao</span>;
            case 'arrived': return <span className="status-badge warning">Shipper tới</span>;
            case 'received': return <span className="status-badge success">Hoàn thành</span>;
            case 'not_received': 
            case 'cancelled': return <span className="status-badge danger">Đã hủy / Khách báo lỗi</span>;
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
                {/* THANH TÌM KIẾM VÀ LỌC */}
                <div className="section-header" style={{ marginBottom: '20px', display: 'flex', gap: '15px', flexWrap: 'wrap' }}>
                    <div style={{ display: 'flex', gap: '10px', alignItems: 'center', background: '#fff', border: '1px solid #ddd', padding: '8px 15px', borderRadius: '8px', flex: 1, maxWidth: '400px' }}>
                        <i className="fa-solid fa-magnifying-glass" style={{ color: '#888' }}></i>
                        <input 
                            type="text" 
                            placeholder="Tìm theo mã đơn, tên khách hàng..." 
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            style={{ border: 'none', outline: 'none', width: '100%', fontSize: '14px' }}
                        />
                    </div>

                    <select 
                        value={statusFilter} 
                        onChange={(e) => setStatusFilter(e.target.value)}
                        style={{ padding: '8px 15px', border: '1px solid #ddd', borderRadius: '8px', outline: 'none', color: '#555', fontWeight: '600', cursor: 'pointer' }}
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
                                <tr><td colSpan="7" style={{textAlign: 'center', padding: '30px', color: '#888'}}>Không tìm thấy đơn hàng nào!</td></tr>
                            ) : (
                                filteredOrders.map(order => (
                                    <tr key={order.id}>
                                        <td className="fw-bold">{order.id}</td>
                                        <td>{order.customerName || 'Khách vãng lai'}</td>
                                        <td style={{fontSize: '13px', color: '#666'}}>{formatDate(order.createdAt)}</td>
                                        <td>{order.paymentMethod || 'Tiền mặt'}</td>
                                        <td className="fw-bold text-brown">{formatPrice(order.total)}</td>
                                        <td>
                                            {/* 👉 ĐÃ SỬA: Gọi hàm hiển thị Badge tĩnh, không cho click */}
                                            {renderStatusBadge(order.status)}
                                        </td>
                                        <td style={{textAlign: 'center'}}>
                                            {/* NÚT BẤM HIỆN POPUP CHI TIẾT */}
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

            {/* 👉 MODAL HIỂN THỊ CHI TIẾT ĐƠN HÀNG GIỮA TRANG */}
            {isModalOpen && selectedOrder && (
                <div className="story-modal-overlay" style={{ zIndex: 9999 }}>
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
                                    <p style={{marginBottom: '8px'}}><strong><i className="fa-solid fa-truck-fast"></i> Trạng thái:</strong> {renderStatusBadge(selectedOrder.status)}</p>
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

export default OrderManage;