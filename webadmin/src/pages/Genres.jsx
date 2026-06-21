import React, { useState } from 'react';
import { FiPlus, FiEdit2, FiTrash2, FiSearch, FiTag } from 'react-icons/fi';
import './Genres.css';

const Genres = () => {
  const [genres, setGenres] = useState([
    { id: 1, name: 'Hành Động', description: 'Phim hành động, võ thuật, đánh nhau kịch tính', movieCount: 15 },
    { id: 2, name: 'Tình Cảm', description: 'Phim tình cảm, lãng mạn', movieCount: 12 },
    { id: 3, name: 'Kinh Dị', description: 'Phim kinh dị, ma quái, rùng rợn', movieCount: 8 },
    { id: 4, name: 'Hài', description: 'Phim hài hước, giải trí', movieCount: 10 },
    { id: 5, name: 'Khoa Học Viễn Tưởng', description: 'Phim sci-fi, tương lai, công nghệ', movieCount: 7 },
  ]);
  const [searchTerm, setSearchTerm] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingGenre, setEditingGenre] = useState(null);

  const [formData, setFormData] = useState({ name: '', description: '' });

  const filteredGenres = genres.filter(g => 
    g.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const openModal = (genre = null) => {
    if (genre) {
      setEditingGenre(genre);
      setFormData({ name: genre.name, description: genre.description });
    } else {
      setEditingGenre(null);
      setFormData({ name: '', description: '' });
    }
    setIsModalOpen(true);
  };

  const closeModal = () => setIsModalOpen(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (editingGenre) {
      setGenres(genres.map(g => g.id === editingGenre.id ? { ...g, ...formData } : g));
    } else {
      setGenres([...genres, { id: Date.now(), ...formData, movieCount: 0 }]);
    }
    closeModal();
  };

  const handleDelete = (id) => {
    if (window.confirm('Bạn có chắc chắn muốn xóa thể loại này?')) {
      setGenres(genres.filter(g => g.id !== id));
    }
  };

  return (
    <div className="genres-page animate-fade-in">
      <div className="page-header">
        <h1 className="page-title"><FiTag /> Quản lý Thể loại Phim</h1>
        <button className="btn btn-primary" onClick={() => openModal()}><FiPlus /> Thêm thể loại</button>
      </div>

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
                <tr key={genre.id}>
                  <td>{index + 1}</td>
                  <td className="font-semibold text-accent">{genre.name}</td>
                  <td className="text-muted">{genre.description}</td>
                  <td>
                    <span className="badge badge-info">{genre.movieCount} phim</span>
                  </td>
                  <td>
                    <div className="flex gap-sm">
                      <button className="btn-icon" onClick={() => openModal(genre)}><FiEdit2 /></button>
                      <button className="btn-icon text-danger" onClick={() => handleDelete(genre.id)}><FiTrash2 /></button>
                    </div>
                  </td>
                </tr>
              ))}
              {filteredGenres.length === 0 && (
                <tr>
                  <td colSpan="5" className="text-center text-muted py-lg">
                    Không tìm thấy thể loại nào phù hợp.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
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
