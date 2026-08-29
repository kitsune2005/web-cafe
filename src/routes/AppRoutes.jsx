import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

// NẠP BỘ NGUỒN CÀI ĐẶT VÀO ĐÂY
import { SettingsProvider } from '../context/SettingsContext';
import { ProductProvider } from '../context/ProductContext';

// ================= LAYOUTS =================
import MainLayouts from '../layouts/MainLayouts';
import AdminLayout from '../layouts/adminLayout/AdminLayout';

// ================= CLIENT PAGES =================
import HomePage from '../pages/HomePage';
import ProductsPage from '../pages/ProductsPage/ProductsPage';
import CategoryPage from '../pages/CategoryPage/CategoryPage'; 

// NHẬP TRANG CHI TIẾT SẢN PHẨM (ĐÃ BỎ TRANG ABOUT)
import ProductDetailPage from '../pages/ProductDetailPage/ProductDetailPage';

// ================= ADMIN PAGES =================
import ProductManage from '../pages/AdminPage/ProductManage/ProductManage';
import Dashboard from '../pages/AdminPage/Dashboard/Dashboard';
import OrderManage from '../pages/AdminPage/OrderManage/OrderManage'; 
import AutoScrollToTop from './AutoScrollToTop';

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
            <ProductProvider>
                <AutoScrollToTop />
                <Routes>

                    {/* ==============================================
                        PHE 1: KHÁCH HÀNG 
                    ================================================ */}
                    <Route element={<MainLayouts />}>
                        <Route path="/" element={<HomePage />} />
                        <Route path="/products" element={<ProductsPage />} />
                        <Route path="/category/:slug" element={<CategoryPage />} />
                        
                        {/* TUYỆT CHIÊU ĐỊNH TUYẾN ĐỘNG CHO 45+ SẢN PHẨM */}
                        <Route path="/product/:id" element={<ProductDetailPage />} />
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
            </ProductProvider>
        </SettingsProvider>
    );
};

export default AppRoutes;