import React, { useState, useEffect } from 'react';
import { useAuth } from "../../context/AuthContext.jsx";
import { GoogleLogin } from '@react-oauth/google';
import { jwtDecode } from 'jwt-decode';
import { useNavigate } from 'react-router-dom';
import Swal from 'sweetalert2';
import './AuthModal.css';

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
  const navigate = useNavigate();
  
  const [mode, setMode] = useState('login');
  const [formData, setFormData] = useState({ name: '', username: '', email: '', password: '' });
  const [loading, setLoading] = useState(false);
  
  const [errors, setErrors] = useState({});

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
    if (errors[e.target.name]) {
        setErrors(prev => ({ ...prev, [e.target.name]: '' }));
    }
  };

  const handleSwitchMode = (newMode) => {
    setMode(newMode);
    setErrors({}); 
  };

  // 1. Xử lý Google Login
  const handleGoogleSuccess = async (credentialResponse) => {
    setLoading(true);
    setErrors({});
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
        
        if (result.user && result.user.role === 'admin') {
          navigate('/admin');
        }
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
    setErrors({}); 
    
    const newErrors = {};

    // ===============================================
    // 👉 LUẬT LỆ KHẮT KHE CHO ĐĂNG KÝ
    // ===============================================
    if (mode === 'register') {
        // 1. Check Họ Tên
        if (!formData.name.trim()) {
            newErrors.name = 'Vui lòng nhập Họ và Tên';
        } else if (/\d/.test(formData.name)) {
            // Ép luật: Tên không được phép chứa số
            newErrors.name = 'Tên người không được chứa chữ số !!';
        }
        
        // 2. Check Email
        if (!formData.email.trim()) {
            newErrors.email = 'Vui lòng nhập Địa chỉ Email';
        } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
            newErrors.email = 'Địa chỉ Email không hợp lệ';
        }
    }

    // 3. Check Username
    if (!formData.username.trim()) {
        newErrors.username = 'Vui lòng nhập Tên đăng nhập';
    } else if (mode === 'register') {
        // Ép luật: Username đăng ký mới phải chứa CẢ CHỮ VÀ SỐ
        const hasLetter = /[a-zA-Z]/.test(formData.username);
        const hasNumber = /\d/.test(formData.username);
        if (!hasLetter || !hasNumber) {
            newErrors.username = 'Tên đăng nhập phải bao gồm cả chữ và số (VD: kitsune123)';
        }
    }

    // 4. Check Password
    if (!formData.password.trim()) {
        newErrors.password = 'Vui lòng nhập Mật khẩu';
    } else if (mode === 'register') {
        if (formData.password.length < 6) {
            newErrors.password = 'Mật khẩu phải có ít nhất 6 ký tự';
        } else if (/^\d+$/.test(formData.password)) {
            newErrors.password = 'Mật khẩu không được chỉ chứa toàn số';
        }
    }

    // Nếu có lỗi thì ngưng luôn, hiện chữ đỏ lên
    if (Object.keys(newErrors).length > 0) {
        setErrors(newErrors);
        return;
    }

    setLoading(true);

    if (mode === 'register') {
      const result = await register(formData.name, formData.username, formData.email, formData.password);
      
      if (result.success) {
        Swal.fire({
          icon: 'success',
          title: 'Đăng ký thành công!',
          text: 'Tài khoản đã được tạo. Vui lòng đăng nhập để tiếp tục.',
          confirmButtonColor: '#6f4323',
          confirmButtonText: 'Đăng nhập ngay',
        }).then(() => {
          setMode('login');
          setFormData({ name: '', username: formData.username, email: '', password: '' });
          setErrors({});
        });
      } else {
        if (result.message.toLowerCase().includes('email')) {
            setErrors({ email: result.message });
        } else if (result.message.toLowerCase().includes('đăng nhập') || result.message.toLowerCase().includes('tồn tại')) {
            setErrors({ username: result.message });
        } else {
            setErrors({ server: result.message }); 
        }
      }
      setLoading(false);
    } else {
      const result = await login(formData.username, formData.password);
      if (result.success) {
        Toast.fire({
          icon: 'success',
          title: 'Đăng nhập thành công!',
        });
        onClose();
        
        if (result.user && result.user.role === 'admin') {
          navigate('/admin');
        }
      } else {
        if (result.message.toLowerCase().includes('mật khẩu')) {
            setErrors({ password: result.message });
        } else if (result.message.toLowerCase().includes('tài khoản') || result.message.toLowerCase().includes('đăng nhập')) {
            setErrors({ username: result.message });
        } else {
            setErrors({ server: result.message }); 
        }
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
          <span>HOẶC TIẾP TỤC VỚI USERNAME</span>
        </div>

        {errors.server && (
            <div style={{ color: '#fa5252', fontSize: '13px', textAlign: 'center', marginBottom: '15px', fontWeight: 'bold' }}>
                <i className="fa-solid fa-circle-exclamation"></i> {errors.server}
            </div>
        )}

        <form onSubmit={handleSubmit} className="auth-form" noValidate>
          {mode === 'register' && (
            <>
              <div className="form-group-field">
                <label>Họ và tên</label>
                <div className={`input-with-icon ${errors.name ? 'has-error' : ''}`}>
                  <i className="fa-regular fa-user"></i>
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    placeholder="Ví dụ: Kitsune Coffee"
                    disabled={loading}
                    style={{ borderColor: errors.name ? '#fa5252' : '' }}
                  />
                </div>
                {errors.name && <span style={{ color: '#fa5252', fontSize: '12px', marginTop: '5px', display: 'block' }}>{errors.name}</span>}
              </div>

              <div className="form-group-field">
                <label>Địa chỉ Email</label>
                <div className={`input-with-icon ${errors.email ? 'has-error' : ''}`}>
                  <i className="fa-regular fa-envelope"></i>
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    placeholder="tenban@domain.com"
                    disabled={loading}
                    style={{ borderColor: errors.email ? '#fa5252' : '' }}
                  />
                </div>
                {errors.email && <span style={{ color: '#fa5252', fontSize: '12px', marginTop: '5px', display: 'block' }}>{errors.email}</span>}
              </div>
            </>
          )}

          <div className="form-group-field">
            <label>Tên đăng nhập</label>
            <div className={`input-with-icon ${errors.username ? 'has-error' : ''}`}>
              <i className="fa-solid fa-at"></i>
              <input
                type="text"
                name="username"
                value={formData.username}
                onChange={handleChange}
                placeholder="Ví dụ: kitsune_123"
                disabled={loading}
                style={{ borderColor: errors.username ? '#fa5252' : '' }}
              />
            </div>
            {errors.username && <span style={{ color: '#fa5252', fontSize: '12px', marginTop: '5px', display: 'block' }}>{errors.username}</span>}
          </div>

          <div className="form-group-field">
            <label>Mật khẩu</label>
            <div className={`input-with-icon ${errors.password ? 'has-error' : ''}`}>
              <i className="fa-solid fa-lock"></i>
              <input
                type="password"
                name="password"
                value={formData.password}
                onChange={handleChange}
                placeholder="••••••••"
                disabled={loading}
                style={{ borderColor: errors.password ? '#fa5252' : '' }}
              />
            </div>
            {errors.password && <span style={{ color: '#fa5252', fontSize: '12px', marginTop: '5px', display: 'block' }}>{errors.password}</span>}
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