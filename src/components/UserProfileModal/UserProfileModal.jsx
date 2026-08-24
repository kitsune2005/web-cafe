// src/components/UserProfileModal/UserProfileModal.jsx
import React, { useState, useEffect } from 'react';
import { useAuth } from "../../context/useAuth";
import { toast } from 'sonner';
import './UserProfileModal.css';

const UserProfileModal = ({ isOpen, onClose }) => {
  const { currentUser, updateUser, logout } = useAuth();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');

  // Đồng bộ dữ liệu khi mở modal
  useEffect(() => {
    if (isOpen && currentUser) {
      setName(currentUser.name);
      setEmail(currentUser.email);
    }
  }, [isOpen, currentUser]);

  if (!isOpen || !currentUser) return null;

  const handleSave = (e) => {
    e.preventDefault();
    if (!name.trim() || !email.trim()) {
      toast.error('Vui lòng điền đầy đủ thông tin!');
      return;
    }
    updateUser(name.trim(), email.trim());
    toast.success('Cập nhật thông tin thành công!');
    onClose();
  };

  const handleLogout = () => {
    logout();
    toast.success('Đã đăng xuất!');
    onClose();
  };

  return (
    <div className="profile-modal-overlay" onClick={onClose}>
      <div className="profile-modal" onClick={(e) => e.stopPropagation()}>
        <button className="profile-modal-close" onClick={onClose}>
          <i className="fa-solid fa-xmark"></i>
        </button>
        <h2>Thông tin tài khoản</h2>
        <div className="profile-avatar">
          {currentUser.name.charAt(0).toUpperCase()}
        </div>
        <form onSubmit={handleSave}>
          <div className="form-group">
            <label>Họ tên</label>
            <input type="text" value={name} onChange={(e) => setName(e.target.value)} required />
          </div>
          <div className="form-group">
            <label>Email</label>
            <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
          </div>
          <button type="submit" className="btn btn-primary btn-block">Lưu thay đổi</button>
        </form>
        <button onClick={handleLogout} className="profile-logout-btn">
          <i className="fa-solid fa-right-from-bracket"></i> Đăng xuất
        </button>
      </div>
    </div>
  );
};

export default UserProfileModal;