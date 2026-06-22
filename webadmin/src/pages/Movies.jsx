import React, { useState } from 'react';
import { FiPlus, FiEdit2, FiTrash2, FiSearch, FiFilm, FiFilter, FiList, FiGrid } from 'react-icons/fi';
import './Movies.css';

const Movies = () => {
  const [movies, setMovies] = useState([
    { id: 1, title: 'Lật Mặt 8: Vòng Tay Nắng', originalTitle: 'Lat Mat 8', poster: 'https://picsum.photos/seed/movie1/300/450', description: 'Phim hành động Việt Nam gây sốt phòng vé...', genres: ['Hành Động', 'Tâm Lý'], director: 'Lý Hải', duration: 132, releaseDate: '2025-04-25', rated: 'C13', status: 'showing', rating: 8.5 },
    { id: 2, title: 'Mai', originalTitle: 'Mai', poster: 'https://picsum.photos/seed/movie2/300/450', description: 'Phim tình cảm tâm lý xã hội', genres: ['Tình Cảm', 'Tâm Lý'], director: 'Trấn Thành', duration: 120, releaseDate: '2024-02-10', rated: 'C18', status: 'ended', rating: 8.0 },
    { id: 3, title: 'Inside Out 2', originalTitle: 'Inside Out 2', poster: 'https://picsum.photos/seed/movie3/300/450', description: 'Phần 2 của bộ phim hoạt hình đình đám', genres: ['Hoạt Hình', 'Hài'], director: 'Kelsey Mann', duration: 96, releaseDate: '2024-06-14', rated: 'P', status: 'showing', rating: 9.2 },
    { id: 4, title: 'Godzilla x Kong', originalTitle: 'Godzilla x Kong: The New Empire', poster: 'https://picsum.photos/seed/movie4/300/450', description: 'Cuộc chiến siêu quái vật', genres: ['Hành Động', 'Viễn Tưởng'], director: 'Adam Wingard', duration: 115, releaseDate: '2024-03-29', rated: 'C13', status: 'showing', rating: 7.8 },
    { id: 5, title: 'Đào, Phở và Piano', originalTitle: 'Dao Pho Piano', poster: 'https://picsum.photos/seed/movie5/300/450', description: 'Phim chiến tranh Việt Nam', genres: ['Tâm Lý', 'Lịch Sử'], director: 'Phi Tiến Sơn', duration: 100, releaseDate: '2024-02-10', rated: 'C13', status: 'coming', rating: 8.8 },
  ]);

  const [viewMode, setViewMode] = useState('grid');
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [showModal, setShowModal] = useState(false);
  const [newMovie, setNewMovie] = useState({
    title: '', originalTitle: '', poster: '', description: '',
    genres: '', director: '', duration: '', releaseDate: '', rated: 'P', status: 'showing', rating: ''
  });

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setNewMovie(prev => ({ ...prev, [name]: value }));
  };

  const handleAddMovie = (e) => {
    e.preventDefault();
    const movie = {
      id: Date.now(),
      title: newMovie.title,
      originalTitle: newMovie.originalTitle || newMovie.title,
      poster: newMovie.poster || 'https://picsum.photos/seed/movie' + Date.now() + '/300/450',
      description: newMovie.description,
      genres: newMovie.genres.split(',').map(g => g.trim()).filter(Boolean),
      director: newMovie.director,
      duration: parseInt(newMovie.duration) || 0,
      releaseDate: newMovie.releaseDate,
      rated: newMovie.rated,
      status: newMovie.status,
      rating: parseFloat(newMovie.rating) || 0
    };
    setMovies([movie, ...movies]);
    setShowModal(false);
    setNewMovie({ title: '', originalTitle: '', poster: '', description: '', genres: '', director: '', duration: '', releaseDate: '', rated: 'P', status: 'showing', rating: '' });
  };

  const openModal = () => setShowModal(true);
  const closeModal = () => {
    setShowModal(false);
    setNewMovie({ title: '', originalTitle: '', poster: '', description: '', genres: '', director: '', duration: '', releaseDate: '', rated: 'P', status: 'showing', rating: '' });
  };

  const filteredMovies = movies.filter(movie => {
    const matchSearch = movie.title.toLowerCase().includes(searchTerm.toLowerCase());
    const matchStatus = filterStatus === 'all' || movie.status === filterStatus;
    return matchSearch && matchStatus;
  });

  const getStatusBadge = (status) => {
    switch (status) {
      case 'showing': return <span className="badge badge-success">Đang chiếu</span>;
      case 'coming': return <span className="badge badge-info">Sắp chiếu</span>;
      case 'ended': return <span className="badge badge-secondary" style={{ background: '#475569', color: '#e2e8f0' }}>Ngừng chiếu</span>;
      default: return null;
    }
  };

  const getRatedBadgeColor = (rated) => {
    switch (rated) {
      case 'P': return '#22c55e'; // green
      case 'C13': return '#f59e0b'; // yellow
      case 'C16': return '#f97316'; // orange
      case 'C18': return '#ef4444'; // red
      default: return '#64748b';
    }
  };

  const handleDelete = (id) => {
    if (window.confirm('Bạn có chắc chắn muốn xóa phim này?')) {
      setMovies(movies.filter(m => m.id !== id));
    }
  };

  return (
    <div className="movies-page animate-fade-in">
      <div className="page-header">
        <h1 className="page-title"><FiFilm /> Quản lý Phim</h1>
        <button className="btn btn-primary" onClick={openModal}><FiPlus /> Thêm phim mới</button>
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
            <option value="showing">Đang chiếu</option>
            <option value="coming">Sắp chiếu</option>
            <option value="ended">Ngừng chiếu</option>
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

      {viewMode === 'grid' ? (
        <div className="movie-grid">
          {filteredMovies.map(movie => (
            <div key={movie.id} className="movie-card card glass">
              <div className="movie-poster-wrap">
                <img src={movie.poster} alt={movie.title} className="movie-poster" loading="lazy" />
                <div className="movie-rating"><FiFilm style={{display:'inline', marginRight: 4}}/> {movie.rating}</div>
                <div className="movie-overlay">
                  <button className="btn btn-primary btn-sm mx-1">Chi tiết</button>
                  <button className="btn btn-warning btn-sm mx-1" style={{background: 'rgba(245, 158, 11, 0.8)'}}><FiEdit2 /></button>
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
                  <span>{movie.releaseDate}</span>
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
                <tr key={movie.id}>
                  <td>
                    <img src={movie.poster} alt={movie.title} className="rounded" style={{width: '40px', height: '60px', objectFit: 'cover'}} />
                  </td>
                  <td className="font-semibold">{movie.title}</td>
                  <td className="text-muted">{movie.genres.join(', ')}</td>
                  <td>{movie.duration} phút</td>
                  <td>{movie.releaseDate}</td>
                  <td><span className="movie-rated text-xs px-2 py-1 rounded" style={{ background: getRatedBadgeColor(movie.rated) }}>{movie.rated}</span></td>
                  <td>{getStatusBadge(movie.status)}</td>
                  <td>
                    <div className="flex gap-sm">
                      <button className="btn-icon"><FiEdit2 /></button>
                      <button className="btn-icon text-danger" onClick={() => handleDelete(movie.id)}><FiTrash2 /></button>
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

      {showModal && (
        <div className="modal-overlay" onClick={closeModal}>
          <div className="modal-content card glass" onClick={e => e.stopPropagation()} style={{maxWidth: 600, width: '90%', maxHeight: '90vh', overflowY: 'auto', padding: 'var(--space-xl)'}}>
            <div className="flex justify-between items-center mb-lg">
              <h2 className="text-xl font-bold"><FiFilm /> Thêm phim mới</h2>
              <button className="btn-icon text-muted" onClick={closeModal} style={{fontSize: 24}}>&times;</button>
            </div>
            <form onSubmit={handleAddMovie}>
              <div className="grid gap-md" style={{gridTemplateColumns: '1fr 1fr'}}>
                <div className="form-group" style={{gridColumn: '1 / -1'}}>
                  <label className="form-label">Tên phim <span className="text-danger">*</span></label>
                  <input className="form-input w-full" name="title" value={newMovie.title} onChange={handleInputChange} required />
                </div>
                <div className="form-group">
                  <label className="form-label">Tên gốc</label>
                  <input className="form-input w-full" name="originalTitle" value={newMovie.originalTitle} onChange={handleInputChange} />
                </div>
                <div className="form-group">
                  <label className="form-label">Poster URL</label>
                  <input className="form-input w-full" name="poster" value={newMovie.poster} onChange={handleInputChange} placeholder="https://..." />
                </div>
                <div className="form-group" style={{gridColumn: '1 / -1'}}>
                  <label className="form-label">Mô tả</label>
                  <textarea className="form-input w-full" name="description" value={newMovie.description} onChange={handleInputChange} rows={3} />
                </div>
                <div className="form-group">
                  <label className="form-label">Thể loại (phân cách bằng dấu phẩy)</label>
                  <input className="form-input w-full" name="genres" value={newMovie.genres} onChange={handleInputChange} placeholder="Hành Động, Tâm Lý" />
                </div>
                <div className="form-group">
                  <label className="form-label">Đạo diễn</label>
                  <input className="form-input w-full" name="director" value={newMovie.director} onChange={handleInputChange} />
                </div>
                <div className="form-group">
                  <label className="form-label">Thời lượng (phút) <span className="text-danger">*</span></label>
                  <input className="form-input w-full" name="duration" type="number" value={newMovie.duration} onChange={handleInputChange} required />
                </div>
                <div className="form-group">
                  <label className="form-label">Ngày khởi chiếu <span className="text-danger">*</span></label>
                  <input className="form-input w-full" name="releaseDate" type="date" value={newMovie.releaseDate} onChange={handleInputChange} required />
                </div>
                <div className="form-group">
                  <label className="form-label">Rated</label>
                  <select className="form-select w-full" name="rated" value={newMovie.rated} onChange={handleInputChange}>
                    <option value="P">P</option>
                    <option value="C13">C13</option>
                    <option value="C16">C16</option>
                    <option value="C18">C18</option>
                  </select>
                </div>
                <div className="form-group">
                  <label className="form-label">Trạng thái</label>
                  <select className="form-select w-full" name="status" value={newMovie.status} onChange={handleInputChange}>
                    <option value="showing">Đang chiếu</option>
                    <option value="coming">Sắp chiếu</option>
                    <option value="ended">Ngừng chiếu</option>
                  </select>
                </div>
                <div className="form-group">
                  <label className="form-label">Đánh giá</label>
                  <input className="form-input w-full" name="rating" type="number" step="0.1" min="0" max="10" value={newMovie.rating} onChange={handleInputChange} />
                </div>
              </div>
              <div className="flex justify-end gap-md mt-lg">
                <button type="button" className="btn btn-secondary" onClick={closeModal}>Hủy</button>
                <button type="submit" className="btn btn-primary"><FiPlus /> Thêm phim</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Movies;
