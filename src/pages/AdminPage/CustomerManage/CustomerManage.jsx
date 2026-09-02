import React, { useState, useEffect } from 'react';
import toast from 'react-hot-toast';
import Swal from 'sweetalert2';
import '../Dashboard/Dashboard.css'; 
import './CustomerManage.css'; 

const CustomerManage = () => {
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [formData, setFormData] = useState({ name: '', username: '', email: '', password: '' });
    const [isSubmitting, setIsSubmitting] = useState(false);

    const API_URL = 'http://localhost:5000/api';

    const fetchUsers = async () => {
        try {
            const response = await fetch(`${API_URL}/users`);
            if (response.ok) {
                const data = await response.json();
                setUsers(data.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt)));
            }
        } catch (error) {
            toast.error("Lỗi khi tải danh sách khách hàng!");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchUsers();
    }, []);

    const handleDeleteUser = (id, name, role) => {
        if (role === 'admin') {
            toast.error("Boss ơi! Đừng tự xóa chính mình chứ!");
            return;
        }

        Swal.fire({
            title: 'Tiễn khách?',
            text: `Boss có chắc muốn xóa tài khoản của "${name}" vĩnh viễn không?`,
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#fa5252',
            cancelButtonColor: '#888',
            confirmButtonText: 'Xóa luôn!'
        }).then(async (result) => {
            if (result.isConfirmed) {
                try {
                    const response = await fetch(`${API_URL}/users/${id}`, { method: 'DELETE' });
                    if (response.ok) {
                        setUsers(users.filter(u => u.id !== id));
                        toast.success(`Đã xóa tài khoản ${name} khỏi hệ thống!`);
                    } else {
                        const err = await response.json();
                        toast.error(err.message || "Lỗi xóa!");
                    }
                } catch (error) {
                    toast.error("Lỗi kết nối Server!");
                }
            }
        });
    };

    const handleCreateUser = async (e) => {
        e.preventDefault();
        setIsSubmitting(true);
        try {
            const response = await fetch(`${API_URL}/register`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(formData)
            });
            const data = await response.json();
            
            if (response.ok) {
                toast.success("Tạo tài khoản mới thành công!");
                setIsModalOpen(false);
                setFormData({ name: '', username: '', email: '', password: '' });
                fetchUsers();
            } else {
                toast.error(data.message || "Lỗi khi tạo tài khoản!");
            }
        } catch (error) {
            toast.error("Lỗi kết nối Server!");
        } finally {
            setIsSubmitting(false);
        }
    };

    const filteredUsers = users.filter(u => 
        u.name?.toLowerCase().includes(searchTerm.toLowerCase()) || 
        u.email?.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const formatDate = (isoString) => {
        if (!isoString) return 'Không rõ';
        const d = new Date(isoString);
        return d.toLocaleDateString('vi-VN');
    };

    return (
        <div className="admin-dashboard-container">
            <div className="dashboard-header">
                <h2 className="dashboard-title">Quản lý Khách hàng ({users.length} tài khoản)</h2>
                <p className="dashboard-subtitle">Theo dõi, thêm mới và xóa tài khoản của người dùng trên hệ thống.</p>
            </div>

            <div className="dashboard-recent-orders">
                
                {/* 👉 ĐÃ FIX: Né class section-header, dùng Flexbox min/rem để tự co giãn mượt mà */}
                <div style={{ marginBottom: '1.5rem', display: 'flex', gap: '1rem', flexWrap: 'wrap', width: '100%' }}>
                    
                    {/* Ô Search tự giãn, tối đa 25rem, tối thiểu tự co lại */}
                    <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center', background: '#fff', border: '1px solid #ddd', padding: '0.75rem 1rem', borderRadius: '0.5rem', flex: '1 1 min(100%, 25rem)' }}>
                        <i className="fa-solid fa-magnifying-glass" style={{ color: '#888' }}></i>
                        <input 
                            type="text" 
                            placeholder="Tìm theo tên hoặc email..." 
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            style={{ border: 'none', outline: 'none', width: '100%', fontSize: '0.875rem', minWidth: 0 }}
                        />
                    </div>

                    <button className="btn-add-customer" onClick={() => setIsModalOpen(true)}>
                        <i className="fa-solid fa-user-plus"></i> Tạo tài khoản mới
                    </button>
                </div>

                <div className="table-responsive">
                    {loading ? (
                        <div style={{ textAlign: 'center', padding: '3rem', color: '#6f4323' }}>
                            <i className="fa-solid fa-spinner fa-spin fa-2x"></i>
                        </div>
                    ) : (
                        <table className="admin-table">
                            <thead>
                                <tr>
                                    <th>NGƯỜI DÙNG</th>
                                    <th>USERNAME</th>
                                    <th>VAI TRÒ</th>
                                    <th>NGÀY THAM GIA</th>
                                    <th className="text-center" style={{textAlign: 'center'}}>THAO TÁC</th>
                                </tr>
                            </thead>
                            <tbody>
                                {filteredUsers.map(user => (
                                    <tr key={user.id}>
                                        <td>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                                                <img src={user.avatar || `https://ui-avatars.com/api/?name=${user.name}&background=random`} alt={user.name} style={{ width: '2.5rem', height: '2.5rem', borderRadius: '50%', objectFit: 'cover' }} />
                                                <div>
                                                    <strong style={{ display: 'block', color: '#333' }}>{user.name}</strong>
                                                    <span style={{ fontSize: '0.75rem', color: '#888' }}>{user.email}</span>
                                                </div>
                                            </div>
                                        </td>
                                        <td>@{user.username}</td>
                                        <td>
                                            {user.role === 'admin' ? (
                                                <span className="status-badge danger">Quyền Boss (Admin)</span>
                                            ) : (
                                                <span className="status-badge info">Khách hàng</span>
                                            )}
                                        </td>
                                        <td style={{ fontSize: '0.8125rem', color: '#666' }}>{formatDate(user.createdAt)}</td>
                                        <td style={{textAlign: 'center'}}>
                                            <button 
                                                className="action-btn delete" 
                                                title="Xóa tài khoản"
                                                onClick={() => handleDeleteUser(user.id, user.name, user.role)}
                                            >
                                                <i className="fa-solid fa-trash-can"></i>
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    )}
                </div>
            </div>

            {/* MODAL TẠO TÀI KHOẢN MỚI */}
            {isModalOpen && (
                <div className="story-modal-overlay" style={{ zIndex: 9999 }}>
                    <div className="story-modal" style={{ width: '28rem', maxWidth: '95vw' }}>
                        <div className="modal-header">
                            <h3>Tạo tài khoản mới</h3>
                            <button className="btn-close" onClick={() => setIsModalOpen(false)}>
                                <i className="fa-solid fa-xmark"></i>
                            </button>
                        </div>
                        
                        <form onSubmit={handleCreateUser}>
                            <div className="modal-body">
                                <div className="form-group">
                                    <label>Họ và tên</label>
                                    <input type="text" required placeholder="Nhập tên hiển thị..." value={formData.name} onChange={(e) => setFormData({...formData, name: e.target.value})} className="input-box" />
                                </div>
                                <div className="form-group">
                                    <label>Tên đăng nhập (Username)</label>
                                    <input type="text" required placeholder="Viết liền không dấu..." value={formData.username} onChange={(e) => setFormData({...formData, username: e.target.value})} className="input-box" />
                                </div>
                                <div className="form-group">
                                    <label>Email</label>
                                    <input type="email" required placeholder="example@gmail.com" value={formData.email} onChange={(e) => setFormData({...formData, email: e.target.value})} className="input-box" />
                                </div>
                                <div className="form-group">
                                    <label>Mật khẩu</label>
                                    <input type="password" required placeholder="Nhập mật khẩu..." value={formData.password} onChange={(e) => setFormData({...formData, password: e.target.value})} className="input-box" />
                                </div>
                            </div>
                            
                            <div className="modal-footer">
                                <button type="button" className="btn-cancel" onClick={() => setIsModalOpen(false)}>Hủy</button>
                                <button type="submit" className="btn-save" disabled={isSubmitting}>
                                    {isSubmitting ? <i className="fa-solid fa-spinner fa-spin"></i> : <i className="fa-solid fa-user-plus"></i>} Tạo ngay
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default CustomerManage;