import React, { useState, useEffect } from 'react';
import { FiPlus, FiEdit2, FiTrash2, FiSearch, FiMonitor } from 'react-icons/fi';
import './Rooms.css';

const Rooms = () => {
  const [rooms, setRooms] = useState([
    { id: 1, name: 'Phòng 1', type: '2D', totalSeats: 120, rows: 10, seatsPerRow: 12, status: 'active' },
    { id: 2, name: 'Phòng 2', type: '3D', totalSeats: 100, rows: 10, seatsPerRow: 10, status: 'active' },
    { id: 3, name: 'Phòng 3', type: 'IMAX', totalSeats: 200, rows: 14, seatsPerRow: 14, status: 'active' },
    { id: 4, name: 'Phòng 4', type: '2D', totalSeats: 80, rows: 8, seatsPerRow: 10, status: 'maintenance' },
  ]);
  const [searchTerm, setSearchTerm] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingRoom, setEditingRoom] = useState(null);

  const [formData, setFormData] = useState({
    name: '', type: '2D', rows: 10, seatsPerRow: 10, status: 'active'
  });

  const handleSearch = (e) => setSearchTerm(e.target.value);

  const filteredRooms = rooms.filter(room => 
    room.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const openModal = (room = null) => {
    if (room) {
      setEditingRoom(room);
      setFormData({ ...room });
    } else {
      setEditingRoom(null);
      setFormData({ name: '', type: '2D', rows: 10, seatsPerRow: 10, status: 'active' });
    }
    setIsModalOpen(true);
  };

  const closeModal = () => setIsModalOpen(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    const totalSeats = formData.rows * formData.seatsPerRow;
    if (editingRoom) {
      setRooms(rooms.map(r => r.id === editingRoom.id ? { ...formData, id: r.id, totalSeats } : r));
    } else {
      setRooms([...rooms, { ...formData, id: Date.now(), totalSeats }]);
    }
    closeModal();
  };

  const handleDelete = (id) => {
    if (window.confirm('Bạn có chắc chắn muốn xóa phòng này?')) {
      setRooms(rooms.filter(r => r.id !== id));
    }
  };

  return (
    <div className="rooms-page animate-fade-in">
      <div className="page-header">
        <h1 className="page-title"><FiMonitor /> Quản lý Phòng Chiếu</h1>
        <button className="btn btn-primary" onClick={() => openModal()}><FiPlus /> Thêm phòng mới</button>
      </div>

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
                <tr key={room.id}>
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
                      <button className="btn-icon text-danger" onClick={() => handleDelete(room.id)}><FiTrash2 /></button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
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
                <button type="submit" className="btn btn-primary">Lưu lại</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Rooms;
