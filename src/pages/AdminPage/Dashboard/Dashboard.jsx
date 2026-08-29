import React from 'react';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, Legend
} from 'recharts';
import './Dashboard.css';

// --- MOCK DATA (Dữ liệu giả lập để hiển thị) ---
const revenueData = [
  { name: 'T2', total: 4200000 },
  { name: 'T3', total: 3800000 },
  { name: 'T4', total: 5100000 },
  { name: 'T5', total: 4600000 },
  { name: 'T6', total: 6200000 },
  { name: 'T7', total: 8500000 },
  { name: 'CN', total: 9100000 },
];

const categoryData = [
  { name: 'Cà phê Hạt', value: 45 },
  { name: 'Cà phê Bột', value: 30 },
  { name: 'Dụng cụ pha', value: 15 },
  { name: 'Khác', value: 10 },
];

const COLORS = ['#6f4323', '#c5a880', '#b23a2c', '#e2ded9'];

const recentOrders = [
  { id: '#ORD-001', customer: 'Nguyễn Văn A', total: '450,000đ', status: 'Hoàn thành' },
  { id: '#ORD-002', customer: 'Trần Thị B', total: '1,250,000đ', status: 'Đang giao' },
  { id: '#ORD-003', customer: 'Lê Hoàng C', total: '320,000đ', status: 'Chờ xử lý' },
  { id: '#ORD-004', customer: 'Phạm Văn D', total: '890,000đ', status: 'Hoàn thành' },
];

const Dashboard = () => {
  return (
    <div className="admin-dashboard-container">
      <div className="dashboard-header">
        <h1 className="dashboard-title">Tổng quan hệ thống</h1>
        <p className="dashboard-subtitle">Chào mừng Kitsune quay trở lại! Hôm nay doanh thu rất tốt. ☕📈</p>
      </div>

      {/* TẦNG 1: CÁC THẺ THỐNG KÊ (STAT CARDS) */}
      <div className="dashboard-stats-grid">
        <div className="stat-card">
          <div className="stat-icon income">
            <i className="fa-solid fa-sack-dollar"></i>
          </div>
          <div className="stat-info">
            <h3>Tổng doanh thu</h3>
            <p className="stat-value">41,500,000đ</p>
            <span className="stat-trend positive"><i className="fa-solid fa-arrow-trend-up"></i> +15.5%</span>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon orders">
            <i className="fa-solid fa-cart-shopping"></i>
          </div>
          <div className="stat-info">
            <h3>Đơn hàng mới</h3>
            <p className="stat-value">156</p>
            <span className="stat-trend positive"><i className="fa-solid fa-arrow-trend-up"></i> +5.2%</span>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon customers">
            <i className="fa-solid fa-users"></i>
          </div>
          <div className="stat-info">
            <h3>Khách hàng</h3>
            <p className="stat-value">1,245</p>
            <span className="stat-trend neutral"><i className="fa-solid fa-minus"></i> 0.0%</span>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon products">
            <i className="fa-solid fa-mug-hot"></i>
          </div>
          <div className="stat-info">
            <h3>Sản phẩm bán ra</h3>
            <p className="stat-value">842</p>
            <span className="stat-trend negative"><i className="fa-solid fa-arrow-trend-down"></i> -1.5%</span>
          </div>
        </div>
      </div>

      {/* TẦNG 2: BIỂU ĐỒ (CHARTS) */}
      <div className="dashboard-charts-grid">
        {/* Biểu đồ Cột - Doanh thu */}
        <div className="chart-box main-chart">
          <div className="chart-header">
            <h3>Doanh thu 7 ngày qua</h3>
            <select className="chart-filter">
              <option>Tuần này</option>
              <option>Tháng này</option>
            </select>
          </div>
          <div className="chart-content">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={revenueData} margin={{ top: 10, right: 10, left: 20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#eee" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: '#888' }} />
                <YAxis axisLine={false} tickLine={false} tick={{ fill: '#888' }} tickFormatter={(value) => `${value / 1000000}M`} />
                <Tooltip 
                  formatter={(value) => new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(value)}
                  cursor={{ fill: '#f6f4ef' }}
                />
                <Bar dataKey="total" fill="#6f4323" radius={[6, 6, 0, 0]} barSize={40} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Biểu đồ Tròn - Tỉ lệ sản phẩm */}
        <div className="chart-box side-chart">
          <div className="chart-header">
            <h3>Cơ cấu danh mục</h3>
          </div>
          <div className="chart-content">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={categoryData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={80}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {categoryData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
                <Legend verticalAlign="bottom" height={36} iconType="circle" />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* TẦNG 3: DANH SÁCH ĐƠN HÀNG GẦN ĐÂY */}
      <div className="dashboard-recent-orders">
        <div className="section-header">
          <h3>Đơn hàng gần đây</h3>
          <button className="view-all-btn">Xem tất cả</button>
        </div>
        <div className="table-responsive">
          <table className="admin-table">
            <thead>
              <tr>
                <th>Mã đơn</th>
                <th>Khách hàng</th>
                <th>Tổng tiền</th>
                <th>Trạng thái</th>
                <th>Hành động</th>
              </tr>
            </thead>
            <tbody>
              {recentOrders.map((order, index) => (
                <tr key={index}>
                  <td className="fw-bold">{order.id}</td>
                  <td>{order.customer}</td>
                  <td className="fw-bold text-brown">{order.total}</td>
                  <td>
                    <span className={`status-badge ${
                      order.status === 'Hoàn thành' ? 'success' : 
                      order.status === 'Đang giao' ? 'warning' : 'pending'
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
    </div>
  );
};

export default Dashboard;