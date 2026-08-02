import React, { useState, useEffect, useMemo } from 'react';
import { FiMonitor, FiInfo, FiGrid, FiSave, FiLoader, FiSettings, FiPlus, FiTrash2 } from 'react-icons/fi';
import { roomAPI, seatAPI } from '../api/apiService';
import './Seats.css';

// ==================== LAYOUT HELPERS (đồng bộ với api/utils/seatLayout.ts) ====================

const getRowSeatNumbers = (layout, row) => {
  const start = layout.rowStartNumbers?.[row] ?? layout.cols;
  const nums = [];
  for (let n = start; n >= 1; n--) nums.push(n);
  return layout.numbering === 'reverse' ? nums : nums.reverse();
};

const getCouplePairs = (layout, row) => {
  if ((layout.rowTypes?.[row] || 'standard') !== 'couple') return null;
  const start = layout.rowStartNumbers?.[row] ?? layout.cols;
  const pairs = [];
  for (let n = start; n >= 2; n -= 2) pairs.push([n, n - 1]);
  return layout.numbering === 'reverse' ? pairs : pairs.reverse();
};

const isCenterSeat = (layout, row, number) => {
  const zone = layout.centerZone;
  if (!zone) return false;
  return zone.rows.includes(row) && zone.cols.includes(number);
};

const buildDefaultLayout = (rowsCount, seatsPerRow) => {
  const letters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
  const rows = Array.from({ length: rowsCount }, (_, i) => letters[i]);
  const rowTypes = {};
  const rowStartNumbers = {};
  rows.forEach((row, i) => {
    const isCoupleRow = i >= rowsCount - 2;
    const isVipRow = i >= 3 && i <= 6;
    rowTypes[row] = isCoupleRow ? 'couple' : isVipRow ? 'vip' : 'standard';
    rowStartNumbers[row] = isCoupleRow ? Math.floor(seatsPerRow / 2) * 2 : seatsPerRow;
  });
  return { rows, cols: seatsPerRow, numbering: 'forward', rowTypes, rowStartNumbers, centerZone: null };
};

const getSeatPriceByType = (type) => {
  if (type === 'vip') return 95000;
  if (type === 'couple') return 150000;
  return 75000;
};

const getRoomLayout = (room) => {
  const layout = room?.layout;
  if (layout && Array.isArray(layout.rows) && layout.rows.length > 0 && layout.cols) {
    return layout;
  }
  return buildDefaultLayout(room?.rows_count || 8, room?.seats_per_row || 15);
};

// Layout chuẩn (đồng bộ với api/utils/seatLayout.ts DEFAULT_LAYOUT)
const STANDARD_LAYOUT = {
  rows: ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H'],
  cols: 15,
  numbering: 'reverse',
  rowTypes: { A: 'standard', B: 'standard', C: 'standard', D: 'vip', E: 'vip', F: 'vip', G: 'vip', H: 'couple' },
  rowStartNumbers: { A: 14, B: 15, C: 15, D: 13, E: 14, F: 14, G: 15, H: 12 },
  centerZone: { rows: ['C', 'D', 'E', 'F'], cols: [5, 6, 7, 8, 9, 10, 11] },
};

const Seats = () => {
  const [selectedRoom, setSelectedRoom] = useState('');
  const [rooms, setRooms] = useState([]);
  const [room, setRoom] = useState(null);
  const [seats, setSeats] = useState([]);
  const [loadingRooms, setLoadingRooms] = useState(true);
  const [loadingSeats, setLoadingSeats] = useState(false);
  const [saving, setSaving] = useState(false);
  const [hasChanges, setHasChanges] = useState(false);
  const [showLayoutEditor, setShowLayoutEditor] = useState(false);
  const [draft, setDraft] = useState(null);
  const [savingLayout, setSavingLayout] = useState(false);

  const layout = useMemo(() => getRoomLayout(room), [room]);
  // Khi mở trình chỉnh sửa, hiển thị preview theo bản nháp
  const displayLayout = showLayoutEditor && draft ? draft : layout;
  const cols = displayLayout?.cols || 15;
  const seatMap = useMemo(() => {
    const map = {};
    seats.forEach(s => { map[s.label || `${s.row}${s.number}`] = s; });
    return map;
  }, [seats]);

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
    let cancelled = false;
    const fetchRoomAndSeats = async () => {
      try {
        setLoadingSeats(true);
        setHasChanges(false);
        const [roomRes, seatRes] = await Promise.all([
          roomAPI.getById(selectedRoom),
          seatAPI.getByRoom(selectedRoom),
        ]);
        if (cancelled) return;
        const roomDetail = roomRes.success ? roomRes.data : null;
        setRoom(roomDetail);
        const roomLayout = getRoomLayout(roomDetail);
        if (seatRes.success && seatRes.data.length > 0) {
          setSeats(seatRes.data);
        } else {
          const generatedSeats = [];
          roomLayout.rows.forEach(row => {
            const type = roomLayout.rowTypes?.[row] || 'standard';
            getRowSeatNumbers(roomLayout, row).forEach(n => {
              generatedSeats.push({
                _id: `${row}${n}`,
                row,
                number: n,
                label: `${row}${n}`,
                type,
                status: 'available',
                price: getSeatPriceByType(type),
              });
            });
          });
          setSeats(generatedSeats);
        }
      } catch (err) {
        console.error('Failed to fetch room/seats:', err);
      } finally {
        if (!cancelled) setLoadingSeats(false);
      }
    };
    fetchRoomAndSeats();
    return () => { cancelled = true; };
  }, [selectedRoom]);

  const cycleStatus = (status) => {
    if (status === 'available') return 'maintenance';
    if (status === 'maintenance') return 'broken';
    return 'available';
  };

  const updateSeatStatus = (label, status) => {
    setSeats(prev => prev.map(seat => {
      if (seat.label === label) {
        return { ...seat, status };
      }
      return seat;
    }));
  };

  const toggleSeatStatus = (seat) => {
    const label = seat.label || `${seat.row}${seat.number}`;
    updateSeatStatus(label, cycleStatus(seat.status || 'available'));
    setHasChanges(true);
  };

  const togglePairStatus = (row, hi, lo) => {
    const s1 = seatMap[`${row}${hi}`];
    const s2 = seatMap[`${row}${lo}`];
    const current = s1?.status || s2?.status || 'available';
    const next = cycleStatus(current);
    updateSeatStatus(`${row}${hi}`, next);
    updateSeatStatus(`${row}${lo}`, next);
    setHasChanges(true);
  };

  const getPairStatus = (row, hi, lo) => {
    const s1 = seatMap[`${row}${hi}`];
    const s2 = seatMap[`${row}${lo}`];
    if (s1?.status === 'broken' || s2?.status === 'broken') return 'broken';
    if (s1?.status === 'maintenance' || s2?.status === 'maintenance') return 'maintenance';
    return 'available';
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

  const getSeatClass = (seat) => {
    const classes = ['seat', seat.type || 'standard'];
    if (seat.status && seat.status !== 'available') classes.push(seat.status);
    if (isCenterSeat(displayLayout, seat.row, seat.number)) classes.push('center');
    return classes.join(' ');
  };

  const renderRow = (row) => {
    const isCoupleRow = (displayLayout.rowTypes?.[row] || 'standard') === 'couple';
    const start = displayLayout.rowStartNumbers?.[row] ?? cols;
    const emptyLeft = displayLayout.numbering === 'reverse' ? cols - start : 0;
    const emptyRight = displayLayout.numbering === 'forward' ? cols - start : 0;
    const cells = [];

    for (let i = 0; i < emptyLeft; i++) {
      cells.push(<div key={`${row}-e${i}`} className="seat-empty" />);
    }

    if (isCoupleRow) {
      const pairs = getCouplePairs(displayLayout, row);
      pairs.forEach(([hi, lo]) => {
        const status = getPairStatus(row, hi, lo);
        const type = 'couple';
        const label = `${row}${hi}-${lo}`;
        cells.push(
          <div
            key={label}
            className={`seat ${type} ${status !== 'available' ? status : ''}`}
            onClick={() => togglePairStatus(row, hi, lo)}
            title={`${label} - Ghế đôi - ${status === 'available' ? 'Hoạt động' : status}`}
          >
            {hi}-{lo}
          </div>
        );
      });
    } else {
      getRowSeatNumbers(displayLayout, row).forEach(n => {
        const label = `${row}${n}`;
        const seat = seatMap[label];
        if (!seat) {
          cells.push(<div key={label} className="seat-empty" />);
        } else {
          cells.push(
            <div
              key={seat._id}
              className={getSeatClass(seat)}
              onClick={() => toggleSeatStatus(seat)}
              title={`${seat.label} - ${seat.type === 'vip' ? 'VIP' : seat.type === 'couple' ? 'Đôi' : 'Thường'} - ${new Intl.NumberFormat('vi-VN').format(seat.price)}đ - ${seat.status}`}
            >
              {seat.number}
            </div>
          );
        }
      });
    }

    for (let i = 0; i < emptyRight; i++) {
      cells.push(<div key={`${row}-er${i}`} className="seat-empty" />);
    }

    return (
      <React.Fragment key={row}>
        <div className="row-label flex items-center justify-center font-bold text-muted">
          {row}
        </div>
        {cells}
      </React.Fragment>
    );
  };

  // ==================== TRÌNH CHỈNH SỬA LAYOUT ====================

  const openLayoutEditor = () => {
    if (showLayoutEditor) {
      setShowLayoutEditor(false);
      return;
    }
    setDraft(JSON.parse(JSON.stringify(layout)));
    setShowLayoutEditor(true);
  };

  const updateDraft = (patch) => setDraft(prev => ({ ...prev, ...patch }));

  const updateRowProp = (row, prop, value) => {
    setDraft(prev => {
      const next = { ...prev };
      if (prop === 'type') {
        next.rowTypes = { ...prev.rowTypes, [row]: value };
        if (value === 'couple' && ((next.rowStartNumbers[row] ?? prev.cols) % 2 !== 0)) {
          next.rowStartNumbers = { ...next.rowStartNumbers, [row]: (next.rowStartNumbers[row] ?? prev.cols) - 1 };
        }
      } else if (prop === 'start') {
        let v = Math.max(1, Math.min(prev.cols, Number(value) || 1));
        if (next.rowTypes?.[row] === 'couple') {
          if (v % 2 !== 0) v -= 1;
          if (v < 2) v = 2;
        }
        next.rowStartNumbers = { ...next.rowStartNumbers, [row]: v };
      }
      return next;
    });
  };

  const addRow = () => {
    setDraft(prev => {
      const letters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
      const used = new Set(prev.rows);
      const row = letters.split('').find(l => !used.has(l));
      if (!row || prev.rows.length >= 26) return prev;
      return {
        ...prev,
        rows: [...prev.rows, row],
        rowTypes: { ...prev.rowTypes, [row]: 'standard' },
        rowStartNumbers: { ...prev.rowStartNumbers, [row]: prev.cols },
      };
    });
  };

  const removeRow = (row) => {
    setDraft(prev => {
      if (prev.rows.length <= 1) return prev;
      const rowTypes = { ...prev.rowTypes };
      const rowStartNumbers = { ...prev.rowStartNumbers };
      delete rowTypes[row];
      delete rowStartNumbers[row];
      let centerZone = prev.centerZone;
      if (centerZone && centerZone.rows.includes(row)) {
        centerZone = {
          ...centerZone,
          rows: centerZone.rows.filter(r => r !== row),
        };
        if (centerZone.rows.length === 0) centerZone = null;
      }
      return {
        ...prev,
        rows: prev.rows.filter(r => r !== row),
        rowTypes,
        rowStartNumbers,
        centerZone,
      };
    });
  };

  const setCols = (value) => {
    const colsNum = Math.max(1, Math.min(50, Number(value) || 1));
    setDraft(prev => {
      const rowStartNumbers = { ...prev.rowStartNumbers };
      prev.rows.forEach(row => {
        let v = Math.min(rowStartNumbers[row] ?? colsNum, colsNum);
        if (prev.rowTypes?.[row] === 'couple') {
          if (v % 2 !== 0) v -= 1;
          if (v < 2) v = 2;
        }
        rowStartNumbers[row] = v;
      });
      let centerZone = prev.centerZone;
      if (centerZone) {
        const from = Math.min(...centerZone.cols);
        let to = Math.max(...centerZone.cols);
        if (to > colsNum) to = colsNum;
        centerZone = from > to
          ? null
          : { ...centerZone, cols: Array.from({ length: to - from + 1 }, (_, i) => from + i) };
      }
      return { ...prev, cols: colsNum, rowStartNumbers, centerZone };
    });
  };

  const toggleCenter = (checked) => {
    setDraft(prev => ({
      ...prev,
      centerZone: checked
        ? { rows: [], cols: prev.centerZone?.cols || [5, 6, 7, 8, 9, 10, 11] }
        : null,
    }));
  };

  const toggleCenterRow = (row, checked) => {
    setDraft(prev => {
      if (!prev.centerZone) return prev;
      const rows = checked
        ? [...prev.centerZone.rows, row]
        : prev.centerZone.rows.filter(r => r !== row);
      return { ...prev, centerZone: { ...prev.centerZone, rows } };
    });
  };

  const setCenterCols = (fromValue, toValue) => {
    setDraft(prev => {
      if (!prev.centerZone) return prev;
      const from = Math.max(1, Math.min(prev.cols, Number(fromValue) || 1));
      const to = Math.max(from, Math.min(prev.cols, Number(toValue) || prev.cols));
      return {
        ...prev,
        centerZone: {
          ...prev.centerZone,
          cols: Array.from({ length: to - from + 1 }, (_, i) => from + i),
        },
      };
    });
  };

  const handleRestoreDefault = () => {
    setDraft(JSON.parse(JSON.stringify(STANDARD_LAYOUT)));
  };

  const handleSaveLayout = async () => {
    if (!draft) return;
    try {
      setSavingLayout(true);
      const res = await roomAPI.updateLayout(selectedRoom, draft);
      if (res.success) {
        setShowLayoutEditor(false);
        setHasChanges(false);
        const [roomRes, seatRes] = await Promise.all([
          roomAPI.getById(selectedRoom),
          seatAPI.getByRoom(selectedRoom),
        ]);
        if (roomRes.success) setRoom(roomRes.data);
        if (seatRes.success && seatRes.data.length > 0) setSeats(seatRes.data);
        alert('Cập nhật layout thành công!');
      }
    } catch (err) {
      console.error('Failed to update layout:', err);
      alert('Cập nhật layout thất bại!');
    } finally {
      setSavingLayout(false);
    }
  };

  const centerFrom = draft?.centerZone ? Math.min(...draft.centerZone.cols) : null;
  const centerTo = draft?.centerZone ? Math.max(...draft.centerZone.cols) : null;

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

      <div className="card glass mb-lg">
        <div className="flex justify-between items-center">
          <div>
            <h3 className="text-lg font-semibold"><FiSettings /> Cấu hình sơ đồ ghế</h3>
            <p className="text-muted text-sm mt-sm">
              Thay đổi layout tại đây sẽ được đồng bộ xuống app khi khách đặt vé.
            </p>
          </div>
          <button
            className="btn btn-ghost"
            onClick={openLayoutEditor}
            disabled={!selectedRoom}
          >
            {showLayoutEditor ? 'Đóng trình chỉnh sửa' : 'Chỉnh sửa layout'}
          </button>
        </div>

        {showLayoutEditor && draft && (
          <div className="mt-lg layout-editor">
            <div className="grid grid-2 gap-md mb-md">
              <div className="form-group">
                <label className="form-label">Đánh số ghế</label>
                <select
                  className="form-select"
                  value={draft.numbering}
                  onChange={e => updateDraft({ numbering: e.target.value })}
                >
                  <option value="reverse">Ngược (số lớn bên trái)</option>
                  <option value="forward">Thuận (số nhỏ bên trái)</option>
                </select>
              </div>
              <div className="form-group">
                <label className="form-label">Số ghế tối đa mỗi hàng</label>
                <input
                  type="number"
                  className="form-input"
                  min="1"
                  max="50"
                  value={draft.cols}
                  onChange={e => setCols(Number(e.target.value))}
                />
              </div>
            </div>

            <div className="layout-editor-rows mb-md">
              <div className="layout-editor-header flex items-center gap-md text-muted text-sm mb-sm">
                <span style={{ width: 24 }}>Hàng</span>
                <span className="flex-1">Số ghế</span>
                <span className="flex-1">Loại ghế</span>
                <span style={{ width: 32 }}></span>
              </div>
              {draft.rows.map((row) => (
                <div key={row} className="layout-editor-row flex items-center gap-md">
                  <span className="font-bold" style={{ width: 24 }}>{row}</span>
                  <div className="form-group mb-0 flex-1">
                    <input
                      type="number"
                      className="form-input"
                      min="1"
                      max={draft.cols}
                      value={draft.rowStartNumbers[row] ?? draft.cols}
                      onChange={e => updateRowProp(row, 'start', e.target.value)}
                    />
                  </div>
                  <div className="form-group mb-0 flex-1">
                    <select
                      className="form-select"
                      value={draft.rowTypes[row] || 'standard'}
                      onChange={e => updateRowProp(row, 'type', e.target.value)}
                    >
                      <option value="standard">Thường</option>
                      <option value="vip">VIP</option>
                      <option value="couple">Đôi</option>
                    </select>
                  </div>
                  <button className="btn-icon text-danger" onClick={() => removeRow(row)} title="Xóa hàng">
                    <FiTrash2 />
                  </button>
                </div>
              ))}
              {draft.rows.length < 26 && (
                <button className="btn btn-ghost btn-sm mt-sm" onClick={addRow}>
                  <FiPlus /> Thêm hàng
                </button>
              )}
            </div>

            <div className="mb-lg">
              <label className="form-label flex items-center gap-sm">
                <input
                  type="checkbox"
                  checked={!!draft.centerZone}
                  onChange={e => toggleCenter(e.target.checked)}
                />
                Vùng trung tâm (Prime)
              </label>
              {draft.centerZone && (
                <div className="mt-sm">
                  <div className="flex items-center gap-md flex-wrap mb-sm">
                    <span className="text-muted text-sm">Hàng:</span>
                    {draft.rows.map(row => (
                      <label key={row} className="flex items-center gap-sm text-sm">
                        <input
                          type="checkbox"
                          checked={draft.centerZone.rows.includes(row)}
                          onChange={e => toggleCenterRow(row, e.target.checked)}
                        />
                        {row}
                      </label>
                    ))}
                  </div>
                  <div className="flex items-center gap-md">
                    <span className="text-muted text-sm">Cột từ</span>
                    <input
                      type="number"
                      className="form-input"
                      style={{ width: 80 }}
                      min="1"
                      max={draft.cols}
                      value={centerFrom}
                      onChange={e => setCenterCols(e.target.value, centerTo)}
                    />
                    <span className="text-muted text-sm">đến</span>
                    <input
                      type="number"
                      className="form-input"
                      style={{ width: 80 }}
                      min="1"
                      max={draft.cols}
                      value={centerTo}
                      onChange={e => setCenterCols(centerFrom, e.target.value)}
                    />
                  </div>
                </div>
              )}
            </div>

            <div className="flex justify-end gap-md">
              <button className="btn btn-ghost" onClick={handleRestoreDefault}>
                Khôi phục mặc định
              </button>
              <button
                className="btn btn-primary flex items-center gap-sm"
                onClick={handleSaveLayout}
                disabled={savingLayout}
              >
                {savingLayout ? <FiLoader className="animate-spin" /> : <FiSave />}
                {savingLayout ? 'Đang lưu...' : 'Lưu layout'}
              </button>
            </div>
          </div>
        )}
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
          <div className="seat-grid" style={{ gridTemplateColumns: `auto repeat(${cols}, 1fr)` }}>
            {layout.rows.map(row => renderRow(row))}
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
            <span>Ghế Đôi</span>
          </div>
          <div className="legend-item flex items-center gap-sm">
            <div className="seat-demo center"></div>
            <span>Vùng Trung Tâm</span>
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
