import { useState, useMemo } from 'react';
import {
  FiSearch, FiPlus, FiEdit2, FiTrash2, FiX, FiTag,
  FiPercent, FiDollarSign, FiCalendar, FiCopy, FiGift,
  FiFilter, FiChevronLeft, FiChevronRight, FiCheckCircle,
  FiPauseCircle, FiXCircle
} from 'react-icons/fi';
import './Promotions.css';

const formatCurrency = (v) => new Intl.NumberFormat('vi-VN').format(v) + ' VNĐ';

const initialPromotions = [
  { id: 1, code: 'SUMMER2026', name: 'Khuyến mãi mùa hè', description: 'Giảm 20% cho tất cả vé phim mùa hè', type: 'percent', value: 20, minOrderValue: 100000, maxDiscount: 50000, startDate: '2026-06-01', endDate: '2026-08-31', usageLimit: 500, usedCount: 123, status: 'active' },
  { id: 2, code: 'NEWMEMBER', name: 'Chào thành viên mới', description: 'Giảm 30,000đ cho thành viên mới', type: 'fixed', value: 30000, minOrderValue: 80000, maxDiscount: 30000, startDate: '2026-01-01', endDate: '2026-12-31', usageLimit: 1000, usedCount: 456, status: 'active' },
  { id: 3, code: 'COUPLE25', name: 'Ưu đãi cặp đôi', description: 'Giảm 25% khi mua 2 vé trở lên', type: 'percent', value: 25, minOrderValue: 150000, maxDiscount: 80000, startDate: '2026-02-14', endDate: '2026-02-28', usageLimit: 200, usedCount: 200, status: 'expired' },
  { id: 4, code: 'FRIDAY50', name: 'Thứ 6 vui vẻ', description: 'Giảm 50,000đ vào thứ 6', type: 'fixed', value: 50000, minOrderValue: 120000, maxDiscount: 50000, startDate: '2026-05-01', endDate: '2026-05-31', usageLimit: 300, usedCount: 89, status: 'active' },
  { id: 5, code: 'VIP2026', name: 'Ưu đãi VIP', description: 'Giảm 15% cho ghế VIP', type: 'percent', value: 15, minOrderValue: 0, maxDiscount: 100000, startDate: '2026-03-01', endDate: '2026-06-30', usageLimit: 0, usedCount: 234, status: 'active' },
];

const ITEMS_PER_PAGE = 5;

const emptyForm = {
  code: '', name: '', description: '', type: 'percent', value: '',
  minOrderValue: '', maxDiscount: '', startDate: '', endDate: '',
  usageLimit: '', status: 'active'
};

const statusConfig = {
  active: { label: 'Hoạt động', color: '#22c55e', icon: FiCheckCircle },
  expired: { label: 'Hết hạn', color: '#ef4444', icon: FiXCircle },
  paused: { label: 'Tạm dừng', color: '#eab308', icon: FiPauseCircle },
};

export default function Promotions() {
  const [promotions, setPromotions] = useState(initialPromotions);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [filterType, setFilterType] = useState('all');
  const [currentPage, setCurrentPage] = useState(1);
  const [showModal, setShowModal] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [formData, setFormData] = useState(emptyForm);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(null);

  const filtered = useMemo(() => {
    return promotions.filter((p) => {
      const matchSearch =
        p.code.toLowerCase().includes(searchTerm.toLowerCase()) ||
        p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        p.description.toLowerCase().includes(searchTerm.toLowerCase());
      const matchStatus = filterStatus === 'all' || p.status === filterStatus;
      const matchType = filterType === 'all' || p.type === filterType;
      return matchSearch && matchStatus && matchType;
    });
  }, [promotions, searchTerm, filterStatus, filterType]);

  const totalPages = Math.ceil(filtered.length / ITEMS_PER_PAGE);
  const paginated = filtered.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE
  );

  const handleOpenAdd = () => {
    setEditingId(null);
    setFormData(emptyForm);
    setShowModal(true);
  };

  const handleOpenEdit = (promo) => {
    setEditingId(promo.id);
    setFormData({
      code: promo.code,
      name: promo.name,
      description: promo.description,
      type: promo.type,
      value: promo.value,
      minOrderValue: promo.minOrderValue,
      maxDiscount: promo.maxDiscount,
      startDate: promo.startDate,
      endDate: promo.endDate,
      usageLimit: promo.usageLimit,
      status: promo.status,
    });
    setShowModal(true);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (editingId) {
      setPromotions((prev) =>
        prev.map((p) =>
          p.id === editingId
            ? {
                ...p,
                ...formData,
                value: Number(formData.value),
                minOrderValue: Number(formData.minOrderValue),
                maxDiscount: Number(formData.maxDiscount),
                usageLimit: Number(formData.usageLimit),
              }
            : p
        )
      );
    } else {
      const newPromo = {
        ...formData,
        id: Date.now(),
        value: Number(formData.value),
        minOrderValue: Number(formData.minOrderValue),
        maxDiscount: Number(formData.maxDiscount),
        usageLimit: Number(formData.usageLimit),
        usedCount: 0,
      };
      setPromotions((prev) => [...prev, newPromo]);
    }
    setShowModal(false);
    setFormData(emptyForm);
  };

  const handleDelete = (id) => {
    setPromotions((prev) => prev.filter((p) => p.id !== id));
    setShowDeleteConfirm(null);
  };

  const handleCopyCode = (code) => {
    navigator.clipboard.writeText(code);
  };

  const handleFormChange = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const getUsagePercent = (used, limit) => {
    if (limit === 0) return null;
    return Math.min(Math.round((used / limit) * 100), 100);
  };

  return (
    <div className="promo-page">
      <div className="promo-page__header">
        <div className="promo-page__title-group">
          <h1 className="promo-page__title">
            <FiGift className="promo-page__title-icon" />
            Quản lý Khuyến Mãi
          </h1>
          <p className="promo-page__subtitle">Tạo và quản lý các chương trình khuyến mãi</p>
        </div>
        <button className="promo-btn promo-btn--primary" onClick={handleOpenAdd}>
          <FiPlus /> Thêm khuyến mãi
        </button>
      </div>

      {/* Stats */}
      <div className="promo-stats">
        <div className="promo-stat-card">
          <div className="promo-stat-card__icon promo-stat-card__icon--total"><FiTag /></div>
          <div className="promo-stat-card__info">
            <span className="promo-stat-card__value">{promotions.length}</span>
            <span className="promo-stat-card__label">Tổng khuyến mãi</span>
          </div>
        </div>
        <div className="promo-stat-card">
          <div className="promo-stat-card__icon promo-stat-card__icon--active"><FiCheckCircle /></div>
          <div className="promo-stat-card__info">
            <span className="promo-stat-card__value">{promotions.filter(p => p.status === 'active').length}</span>
            <span className="promo-stat-card__label">Đang hoạt động</span>
          </div>
        </div>
        <div className="promo-stat-card">
          <div className="promo-stat-card__icon promo-stat-card__icon--expired"><FiXCircle /></div>
          <div className="promo-stat-card__info">
            <span className="promo-stat-card__value">{promotions.filter(p => p.status === 'expired').length}</span>
            <span className="promo-stat-card__label">Hết hạn</span>
          </div>
        </div>
        <div className="promo-stat-card">
          <div className="promo-stat-card__icon promo-stat-card__icon--used"><FiPercent /></div>
          <div className="promo-stat-card__info">
            <span className="promo-stat-card__value">{promotions.reduce((sum, p) => sum + p.usedCount, 0)}</span>
            <span className="promo-stat-card__label">Lượt sử dụng</span>
          </div>
        </div>
      </div>

      {/* Toolbar */}
      <div className="promo-toolbar">
        <div className="promo-search">
          <FiSearch className="promo-search__icon" />
          <input
            type="text"
            className="promo-search__input"
            placeholder="Tìm theo mã, tên chương trình..."
            value={searchTerm}
            onChange={(e) => { setSearchTerm(e.target.value); setCurrentPage(1); }}
          />
        </div>
        <div className="promo-filters">
          <div className="promo-filter-group">
            <FiFilter className="promo-filter-group__icon" />
            <select
              className="promo-filter-group__select"
              value={filterStatus}
              onChange={(e) => { setFilterStatus(e.target.value); setCurrentPage(1); }}
            >
              <option value="all">Tất cả trạng thái</option>
              <option value="active">Hoạt động</option>
              <option value="expired">Hết hạn</option>
              <option value="paused">Tạm dừng</option>
            </select>
          </div>
          <div className="promo-filter-group">
            <select
              className="promo-filter-group__select"
              value={filterType}
              onChange={(e) => { setFilterType(e.target.value); setCurrentPage(1); }}
            >
              <option value="all">Tất cả loại</option>
              <option value="percent">Phần trăm (%)</option>
              <option value="fixed">Trực tiếp (VNĐ)</option>
            </select>
          </div>
        </div>
      </div>

      {/* Table */}
      <div className="promo-table-wrapper">
        <table className="promo-table">
          <thead>
            <tr>
              <th>STT</th>
              <th>Mã KM</th>
              <th>Tên chương trình</th>
              <th>Loại</th>
              <th>Giá trị</th>
              <th>Đơn tối thiểu</th>
              <th>Giảm tối đa</th>
              <th>Thời gian</th>
              <th>Đã dùng / Giới hạn</th>
              <th>Trạng thái</th>
              <th>Thao tác</th>
            </tr>
          </thead>
          <tbody>
            {paginated.length === 0 ? (
              <tr>
                <td colSpan="11" className="promo-table__empty">
                  Không tìm thấy khuyến mãi nào
                </td>
              </tr>
            ) : (
              paginated.map((promo, idx) => {
                const usagePercent = getUsagePercent(promo.usedCount, promo.usageLimit);
                const StatusIcon = statusConfig[promo.status]?.icon || FiTag;
                return (
                  <tr key={promo.id}>
                    <td>{(currentPage - 1) * ITEMS_PER_PAGE + idx + 1}</td>
                    <td>
                      <div className="promo-code-cell">
                        <span className="promo-code-badge">{promo.code}</span>
                        <button
                          className="promo-copy-btn"
                          onClick={() => handleCopyCode(promo.code)}
                          title="Sao chép mã"
                        >
                          <FiCopy />
                        </button>
                      </div>
                    </td>
                    <td>
                      <div className="promo-name-cell">
                        <span className="promo-name-cell__name">{promo.name}</span>
                        <span className="promo-name-cell__desc">{promo.description}</span>
                      </div>
                    </td>
                    <td>
                      <span className={`promo-type-badge promo-type-badge--${promo.type}`}>
                        {promo.type === 'percent' ? <><FiPercent /> %</> : <><FiDollarSign /> VNĐ</>}
                      </span>
                    </td>
                    <td className="promo-value-cell">
                      {promo.type === 'percent' ? `${promo.value}%` : formatCurrency(promo.value)}
                    </td>
                    <td>{promo.minOrderValue === 0 ? 'Không' : formatCurrency(promo.minOrderValue)}</td>
                    <td>{formatCurrency(promo.maxDiscount)}</td>
                    <td>
                      <div className="promo-date-cell">
                        <span><FiCalendar /> {promo.startDate}</span>
                        <span className="promo-date-cell__separator">→</span>
                        <span>{promo.endDate}</span>
                      </div>
                    </td>
                    <td>
                      {usagePercent !== null ? (
                        <div className="promo-usage">
                          <div className="promo-usage__bar">
                            <div
                              className="promo-usage__fill"
                              style={{
                                width: `${usagePercent}%`,
                                backgroundColor: usagePercent >= 100 ? '#ef4444' : usagePercent >= 75 ? '#eab308' : '#22c55e',
                              }}
                            />
                          </div>
                          <span className="promo-usage__text">
                            {promo.usedCount}/{promo.usageLimit} ({usagePercent}%)
                          </span>
                        </div>
                      ) : (
                        <div className="promo-usage">
                          <span className="promo-usage__text promo-usage__text--unlimited">
                            {promo.usedCount} (Không giới hạn)
                          </span>
                        </div>
                      )}
                    </td>
                    <td>
                      <span
                        className="promo-status-badge"
                        style={{ color: statusConfig[promo.status]?.color, borderColor: statusConfig[promo.status]?.color }}
                      >
                        <StatusIcon /> {statusConfig[promo.status]?.label}
                      </span>
                    </td>
                    <td>
                      <div className="promo-actions">
                        <button className="promo-action-btn promo-action-btn--edit" title="Chỉnh sửa" onClick={() => handleOpenEdit(promo)}>
                          <FiEdit2 />
                        </button>
                        <button className="promo-action-btn promo-action-btn--delete" title="Xóa" onClick={() => setShowDeleteConfirm(promo.id)}>
                          <FiTrash2 />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="promo-pagination">
          <span className="promo-pagination__info">
            Hiển thị {(currentPage - 1) * ITEMS_PER_PAGE + 1}–{Math.min(currentPage * ITEMS_PER_PAGE, filtered.length)} / {filtered.length} khuyến mãi
          </span>
          <div className="promo-pagination__controls">
            <button
              className="promo-pagination__btn"
              onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
              disabled={currentPage === 1}
            >
              <FiChevronLeft />
            </button>
            {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
              <button
                key={page}
                className={`promo-pagination__btn ${currentPage === page ? 'promo-pagination__btn--active' : ''}`}
                onClick={() => setCurrentPage(page)}
              >
                {page}
              </button>
            ))}
            <button
              className="promo-pagination__btn"
              onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
              disabled={currentPage === totalPages}
            >
              <FiChevronRight />
            </button>
          </div>
        </div>
      )}

      {/* Modal Form */}
      {showModal && (
        <div className="promo-modal-overlay" onClick={() => setShowModal(false)}>
          <div className="promo-modal" onClick={(e) => e.stopPropagation()}>
            <div className="promo-modal__header">
              <h2 className="promo-modal__title">
                {editingId ? 'Chỉnh sửa khuyến mãi' : 'Thêm khuyến mãi mới'}
              </h2>
              <button className="promo-modal__close" onClick={() => setShowModal(false)}>
                <FiX />
              </button>
            </div>
            <form className="promo-form" onSubmit={handleSubmit}>
              <div className="promo-form__grid">
                <div className="promo-form__group">
                  <label className="promo-form__label">Mã khuyến mãi</label>
                  <input
                    type="text"
                    className="promo-form__input"
                    value={formData.code}
                    onChange={(e) => handleFormChange('code', e.target.value.toUpperCase())}
                    placeholder="VD: SUMMER2026"
                    required
                  />
                </div>
                <div className="promo-form__group">
                  <label className="promo-form__label">Tên chương trình</label>
                  <input
                    type="text"
                    className="promo-form__input"
                    value={formData.name}
                    onChange={(e) => handleFormChange('name', e.target.value)}
                    placeholder="VD: Khuyến mãi mùa hè"
                    required
                  />
                </div>
                <div className="promo-form__group promo-form__group--full">
                  <label className="promo-form__label">Mô tả</label>
                  <textarea
                    className="promo-form__textarea"
                    value={formData.description}
                    onChange={(e) => handleFormChange('description', e.target.value)}
                    placeholder="Mô tả chương trình khuyến mãi..."
                    rows={3}
                  />
                </div>
                <div className="promo-form__group">
                  <label className="promo-form__label">Loại giảm giá</label>
                  <select
                    className="promo-form__select"
                    value={formData.type}
                    onChange={(e) => handleFormChange('type', e.target.value)}
                  >
                    <option value="percent">Phần trăm (%)</option>
                    <option value="fixed">Trực tiếp (VNĐ)</option>
                  </select>
                </div>
                <div className="promo-form__group">
                  <label className="promo-form__label">
                    Giá trị giảm {formData.type === 'percent' ? '(%)' : '(VNĐ)'}
                  </label>
                  <input
                    type="number"
                    className="promo-form__input"
                    value={formData.value}
                    onChange={(e) => handleFormChange('value', e.target.value)}
                    placeholder={formData.type === 'percent' ? 'VD: 20' : 'VD: 50000'}
                    min="0"
                    required
                  />
                </div>
                <div className="promo-form__group">
                  <label className="promo-form__label">Đơn tối thiểu (VNĐ)</label>
                  <input
                    type="number"
                    className="promo-form__input"
                    value={formData.minOrderValue}
                    onChange={(e) => handleFormChange('minOrderValue', e.target.value)}
                    placeholder="VD: 100000"
                    min="0"
                    required
                  />
                </div>
                <div className="promo-form__group">
                  <label className="promo-form__label">Giảm tối đa (VNĐ)</label>
                  <input
                    type="number"
                    className="promo-form__input"
                    value={formData.maxDiscount}
                    onChange={(e) => handleFormChange('maxDiscount', e.target.value)}
                    placeholder="VD: 50000"
                    min="0"
                    required
                  />
                </div>
                <div className="promo-form__group">
                  <label className="promo-form__label">Ngày bắt đầu</label>
                  <input
                    type="date"
                    className="promo-form__input"
                    value={formData.startDate}
                    onChange={(e) => handleFormChange('startDate', e.target.value)}
                    required
                  />
                </div>
                <div className="promo-form__group">
                  <label className="promo-form__label">Ngày kết thúc</label>
                  <input
                    type="date"
                    className="promo-form__input"
                    value={formData.endDate}
                    onChange={(e) => handleFormChange('endDate', e.target.value)}
                    required
                  />
                </div>
                <div className="promo-form__group">
                  <label className="promo-form__label">Giới hạn sử dụng</label>
                  <input
                    type="number"
                    className="promo-form__input"
                    value={formData.usageLimit}
                    onChange={(e) => handleFormChange('usageLimit', e.target.value)}
                    placeholder="0 = Không giới hạn"
                    min="0"
                    required
                  />
                </div>
                <div className="promo-form__group">
                  <label className="promo-form__label">Trạng thái</label>
                  <select
                    className="promo-form__select"
                    value={formData.status}
                    onChange={(e) => handleFormChange('status', e.target.value)}
                  >
                    <option value="active">Hoạt động</option>
                    <option value="paused">Tạm dừng</option>
                    <option value="expired">Hết hạn</option>
                  </select>
                </div>
              </div>
              <div className="promo-form__actions">
                <button type="button" className="promo-btn promo-btn--ghost" onClick={() => setShowModal(false)}>
                  Hủy
                </button>
                <button type="submit" className="promo-btn promo-btn--primary">
                  {editingId ? 'Cập nhật' : 'Thêm mới'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirm */}
      {showDeleteConfirm && (
        <div className="promo-modal-overlay" onClick={() => setShowDeleteConfirm(null)}>
          <div className="promo-confirm" onClick={(e) => e.stopPropagation()}>
            <div className="promo-confirm__icon"><FiTrash2 /></div>
            <h3 className="promo-confirm__title">Xác nhận xóa</h3>
            <p className="promo-confirm__text">
              Bạn có chắc chắn muốn xóa khuyến mãi này? Hành động này không thể hoàn tác.
            </p>
            <div className="promo-confirm__actions">
              <button className="promo-btn promo-btn--ghost" onClick={() => setShowDeleteConfirm(null)}>
                Hủy
              </button>
              <button className="promo-btn promo-btn--danger" onClick={() => handleDelete(showDeleteConfirm)}>
                Xóa
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
