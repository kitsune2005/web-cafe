import React, { useState, useEffect } from 'react';
import '../Dashboard/Dashboard.css';

const OrderManage = () => {
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [statusFilter, setStatusFilter] = useState('all');

    // STATE CHO MODAL XEM CHI TIẾT
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedOrder, setSelectedOrder] = useState(null);

    useEffect(() => {
        try {
            const savedOrders = JSON.parse(localStorage.getItem('my_orders')) || [];
            setOrders(savedOrders.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt)));
        } catch (error) {
            console.error("Lỗi khi tải đơn hàng từ LocalStorage:", error);
        } finally {
            setLoading(false);
        }
    }, []);

    const formatPrice = (price) => new Intl.NumberFormat('vi-VN').format(price || 0) + '₫';
    
    const formatDate = (timestamp) => {
        if (!timestamp) return 'Không rõ';
        const d = new Date(timestamp);
        return d.toLocaleTimeString('vi-VN') + ' - ' + d.toLocaleDateString('vi-VN');
    };

    const renderStatusBadge = (status) => {
        switch (status) {
            case 'pending': return <span className="status-badge pending">Chờ xử lý</span>;
            case 'delivering': 
            case 'shipping': return <span className="status-badge warning">Đang giao</span>;
            case 'arrived': return <span className="status-badge warning">Shipper tới</span>;
            case 'completed':
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

    const filteredOrders = orders.filter(o => {
        const matchSearch = String(o.id).toLowerCase().includes(searchTerm.toLowerCase()) ||
                            (o.customerName && String(o.customerName).toLowerCase().includes(searchTerm.toLowerCase())) ||
                            (o.name && String(o.name).toLowerCase().includes(searchTerm.toLowerCase()));
        
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
                <div style={{ marginBottom: '1.5rem', display: 'flex', gap: '1rem', flexWrap: 'wrap', width: '100%' }}>
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
                        <option value="cancelled">Đã hủy / Lỗi</option>
                    </select>
                </div>
                
                <div className="table-responsive">
                    {loading ? (
                        <div style={{ textAlign: 'center', padding: '3rem', color: '#6f4323' }}>
                            <i className="fa-solid fa-spinner fa-spin fa-2x"></i>
                        </div>
                    ) : (
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
                                            <td>{order.customerName || order.name || 'Khách vãng lai'}</td>
                                            <td style={{fontSize: '0.8125rem', color: '#666'}}>{formatDate(order.createdAt)}</td>
                                            <td>{order.paymentMethod === 'cod' ? 'Tiền mặt' : (order.paymentMethod || 'Tiền mặt')}</td>
                                            <td className="fw-bold text-brown">{formatPrice(order.totalAmount || order.total)}</td>
                                            <td>
                                                {renderStatusBadge(order.status)}
                                            </td>
                                            <td style={{textAlign: 'center'}}>
                                                {/* 👉 NÚT CON MẮT */}
                                                <button 
                                                    type="button"
                                                    className="action-btn view" 
                                                    title="Xem chi tiết" 
                                                    onClick={() => handleViewDetails(order)}
                                                >
                                                    <i className="fa-solid fa-eye"></i>
                                                </button>
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    )}
                </div>
            </div>

            {/* 👉 ĐÃ FIX: ÉP INLINE STYLE CỰC MẠNH (z-index 999999) BẤT CHẤP CSS BỊ ẨN */}
            {isModalOpen && selectedOrder && (
                <div style={{ position: 'fixed', inset: 0, backgroundColor: 'rgba(0,0,0,0.6)', zIndex: 999999, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1rem' }}>
                    
                    <div style={{ background: '#fff', width: '45rem', maxWidth: '100%', borderRadius: '0.75rem', overflow: 'hidden', display: 'flex', flexDirection: 'column', maxHeight: '90vh', boxShadow: '0 10px 25px rgba(0,0,0,0.2)' }}>
                        
                        {/* Header Modal */}
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '1.25rem 1.5rem', borderBottom: '1px solid #f1f1f1', background: '#fafafa' }}>
                            <h3 style={{ margin: 0, fontSize: '1.125rem', color: '#333' }}>Mã đơn: {selectedOrder.id}</h3>
                            <button type="button" onClick={() => setIsModalOpen(false)} style={{ background: 'none', border: 'none', fontSize: '1.25rem', color: '#888', cursor: 'pointer' }}>
                                <i className="fa-solid fa-xmark"></i>
                            </button>
                        </div>
                        
                        {/* Body Modal */}
                        <div style={{ padding: '1.5rem', overflowY: 'auto' }}>
                            
                            {/* Thông tin Khách */}
                            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '1.25rem', marginBottom: '1.5rem', backgroundColor: '#f8f9fa', padding: '1rem', borderRadius: '0.5rem' }}>
                                <div style={{ flex: '1 1 12rem' }}>
                                    <p style={{marginBottom: '0.5rem', fontSize: '14px'}}><strong><i className="fa-regular fa-user"></i> Khách hàng:</strong> {selectedOrder.customerName || selectedOrder.name || 'Khách vãng lai'}</p>
                                    <p style={{marginBottom: '0.5rem', fontSize: '14px'}}><strong><i className="fa-solid fa-phone"></i> Số ĐT:</strong> {selectedOrder.phone || 'Không có'}</p>
                                    <p style={{marginBottom: '0', fontSize: '14px'}}><strong><i className="fa-solid fa-location-dot"></i> Địa chỉ:</strong> {selectedOrder.shippingAddress || selectedOrder.address || 'Không có'}</p>
                                </div>
                                <div style={{ flex: '1 1 12rem' }}>
                                    <p style={{marginBottom: '0.5rem', fontSize: '14px'}}><strong><i className="fa-regular fa-clock"></i> Ngày đặt:</strong> {formatDate(selectedOrder.createdAt)}</p>
                                    <p style={{marginBottom: '0.5rem', fontSize: '14px'}}><strong><i className="fa-solid fa-wallet"></i> Thanh toán:</strong> {selectedOrder.paymentMethod === 'cod' ? 'Tiền mặt' : (selectedOrder.paymentMethod || 'Tiền mặt')}</p>
                                    <p style={{marginBottom: '0', fontSize: '14px'}}><strong><i className="fa-solid fa-truck-fast"></i> Trạng thái:</strong> {renderStatusBadge(selectedOrder.status)}</p>
                                </div>
                            </div>

                            {/* Danh sách Sản phẩm */}
                            <h4 style={{ margin: '0 0 10px 0', color: '#6f4323', fontSize: '16px' }}>Sản phẩm đã đặt</h4>
                            <div style={{ border: '1px solid #eee', borderRadius: '8px', overflow: 'hidden' }}>
                                <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '14px' }}>
                                    <thead style={{ background: '#fdfdfd', borderBottom: '2px solid #eee' }}>
                                        <tr>
                                            <th style={{ padding: '12px', textAlign: 'left', color: '#666' }}>SẢN PHẨM</th>
                                            <th style={{ padding: '12px', textAlign: 'center', color: '#666' }}>SL</th>
                                            <th style={{ padding: '12px', textAlign: 'right', color: '#666' }}>ĐƠN GIÁ</th>
                                            <th style={{ padding: '12px', textAlign: 'right', color: '#666' }}>TẠM TÍNH</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {/* 👉 ĐÃ FIX: Truy quét mọi tên mảng (items, cart, products) để lấy bằng được danh sách SP */}
                                        {(() => {
                                            const productList = selectedOrder.items || selectedOrder.cart || selectedOrder.products || selectedOrder.cartItems || [];
                                            
                                            if (productList.length === 0) {
                                                return <tr><td colSpan="4" style={{ padding: '20px', textAlign: 'center', color: '#888' }}>Không tìm thấy chi tiết sản phẩm.</td></tr>;
                                            }

                                            return productList.map((item, idx) => (
                                                <tr key={idx} style={{ borderBottom: '1px dashed #eee' }}>
                                                    <td style={{ padding: '12px' }}>{item.name || item.productName || 'Sản phẩm'}</td>
                                                    <td style={{ padding: '12px', textAlign: 'center', fontWeight: 'bold' }}>x{item.quantity || 1}</td>
                                                    <td style={{ padding: '12px', textAlign: 'right' }}>{formatPrice(item.price || item.price_at_purchase)}</td>
                                                    <td style={{ padding: '12px', textAlign: 'right', fontWeight: 'bold', color: '#fa5252' }}>
                                                        {formatPrice((item.price || item.price_at_purchase || 0) * (item.quantity || 1))}
                                                    </td>
                                                </tr>
                                            ));
                                        })()}
                                    </tbody>
                                </table>
                            </div>
                            
                            {/* Tổng tiền */}
                            <div style={{ textAlign: 'right', marginTop: '1.25rem', paddingTop: '1rem', borderTop: '2px solid #eee', fontSize: '1.125rem' }}>
                                <span>Tổng cộng: </span>
                                <strong style={{ fontSize: '1.5rem', color: '#6f4323' }}>{formatPrice(selectedOrder.totalAmount || selectedOrder.total)}</strong>
                            </div>
                        </div>
                        
                        {/* Footer Modal */}
                        <div style={{ padding: '1rem 1.5rem', borderTop: '1px solid #f1f1f1', background: '#fff', display: 'flex', justifyContent: 'flex-end' }}>
                            <button type="button" onClick={() => setIsModalOpen(false)} style={{ padding: '8px 20px', borderRadius: '6px', border: '1px solid #ccc', background: '#fff', cursor: 'pointer', fontWeight: 'bold', color: '#555' }}>
                                Đóng lại
                            </button>
                        </div>

                    </div>
                </div>
            )}
        </div>
    );
};

export default OrderManage;