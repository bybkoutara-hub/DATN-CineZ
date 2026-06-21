import React, { useState } from 'react';
import { FiPlus, FiEdit2, FiTrash2, FiShoppingBag, FiSearch } from 'react-icons/fi';
import './Combos.css';

const Combos = () => {
  const [combos, setCombos] = useState([
    { id: 1, name: 'Combo Solo', image: 'https://picsum.photos/seed/combo1/300/300', description: '1 Bắp rang lớn + 1 Coca lớn', price: 89000, items: 'Bắp rang lớn, Coca lớn', status: 'active' },
    { id: 2, name: 'Combo Couple', image: 'https://picsum.photos/seed/combo2/300/300', description: '1 Bắp rang lớn + 2 Coca lớn', price: 119000, items: 'Bắp rang lớn, Coca lớn x2', status: 'active' },
    { id: 3, name: 'Combo Family', image: 'https://picsum.photos/seed/combo3/300/300', description: '2 Bắp rang lớn + 4 Coca + 1 Khoai chiên', price: 199000, items: 'Bắp rang lớn x2, Coca lớn x4, Khoai chiên', status: 'active' },
    { id: 4, name: 'Bắp Rang Lớn', image: 'https://picsum.photos/seed/combo4/300/300', description: 'Bắp rang bơ size lớn', price: 49000, items: 'Bắp rang lớn', status: 'active' },
  ]);

  const [searchTerm, setSearchTerm] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCombo, setEditingCombo] = useState(null);
  const [formData, setFormData] = useState({ name: '', image: '', description: '', price: 0, items: '', status: 'active' });

  const filteredCombos = combos.filter(c => c.name.toLowerCase().includes(searchTerm.toLowerCase()));

  const formatCurrency = (val) => new Intl.NumberFormat('vi-VN').format(val) + 'đ';

  const openModal = (combo = null) => {
    if (combo) {
      setEditingCombo(combo);
      setFormData({ ...combo });
    } else {
      setEditingCombo(null);
      setFormData({ name: '', image: '', description: '', price: 0, items: '', status: 'active' });
    }
    setIsModalOpen(true);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (editingCombo) {
      setCombos(combos.map(c => c.id === editingCombo.id ? { ...formData, id: c.id } : c));
    } else {
      setCombos([...combos, { ...formData, id: Date.now() }]);
    }
    setIsModalOpen(false);
  };

  const handleDelete = (id) => {
    if (window.confirm('Xóa combo/sản phẩm này?')) {
      setCombos(combos.filter(c => c.id !== id));
    }
  };

  return (
    <div className="combos-page animate-fade-in">
      <div className="page-header">
        <h1 className="page-title"><FiShoppingBag /> Quản lý Sản phẩm kèm</h1>
        <button className="btn btn-primary" onClick={() => openModal()}><FiPlus /> Thêm sản phẩm</button>
      </div>

      <div className="filters-bar mb-lg">
        <div className="search-box relative w-full" style={{maxWidth: 400}}>
          <FiSearch className="absolute left-3 top-3 text-muted" />
          <input 
            type="text" 
            className="form-input pl-10 w-full" 
            placeholder="Tìm kiếm combo, sản phẩm..." 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      <div className="grid grid-4 gap-lg">
        {filteredCombos.map(combo => (
          <div key={combo.id} className="card glass combo-card p-0 flex flex-col">
            <div className="relative">
              <img src={combo.image} alt={combo.name} className="w-full" style={{aspectRatio: '1', objectFit: 'cover', borderRadius: '10px 10px 0 0'}} />
              <div className="absolute top-2 right-2">
                <span className={`badge ${combo.status === 'active' ? 'badge-success' : 'badge-secondary'}`}>
                  {combo.status === 'active' ? 'Đang bán' : 'Ngừng bán'}
                </span>
              </div>
            </div>
            <div className="p-md flex-1 flex flex-col">
              <h3 className="font-bold text-lg mb-xs">{combo.name}</h3>
              <p className="text-sm text-muted mb-md flex-1">{combo.description}</p>
              <div className="text-xl font-bold text-accent mb-md">{formatCurrency(combo.price)}</div>
              
              <div className="flex justify-between items-center border-t pt-sm" style={{borderColor: 'var(--border)'}}>
                <span className="text-xs text-muted truncate max-w-[150px]" title={combo.items}>{combo.items}</span>
                <div className="flex gap-xs">
                  <button className="btn-icon text-warning" onClick={() => openModal(combo)}><FiEdit2 size={16}/></button>
                  <button className="btn-icon text-danger" onClick={() => handleDelete(combo.id)}><FiTrash2 size={16}/></button>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {isModalOpen && (
        <div className="modal-backdrop">
          <div className="modal-content card glass animate-scale-in" style={{maxWidth: 600}}>
            <h2 className="text-xl font-bold mb-lg">{editingCombo ? 'Sửa sản phẩm' : 'Thêm sản phẩm mới'}</h2>
            <form onSubmit={handleSubmit}>
              <div className="grid grid-2 gap-md mb-md">
                <div className="form-group">
                  <label className="form-label">Tên Combo/Sản phẩm</label>
                  <input type="text" className="form-input" required value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} />
                </div>
                <div className="form-group">
                  <label className="form-label">Giá (VNĐ)</label>
                  <input type="number" className="form-input" required min="0" step="1000" value={formData.price} onChange={e => setFormData({...formData, price: Number(e.target.value)})} />
                </div>
              </div>
              
              <div className="form-group mb-md">
                <label className="form-label">URL Hình ảnh</label>
                <input type="url" className="form-input" required value={formData.image} onChange={e => setFormData({...formData, image: e.target.value})} />
              </div>

              <div className="form-group mb-md">
                <label className="form-label">Mô tả ngắn</label>
                <input type="text" className="form-input" value={formData.description} onChange={e => setFormData({...formData, description: e.target.value})} />
              </div>

              <div className="form-group mb-md">
                <label className="form-label">Các món gồm có (cách nhau bởi dấu phẩy)</label>
                <input type="text" className="form-input" value={formData.items} placeholder="VD: Bắp lớn, Coca x2" onChange={e => setFormData({...formData, items: e.target.value})} />
              </div>

              <div className="form-group mb-md">
                <label className="form-label">Trạng thái</label>
                <select className="form-select" value={formData.status} onChange={e => setFormData({...formData, status: e.target.value})}>
                  <option value="active">Đang bán</option>
                  <option value="inactive">Ngừng bán</option>
                </select>
              </div>

              <div className="flex justify-end gap-md mt-lg">
                <button type="button" className="btn btn-ghost" onClick={() => setIsModalOpen(false)}>Hủy</button>
                <button type="submit" className="btn btn-primary">Lưu lại</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Combos;
