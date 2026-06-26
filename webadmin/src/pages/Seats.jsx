import React, { useState, useEffect } from 'react';
import { FiMonitor, FiInfo, FiGrid, FiSave, FiLoader } from 'react-icons/fi';
import { roomAPI, seatAPI } from '../api/apiService';
import './Seats.css';

const Seats = () => {
  const [selectedRoom, setSelectedRoom] = useState('');
  const [rooms, setRooms] = useState([]);
  const [seats, setSeats] = useState([]);
  const [loadingRooms, setLoadingRooms] = useState(true);
  const [loadingSeats, setLoadingSeats] = useState(false);
  const [saving, setSaving] = useState(false);
  const [hasChanges, setHasChanges] = useState(false);

  const rowLetters = ['A','B','C','D','E','F','G','H','I','J','K','L','M','N'];

  useEffect(() => {
    const fetchRooms = async () => {
      try {
        setLoadingRooms(true);
        const res = await roomAPI.getAll();
        if (res.success) {
          setRooms(res.data);
          if (res.data.length > 0) {
            setSelectedRoom(res.data[0]._id);
          }
        }
      } catch (err) {
        console.error('Failed to fetch rooms:', err);
      } finally {
        setLoadingRooms(false);
      }
    };
    fetchRooms();
  }, []);

  useEffect(() => {
    if (!selectedRoom) return;
    const fetchSeats = async () => {
      try {
        setLoadingSeats(true);
        setHasChanges(false);
        const res = await seatAPI.getByRoom(selectedRoom);
        if (res.success && res.data.length > 0) {
          setSeats(res.data);
        } else {
          const room = rooms.find(r => r._id === selectedRoom);
          if (room) {
            const rows = room.rows || room.rows_count || 10;
            const cols = room.seats_per_row || 12;
            const generatedSeats = [];
            for (let r = 0; r < rows; r++) {
              let isCoupleRow = r >= rows - 2;
              let numSeats = isCoupleRow ? Math.floor(cols / 2) : cols;
              for (let c = 1; c <= numSeats; c++) {
                let type = 'standard';
                let price = 75000;
                if (r >= 3 && r <= 6) {
                  type = 'vip';
                  price = 95000;
                } else if (isCoupleRow) {
                  type = 'couple';
                  price = 150000;
                }
                generatedSeats.push({
                  _id: `${rowLetters[r]}${c}`,
                  row: rowLetters[r],
                  number: c,
                  label: `${rowLetters[r]}${c}`,
                  type: type,
                  status: 'available',
                  price: price,
                });
              }
            }
            setSeats(generatedSeats);
          }
        }
      } catch (err) {
        console.error('Failed to fetch seats:', err);
      } finally {
        setLoadingSeats(false);
      }
    };
    fetchSeats();
  }, [selectedRoom, rooms]);

  const toggleSeatStatus = (seatId) => {
    setSeats(prev => prev.map(seat => {
      if (seat._id === seatId) {
        const newStatus = seat.status === 'available' ? 'maintenance' : 
                          seat.status === 'maintenance' ? 'broken' : 'available';
        setHasChanges(true);
        return { ...seat, status: newStatus };
      }
      return seat;
    }));
  };

  const handleSave = async () => {
    try {
      setSaving(true);
      const seatsData = seats.map(({ _id, room, ...rest }) => rest);
      const res = await seatAPI.bulkCreate(selectedRoom, seatsData);
      if (res.success) {
        setHasChanges(false);
        const refreshed = await seatAPI.getByRoom(selectedRoom);
        if (refreshed.success) {
          setSeats(refreshed.data);
        }
        alert('Lưu ghế thành công!');
      }
    } catch (err) {
      console.error('Failed to save seats:', err);
      alert('Lưu ghế thất bại!');
    } finally {
      setSaving(false);
    }
  };

  const currentRoom = rooms.find(r => r._id === selectedRoom);
  const rows = currentRoom?.rows || currentRoom?.rows_count || 10;
  const cols = currentRoom?.seats_per_row || 12;

  return (
    <div className="seats-page animate-fade-in">
      <div className="page-header">
        <h1 className="page-title"><FiGrid /> Quản lý Ghế Ngồi</h1>
      </div>

      <div className="card glass mb-lg">
        <div className="form-group mb-0" style={{ maxWidth: '300px' }}>
          <label className="form-label">Chọn phòng chiếu</label>
          <select 
            className="form-select" 
            value={selectedRoom} 
            onChange={(e) => { setSelectedRoom(e.target.value); setHasChanges(false); }}
            disabled={loadingRooms}
          >
            {loadingRooms ? (
              <option>Đang tải...</option>
            ) : (
              rooms.map(room => (
                <option key={room._id} value={room._id}>{room.name}</option>
              ))
            )}
          </select>
        </div>
      </div>

      <div className="card glass seat-map-container">
        <div className="screen-indicator mb-xl">
          <div className="screen-curve"></div>
          <div className="text-center text-muted mt-sm font-semibold">MÀN HÌNH</div>
        </div>

        {loadingSeats ? (
          <div className="flex items-center justify-center py-xl">
            <FiLoader className="animate-spin" size={24} />
            <span className="ml-sm">Đang tải ghế...</span>
          </div>
        ) : (
          <div className="seat-grid" style={{ 
            gridTemplateColumns: `auto repeat(${cols}, 1fr)` 
          }}>
            {Array.from({ length: rows }).map((_, r) => {
              const rowSeats = seats.filter(s => s.row === rowLetters[r]).sort((a, b) => a.number - b.number);
              return (
                <React.Fragment key={`row-${r}`}>
                  <div className="row-label flex items-center justify-center font-bold text-muted">
                    {rowLetters[r]}
                  </div>
                  {rowSeats.map((seat) => (
                    <div 
                      key={seat._id}
                      className={`seat ${seat.type} ${seat.status}`}
                      onClick={() => toggleSeatStatus(seat._id)}
                      title={`${seat.label || seat._id} - ${seat.type} - ${new Intl.NumberFormat('vi-VN').format(seat.price)}đ - ${seat.status}`}
                    >
                      {seat.number}
                    </div>
                  ))}
                </React.Fragment>
              );
            })}
          </div>
        )}

        <div className="seat-legend mt-xl flex justify-center gap-xl flex-wrap">
          <div className="legend-item flex items-center gap-sm">
            <div className="seat-demo standard"></div>
            <span>Ghế Thường</span>
          </div>
          <div className="legend-item flex items-center gap-sm">
            <div className="seat-demo vip"></div>
            <span>Ghế VIP</span>
          </div>
          <div className="legend-item flex items-center gap-sm">
            <div className="seat-demo couple"></div>
            <span>Ghế Couple</span>
          </div>
          <div className="legend-item flex items-center gap-sm">
            <div className="seat-demo maintenance"></div>
            <span>Bảo trì</span>
          </div>
          <div className="legend-item flex items-center gap-sm">
            <div className="seat-demo broken"></div>
            <span>Hỏng</span>
          </div>
        </div>
        
        <div className="mt-md text-center text-muted text-sm flex items-center justify-center gap-sm">
          <FiInfo /> Click vào ghế để thay đổi trạng thái (Hoạt động → Bảo trì → Hỏng)
        </div>
      </div>

      {hasChanges && (
        <div className="card glass mt-lg flex items-center justify-between p-md">
          <span className="text-warning">Có thay đổi chưa được lưu</span>
          <button 
            className="btn btn-primary flex items-center gap-sm" 
            onClick={handleSave} 
            disabled={saving}
          >
            {saving ? <FiLoader className="animate-spin" /> : <FiSave />}
            {saving ? 'Đang lưu...' : 'Lưu ghế'}
          </button>
        </div>
      )}
    </div>
  );
};

export default Seats;
