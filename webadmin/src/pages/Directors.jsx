import React, { useState, useEffect } from 'react';
import { FiPlus, FiEdit2, FiTrash2, FiSearch, FiCamera, FiAlertCircle, FiCheckCircle, FiLoader } from 'react-icons/fi';
import { directorAPI } from '../api/apiService';
import './Directors.css';

const Directors = () => {
  const [directors, setDirectors] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingDirector, setEditingDirector] = useState(null);
  const [formData, setFormData] = useState({ name: '', bio: '', avatar: '', birthDate: '', nationality: '' });

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
      console.error('Error fetching directors:', err);
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
        avatar: director.avatar || '',
        birthDate: director.birthDate ? director.birthDate.slice(0, 10) : '',
        nationality: director.nationality || '',
      });
    } else {
      setEditingDirector(null);
      setFormData({ name: '', bio: '', avatar: '', birthDate: '', nationality: '' });
    }
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setEditingDirector(null);
    setFormData({ name: '', bio: '', avatar: '', birthDate: '', nationality: '' });
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
      if (editingDirector) {
        const result = await directorAPI.update(editingDirector._id || editingDirector.id, formData);
        setDirectors(directors.map(d => (d._id || d.id) === (editingDirector._id || editingDirector.id) ? { ...d, ...formData } : d));
        setSuccessMessage(result.message || 'Cập nhật đạo diễn thành công');
      } else {
        const result = await directorAPI.create(formData);
        const newDirector = { _id: result.data._id || result.data.id || Date.now(), ...formData };
        setDirectors([...directors, newDirector]);
        setSuccessMessage(result.message || 'Thêm đạo diễn thành công');
      }
      closeModal();
    } catch (err) {
      const errorMsg = err?.response?.data?.message || err?.message || 'Lỗi khi lưu đạo diễn';
      setError(errorMsg);
      console.error('Error submitting form:', err);
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
        console.error('Error deleting director:', err);
      }
    }
  };

  return (
    <div className="directors-page animate-fade-in">
      <div className="page-header">
        <h1 className="page-title"><FiCamera /> Quản lý Đạo diễn</h1>
        <button className="btn btn-primary" onClick={() => openModal()} disabled={loading}><FiPlus /> Thêm đạo diễn</button>
      </div>

      {error && (
        <div style={{
          background: '#fee2e2', border: '1px solid #fecaca', color: '#dc2626',
          padding: '12px 16px', borderRadius: '8px', marginBottom: '16px',
          display: 'flex', alignItems: 'center', gap: '8px', animation: 'slideDown 0.3s ease-out'
        }}>
          <FiAlertCircle size={20} />
          <span>{error}</span>
        </div>
      )}

      {successMessage && (
        <div style={{
          background: '#dcfce7', border: '1px solid #bbf7d0', color: '#16a34a',
          padding: '12px 16px', borderRadius: '8px', marginBottom: '16px',
          display: 'flex', alignItems: 'center', gap: '8px', animation: 'slideDown 0.3s ease-out'
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
              placeholder="Tìm kiếm đạo diễn..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>

        {loading ? (
          <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '200px', color: '#64748b' }}>
            <FiLoader size={32} style={{ animation: 'spin 1s linear infinite' }} />
            <span style={{ marginLeft: '12px' }}>Đang tải dữ liệu...</span>
          </div>
        ) : (
          <div className="table-responsive">
            <table>
              <thead>
                <tr>
                  <th style={{ width: '80px' }}>STT</th>
                  <th style={{ width: '80px' }}>Ảnh</th>
                  <th style={{ width: '200px' }}>Tên đạo diễn</th>
                  <th>Tiểu sử</th>
                  <th style={{ width: '130px' }}>Quốc tịch</th>
                  <th style={{ width: '100px' }}>Thao tác</th>
                </tr>
              </thead>
              <tbody>
                {filteredDirectors.map((director, index) => (
                  <tr key={director._id || director.id}>
                    <td>{index + 1}</td>
                    <td>
                      {director.avatar ? (
                        <img src={director.avatar} alt={director.name} className="rounded" style={{ width: '40px', height: '40px', objectFit: 'cover' }} />
                      ) : (
                        <div className="rounded" style={{ width: '40px', height: '40px', background: 'var(--bg-tertiary)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#94a3b8', fontSize: '14px' }}>
                          {director.name.charAt(0)}
                        </div>
                      )}
                    </td>
                    <td className="font-semibold text-accent">{director.name}</td>
                    <td className="text-muted">{director.bio ? (director.bio.length > 80 ? director.bio.slice(0, 80) + '...' : director.bio) : '-'}</td>
                    <td><span className="badge badge-info">{director.nationality || '-'}</span></td>
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
                <label className="form-label">Ảnh đại diện (URL)</label>
                <input type="text" className="form-input" value={formData.avatar} onChange={e => setFormData({...formData, avatar: e.target.value})} placeholder="https://..." />
              </div>
              <div className="grid gap-md" style={{ gridTemplateColumns: '1fr 1fr' }}>
                <div className="form-group mb-md">
                  <label className="form-label">Ngày sinh</label>
                  <input type="date" className="form-input" value={formData.birthDate} onChange={e => setFormData({...formData, birthDate: e.target.value})} />
                </div>
                <div className="form-group mb-md">
                  <label className="form-label">Quốc tịch</label>
                  <input type="text" className="form-input" value={formData.nationality} onChange={e => setFormData({...formData, nationality: e.target.value})} placeholder="Việt Nam" />
                </div>
              </div>
              <div className="form-group mb-md">
                <label className="form-label">Tiểu sử</label>
                <textarea className="form-textarea" rows="4" value={formData.bio} onChange={e => setFormData({...formData, bio: e.target.value})} />
              </div>
              <div className="flex justify-end gap-md mt-lg">
                <button type="button" className="btn btn-ghost" onClick={closeModal}>Hủy</button>
                <button type="submit" className="btn btn-primary">{isSubmitting ? 'Đang lưu...' : 'Lưu lại'}</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Directors;