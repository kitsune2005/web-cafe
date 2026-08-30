import React from "react";
import {
    Routes,
    Route,
    Navigate
} from "react-router-dom";

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

// 👉 THÊM: Import trang Tìm kiếm mới tạo
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

    const {
        currentUser,
        loading
    } = useAuth();


    // =========================================
    // BẢO VỆ ADMIN
    // =========================================

    const ProtectedAdminRoute = ({
        children
    }) => {

        if (loading) {

            return (
                <div
                    style={{
                        height: "100vh",
                        display: "flex",
                        justifyContent: "center",
                        alignItems: "center"
                    }}
                >

                    <h3
                        style={{
                            color: "#6f4323"
                        }}
                    >
                        <i className="fa-solid fa-spinner fa-spin"></i>

                        {" "}Đang tải dữ liệu Admin...
                    </h3>

                </div>
            );
        }


        // Chưa login hoặc không phải admin
        if (
            !currentUser ||
            currentUser.role !== "admin"
        ) {

            return (
                <Navigate
                    to="/"
                    replace
                />
            );
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

                            <Toaster
                                position="top-center"
                                reverseOrder={false}
                            />


                            <Routes>

                                {/* =====================================
                    CLIENT
                ====================================== */}

                                <Route
                                    element={<MainLayouts />}
                                >

                                    {/* HOME */}
                                    <Route
                                        path="/"
                                        element={<HomePage />}
                                    />


                                    {/* PRODUCTS */}
                                    <Route
                                        path="/products"
                                        element={<ProductsPage />}
                                    />

                                    <Route
                                        path="/category/:slug"
                                        element={<CategoryPage />}
                                    />

                                    <Route
                                        path="/product/:id"
                                        element={<ProductDetailPage />}
                                    />


                                    {/* NEWS */}
                                    <Route
                                        path="/news"
                                        element={<NewsPage />}
                                    />

                                    <Route
                                        path="/news/:id"
                                        element={<NewsDetailPage />}
                                    />


                                    {/* CONTACT */}
                                    <Route
                                        path="/contact"
                                        element={<ContactPage />}
                                    />


                                    {/* CART */}
                                    <Route
                                        path="/cart"
                                        element={<CartPage />}
                                    />


                                    {/* CHECKOUT */}
                                    <Route
                                        path="/checkout"
                                        element={<CheckoutPage />}
                                    />


                                    {/* MY ORDERS */}
                                    <Route
                                        path="/my-orders"
                                        element={<MyOrdersPage />}
                                    />

                                    {/* 👉 THÊM: SEARCH PAGE */}
                                    <Route
                                        path="/search"
                                        element={<SearchPage />}
                                    />

                                </Route>


                                {/* =====================================
                    ADMIN
                ====================================== */}

                                <Route
                                    path="/admin"
                                    element={
                                        <ProtectedAdminRoute>

                                            <AdminLayout />

                                        </ProtectedAdminRoute>
                                    }
                                >

                                    {/* /admin */}
                                    <Route
                                        index
                                        element={
                                            <Navigate
                                                to="dashboard"
                                                replace
                                            />
                                        }
                                    />


                                    {/* DASHBOARD */}
                                    <Route
                                        path="dashboard"
                                        element={<Dashboard />}
                                    />


                                    {/* PRODUCTS */}
                                    <Route
                                        path="products"
                                        element={<ProductManage />}
                                    />


                                    {/* PRODUCT STORY */}
                                    <Route
                                        path="product-story"
                                        element={<ProductStoryManage />}
                                    />


                                    {/* ORDERS */}
                                    <Route
                                        path="orders"
                                        element={<OrderManage />}
                                    />


                                    {/* CUSTOMERS */}
                                    <Route
                                        path="customers"
                                        element={<CustomerManage />}
                                    />


                                    {/* NEWS */}
                                    <Route
                                        path="news"
                                        element={<NewsManage />}
                                    />


                                    {/* CONTACT */}
                                    <Route
                                        path="contacts"
                                        element={<ContactManage />}
                                    />

                                </Route>


                                {/* =====================================
                    404
                ====================================== */}

                                <Route
                                    path="*"
                                    element={
                                        <div
                                            style={{
                                                textAlign: "center",
                                                padding: "100px 0"
                                            }}
                                        >

                                            <h1
                                                style={{
                                                    color: "#6f4323"
                                                }}
                                            >
                                                404 - Lạc đường rồi 🦊
                                            </h1>

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