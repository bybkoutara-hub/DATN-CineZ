import React, { useState, useEffect } from 'react';
import { FiPlus, FiEdit2, FiTrash2, FiSearch, FiUsers, FiAlertCircle, FiCheckCircle, FiLoader } from 'react-icons/fi';
import { actorAPI } from '../api/apiService';
import './Actors.css';

const Actors = () => {
  const [actors, setActors] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingActor, setEditingActor] = useState(null);
  const [formData, setFormData] = useState({ name: '', bio: '', avatar: '', birthDate: '', nationality: '' });

  const [loading, setLoading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  useEffect(() => {
    fetchActors();
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

  const fetchActors = async () => {
    setLoading(true);
    setError('');
    try {
      const result = await actorAPI.getAll();
      if (result.success && Array.isArray(result.data)) {
        setActors(result.data);
      } else {
        setActors(result.data || []);
      }
    } catch (err) {
      const errorMsg = err?.response?.data?.message || err?.message || 'Không thể tải danh sách diễn viên';
      setError(errorMsg);
      console.error('Error fetching actors:', err);
    } finally {
      setLoading(false);
    }
  };

  const filteredActors = actors.filter(a =>
    a.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const openModal = (actor = null) => {
    setError('');
    if (actor) {
      setEditingActor(actor);
      setFormData({
        name: actor.name,
        bio: actor.bio || '',
        avatar: actor.avatar || '',
        birthDate: actor.birthDate ? actor.birthDate.slice(0, 10) : '',
        nationality: actor.nationality || '',
      });
    } else {
      setEditingActor(null);
      setFormData({ name: '', bio: '', avatar: '', birthDate: '', nationality: '' });
    }
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setEditingActor(null);
    setFormData({ name: '', bio: '', avatar: '', birthDate: '', nationality: '' });
    setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!formData.name.trim()) {
      setError('Tên diễn viên không được để trống');
      return;
    }

    setIsSubmitting(true);
    try {
      if (editingActor) {
        const result = await actorAPI.update(editingActor._id || editingActor.id, formData);
        setActors(actors.map(a => (a._id || a.id) === (editingActor._id || editingActor.id) ? { ...a, ...formData } : a));
        setSuccessMessage(result.message || 'Cập nhật diễn viên thành công');
      } else {
        const result = await actorAPI.create(formData);
        const newActor = { _id: result.data._id || result.data.id || Date.now(), ...formData };
        setActors([...actors, newActor]);
        setSuccessMessage(result.message || 'Thêm diễn viên thành công');
      }
      closeModal();
    } catch (err) {
      const errorMsg = err?.response?.data?.message || err?.message || 'Lỗi khi lưu diễn viên';
      setError(errorMsg);
      console.error('Error submitting form:', err);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Bạn có chắc chắn muốn xóa diễn viên này?')) {
      setError('');
      try {
        await actorAPI.delete(id);
        setActors(actors.filter(a => (a._id || a.id) !== id));
        setSuccessMessage('Xóa diễn viên thành công');
      } catch (err) {
        const errorMsg = err?.response?.data?.message || err?.message || 'Lỗi khi xóa diễn viên';
        setError(errorMsg);
        console.error('Error deleting actor:', err);
      }
    }
  };

  return (
    <div className="actors-page animate-fade-in">
      <div className="page-header">
        <h1 className="page-title"><FiUsers /> Quản lý Diễn viên</h1>
        <button className="btn btn-primary" onClick={() => openModal()} disabled={loading}><FiPlus /> Thêm diễn viên</button>
      </div>

      {error && (
        <div className="page-alert page-alert-error">
          <FiAlertCircle size={20} />
          <span>{error}</span>
        </div>
      )}

      {successMessage && (
        <div className="page-alert page-alert-success">
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
              placeholder="Tìm kiếm diễn viên..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>

        {loading ? (
          <div className="table-loading">
            <FiLoader size={28} />
            <span>Đang tải dữ liệu...</span>
          </div>
        ) : (
          <div className="table-responsive">
            <table>
              <thead>
                <tr>
                  <th style={{ width: '80px' }}>STT</th>
                  <th style={{ width: '80px' }}>Ảnh</th>
                  <th style={{ width: '200px' }}>Tên diễn viên</th>
                  <th>Tiểu sử</th>
                  <th style={{ width: '130px' }}>Quốc tịch</th>
                  <th style={{ width: '100px' }}>Thao tác</th>
                </tr>
              </thead>
              <tbody>
                {filteredActors.map((actor, index) => (
                  <tr key={actor._id || actor.id}>
                    <td>{index + 1}</td>
                    <td>
                      {actor.avatar ? (
                        <img src={actor.avatar} alt={actor.name} className="rounded" style={{ width: '40px', height: '40px', objectFit: 'cover' }} />
                      ) : (
                        <div className="avatar-placeholder">
                          {actor.name.charAt(0)}
                        </div>
                      )}
                    </td>
                    <td className="font-semibold text-accent">{actor.name}</td>
                    <td className="text-muted">{actor.bio ? (actor.bio.length > 80 ? actor.bio.slice(0, 80) + '...' : actor.bio) : '-'}</td>
                    <td><span className="badge badge-info">{actor.nationality || '-'}</span></td>
                    <td>
                      <div className="flex gap-sm">
                        <button className="btn-icon" onClick={() => openModal(actor)} title="Sửa"><FiEdit2 /></button>
                        <button className="btn-icon text-danger" onClick={() => handleDelete(actor._id || actor.id)} title="Xóa"><FiTrash2 /></button>
                      </div>
                    </td>
                  </tr>
                ))}
                {!loading && filteredActors.length === 0 && (
                  <tr>
                    <td colSpan="6" className="text-center text-muted py-lg">
                      {actors.length === 0 ? 'Chưa có diễn viên nào. Hãy thêm diễn viên mới!' : 'Không tìm thấy diễn viên nào phù hợp.'}
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
              <h2 className="text-xl font-semibold">{editingActor ? 'Sửa diễn viên' : 'Thêm diễn viên mới'}</h2>
              <button className="btn-icon" onClick={closeModal}>✕</button>
            </div>
            <form onSubmit={handleSubmit}>
              <div className="form-group mb-md">
                <label className="form-label">Tên diễn viên <span className="required">*</span></label>
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

export default Actors;