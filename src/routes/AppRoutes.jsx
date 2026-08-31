import React from "react";
import { Routes, Route, Navigate } from "react-router-dom";

import { useAuth } from "../context/AuthContext";

// ================= CONTEXT =================
import { SettingsProvider } from "../context/SettingsContext";
import { ProductProvider } from "../context/ProductContext";
import { CartProvider } from "../context/CartContext";
import { NewsProvider } from "../context/NewsContext";
import { ContactProvider } from "../context/ContactContext";

import { Toaster } from "react-hot-toast";

// ================= LAYOUTS =================
import MainLayouts from "../layouts/MainLayouts";
import AdminLayout from "../layouts/adminLayout/AdminLayout";

// ================= CLIENT PAGES =================
import HomePage from "../pages/HomePage";

import ProductsPage from "../pages/ProductsPage/ProductsPage";
import CategoryPage from "../pages/CategoryPage/CategoryPage";
import ProductDetailPage from "../pages/ProductDetailPage/ProductDetailPage";

import NewsPage from "../pages/NewsPage/NewsPage";
import NewsDetailPage from "../pages/NewsDetailPage/NewsDetailPage";

import ContactPage from "../pages/ContactPage/ContactPage";

import CartPage from "../pages/CartPage/CartPage";
import CheckoutPage from "../pages/CheckoutPage/CheckoutPage";
import MyOrdersPage from "../pages/MyOrdersPage/MyOrdersPage";

import SearchPage from "../pages/SearchPage/SearchPage";

// ================= ADMIN PAGES =================
import Dashboard from "../pages/AdminPage/Dashboard/Dashboard";
import ProductManage from "../pages/AdminPage/ProductManage/ProductManage";
import NewsManage from "../pages/AdminPage/NewsManage/NewsManage";
import ContactManage from "../pages/AdminPage/ContactManage/ContactManage";
import OrderManage from "../pages/AdminPage/OrderManage/OrderManage";
import ProductStoryManage from "../pages/AdminPage/ProductStoryManage/ProductStoryManage";
import CustomerManage from "../pages/AdminPage/CustomerManage/CustomerManage";

// ================= COMPONENT =================
import AutoScrollToTop from "./AutoScrollToTop";

const AppRoutes = () => {
    const { currentUser, loading } = useAuth();

    // Route bảo vệ khu vực Admin: chỉ cho phép user có role "admin" truy cập
    const ProtectedAdminRoute = ({ children }) => {
        // Đang xác thực -> hiển thị loading
        if (loading) {
            return (
                <div style={{ height: "100vh", display: "flex", justifyContent: "center", alignItems: "center" }}>
                    <h3 style={{ color: "#6f4323" }}>
                        <i className="fa-solid fa-spinner fa-spin"></i> Đang tải dữ liệu Admin...
                    </h3>
                </div>
            );
        }

        // Chưa đăng nhập hoặc không phải admin -> đá về trang chủ
        if (!currentUser || currentUser.role !== "admin") {
            return <Navigate to="/" replace />;
        }

        return children;
    };

    return (
        <SettingsProvider>
            <CartProvider>
                <ProductProvider>
                    <ContactProvider>
                        <NewsProvider>
                            <AutoScrollToTop />
                            <Toaster position="top-center" reverseOrder={false} />

                            <Routes>
                                {/* ===================== CLIENT ROUTES ===================== */}
                                <Route element={<MainLayouts />}>
                                    <Route path="/" element={<HomePage />} />

                                    {/* Sản phẩm */}
                                    <Route path="/products" element={<ProductsPage />} />
                                    <Route path="/category/:slug" element={<CategoryPage />} />
                                    <Route path="/product/:id" element={<ProductDetailPage />} />

                                    {/* Tin tức */}
                                    <Route path="/news" element={<NewsPage />} />
                                    <Route path="/news/:id" element={<NewsDetailPage />} />

                                    {/* Liên hệ */}
                                    <Route path="/contact" element={<ContactPage />} />

                                    {/* Giỏ hàng & thanh toán */}
                                    <Route path="/cart" element={<CartPage />} />
                                    <Route path="/checkout" element={<CheckoutPage />} />
                                    <Route path="/my-orders" element={<MyOrdersPage />} />

                                    {/* Tìm kiếm sản phẩm */}
                                    <Route path="/search" element={<SearchPage />} />
                                </Route>

                                {/* ===================== ADMIN ROUTES ===================== */}
                                <Route
                                    path="/admin"
                                    element={
                                        <ProtectedAdminRoute>
                                            <AdminLayout />
                                        </ProtectedAdminRoute>
                                    }
                                >
                                    {/* Mặc định vào /admin -> chuyển hướng sang dashboard */}
                                    <Route index element={<Navigate to="dashboard" replace />} />

                                    <Route path="dashboard" element={<Dashboard />} />
                                    <Route path="products" element={<ProductManage />} />
                                    <Route path="product-story" element={<ProductStoryManage />} />
                                    <Route path="orders" element={<OrderManage />} />
                                    <Route path="customers" element={<CustomerManage />} />
                                    <Route path="news" element={<NewsManage />} />
                                    <Route path="contacts" element={<ContactManage />} />
                                </Route>

                                {/* ===================== 404 - NOT FOUND ===================== */}
                                <Route
                                    path="*"
                                    element={
                                        <div style={{ textAlign: "center", padding: "100px 0" }}>
                                            <h1 style={{ color: "#6f4323" }}>404 - Lạc đường rồi 🦊</h1>
                                        </div>
                                    }
                                />
                            </Routes>
                        </NewsProvider>
                    </ContactProvider>
                </ProductProvider>
            </CartProvider>
        </SettingsProvider>
    );
};

export default AppRoutes;