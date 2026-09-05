import React, { createContext, useState, useContext, useEffect } from 'react';
import toast from 'react-hot-toast'; // Thư viện thông báo vừa cài

const CartContext = createContext();

export const useCart = () => useContext(CartContext);

export const CartProvider = ({ children }) => {
    const [cartItems, setCartItems] = useState([]);

    // Lấy giỏ hàng từ LocalStorage khi khởi động web
    useEffect(() => {
        const savedCart = JSON.parse(localStorage.getItem('cart')) || [];
        setCartItems(savedCart);
    }, []);

    //   HÀM THÊM VÀO GIỎ HÀNG (ĐÃ BỌC THÉP CHỐNG MUA LỐ TỒN KHO)
    const addToCart = (product, quantity = 1) => {
        setCartItems(prev => {
            const existingItem = prev.find(item => item.id === product.id);
            let newCart;

            if (existingItem) {
                // Nếu trong giỏ đã có đồ, cộng dồn xem có vượt tồn kho không
                const newTotalQuantity = existingItem.quantity + quantity;
                
                if (newTotalQuantity > product.stock) {
                    // Cảnh báo nếu mua lố
                    toast.error(`Kho chỉ còn đúng ${product.stock} sản phẩm thôi Boss ơi! 🦊`, { 
                        id: 'over-stock',
                        position: "bottom-right",
                        style: { fontWeight: 600 }
                    });
                    // Ép số lượng trong giỏ bằng đúng số tồn kho tối đa
                    newCart = prev.map(item => 
                        item.id === product.id ? { ...item, quantity: product.stock } : item
                    );
                } else {
                    // Nếu không lố, cộng dồn bình thường và giữ nguyên style nâu của Boss
                    toast.success(`Đã thêm ${quantity} x ${product.name} vào giỏ!`, {
                        id: 'add-success',
                        position: "bottom-right",
                        style: { background: '#6f4323', color: '#fff', fontWeight: 600 }
                    });
                    newCart = prev.map(item => 
                        item.id === product.id ? { ...item, quantity: newTotalQuantity } : item
                    );
                }
            } else {
                // Trường hợp mua mới tinh mà lại ráng nhập số lố hơn tồn kho
                if (quantity > product.stock) {
                    toast.error(`Kho chỉ còn ${product.stock} sản phẩm thôi! 🦊`, { 
                        id: 'over-stock',
                        position: "bottom-right",
                        style: { fontWeight: 600 }
                    });
                    newCart = [...prev, { ...product, quantity: product.stock }];
                } else {
                    // Thêm mới bình thường
                    toast.success(`Đã thêm ${quantity} x ${product.name} vào giỏ!`, {
                        id: 'add-success',
                        position: "bottom-right",
                        style: { background: '#6f4323', color: '#fff', fontWeight: 600 }
                    });
                    newCart = [...prev, { ...product, quantity }];
                }
            }

            // Lưu ngay vào kho lưu trữ ảo
            localStorage.setItem('cart', JSON.stringify(newCart));
            return newCart;
        });
    };

    const removeFromCart = (id) => {
        setCartItems(prev => {
            const newCart = prev.filter(item => item.id !== id);
            localStorage.setItem('cart', JSON.stringify(newCart));
            return newCart;
        });
    };

    return (
        <CartContext.Provider value={{ cartItems, setCartItems, addToCart, removeFromCart }}>
            {children}
        </CartContext.Provider>
    );
};