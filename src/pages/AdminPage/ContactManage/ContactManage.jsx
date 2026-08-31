import React from "react";
import { useContact } from "../../../context/ContactContext";
import Swal from 'sweetalert2';
import toast from 'react-hot-toast';
import "./ContactManage.css";

const ContactManage = () => {
  const { contacts, loading, markAsRead, deleteContact } = useContact();

  const safeContacts = Array.isArray(contacts) ? contacts : [];
  const unreadCount = safeContacts.filter(item => item.status === "unread").length;

  const formatDate = (date) => {
    if (!date) return "";
    return new Date(date).toLocaleString("vi-VN");
  };

  const handleRead = async (id) => {
    try {
      await markAsRead(id);
      toast.success("Đã đánh dấu là Đã xem!", { id: 'read-success' });
    } catch (error) {
      toast.error(error.message || "Có lỗi xảy ra!");
    }
  };

  const handleDelete = (id, name) => {
    Swal.fire({
      title: 'Xóa liên hệ?',
      text: `Boss có chắc muốn xóa tin nhắn của "${name}" không?`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#fa5252',
      cancelButtonColor: '#888',
      confirmButtonText: 'Xóa luôn!'
    }).then(async (result) => {
      if (result.isConfirmed) {
        try {
          await deleteContact(id);
          toast.success("Đã xóa liên hệ thành công!");
        } catch (error) {
          toast.error(error.message || "Không thể xóa!");
        }
      }
    });
  };

  if (loading) {
    return (
      <div className="news-loading" style={{ minHeight: '400px', display: 'flex', justifyContent: 'center', alignItems: 'center', color: '#6f4323', fontWeight: 'bold' }}>
        <i className="fa-solid fa-spinner fa-spin" style={{ marginRight: '10px' }}></i> Đang tải liên hệ...
      </div>
    );
  }

  return (
    <div className="admin-dashboard-container">

      {/* =====================
          HEADER TỔNG
      ===================== */}
      <div className="dashboard-header">
        <h2 className="dashboard-title">Contact List</h2>
        <p className="dashboard-subtitle">Quản lý tin nhắn và phản hồi từ khách hàng.</p>
      </div>

      <div className="product-manage-layout">

        {/* =====================
            CỘT TRÁI: BẢNG DỮ LIỆU
        ===================== */}
        <div className="product-main-area dashboard-recent-orders">

          {safeContacts.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '60px 20px', color: '#888' }}>
              <i className="fa-regular fa-envelope-open" style={{ fontSize: '50px', marginBottom: '15px', color: '#ccc' }}></i>
              <h3>Chưa có liên hệ nào</h3>
              <p>Khi khách hàng gửi tin nhắn, chúng sẽ xuất hiện ở đây.</p>
            </div>
          ) : (
            <div className="contact-table-wrap">
              <table className="contact-table">
                <thead>
                  <tr>
                    <th>Khách hàng</th>
                    <th>Liên hệ</th>
                    <th>Nội dung</th>
                    <th>Ngày gửi</th>
                    <th>Trạng thái</th>
                    <th>Hành động</th>
                  </tr>
                </thead>
                <tbody>
                  {safeContacts.map(item => (
                    <tr key={item.id} className={item.status === "unread" ? "unread-row" : ""}>

                      <td><strong>{item.name}</strong></td>

                      <td>
                        <div className="contact-customer-info">
                          <span><i className="fa-solid fa-phone"></i> {item.phone}</span>
                          <span><i className="fa-regular fa-envelope"></i> {item.email}</span>
                        </div>
                      </td>

                      <td className="contact-message-cell">{item.message}</td>

                      <td>{formatDate(item.createdAt)}</td>

                      <td>
                        <span className={`contact-status ${item.status}`}>
                          {item.status === "unread" ? "Chưa xem" : "Đã xem"}
                        </span>
                      </td>

                      <td>
                        <div className="contact-actions">
                          {/* Tái sử dụng class action-btn của trang Sản phẩm */}
                          {item.status === "unread" && (
                            <button className="action-btn edit" onClick={() => handleRead(item.id)} title="Đánh dấu đã xem">
                              <i className="fa-regular fa-eye"></i>
                            </button>
                          )}
                          <button className="action-btn delete" onClick={() => handleDelete(item.id, item.name)} title="Xóa">
                            <i className="fa-regular fa-trash-can"></i>
                          </button>
                        </div>
                      </td>

                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* =====================
            CỘT PHẢI: THỐNG KÊ
        ===================== */}
        <aside className="product-stats-sidebar">
          <div className="stat-card-right" style={{ borderTopColor: '#1c7ed6' }}>
            <p>TỔNG LIÊN HỆ</p>
            <h3 style={{ color: '#1c7ed6' }}>{safeContacts.length} <small>Tin</small></h3>
          </div>
          <div className="stat-card-right warning">
            <p>CHƯA XEM</p>
            <h3 className="text-warning">{unreadCount} <small>Tin</small></h3>
          </div>
        </aside>

      </div>
    </div>
  );
};

export default ContactManage;