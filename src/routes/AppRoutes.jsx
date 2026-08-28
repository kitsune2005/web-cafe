import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

// ================= LAYOUTS =================
import MainLayouts from '../layouts/MainLayouts';
import AdminLayout from '../layouts/adminLayout/AdminLayout';

// ================= CLIENT PAGES =================
import HomePage from '../pages/HomePage';
import ProductsPage from '../pages/ProductsPage/ProductsPage'; 
// (Sau này Boss có trang Cart, Checkout thì import thêm vào đây)

// ================= ADMIN PAGES =================
import ProductManage from '../pages/AdminPage/ProductManage/ProductManage';

const AppRoutes = () => {
  const { currentUser } = useAuth();

  // 🛡️ BẢO VỆ ROUTE ADMIN: Chỉ cho phép tài khoản Admin vào
  const ProtectedAdminRoute = ({ children }) => {
    // Nếu chưa đăng nhập hoặc không phải admin thì đá văng ra Trang chủ
    if (!currentUser || currentUser.role !== 'admin') {
      return <Navigate to="/" replace />;
    }
    return children;
  };

  return (
    <Routes>
      
      {/* ==============================================
          PHE 1: KHÁCH HÀNG (Bọc trong MainLayouts có Header/Footer)
      ================================================ */}
      <Route element={<MainLayouts />}>
        {/* Nhìn nè Boss, HomePage và ProductsPage đang nằm gọn ở đây! */}
        <Route path="/" element={<HomePage />} />
        <Route path="/products" element={<ProductsPage />} />
      </Route>

      {/* ==============================================
          PHE 2: ADMIN (Bọc trong AdminLayout có Sidebar bên trái)
      ================================================ */}
      <Route 
        path="/admin" 
        element={
          <ProtectedAdminRoute>
            <AdminLayout />
          </ProtectedAdminRoute>
        }
      >
        {/* Mặc định gõ "/admin" sẽ tự động nhảy sang "/admin/dashboard" */}
        <Route index element={<Navigate to="dashboard" replace />} />
        
        {/* Các trang con của Admin */}
        <Route path="dashboard" element={<h2>Trang Dashboard đang xây dựng...</h2>} />
        <Route path="products" element={<ProductManage />} />
      </Route>

      {/* ==============================================
          BẮT LỖI 404 (Khi gõ đường link tào lao)
      ================================================ */}
      <Route path="*" element={
        <div style={{ textAlign: 'center', padding: '100px 0' }}>
          <h1>404 - Lạc đường rồi Boss Kitsune ơi! 🦊</h1>
        </div>
      } />

    </Routes>
  );
};

export default AppRoutes;