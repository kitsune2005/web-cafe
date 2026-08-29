import React, { useState } from 'react';
import '../ProductManage/ProductManage.css'; // Dùng chung CSS để đồng bộ giao diện

const OrderManage = () => {
  const [orders] = useState([
    { id: '#ORD-1001', customer: 'Tony Trần', date: '29/08/2026', total: '1,500,000đ', payment: 'Chuyển khoản', status: 'Đang giao' },
    { id: '#ORD-1002', customer: 'Kitsune', date: '28/08/2026', total: '450,000đ', payment: 'Tiền mặt', status: 'Hoàn thành' },
    { id: '#ORD-1003', customer: 'Nguyễn Văn A', date: '28/08/2026', total: '320,000đ', payment: 'MoMo', status: 'Chờ xử lý' },
    { id: '#ORD-1004', customer: 'Lê Hoàng B', date: '27/08/2026', total: '890,000đ', payment: 'Chuyển khoản', status: 'Đã hủy' },
  ]);

  return (
    <div className="admin-page-container">
      <div className="page-header">
        <div>
          <h1 className="page-title">Quản lý Đơn hàng</h1>
          <p className="page-subtitle">Theo dõi trạng thái giao hàng và doanh thu từ khách.</p>
        </div>
      </div>

      <div className="filter-controls">
        <div className="search-box">
          <i className="fa-solid fa-magnifying-glass"></i>
          <input type="text" placeholder="Tìm theo mã đơn, tên khách hàng..." />
        </div>
        <select className="filter-select">
          <option value="all">Tất cả trạng thái</option>
          <option value="pending">Chờ xử lý</option>
          <option value="shipping">Đang giao</option>
          <option value="completed">Hoàn thành</option>
        </select>
        <select className="filter-select">
          <option>Tháng này</option>
          <option>Tháng trước</option>
        </select>
      </div>

      <div className="table-wrapper">
        <table className="admin-table">
          <thead>
            <tr>
              <th>Mã đơn</th>
              <th>Khách hàng</th>
              <th>Ngày đặt</th>
              <th>Thanh toán</th>
              <th>Tổng tiền</th>
              <th>Trạng thái</th>
              <th>Chi tiết</th>
            </tr>
          </thead>
          <tbody>
            {orders.map((order) => (
              <tr key={order.id}>
                <td className="fw-bold">{order.id}</td>
                <td>{order.customer}</td>
                <td>{order.date}</td>
                <td>{order.payment}</td>
                <td className="fw-bold text-brown">{order.total}</td>
                <td>
                  <span className={`status-badge ${
                    order.status === 'Hoàn thành' ? 'success' : 
                    order.status === 'Đang giao' ? 'warning' : 
                    order.status === 'Chờ xử lý' ? 'pending' : 'danger'
                  }`}>
                    {order.status}
                  </span>
                </td>
                <td>
                  <button className="action-btn view" title="Xem chi tiết"><i className="fa-regular fa-eye"></i></button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default OrderManage;