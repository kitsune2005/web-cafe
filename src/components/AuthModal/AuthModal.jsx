import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext.jsx';
import './AuthModal.css';

const AuthModal = ({ isOpen, onClose }) => {
  const { login, register } = useAuth();
  const [mode, setMode] = useState('login'); // 'login' hoặc 'register'
  const [formData, setFormData] = useState({ name: '', email: '', password: '' });
  const [loading, setLoading] = useState(false);
  const [alert, setAlert] = useState(null); // { type: 'success' | 'error', message: '' }

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    if (alert) setAlert(null);
  };

  const handleSwitchMode = (newMode) => {
    setMode(newMode);
    setAlert(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setAlert(null);

    if (mode === 'register') {
      const result = await register(formData.name, formData.email, formData.password);
      if (result.success) {
        setAlert({
          type: 'success',
          title: 'Đăng ký thành công!',
          message: 'Hồ sơ đã được lưu. Đang tự động chuyển sang trang Đăng nhập...',
        });
        setTimeout(() => {
          setMode('login');
          setFormData({ name: '', email: formData.email, password: '' });
          setAlert(null);
          setLoading(false);
        }, 2200);
      } else {
        setAlert({
          type: 'error',
          title: 'Đăng ký thất bại',
          message: result.message || 'Email này đã tồn tại hoặc xảy ra lỗi hệ thống.',
        });
        setLoading(false);
      }
    } else {
      const result = await login(formData.email, formData.password);
      if (result.success) {
        setAlert({
          type: 'success',
          title: 'Đăng nhập thành công!',
          message: 'Chào mừng Kitsune quay trở lại thưởng thức cà phê!',
        });
        setTimeout(() => {
          onClose();
          setAlert(null);
          setLoading(false);
        }, 1800);
      } else {
        setAlert({
          type: 'error',
          title: 'Đăng nhập thất bại',
          message: result.message || 'Email hoặc mật khẩu không chính xác.',
        });
        setLoading(false);
      }
    }
  };

  if (!isOpen) return null;

  return (
    <div className="auth-modal-overlay" onClick={onClose}>
      <div className="auth-modal-card" onClick={(e) => e.stopPropagation()}>
        <button className="auth-modal-close" onClick={onClose} aria-label="Đóng">
          <i className="fa-solid fa-xmark"></i>
        </button>

        {/* Header Modal */}
        <div className="auth-header">
          <div className="auth-icon-badge">
            <i className={mode === 'login' ? 'fa-solid fa-mug-hot' : 'fa-solid fa-user-plus'}></i>
          </div>
          <h2>{mode === 'login' ? 'Chào Mừng Trở Lại' : 'Tạo Tài Khoản Mới'}</h2>
          <p className="auth-subtitle">
            {mode === 'login'
              ? 'Đăng nhập để nhận các ưu đãi và quản lý đơn hàng'
              : 'Gia nhập cộng đồng yêu hương vị cà phê nguyên bản'}
          </p>
        </div>

        {/* Khung thông báo UI/UX */}
        {alert && (
          <div className={`auth-alert auth-alert-${alert.type}`}>
            <div className="auth-alert-icon">
              <i className={alert.type === 'success' ? 'fa-solid fa-circle-check' : 'fa-solid fa-triangle-exclamation'}></i>
            </div>
            <div className="auth-alert-content">
              <h4>{alert.title}</h4>
              <p>{alert.message}</p>
            </div>
            {alert.type === 'success' && <div className="auth-alert-progress"></div>}
          </div>
        )}

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

          {/* Nút Submit có Loading Spinner */}
          <button type="submit" className={`auth-submit-btn ${loading ? 'is-loading' : ''}`} disabled={loading}>
            {loading ? (
              <span className="btn-loading-wrap">
                <span className="auth-spinner"></span>
                <span>Đang xử lý dữ liệu...</span>
              </span>
            ) : (
              <span>{mode === 'login' ? 'Đăng Nhập Ngay' : 'Hoàn Tất Đăng Ký'}</span>
            )}
          </button>
        </form>

        {/* Switch Login / Register */}
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