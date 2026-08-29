import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import './MyOrdersPage.css';

const MyOrdersPage = () => {
    const [orders, setOrders] = useState([]);
    const [currentTime, setCurrentTime] = useState(Date.now());

    // 1. Tải đơn hàng từ LocalStorage khi vào trang
    useEffect(() => {
        window.scrollTo(0, 0);
        const savedOrders = JSON.parse(localStorage.getItem('my_orders')) || [];
        
        // NẾU CHƯA CÓ ĐƠN NÀO, TỰ ĐỘNG TẠO 1 ĐƠN ẢO ĐỂ BOSS TEST HIỆU ỨNG
        if (savedOrders.length === 0) {
            const mockOrder = {
                id: 'FOX-' + Math.floor(100000 + Math.random() * 900000),
                createdAt: Date.now(),
                items: [{ name: 'Cà phê nguyên chất Dreamy', quantity: 2, price: 150000 }],
                total: 330000, // Đã cộng 30k ship
                status: 'delivering' 
            };
            savedOrders.push(mockOrder);
            localStorage.setItem('my_orders', JSON.stringify(savedOrders));
        }
        setOrders(savedOrders);
    }, []);

    // 2. Vòng lặp đếm ngược thời gian thực (Mỗi giây cập nhật 1 lần)
    useEffect(() => {
        const timer = setInterval(() => {
            setCurrentTime(Date.now());
            
            setOrders(prevOrders => {
                let hasChanges = false;
                const updated = prevOrders.map(order => {
                    if (order.status === 'delivering') {
                        const elapsed = Math.floor((Date.now() - order.createdAt) / 1000);
                        if (elapsed >= 60) {
                            hasChanges = true;
                            return { ...order, status: 'arrived' }; // Chuyển trạng thái Đã tới
                        }
                    }
                    return order;
                });
                
                if (hasChanges) localStorage.setItem('my_orders', JSON.stringify(updated));
                return updated;
            });
        }, 1000);
        return () => clearInterval(timer);
    }, []);

    // 3. Hàm xử lý khi bấm nút "Đã nhận" hoặc "Chưa nhận"
    const handleConfirmStatus = (orderId, newStatus) => {
        const updatedOrders = orders.map(o => o.id === orderId ? { ...o, status: newStatus } : o);
        setOrders(updatedOrders);
        localStorage.setItem('my_orders', JSON.stringify(updatedOrders));
    };

    const formatPrice = (price) => price.toLocaleString('vi-VN') + '₫';
    
    const formatTime = (timestamp) => {
        const d = new Date(timestamp);
        return d.toLocaleTimeString('vi-VN') + ' - ' + d.toLocaleDateString('vi-VN');
    };

    return (
        <div className="my-orders-page">
            <div className="detail-breadcrumb">
                <div className="container">
                    <h1>Đơn hàng của tôi</h1>
                    <div className="bread-links">
                        <Link to="/">TRANG CHỦ</Link> <span>&gt;</span>
                        <strong>ĐƠN HÀNG</strong>
                    </div>
                </div>
            </div>

            <div className="container orders-content-wrapper">
                {orders.length === 0 ? (
                    <div className="empty-orders">Chưa có đơn hàng nào!</div>
                ) : (
                    <div className="orders-list">
                        {orders.map(order => {
                            // Tính toán thời gian
                            const elapsed = Math.floor((currentTime - order.createdAt) / 1000);
                            const remaining = Math.max(0, 60 - elapsed);
                            
                            return (
                                <div key={order.id} className={`order-card status-${order.status}`}>
                                    
                                    {/* PHẦN ĐẦU: TRẠNG THÁI & THỜI GIAN */}
                                    <div className="order-header">
                                        <div className="order-id">
                                            <i className="fa-solid fa-receipt"></i> Mã đơn: <strong>{order.id}</strong>
                                        </div>
                                        <div className="order-status-badge">
                                            {order.status === 'delivering' && <span className="badge warning"><i className="fa-solid fa-truck-fast fa-bounce"></i> Đang giao ({remaining}s)</span>}
                                            {order.status === 'arrived' && <span className="badge info"><i className="fa-solid fa-location-dot"></i> Shipper đã tới!</span>}
                                            {order.status === 'received' && <span className="badge success"><i className="fa-solid fa-check-double"></i> Đã nhận hàng</span>}
                                            {order.status === 'not_received' && <span className="badge danger"><i className="fa-solid fa-triangle-exclamation"></i> Báo cáo chưa nhận</span>}
                                        </div>
                                    </div>

                                    <div className="order-timeline">
                                        <p><strong>Ngày đặt:</strong> {formatTime(order.createdAt)}</p>
                                        <p><strong>Dự kiến giao:</strong> Trong vòng 60 phút</p>
                                    </div>

                                    {/* BIÊN LAI (HÓA ĐƠN) */}
                                    <div className="order-receipt">
                                        <ul className="receipt-items">
                                            {order.items.map((item, idx) => (
                                                <li key={idx}>
                                                    <span className="item-name">{item.name} <strong>x{item.quantity}</strong></span>
                                                    <span className="item-price">{formatPrice(item.price * item.quantity)}</span>
                                                </li>
                                            ))}
                                        </ul>
                                        <div className="receipt-total">
                                            <span>TỔNG CỘNG:</span>
                                            <span className="total-amount">{formatPrice(order.total)}</span>
                                        </div>
                                    </div>

                                    {/* KHU VỰC NÚT BẤM KHI SHIPPER TỚI */}
                                    {order.status === 'arrived' && (
                                        <div className="order-actions">
                                            <h4 className="action-title">Shipper đang đứng trước cửa, Boss vui lòng xác nhận:</h4>
                                            <div className="action-buttons">
                                                <button className="btn-confirm success" onClick={() => handleConfirmStatus(order.id, 'received')}>
                                                    <i className="fa-solid fa-check"></i> ĐÃ NHẬN ĐƯỢC HÀNG
                                                </button>
                                                <button className="btn-confirm danger" onClick={() => handleConfirmStatus(order.id, 'not_received')}>
                                                    <i className="fa-solid fa-xmark"></i> TÔI CHƯA NHẬN ĐƯỢC
                                                </button>
                                            </div>
                                        </div>
                                    )}
                                    
                                </div>
                            );
                        })}
                    </div>
                )}
            </div>
        </div>
    );
};

export default MyOrdersPage;