import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext.jsx';
import { GoogleLogin } from '@react-oauth/google';
import { jwtDecode } from 'jwt-decode';
import Swal from 'sweetalert2';
import './AuthModal.css';

// Cấu hình Toast popup góc trên bên phải
const Toast = Swal.mixin({
  toast: true,
  position: 'top-end',
  showConfirmButton: false,
  timer: 2000,
  timerProgressBar: true,
  didOpen: (toast) => {
    toast.addEventListener('mouseenter', Swal.stopTimer);
    toast.addEventListener('mouseleave', Swal.resumeTimer);
  }
});

const AuthModal = ({ isOpen, onClose }) => {
  const { login, register, googleLogin } = useAuth();
  const [mode, setMode] = useState('login');
  const [formData, setFormData] = useState({ name: '', email: '', password: '' });
  const [loading, setLoading] = useState(false);

  // Khóa cuộn trang khi Modal mở (Luôn đặt trên đầu Hook)
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSwitchMode = (newMode) => {
    setMode(newMode);
  };

  // 1. Xử lý Google Login
  const handleGoogleSuccess = async (credentialResponse) => {
    setLoading(true);
    try {
      const decoded = jwtDecode(credentialResponse.credential);
      const googleUserData = {
        name: decoded.name,
        email: decoded.email,
        googleId: decoded.sub,
        avatar: decoded.picture,
      };

      const result = await googleLogin(googleUserData);
      if (result.success) {
        Toast.fire({
          icon: 'success',
          title: result.isNewUser ? 'Tạo tài khoản Google thành công!' : 'Đăng nhập Google thành công!',
        });
        onClose();
      } else {
        Swal.fire({
          icon: 'error',
          title: 'Đăng nhập Google thất bại',
          text: result.message || 'Không thể đăng nhập bằng Google.',
          confirmButtonColor: '#6f4323',
        });
      }
    } catch (err) {
      Swal.fire({
        icon: 'error',
        title: 'Lỗi xác thực',
        text: 'Không thể giải mã dữ liệu Google.',
        confirmButtonColor: '#6f4323',
      });
    } finally {
      setLoading(false);
    }
  };

  // 2. Xử lý Đăng ký / Đăng nhập thường
  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    if (mode === 'register') {
      const result = await register(formData.name, formData.email, formData.password);
      if (result.success) {
        Swal.fire({
          icon: 'success',
          title: 'Đăng ký thành công!',
          text: 'Tài khoản đã được tạo. Vui lòng đăng nhập để tiếp tục.',
          confirmButtonColor: '#6f4323',
          confirmButtonText: 'Đăng nhập ngay',
        }).then(() => {
          setMode('login');
          setFormData({ name: '', email: formData.email, password: '' });
        });
      } else {
        Swal.fire({
          icon: 'error',
          title: 'Đăng ký thất bại',
          text: result.message || 'Email này đã tồn tại trong hệ thống.',
          confirmButtonColor: '#6f4323',
        });
      }
      setLoading(false);
    } else {
      const result = await login(formData.email, formData.password);
      if (result.success) {
        Toast.fire({
          icon: 'success',
          title: 'Đăng nhập thành công!',
        });
        onClose();
      } else {
        Swal.fire({
          icon: 'error',
          title: 'Đăng nhập thất bại',
          text: result.message || 'Email hoặc mật khẩu không chính xác.',
          confirmButtonColor: '#6f4323',
        });
      }
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="auth-modal-overlay">
      <div className="auth-modal-card">
        <button className="auth-modal-close" onClick={onClose} aria-label="Đóng">
          <i className="fa-solid fa-xmark"></i>
        </button>

        <div className="auth-header">
          <div className="auth-icon-badge">
            <i className={mode === 'login' ? 'fa-solid fa-mug-hot' : 'fa-solid fa-user-plus'}></i>
          </div>
          <h2>{mode === 'login' ? 'Chào Mừng Trở Lại' : 'Tạo Tài Khoản Mới'}</h2>
          <p className="auth-subtitle">
            {mode === 'login'
              ? 'Đăng nhập để nhận ưu đãi và quản lý đơn hàng'
              : 'Gia nhập cộng đồng yêu hương vị cà phê'}
          </p>
        </div>

        {/* Nút Đăng nhập Google */}
        <div className="google-auth-wrapper">
          <GoogleLogin
            onSuccess={handleGoogleSuccess}
            onError={() => {
              Swal.fire({
                icon: 'error',
                title: 'Thất bại',
                text: 'Đăng nhập bằng Google không thành công!',
                confirmButtonColor: '#6f4323',
              });
            }}
            useOneTap={false}
            shape="pill"
            theme="outline"
            text={mode === 'login' ? 'signin_with' : 'signup_with'}
            width="100%"
          />
        </div>

        <div className="auth-divider">
          <span>HOẶC TIẾP TỤC VỚI EMAIL</span>
        </div>

        {/* Form nhập liệu */}
        <form onSubmit={handleSubmit} className="auth-form">
          {mode === 'register' && (
            <div className="form-group-field">
              <label>Họ và tên</label>
              <div className="input-with-icon">
                <i className="fa-regular fa-user"></i>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  required
                  placeholder="Ví dụ: Kitsune Coffee"
                  disabled={loading}
                />
              </div>
            </div>
          )}

          <div className="form-group-field">
            <label>Địa chỉ Email</label>
            <div className="input-with-icon">
              <i className="fa-regular fa-envelope"></i>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                required
                placeholder="tenban@domain.com"
                disabled={loading}
              />
            </div>
          </div>

          <div className="form-group-field">
            <label>Mật khẩu</label>
            <div className="input-with-icon">
              <i className="fa-solid fa-lock"></i>
              <input
                type="password"
                name="password"
                value={formData.password}
                onChange={handleChange}
                required
                placeholder="••••••••"
                disabled={loading}
              />
            </div>
          </div>

          <button type="submit" className={`auth-submit-btn ${loading ? 'is-loading' : ''}`} disabled={loading}>
            {loading ? (
              <span className="btn-loading-wrap">
                <span className="auth-spinner"></span>
                <span>Đang xử lý...</span>
              </span>
            ) : (
              <span>{mode === 'login' ? 'Đăng Nhập Ngay' : 'Hoàn Tất Đăng Ký'}</span>
            )}
          </button>
        </form>

        <div className="auth-footer-switch">
          {mode === 'login' ? (
            <p>
              Chưa có tài khoản?{' '}
              <button type="button" onClick={() => handleSwitchMode('register')}>
                Đăng ký thành viên
              </button>
            </p>
          ) : (
            <p>
              Đã có tài khoản?{' '}
              <button type="button" onClick={() => handleSwitchMode('login')}>
                Đăng nhập ngay
              </button>
            </p>
          )}
        </div>
      </div>
    </div>
  );
};

export default AuthModal;