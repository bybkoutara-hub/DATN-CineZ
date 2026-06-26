import React, { useState, useEffect } from 'react';
import { FiPlus, FiEdit2, FiTrash2, FiImage, FiLoader } from 'react-icons/fi';
import { sliderAPI } from '../api/apiService';
import './Sliders.css';

const Sliders = () => {
  const [sliders, setSliders] = useState([]);
  const [loading, setLoading] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingSlider, setEditingSlider] = useState(null);
  const [formData, setFormData] = useState({ title: '', image: '', link: '', order: 1, status: 'active' });

  const fetchSliders = async () => {
    setLoading(true);
    try {
      const res = await sliderAPI.getAll();
      if (res.success) {
        setSliders(res.data);
      }
    } catch (err) {
      console.error('Fetch sliders error:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSliders();
  }, []);

  const openModal = (slider = null) => {
    if (slider) {
      setEditingSlider(slider);
      setFormData({
        title: slider.title,
        image: slider.image,
        link: slider.link || '',
        order: slider.order,
        status: slider.active ? 'active' : 'inactive',
      });
    } else {
      setEditingSlider(null);
      setFormData({ title: '', image: '', link: '', order: sliders.length + 1, status: 'active' });
    }
    setIsModalOpen(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const payload = { ...formData, active: formData.status === 'active' };
      delete payload.status;
      if (editingSlider) {
        await sliderAPI.update(editingSlider._id, payload);
      } else {
        await sliderAPI.create(payload);
      }
      setIsModalOpen(false);
      await fetchSliders();
    } catch (err) {
      console.error('Submit slider error:', err);
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Xóa slider này?')) {
      try {
        await sliderAPI.delete(id);
        await fetchSliders();
      } catch (err) {
        console.error('Delete slider error:', err);
      }
    }
  };

  return (
    <div className="sliders-page animate-fade-in">
      <div className="page-header">
        <h1 className="page-title"><FiImage /> Quản lý Slider</h1>
        <button className="btn btn-primary" onClick={() => openModal()}><FiPlus /> Thêm Slider</button>
      </div>

      {loading ? (
        <div className="loading-container"><FiLoader className="spin" /> Đang tải...</div>
      ) : (
        <div className="slider-grid grid grid-2 gap-lg">
          {sliders.map((slider) => (
            <div key={slider._id} className="card glass slider-card p-0 overflow-hidden">
              <div className="slider-img-wrap relative">
                <img src={slider.image} alt={slider.title} className="w-full" style={{aspectRatio: '3/1', objectFit: 'cover'}} />
                <div className="absolute top-2 right-2">
                  <span className={`badge ${slider.active ? 'badge-success' : 'badge-secondary'}`}>
                    {slider.active ? 'Hiển thị' : 'Ẩn'}
                  </span>
                </div>
                <div className="absolute top-2 left-2 badge badge-info">
                  Thứ tự: {slider.order}
                </div>
              </div>
              <div className="p-md flex justify-between items-center">
                <div>
                  <h3 className="font-bold text-lg">{slider.title}</h3>
                  <div className="text-muted text-sm">{slider.link || 'Không có link'}</div>
                </div>
                <div className="flex gap-sm">
                  <button className="btn-icon text-warning" onClick={() => openModal(slider)}><FiEdit2 /></button>
                  <button className="btn-icon text-danger" onClick={() => handleDelete(slider._id)}><FiTrash2 /></button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {isModalOpen && (
        <div className="modal-backdrop">
          <div className="modal-content card glass animate-scale-in" style={{maxWidth: 600}}>
            <h2 className="text-xl font-bold mb-lg">{editingSlider ? 'Sửa Slider' : 'Thêm Slider'}</h2>
            <form onSubmit={handleSubmit}>
              <div className="form-group mb-md">
                <label className="form-label">Tiêu đề</label>
                <input type="text" className="form-input" required value={formData.title} onChange={e => setFormData({...formData, title: e.target.value})} />
              </div>
              <div className="form-group mb-md">
                <label className="form-label">URL Hình ảnh</label>
                <input type="url" className="form-input" required value={formData.image} onChange={e => setFormData({...formData, image: e.target.value})} />
                {formData.image && <img src={formData.image} alt="preview" className="mt-sm rounded" style={{maxHeight: 150, objectFit: 'cover'}} />}
              </div>
              <div className="form-group mb-md">
                <label className="form-label">Link chuyển hướng (không bắt buộc)</label>
                <input type="text" className="form-input" value={formData.link} onChange={e => setFormData({...formData, link: e.target.value})} />
              </div>
              <div className="grid grid-2 gap-md mb-md">
                <div className="form-group">
                  <label className="form-label">Thứ tự hiển thị</label>
                  <input type="number" className="form-input" required min="1" value={formData.order} onChange={e => setFormData({...formData, order: Number(e.target.value)})} />
                </div>
                <div className="form-group">
                  <label className="form-label">Trạng thái</label>
                  <select className="form-select" value={formData.status} onChange={e => setFormData({...formData, status: e.target.value})}>
                    <option value="active">Hiển thị</option>
                    <option value="inactive">Ẩn</option>
                  </select>
                </div>
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

export default Sliders;
