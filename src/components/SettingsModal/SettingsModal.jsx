import React, { useState, useEffect } from 'react';
import { useSettings } from '../../context/SettingsContext'; // Gọi bộ não xử lý
import './SettingsModal.css';

const SettingsModal = ({ isOpen, onClose }) => {
    const [activeTab, setActiveTab] = useState('appearance');

    // Rút dây điện từ bộ điều khiển trung tâm
    const { darkMode, setDarkMode, snowEffect, setSnowEffect } = useSettings();

    useEffect(() => {
        if (isOpen) {
            document.body.style.overflow = 'hidden';
            setActiveTab('appearance');
        } else {
            document.body.style.overflow = 'unset';
        }
        return () => {
            document.body.style.overflow = 'unset';
        };
    }, [isOpen]);

    if (!isOpen) return null;

    return (
        <div className="settings-modal-overlay">
            <div className="settings-modal-container">

                <button className="settings-close-btn" onClick={onClose} aria-label="Đóng cài đặt">
                    <i className="fa-solid fa-xmark"></i>
                </button>

                <div className="settings-layout">
                    {/* CỘT TRÁI: MENU */}
                    <div className="settings-sidebar">
                        <h3 className="settings-title">Cài Đặt</h3>
                        <ul className="settings-menu">
                            <li className={activeTab === 'appearance' ? 'active' : ''} onClick={() => setActiveTab('appearance')}>
                                <i className="fa-solid fa-palette"></i> Hiển thị
                            </li>
                            <li className={activeTab === 'notifications' ? 'active' : ''} onClick={() => setActiveTab('notifications')}>
                                <i className="fa-regular fa-bell"></i> Thông báo
                            </li>
                            <li className={activeTab === 'security' ? 'active' : ''} onClick={() => setActiveTab('security')}>
                                <i className="fa-solid fa-shield-halved"></i> Bảo mật
                            </li>
                        </ul>
                    </div>

                    {/* CỘT PHẢI: NỘI DUNG */}
                    <div className="settings-content">

                        {/* Tab 1: Hiển thị */}
                        {activeTab === 'appearance' && (
                            <div className="settings-pane fade-in">
                                <h4>Giao diện & Hiển thị</h4>
                                <p className="settings-desc">Tùy chỉnh cách Fox Coffee hiển thị trên thiết bị của bạn.</p>

                                <div className="setting-item">
                                    <div className="setting-info">
                                        <span className="setting-name">Giao diện tối (Dark Mode)</span>
                                        <span className="setting-sub">Giúp dịu mắt buổi tối</span>
                                    </div>
                                    <label className="settings-switch">
                                        <input
                                            type="checkbox"
                                            checked={darkMode}
                                            onChange={(e) => setDarkMode(e.target.checked)}
                                        />
                                        <span className="settings-slider"></span>
                                    </label>
                                </div>

                                <div className="setting-item">
                                    <div className="setting-info">
                                        <span className="setting-name">Hiệu ứng tuyết rơi (Giáng sinh)</span>
                                        <span className="setting-sub">Bật hiệu ứng trang trí theo mùa lễ hội.</span>
                                    </div>
                                    <label className="settings-switch">
                                        <input
                                            type="checkbox"
                                            checked={snowEffect}
                                            onChange={(e) => setSnowEffect(e.target.checked)}
                                        />
                                        <span className="settings-slider"></span>
                                    </label>
                                </div>
                            </div>
                        )}

                        {/* Tab 2: Thông báo */}
                        {activeTab === 'notifications' && (
                            <div className="settings-pane fade-in">
                                <h4>Tùy chỉnh thông báo</h4>
                                <p className="settings-desc">Quản lý cách chúng tôi liên lạc với bạn.</p>

                                <div className="setting-item">
                                    <div className="setting-info">
                                        <span className="setting-name">Email khuyến mãi</span>
                                        <span className="setting-sub">Nhận voucher giảm giá cà phê hàng tuần.</span>
                                    </div>
                                    <label className="settings-switch">
                                        <input type="checkbox" defaultChecked />
                                        <span className="settings-slider"></span>
                                    </label>
                                </div>

                                <div className="setting-item">
                                    <div className="setting-info">
                                        <span className="setting-name">Cập nhật đơn hàng</span>
                                        <span className="setting-sub">Nhắn tin khi cà phê đang được giao đến bạn.</span>
                                    </div>
                                    <label className="settings-switch">
                                        <input type="checkbox" defaultChecked />
                                        <span className="settings-slider"></span>
                                    </label>
                                </div>
                            </div>
                        )}

                        {/* Tab 3: Bảo mật */}
                        {activeTab === 'security' && (
                            <div className="settings-pane fade-in">
                                <h4>Bảo mật tài khoản</h4>
                                <p className="settings-desc">Bảo vệ tài khoản của bạn khỏi những kẻ trộm công thức pha chế.</p>

                                <div className="security-actions">
                                    <button className="btn-change-password">
                                        <i className="fa-solid fa-key"></i> Đổi mật khẩu mới
                                    </button>
                                    <button className="btn-enable-2fa">
                                        <i className="fa-solid fa-mobile-screen-button"></i> Bật xác thực 2 lớp (2FA)
                                    </button>
                                </div>
                            </div>
                        )}

                    </div>
                </div>
            </div>
        </div>
    );
};

export default SettingsModal;