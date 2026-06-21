import { useState, useEffect, useMemo } from 'react';
import {
  FiPlus, FiEdit2, FiTrash2, FiSearch, FiX, FiClock,
  FiCalendar, FiChevronLeft, FiChevronRight, FiFilm, FiMonitor
} from 'react-icons/fi';
import './Showtimes.css';

/* ── Mock Data ── */
const mockMovies = [
  { id: 1, title: 'Lật Mặt 8', duration: 132 },
  { id: 2, title: 'Mai', duration: 120 },
  { id: 3, title: 'Đào Phở và Piano', duration: 98 },
  { id: 4, title: 'Godzilla x Kong', duration: 115 },
  { id: 5, title: 'Inside Out 2', duration: 96 },
];

const mockRooms = [
  { id: 1, name: 'Phòng 1', type: '2D' },
  { id: 2, name: 'Phòng 2', type: '3D' },
  { id: 3, name: 'Phòng 3', type: 'IMAX' },
];

const initialShowtimes = [
  { id: 1, movieId: 1, movieTitle: 'Lật Mặt 8', roomId: 1, roomName: 'Phòng 1', date: '2026-05-21', startTime: '09:00', endTime: '11:12', basePrice: 75000, status: 'active' },
  { id: 2, movieId: 2, movieTitle: 'Mai', roomId: 2, roomName: 'Phòng 2', date: '2026-05-21', startTime: '10:00', endTime: '12:00', basePrice: 85000, status: 'active' },
  { id: 3, movieId: 3, movieTitle: 'Đào Phở và Piano', roomId: 3, roomName: 'Phòng 3', date: '2026-05-21', startTime: '14:00', endTime: '15:38', basePrice: 120000, status: 'active' },
  { id: 4, movieId: 4, movieTitle: 'Godzilla x Kong', roomId: 1, roomName: 'Phòng 1', date: '2026-05-22', startTime: '13:00', endTime: '14:55', basePrice: 90000, status: 'active' },
  { id: 5, movieId: 5, movieTitle: 'Inside Out 2', roomId: 2, roomName: 'Phòng 2', date: '2026-05-22', startTime: '15:00', endTime: '16:36', basePrice: 80000, status: 'active' },
  { id: 6, movieId: 1, movieTitle: 'Lật Mặt 8', roomId: 3, roomName: 'Phòng 3', date: '2026-05-22', startTime: '18:00', endTime: '20:12', basePrice: 130000, status: 'active' },
  { id: 7, movieId: 2, movieTitle: 'Mai', roomId: 1, roomName: 'Phòng 1', date: '2026-05-23', startTime: '09:30', endTime: '11:30', basePrice: 75000, status: 'cancelled' },
  { id: 8, movieId: 3, movieTitle: 'Đào Phở và Piano', roomId: 2, roomName: 'Phòng 2', date: '2026-05-23', startTime: '11:00', endTime: '12:38', basePrice: 85000, status: 'active' },
  { id: 9, movieId: 4, movieTitle: 'Godzilla x Kong', roomId: 3, roomName: 'Phòng 3', date: '2026-05-24', startTime: '20:00', endTime: '21:55', basePrice: 140000, status: 'active' },
  { id: 10, movieId: 5, movieTitle: 'Inside Out 2', roomId: 1, roomName: 'Phòng 1', date: '2026-05-24', startTime: '16:00', endTime: '17:36', basePrice: 80000, status: 'cancelled' },
];

/* ── Helpers ── */
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

/* ══════════════════════════════════════════════ */
const Showtimes = () => {
  const [showtimes, setShowtimes] = useState(initialShowtimes);
  const [search, setSearch] = useState('');
  const [filterDate, setFilterDate] = useState('');
  const [filterMovie, setFilterMovie] = useState('');
  const [filterRoom, setFilterRoom] = useState('');
  const [page, setPage] = useState(1);

  /* Modal */
  const [modalOpen, setModalOpen] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [form, setForm] = useState({
    movieId: '', roomId: '', date: '', startTime: '', endTime: '', basePrice: '', status: 'active',
  });

  /* Auto-calculate endTime */
  useEffect(() => {
    if (form.movieId && form.startTime) {
      const movie = mockMovies.find((m) => m.id === Number(form.movieId));
      if (movie) {
        setForm((prev) => ({ ...prev, endTime: calcEndTime(prev.startTime, movie.duration) }));
      }
    }
  }, [form.movieId, form.startTime]);

  /* Filtering + search */
  const filtered = useMemo(() => {
    let data = [...showtimes];
    if (search) {
      const q = search.toLowerCase();
      data = data.filter(
        (s) =>
          s.movieTitle.toLowerCase().includes(q) ||
          s.roomName.toLowerCase().includes(q),
      );
    }
    if (filterDate) data = data.filter((s) => s.date === filterDate);
    if (filterMovie) data = data.filter((s) => s.movieId === Number(filterMovie));
    if (filterRoom) data = data.filter((s) => s.roomId === Number(filterRoom));
    return data;
  }, [showtimes, search, filterDate, filterMovie, filterRoom]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / ITEMS_PER_PAGE));
  const paginated = filtered.slice((page - 1) * ITEMS_PER_PAGE, page * ITEMS_PER_PAGE);

  useEffect(() => { setPage(1); }, [search, filterDate, filterMovie, filterRoom]);

  /* ── CRUD ── */
  const openCreate = () => {
    setEditingId(null);
    setForm({ movieId: '', roomId: '', date: '', startTime: '', endTime: '', basePrice: '', status: 'active' });
    setModalOpen(true);
  };

  const openEdit = (item) => {
    setEditingId(item.id);
    setForm({
      movieId: String(item.movieId),
      roomId: String(item.roomId),
      date: item.date,
      startTime: item.startTime,
      endTime: item.endTime,
      basePrice: String(item.basePrice),
      status: item.status,
    });
    setModalOpen(true);
  };

  const handleSave = () => {
    const movie = mockMovies.find((m) => m.id === Number(form.movieId));
    const room = mockRooms.find((r) => r.id === Number(form.roomId));
    if (!movie || !room || !form.date || !form.startTime || !form.basePrice) return;

    const entry = {
      id: editingId || Date.now(),
      movieId: movie.id,
      movieTitle: movie.title,
      roomId: room.id,
      roomName: room.name,
      date: form.date,
      startTime: form.startTime,
      endTime: form.endTime,
      basePrice: Number(form.basePrice),
      status: form.status,
    };

    if (editingId) {
      setShowtimes((prev) => prev.map((s) => (s.id === editingId ? entry : s)));
    } else {
      setShowtimes((prev) => [entry, ...prev]);
    }
    setModalOpen(false);
  };

  const handleDelete = (id) => {
    if (window.confirm('Bạn có chắc muốn xoá suất chiếu này?')) {
      setShowtimes((prev) => prev.filter((s) => s.id !== id));
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  /* ══════════════ RENDER ══════════════ */
  return (
    <div className="st-page">
      {/* Header */}
      <div className="st-header">
        <h1 className="st-title"><FiClock /> Quản lý Suất Chiếu</h1>
        <button className="st-btn st-btn-primary" onClick={openCreate}>
          <FiPlus /> Thêm suất chiếu
        </button>
      </div>

      {/* Filters */}
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
              {mockMovies.map((m) => (
                <option key={m.id} value={m.id}>{m.title}</option>
              ))}
            </select>
          </div>
          <div className="st-filter-item">
            <FiMonitor />
            <select className="st-filter-select" value={filterRoom} onChange={(e) => setFilterRoom(e.target.value)}>
              <option value="">Tất cả phòng</option>
              {mockRooms.map((r) => (
                <option key={r.id} value={r.id}>{r.name} ({r.type})</option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Table */}
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
                <tr key={s.id}>
                  <td>{(page - 1) * ITEMS_PER_PAGE + idx + 1}</td>
                  <td className="st-movie-cell">{s.movieTitle}</td>
                  <td>{s.roomName}</td>
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
                      <button className="st-action-btn st-delete" onClick={() => handleDelete(s.id)} title="Xoá">
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

      {/* Pagination */}
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

      {/* Modal */}
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
                    {mockMovies.map((m) => (
                      <option key={m.id} value={m.id}>{m.title} ({m.duration} phút)</option>
                    ))}
                  </select>
                </div>
                <div className="st-form-group">
                  <label className="st-label">Phòng chiếu <span className="st-required">*</span></label>
                  <select className="st-input" name="roomId" value={form.roomId} onChange={handleChange}>
                    <option value="">-- Chọn phòng --</option>
                    {mockRooms.map((r) => (
                      <option key={r.id} value={r.id}>{r.name} ({r.type})</option>
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
