import React, { useState, useEffect } from 'react';
import { FiMonitor, FiInfo, FiGrid } from 'react-icons/fi';
import './Seats.css';

const Seats = () => {
  const [selectedRoom, setSelectedRoom] = useState(1);
  const [seats, setSeats] = useState([]);
  
  const rooms = [
    { id: 1, name: 'Phòng 1', rows: 10, cols: 12 },
    { id: 2, name: 'Phòng 2', rows: 10, cols: 10 },
    { id: 3, name: 'Phòng 3', rows: 14, cols: 14 },
  ];

  const rowLetters = ['A','B','C','D','E','F','G','H','I','J','K','L','M','N'];

  useEffect(() => {
    // Generate seats for selected room
    const room = rooms.find(r => r.id === Number(selectedRoom));
    if (room) {
      const generatedSeats = [];
      for (let r = 0; r < room.rows; r++) {
        let isCoupleRow = r >= room.rows - 2;
        let numSeats = isCoupleRow ? Math.floor(room.cols / 2) : room.cols;
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
            id: `${rowLetters[r]}${c}`,
            row: rowLetters[r],
            number: c,
            type: type,
            price: price,
            status: 'available' // available, maintenance, broken
          });
        }
      }
      setSeats(generatedSeats);
    }
  }, [selectedRoom]);

  const toggleSeatStatus = (seatId) => {
    setSeats(seats.map(seat => {
      if (seat.id === seatId) {
        const newStatus = seat.status === 'available' ? 'maintenance' : 
                          seat.status === 'maintenance' ? 'broken' : 'available';
        return { ...seat, status: newStatus };
      }
      return seat;
    }));
  };

  const currentRoom = rooms.find(r => r.id === Number(selectedRoom));

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
            onChange={(e) => setSelectedRoom(e.target.value)}
          >
            {rooms.map(room => (
              <option key={room.id} value={room.id}>{room.name}</option>
            ))}
          </select>
        </div>
      </div>

      <div className="card glass seat-map-container">
        <div className="screen-indicator mb-xl">
          <div className="screen-curve"></div>
          <div className="text-center text-muted mt-sm font-semibold">MÀN HÌNH</div>
        </div>

        <div className="seat-grid" style={{ 
          gridTemplateColumns: `auto repeat(${currentRoom?.cols || 12}, 1fr)` 
        }}>
          {currentRoom && Array.from({ length: currentRoom.rows }).map((_, r) => {
            const rowSeats = seats.filter(s => s.row === rowLetters[r]).sort((a, b) => a.number - b.number);
            return (
              <React.Fragment key={`row-${r}`}>
                <div className="row-label flex items-center justify-center font-bold text-muted">
                  {rowLetters[r]}
                </div>
                {rowSeats.map((seat) => (
                  <div 
                    key={seat.id}
                    className={`seat ${seat.type} ${seat.status}`}
                    onClick={() => toggleSeatStatus(seat.id)}
                    title={`${seat.id} - ${seat.type} - ${new Intl.NumberFormat('vi-VN').format(seat.price)}đ - ${seat.status}`}
                  >
                    {seat.number}
                  </div>
                ))}
              </React.Fragment>
            );
          })}
        </div>

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
    </div>
  );
};

export default Seats;
