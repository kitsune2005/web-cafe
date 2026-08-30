import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

// NẠP BỘ NGUỒN CÀI ĐẶT VÀO ĐÂY
import { SettingsProvider } from '../context/SettingsContext';
import { ProductProvider } from '../context/ProductContext';
import { CartProvider } from '../context/CartContext'; // 👉 THÊM BỘ NÃO GIỎ HÀNG
import { Toaster } from 'react-hot-toast'; // 👉 THÊM THƯ VIỆN THÔNG BÁO

// ================= LAYOUTS =================
import MainLayouts from '../layouts/MainLayouts';
import AdminLayout from '../layouts/adminLayout/AdminLayout';

// ================= CLIENT PAGES =================
import HomePage from '../pages/HomePage';
import ProductsPage from '../pages/ProductsPage/ProductsPage';
import CategoryPage from '../pages/CategoryPage/CategoryPage';
import NewsPage from '../pages/NewsPage/NewsPage';
import NewsDetailPage from '../pages/NewsDetailPage/NewsDetailPage';
import ContactPage from '../pages/ContactPage/ContactPage';


// NHẬP TRANG CHI TIẾT SẢN PHẨM VÀ GIỎ HÀNG
import ProductDetailPage from '../pages/ProductDetailPage/ProductDetailPage';
import CartPage from '../pages/CartPage/CartPage';

// IMPORT TRANG THANH TOÁN VÀ ĐƠN HÀNG
import CheckoutPage from '../pages/CheckoutPage/CheckoutPage';
import MyOrdersPage from '../pages/MyOrdersPage/MyOrdersPage';

// ================= ADMIN PAGES =================
import ProductManage from '../pages/AdminPage/ProductManage/ProductManage';
import NewsManage from '../pages/AdminPage/NewsManage/NewsManage';
import Dashboard from '../pages/AdminPage/Dashboard/Dashboard';
import OrderManage from '../pages/AdminPage/OrderManage/OrderManage';
import ContactManage from '../pages/AdminPage/ContactManage/ContactManage';
import AutoScrollToTop from './AutoScrollToTop';
import ProductStoryManage from '../pages/AdminPage/ProductStoryManage/ProductStoryManage';
import CustomerManage from '../pages/AdminPage/CustomerManage/CustomerManage';

const AppRoutes = () => {
    const { currentUser, loading } = useAuth();

    // 🛡️ BẢO VỆ ROUTE ADMIN
    const ProtectedAdminRoute = ({ children }) => {
        if (loading) {
            return (
                <div style={{ height: '100vh', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
                    <h3 style={{ color: '#6f4323' }}><i className="fa-solid fa-spinner fa-spin"></i> Đang tải dữ liệu Admin...</h3>
                </div>
            );
        }

        if (!currentUser || currentUser.role !== 'admin') {
            return <Navigate to="/" replace />;
        }
        return children;
    };

    return (
        <SettingsProvider>
            <CartProvider>
                <ProductProvider>
                    <AutoScrollToTop />
                    {/* 👉 ĐẶT MÁY PHÁT THÔNG BÁO Ở ĐÂY */}
                    <Toaster position="top-center" reverseOrder={false} />

                    <Routes>

                                {/* ==============================================
                                    PHE 1: KHÁCH HÀNG 
                                ================================================ */}
                                <Route element={<MainLayouts />}>
                                    <Route path="/" element={<HomePage />} />
                                    <Route path="/products" element={<ProductsPage />} />
                                    <Route path="/category/:slug" element={<CategoryPage />} />
                                    <Route path="/news" element={<NewsPage />}/>
                                    <Route path="/news/:id" element={<NewsDetailPage />}/>
                                    <Route path="/contact" element={<ContactPage />}/>
                                    {/* TUYỆT CHIÊU ĐỊNH TUYẾN ĐỘNG CHO 45+ SẢN PHẨM */}
                                    <Route path="/product/:id" element={<ProductDetailPage />} />

                            {/* ĐƯỜNG DẪN TỚI TRANG GIỎ HÀNG, THANH TOÁN, ĐƠN HÀNG */}
                            <Route path="/cart" element={<CartPage />} />
                            <Route path="/checkout" element={<CheckoutPage />} />
                            <Route path="/my-orders" element={<MyOrdersPage />} /> {/* 👉 ĐÃ SỬA CHUẨN CÚ PHÁP */}
                        </Route>

                        {/* ==============================================
                            PHE 2: ADMIN 
                        ================================================ */}
                        <Route
                            path="/admin"
                            element={
                                <ProtectedAdminRoute>
                                    <AdminLayout />
                                </ProtectedAdminRoute>
                            }
                        >
                            <Route index element={<Navigate to="dashboard" replace />} />
                            <Route path="dashboard" element={<Dashboard />} />
                            <Route path="products" element={<ProductManage />} />
                            <Route path="orders" element={<OrderManage />} />
                        </Route>

                                {/* ==============================================
                                    BẮT LỖI 404 
                                ================================================ */}
                                <Route path="*" element={
                                    <div style={{ textAlign: 'center', padding: '100px 0' }}>
                                        <h1 style={{ color: '#6f4323' }}>404 - Lạc đường rồi 🦊</h1>
                                    </div>
                                } />

                            </Routes>
                        </ContactProvider>
                    </NewsProvider>        
                </ProductProvider>
            </CartProvider>
        </SettingsProvider>
    );
};

export default AppRoutes;