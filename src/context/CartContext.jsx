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

    // Hàm thêm vào giỏ hàng + Hiện thông báo "bay"
    const addToCart = (product, quantity = 1) => {
        setCartItems(prev => {
            const existing = prev.find(item => item.id === product.id);
            let newCart;
            if (existing) {
                newCart = prev.map(item => item.id === product.id ? { ...item, quantity: item.quantity + quantity } : item);
            } else {
                newCart = [...prev, { ...product, quantity }];
            }
            localStorage.setItem('cart', JSON.stringify(newCart));
            return newCart;
        });

        // Hiện thông báo ở góc màn hình
        toast.success(`Đã thêm ${quantity} x ${product.name} vào giỏ!`, {
            position: "bottom-right",
            style: { background: '#6f4323', color: '#fff', fontWeight: 600 }
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