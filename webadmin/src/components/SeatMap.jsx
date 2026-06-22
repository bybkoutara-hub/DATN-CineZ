import { useMemo, useState } from 'react';
import './SeatMap.css';

const TYPE_LABELS = {
  standard: 'Thường',
  vip: 'VIP',
  couple: 'Đôi',
  maintenance: 'Bảo trì',
};

export default function SeatMap({
  seats = [],
  selectedSeats = [],
  onSeatClick,
  readOnly = false,
  roomName = 'Phòng chiếu',
}) {
  const [tooltip, setTooltip] = useState(null);

  // Group seats by row
  const seatGrid = useMemo(() => {
    const rows = {};
    seats.forEach((seat) => {
      if (!rows[seat.row]) rows[seat.row] = [];
      rows[seat.row].push(seat);
    });
    // Sort each row by seat number
    Object.values(rows).forEach((arr) => arr.sort((a, b) => a.number - b.number));
    // Sort row keys alphabetically
    const sortedKeys = Object.keys(rows).sort();
    return sortedKeys.map((key) => ({ row: key, seats: rows[key] }));
  }, [seats]);

  const isSelected = (seat) =>
    selectedSeats.some((s) => s.row === seat.row && s.number === seat.number);

  const getSeatClass = (seat) => {
    const classes = ['sm-seat'];
    if (seat.booked) classes.push('sm-booked');
    else if (isSelected(seat)) classes.push('sm-selected');
    else classes.push('sm-available');

    if (seat.type === 'vip') classes.push('sm-vip');
    if (seat.type === 'couple') classes.push('sm-couple');
    if (seat.type === 'maintenance') classes.push('sm-maintenance');

    return classes.join(' ');
  };

  const handleClick = (seat) => {
    if (readOnly || seat.booked || seat.type === 'maintenance') return;
    onSeatClick?.(seat);
  };

  const handleMouseEnter = (e, seat) => {
    const rect = e.currentTarget.getBoundingClientRect();
    setTooltip({
      seat,
      x: rect.left + rect.width / 2,
      y: rect.top,
    });
  };

  const handleMouseLeave = () => {
    setTooltip(null);
  };

  const formatPrice = (price) => {
    if (!price && price !== 0) return '';
    return new Intl.NumberFormat('vi-VN').format(price) + 'đ';
  };

  return (
    <div className="sm-container">
      {/* Room name */}
      <div className="sm-room-name">{roomName}</div>

      {/* Screen */}
      <div className="sm-screen-wrapper">
        <div className="sm-screen" />
        <span className="sm-screen-label">MÀN HÌNH</span>
      </div>

      {/* Seat grid */}
      <div className="sm-grid">
        {seatGrid.map(({ row, seats: rowSeats }) => (
          <div key={row} className="sm-row">
            <span className="sm-row-label">{row}</span>
            <div className="sm-row-seats">
              {rowSeats.map((seat) => (
                <button
                  key={`${seat.row}-${seat.number}`}
                  className={getSeatClass(seat)}
                  onClick={() => handleClick(seat)}
                  onMouseEnter={(e) => handleMouseEnter(e, seat)}
                  onMouseLeave={handleMouseLeave}
                  disabled={readOnly && !isSelected(seat)}
                  aria-label={`Ghế ${seat.row}${seat.number}`}
                >
                  {seat.number}
                </button>
              ))}
            </div>
            <span className="sm-row-label">{row}</span>
          </div>
        ))}
      </div>

      {/* Legend */}
      <div className="sm-legend">
        <div className="sm-legend-item">
          <span className="sm-legend-box sm-legend-available" />
          <span>Trống</span>
        </div>
        <div className="sm-legend-item">
          <span className="sm-legend-box sm-legend-selected" />
          <span>Đang chọn</span>
        </div>
        <div className="sm-legend-item">
          <span className="sm-legend-box sm-legend-booked" />
          <span>Đã đặt</span>
        </div>
        <div className="sm-legend-item">
          <span className="sm-legend-box sm-legend-vip" />
          <span>VIP</span>
        </div>
        <div className="sm-legend-item">
          <span className="sm-legend-box sm-legend-couple" />
          <span>Đôi</span>
        </div>
        <div className="sm-legend-item">
          <span className="sm-legend-box sm-legend-maintenance" />
          <span>Bảo trì</span>
        </div>
      </div>

      {/* Tooltip */}
      {tooltip && (
        <div
          className="sm-tooltip"
          style={{
            left: tooltip.x,
            top: tooltip.y - 8,
          }}
        >
          <strong>Ghế {tooltip.seat.row}{tooltip.seat.number}</strong>
          <span>Loại: {TYPE_LABELS[tooltip.seat.type] || 'Thường'}</span>
          {tooltip.seat.price !== undefined && (
            <span>Giá: {formatPrice(tooltip.seat.price)}</span>
          )}
        </div>
      )}
    </div>
  );
}
