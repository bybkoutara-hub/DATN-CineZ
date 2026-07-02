import React, { useState, useEffect } from 'react';
import { FiPlus, FiEdit2, FiTrash2, FiSearch, FiMonitor, FiAlertCircle, FiCheckCircle, FiLoader } from 'react-icons/fi';
import { roomAPI } from '../api/apiService';
import './Rooms.css';

const Rooms = () => {
  const [rooms, setRooms] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingRoom, setEditingRoom] = useState(null);

  const [formData, setFormData] = useState({
    name: '', type: '2D', rows: 10, seatsPerRow: 10, status: 'active'
  });

  const [loading, setLoading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  useEffect(() => {
    fetchRooms();
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

  const fetchRooms = async () => {
    setLoading(true);
    setError('');
    try {
      const result = await roomAPI.getAll();
      const data = Array.isArray(result.data) ? result.data : (result.data?.data || []);
      const mapped = data.map(room => ({
        ...room,
        rows: room.rows_count ?? room.rows ?? 0,
        seatsPerRow: room.seats_per_row ?? room.seatsPerRow ?? 0,
      }));
      setRooms(mapped);
    } catch (err) {
      const errorMsg = err?.response?.data?.message || err?.message || 'Không thể tải danh sách phòng';
      setError(errorMsg);
      console.error('Error fetching rooms:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (e) => setSearchTerm(e.target.value);

  const filteredRooms = rooms.filter(room => 
    room.name?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const openModal = (room = null) => {
    setError('');
    if (room) {
      setEditingRoom(room);
      setFormData({
        name: room.name || '',
        type: room.type || '2D',
        rows: room.rows ?? 10,
        seatsPerRow: room.seatsPerRow ?? 10,
        status: room.status || 'active',
      });
    } else {
      setEditingRoom(null);
      setFormData({ name: '', type: '2D', rows: 10, seatsPerRow: 10, status: 'active' });
    }
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setEditingRoom(null);
    setFormData({ name: '', type: '2D', rows: 10, seatsPerRow: 10, status: 'active' });
    setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!formData.name.trim()) {
      setError('Tên phòng không được để trống');
      return;
    }

    setIsSubmitting(true);
    try {
      const payload = {
        name: formData.name,
        type: formData.type,
        rows_count: formData.rows,
        seats_per_row: formData.seatsPerRow,
        status: formData.status,
      };

      if (editingRoom) {
        const result = await roomAPI.update(editingRoom._id, payload);
        setRooms(rooms.map(r => r._id === editingRoom._id ? {
          ...r,
          ...payload,
          rows: formData.rows,
          seatsPerRow: formData.seatsPerRow,
          totalSeats: formData.rows * formData.seatsPerRow,
        } : r));
        setSuccessMessage(result.message || 'Cập nhật phòng thành công');
      } else {
        const result = await roomAPI.create(payload);
        const newRoom = {
          _id: result.data?._id || result.data?.id || Date.now(),
          ...payload,
          rows: formData.rows,
          seatsPerRow: formData.seatsPerRow,
          totalSeats: formData.rows * formData.seatsPerRow,
        };
        setRooms([...rooms, newRoom]);
        setSuccessMessage(result.message || 'Thêm phòng thành công');
      }
      closeModal();
    } catch (err) {
      const errorMsg = err?.response?.data?.message || err?.message || 'Lỗi khi lưu phòng';
      setError(errorMsg);
      console.error('Error submitting form:', err);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Bạn có chắc chắn muốn xóa phòng này?')) {
      setError('');
      try {
        await roomAPI.delete(id);
        setRooms(rooms.filter(r => r._id !== id));
        setSuccessMessage('Xóa phòng thành công');
      } catch (err) {
        const errorMsg = err?.response?.data?.message || err?.message || 'Lỗi khi xóa phòng';
        setError(errorMsg);
        console.error('Error deleting room:', err);
      }
    }
  };

  return (
    <div className="rooms-page animate-fade-in">
      <div className="page-header">
        <h1 className="page-title"><FiMonitor /> Quản lý Phòng Chiếu</h1>
        <button className="btn btn-primary" onClick={() => openModal()} disabled={loading}><FiPlus /> Thêm phòng mới</button>
      </div>

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
          <div className="search-box relative">
            <FiSearch className="absolute left-3 top-3 text-muted" />
            <input 
              type="text" 
              className="form-input pl-10" 
              placeholder="Tìm kiếm phòng chiếu..." 
              value={searchTerm}
              onChange={handleSearch}
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
                  <th>STT</th>
                  <th>Tên phòng</th>
                  <th>Loại phòng</th>
                  <th>Số ghế</th>
                  <th>Số hàng</th>
                  <th>Ghế/hàng</th>
                  <th>Trạng thái</th>
                  <th>Thao tác</th>
                </tr>
              </thead>
              <tbody>
                {filteredRooms.map((room, index) => (
                  <tr key={room._id}>
                    <td>{index + 1}</td>
                    <td className="font-semibold">{room.name}</td>
                    <td><span className="badge badge-info">{room.type}</span></td>
                    <td>{room.totalSeats}</td>
                    <td>{room.rows}</td>
                    <td>{room.seatsPerRow}</td>
                    <td>
                      <span className={`badge ${room.status === 'active' ? 'badge-success' : 'badge-warning'}`}>
                        {room.status === 'active' ? 'Đang hoạt động' : 'Bảo trì'}
                      </span>
                    </td>
                    <td>
                      <div className="flex gap-sm">
                        <button className="btn-icon" onClick={() => openModal(room)}><FiEdit2 /></button>
                        <button className="btn-icon text-danger" onClick={() => handleDelete(room._id)}><FiTrash2 /></button>
                      </div>
                    </td>
                  </tr>
                ))}
                {!loading && filteredRooms.length === 0 && (
                  <tr>
                    <td colSpan="8" className="text-center text-muted py-lg">
                      {rooms.length === 0 ? 'Chưa có phòng chiếu nào. Hãy thêm phòng mới!' : 'Không tìm thấy phòng nào phù hợp.'}
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
          <div className="modal-content card glass animate-scale-in">
            <div className="modal-header flex justify-between items-center mb-lg">
              <h2 className="text-xl font-semibold">{editingRoom ? 'Sửa phòng chiếu' : 'Thêm phòng mới'}</h2>
              <button className="btn-icon" onClick={closeModal}>✕</button>
            </div>
            <form onSubmit={handleSubmit}>
              <div className="grid grid-2 gap-md mb-md">
                <div className="form-group">
                  <label className="form-label">Tên phòng</label>
                  <input type="text" className="form-input" required value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} />
                </div>
                <div className="form-group">
                  <label className="form-label">Loại phòng</label>
                  <select className="form-select" value={formData.type} onChange={e => setFormData({...formData, type: e.target.value})}>
                    <option value="2D">2D</option>
                    <option value="3D">3D</option>
                    <option value="IMAX">IMAX</option>
                    <option value="4DX">4DX</option>
                  </select>
                </div>
                <div className="form-group">
                  <label className="form-label">Số hàng ghế</label>
                  <input type="number" className="form-input" required min="1" max="26" value={formData.rows} onChange={e => setFormData({...formData, rows: Number(e.target.value)})} />
                </div>
                <div className="form-group">
                  <label className="form-label">Ghế mỗi hàng</label>
                  <input type="number" className="form-input" required min="1" max="50" value={formData.seatsPerRow} onChange={e => setFormData({...formData, seatsPerRow: Number(e.target.value)})} />
                </div>
                <div className="form-group">
                  <label className="form-label">Trạng thái</label>
                  <select className="form-select" value={formData.status} onChange={e => setFormData({...formData, status: e.target.value})}>
                    <option value="active">Đang hoạt động</option>
                    <option value="maintenance">Bảo trì</option>
                  </select>
                </div>
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

export default Rooms;
