import { useState, useMemo } from 'react';
import {
  FiSearch, FiEdit2, FiX, FiEye, FiUsers, FiFilter,
  FiChevronLeft, FiChevronRight, FiMail, FiPhone,
  FiCalendar, FiStar, FiShoppingBag, FiDollarSign,
  FiAward, FiUser, FiClock
} from 'react-icons/fi';
import './Members.css';

const formatCurrency = (v) => new Intl.NumberFormat('vi-VN').format(v) + ' VNĐ';

const initialMembers = [
  { id: 1, fullName: 'Nguyễn Văn An', email: 'an.nguyen@gmail.com', phone: '0901234567', dateOfBirth: '1995-03-15', registerDate: '2025-01-10', points: 15200, tier: 'gold', totalSpent: 3500000, bookingCount: 28, status: 'active' },
  { id: 2, fullName: 'Trần Thị Bình', email: 'binh.tran@gmail.com', phone: '0912345678', dateOfBirth: '1998-07-22', registerDate: '2025-03-05', points: 8500, tier: 'silver', totalSpent: 1800000, bookingCount: 15, status: 'active' },
  { id: 3, fullName: 'Lê Hoàng Cường', email: 'cuong.le@gmail.com', phone: '0923456789', dateOfBirth: '1992-11-08', registerDate: '2024-12-20', points: 25000, tier: 'platinum', totalSpent: 8200000, bookingCount: 52, status: 'active' },
  { id: 4, fullName: 'Phạm Minh Dung', email: 'dung.pham@gmail.com', phone: '0934567890', dateOfBirth: '2000-01-30', registerDate: '2025-06-15', points: 2100, tier: 'member', totalSpent: 450000, bookingCount: 4, status: 'active' },
  { id: 5, fullName: 'Hoàng Thị Hà', email: 'ha.hoang@gmail.com', phone: '0945678901', dateOfBirth: '1997-09-12', registerDate: '2025-02-28', points: 0, tier: 'member', totalSpent: 150000, bookingCount: 1, status: 'blocked' },
  { id: 6, fullName: 'Vũ Đức Hùng', email: 'hung.vu@gmail.com', phone: '0956789012', dateOfBirth: '1993-05-20', registerDate: '2025-04-10', points: 12800, tier: 'gold', totalSpent: 2900000, bookingCount: 22, status: 'active' },
  { id: 7, fullName: 'Đỗ Thị Kim', email: 'kim.do@gmail.com', phone: '0967890123', dateOfBirth: '1999-12-01', registerDate: '2025-07-01', points: 5600, tier: 'silver', totalSpent: 1200000, bookingCount: 10, status: 'active' },
  { id: 8, fullName: 'Bùi Văn Long', email: 'long.bui@gmail.com', phone: '0978901234', dateOfBirth: '1996-04-18', registerDate: '2025-05-20', points: 3200, tier: 'member', totalSpent: 680000, bookingCount: 6, status: 'active' },
  { id: 9, fullName: 'Ngô Thị Mai', email: 'mai.ngo@gmail.com', phone: '0989012345', dateOfBirth: '2001-08-25', registerDate: '2025-08-15', points: 1800, tier: 'member', totalSpent: 320000, bookingCount: 3, status: 'active' },
  { id: 10, fullName: 'Đinh Quốc Nam', email: 'nam.dinh@gmail.com', phone: '0990123456', dateOfBirth: '1994-02-10', registerDate: '2024-11-05', points: 18500, tier: 'platinum', totalSpent: 5600000, bookingCount: 38, status: 'active' },
  { id: 11, fullName: 'Lý Thị Oanh', email: 'oanh.ly@gmail.com', phone: '0901234000', dateOfBirth: '1998-06-30', registerDate: '2025-09-01', points: 900, tier: 'member', totalSpent: 150000, bookingCount: 2, status: 'active' },
  { id: 12, fullName: 'Trương Văn Phúc', email: 'phuc.truong@gmail.com', phone: '0912345000', dateOfBirth: '1991-10-15', registerDate: '2025-01-25', points: 9800, tier: 'silver', totalSpent: 2100000, bookingCount: 18, status: 'active' },
  { id: 13, fullName: 'Huỳnh Thị Quỳnh', email: 'quynh.huynh@gmail.com', phone: '0923456000', dateOfBirth: '1997-03-08', registerDate: '2025-04-30', points: 7200, tier: 'silver', totalSpent: 1500000, bookingCount: 12, status: 'active' },
  { id: 14, fullName: 'Phan Đình Sơn', email: 'son.phan@gmail.com', phone: '0934567000', dateOfBirth: '2002-07-14', registerDate: '2025-10-10', points: 400, tier: 'member', totalSpent: 75000, bookingCount: 1, status: 'active' },
  { id: 15, fullName: 'Cao Thị Tuyết', email: 'tuyet.cao@gmail.com', phone: '0945678000', dateOfBirth: '1995-11-28', registerDate: '2025-02-14', points: 11000, tier: 'gold', totalSpent: 2600000, bookingCount: 20, status: 'active' },
];

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

export default function Members() {
  const [members, setMembers] = useState(initialMembers);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterTier, setFilterTier] = useState('all');
  const [filterStatus, setFilterStatus] = useState('all');
  const [currentPage, setCurrentPage] = useState(1);
  const [showDetailModal, setShowDetailModal] = useState(null);
  const [showEditModal, setShowEditModal] = useState(null);
  const [editForm, setEditForm] = useState({ status: '', tier: '' });

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

  const handleOpenDetail = (member) => {
    setShowDetailModal(member);
  };

  const handleOpenEdit = (member) => {
    setEditForm({ status: member.status, tier: member.tier });
    setShowEditModal(member);
  };

  const handleSaveEdit = () => {
    if (!showEditModal) return;
    setMembers((prev) =>
      prev.map((m) =>
        m.id === showEditModal.id
          ? { ...m, status: editForm.status, tier: editForm.tier }
          : m
      )
    );
    setShowEditModal(null);
  };

  const getInitials = (name) => {
    return name.split(' ').map(w => w[0]).join('').slice(-2).toUpperCase();
  };

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
                <tr key={member.id}>
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
                  {mockBookingHistory.map((booking) => (
                    <div key={booking.id} className="members-detail__booking">
                      <div className="members-detail__booking-info">
                        <span className="members-detail__booking-movie">{booking.movie}</span>
                        <span className="members-detail__booking-meta">
                          {booking.date} • {booking.time} • Ghế: {booking.seats}
                        </span>
                      </div>
                      <span className="members-detail__booking-total">{formatCurrency(booking.total)}</span>
                    </div>
                  ))}
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
