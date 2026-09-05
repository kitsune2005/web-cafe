import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext'; 
import toast from 'react-hot-toast';
import Swal from 'sweetalert2'; 
import './MyOrdersPage.css';

const MyOrdersPage = () => {
    const [orders, setOrders] = useState([]);
    const [currentTime, setCurrentTime] = useState(Date.now());
    const [receiptOrder, setReceiptOrder] = useState(null);

    const { currentUser, loading } = useAuth();
    const navigate = useNavigate();

    useEffect(() => {
        if (loading) return;

        if (!currentUser) {
            toast.error("Boss ơi, phải đăng nhập mới xem được đơn hàng nhé! ");
            navigate('/');
            return;
        }

        window.scrollTo(0, 0);
        const allOrders = JSON.parse(localStorage.getItem('my_orders')) || [];
        const myOwnOrders = allOrders.filter(order => order.customerId === currentUser.id);
        const sortedOrders = myOwnOrders.sort((a, b) => b.createdAt - a.createdAt);

        setOrders(sortedOrders);
    }, [currentUser, loading, navigate]);

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
                            return { ...order, status: 'arrived' }; 
                        }
                    }
                    return order;
                });

                if (hasChanges) {
                    const allOrders = JSON.parse(localStorage.getItem('my_orders')) || [];
                    const newAllOrders = allOrders.map(sysOrder => {
                        const matched = updated.find(o => o.id === sysOrder.id);
                        return matched ? matched : sysOrder;
                    });
                    localStorage.setItem('my_orders', JSON.stringify(newAllOrders));
                }
                return updated;
            });
        }, 1000);
        return () => clearInterval(timer);
    }, []);

    // ==========================================
    //   HÀM ĐÃ NÂNG CẤP: BẮN LỆNH LÊN DATABASE CHO ADMIN
    // ==========================================
    const handleConfirmStatus = async (orderId, newStatus) => {
        // 1. Cập nhật giao diện nội bộ cho mượt
        const updatedOrders = orders.map(o => o.id === orderId ? { ...o, status: newStatus } : o);
        setOrders(updatedOrders);

        // 2. Cập nhật LocalStorage
        const allOrders = JSON.parse(localStorage.getItem('my_orders')) || [];
        const newAllOrders = allOrders.map(sysOrder =>
            sysOrder.id === orderId ? { ...sysOrder, status: newStatus } : sysOrder
        );
        localStorage.setItem('my_orders', JSON.stringify(newAllOrders));

        // 3.   PHÓNG API LÊN DATABASE CHO RADAR ADMIN BẮT SÓNG
        try {
            await fetch(`http://localhost:5000/orders/${orderId}`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ status: newStatus })
            });
        } catch (error) {
            console.error("Lỗi khi đồng bộ lên Database Admin:", error);
        }
    };

    // ==========================================
    // XỬ LÝ: XÁC NHẬN ĐÃ NHẬN HÀNG
    // ==========================================
    const handleReceived = (order) => {
        Swal.fire({
            title: 'Xác nhận nhận hàng?',
            text: "Boss xác nhận shipper đã giao đúng và đủ hàng chứ?",
            icon: 'question',
            showCancelButton: true,
            confirmButtonColor: '#0ca678', 
            cancelButtonColor: '#888',
            confirmButtonText: 'Đúng, tôi đã nhận!',
            cancelButtonText: 'Khoan đã'
        }).then((result) => {
            if (result.isConfirmed) {
                handleConfirmStatus(order.id, 'received');
                toast.success('Đơn hàng hoàn tất! Đã lưu biên lai. ✨', {
                    position: "bottom-right",
                    style: { background: '#0ca678', color: '#fff', fontWeight: 600 }
                });
            }
        });
    };

    // ==========================================
    // XỬ LÝ: BÁO CÁO CHƯA NHẬN ĐƯỢC HÀNG
    // ==========================================
    const handleNotReceived = (order) => {
        Swal.fire({
            title: 'Báo cáo sự cố!',
            text: "Boss chưa nhận được hàng? Hãy ghi chú lại để Admin xử lý ngay nhé:",
            input: 'textarea',
            inputPlaceholder: 'Ví dụ: Shipper gọi không nghe máy, báo giao rồi nhưng không thấy hàng...',
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#fa5252', 
            cancelButtonColor: '#888',
            confirmButtonText: 'Gửi báo cáo',
            cancelButtonText: 'Hủy'
        }).then((result) => {
            if (result.isConfirmed) {
                const reason = result.value || "Không ghi rõ lý do";
                console.log(`[BÁO ĐỘNG ĐỎ GỬI ADMIN] Đơn hàng ${order.id} gặp sự cố: ${reason}`);

                // Gọi hàm đã bọc API ở trên
                handleConfirmStatus(order.id, 'not_received');
                
                Swal.fire(
                    'Đã gửi báo cáo!',
                    'Hệ thống đã gửi báo cáo thẳng lên Admin. Boss cứ yên tâm đợi kết quả nhé!',
                    'success'
                );
            }
        });
    };

    const formatPrice = (price) => price.toLocaleString('vi-VN') + '₫';

    const formatTime = (timestamp) => {
        const d = new Date(timestamp);
        return d.toLocaleTimeString('vi-VN') + ' - ' + d.toLocaleDateString('vi-VN');
    };

    if (loading || !currentUser) return null;

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
                            const elapsed = Math.floor((currentTime - order.createdAt) / 1000);
                            const remaining = Math.max(0, 60 - elapsed);

                            const subtotal = order.items?.reduce((s, i) => s + i.price * i.quantity, 0) || 0;
                            const shippingFee = order.total - subtotal;

                            return (
                                <div key={order.id} className={`order-card status-${order.status}`}>
                                    <div className="order-header">
                                        <div className="order-id">
                                            <i className="fa-solid fa-receipt"></i> Mã đơn: <strong>{order.id}</strong>
                                        </div>
                                        <div className="order-status-badge">
                                            {order.status === 'delivering' && <span className="badge warning"><i className="fa-solid fa-truck-fast fa-bounce"></i> Đang giao ({remaining}s)</span>}
                                            {order.status === 'arrived' && <span className="badge info"><i className="fa-solid fa-location-dot"></i> Shipper đã tới!</span>}
                                            {order.status === 'received' && <span className="badge success"><i className="fa-solid fa-check-double"></i> Đã nhận hàng</span>}
                                            {order.status === 'not_received' && <span className="badge danger"><i className="fa-solid fa-triangle-exclamation"></i> Báo cáo chưa nhận</span>}
                                            {order.status === 'cancelled' && <span className="badge danger"><i className="fa-solid fa-ban"></i> Đã hủy</span>}
                                        </div>
                                    </div>

                                    <div className="order-timeline">
                                        <p><strong>Ngày đặt:</strong> {formatTime(order.createdAt)}</p>
                                        <p><strong>Dự kiến giao:</strong> Trong vòng 60 phút</p>
                                    </div>

                                    <div className="order-receipt">
                                        <ul className="receipt-items">
                                            {order.items?.map((item, idx) => (
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

                                    <div className="order-dynamic-actions">
                                        {order.status === 'arrived' && (
                                            <div className="order-actions">
                                                <h4 className="action-title">Shipper đang đứng trước cửa, Boss vui lòng xác nhận:</h4>
                                                <div className="action-buttons">
                                                    <button className="btn-confirm success" onClick={() => handleReceived(order)}>
                                                        <i className="fa-solid fa-check"></i> ĐÃ NHẬN ĐƯỢC HÀNG
                                                    </button>
                                                    <button className="btn-confirm danger" onClick={() => handleNotReceived(order)}>
                                                        <i className="fa-solid fa-xmark"></i> TÔI CHƯA NHẬN ĐƯỢC
                                                    </button>
                                                </div>
                                            </div>
                                        )}

                                        {order.status === 'received' && (
                                            <div className="action-completed-area">
                                                <span className="success-msg">Cảm ơn Boss đã mua sắm tại The Coffee!</span>
                                                <button className="btn-view-receipt" onClick={() => setReceiptOrder({ ...order, shippingFee })} title="Xem biên lai">
                                                    <i className="fa-regular fa-eye"></i> Xem biên lai
                                                </button>
                                            </div>
                                        )}

                                        {order.status === 'not_received' && (
                                            <div className="action-reported-area">
                                                <span className="error-msg">
                                                    <i className="fa-solid fa-shield-halved"></i> Đơn hàng đang bị kẹt. Admin đang trực tiếp điều tra xử lý!
                                                </span>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                )}
            </div>

            {/* MODAL BIÊN LAI */}
            {receiptOrder && (
                <div className="receipt-modal-overlay" onClick={() => setReceiptOrder(null)}>
                    <div className="receipt-modal-content" onClick={e => e.stopPropagation()}>
                        <button className="btn-close-receipt" onClick={() => setReceiptOrder(null)}>
                            <i className="fa-solid fa-xmark"></i>
                        </button>
                        
                        <div className="receipt-paper">
                            <div className="receipt-header">
                                <h2>THE COFFEE</h2>
                                <p>HÓA ĐƠN ĐIỆN TỬ</p>
                                <p>Mã đơn: {receiptOrder.id}</p>
                            </div>
                            <div className="receipt-divider"></div>
                            <div className="receipt-body">
                                {receiptOrder.items?.map((item, idx) => (
                                    <div className="receipt-row" key={idx}>
                                        <span className="r-name">{item.name} x{item.quantity}</span>
                                        <span className="r-price">{formatPrice(item.price * item.quantity)}</span>
                                    </div>
                                ))}
                                <div className="receipt-row">
                                    <span className="r-name">Phí vận chuyển</span>
                                    <span className="r-price">{formatPrice(receiptOrder.shippingFee)}</span>
                                </div>
                            </div>
                            <div className="receipt-divider"></div>
                            <div className="receipt-footer">
                                <div className="receipt-row r-total">
                                    <span>TỔNG THANH TOÁN</span>
                                    <span>{formatPrice(receiptOrder.total)}</span>
                                </div>
                                <p className="r-time">Hoàn tất lúc: {new Date().toLocaleString('vi-VN')}</p>
                                <p className="r-thankyou">Cảm ơn quý khách!</p>
                            </div>
                        </div>

                    </div>
                </div>
            )}
        </div>
    );
};

export default MyOrdersPage;