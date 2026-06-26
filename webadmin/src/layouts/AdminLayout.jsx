import { useState, useEffect, useRef } from 'react';
import { Outlet, NavLink, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import {
  FiHome, FiFilm, FiGrid, FiMonitor, FiClock, FiTag,
  FiImage, FiShoppingBag, FiGift, FiUsers, FiUserCheck,
  FiFileText, FiDollarSign, FiChevronLeft, FiChevronDown,
  FiLogOut, FiUser, FiSettings
} from 'react-icons/fi';
import { MdLocalMovies } from 'react-icons/md';
import './AdminLayout.css';

const menuItems = [
  { path: '/dashboard', label: 'Dashboard', icon: <FiHome /> },
  { path: '/rooms', label: 'Phòng Chiếu', icon: <FiMonitor /> },
  { path: '/seats', label: 'Ghế Ngồi', icon: <FiGrid /> },
  { path: '/invoices', label: 'Đặt Vé', icon: <FiFileText /> },
  { path: '/genres', label: 'Loại Phim', icon: <FiTag /> },
  { path: '/movies', label: 'Phim', icon: <FiFilm /> },
  { path: '/showtimes', label: 'Suất Chiếu', icon: <FiClock /> },
  { path: '/sliders', label: 'Slider', icon: <FiImage /> },
  { path: '/combos', label: 'Sản Phẩm Kèm', icon: <FiShoppingBag /> },
  { path: '/promotions', label: 'Khuyến Mãi', icon: <FiGift /> },
  { path: '/members', label: 'Thành Viên', icon: <FiUsers /> },
  { path: '/staff', label: 'Nhân Viên', icon: <FiUserCheck />, adminOnly: true },
];

const pageTitles = menuItems.reduce((acc, item) => {
  acc[item.path] = item.label;
  return acc;
}, {});

const AdminLayout = () => {
  const { user, logout, isAdmin } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();

  const [collapsed, setCollapsed] = useState(false);
  const [clock, setClock] = useState('');
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef(null);

  // Real-time clock
  useEffect(() => {
    const tick = () => {
      const now = new Date();
      const days = ['Chủ Nhật', 'Thứ 2', 'Thứ 3', 'Thứ 4', 'Thứ 5', 'Thứ 6', 'Thứ 7'];
      const dayName = days[now.getDay()];
      const date = now.toLocaleDateString('vi-VN', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
      });
      const time = now.toLocaleTimeString('vi-VN', {
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
        hour12: false,
      });
      setClock(`${dayName}, ${date} — ${time}`);
    };
    tick();
    const interval = setInterval(tick, 1000);
    return () => clearInterval(interval);
  }, []);

  // Close dropdown on outside click
  useEffect(() => {
    const handler = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const currentPageTitle = pageTitles[location.pathname] || 'Dashboard';

  const getUserInitials = () => {
    if (!user?.fullName) return 'AD';
    const parts = user.fullName.split(' ');
    if (parts.length >= 2) {
      return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
    }
    return parts[0].substring(0, 2).toUpperCase();
  };

  const getRoleLabel = (role) => {
    if (role === 'admin') return 'Quản trị viên';
    if (role === 'staff') return 'Nhân viên';
    return 'Người dùng';
  };

  const filteredMenu = menuItems.filter(
    (item) => !item.adminOnly || isAdmin
  );

  return (
    <div className="admin-layout">
      {/* ===== Sidebar ===== */}
      <aside className={`sidebar${collapsed ? ' collapsed' : ''}`}>
        {/* Logo */}
        <div className="sidebar-logo">
          <div className="sidebar-logo-icon">
            <MdLocalMovies />
          </div>
          <div className="sidebar-logo-text">
            <h1>CineZ</h1>
            <span>Quản trị hệ thống</span>
          </div>
        </div>

        {/* Navigation */}
        <nav className="sidebar-nav">
          <div className="sidebar-nav-label">Điều hướng</div>
          {filteredMenu.map((item) => (
            <NavLink
              key={item.path}
              to={item.path}
              className={({ isActive }) =>
                `sidebar-nav-item${isActive ? ' active' : ''}`
              }
              data-tooltip={item.label}
            >
              <span className="sidebar-nav-icon">{item.icon}</span>
              <span className="sidebar-nav-text">{item.label}</span>
            </NavLink>
          ))}
        </nav>

        {/* Collapse Toggle */}
        <div className="sidebar-toggle">
          <button
            className="sidebar-toggle-btn"
            onClick={() => setCollapsed(!collapsed)}
          >
            <span className="sidebar-toggle-icon"><FiChevronLeft /></span>
            <span className="sidebar-toggle-text">Thu gọn</span>
          </button>
        </div>
      </aside>

      {/* ===== Main Wrapper ===== */}
      <div className="main-wrapper">
        {/* Header */}
        <header className="admin-header">
          <div className="header-left">
            <div className="breadcrumb">
              <NavLink to="/dashboard" className="breadcrumb-item">
                Dashboard
              </NavLink>
              {currentPageTitle !== 'Dashboard' && (
                <>
                  <span className="breadcrumb-sep">/</span>
                  <span className="breadcrumb-item active">
                    {currentPageTitle}
                  </span>
                </>
              )}
            </div>
          </div>

          <div className="header-right">
            {/* Clock */}
            <div className="header-clock">
              <FiClock className="header-clock-icon" />
              <span>{clock}</span>
            </div>

            {/* User Dropdown */}
            <div className="header-user" ref={dropdownRef}>
              <button
                className={`header-user-btn${dropdownOpen ? ' open' : ''}`}
                onClick={() => setDropdownOpen(!dropdownOpen)}
              >
                <div className="header-user-avatar">
                  {getUserInitials()}
                </div>
                <div className="header-user-info">
                  <span className="header-user-name">
                    {user?.fullName || 'Admin'}
                  </span>
                  <span className="header-user-role">
                    {getRoleLabel(user?.role)}
                  </span>
                </div>
                <FiChevronDown className="header-user-chevron" />
              </button>

              {dropdownOpen && (
                <div className="header-user-dropdown">
                  <button className="dropdown-item">
                    <span className="dropdown-icon"><FiUser /></span>
                    Hồ sơ cá nhân
                  </button>
                  <button className="dropdown-item">
                    <span className="dropdown-icon"><FiSettings /></span>
                    Cài đặt
                  </button>
                  <div className="dropdown-divider" />
                  <button className="dropdown-item danger" onClick={handleLogout}>
                    <span className="dropdown-icon"><FiLogOut /></span>
                    Đăng xuất
                  </button>
                </div>
              )}
            </div>
          </div>
        </header>

        {/* Content */}
        <main className="main-content">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default AdminLayout;
