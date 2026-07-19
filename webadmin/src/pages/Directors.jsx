import React, { useState, useEffect } from 'react';
import { FiPlus, FiEdit2, FiTrash2, FiSearch, FiUser, FiAlertCircle, FiCheckCircle, FiLoader } from 'react-icons/fi';
import { directorAPI } from '../api/apiService';
import './Directors.css';

const Directors = () => {
  const [directors, setDirectors] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingDirector, setEditingDirector] = useState(null);
  const [formData, setFormData] = useState({ name: '', bio: '', birthYear: '', nationality: '', image: '' });

  const [loading, setLoading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  useEffect(() => {
    fetchDirectors();
  }, []);

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

  const fetchDirectors = async () => {
    setLoading(true);
    setError('');
    try {
      const result = await directorAPI.getAll();
      if (result.success && Array.isArray(result.data)) {
        setDirectors(result.data);
      } else {
        setDirectors(result.data || []);
      }
    } catch (err) {
      const errorMsg = err?.response?.data?.message || err?.message || 'Không thể tải danh sách đạo diễn';
      setError(errorMsg);
    } finally {
      setLoading(false);
    }
  };

  const filteredDirectors = directors.filter(d =>
    d.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const openModal = (director = null) => {
    setError('');
    if (director) {
      setEditingDirector(director);
      setFormData({
        name: director.name,
        bio: director.bio || '',
        birthYear: director.birthYear || '',
        nationality: director.nationality || '',
        image: director.image || '',
      });
    } else {
      setEditingDirector(null);
      setFormData({ name: '', bio: '', birthYear: '', nationality: '', image: '' });
    }
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setEditingDirector(null);
    setFormData({ name: '', bio: '', birthYear: '', nationality: '', image: '' });
    setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!formData.name.trim()) {
      setError('Tên đạo diễn không được để trống');
      return;
    }

    setIsSubmitting(true);
    try {
      const payload = {
        ...formData,
        birthYear: formData.birthYear ? Number(formData.birthYear) : undefined,
      };

      if (editingDirector) {
        const result = await directorAPI.update(editingDirector._id || editingDirector.id, payload);
        setDirectors(directors.map(d => (d._id || d.id) === (editingDirector._id || editingDirector.id) ? { ...d, ...formData, birthYear: payload.birthYear } : d));
        setSuccessMessage(result.message || 'Cập nhật đạo diễn thành công');
      } else {
        const result = await directorAPI.create(payload);
        const newDirector = { _id: result.data._id || result.data.id || Date.now(), ...formData, birthYear: payload.birthYear };
        setDirectors([...directors, newDirector]);
        setSuccessMessage(result.message || 'Thêm đạo diễn thành công');
      }
      closeModal();
    } catch (err) {
      const errorMsg = err?.response?.data?.message || err?.message || 'Lỗi khi lưu đạo diễn';
      setError(errorMsg);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Bạn có chắc chắn muốn xóa đạo diễn này?')) {
      setError('');
      try {
        await directorAPI.delete(id);
        setDirectors(directors.filter(d => (d._id || d.id) !== id));
        setSuccessMessage('Xóa đạo diễn thành công');
      } catch (err) {
        const errorMsg = err?.response?.data?.message || err?.message || 'Lỗi khi xóa đạo diễn';
        setError(errorMsg);
      }
    }
  };

  return (
    <div className="directors-page animate-fade-in">
      <div className="page-header">
        <h1 className="page-title"><FiUser /> Quản lý Đạo diễn</h1>
        <button className="btn btn-primary" onClick={() => openModal()} disabled={loading}><FiPlus /> Thêm đạo diễn</button>
      </div>

      {error && (
        <div className="msg msg-error">
          <FiAlertCircle size={20} />
          <span>{error}</span>
        </div>
      )}

      {successMessage && (
        <div className="msg msg-success">
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
              placeholder="Tìm kiếm đạo diễn..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>

        {loading ? (
          <div className="loading-state">
            <FiLoader size={32} className="spinner-icon" />
            <span>Đang tải dữ liệu...</span>
          </div>
        ) : (
          <div className="table-responsive">
            <table>
              <thead>
                <tr>
                  <th style={{ width: '60px' }}>STT</th>
                  <th style={{ width: '80px' }}>Ảnh</th>
                  <th>Tên đạo diễn</th>
                  <th>Năm sinh</th>
                  <th>Quốc tịch</th>
                  <th style={{ width: '80px' }}>Thao tác</th>
                </tr>
              </thead>
              <tbody>
                {filteredDirectors.map((director, index) => (
                  <tr key={director._id || director.id}>
                    <td>{index + 1}</td>
                    <td>
                      {director.image ? (
                        <img src={director.image} alt={director.name} className="avatar-thumb" />
                      ) : (
                        <div className="avatar-placeholder"><FiUser size={20} /></div>
                      )}
                    </td>
                    <td className="font-semibold text-accent">{director.name}</td>
                    <td className="text-muted">{director.birthYear || '-'}</td>
                    <td className="text-muted">{director.nationality || '-'}</td>
                    <td>
                      <div className="flex gap-sm">
                        <button className="btn-icon" onClick={() => openModal(director)} title="Sửa"><FiEdit2 /></button>
                        <button className="btn-icon text-danger" onClick={() => handleDelete(director._id || director.id)} title="Xóa"><FiTrash2 /></button>
                      </div>
                    </td>
                  </tr>
                ))}
                {!loading && filteredDirectors.length === 0 && (
                  <tr>
                    <td colSpan="6" className="text-center text-muted py-lg">
                      {directors.length === 0 ? 'Chưa có đạo diễn nào. Hãy thêm đạo diễn mới!' : 'Không tìm thấy đạo diễn nào phù hợp.'}
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
          <div className="modal-content card glass animate-scale-in" style={{ maxWidth: '550px' }}>
            <div className="modal-header flex justify-between items-center mb-lg">
              <h2 className="text-xl font-semibold">{editingDirector ? 'Sửa đạo diễn' : 'Thêm đạo diễn mới'}</h2>
              <button className="btn-icon" onClick={closeModal}>✕</button>
            </div>
            <form onSubmit={handleSubmit}>
              <div className="form-group mb-md">
                <label className="form-label">Tên đạo diễn <span className="required">*</span></label>
                <input type="text" className="form-input" required value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} />
              </div>
              <div className="form-group mb-md">
                <label className="form-label">Năm sinh</label>
                <input type="number" className="form-input" value={formData.birthYear} onChange={e => setFormData({...formData, birthYear: e.target.value})} />
              </div>
              <div className="form-group mb-md">
                <label className="form-label">Quốc tịch</label>
                <input type="text" className="form-input" value={formData.nationality} onChange={e => setFormData({...formData, nationality: e.target.value})} />
              </div>
              <div className="form-group mb-md">
                <label className="form-label">Ảnh (URL)</label>
                <input type="text" className="form-input" value={formData.image} onChange={e => setFormData({...formData, image: e.target.value})} />
              </div>
              <div className="form-group mb-md">
                <label className="form-label">Tiểu sử</label>
                <textarea className="form-textarea" rows="4" value={formData.bio} onChange={e => setFormData({...formData, bio: e.target.value})} />
              </div>
              <div className="flex justify-end gap-md mt-lg">
                <button type="button" className="btn btn-ghost" onClick={closeModal}>Hủy</button>
                <button type="submit" className="btn btn-primary" disabled={isSubmitting}>
                  {isSubmitting ? 'Đang lưu...' : 'Lưu lại'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Directors;
