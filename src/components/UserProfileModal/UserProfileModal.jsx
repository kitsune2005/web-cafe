import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from "../../context/AuthContext.jsx";
import Swal from 'sweetalert2';
import './UserProfileModal.css';

const UserProfileModal = ({ isOpen, onClose }) => {
  const { currentUser, updateUser, logout } = useAuth();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  
  // State mới cho Ảnh đại diện
  const [avatar, setAvatar] = useState('');
  const [previewAvatar, setPreviewAvatar] = useState('');
  const fileInputRef = useRef(null);
  
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
      if (currentUser) {
        setName(currentUser.name || '');
        setEmail(currentUser.email || '');
        // Load avatar từ user lên form
        setAvatar(currentUser.avatar || '');
        setPreviewAvatar(currentUser.avatar || '');
      }
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen, currentUser]);

  if (!isOpen || !currentUser) return null;

  // HÀM XỬ LÝ KHI CHỌN ẢNH TỪ MÁY
  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      // Giới hạn ảnh 5MB
      if (file.size > 5 * 1024 * 1024) {
        Swal.fire({
          icon: 'error',
          title: 'Ảnh quá lớn',
          text: 'Vui lòng chọn ảnh có kích thước dưới 5MB.',
          confirmButtonColor: '#6f4323'
        });
        return;
      }

      // Đọc file thành chuỗi Base64 để hiển thị & lưu DB
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreviewAvatar(reader.result); // Hiển thị lập tức
        setAvatar(reader.result);        // Lưu vào state để chờ bấm "Lưu"
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSave = async (e) => {
    e.preventDefault();
    if (!name.trim()) {
      Swal.fire({
        icon: 'warning',
        title: 'Chưa hợp lệ',
        text: 'Vui lòng điền họ và tên!',
        confirmButtonColor: '#6f4323',
      });
      return;
    }

    setLoading(true);
    // TRUYỀN THÊM AVATAR VÀO HÀM UPDATE
    const result = await updateUser(name.trim(), email.trim(), avatar);
    setLoading(false);

    if (result && result.success !== false) {
      Swal.fire({
        toast: true,
        position: 'top-end',
        icon: 'success',
        title: 'Cập nhật thông tin thành công!',
        showConfirmButton: false,
        timer: 2000,
        timerProgressBar: true,
      });
      onClose();
    } else {
      Swal.fire({
        icon: 'error',
        title: 'Thất bại',
        text: result?.message || 'Không thể lưu thay đổi vào cơ sở dữ liệu.',
        confirmButtonColor: '#6f4323',
      });
    }
  };

  const handleLogout = () => {
    onClose();
    Swal.fire({
      title: 'Đăng xuất tài khoản?',
      text: 'Bạn có chắc chắn muốn đăng xuất không?',
      icon: 'question',
      showCancelButton: true,
      confirmButtonColor: '#6f4323',
      cancelButtonColor: '#888',
      confirmButtonText: 'Đồng ý',
      cancelButtonText: 'Hủy bỏ',
      allowOutsideClick: false,
    }).then((res) => {
      if (res.isConfirmed) {
        Swal.fire({
          title: 'Đang đăng xuất...',
          text: 'Vui lòng chờ trong giây lát',
          allowOutsideClick: false,
          didOpen: () => {
            Swal.showLoading();
            setTimeout(() => {
              logout();
              Swal.fire({
                toast: true,
                position: 'top-end',
                icon: 'success',
                title: 'Đã đăng xuất thành công!',
                showConfirmButton: false,
                timer: 2000,
                timerProgressBar: true,
              });
            }, 600);
          },
        });
      }
    });
  };

  return (
    <div className="profile-modal-overlay">
      <div className="profile-modal-card">
        <button className="profile-modal-close" onClick={onClose} aria-label="Đóng">
          <i className="fa-solid fa-xmark"></i>
        </button>

        {/* Avatar Header */}
        <div className="profile-header">
          <div className="profile-avatar-container">
            {/* Vùng Bấm Thay Đổi Ảnh */}
            <div className="avatar-clickable-wrap" onClick={() => fileInputRef.current.click()}>
              {previewAvatar ? (
                <img src={previewAvatar} alt={name} className="profile-avatar-img" />
              ) : (
                <div className="profile-avatar-char">
                  {name ? name.charAt(0).toUpperCase() : 'U'}
                </div>
              )}
              
              {/* Lớp phủ chứa icon máy ảnh */}
              <div className="camera-overlay">
                <i className="fa-solid fa-camera"></i>
              </div>
            </div>

            {/* Input file ẩn đi (hỗ trợ cả chọn file & chụp camera trên đt) */}
            <input 
              type="file" 
              accept="image/*" 
              hidden 
              ref={fileInputRef} 
              onChange={handleImageChange} 
            />
          </div>
          <h2>Thông Tin Tài Khoản</h2>
          <p className="profile-user-role">Thành viên Fox Coffee</p>
        </div>

        {/* Form Chỉnh sửa */}
        <form onSubmit={handleSave} className="profile-form">
          <div className="form-group-field">
            <label>Họ và tên</label>
            <div className="input-with-icon">
              <i className="fa-regular fa-user"></i>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Nhập họ và tên"
                required
                disabled={loading}
              />
            </div>
          </div>

          <div className="form-group-field">
            <label>Địa chỉ Email</label>
            <div className="input-with-icon">
              <i className="fa-regular fa-envelope"></i>
              <input
                type="email"
                value={email}
                disabled
                className="input-disabled"
                title="Email dùng để định danh, không thể thay đổi"
              />
            </div>
          </div>

          <button type="submit" className={`profile-save-btn ${loading ? 'is-loading' : ''}`} disabled={loading}>
            {loading ? 'Đang lưu...' : 'Lưu Thay Đổi'}
          </button>
        </form>

        <div className="profile-footer">
          <button onClick={handleLogout} className="profile-logout-btn" type="button" disabled={loading}>
            <i className="fa-solid fa-arrow-right-from-bracket"></i> Đăng xuất tài khoản
          </button>
        </div>
      </div>
    </div>
  );
};

export default UserProfileModal;