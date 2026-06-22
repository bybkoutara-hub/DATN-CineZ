import React, { useState, useEffect } from 'react';
import { FiPlus, FiEdit2, FiTrash2, FiSearch, FiTag, FiAlertCircle, FiCheckCircle, FiLoader } from 'react-icons/fi';
import { genreAPI } from '../api/apiService';
import './Genres.css';

const Genres = () => {
  const [genres, setGenres] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingGenre, setEditingGenre] = useState(null);
  const [formData, setFormData] = useState({ name: '', description: '' });
  
  // API States
  const [loading, setLoading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  
  // Load genres from API on component mount
  useEffect(() => {
    fetchGenres();
  }, []);
  
  // Auto-hide messages
  useEffect(() => {
    if (successMessage) {
      const timer = setTimeout(() => setSuccessMessage(''), 3000);
      return () => clearTimeout(timer);
    }
  }, [successMessage]);
  
  useEffect(() => {
    if (error) {
      const timer = setTimeout(() => setError(''), 3000);
      return () => clearTimeout(timer);
    }
  }, [error]);
  
  const fetchGenres = async () => {
    setLoading(true);
    setError('');
    try {
      const result = await genreAPI.getAll();
      if (result.success && Array.isArray(result.data)) {
        setGenres(result.data);
      } else {
        setGenres(result.data || []);
      }
    } catch (err) {
      const errorMsg = err?.response?.data?.message || err?.message || 'Không thể tải danh sách thể loại';
      setError(errorMsg);
      console.error('Error fetching genres:', err);
    } finally {
      setLoading(false);
    }
  };

  const filteredGenres = genres.filter(g => 
    g.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const openModal = (genre = null) => {
    setError('');
    if (genre) {
      setEditingGenre(genre);
      setFormData({ name: genre.name, description: genre.description });
    } else {
      setEditingGenre(null);
      setFormData({ name: '', description: '' });
    }
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setEditingGenre(null);
    setFormData({ name: '', description: '' });
    setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    
    // Validate form
    if (!formData.name.trim()) {
      setError('Tên thể loại không được để trống');
      return;
    }
    
    setIsSubmitting(true);
    try {
      if (editingGenre) {
        // Update existing genre
        const result = await genreAPI.update(editingGenre._id || editingGenre.id, formData);
        setGenres(genres.map(g => (g._id || g.id) === (editingGenre._id || editingGenre.id) ? { ...g, ...formData } : g));
        setSuccessMessage(result.message || 'Cập nhật thể loại thành công');
      } else {
        // Create new genre
        const result = await genreAPI.create(formData);
        const newGenre = { 
          _id: result.data._id || result.data.id || Date.now(), 
          ...formData,
          movieCount: result.data.movieCount || 0
        };
        setGenres([...genres, newGenre]);
        setSuccessMessage(result.message || 'Thêm thể loại thành công');
      }
      closeModal();
    } catch (err) {
      const errorMsg = err?.response?.data?.message || err?.message || 'Lỗi khi lưu thể loại';
      setError(errorMsg);
      console.error('Error submitting form:', err);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Bạn có chắc chắn muốn xóa thể loại này?')) {
      setError('');
      try {
        await genreAPI.delete(id);
        setGenres(genres.filter(g => (g._id || g.id) !== id));
        setSuccessMessage('Xóa thể loại thành công');
      } catch (err) {
        const errorMsg = err?.response?.data?.message || err?.message || 'Lỗi khi xóa thể loại';
        setError(errorMsg);
        console.error('Error deleting genre:', err);
      }
    }
  };

  return (
    <div className="genres-page animate-fade-in">
      <div className="page-header">
        <h1 className="page-title"><FiTag /> Quản lý Thể loại Phim</h1>
        <button className="btn btn-primary" onClick={() => openModal()} disabled={loading}><FiPlus /> Thêm thể loại</button>
      </div>

      {/* Error Message */}
      {error && (
        <div style={{
          background: '#fee2e2',
          border: '1px solid #fecaca',
          color: '#dc2626',
          padding: '12px 16px',
          borderRadius: '8px',
          marginBottom: '16px',
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
          animation: 'slideDown 0.3s ease-out'
        }}>
          <FiAlertCircle size={20} />
          <span>{error}</span>
        </div>
      )}

      {/* Success Message */}
      {successMessage && (
        <div style={{
          background: '#dcfce7',
          border: '1px solid #bbf7d0',
          color: '#16a34a',
          padding: '12px 16px',
          borderRadius: '8px',
          marginBottom: '16px',
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
          animation: 'slideDown 0.3s ease-out'
        }}>
          <FiCheckCircle size={20} />
          <span>{successMessage}</span>
        </div>
      )}

      <div className="card glass">
        <div className="flex justify-between items-center mb-md">
          <div className="search-box relative" style={{ width: '300px' }}>
            <FiSearch className="absolute left-3 top-3 text-muted" />
            <input 
              type="text" 
              className="form-input pl-10" 
              placeholder="Tìm kiếm thể loại..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>

        {loading ? (
          <div style={{
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            minHeight: '200px',
            color: '#64748b'
          }}>
            <FiLoader size={32} style={{ animation: 'spin 1s linear infinite' }} />
            <span style={{ marginLeft: '12px' }}>Đang tải dữ liệu...</span>
          </div>
        ) : (
          <div className="table-responsive">
            <table>
              <thead>
                <tr>
                  <th style={{ width: '80px' }}>STT</th>
                  <th style={{ width: '200px' }}>Tên thể loại</th>
                  <th>Mô tả</th>
                  <th style={{ width: '120px' }}>Số phim</th>
                  <th style={{ width: '100px' }}>Thao tác</th>
                </tr>
              </thead>
              <tbody>
                {filteredGenres.map((genre, index) => (
                  <tr key={genre._id || genre.id}>
                    <td>{index + 1}</td>
                    <td className="font-semibold text-accent">{genre.name}</td>
                    <td className="text-muted">{genre.description || '-'}</td>
                    <td>
                      <span className="badge badge-info">{genre.movieCount || 0} phim</span>
                    </td>
                    <td>
                      <div className="flex gap-sm">
                        <button className="btn-icon" onClick={() => openModal(genre)} title="Sửa"><FiEdit2 /></button>
                        <button className="btn-icon text-danger" onClick={() => handleDelete(genre._id || genre.id)} title="Xóa"><FiTrash2 /></button>
                      </div>
                    </td>
                  </tr>
                ))}
                {!loading && filteredGenres.length === 0 && (
                  <tr>
                    <td colSpan="5" className="text-center text-muted py-lg">
                      {genres.length === 0 ? 'Chưa có thể loại nào. Hãy thêm thể loại mới!' : 'Không tìm thấy thể loại nào phù hợp.'}
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {isModalOpen && (
        <div className="modal-backdrop">
          <div className="modal-content card glass animate-scale-in" style={{ maxWidth: '500px' }}>
            <div className="modal-header flex justify-between items-center mb-lg">
              <h2 className="text-xl font-semibold">{editingGenre ? 'Sửa thể loại' : 'Thêm thể loại mới'}</h2>
              <button className="btn-icon" onClick={closeModal}>✕</button>
            </div>
            <form onSubmit={handleSubmit}>
              <div className="form-group mb-md">
                <label className="form-label">Tên thể loại <span className="required">*</span></label>
                <input 
                  type="text" 
                  className="form-input" 
                  required 
                  value={formData.name} 
                  onChange={e => setFormData({...formData, name: e.target.value})} 
                />
              </div>
              <div className="form-group mb-md">
                <label className="form-label">Mô tả</label>
                <textarea 
                  className="form-textarea" 
                  rows="4"
                  value={formData.description} 
                  onChange={e => setFormData({...formData, description: e.target.value})} 
                />
              </div>
              <div className="flex justify-end gap-md mt-lg">
                <button type="button" className="btn btn-ghost" onClick={closeModal}>Hủy</button>
                <button type="submit" className="btn btn-primary">Lưu lại</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Genres;
