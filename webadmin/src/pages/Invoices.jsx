import { useState, useEffect, useMemo } from 'react';
import {
  FiSearch, FiX, FiEye, FiFilter, FiChevronLeft,
  FiChevronRight, FiFileText, FiDownload, FiCalendar,
  FiCreditCard, FiClock, FiUser, FiFilm, FiPhone,
  FiRefreshCw
} from 'react-icons/fi';
import { bookingAPI } from '../api/apiService';
import './Invoices.css';

const formatCurrency = (v) => new Intl.NumberFormat('vi-VN').format(v) + ' VNĐ';

const ITEMS_PER_PAGE = 10;

const paymentMethodConfig = {
  cash: { label: 'Tiền mặt', color: '#22c55e', bg: 'rgba(34,197,94,0.12)' },
  card: { label: 'Thẻ', color: '#06b6d4', bg: 'rgba(6,182,212,0.12)' },
  credit_card: { label: 'Thẻ tín dụng', color: '#06b6d4', bg: 'rgba(6,182,212,0.12)' },
  momo: { label: 'MoMo', color: '#ec4899', bg: 'rgba(236,72,153,0.12)' },
  zalopay: { label: 'ZaloPay', color: '#8b5cf6', bg: 'rgba(139,92,246,0.12)' },
  vnpay: { label: 'VNPay', color: '#f97316', bg: 'rgba(249,115,22,0.12)' },
};

const paymentStatusConfig = {
  paid: { label: 'Đã thanh toán', color: '#22c55e' },
  completed: { label: 'Đã thanh toán', color: '#22c55e' },
  pending: { label: 'Chờ thanh toán', color: '#fbbf24' },
  cancelled: { label: 'Đã hủy', color: '#ef4444' },
  refunded: { label: 'Đã hoàn tiền', color: '#f97316' },
};

const formatDateTime = (iso) => {
  if (!iso) return '';
  const d = new Date(iso);
  if (isNaN(d.getTime())) return '';
  const pad = (n) => String(n).padStart(2, '0');
  return `${pad(d.getDate())}/${pad(d.getMonth() + 1)}/${d.getFullYear()} - ${pad(d.getHours())}:${pad(d.getMinutes())}`;
};

// Ngày (YYYY-MM-DD) theo giờ Việt Nam (+07:00) — tránh lệch 1 ngày do UTC
const toVNDateStr = (iso) => {
  if (!iso) return '';
  const d = new Date(iso);
  if (isNaN(d.getTime())) return '';
  const vn = new Date(d.getTime() + 7 * 3600 * 1000);
  const pad = (n) => String(n).padStart(2, '0');
  return `${vn.getUTCFullYear()}-${pad(vn.getUTCMonth() + 1)}-${pad(vn.getUTCDate())}`;
};

const mapBookingToInvoice = (b) => {
  const seatsArr = Array.isArray(b.seats) ? b.seats : [];
  const comboArr = Array.isArray(b.combos) ? b.combos : [];
  const comboTotal = comboArr.reduce(
    (s, c) => s + (c.price || 0) * (c.items || c.quantity || 1),
    0
  );
  const seatTotal = (b.totalPrice || 0) + (b.discount || 0) - comboTotal;
  const seatPrice = seatsArr.length > 0 ? Math.round(Math.max(0, seatTotal) / seatsArr.length) : 0;

  const tickets = seatsArr.map((seatId) => ({
    seatId,
    basePrice: seatPrice,
    seatType: 'standard',
    surcharge: 0,
  }));

  // Backend populate sẵn: booking.user (User) và booking.showtime -> showtime.movie (Movie)
  const user = b.user || {};
  const showtime = b.showtime || {};
  const paymentStatus = b.status === 'refunded'
    ? 'refunded'
    : (b.paymentStatus || b.status || 'pending');

  return {
    _id: b._id,
    invoiceNumber: b.invoiceNumber || (b._id ? `HD${String(b._id).slice(-6).toUpperCase()}` : 'N/A'),
    customerId: user?._id || '',
    customerName: user?.fullName || user?.username || 'Khách đã xóa',
    customerPhone: user?.phone || '',
    movieTitle: showtime?.movie?.title || 'N/A',
    roomName: showtime?.roomName || 'N/A',
    showDate: toVNDateStr(showtime?.startTime),
    showTime: formatDateTime(showtime?.startTime),
    tickets,
    combos: comboArr.map((c) => ({
      name: c.name || 'Combo',
      quantity: c.items || c.quantity || 1,
      price: c.price || 0,
    })),
    seats: seatsArr.join(', '),
    subtotal: (b.totalPrice || 0) + (b.discount || 0),
    discount: b.discount || 0,
    total: b.totalPrice || 0,
    paymentMethod: b.paymentMethod || 'cash',
    paymentStatus,
    createdAt: b.createdAt || '',
    createdDate: toVNDateStr(b.createdAt),
  };
};

export default function Invoices() {
  const [invoices, setInvoices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [searchType, setSearchType] = useState('all');
  const [filterPaymentStatus, setFilterPaymentStatus] = useState('all');
  const [filterDateFrom, setFilterDateFrom] = useState('');
  const [filterDateTo, setFilterDateTo] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [showDetailModal, setShowDetailModal] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const res = await bookingAPI.getAll();
        setInvoices(Array.isArray(res.data) ? res.data.map(mapBookingToInvoice) : []);
      } catch (err) {
        console.error('Lỗi tải danh sách đặt vé:', err);
        setInvoices([]);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const filtered = useMemo(() => {
    return invoices.filter((inv) => {
      let matchSearch = true;
      if (searchTerm) {
        const term = searchTerm.toLowerCase();
        if (searchType === 'invoiceNumber') {
          matchSearch = (inv.invoiceNumber || '').toLowerCase().includes(term);
        } else if (searchType === 'customerId') {
          matchSearch = (inv.customerId || '').toLowerCase().includes(term) ||
                       (inv.customerName || '').toLowerCase().includes(term);
        } else if (searchType === 'date') {
          matchSearch = (inv.createdDate || '').includes(searchTerm);
        } else {
          matchSearch = (inv.invoiceNumber || '').toLowerCase().includes(term) ||
                       (inv.customerName || '').toLowerCase().includes(term) ||
                       (inv.movieTitle || '').toLowerCase().includes(term);
        }
      }
      const matchStatus = filterPaymentStatus === 'all' ||
        (filterPaymentStatus === 'paid' && (inv.paymentStatus === 'paid' || inv.paymentStatus === 'completed')) ||
        inv.paymentStatus === filterPaymentStatus;
      const matchDateFrom = !filterDateFrom || (inv.createdDate && inv.createdDate >= filterDateFrom);
      const matchDateTo = !filterDateTo || (inv.createdDate && inv.createdDate <= filterDateTo);
      return matchSearch && matchStatus && matchDateFrom && matchDateTo;
    });
  }, [invoices, searchTerm, searchType, filterPaymentStatus, filterDateFrom, filterDateTo]);

  const totalPages = Math.ceil(filtered.length / ITEMS_PER_PAGE);
  const paginated = filtered.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE
  );

  const isPaidStatus = (s) => s === 'paid' || s === 'completed';
  const totalRevenue = filtered.filter(i => isPaidStatus(i.paymentStatus)).reduce((sum, i) => sum + i.total, 0);
  const totalInvoices = filtered.length;
  const paidCount = filtered.filter(i => isPaidStatus(i.paymentStatus)).length;
  const pendingCount = filtered.filter(i => i.paymentStatus === 'pending').length;

  const handleExportPDF = () => {
    if (filtered.length === 0) {
      alert('Không có dữ liệu để xuất báo cáo.');
      return;
    }
    window.print();
  };

  return (
    <div className="invoices-page">
      <div className="invoices-page__header">
        <div className="invoices-page__title-group">
          <h1 className="invoices-page__title">
            <FiFileText className="invoices-page__title-icon" />
            Quản lý Đặt Vé & Hóa Đơn
          </h1>
          <p className="invoices-page__subtitle">Xem chi tiết vé, combo và thông tin thanh toán</p>
        </div>
        <button className="invoices-btn invoices-btn--primary" onClick={handleExportPDF}>
          <FiDownload /> Xuất PDF
        </button>
      </div>

      {/* Stats */}
      <div className="invoices-stats">
        <div className="invoices-stat-card">
          <div className="invoices-stat-card__icon invoices-stat-card__icon--total"><FiFileText /></div>
          <div className="invoices-stat-card__info">
            <span className="invoices-stat-card__value">{totalInvoices}</span>
            <span className="invoices-stat-card__label">Tổng hóa đơn</span>
          </div>
        </div>
        <div className="invoices-stat-card">
          <div className="invoices-stat-card__icon invoices-stat-card__icon--revenue"><FiCreditCard /></div>
          <div className="invoices-stat-card__info">
            <span className="invoices-stat-card__value">{formatCurrency(totalRevenue)}</span>
            <span className="invoices-stat-card__label">Doanh thu</span>
          </div>
        </div>
        <div className="invoices-stat-card">
          <div className="invoices-stat-card__icon invoices-stat-card__icon--paid"><FiFilm /></div>
          <div className="invoices-stat-card__info">
            <span className="invoices-stat-card__value">{paidCount}</span>
            <span className="invoices-stat-card__label">Đã thanh toán</span>
          </div>
        </div>
        <div className="invoices-stat-card">
          <div className="invoices-stat-card__icon invoices-stat-card__icon--pending"><FiClock /></div>
          <div className="invoices-stat-card__info">
            <span className="invoices-stat-card__value">{pendingCount}</span>
            <span className="invoices-stat-card__label">Chờ xử lý</span>
          </div>
        </div>
      </div>

      {/* Search & Filter */}
      <div className="invoices-toolbar">
        <div className="invoices-search">
          <FiSearch className="invoices-search__icon" />
          <input
            type="text"
            className="invoices-search__input"
            placeholder={
              searchType === 'invoiceNumber' ? 'Tìm theo mã HĐ (HD001, HD002...)' :
              searchType === 'customerId' ? 'Tìm theo khách hàng...' :
              searchType === 'date' ? 'Tìm theo ngày đặt...' :
              'Tìm theo mã HĐ, khách hàng, phim...'
            }
            value={searchTerm}
            onChange={(e) => { setSearchTerm(e.target.value); setCurrentPage(1); }}
          />
          <select 
            className="invoices-search__type"
            value={searchType}
            onChange={(e) => { setSearchType(e.target.value); setSearchTerm(''); setCurrentPage(1); }}
          >
            <option value="all">Tìm: Tất cả</option>
            <option value="invoiceNumber">Tìm: Mã HĐ</option>
            <option value="customerId">Tìm: Khách hàng</option>
            <option value="date">Tìm: Ngày đặt</option>
          </select>
        </div>
        <div className="invoices-filters">
          <div className="invoices-filter-group">
            <FiFilter className="invoices-filter-group__icon" />
            <select
              className="invoices-filter-group__select"
              value={filterPaymentStatus}
              onChange={(e) => { setFilterPaymentStatus(e.target.value); setCurrentPage(1); }}
            >
              <option value="all">Tất cả trạng thái</option>
              <option value="paid">Đã thanh toán</option>
              <option value="pending">Chờ xử lý</option>
              <option value="cancelled">Đã hủy</option>
              <option value="refunded">Đã hoàn tiền</option>
            </select>
          </div>
          <div className="invoices-filter-group invoices-filter-group--date">
            <FiCalendar className="invoices-filter-group__icon" />
            <input
              type="date"
              className="invoices-filter-group__date"
              value={filterDateFrom}
              onChange={(e) => { setFilterDateFrom(e.target.value); setCurrentPage(1); }}
            />
            <span className="invoices-filter-group__separator">→</span>
            <input
              type="date"
              className="invoices-filter-group__date"
              value={filterDateTo}
              onChange={(e) => { setFilterDateTo(e.target.value); setCurrentPage(1); }}
            />
          </div>
        </div>
      </div>

      {/* Table */}
      <div className="invoices-table-wrapper">
        <table className="invoices-table">
          <thead>
            <tr>
              <th>Mã HĐ</th>
              <th>Khách hàng</th>
              <th>Phim</th>
              <th>Phòng & Suất</th>
              <th>Ghế</th>
              <th>Combo</th>
              <th>Tổng tiền</th>
              <th>Trạng thái</th>
              <th>Ngày đặt</th>
              <th>Thao tác</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan="10" className="invoices-table__empty">
                  <FiRefreshCw className="invoices-spinner" /> Đang tải dữ liệu...
                </td>
              </tr>
            ) : paginated.length === 0 ? (
              <tr>
                <td colSpan="10" className="invoices-table__empty">
                  Không tìm thấy hóa đơn nào
                </td>
              </tr>
            ) : (
              paginated.map((inv) => (
                <tr key={inv._id}>
                  <td><span className="invoices-code">{inv.invoiceNumber}</span></td>
                  <td>
                    <div className="invoices-customer-cell">
                      <span className="invoices-customer-name">{inv.customerName}</span>
                      <span className="invoices-customer-id">{inv.customerId}</span>
                    </div>
                  </td>
                  <td><span className="invoices-movie">{inv.movieTitle}</span></td>
                  <td>
                    <div className="invoices-room-info">
                      <span className="invoices-room">{inv.roomName}</span>
                      <span className="invoices-time">{inv.showTime}</span>
                    </div>
                  </td>
                  <td><span className="invoices-seats">{inv.seats}</span></td>
                  <td>
                    <span className="invoices-combo-label">
                      {inv.combos.length > 0 ? `${inv.combos.length} mục` : '—'}
                    </span>
                  </td>
                  <td className="invoices-total">{formatCurrency(inv.total)}</td>
                  <td>
                    <span
                      className="invoices-status-badge"
                      style={{
                        color: paymentStatusConfig[inv.paymentStatus]?.color,
                        borderColor: paymentStatusConfig[inv.paymentStatus]?.color,
                      }}
                    >
                      {paymentStatusConfig[inv.paymentStatus]?.label || inv.paymentStatus || 'Không xác định'}
                    </span>
                  </td>
                  <td><span className="invoices-date">{formatDateTime(inv.createdAt)}</span></td>
                  <td>
                    <button
                      className="invoices-action-btn invoices-action-btn--view"
                      title="Xem chi tiết"
                      onClick={() => setShowDetailModal(inv)}
                    >
                      <FiEye /> Chi tiết
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="invoices-pagination">
          <span className="invoices-pagination__info">
            Hiển thị {(currentPage - 1) * ITEMS_PER_PAGE + 1}–{Math.min(currentPage * ITEMS_PER_PAGE, filtered.length)} / {filtered.length}
          </span>
          <div className="invoices-pagination__controls">
            <button
              className="invoices-pagination__btn"
              onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
              disabled={currentPage === 1}
            >
              <FiChevronLeft />
            </button>
            {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
              const page = Math.max(1, currentPage - 2 + i);
              return page <= totalPages ? page : null;
            }).filter(Boolean).map((page) => (
              <button
                key={page}
                className={`invoices-pagination__btn ${currentPage === page ? 'invoices-pagination__btn--active' : ''}`}
                onClick={() => setCurrentPage(page)}
              >
                {page}
              </button>
            ))}
            <button
              className="invoices-pagination__btn"
              onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
              disabled={currentPage === totalPages}
            >
              <FiChevronRight />
            </button>
          </div>
        </div>
      )}

      {/* Detail Modal - Receipt Style */}
      {showDetailModal && (
        <div className="invoices-modal-overlay" onClick={() => setShowDetailModal(null)}>
          <div className="invoices-modal" onClick={(e) => e.stopPropagation()}>
            <div className="invoices-modal__header">
              <h2>Chi tiết Hóa Đơn</h2>
              <button className="invoices-modal__close" onClick={() => setShowDetailModal(null)}>
                <FiX />
              </button>
            </div>
            <div className="invoices-modal__content">
              {/* Receipt */}
              <div className="invoices-receipt">
                <div className="invoices-receipt__header">
                  <h3 className="invoices-receipt__title">🎬 CineZ Cinema</h3>
                  <p className="invoices-receipt__subtitle">Hóa đơn điện tử</p>
                </div>

                <div className="invoices-receipt__divider" />

                {/* Mã HĐ & Thời gian */}
                <div className="invoices-receipt__info-row">
                  <span className="invoices-receipt__label">Mã hóa đơn:</span>
                  <span className="invoices-receipt__value invoices-receipt__value--highlight">{showDetailModal.invoiceNumber}</span>
                </div>
                <div className="invoices-receipt__info-row">
                  <span className="invoices-receipt__label">Thời gian tạo:</span>
                  <span className="invoices-receipt__value">{formatDateTime(showDetailModal.createdAt)}</span>
                </div>

                <div className="invoices-receipt__divider" />

                {/* Khách hàng */}
                <div className="invoices-receipt__customer">
                  <div className="invoices-receipt__customer-item">
                    <FiUser size={16} />
                    <div>
                      <span className="invoices-receipt__customer-label">Khách hàng</span>
                      <span className="invoices-receipt__customer-value">{showDetailModal.customerName}</span>
                    </div>
                  </div>
                  <div className="invoices-receipt__customer-item">
                    <FiPhone size={16} />
                    <div>
                      <span className="invoices-receipt__customer-label">Số điện thoại</span>
                      <span className="invoices-receipt__customer-value">{showDetailModal.customerPhone}</span>
                    </div>
                  </div>
                </div>

                <div className="invoices-receipt__divider" />

                {/* Thông tin suất chiếu */}
                <div className="invoices-receipt__section">
                  <h4 className="invoices-receipt__section-title">Thông tin suất chiếu</h4>
                  <div className="invoices-receipt__section-content">
                    <div className="invoices-receipt__detail-row">
                      <span className="invoices-receipt__detail-label">Phim:</span>
                      <span className="invoices-receipt__detail-value">{showDetailModal.movieTitle}</span>
                    </div>
                    <div className="invoices-receipt__detail-row">
                      <span className="invoices-receipt__detail-label">Phòng chiếu:</span>
                      <span className="invoices-receipt__detail-value">{showDetailModal.roomName}</span>
                    </div>
                    <div className="invoices-receipt__detail-row">
                      <span className="invoices-receipt__detail-label">Ngày & Suất:</span>
                      <span className="invoices-receipt__detail-value">{showDetailModal.showTime}</span>
                    </div>
                  </div>
                </div>

                <div className="invoices-receipt__divider" />

                {/* Chi tiết vé */}
                <div className="invoices-receipt__section">
                  <h4 className="invoices-receipt__section-title">Chi tiết vé</h4>
                  <div className="invoices-receipt__tickets">
                    {showDetailModal.tickets.map((ticket, idx) => (
                      <div key={idx} className="invoices-receipt__ticket">
                        <div className="invoices-receipt__ticket-seat">
                          Ghế {ticket.seatId}
                          <span className={`invoices-receipt__seat-type ${ticket.seatType}`}>
                            {ticket.seatType === 'vip' ? 'VIP' : 'Thường'}
                          </span>
                        </div>
                        <div className="invoices-receipt__ticket-prices">
                          <span>Giá cơ bản: {formatCurrency(ticket.basePrice)}</span>
                          {ticket.surcharge > 0 && (
                            <span>+ Phụ thu: {formatCurrency(ticket.surcharge)}</span>
                          )}
                          <span className="invoices-receipt__ticket-total">
                            = {formatCurrency(ticket.basePrice + ticket.surcharge)}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Chi tiết combo */}
                {showDetailModal.combos.length > 0 && (
                  <>
                    <div className="invoices-receipt__divider" />
                    <div className="invoices-receipt__section">
                      <h4 className="invoices-receipt__section-title">Sản phẩm bán kèm</h4>
                      <div className="invoices-receipt__combos">
                        {showDetailModal.combos.map((combo, idx) => (
                          <div key={idx} className="invoices-receipt__combo">
                            <span className="invoices-receipt__combo-name">{combo.name}</span>
                            <span className="invoices-receipt__combo-qty">x{combo.quantity}</span>
                            <span className="invoices-receipt__combo-price">
                              {formatCurrency(combo.price)}
                            </span>
                            <span className="invoices-receipt__combo-total">
                              = {formatCurrency(combo.price * combo.quantity)}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </>
                )}

                <div className="invoices-receipt__divider invoices-receipt__divider--dashed" />

                {/* Tổng tiền */}
                <div className="invoices-receipt__summary">
                  <div className="invoices-receipt__summary-row">
                    <span>Tạm tính:</span>
                    <span>{formatCurrency(showDetailModal.subtotal)}</span>
                  </div>
                  {showDetailModal.discount > 0 && (
                    <div className="invoices-receipt__summary-row invoices-receipt__summary-row--discount">
                      <span>Giảm giá:</span>
                      <span>-{formatCurrency(showDetailModal.discount)}</span>
                    </div>
                  )}
                  <div className="invoices-receipt__summary-row invoices-receipt__summary-row--total">
                    <span className="invoices-receipt__summary-label">Tổng cộng:</span>
                    <span className="invoices-receipt__summary-value">{formatCurrency(showDetailModal.total)}</span>
                  </div>
                </div>

                <div className="invoices-receipt__divider" />

                {/* Thanh toán */}
                <div className="invoices-receipt__payment">
                  <div className="invoices-receipt__payment-row">
                    <span className="invoices-receipt__payment-label">Phương thức thanh toán:</span>
                    <span
                      className="invoices-payment-badge"
                      style={{
                        backgroundColor: paymentMethodConfig[showDetailModal.paymentMethod]?.bg,
                        color: paymentMethodConfig[showDetailModal.paymentMethod]?.color,
                      }}
                    >
                      {paymentMethodConfig[showDetailModal.paymentMethod]?.label}
                    </span>
                  </div>
                  <div className="invoices-receipt__payment-row">
                    <span className="invoices-receipt__payment-label">Trạng thái thanh toán:</span>
                    <span
                      className="invoices-status-badge"
                      style={{
                        color: paymentStatusConfig[showDetailModal.paymentStatus]?.color,
                        borderColor: paymentStatusConfig[showDetailModal.paymentStatus]?.color,
                      }}
                    >
                      {paymentStatusConfig[showDetailModal.paymentStatus]?.label || showDetailModal.paymentStatus || 'Không xác định'}
                    </span>
                  </div>
                </div>

                <div className="invoices-receipt__divider invoices-receipt__divider--dashed" />

                {/* Footer */}
                <div className="invoices-receipt__footer">
                  <p className="invoices-receipt__footer-text">Cảm ơn quý khách đã sử dụng dịch vụ của chúng tôi!</p>
                  <p className="invoices-receipt__footer-contact">CineZ Cinema © 2026</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
