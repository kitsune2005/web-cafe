import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useCart } from '../../context/CartContext';
import toast from 'react-hot-toast';
import './CheckoutPage.css';

const CheckoutPage = () => {
    const { cartItems, setCartItems } = useCart();
    const navigate = useNavigate();

    // State quản lý màn hình loading
    const [isProcessing, setIsProcessing] = useState(false);

    useEffect(() => {
        window.scrollTo(0, 0);
        // Nếu giỏ hàng trống thì đá về trang sản phẩm
        if (cartItems.length === 0) {
            toast.error("Giỏ hàng của bạn đang trống!");
            navigate('/products');
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []); 

    const [formData, setFormData] = useState({
        firstName: '',
        lastName: '',
        address: '',
        phone: '',
        email: '',
        notes: ''
    });

    const [paymentMethod, setPaymentMethod] = useState('bank');

    const subtotal = cartItems.reduce((total, item) => total + (item.price * item.quantity), 0);
    const shippingFee = subtotal > 500000 ? 0 : 30000;
    const total = subtotal + shippingFee;

    const formatPrice = (price) => price.toLocaleString('vi-VN') + '₫';

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    // Hàm xử lý đặt hàng ĐÃ NÂNG CẤP
    const handlePlaceOrder = (e) => {
        e.preventDefault();
        
        // 1. Kiểm tra thông tin
        if (!formData.firstName || !formData.phone || !formData.address) {
            toast.error("Vui lòng điền đầy đủ thông tin bắt buộc (*)");
            return;
        }

        // 2. Bật màn hình Loading lên
        setIsProcessing(true);

        // 3. Chờ 2.5 giây rồi xử lý logic
        setTimeout(() => {
            setIsProcessing(false);
            toast.success("🎉 Đặt hàng thành công! Đơn hàng đang được giao đến Boss.", { duration: 4000 });
            
            // 👉 LƯU ĐƠN HÀNG VÀO LỊCH SỬ ĐỂ ĐẾM NGƯỢC 60 GIÂY
            const newOrder = {
                id: 'FOX-' + Math.floor(100000 + Math.random() * 900000),
                createdAt: Date.now(),
                items: cartItems,
                total: total,
                status: 'delivering' // Bắt đầu trạng thái đang giao
            };
            const existingOrders = JSON.parse(localStorage.getItem('my_orders')) || [];
            localStorage.setItem('my_orders', JSON.stringify([newOrder, ...existingOrders]));

            // Xóa giỏ hàng
            setCartItems([]);
            localStorage.removeItem('cart');
            
            // 👉 CHỞ BOSS TỚI TRANG ĐƠN HÀNG ĐỂ XEM ĐẾM NGƯỢC LUÔN
            navigate('/my-orders');
        }, 2500);
    };

    if (cartItems.length === 0) return null; 

    return (
        <div className="checkout-page">
            <div className="detail-breadcrumb">
                <div className="container">
                    <h1>Thanh toán</h1>
                    <div className="bread-links">
                        <Link to="/">TRANG CHỦ</Link> <span>&gt;</span>
                        <strong>THANH TOÁN</strong>
                    </div>
                </div>
            </div>

            <div className="container checkout-content-wrapper">
                <div className="coupon-notice">
                    <i className="fa-solid fa-tag"></i> Bạn có mã ưu đãi? <button className="btn-toggle-coupon">Ấn vào đây để nhập mã</button>
                </div>

                {/* 👉 ĐÃ THÊM noValidate VÀO FORM ĐỂ TỰ BẮT LỖI BẰNG TOAST */}
                <form className="checkout-main-layout" onSubmit={handlePlaceOrder} noValidate>
                    
                    {/* CỘT TRÁI: FORM ĐIỀN THÔNG TIN */}
                    <div className="checkout-form-section">
                        <h3>Thông Tin Thanh Toán</h3>
                        <div className="form-row form-row-2">
                            <div className="form-group">
                                <label>Tên *</label>
                                <input type="text" name="firstName" value={formData.firstName} onChange={handleInputChange} required />
                            </div>
                            <div className="form-group">
                                <label>Họ *</label>
                                <input type="text" name="lastName" value={formData.lastName} onChange={handleInputChange} required />
                            </div>
                        </div>

                        <div className="form-group">
                            <label>Địa chỉ *</label>
                            <input type="text" name="address" placeholder="Số nhà và tên đường..." value={formData.address} onChange={handleInputChange} required />
                        </div>

                        <div className="form-row form-row-2">
                            <div className="form-group">
                                <label>Số điện thoại *</label>
                                <input type="tel" name="phone" value={formData.phone} onChange={handleInputChange} required />
                            </div>
                            <div className="form-group">
                                <label>Địa chỉ email *</label>
                                <input type="email" name="email" value={formData.email} onChange={handleInputChange} required />
                            </div>
                        </div>

                        <h3 className="mt-4">Thông Tin Bổ Sung</h3>
                        <div className="form-group">
                            <label>Ghi chú đơn hàng (tuỳ chọn)</label>
                            <textarea 
                                name="notes" 
                                rows="4" 
                                placeholder="Ghi chú về đơn hàng, ví dụ: thời gian hay chỉ dẫn địa điểm giao hàng chi tiết hơn."
                                value={formData.notes} 
                                onChange={handleInputChange}
                            ></textarea>
                        </div>
                    </div>

                    {/* CỘT PHẢI: BILL & THANH TOÁN */}
                    <div className="checkout-summary-section">
                        <div className="summary-box">
                            <h3>Đơn Hàng Của Bạn</h3>
                            
                            <div className="order-table">
                                <div className="order-table-header">
                                    <span>Sản phẩm</span>
                                    <span>Tạm tính</span>
                                </div>
                                <div className="order-table-body">
                                    {cartItems.map((item, idx) => (
                                        <div className="order-item-row" key={idx}>
                                            <span className="item-name">{item.name} <strong>× {item.quantity}</strong></span>
                                            <span className="item-price">{formatPrice(item.price * item.quantity)}</span>
                                        </div>
                                    ))}
                                </div>
                                <div className="order-table-footer">
                                    <div className="footer-row">
                                        <span>Tạm tính</span>
                                        <strong>{formatPrice(subtotal)}</strong>
                                    </div>
                                    <div className="footer-row">
                                        <span>Giao hàng</span>
                                        <span>{shippingFee === 0 ? 'Miễn phí' : formatPrice(shippingFee)}</span>
                                    </div>
                                    <div className="footer-row total-row">
                                        <span>Tổng</span>
                                        <strong className="final-price">{formatPrice(total)}</strong>
                                    </div>
                                </div>
                            </div>

                            <div className="payment-methods">
                                <div className="payment-option">
                                    <label>
                                        <input 
                                            type="radio" 
                                            name="paymentMethod" 
                                            value="bank" 
                                            checked={paymentMethod === 'bank'} 
                                            onChange={(e) => setPaymentMethod(e.target.value)} 
                                        />
                                        Chuyển khoản ngân hàng
                                    </label>
                                    {paymentMethod === 'bank' && (
                                        <div className="payment-desc">
                                            Thực hiện thanh toán vào ngay tài khoản ngân hàng của chúng tôi. Vui lòng sử dụng Mã đơn hàng của bạn trong phần Nội dung thanh toán. Đơn hàng sẽ được giao sau khi tiền đã chuyển.
                                        </div>
                                    )}
                                </div>
                                
                                <div className="payment-option">
                                    <label>
                                        <input 
                                            type="radio" 
                                            name="paymentMethod" 
                                            value="cod" 
                                            checked={paymentMethod === 'cod'} 
                                            onChange={(e) => setPaymentMethod(e.target.value)} 
                                        />
                                        Trả tiền mặt khi nhận hàng
                                    </label>
                                    {paymentMethod === 'cod' && (
                                        <div className="payment-desc">
                                            Khách hàng thanh toán bằng tiền mặt cho nhân viên giao hàng khi sản phẩm được giao tới nơi.
                                        </div>
                                    )}
                                </div>
                            </div>

                            <div className="privacy-policy-text">
                                Dữ liệu cá nhân của bạn sẽ được sử dụng để xử lý đơn đặt hàng, hỗ trợ trải nghiệm của bạn trên trang web này, và cho các mục đích khác được mô tả trong Chính sách bảo mật của chúng tôi.
                            </div>

                            <button type="submit" className="btn-place-order" disabled={isProcessing}>ĐẶT HÀNG</button>
                        </div>
                    </div>

                </form>
            </div>

            {/* MÀN HÌNH LOADING OVERLAY KHI BẤM ĐẶT HÀNG */}
            {isProcessing && (
                <div className="order-processing-overlay">
                    <div className="processing-content">
                        <i className="fa-solid fa-circle-notch fa-spin processing-spinner"></i>
                        <h2>Đang xử lý đơn hàng...</h2>
                        <p>Vui lòng không đóng trình duyệt lúc này!</p>
                    </div>
                </div>
            )}
        </div>
    );
};

export default CheckoutPage;