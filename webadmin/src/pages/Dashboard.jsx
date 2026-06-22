import React, { useState, useEffect } from 'react';
import { 
  Chart as ChartJS, 
  CategoryScale, 
  LinearScale, 
  BarElement, 
  PointElement, 
  LineElement, 
  ArcElement, 
  Title, 
  Tooltip, 
  Legend, 
  Filler 
} from 'chart.js';
import { Bar, Doughnut, Line } from 'react-chartjs-2';
import { FiTrendingUp, FiTrendingDown, FiDollarSign, FiTag, FiFilm, FiUsers, FiDownload } from 'react-icons/fi';
import { dashboardAPI } from '../api/apiService';
import StatCard from '../components/StatCard';
import './Dashboard.css';

ChartJS.register(
  CategoryScale, 
  LinearScale, 
  BarElement, 
  PointElement, 
  LineElement, 
  ArcElement, 
  Title, 
  Tooltip, 
  Legend, 
  Filler
);

const Dashboard = () => {
  const [stats, setStats] = useState({
    totalRevenue: 45600000,
    totalTickets: 234,
    showingMovies: 8,
    newMembers: 45,
    todayRevenue: 8500000,
    todayTickets: 42
  });

  const [dateRange, setDateRange] = useState({
    fromDate: '',
    toDate: ''
  });

  const formatCurrency = (value) => {
    return new Intl.NumberFormat('vi-VN').format(value || 0) + ' VNĐ';
  };

  const revenueData = {
    labels: ['T2', 'T3', 'T4', 'T5', 'T6', 'T7', 'CN'],
    datasets: [
      {
        label: 'Doanh thu (VNĐ)',
        data: [12000000, 19000000, 15000000, 22000000, 30000000, 45000000, 40000000],
        backgroundColor: 'rgba(99, 102, 241, 0.8)',
        borderRadius: 4,
      },
    ],
  };

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        labels: { color: '#e2e8f0' }
      },
      tooltip: {
        mode: 'index',
        intersect: false,
      },
    },
    scales: {
      x: {
        grid: { color: 'rgba(255, 255, 255, 0.1)' },
        ticks: { color: '#94a3b8' }
      },
      y: {
        grid: { color: 'rgba(255, 255, 255, 0.1)' },
        ticks: { color: '#94a3b8' }
      }
    }
  };

  const topMoviesData = {
    labels: ['Lật Mặt 8', 'Mai', 'Godzilla x Kong', 'Inside Out 2', 'Đào Phở và Piano'],
    datasets: [
      {
        data: [45, 25, 15, 10, 5],
        backgroundColor: [
          '#fbbf24',
          '#f59e0b',
          '#fb923c',
          '#f97316',
          '#fa8c16',
        ],
        borderWidth: 0,
      },
    ],
  };

  const ticketsTrendData = {
    labels: ['T2', 'T3', 'T4', 'T5', 'T6', 'T7', 'CN'],
    datasets: [
      {
        label: 'Vé bán ra',
        data: [65, 85, 75, 110, 150, 250, 210],
        borderColor: '#22c55e',
        backgroundColor: 'rgba(34, 197, 94, 0.1)',
        tension: 0.4,
        fill: true,
      },
    ],
  };

  const recentBookings = [
    { id: 'HD020', customer: 'Hoàng Thị Hà', movie: 'Mai', showtime: '2026-05-21 17:00', total: 318000, status: 'Đã thanh toán', time: '10 phút trước' },
    { id: 'HD019', customer: 'Phạm Minh Dung', movie: 'Lật Mặt 8', showtime: '2026-05-21 14:00', total: 110000, status: 'Đã hoàn tiền', time: '1 giờ trước' },
    { id: 'HD018', customer: 'Lê Hoàng Cường', movie: 'Inside Out 2', showtime: '2026-05-21 10:00', total: 479400, status: 'Đã thanh toán', time: '3 giờ trước' },
    { id: 'HD017', customer: 'Trần Thị Bình', movie: 'Godzilla x Kong', showtime: '2026-05-20 20:00', total: 369000, status: 'Đã thanh toán', time: 'Hôm qua' },
    { id: 'HD016', customer: 'Nguyễn Văn An', movie: 'Đào Phở và Piano', showtime: '2026-05-20 15:00', total: 260000, status: 'Đã thanh toán', time: 'Hôm qua' },
  ];

  return (
    <div className="dashboard-page animate-fade-in">
      <div className="page-header">
        <h1 className="page-title">
          <FiTrendingUp />
          Thống kê doanh thu
        </h1>
      </div>

      <div className="dashboard-kpi-row grid grid-4 gap-md mb-lg">
        <StatCard 
          title="Tổng doanh thu" 
          value={formatCurrency(stats.totalRevenue)} 
          icon={FiDollarSign} 
          trend={12.5} 
          trendLabel="so với tháng trước" 
          color="--accent" 
        />
        <StatCard 
          title="Tổng vé đã bán" 
          value={stats.totalTickets} 
          icon={FiTag} 
          trend={8.2} 
          trendLabel="so với tháng trước" 
          color="--success" 
        />
        <StatCard 
          title="Phim đang chiếu" 
          value={stats.showingMovies} 
          icon={FiFilm} 
          color="--warning" 
        />
        <StatCard 
          title="Thành viên mới" 
          value={stats.newMembers} 
          icon={FiUsers} 
          trend={15.4} 
          trendLabel="so với tuần trước" 
          color="--info" 
        />
      </div>

      <div className="dashboard-filter card glass mb-lg">
        <div className="filter-header flex justify-between items-center mb-md">
          <h3 className="font-semibold text-lg">Lọc doanh thu</h3>
          <button className="btn btn-success btn-sm">
            <FiDownload /> Xuất PDF
          </button>
        </div>
        <div className="filter-controls flex gap-md items-end">
          <div className="form-group flex-1">
            <label className="form-label">Từ ngày</label>
            <input 
              type="date" 
              className="form-input" 
              value={dateRange.fromDate}
              onChange={(e) => setDateRange({...dateRange, fromDate: e.target.value})}
            />
          </div>
          <div className="form-group flex-1">
            <label className="form-label">Đến ngày</label>
            <input 
              type="date" 
              className="form-input" 
              value={dateRange.toDate}
              onChange={(e) => setDateRange({...dateRange, toDate: e.target.value})}
            />
          </div>
          <button className="btn btn-primary">Lọc dữ liệu</button>
        </div>
        
        <div className="filter-summary grid grid-2 gap-md mt-lg">
          <div className="summary-box">
            <div className="text-muted text-sm mb-sm">Doanh thu kỳ này</div>
            <div className="text-2xl font-bold text-accent">{formatCurrency(120000000)}</div>
          </div>
          <div className="summary-box">
            <div className="text-muted text-sm mb-sm">Vé bán ra kỳ này</div>
            <div className="text-2xl font-bold text-success">1,250</div>
          </div>
        </div>
      </div>

      <div className="dashboard-charts mb-lg">
        <div className="card glass chart-main mb-lg">
          <h3 className="font-semibold text-lg mb-md">Doanh thu theo ngày</h3>
          <div className="chart-container" style={{ height: '350px' }}>
            <Bar data={revenueData} options={chartOptions} />
          </div>
        </div>

        <div className="grid grid-2 gap-md">
          <div className="card glass">
            <h3 className="font-semibold text-lg mb-md">Phim xem nhiều nhất</h3>
            <div className="chart-container" style={{ height: '250px', display: 'flex', justifyContent: 'center' }}>
              <Doughnut data={topMoviesData} options={{
                plugins: { legend: { position: 'right', labels: { color: '#e2e8f0' } } }
              }} />
            </div>
          </div>
          <div className="card glass">
            <h3 className="font-semibold text-lg mb-md">Xu hướng vé bán ra</h3>
            <div className="chart-container" style={{ height: '250px' }}>
              <Line data={ticketsTrendData} options={chartOptions} />
            </div>
          </div>
        </div>
      </div>

      <div className="card glass">
        <h3 className="font-semibold text-lg mb-md">Đặt vé gần đây</h3>
        <div className="table-responsive">
          <table>
            <thead>
              <tr>
                <th>Mã HĐ</th>
                <th>Khách hàng</th>
                <th>Phim</th>
                <th>Suất chiếu</th>
                <th>Tổng tiền</th>
                <th>Trạng thái</th>
                <th>Thời gian</th>
              </tr>
            </thead>
            <tbody>
              {recentBookings.map((booking) => (
                <tr key={booking.id}>
                  <td className="font-semibold">{booking.id}</td>
                  <td>{booking.customer}</td>
                  <td><span className="text-accent font-medium">{booking.movie}</span></td>
                  <td>{booking.showtime}</td>
                  <td className="font-semibold">{formatCurrency(booking.total)}</td>
                  <td>
                    <span className={`badge ${booking.status === 'Đã thanh toán' ? 'badge-success' : 'badge-warning'}`}>
                      {booking.status}
                    </span>
                  </td>
                  <td className="text-muted text-sm">{booking.time}</td>
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
