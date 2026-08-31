import React, { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useCart } from '../../context/CartContext'; 
import toast from 'react-hot-toast'; 
import Swal from 'sweetalert2'; 
import './CartPage.css';

const CartPage = () => {
    const { cartItems, setCartItems, removeFromCart } = useCart();

    useEffect(() => {
        window.scrollTo(0, 0);
    }, []);

    const formatPrice = (price) => {
        return price.toLocaleString('vi-VN') + '₫';
    };

    // HÀM CẬP NHẬT SỐ LƯỢNG
    const updateQuantity = (item, newQuantity) => {
        if (newQuantity < 1) return;
        
        if (newQuantity > (item.stock || 99)) {
            toast.error(`Kho chỉ còn đúng ${item.stock} sản phẩm thôi Boss ơi!`, { 
                id: 'over-stock-cart',
                position: "bottom-right",
                style: { fontWeight: 600 }
            });
            return;
        }

        setCartItems(prev => {
            const updatedCart = prev.map(cartItem =>
                cartItem.id === item.id ? { ...cartItem, quantity: newQuantity } : cartItem
            );
            localStorage.setItem('cart', JSON.stringify(updatedCart));
            return updatedCart;
        });
    };

    // HÀM XÓA 1 MÓN
    const handleRemoveItem = (id, name) => {
        removeFromCart(id);
        toast.success(`Đã xóa ${name} khỏi giỏ!`, {
            position: "bottom-right",
            icon: '🗑️',
            style: { fontWeight: 600, color: '#fa5252' }
        });
    };

    // 👉 ĐÃ SỬA: HÀM XÓA SẠCH GIỎ HÀNG BẰNG SWEETALERT2
    const handleClearCart = () => {
        Swal.fire({
            title: 'Dọn sạch giỏ hàng?',
            text: "Boss có chắc chắn muốn xóa hết tất cả các món trong giỏ không?",
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#fa5252', // Màu đỏ cho nút xóa
            cancelButtonColor: '#888',     // Màu xám cho nút hủy
            confirmButtonText: 'Xóa sạch!',
            cancelButtonText: 'Giữ lại'
        }).then((result) => {
            if (result.isConfirmed) {
                setCartItems([]); 
                localStorage.removeItem('cart');
                toast.success('Đã dọn sạch giỏ hàng! ✨', {
                    position: "bottom-right",
                    style: { background: '#6f4323', color: '#fff', fontWeight: 600 } 
                });
            }
        });
    };

    const subtotal = cartItems.reduce((total, item) => total + (item.price * item.quantity), 0);
    const shippingFee = subtotal > 500000 ? 0 : 30000;
    const total = subtotal + (cartItems.length > 0 ? shippingFee : 0);

    return (
        <div className="cart-page">
            <div className="detail-breadcrumb">
                <div className="container">
                    <h1>Giỏ hàng</h1>
                    <div className="bread-links">
                        <Link to="/">TRANG CHỦ</Link> <span>&gt;</span>
                        <strong>GIỎ HÀNG CỦA BẠN</strong>
                    </div>
                </div>
            </div>

            <div className="container cart-content-wrapper">
                {cartItems.length === 0 ? (
                    <div className="empty-cart-area">
                        <div className="empty-cart-icon">
                            <i className="fa-solid fa-basket-shopping"></i>
                        </div>
                        <h2>Giỏ hàng của bạn đang trống</h2>
                        <p>Chưa có sản phẩm nào trong giỏ hàng. Hãy quay lại cửa hàng để chọn cho mình những hương vị cà phê tuyệt hảo nhé!</p>
                        <Link to="/products" className="btn-continue-shopping">
                            TIẾP TỤC MUA SẮM
                        </Link>
                    </div>
                ) : (
                    <div className="cart-main-layout">
                        <div className="cart-items-section">
                            <div className="cart-table-header">
                                <div className="col-product">SẢN PHẨM</div>
                                <div className="col-price">GIÁ</div>
                                <div className="col-qty">SỐ LƯỢNG</div>
                                <div className="col-total">TẠM TÍNH</div>
                            </div>

                            <div className="cart-items-list">
                                {cartItems.map((item, index) => (
                                    <div className="cart-item-row" key={index}>
                                        <div className="col-product">
                                            <button
                                                className="btn-remove-item"
                                                onClick={() => handleRemoveItem(item.id, item.name)} 
                                                title="Xóa sản phẩm này"
                                            >
                                                <i className="fa-solid fa-xmark"></i>
                                            </button>
                                            <div className="item-img">
                                                <img src={item.imageFront || item.img} alt={item.name} />
                                            </div>
                                            <div className="item-info">
                                                <Link to={`/product/${item.id}`} className="item-name">{item.name}</Link>
                                                <span className="item-cate">{item.category}</span>
                                            </div>
                                        </div>

                                        <div className="col-price">
                                            {formatPrice(item.price)}
                                        </div>

                                        <div className="col-qty">
                                            <div className="quantity-selector cart-qty">
                                                <button onClick={() => updateQuantity(item, item.quantity - 1)}>-</button>
                                                <input type="number" value={item.quantity} readOnly />
                                                <button
                                                    onClick={() => updateQuantity(item, item.quantity + 1)}
                                                    disabled={item.quantity >= (item.stock || 99)}
                                                >+</button>
                                            </div>
                                        </div>

                                        <div className="col-total item-total-price">
                                            {formatPrice(item.price * item.quantity)}
                                        </div>
                                    </div>
                                ))}
                            </div>

                            <div className="cart-actions-bottom">
                                <Link to="/products" className="btn-back-shop">
                                    <i className="fa-solid fa-arrow-left-long"></i> TIẾP TỤC MUA SẮM
                                </Link>
                                <button className="btn-clear-cart" onClick={handleClearCart}>
                                    XÓA GIỎ HÀNG
                                </button>
                            </div>
                        </div>

                        <div className="cart-summary-section">
                            <div className="summary-card">
                                <h3>CỘNG GIỎ HÀNG</h3>
                                <div className="summary-row">
                                    <span>Tạm tính</span>
                                    <strong>{formatPrice(subtotal)}</strong>
                                </div>
                                <div className="summary-row">
                                    <span>Phí giao hàng</span>
                                    <strong>{shippingFee === 0 ? 'Miễn phí' : formatPrice(shippingFee)}</strong>
                                </div>
                                {shippingFee > 0 && (
                                    <div className="free-ship-notice">
                                        <i className="fa-solid fa-circle-info"></i> Mua thêm {formatPrice(500000 - subtotal)} để được Freeship!
                                    </div>
                                )}
                                <div className="summary-divider"></div>
                                <div className="summary-row total-row">
                                    <span>Tổng cộng</span>
                                    <strong className="final-price">{formatPrice(total)}</strong>
                                </div>
                                <Link to="/checkout" className="btn-checkout" style={{ display: 'block', textAlign: 'center', boxSizing: 'border-box' }}>
                                    TIẾN HÀNH THANH TOÁN
                                </Link>
                                <div className="secure-checkout">
                                    <i className="fa-solid fa-shield-halved"></i> Thanh toán an toàn & bảo mật 100%
                                </div>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default CartPage;