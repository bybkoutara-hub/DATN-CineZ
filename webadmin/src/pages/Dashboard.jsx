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
import { dashboardAPI, bookingAPI } from '../api/apiService';
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
    totalRevenue: 0, totalTickets: 0, showingMovies: 0, newMembers: 0,
    todayRevenue: 0, todayTickets: 0, totalBookings: 0, totalShowtimes: 0
  });
  const [revenueChart, setRevenueChart] = useState([]);
  const [topMovies, setTopMovies] = useState([]);
  const [recentBookings, setRecentBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [dateRange, setDateRange] = useState({ fromDate: '', toDate: '' });

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      const [statsRes, revenueRes, topMoviesRes, bookingsRes] = await Promise.all([
        dashboardAPI.getStats(),
        dashboardAPI.getRevenue(),
        dashboardAPI.getTopMovies(5),
        bookingAPI.getAll(),
      ]);

      if (statsRes?.success) {
        setStats({
          totalRevenue: statsRes.data.totalRevenue || 0,
          totalTickets: statsRes.data.totalTickets || 0,
          showingMovies: statsRes.data.totalMovies || 0,
          newMembers: statsRes.data.totalMembers || 0,
          todayRevenue: statsRes.data.todayRevenue || 0,
          todayTickets: statsRes.data.todayTickets || 0,
          totalBookings: statsRes.data.totalBookings || 0,
          totalShowtimes: statsRes.data.totalShowtimes || 0,
        });
      }

      if (revenueRes?.data && Array.isArray(revenueRes.data)) {
        setRevenueChart(revenueRes.data);
      }
      if (topMoviesRes?.data && Array.isArray(topMoviesRes.data)) {
        setTopMovies(topMoviesRes.data);
      }
      if (bookingsRes?.data && Array.isArray(bookingsRes.data)) {
        setRecentBookings(bookingsRes.data.slice(0, 5));
      }
    } catch (err) {
      console.error('Lỗi tải dữ liệu dashboard:', err);
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (value) => {
    return new Intl.NumberFormat('vi-VN').format(value || 0) + ' VNĐ';
  };

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { labels: { color: '#e2e8f0' } },
      tooltip: { mode: 'index', intersect: false },
    },
    scales: {
      x: { grid: { color: 'rgba(255, 255, 255, 0.1)' }, ticks: { color: '#94a3b8' } },
      y: { grid: { color: 'rgba(255, 255, 255, 0.1)' }, ticks: { color: '#94a3b8' } }
    }
  };

  const weekDays = ['CN', 'T2', 'T3', 'T4', 'T5', 'T6', 'T7'];
  const revenueLabels = revenueChart.length > 0
    ? revenueChart.map((r) => {
        const d = new Date(r.date);
        return weekDays[d.getDay()] || r.date.slice(5);
      })
    : weekDays;

  const revenueData = {
    labels: revenueLabels,
    datasets: [{
      label: 'Doanh thu (VNĐ)',
      data: revenueChart.length > 0 ? revenueChart.map((r) => r.revenue) : [0, 0, 0, 0, 0, 0, 0],
      backgroundColor: 'rgba(99, 102, 241, 0.8)',
      borderRadius: 4,
    }],
  };

  const ticketsTrendData = {
    labels: revenueLabels,
    datasets: [{
      label: 'Vé bán ra',
      data: revenueChart.length > 0 ? revenueChart.map((r) => r.tickets) : [0, 0, 0, 0, 0, 0, 0],
      borderColor: '#22c55e',
      backgroundColor: 'rgba(34, 197, 94, 0.1)',
      tension: 0.4,
      fill: true,
    }],
  };

  const topMoviesData = {
    labels: topMovies.length > 0 ? topMovies.map((m) => m.title) : ['Chưa có dữ liệu'],
    datasets: [{
      data: topMovies.length > 0 ? topMovies.map((m) => m.tickets) : [1],
      backgroundColor: ['#fbbf24', '#f59e0b', '#fb923c', '#f97316', '#fa8c16'],
      borderWidth: 0,
    }],
  };

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
          color="--accent" 
        />
        <StatCard 
          title="Tổng vé đã bán" 
          value={stats.totalTickets} 
          icon={FiTag} 
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
            <div className="text-2xl font-bold text-accent">{formatCurrency(stats.totalRevenue)}</div>
          </div>
          <div className="summary-box">
            <div className="text-muted text-sm mb-sm">Vé bán ra kỳ này</div>
            <div className="text-2xl font-bold text-success">{stats.totalTickets.toLocaleString('vi-VN')}</div>
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
              {recentBookings.length === 0 && (
                <tr><td colSpan={7} className="text-center text-muted py-lg">Chưa có đặt vé nào</td></tr>
              )}
              {recentBookings.slice(0, 5).map((booking) => {
                const id = booking._id?.slice(-6).toUpperCase() || booking.invoiceNumber || 'N/A';
                const customer = booking.user_id?.fullName || booking.user_id?.username || 'Khách';
                const movie = booking.showtime_id?.movieId?.title || 'N/A';
                const showtime = booking.showtime_id
                  ? `${booking.showtime_id.date?.slice(0, 10)} ${booking.showtime_id.startTime}`
                  : 'N/A';
                const total = booking.totalAmount || booking.total || 0;
                const isPaid = booking.paymentStatus === 'paid' || booking.paymentStatus === 'completed';
                const time = booking.createdAt
                  ? new Date(booking.createdAt).toLocaleString('vi-VN')
                  : '';
                return (
                <tr key={booking._id || booking.id}>
                  <td className="font-semibold">{id}</td>
                  <td>{customer}</td>
                  <td><span className="text-accent font-medium">{movie}</span></td>
                  <td>{showtime}</td>
                  <td className="font-semibold">{formatCurrency(total)}</td>
                  <td>
                    <span className={`badge ${isPaid ? 'badge-success' : 'badge-warning'}`}>
                      {isPaid ? 'Đã thanh toán' : booking.paymentStatus}
                    </span>
                  </td>
                  <td className="text-muted text-sm">{time}</td>
                </tr>
              )})}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
