import React, { createContext, useContext, useState, useEffect } from 'react';

const API_BASE_URL = 'http://localhost:5000/api';

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [currentUser, setCurrentUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // 1. Khi load trang, lấy thông tin user đã lưu ở session/local
  useEffect(() => {
    const storedUser = localStorage.getItem('currentUser');
    if (storedUser) {
      setCurrentUser(JSON.parse(storedUser));
    }
    setLoading(false);
  }, []);

  // ================= ĐĂNG KÝ =================
  const register = async (name, username, email, password) => {
    try {
      const response = await fetch(`${API_BASE_URL}/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, username, email, password }),
      });
      const data = await response.json();
      if (!response.ok) return { success: false, message: data.message || 'Đăng ký thất bại!' };
      return { success: true, message: data.message || 'Đăng ký thành công!' };
    } catch (error) {
      return { success: false, message: 'Không thể kết nối đến máy chủ Backend!' };
    }
  };

  // ================= ĐĂNG NHẬP THƯỜNG =================
  const login = async (email, password) => {
    try {
      const response = await fetch(`${API_BASE_URL}/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });
      const data = await response.json();
      if (!response.ok) return { success: false, message: data.message || 'Đăng nhập thất bại!' };

      const loggedUser = data.user || data;
      setCurrentUser(loggedUser);
      localStorage.setItem('currentUser', JSON.stringify(loggedUser));

      return { success: true, message: data.message || 'Đăng nhập thành công!' };
    } catch (error) {
      return { success: false, message: 'Không thể kết nối đến máy chủ Backend!' };
    }
  };

  // ================= ĐĂNG NHẬP BẰNG GOOGLE =================
  const googleLogin = async (googleUserData) => {
    try {
      const response = await fetch(`${API_BASE_URL}/google-login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(googleUserData),
      });
      const data = await response.json();
      if (!response.ok || !data.success) return { success: false, message: data.message || 'Lỗi xác thực Google!' };

      const loggedUser = data.user;
      setCurrentUser(loggedUser);
      localStorage.setItem('currentUser', JSON.stringify(loggedUser));

      return { success: true, isNewUser: data.isNewUser, message: data.message };
    } catch (error) {
      return { success: false, message: 'Không thể kết nối đến máy chủ Backend!' };
    }
  };

  // ================= ĐĂNG XUẤT =================
  const logout = () => {
    setCurrentUser(null);
    localStorage.removeItem('currentUser');
  };

  // ================= CẬP NHẬT THÔNG TIN VÀ AVATAR =================
  // ĐÃ BỔ SUNG BIẾN avatar VÀO ĐÂY NHÉ:
  const updateUser = async (name, email, avatar) => {
    if (!currentUser) return { success: false, message: 'Bạn chưa đăng nhập!' };

    try {
      const response = await fetch(`${API_BASE_URL}/update-profile`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        // GỬI AVATAR LÊN BACKEND:
        body: JSON.stringify({ id: currentUser.id, name, email, avatar }),
      });

      const data = await response.json();

      if (!response.ok) {
        return { success: false, message: data.message || 'Cập nhật thất bại!' };
      }

      // CẬP NHẬT AVATAR VÀO STATE CỦA REACT:
      const updatedUser = { ...currentUser, name, email, avatar };
      setCurrentUser(updatedUser);
      localStorage.setItem('currentUser', JSON.stringify(updatedUser));

      return { success: true, message: 'Cập nhật thông tin thành công!' };
    } catch (error) {
      console.error(error); // In ra console để biết bị lỗi gì
      return { success: false, message: 'Lỗi kết nối Backend!' };
    }
  };

  return (
    <AuthContext.Provider
      value={{ currentUser, login, register, googleLogin, logout, updateUser, loading }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within an AuthProvider');
  return context;
};