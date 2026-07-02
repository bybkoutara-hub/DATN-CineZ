import { useState, useEffect, useMemo } from 'react';
import {
  FiSearch, FiEdit2, FiX, FiEye, FiUsers, FiFilter,
  FiChevronLeft, FiChevronRight, FiMail, FiPhone,
  FiCalendar, FiStar, FiShoppingBag, FiDollarSign,
  FiAward, FiUser, FiClock, FiLoader
} from 'react-icons/fi';
import { memberAPI } from '../api/apiService';
import './Members.css';

const formatCurrency = (v) => new Intl.NumberFormat('vi-VN').format(v) + ' VNĐ';

const mockBookingHistory = [
  { id: 1, movie: 'Lật Mặt 8', date: '2026-05-20', time: '09:00', seats: 'D5, D6', total: 259000 },
  { id: 2, movie: 'Mai', date: '2026-05-15', time: '14:00', seats: 'E3', total: 107200 },
  { id: 3, movie: 'Godzilla x Kong', date: '2026-05-10', time: '20:00', seats: 'F7, F8', total: 350000 },
  { id: 4, movie: 'Inside Out 2', date: '2026-04-28', time: '10:00', seats: 'A1, A2, A3', total: 424000 },
  { id: 5, movie: 'Đào Phở và Piano', date: '2026-04-15', time: '16:00', seats: 'C4', total: 75000 },
];

const ITEMS_PER_PAGE = 8;

const tierConfig = {
  member: { label: 'Thành viên', color: '#64748b' },
  silver: { label: 'Bạc', color: '#94a3b8' },
  gold: { label: 'Vàng', color: '#f59e0b' },
  platinum: { label: 'Bạch kim', color: '#a855f7' },
};

const statusConfig = {
  active: { label: 'Hoạt động', color: '#22c55e' },
  blocked: { label: 'Bị khóa', color: '#ef4444' },
};

const mapMember = (m) => ({
  _id: m._id,
  fullName: m.fullName,
  email: m.email,
  phone: m.phone,
  dateOfBirth: m.dateOfBirth ? new Date(m.dateOfBirth).toLocaleDateString('vi-VN') : '',
  registerDate: m.createdAt ? new Date(m.createdAt).toLocaleDateString('vi-VN') : '',
  points: m.points ?? 0,
  tier: m.tier || 'member',
  totalSpent: m.totalSpent ?? 0,
  bookingCount: m.bookingCount ?? 0,
  status: m.active ? 'active' : 'blocked',
});

const mapBooking = (b) => {
  const showtime = b.showtime_id || {};
  const movie = showtime.movieId || {};
  const startTime = showtime.startTime ? new Date(showtime.startTime) : null;
  return {
    id: b._id,
    movie: movie.title || 'Chưa có thông tin',
    date: startTime ? startTime.toLocaleDateString('vi-VN') : (b.createdAt ? new Date(b.createdAt).toLocaleDateString('vi-VN') : ''),
    time: startTime ? startTime.toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' }) : '',
    seats: Array.isArray(b.seats) ? b.seats.join(', ') : (b.seats || ''),
    total: b.total ?? 0,
  };
};

export default function Members() {
  const [members, setMembers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterTier, setFilterTier] = useState('all');
  const [filterStatus, setFilterStatus] = useState('all');
  const [currentPage, setCurrentPage] = useState(1);
  const [showDetailModal, setShowDetailModal] = useState(null);
  const [bookingHistory, setBookingHistory] = useState([]);
  const [bookingLoading, setBookingLoading] = useState(false);
  const [showEditModal, setShowEditModal] = useState(null);
  const [editForm, setEditForm] = useState({ status: '', tier: '' });

  const fetchMembers = async () => {
    try {
      setLoading(true);
      const res = await memberAPI.getAll();
      if (res.success) {
        setMembers((res.data || []).map(mapMember));
      }
    } catch (err) {
      console.error('Failed to fetch members:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMembers();
  }, []);

  const filtered = useMemo(() => {
    return members.filter((m) => {
      const matchSearch =
        m.fullName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        m.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
        m.phone.includes(searchTerm);
      const matchTier = filterTier === 'all' || m.tier === filterTier;
      const matchStatus = filterStatus === 'all' || m.status === filterStatus;
      return matchSearch && matchTier && matchStatus;
    });
  }, [members, searchTerm, filterTier, filterStatus]);

  const totalPages = Math.ceil(filtered.length / ITEMS_PER_PAGE);
  const paginated = filtered.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE
  );

  const handleOpenDetail = async (member) => {
    setShowDetailModal(member);
    setBookingLoading(true);
    setBookingHistory([]);
    try {
      const res = await memberAPI.getBookings(member._id);
      if (res.success && Array.isArray(res.data)) {
        const mapped = res.data.map(mapBooking);
        setBookingHistory(mapped.length > 0 ? mapped : mockBookingHistory);
      } else {
        setBookingHistory(mockBookingHistory);
      }
    } catch {
      setBookingHistory(mockBookingHistory);
    } finally {
      setBookingLoading(false);
    }
  };

  const handleOpenEdit = (member) => {
    setEditForm({ status: member.status, tier: member.tier });
    setShowEditModal(member);
  };

  const handleSaveEdit = async () => {
    if (!showEditModal) return;
    try {
      const res = await memberAPI.update(showEditModal._id, {
        active: editForm.status === 'active',
      });
      if (res.success) {
        setMembers((prev) =>
          prev.map((m) =>
            m._id === showEditModal._id
              ? { ...m, status: editForm.status, tier: editForm.tier }
              : m
          )
        );
        setShowEditModal(null);
      }
    } catch (err) {
      console.error('Failed to update member:', err);
    }
  };

  const getInitials = (name) => {
    return name.split(' ').map(w => w[0]).join('').slice(-2).toUpperCase();
  };

  if (loading) {
    return (
      <div className="members-page">
        <div className="members-loading">
          <FiLoader className="members-loading__spinner" />
          <span>Đang tải dữ liệu...</span>
        </div>
      </div>
    );
  }

  const totalMembers = members.length;
  const activeMembers = members.filter(m => m.status === 'active').length;
  const totalPoints = members.reduce((sum, m) => sum + m.points, 0);
  const totalRevenue = members.reduce((sum, m) => sum + m.totalSpent, 0);

  return (
    <div className="members-page">
      <div className="members-page__header">
        <div className="members-page__title-group">
          <h1 className="members-page__title">
            <FiUsers className="members-page__title-icon" />
            Quản lý Thành Viên
          </h1>
          <p className="members-page__subtitle">Quản lý thông tin và hạng thành viên</p>
        </div>
      </div>

      {/* Stats */}
      <div className="members-stats">
        <div className="members-stat-card">
          <div className="members-stat-card__icon members-stat-card__icon--total"><FiUsers /></div>
          <div className="members-stat-card__info">
            <span className="members-stat-card__value">{totalMembers}</span>
            <span className="members-stat-card__label">Tổng thành viên</span>
          </div>
        </div>
        <div className="members-stat-card">
          <div className="members-stat-card__icon members-stat-card__icon--active"><FiUser /></div>
          <div className="members-stat-card__info">
            <span className="members-stat-card__value">{activeMembers}</span>
            <span className="members-stat-card__label">Đang hoạt động</span>
          </div>
        </div>
        <div className="members-stat-card">
          <div className="members-stat-card__icon members-stat-card__icon--points"><FiStar /></div>
          <div className="members-stat-card__info">
            <span className="members-stat-card__value">{totalPoints.toLocaleString('vi-VN')}</span>
            <span className="members-stat-card__label">Tổng điểm tích lũy</span>
          </div>
        </div>
        <div className="members-stat-card">
          <div className="members-stat-card__icon members-stat-card__icon--revenue"><FiDollarSign /></div>
          <div className="members-stat-card__info">
            <span className="members-stat-card__value">{formatCurrency(totalRevenue)}</span>
            <span className="members-stat-card__label">Tổng doanh thu</span>
          </div>
        </div>
      </div>

      {/* Toolbar */}
      <div className="members-toolbar">
        <div className="members-search">
          <FiSearch className="members-search__icon" />
          <input
            type="text"
            className="members-search__input"
            placeholder="Tìm theo tên, email, số điện thoại..."
            value={searchTerm}
            onChange={(e) => { setSearchTerm(e.target.value); setCurrentPage(1); }}
          />
        </div>
        <div className="members-filters">
          <div className="members-filter-group">
            <FiFilter className="members-filter-group__icon" />
            <select
              className="members-filter-group__select"
              value={filterTier}
              onChange={(e) => { setFilterTier(e.target.value); setCurrentPage(1); }}
            >
              <option value="all">Tất cả hạng</option>
              <option value="member">Thành viên</option>
              <option value="silver">Bạc</option>
              <option value="gold">Vàng</option>
              <option value="platinum">Bạch kim</option>
            </select>
          </div>
          <div className="members-filter-group">
            <select
              className="members-filter-group__select"
              value={filterStatus}
              onChange={(e) => { setFilterStatus(e.target.value); setCurrentPage(1); }}
            >
              <option value="all">Tất cả trạng thái</option>
              <option value="active">Hoạt động</option>
              <option value="blocked">Bị khóa</option>
            </select>
          </div>
        </div>
      </div>

      {/* Table */}
      <div className="members-table-wrapper">
        <table className="members-table">
          <thead>
            <tr>
              <th>STT</th>
              <th>Họ tên</th>
              <th>Email</th>
              <th>SĐT</th>
              <th>Ngày đăng ký</th>
              <th>Điểm</th>
              <th>Hạng</th>
              <th>Tổng chi tiêu</th>
              <th>Số lần đặt vé</th>
              <th>Trạng thái</th>
              <th>Thao tác</th>
            </tr>
          </thead>
          <tbody>
            {paginated.length === 0 ? (
              <tr>
                <td colSpan="11" className="members-table__empty">
                  Không tìm thấy thành viên nào
                </td>
              </tr>
            ) : (
              paginated.map((member, idx) => (
                <tr key={member._id}>
                  <td>{(currentPage - 1) * ITEMS_PER_PAGE + idx + 1}</td>
                  <td>
                    <div className="members-name-cell">
                      <div
                        className="members-avatar"
                        style={{ backgroundColor: tierConfig[member.tier]?.color + '30', color: tierConfig[member.tier]?.color }}
                      >
                        {getInitials(member.fullName)}
                      </div>
                      <span className="members-name-cell__name">{member.fullName}</span>
                    </div>
                  </td>
                  <td><span className="members-email">{member.email}</span></td>
                  <td>{member.phone}</td>
                  <td>{member.registerDate}</td>
                  <td><span className="members-points">{member.points.toLocaleString('vi-VN')}</span></td>
                  <td>
                    <span
                      className="members-tier-badge"
                      style={{ backgroundColor: tierConfig[member.tier]?.color + '18', color: tierConfig[member.tier]?.color, borderColor: tierConfig[member.tier]?.color + '40' }}
                    >
                      <FiAward /> {tierConfig[member.tier]?.label}
                    </span>
                  </td>
                  <td className="members-spent">{formatCurrency(member.totalSpent)}</td>
                  <td>
                    <span className="members-booking-count">{member.bookingCount}</span>
                  </td>
                  <td>
                    <span
                      className="members-status-badge"
                      style={{ color: statusConfig[member.status]?.color, borderColor: statusConfig[member.status]?.color }}
                    >
                      {statusConfig[member.status]?.label}
                    </span>
                  </td>
                  <td>
                    <div className="members-actions">
                      <button className="members-action-btn members-action-btn--view" title="Xem chi tiết" onClick={() => handleOpenDetail(member)}>
                        <FiEye />
                      </button>
                      <button className="members-action-btn members-action-btn--edit" title="Chỉnh sửa" onClick={() => handleOpenEdit(member)}>
                        <FiEdit2 />
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="members-pagination">
          <span className="members-pagination__info">
            Hiển thị {(currentPage - 1) * ITEMS_PER_PAGE + 1}–{Math.min(currentPage * ITEMS_PER_PAGE, filtered.length)} / {filtered.length} thành viên
          </span>
          <div className="members-pagination__controls">
            <button
              className="members-pagination__btn"
              onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
              disabled={currentPage === 1}
            >
              <FiChevronLeft />
            </button>
            {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
              <button
                key={page}
                className={`members-pagination__btn ${currentPage === page ? 'members-pagination__btn--active' : ''}`}
                onClick={() => setCurrentPage(page)}
              >
                {page}
              </button>
            ))}
            <button
              className="members-pagination__btn"
              onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
              disabled={currentPage === totalPages}
            >
              <FiChevronRight />
            </button>
          </div>
        </div>
      )}

      {/* Detail Modal */}
      {showDetailModal && (
        <div className="members-modal-overlay" onClick={() => setShowDetailModal(null)}>
          <div className="members-modal members-modal--detail" onClick={(e) => e.stopPropagation()}>
            <div className="members-modal__header">
              <h2 className="members-modal__title">Chi tiết thành viên</h2>
              <button className="members-modal__close" onClick={() => setShowDetailModal(null)}><FiX /></button>
            </div>
            <div className="members-detail">
              {/* Profile section */}
              <div className="members-detail__profile">
                <div
                  className="members-detail__avatar"
                  style={{ backgroundColor: tierConfig[showDetailModal.tier]?.color + '30', color: tierConfig[showDetailModal.tier]?.color }}
                >
                  {getInitials(showDetailModal.fullName)}
                </div>
                <div className="members-detail__profile-info">
                  <h3 className="members-detail__name">{showDetailModal.fullName}</h3>
                  <span
                    className="members-tier-badge members-tier-badge--lg"
                    style={{ backgroundColor: tierConfig[showDetailModal.tier]?.color + '18', color: tierConfig[showDetailModal.tier]?.color, borderColor: tierConfig[showDetailModal.tier]?.color + '40' }}
                  >
                    <FiAward /> {tierConfig[showDetailModal.tier]?.label}
                  </span>
                </div>
              </div>

              {/* Info grid */}
              <div className="members-detail__grid">
                <div className="members-detail__item">
                  <FiMail className="members-detail__item-icon" />
                  <div>
                    <span className="members-detail__item-label">Email</span>
                    <span className="members-detail__item-value">{showDetailModal.email}</span>
                  </div>
                </div>
                <div className="members-detail__item">
                  <FiPhone className="members-detail__item-icon" />
                  <div>
                    <span className="members-detail__item-label">Số điện thoại</span>
                    <span className="members-detail__item-value">{showDetailModal.phone}</span>
                  </div>
                </div>
                <div className="members-detail__item">
                  <FiCalendar className="members-detail__item-icon" />
                  <div>
                    <span className="members-detail__item-label">Ngày sinh</span>
                    <span className="members-detail__item-value">{showDetailModal.dateOfBirth}</span>
                  </div>
                </div>
                <div className="members-detail__item">
                  <FiClock className="members-detail__item-icon" />
                  <div>
                    <span className="members-detail__item-label">Ngày đăng ký</span>
                    <span className="members-detail__item-value">{showDetailModal.registerDate}</span>
                  </div>
                </div>
              </div>

              {/* Stats row */}
              <div className="members-detail__stats">
                <div className="members-detail__stat">
                  <span className="members-detail__stat-value">{showDetailModal.points.toLocaleString('vi-VN')}</span>
                  <span className="members-detail__stat-label">Điểm tích lũy</span>
                </div>
                <div className="members-detail__stat">
                  <span className="members-detail__stat-value">{formatCurrency(showDetailModal.totalSpent)}</span>
                  <span className="members-detail__stat-label">Tổng chi tiêu</span>
                </div>
                <div className="members-detail__stat">
                  <span className="members-detail__stat-value">{showDetailModal.bookingCount}</span>
                  <span className="members-detail__stat-label">Lần đặt vé</span>
                </div>
              </div>

              {/* Booking history */}
              <div className="members-detail__history">
                <h4 className="members-detail__history-title">
                  <FiShoppingBag /> Lịch sử đặt vé gần đây
                </h4>
                <div className="members-detail__history-list">
                  {bookingLoading ? (
                    <div className="members-detail__loading">
                      <FiLoader className="members-loading__spinner" />
                      <span>Đang tải lịch sử...</span>
                    </div>
                  ) : (
                    bookingHistory.map((booking) => (
                      <div key={booking.id} className="members-detail__booking">
                        <div className="members-detail__booking-info">
                          <span className="members-detail__booking-movie">{booking.movie}</span>
                          <span className="members-detail__booking-meta">
                            {booking.date} • {booking.time} • Ghế: {booking.seats}
                          </span>
                        </div>
                        <span className="members-detail__booking-total">{formatCurrency(booking.total)}</span>
                      </div>
                    ))
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Edit Modal */}
      {showEditModal && (
        <div className="members-modal-overlay" onClick={() => setShowEditModal(null)}>
          <div className="members-modal members-modal--edit" onClick={(e) => e.stopPropagation()}>
            <div className="members-modal__header">
              <h2 className="members-modal__title">Chỉnh sửa thành viên</h2>
              <button className="members-modal__close" onClick={() => setShowEditModal(null)}><FiX /></button>
            </div>
            <div className="members-edit-form">
              <div className="members-edit-form__member-info">
                <div
                  className="members-avatar"
                  style={{ backgroundColor: tierConfig[showEditModal.tier]?.color + '30', color: tierConfig[showEditModal.tier]?.color }}
                >
                  {getInitials(showEditModal.fullName)}
                </div>
                <div>
                  <span className="members-edit-form__name">{showEditModal.fullName}</span>
                  <span className="members-edit-form__email">{showEditModal.email}</span>
                </div>
              </div>
              <div className="members-edit-form__fields">
                <div className="members-edit-form__group">
                  <label className="members-edit-form__label">Hạng thành viên</label>
                  <select
                    className="members-edit-form__select"
                    value={editForm.tier}
                    onChange={(e) => setEditForm(prev => ({ ...prev, tier: e.target.value }))}
                  >
                    <option value="member">Thành viên</option>
                    <option value="silver">Bạc</option>
                    <option value="gold">Vàng</option>
                    <option value="platinum">Bạch kim</option>
                  </select>
                </div>
                <div className="members-edit-form__group">
                  <label className="members-edit-form__label">Trạng thái</label>
                  <select
                    className="members-edit-form__select"
                    value={editForm.status}
                    onChange={(e) => setEditForm(prev => ({ ...prev, status: e.target.value }))}
                  >
                    <option value="active">Hoạt động</option>
                    <option value="blocked">Bị khóa</option>
                  </select>
                </div>
              </div>
              <div className="members-edit-form__actions">
                <button className="members-btn members-btn--ghost" onClick={() => setShowEditModal(null)}>Hủy</button>
                <button className="members-btn members-btn--primary" onClick={handleSaveEdit}>Lưu thay đổi</button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
