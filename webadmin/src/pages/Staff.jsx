import { useState, useMemo, useEffect } from 'react';
import {
  FiSearch, FiPlus, FiEdit2, FiTrash2, FiX, FiFilter,
  FiChevronLeft, FiChevronRight, FiShield, FiUsers,
  FiUser, FiBriefcase, FiMail, FiPhone, FiCalendar,
  FiDollarSign, FiLock
} from 'react-icons/fi';
import { staffAPI } from '../api/apiService';
import './Staff.css';

const formatCurrency = (v) => new Intl.NumberFormat('vi-VN').format(v) + ' VNĐ';

const ITEMS_PER_PAGE = 8;

const emptyForm = {
  fullName: '', email: '', phone: '', role: 'staff',
  department: '', startDate: '', salary: '', status: 'active',
  username: '', password: '',
};

const roleConfig = {
  admin: { label: 'Admin', color: '#ef4444', icon: FiShield },
  manager: { label: 'Quản lý', color: '#f59e0b', icon: FiBriefcase },
  staff: { label: 'Nhân viên', color: '#22c55e', icon: FiUser },
};

const statusConfig = {
  active: { label: 'Hoạt động', color: '#22c55e' },
  inactive: { label: 'Nghỉ việc', color: '#ef4444' },
};

const departments = ['Quản lý', 'Bán vé', 'Thu ngân', 'Soát vé', 'Bán hàng'];

const mapStaffFromAPI = (item) => ({
  _id: item._id,
  fullName: item.fullName || '',
  username: item.username || '',
  email: item.email || '',
  phone: item.phone || '',
  role: item.role || 'staff',
  active: item.active,
  status: item.active ? 'active' : 'inactive',
  department: item.department || 'Chưa phân công',
  startDate: item.startDate || (item.createdAt ? item.createdAt.slice(0, 10) : '-'),
  salary: item.salary != null ? item.salary : 0,
});

export default function Staff() {
  const [staff, setStaff] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterRole, setFilterRole] = useState('all');
  const [filterDept, setFilterDept] = useState('all');
  const [filterStatus, setFilterStatus] = useState('all');
  const [currentPage, setCurrentPage] = useState(1);
  const [showModal, setShowModal] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [formData, setFormData] = useState(emptyForm);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(null);

  const fetchStaff = async () => {
    setLoading(true);
    try {
      const res = await staffAPI.getAll();
      const list = Array.isArray(res.data) ? res.data.map(mapStaffFromAPI) : [];
      setStaff(list);
    } catch (err) {
      console.error('Failed to fetch staff:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStaff();
  }, []);

  const filtered = useMemo(() => {
    return staff.filter((s) => {
      const matchSearch =
        s.fullName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        s.email.toLowerCase().includes(searchTerm.toLowerCase());
      const matchRole = filterRole === 'all' || s.role === filterRole;
      const matchDept = filterDept === 'all' || s.department === filterDept;
      const matchStatus = filterStatus === 'all' || s.status === filterStatus;
      return matchSearch && matchRole && matchDept && matchStatus;
    });
  }, [staff, searchTerm, filterRole, filterDept, filterStatus]);

  const totalPages = Math.ceil(filtered.length / ITEMS_PER_PAGE);
  const paginated = filtered.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE
  );

  const handleOpenAdd = () => {
    setEditingId(null);
    setFormData({ ...emptyForm });
    setShowModal(true);
  };

  const handleOpenEdit = (s) => {
    setEditingId(s._id);
    setFormData({
      fullName: s.fullName,
      email: s.email,
      phone: s.phone,
      role: s.role,
      department: s.department,
      startDate: s.startDate,
      salary: s.salary,
      status: s.status,
      username: s.username || '',
      password: '',
    });
    setShowModal(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingId) {
        await staffAPI.update(editingId, {
          fullName: formData.fullName,
          email: formData.email,
          phone: formData.phone,
          role: formData.role,
          active: formData.status === 'active',
        });
      } else {
        await staffAPI.create({
          username: formData.username,
          password: formData.password,
          fullName: formData.fullName,
          email: formData.email,
          phone: formData.phone,
          role: formData.role,
        });
      }
      setShowModal(false);
      setFormData({ ...emptyForm });
      fetchStaff();
    } catch (err) {
      console.error('Failed to save staff:', err);
      alert(err.message || 'Có lỗi xảy ra');
    }
  };

  const handleDelete = async (id) => {
    try {
      await staffAPI.delete(id);
      setShowDeleteConfirm(null);
      fetchStaff();
    } catch (err) {
      console.error('Failed to delete staff:', err);
      alert(err.message || 'Có lỗi xảy ra');
    }
  };

  const handleFormChange = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const getInitials = (name) => {
    return name.split(' ').map(w => w[0]).join('').slice(-2).toUpperCase();
  };

  const totalSalary = staff.filter(s => s.status === 'active').reduce((sum, s) => sum + s.salary, 0);
  const uniqueDepts = [...new Set(staff.map(s => s.department))];

  return (
    <div className="staff-page">
      <div className="staff-page__header">
        <div className="staff-page__title-group">
          <h1 className="staff-page__title">
            <FiUsers className="staff-page__title-icon" />
            Quản lý Nhân Viên
          </h1>
          <p className="staff-page__subtitle">Quản lý nhân sự và phân quyền (Admin)</p>
        </div>
        <button className="staff-btn staff-btn--primary" onClick={handleOpenAdd}>
          <FiPlus /> Thêm nhân viên
        </button>
      </div>

      {/* Stats */}
      <div className="staff-stats">
        <div className="staff-stat-card">
          <div className="staff-stat-card__icon staff-stat-card__icon--total"><FiUsers /></div>
          <div className="staff-stat-card__info">
            <span className="staff-stat-card__value">{staff.length}</span>
            <span className="staff-stat-card__label">Tổng nhân viên</span>
          </div>
        </div>
        <div className="staff-stat-card">
          <div className="staff-stat-card__icon staff-stat-card__icon--active"><FiUser /></div>
          <div className="staff-stat-card__info">
            <span className="staff-stat-card__value">{staff.filter(s => s.status === 'active').length}</span>
            <span className="staff-stat-card__label">Đang làm việc</span>
          </div>
        </div>
        <div className="staff-stat-card">
          <div className="staff-stat-card__icon staff-stat-card__icon--dept"><FiBriefcase /></div>
          <div className="staff-stat-card__info">
            <span className="staff-stat-card__value">{uniqueDepts.length}</span>
            <span className="staff-stat-card__label">Bộ phận</span>
          </div>
        </div>
        <div className="staff-stat-card">
          <div className="staff-stat-card__icon staff-stat-card__icon--salary"><FiDollarSign /></div>
          <div className="staff-stat-card__info">
            <span className="staff-stat-card__value">{formatCurrency(totalSalary)}</span>
            <span className="staff-stat-card__label">Tổng lương / tháng</span>
          </div>
        </div>
      </div>

      {/* Toolbar */}
      <div className="staff-toolbar">
        <div className="staff-search">
          <FiSearch className="staff-search__icon" />
          <input
            type="text"
            className="staff-search__input"
            placeholder="Tìm theo tên, email..."
            value={searchTerm}
            onChange={(e) => { setSearchTerm(e.target.value); setCurrentPage(1); }}
          />
        </div>
        <div className="staff-filters">
          <div className="staff-filter-group">
            <FiFilter className="staff-filter-group__icon" />
            <select
              className="staff-filter-group__select"
              value={filterRole}
              onChange={(e) => { setFilterRole(e.target.value); setCurrentPage(1); }}
            >
              <option value="all">Tất cả vai trò</option>
              <option value="admin">Admin</option>
              <option value="manager">Quản lý</option>
              <option value="staff">Nhân viên</option>
            </select>
          </div>
          <div className="staff-filter-group">
            <select
              className="staff-filter-group__select"
              value={filterDept}
              onChange={(e) => { setFilterDept(e.target.value); setCurrentPage(1); }}
            >
              <option value="all">Tất cả bộ phận</option>
              {departments.map((d) => (
                <option key={d} value={d}>{d}</option>
              ))}
            </select>
          </div>
          <div className="staff-filter-group">
            <select
              className="staff-filter-group__select"
              value={filterStatus}
              onChange={(e) => { setFilterStatus(e.target.value); setCurrentPage(1); }}
            >
              <option value="all">Tất cả trạng thái</option>
              <option value="active">Hoạt động</option>
              <option value="inactive">Nghỉ việc</option>
            </select>
          </div>
        </div>
      </div>

      {/* Table */}
      <div className="staff-table-wrapper">
        {loading ? (
          <div className="staff-table__loading">Đang tải dữ liệu...</div>
        ) : (
          <table className="staff-table">
            <thead>
              <tr>
                <th>STT</th>
                <th>Họ tên</th>
                <th>Email</th>
                <th>SĐT</th>
                <th>Vai trò</th>
                <th>Bộ phận</th>
                <th>Ngày vào làm</th>
                <th>Lương (VNĐ)</th>
                <th>Trạng thái</th>
                <th>Thao tác</th>
              </tr>
            </thead>
            <tbody>
              {paginated.length === 0 ? (
                <tr>
                  <td colSpan="10" className="staff-table__empty">
                    Không tìm thấy nhân viên nào
                  </td>
                </tr>
              ) : (
                paginated.map((s, idx) => {
                  const RoleIcon = roleConfig[s.role]?.icon || FiUser;
                  return (
                    <tr key={s._id}>
                      <td>{(currentPage - 1) * ITEMS_PER_PAGE + idx + 1}</td>
                      <td>
                        <div className="staff-name-cell">
                          <div
                            className="staff-avatar"
                            style={{ backgroundColor: roleConfig[s.role]?.color + '25', color: roleConfig[s.role]?.color }}
                          >
                            {getInitials(s.fullName)}
                          </div>
                          <span className="staff-name-cell__name">{s.fullName}</span>
                        </div>
                      </td>
                      <td><span className="staff-email">{s.email}</span></td>
                      <td>{s.phone}</td>
                      <td>
                        <span
                          className="staff-role-badge"
                          style={{ backgroundColor: roleConfig[s.role]?.color + '18', color: roleConfig[s.role]?.color, borderColor: roleConfig[s.role]?.color + '40' }}
                        >
                          <RoleIcon /> {roleConfig[s.role]?.label}
                        </span>
                      </td>
                      <td>
                        <span className="staff-dept-badge">{s.department}</span>
                      </td>
                      <td>
                        <span className="staff-date"><FiCalendar /> {s.startDate}</span>
                      </td>
                      <td className="staff-salary">{formatCurrency(s.salary)}</td>
                      <td>
                        <span
                          className="staff-status-badge"
                          style={{ color: statusConfig[s.status]?.color, borderColor: statusConfig[s.status]?.color }}
                        >
                          {statusConfig[s.status]?.label}
                        </span>
                      </td>
                      <td>
                        <div className="staff-actions">
                          <button className="staff-action-btn staff-action-btn--edit" title="Chỉnh sửa" onClick={() => handleOpenEdit(s)}>
                            <FiEdit2 />
                          </button>
                          <button className="staff-action-btn staff-action-btn--delete" title="Xóa" onClick={() => setShowDeleteConfirm(s._id)}>
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
        )}
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="staff-pagination">
          <span className="staff-pagination__info">
            Hiển thị {(currentPage - 1) * ITEMS_PER_PAGE + 1}–{Math.min(currentPage * ITEMS_PER_PAGE, filtered.length)} / {filtered.length} nhân viên
          </span>
          <div className="staff-pagination__controls">
            <button
              className="staff-pagination__btn"
              onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
              disabled={currentPage === 1}
            >
              <FiChevronLeft />
            </button>
            {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
              <button
                key={page}
                className={`staff-pagination__btn ${currentPage === page ? 'staff-pagination__btn--active' : ''}`}
                onClick={() => setCurrentPage(page)}
              >
                {page}
              </button>
            ))}
            <button
              className="staff-pagination__btn"
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
        <div className="staff-modal-overlay" onClick={() => setShowModal(false)}>
          <div className="staff-modal" onClick={(e) => e.stopPropagation()}>
            <div className="staff-modal__header">
              <h2 className="staff-modal__title">
                {editingId ? 'Chỉnh sửa nhân viên' : 'Thêm nhân viên mới'}
              </h2>
              <button className="staff-modal__close" onClick={() => setShowModal(false)}>
                <FiX />
              </button>
            </div>
            <form className="staff-form" onSubmit={handleSubmit}>
              <div className="staff-form__grid">
                <div className="staff-form__group">
                  <label className="staff-form__label"><FiUser className="staff-form__label-icon" /> Tên đăng nhập</label>
                  <input
                    type="text"
                    className="staff-form__input"
                    value={formData.username}
                    onChange={(e) => handleFormChange('username', e.target.value)}
                    placeholder="VD: nguyenvanadmin"
                    required={!editingId}
                    readOnly={!!editingId}
                  />
                </div>
                <div className="staff-form__group">
                  <label className="staff-form__label"><FiLock className="staff-form__label-icon" /> Mật khẩu</label>
                  <input
                    type="password"
                    className="staff-form__input"
                    value={formData.password}
                    onChange={(e) => handleFormChange('password', e.target.value)}
                    placeholder={editingId ? 'Để trống nếu không đổi' : 'Nhập mật khẩu'}
                    required={!editingId}
                  />
                </div>
                <div className="staff-form__group">
                  <label className="staff-form__label"><FiUser className="staff-form__label-icon" /> Họ tên</label>
                  <input
                    type="text"
                    className="staff-form__input"
                    value={formData.fullName}
                    onChange={(e) => handleFormChange('fullName', e.target.value)}
                    placeholder="VD: Nguyễn Văn A"
                    required
                  />
                </div>
                <div className="staff-form__group">
                  <label className="staff-form__label"><FiMail className="staff-form__label-icon" /> Email</label>
                  <input
                    type="email"
                    className="staff-form__input"
                    value={formData.email}
                    onChange={(e) => handleFormChange('email', e.target.value)}
                    placeholder="VD: a.nguyen@cinez.vn"
                    required
                  />
                </div>
                <div className="staff-form__group">
                  <label className="staff-form__label"><FiPhone className="staff-form__label-icon" /> Số điện thoại</label>
                  <input
                    type="text"
                    className="staff-form__input"
                    value={formData.phone}
                    onChange={(e) => handleFormChange('phone', e.target.value)}
                    placeholder="VD: 0901234567"
                    required
                  />
                </div>
                <div className="staff-form__group">
                  <label className="staff-form__label"><FiShield className="staff-form__label-icon" /> Vai trò</label>
                  <select
                    className="staff-form__select"
                    value={formData.role}
                    onChange={(e) => handleFormChange('role', e.target.value)}
                  >
                    <option value="admin">Admin</option>
                    <option value="manager">Quản lý</option>
                    <option value="staff">Nhân viên</option>
                  </select>
                </div>
                <div className="staff-form__group">
                  <label className="staff-form__label"><FiBriefcase className="staff-form__label-icon" /> Bộ phận</label>
                  <select
                    className="staff-form__select"
                    value={formData.department}
                    onChange={(e) => handleFormChange('department', e.target.value)}
                  >
                    <option value="">-- Chọn bộ phận --</option>
                    {departments.map((d) => (
                      <option key={d} value={d}>{d}</option>
                    ))}
                  </select>
                </div>
                <div className="staff-form__group">
                  <label className="staff-form__label"><FiCalendar className="staff-form__label-icon" /> Ngày vào làm</label>
                  <input
                    type="date"
                    className="staff-form__input"
                    value={formData.startDate}
                    onChange={(e) => handleFormChange('startDate', e.target.value)}
                  />
                </div>
                <div className="staff-form__group">
                  <label className="staff-form__label"><FiDollarSign className="staff-form__label-icon" /> Lương (VNĐ)</label>
                  <input
                    type="number"
                    className="staff-form__input"
                    value={formData.salary}
                    onChange={(e) => handleFormChange('salary', e.target.value)}
                    placeholder="VD: 12000000"
                    min="0"
                  />
                </div>
                <div className="staff-form__group">
                  <label className="staff-form__label">Trạng thái</label>
                  <select
                    className="staff-form__select"
                    value={formData.status}
                    onChange={(e) => handleFormChange('status', e.target.value)}
                  >
                    <option value="active">Hoạt động</option>
                    <option value="inactive">Nghỉ việc</option>
                  </select>
                </div>
              </div>
              <div className="staff-form__actions">
                <button type="button" className="staff-btn staff-btn--ghost" onClick={() => setShowModal(false)}>
                  Hủy
                </button>
                <button type="submit" className="staff-btn staff-btn--primary">
                  {editingId ? 'Cập nhật' : 'Thêm mới'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirm */}
      {showDeleteConfirm && (
        <div className="staff-modal-overlay" onClick={() => setShowDeleteConfirm(null)}>
          <div className="staff-confirm" onClick={(e) => e.stopPropagation()}>
            <div className="staff-confirm__icon"><FiTrash2 /></div>
            <h3 className="staff-confirm__title">Xác nhận xóa</h3>
            <p className="staff-confirm__text">
              Bạn có chắc chắn muốn xóa nhân viên này? Hành động này không thể hoàn tác.
            </p>
            <div className="staff-confirm__actions">
              <button className="staff-btn staff-btn--ghost" onClick={() => setShowDeleteConfirm(null)}>
                Hủy
              </button>
              <button className="staff-btn staff-btn--danger" onClick={() => handleDelete(showDeleteConfirm)}>
                Xóa
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
