import React, { useState, useEffect } from 'react';
import { FiPlus, FiEdit2, FiTrash2, FiSearch, FiFilm, FiList, FiGrid, FiLoader, FiUpload, FiX } from 'react-icons/fi';
import { movieAPI, uploadImage } from '../api/apiService';
import './Movies.css';

const GENRE_API = 'http://localhost:5000/api/genres';

const COUNTRY_LIST = [
  'Việt Nam', 'Mỹ', 'Anh', 'Pháp', 'Đức', 'Nhật Bản', 'Hàn Quốc',
  'Trung Quốc', 'Hồng Kông', 'Đài Loan', 'Thái Lan', 'Ấn Độ', 'Tây Ban Nha',
  'Ý', 'Nga', 'Úc', 'Canada', 'Mexico', 'Brazil', 'Thụy Điển', 'Hà Lan', 'Khác'
];

const Movies = () => {
  const [movies, setMovies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [genresList, setGenresList] = useState([]);

  const [viewMode, setViewMode] = useState('grid');
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [showModal, setShowModal] = useState(false);
  const [editingMovie, setEditingMovie] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [posterPreview, setPosterPreview] = useState('');
  const [castInput, setCastInput] = useState('');
  const [castError, setCastError] = useState('');
  const [newMovie, setNewMovie] = useState({
    title: '', original_title: '', poster: '', trailer_url: '', description: '',
    categoryIds: [], director: '', cast: [], duration: '', releaseDate: '',
    rated: 'P', status: 'now_playing', storyline: '',
    language: 'Phụ đề', country: '', formats: []
  });

  const fetchMovies = async () => {
    try {
      setLoading(true);
      setError('');
      const res = await movieAPI.getAll();
      if (res.success) {
        setMovies(res.data || []);
      }
    } catch (error) {
      setError(error?.response?.data?.message || 'Không thể tải danh sách phim');
      console.error('Failed to fetch movies:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMovies();
    fetchGenres();
  }, []);

  const fetchGenres = async () => {
    try {
      const res = await fetch(GENRE_API);
      const json = await res.json();
      setGenresList(json.data || json || []);
    } catch (error) {
      console.error('Failed to fetch genres:', error);
      setGenresList([]);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setNewMovie(prev => ({ ...prev, [name]: value }));
  };

  const handleFormatToggle = (format) => {
    setNewMovie(prev => {
      const has = prev.formats.includes(format);
      return {
        ...prev,
        formats: has ? prev.formats.filter(f => f !== format) : [...prev.formats, format],
      };
    });
  };

  const handleCategoryToggle = (genreId) => {
    setNewMovie(prev => {
      const has = prev.categoryIds.includes(genreId);
      return {
        ...prev,
        categoryIds: has
          ? prev.categoryIds.filter(id => id !== genreId)
          : [...prev.categoryIds, genreId],
      };
    });
  };

  const addCastTag = () => {
    const name = castInput.trim();
    if (!name) {
      setCastError('Vui lòng nhập tên diễn viên');
      return;
    }
    if (newMovie.cast.some(c => c.toLowerCase() === name.toLowerCase())) {
      setCastError(`"${name}" đã có trong danh sách`);
      return;
    }
    setNewMovie(prev => ({ ...prev, cast: [...prev.cast, name] }));
    setCastInput('');
    setCastError('');
  };

  const removeCastTag = (name) => {
    setNewMovie(prev => ({ ...prev, cast: prev.cast.filter(c => c !== name) }));
  };

  const handleCastKeyDown = (e) => {
    if (e.key === 'Enter' || e.key === ',') {
      e.preventDefault();
      addCastTag();
    } else if (e.key === 'Backspace' && !castInput && newMovie.cast.length > 0) {
      removeCastTag(newMovie.cast[newMovie.cast.length - 1]);
    }
  };

  const handlePosterFile = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    setError('');
    try {
      const res = await uploadImage(file);
      if (res.success) {
        setNewMovie(prev => ({ ...prev, poster: res.url }));
        setPosterPreview(res.url);
      } else {
        setError(res.message || 'Upload ảnh thất bại');
      }
    } catch (error) {
      setError(error?.response?.data?.message || 'Upload ảnh thất bại. Kiểm tra cấu hình Cloudinary trong .env');
      console.error('Upload failed:', error);
    } finally {
      setUploading(false);
      e.target.value = '';
    }
  };

  const toDateInput = (date) => {
    if (!date) return '';
    const d = new Date(date);
    if (isNaN(d.getTime())) return '';
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${d.getFullYear()}-${month}-${day}`;
  };

  const formatDate = (date) => {
    if (!date) return '';
    const d = new Date(date);
    if (isNaN(d.getTime())) return '';
    return d.toLocaleDateString('vi-VN');
  };

  const emptyForm = () => ({
    title: '', original_title: '', poster: '', trailer_url: '', description: '',
    categoryIds: [], director: '', cast: [], duration: '', releaseDate: '',
    rated: 'P', status: 'now_playing', storyline: '',
    language: 'Phụ đề', country: '', formats: []
  });

  const openAddModal = () => {
    setEditingMovie(null);
    setNewMovie(emptyForm());
    setPosterPreview('');
    setShowModal(true);
  };

  const openEditModal = (movie) => {
    setEditingMovie(movie);
    setPosterPreview(movie.poster_url || movie.poster || '');
    setCastInput('');
    setCastError('');
    const movieGenreNames = Array.isArray(movie.genres) ? movie.genres : [];
    const nameToIds = genresList
      .filter(g => movieGenreNames.includes(g.name))
      .map(g => String(g._id));
    const existingIds = (movie.categoryIds || []).map(id => String(id));
    const mergedIds = Array.from(new Set([...existingIds, ...nameToIds]));
    setNewMovie({
      title: movie.title || '',
      original_title: movie.original_title || '',
      poster: movie.poster_url || movie.poster || '',
      trailer_url: movie.trailer_url || '',
      description: movie.description || '',
      categoryIds: mergedIds,
      director: movie.director || '',
      cast: Array.isArray(movie.cast) ? movie.cast : (movie.cast || '').split(',').map(c => c.trim()).filter(Boolean),
      duration: movie.duration || '',
      releaseDate: toDateInput(movie.release_date || movie.releaseDate),
      rated: movie.rated || 'P',
      status: movie.status || 'now_playing',
      storyline: movie.storyline || '',
      language: movie.language || 'Phụ đề',
      country: movie.country || '',
      formats: movie.formats || [],
    });
    setShowModal(true);
  };

  const buildMovieData = () => {
    const selectedGenres = genresList
      .filter(g => newMovie.categoryIds.includes(String(g._id)))
      .map(g => g.name);
    const fallbackGenres = editingMovie?.genres || [];
    return {
      title: newMovie.title,
      original_title: newMovie.original_title,
      poster_url: newMovie.poster || 'https://picsum.photos/seed/movie' + Date.now() + '/300/450',
      trailer_url: newMovie.trailer_url,
      description: newMovie.description,
      genres: selectedGenres.length > 0 ? selectedGenres : fallbackGenres,
      duration: parseInt(newMovie.duration) || 0,
      release_date: newMovie.releaseDate,
      status: newMovie.status,
      director: newMovie.director,
      cast: newMovie.cast,
      storyline: newMovie.storyline,
      language: newMovie.language,
      country: newMovie.country,
      formats: newMovie.formats,
      rated: newMovie.rated
    };
  };

  const handleSubmitMovie = async (e) => {
    e.preventDefault();
    if (newMovie.categoryIds.length === 0) {
      setError('Vui lòng chọn ít nhất 1 thể loại phim');
      return;
    }
    try {
      const movieData = buildMovieData();
      const res = editingMovie
        ? await movieAPI.update(editingMovie._id, movieData)
        : await movieAPI.create(movieData);
      if (res.success) {
        await fetchMovies();
        setShowModal(false);
        setEditingMovie(null);
        setNewMovie(emptyForm());
      }
    } catch (error) {
      setError(error?.response?.data?.message || 'Lưu phim thất bại');
      console.error('Failed to save movie:', error);
    }
  };

  const filteredMovies = movies.filter(movie => {
    const matchSearch = movie.title.toLowerCase().includes(searchTerm.toLowerCase());
    const matchStatus = filterStatus === 'all' || movie.status === filterStatus;
    return matchSearch && matchStatus;
  });

  const getStatusBadge = (status) => {
    switch (status) {
      case 'now_playing': return <span className="badge badge-success">Đang chiếu</span>;
      case 'coming_soon': return <span className="badge badge-info">Sắp chiếu</span>;
      default: return null;
    }
  };

  const getRatedBadgeColor = (rated) => {
    switch (rated) {
      case 'P': return '#22c55e';
      case 'C13': return '#f59e0b';
      case 'C16': return '#f97316';
      case 'C18': return '#ef4444';
      default: return '#64748b';
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Bạn có chắc chắn muốn xóa phim này?')) {
      try {
        const res = await movieAPI.delete(id);
        if (res.success) {
          await fetchMovies();
        }
      } catch (error) {
        setError(error?.response?.data?.message || 'Xóa phim thất bại');
        console.error('Failed to delete movie:', error);
      }
    }
  };

  return (
    <div className="movies-page animate-fade-in">
      <div className="page-header">
        <h1 className="page-title"><FiFilm /> Quản lý Phim</h1>
        <button className="btn btn-primary" onClick={openAddModal}><FiPlus /> Thêm phim mới</button>
      </div>

      <div className="filters-bar card glass mb-lg flex justify-between items-center flex-wrap gap-md">
        <div className="flex gap-md flex-1">
          <div className="search-box relative" style={{ width: '300px' }}>
            <FiSearch className="absolute left-3 top-3 text-muted" />
            <input 
              type="text" 
              className="form-input pl-10 w-full" 
              placeholder="Tìm kiếm phim..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <select 
            className="form-select" 
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
          >
            <option value="all">Tất cả trạng thái</option>
            <option value="now_playing">Đang chiếu</option>
            <option value="coming_soon">Sắp chiếu</option>
          </select>
        </div>

        <div className="view-toggle flex gap-sm">
          <button 
            className={`btn-icon ${viewMode === 'grid' ? 'active text-accent' : ''}`}
            onClick={() => setViewMode('grid')}
            title="Dạng thẻ"
          >
            <FiGrid size={20} />
          </button>
          <button 
            className={`btn-icon ${viewMode === 'list' ? 'active text-accent' : ''}`}
            onClick={() => setViewMode('list')}
            title="Dạng danh sách"
          >
            <FiList size={20} />
          </button>
        </div>
      </div>

      {error && (
        <div className="card glass text-center py-xl mb-lg card-error">
          <p className="text-danger text-lg">{error}</p>
          <button className="btn btn-primary mt-md" onClick={fetchMovies}>Thử lại</button>
        </div>
      )}

      {loading ? (
        <div className="card glass text-center py-2xl">
          <FiLoader className="animate-spin" size={32} />
          <p className="text-muted text-lg mt-md">Đang tải dữ liệu...</p>
        </div>
      ) : (
        <>
          {viewMode === 'grid' ? (
            <div className="movie-grid">
              {filteredMovies.map(movie => (
                <div key={movie._id} className="movie-card card glass">
                  <div className="movie-poster-wrap">
                    <img src={movie.poster_url || movie.poster} alt={movie.title} className="movie-poster" loading="lazy" />
                    <div className="movie-rating"><FiFilm style={{display:'inline', marginRight: 4}}/> {movie.rating}</div>
                    <div className="movie-overlay">
                      <button className="btn btn-warning btn-sm mx-1" style={{background: 'rgba(245, 158, 11, 0.8)'}} onClick={() => openEditModal(movie)}><FiEdit2 /> Sửa</button>
                      <button className="btn btn-danger btn-sm mx-1" style={{background: 'rgba(239, 68, 68, 0.8)'}} onClick={() => handleDelete(movie._id)}><FiTrash2 /></button>
                    </div>
                  </div>
                  <div className="movie-info mt-md">
                    <div className="flex justify-between items-start mb-sm">
                      <h3 className="movie-title font-bold text-lg truncate" title={movie.title}>{movie.title}</h3>
                    </div>
                    <div className="flex gap-xs flex-wrap mb-sm">
                      <span className="movie-rated" style={{ background: getRatedBadgeColor(movie.rated) }}>{movie.rated}</span>
                      {getStatusBadge(movie.status)}
                    </div>
                    <p className="text-muted text-sm mb-sm">{movie.genres.join(', ')}</p>
                    <div className="flex justify-between items-center text-sm text-secondary border-t pt-sm" style={{borderColor: 'var(--border)'}}>
                      <span>{movie.duration} phút</span>
                      <span>{formatDate(movie.release_date || movie.releaseDate)}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="card glass table-responsive">
              <table>
                <thead>
                  <tr>
                    <th>Poster</th>
                    <th>Tên phim</th>
                    <th>Thể loại</th>
                    <th>Thời lượng</th>
                    <th>Khởi chiếu</th>
                    <th>Rated</th>
                    <th>Trạng thái</th>
                    <th>Thao tác</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredMovies.map(movie => (
                    <tr key={movie._id}>
                      <td>
                        <img src={movie.poster_url || movie.poster} alt={movie.title} className="rounded" style={{width: '40px', height: '60px', objectFit: 'cover'}} />
                      </td>
                      <td className="font-semibold">{movie.title}</td>
                      <td className="text-muted">{movie.genres.join(', ')}</td>
                      <td>{movie.duration} phút</td>
                      <td>{formatDate(movie.release_date || movie.releaseDate)}</td>
                      <td><span className="movie-rated text-xs px-2 py-1 rounded" style={{ background: getRatedBadgeColor(movie.rated) }}>{movie.rated}</span></td>
                      <td>{getStatusBadge(movie.status)}</td>
                      <td>
                        <div className="flex gap-sm">
                          <button className="btn-icon" title="Sửa phim" onClick={() => openEditModal(movie)}><FiEdit2 /></button>
                          <button className="btn-icon text-danger" title="Xóa phim" onClick={() => handleDelete(movie._id)}><FiTrash2 /></button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {filteredMovies.length === 0 && (
            <div className="card glass text-center py-2xl">
              <p className="text-muted text-lg">Không tìm thấy phim nào phù hợp.</p>
            </div>
          )}
        </>
      )}

      {showModal && (
        <div className="modal-overlay" onClick={() => { setShowModal(false); setEditingMovie(null); }}>
          <div className="modal-content card glass" onClick={e => e.stopPropagation()} style={{maxWidth: 720, width: '92%', maxHeight: '90vh', overflowY: 'auto', padding: 'var(--space-xl)'}}>
            <div className="flex justify-between items-center mb-lg">
              <h2 className="text-xl font-bold"><FiFilm /> {editingMovie ? 'Sửa phim' : 'Thêm phim mới'}</h2>
              <button className="btn-icon text-muted" onClick={() => { setShowModal(false); setEditingMovie(null); }} style={{fontSize: 24}}>&times;</button>
            </div>
            <form onSubmit={handleSubmitMovie}>
              {/* Thông tin cơ bản */}
              <h3 className="font-bold text-secondary mb-md" style={{color: 'var(--accent)', borderBottom: '1px solid var(--border)', paddingBottom: 8}}>1. Thông tin cơ bản</h3>
              <div className="grid gap-md" style={{gridTemplateColumns: '1fr 1fr'}}>
                <div className="form-group" style={{gridColumn: '1 / -1'}}>
                  <label className="form-label">Tên phim <span className="text-danger">*</span></label>
                  <input className="form-input w-full" name="title" value={newMovie.title} onChange={handleInputChange} placeholder="VD: Lật Mặt 7: Một Điều Ước" required />
                </div>
                <div className="form-group" style={{gridColumn: '1 / -1'}}>
                  <label className="form-label">Tên gốc (Tiếng Anh / Tên quốc tế)</label>
                  <input className="form-input w-full" name="original_title" value={newMovie.original_title} onChange={handleInputChange} placeholder="VD: Face Off 7: One Wish" />
                </div>
                <div className="form-group" style={{gridColumn: '1 / -1'}}>
                  <label className="form-label">Ảnh poster</label>
                  <div className="flex gap-md items-start" style={{alignItems: 'flex-start'}}>
                    <div style={{width: 90, height: 130, borderRadius: 8, overflow: 'hidden', border: '1px solid var(--border)', background: 'rgba(255,255,255,0.05)', flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center'}}>
                      {posterPreview ? (
                        <img src={posterPreview} alt="Poster preview" style={{width: '100%', height: '100%', objectFit: 'cover'}} />
                      ) : (
                        <span className="text-muted text-sm"><FiFilm size={24} /></span>
                      )}
                    </div>
                    <div className="flex-1">
                      <label className="btn btn-outline w-full mb-sm" style={{cursor: 'pointer', justifyContent: 'center', display: 'flex', alignItems: 'center', gap: 8}}>
                        {uploading ? <FiLoader className="animate-spin" /> : <FiUpload />}
                        {uploading ? 'Đang tải lên...' : 'Tải ảnh lên Cloudinary'}
                        <input type="file" accept="image/*" style={{display: 'none'}} onChange={handlePosterFile} disabled={uploading} />
                      </label>
                      <input
                        className="form-input w-full text-sm"
                        name="poster"
                        value={newMovie.poster}
                        onChange={handleInputChange}
                        placeholder="Hoặc dán URL ảnh trực tiếp tại đây"
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* Thông tin chiếu */}
              <h3 className="font-bold text-secondary mt-lg mb-md" style={{color: 'var(--accent)', borderBottom: '1px solid var(--border)', paddingBottom: 8}}>2. Thông tin chiếu</h3>
              <div className="grid gap-md" style={{gridTemplateColumns: '1fr 1fr'}}>
                <div className="form-group" style={{gridColumn: '1 / -1'}}>
                  <label className="form-label">Thể loại phim <span className="text-muted text-sm">(chọn từ danh sách)</span></label>
                  {genresList.length === 0 ? (
                    <p className="text-muted text-sm">Đang tải danh sách thể loại...</p>
                  ) : (
                    <div className="flex gap-xs flex-wrap">
                      {genresList.map(g => {
                        const selected = newMovie.categoryIds.includes(String(g._id));
                        return (
                          <button
                            key={g._id}
                            type="button"
                            onClick={() => handleCategoryToggle(String(g._id))}
                            style={{
                              cursor: 'pointer',
                              border: `1px solid ${selected ? '#eab308' : 'var(--border)'}`,
                              borderRadius: 999,
                              padding: '6px 14px',
                              fontSize: 13,
                              background: selected ? 'rgba(234,179,8,0.15)' : 'rgba(255,255,255,0.03)',
                              color: selected ? '#eab308' : 'var(--text-secondary)',
                              fontWeight: selected ? 600 : 400,
                              transition: 'all 0.15s ease',
                            }}
                          >
                            {g.name}
                          </button>
                        );
                      })}
                    </div>
                  )}
                  {newMovie.categoryIds.length > 0 && (
                    <p className="text-muted text-xs mt-sm">Đã chọn: {newMovie.categoryIds.length} thể loại</p>
                  )}
                </div>
                <div className="form-group">
                  <label className="form-label">Quốc gia</label>
                  <select className="form-select w-full" name="country" value={newMovie.country} onChange={handleInputChange}>
                    <option value="">Chọn quốc gia</option>
                    {newMovie.country && !COUNTRY_LIST.includes(newMovie.country) && (
                      <option value={newMovie.country}>{newMovie.country}</option>
                    )}
                    {COUNTRY_LIST.map(c => (
                      <option key={c} value={c}>{c}</option>
                    ))}
                  </select>
                </div>
                <div className="form-group">
                  <label className="form-label">Ngôn ngữ</label>
                  <select className="form-select w-full" name="language" value={newMovie.language} onChange={handleInputChange}>
                    <option value="Phụ đề">Phụ đề</option>
                    <option value="Lồng tiếng">Lồng tiếng</option>
                    <option value="Thuyết minh">Thuyết minh</option>
                    <option value="Song ngữ">Song ngữ</option>
                  </select>
                </div>
                <div className="form-group">
                  <label className="form-label">Định dạng chiếu</label>
                  <div className="flex gap-xs flex-wrap">
                    {['2D', '3D', 'IMAX', '4DX', 'ScreenX'].map(f => (
                      <label key={f} className="flex items-center gap-xs" style={{cursor: 'pointer', border: '1px solid var(--border)', borderRadius: 6, padding: '4px 10px', background: newMovie.formats.includes(f) ? 'rgba(124,58,237,0.15)' : 'transparent'}}>
                        <input type="checkbox" checked={newMovie.formats.includes(f)} onChange={() => handleFormatToggle(f)} style={{accentColor: 'var(--accent)'}} />
                        <span className="text-sm">{f}</span>
                      </label>
                    ))}
                  </div>
                </div>
                <div className="form-group">
                  <label className="form-label">Thời lượng (phút) <span className="text-danger">*</span></label>
                  <input className="form-input w-full" name="duration" type="number" min="1" value={newMovie.duration} onChange={handleInputChange} placeholder="VD: 120" required />
                </div>
                <div className="form-group">
                  <label className="form-label">Ngày khởi chiếu <span className="text-danger">*</span></label>
                  <input className="form-input w-full" name="releaseDate" type="date" value={newMovie.releaseDate} onChange={handleInputChange} required />
                </div>
                <div className="form-group">
                  <label className="form-label">Rated</label>
                  <select className="form-select w-full" name="rated" value={newMovie.rated} onChange={handleInputChange}>
                    <option value="P">P - Mọi lứa tuổi</option>
                    <option value="C13">C13 - Trên 13 tuổi</option>
                    <option value="C16">C16 - Trên 16 tuổi</option>
                    <option value="C18">C18 - Trên 18 tuổi</option>
                  </select>
                </div>
                <div className="form-group">
                  <label className="form-label">Trạng thái</label>
                  <select className="form-select w-full" name="status" value={newMovie.status} onChange={handleInputChange}>
                    <option value="now_playing">Đang chiếu</option>
                    <option value="coming_soon">Sắp chiếu</option>
                  </select>
                </div>
              </div>

              {/* Nội dung phim */}
              <h3 className="font-bold text-secondary mt-lg mb-md" style={{color: 'var(--accent)', borderBottom: '1px solid var(--border)', paddingBottom: 8}}>3. Nội dung phim</h3>
              <div className="grid gap-md" style={{gridTemplateColumns: '1fr 1fr'}}>
                <div className="form-group">
                  <label className="form-label">Đạo diễn</label>
                  <input className="form-input w-full" name="director" value={newMovie.director} onChange={handleInputChange} placeholder="VD: Lý Hải" />
                </div>
                <div className="form-group" style={{gridColumn: '1 / -1'}}>
                  <label className="form-label">Diễn viên <span className="text-muted text-sm">(gõ tên rồi nhấn Enter hoặc dấu phẩy)</span></label>
                  <div
                    className="form-input w-full"
                    style={{
                      display: 'flex',
                      flexWrap: 'wrap',
                      gap: 6,
                      alignItems: 'center',
                      minHeight: 44,
                      padding: '6px 8px',
                    }}
                  >
                    {newMovie.cast.map(name => (
                      <span
                        key={name}
                        className="flex items-center gap-xs"
                        style={{
                          background: 'rgba(234,179,8,0.12)',
                          color: '#eab308',
                          border: '1px solid rgba(234,179,8,0.35)',
                          borderRadius: 999,
                          padding: '3px 10px',
                          fontSize: 13,
                        }}
                      >
                        {name}
                        <button
                          type="button"
                          onClick={() => removeCastTag(name)}
                          style={{background: 'transparent', border: 'none', cursor: 'pointer', color: '#eab308', display: 'flex', padding: 0, opacity: 0.75}}
                          title={`Xóa ${name}`}
                        >
                          <FiX size={13} />
                        </button>
                      </span>
                    ))}
                    <input
                      className="w-full"
                      style={{
                        flex: '1 1 120px',
                        border: 'none',
                        outline: 'none',
                        background: 'transparent',
                        padding: '4px 2px',
                        color: 'inherit',
                        fontSize: 14,
                        minWidth: 120,
                      }}
                      value={castInput}
                      onChange={e => setCastInput(e.target.value)}
                      onKeyDown={handleCastKeyDown}
                      onBlur={() => { if (castInput.trim()) addCastTag(); }}
                      placeholder={newMovie.cast.length === 0 ? 'Nhập tên diễn viên...' : ''}
                    />
                  </div>
                  {castError && <p className="text-danger text-xs mt-sm">{castError}</p>}
                </div>
                <div className="form-group" style={{gridColumn: '1 / -1'}}>
                  <label className="form-label">Mô tả ngắn</label>
                  <textarea className="form-input w-full" name="description" value={newMovie.description} onChange={handleInputChange} rows={2} placeholder="Mô tả ngắn gọn về phim" />
                </div>
                <div className="form-group" style={{gridColumn: '1 / -1'}}>
                  <label className="form-label">Nội dung phim (Storyline)</label>
                  <textarea className="form-input w-full" name="storyline" value={newMovie.storyline} onChange={handleInputChange} rows={3} placeholder="Tóm tắt nội dung phim" />
                </div>
              </div>
              <div className="flex justify-end gap-md mt-lg">
                <button type="button" className="btn btn-secondary" onClick={() => { setShowModal(false); setEditingMovie(null); }}>Hủy</button>
                <button type="submit" className="btn btn-primary">{editingMovie ? <><FiEdit2 /> Lưu thay đổi</> : <><FiPlus /> Thêm phim</>}</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Movies;
