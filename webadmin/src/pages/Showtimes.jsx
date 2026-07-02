import { useState, useEffect, useMemo } from 'react';
import {
  FiPlus, FiEdit2, FiTrash2, FiSearch, FiX, FiClock,
  FiCalendar, FiChevronLeft, FiChevronRight, FiFilm, FiMonitor
} from 'react-icons/fi';
import { showtimeAPI, movieAPI, roomAPI } from '../api/apiService';
import './Showtimes.css';

const formatCurrency = (val) =>
  new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(val);

const calcEndTime = (startTime, durationMin) => {
  if (!startTime || !durationMin) return '';
  const [h, m] = startTime.split(':').map(Number);
  const total = h * 60 + m + durationMin;
  const eh = Math.floor(total / 60) % 24;
  const em = total % 60;
  return `${String(eh).padStart(2, '0')}:${String(em).padStart(2, '0')}`;
};

const ITEMS_PER_PAGE = 6;

const Showtimes = () => {
  const [showtimes, setShowtimes] = useState([]);
  const [movies, setMovies] = useState([]);
  const [rooms, setRooms] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [notification, setNotification] = useState(null);
  const [search, setSearch] = useState('');
  const [filterDate, setFilterDate] = useState('');
  const [filterMovie, setFilterMovie] = useState('');
  const [filterRoom, setFilterRoom] = useState('');
  const [page, setPage] = useState(1);

  const [modalOpen, setModalOpen] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [form, setForm] = useState({
    movieId: '', roomId: '', date: '', startTime: '', endTime: '', basePrice: '', status: 'active',
  });

  const showNotification = (message, type = 'success') => {
    setNotification({ message, type });
    setTimeout(() => setNotification(null), 3000);
  };

  const fetchData = async () => {
    setLoading(true);
    setError('');
    try {
      const [showtimesRes, moviesRes, roomsRes] = await Promise.all([
        showtimeAPI.getAll(),
        movieAPI.getAll(),
        roomAPI.getAll(),
      ]);
      setShowtimes(showtimesRes.data || []);
      setMovies(moviesRes.data || []);
      setRooms(roomsRes.data || []);
    } catch (err) {
      setError(err.message || 'Không thể tải dữ liệu');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  useEffect(() => {
    if (form.movieId && form.startTime) {
      const movie = movies.find((m) => m._id === form.movieId);
      if (movie) {
        setForm((prev) => ({ ...prev, endTime: calcEndTime(prev.startTime, movie.duration) }));
      }
    }
  }, [form.movieId, form.startTime, movies]);

  const filtered = useMemo(() => {
    let data = [...showtimes];
    if (search) {
      const q = search.toLowerCase();
      data = data.filter(
        (s) =>
          (s.movieId?.title || '').toLowerCase().includes(q) ||
          (s.roomId?.name || '').toLowerCase().includes(q),
      );
    }
    if (filterDate) data = data.filter((s) => s.date === filterDate);
    if (filterMovie) data = data.filter((s) => s.movieId?._id === filterMovie);
    if (filterRoom) data = data.filter((s) => s.roomId?._id === filterRoom);
    return data;
  }, [showtimes, search, filterDate, filterMovie, filterRoom]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / ITEMS_PER_PAGE));
  const paginated = filtered.slice((page - 1) * ITEMS_PER_PAGE, page * ITEMS_PER_PAGE);

  useEffect(() => { setPage(1); }, [search, filterDate, filterMovie, filterRoom]);

  const openCreate = () => {
    setEditingId(null);
    setForm({ movieId: '', roomId: '', date: '', startTime: '', endTime: '', basePrice: '', status: 'active' });
    setModalOpen(true);
  };

  const openEdit = (item) => {
    setEditingId(item._id);
    setForm({
      movieId: item.movieId?._id || '',
      roomId: item.roomId?._id || '',
      date: item.date,
      startTime: item.startTime,
      endTime: item.endTime,
      basePrice: String(item.basePrice),
      status: item.status,
    });
    setModalOpen(true);
  };

  const handleSave = async () => {
    const movie = movies.find((m) => m._id === form.movieId);
    const room = rooms.find((r) => r._id === form.roomId);
    if (!movie || !room || !form.date || !form.startTime || !form.basePrice) {
      showNotification('Vui lòng điền đầy đủ thông tin bắt buộc', 'error');
      return;
    }

    const payload = {
      movieId: form.movieId,
      roomId: form.roomId,
      date: form.date,
      startTime: form.startTime,
      endTime: form.endTime,
      basePrice: Number(form.basePrice),
      status: form.status,
    };

    try {
      if (editingId) {
        await showtimeAPI.update(editingId, payload);
        showNotification('Cập nhật suất chiếu thành công');
      } else {
        await showtimeAPI.create(payload);
        showNotification('Thêm suất chiếu thành công');
      }
      setModalOpen(false);
      fetchData();
    } catch (err) {
      showNotification(err.message || 'Thao tác thất bại', 'error');
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Bạn có chắc muốn xoá suất chiếu này?')) {
      try {
        await showtimeAPI.delete(id);
        showNotification('Xoá suất chiếu thành công');
        fetchData();
      } catch (err) {
        showNotification(err.message || 'Xoá thất bại', 'error');
      }
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  if (loading) {
    return (
      <div className="st-page">
        <div className="st-loading">Đang tải dữ liệu...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="st-page">
        <div className="st-error">
          <p>{error}</p>
          <button className="st-btn st-btn-primary" onClick={fetchData}>Thử lại</button>
        </div>
      </div>
    );
  }

  return (
    <div className="st-page">
      {notification && (
        <div className={`st-notification st-notification-${notification.type}`}>
          {notification.message}
        </div>
      )}

      <div className="st-header">
        <h1 className="st-title"><FiClock /> Quản lý Suất Chiếu</h1>
        <button className="st-btn st-btn-primary" onClick={openCreate}>
          <FiPlus /> Thêm suất chiếu
        </button>
      </div>

      <div className="st-filters">
        <div className="st-search-wrap">
          <FiSearch className="st-search-icon" />
          <input
            className="st-search"
            placeholder="Tìm phim, phòng chiếu..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
          {search && (
            <button className="st-search-clear" onClick={() => setSearch('')}>
              <FiX />
            </button>
          )}
        </div>

        <div className="st-filter-group">
          <div className="st-filter-item">
            <FiCalendar />
            <input
              type="date"
              className="st-filter-input"
              value={filterDate}
              onChange={(e) => setFilterDate(e.target.value)}
            />
          </div>
          <div className="st-filter-item">
            <FiFilm />
            <select className="st-filter-select" value={filterMovie} onChange={(e) => setFilterMovie(e.target.value)}>
              <option value="">Tất cả phim</option>
              {movies.map((m) => (
                <option key={m._id} value={m._id}>{m.title}</option>
              ))}
            </select>
          </div>
          <div className="st-filter-item">
            <FiMonitor />
            <select className="st-filter-select" value={filterRoom} onChange={(e) => setFilterRoom(e.target.value)}>
              <option value="">Tất cả phòng</option>
              {rooms.map((r) => (
                <option key={r._id} value={r._id}>{r.name} ({r.type})</option>
              ))}
            </select>
          </div>
        </div>
      </div>

      <div className="st-table-wrap">
        <table className="st-table">
          <thead>
            <tr>
              <th>STT</th>
              <th>Phim</th>
              <th>Phòng chiếu</th>
              <th>Ngày chiếu</th>
              <th>Giờ bắt đầu</th>
              <th>Giờ kết thúc</th>
              <th>Giá vé</th>
              <th>Trạng thái</th>
              <th>Thao tác</th>
            </tr>
          </thead>
          <tbody>
            {paginated.length === 0 ? (
              <tr>
                <td colSpan={9} className="st-empty">Không tìm thấy suất chiếu nào</td>
              </tr>
            ) : (
              paginated.map((s, idx) => (
                <tr key={s._id}>
                  <td>{(page - 1) * ITEMS_PER_PAGE + idx + 1}</td>
                  <td className="st-movie-cell">{s.movieId?.title || ''}</td>
                  <td>{s.roomId?.name || ''}</td>
                  <td>{new Date(s.date).toLocaleDateString('vi-VN')}</td>
                  <td>{s.startTime}</td>
                  <td>{s.endTime}</td>
                  <td className="st-price">{formatCurrency(s.basePrice)}</td>
                  <td>
                    <span className={`st-badge ${s.status === 'active' ? 'st-badge-active' : 'st-badge-cancelled'}`}>
                      {s.status === 'active' ? 'Hoạt động' : 'Đã huỷ'}
                    </span>
                  </td>
                  <td>
                    <div className="st-actions">
                      <button className="st-action-btn st-edit" onClick={() => openEdit(s)} title="Chỉnh sửa">
                        <FiEdit2 />
                      </button>
                      <button className="st-action-btn st-delete" onClick={() => handleDelete(s._id)} title="Xoá">
                        <FiTrash2 />
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {totalPages > 1 && (
        <div className="st-pagination">
          <span className="st-page-info">
            Hiển thị {(page - 1) * ITEMS_PER_PAGE + 1}–{Math.min(page * ITEMS_PER_PAGE, filtered.length)} / {filtered.length}
          </span>
          <div className="st-page-btns">
            <button className="st-page-btn" disabled={page === 1} onClick={() => setPage(page - 1)}>
              <FiChevronLeft />
            </button>
            {Array.from({ length: totalPages }, (_, i) => (
              <button
                key={i}
                className={`st-page-btn ${page === i + 1 ? 'st-page-active' : ''}`}
                onClick={() => setPage(i + 1)}
              >
                {i + 1}
              </button>
            ))}
            <button className="st-page-btn" disabled={page === totalPages} onClick={() => setPage(page + 1)}>
              <FiChevronRight />
            </button>
          </div>
        </div>
      )}

      {modalOpen && (
        <div className="st-overlay" onClick={() => setModalOpen(false)}>
          <div className="st-modal" onClick={(e) => e.stopPropagation()}>
            <div className="st-modal-header">
              <h2>{editingId ? 'Chỉnh sửa suất chiếu' : 'Thêm suất chiếu mới'}</h2>
              <button className="st-modal-close" onClick={() => setModalOpen(false)}><FiX /></button>
            </div>

            <div className="st-modal-body">
              <div className="st-form-row">
                <div className="st-form-group">
                  <label className="st-label">Phim <span className="st-required">*</span></label>
                  <select className="st-input" name="movieId" value={form.movieId} onChange={handleChange}>
                    <option value="">-- Chọn phim --</option>
                    {movies.map((m) => (
                      <option key={m._id} value={m._id}>{m.title} ({m.duration} phút)</option>
                    ))}
                  </select>
                </div>
                <div className="st-form-group">
                  <label className="st-label">Phòng chiếu <span className="st-required">*</span></label>
                  <select className="st-input" name="roomId" value={form.roomId} onChange={handleChange}>
                    <option value="">-- Chọn phòng --</option>
                    {rooms.map((r) => (
                      <option key={r._id} value={r._id}>{r.name} ({r.type})</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="st-form-row">
                <div className="st-form-group">
                  <label className="st-label">Ngày chiếu <span className="st-required">*</span></label>
                  <input className="st-input" type="date" name="date" value={form.date} onChange={handleChange} />
                </div>
                <div className="st-form-group">
                  <label className="st-label">Giờ bắt đầu <span className="st-required">*</span></label>
                  <input className="st-input" type="time" name="startTime" value={form.startTime} onChange={handleChange} />
                </div>
              </div>

              <div className="st-form-row">
                <div className="st-form-group">
                  <label className="st-label">Giờ kết thúc <span className="st-hint">(tự động tính)</span></label>
                  <input className="st-input st-input-disabled" type="time" name="endTime" value={form.endTime} readOnly />
                </div>
                <div className="st-form-group">
                  <label className="st-label">Giá vé (VNĐ) <span className="st-required">*</span></label>
                  <input
                    className="st-input"
                    type="number"
                    name="basePrice"
                    placeholder="VD: 85000"
                    value={form.basePrice}
                    onChange={handleChange}
                    min={0}
                    step={1000}
                  />
                </div>
              </div>

              <div className="st-form-group">
                <label className="st-label">Trạng thái</label>
                <select className="st-input" name="status" value={form.status} onChange={handleChange}>
                  <option value="active">Hoạt động</option>
                  <option value="cancelled">Đã huỷ</option>
                </select>
              </div>
            </div>

            <div className="st-modal-footer">
              <button className="st-btn st-btn-ghost" onClick={() => setModalOpen(false)}>Huỷ</button>
              <button className="st-btn st-btn-primary" onClick={handleSave}>
                {editingId ? 'Cập nhật' : 'Tạo mới'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Showtimes;
