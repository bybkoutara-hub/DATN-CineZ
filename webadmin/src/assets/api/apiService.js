// ============================================================
// CineZ Admin Dashboard - API Service
// Mock API service mô phỏng RESTful API calls
// ============================================================

import {
  movies,
  genres,
  rooms,
  seats,
  showtimes,
  combos,
  promotions,
  members,
  staffList,
  sliders,
  bookings,
  invoices,
  users,
} from './mockData';

// Mô phỏng network delay
const delay = (ms = 300) => new Promise((resolve) => setTimeout(resolve, ms));

// Deep clone để tránh mutation dữ liệu gốc
const clone = (data) => JSON.parse(JSON.stringify(data));

// ============================================================
// STORE - Bản sao dữ liệu có thể thay đổi
// ============================================================
let store = {
  movies: clone(movies),
  genres: clone(genres),
  rooms: clone(rooms),
  seats: clone(seats),
  showtimes: clone(showtimes),
  combos: clone(combos),
  promotions: clone(promotions),
  members: clone(members),
  staff: clone(staffList),
  sliders: clone(sliders),
  bookings: clone(bookings),
  invoices: clone(invoices),
};

// ============================================================
// RESPONSE HELPERS
// ============================================================
const response = (data, message = 'Thành công', pagination = null) => ({
  success: true,
  data,
  message,
  ...(pagination && { pagination }),
});

const errorResponse = (message, status = 400) => {
  const err = new Error(message);
  err.success = false;
  err.status = status;
  throw err;
};

// Phân trang
const paginate = (data, page = 1, limit = 10) => {
  const total = data.length;
  const totalPages = Math.ceil(total / limit);
  const start = (page - 1) * limit;
  const paginatedData = data.slice(start, start + limit);
  return {
    data: paginatedData,
    pagination: { page, limit, total, totalPages },
  };
};

// Tìm kiếm trên nhiều trường
const searchInFields = (item, keyword, fields) => {
  if (!keyword) return true;
  const kw = keyword.toLowerCase();
  return fields.some((field) => {
    const val = item[field];
    if (val == null) return false;
    if (Array.isArray(val)) return val.some((v) => String(v).toLowerCase().includes(kw));
    return String(val).toLowerCase().includes(kw);
  });
};

// Sắp xếp
const sortData = (data, sortBy, sortOrder = 'asc') => {
  if (!sortBy) return data;
  return [...data].sort((a, b) => {
    const valA = a[sortBy];
    const valB = b[sortBy];
    if (valA == null && valB == null) return 0;
    if (valA == null) return 1;
    if (valB == null) return -1;
    let comparison = 0;
    if (typeof valA === 'number' && typeof valB === 'number') {
      comparison = valA - valB;
    } else {
      comparison = String(valA).localeCompare(String(valB), 'vi');
    }
    return sortOrder === 'desc' ? -comparison : comparison;
  });
};

// Lấy ID tiếp theo
const getNextId = (collection) => {
  if (collection.length === 0) return 1;
  return Math.max(...collection.map((item) => item.id)) + 1;
};

// ============================================================
// GENERIC CRUD FACTORY
// ============================================================
const createCrudAPI = (entityKey, searchFields = [], filterFields = []) => ({
  getAll: async (params = {}) => {
    await delay();
    let data = clone(store[entityKey]);
    const { search, sortBy, sortOrder, page, limit, ...filters } = params;

    // Tìm kiếm
    if (search) {
      data = data.filter((item) => searchInFields(item, search, searchFields));
    }

    // Lọc theo các trường
    filterFields.forEach((field) => {
      if (filters[field] !== undefined && filters[field] !== '' && filters[field] !== 'all') {
        data = data.filter((item) => String(item[field]) === String(filters[field]));
      }
    });

    // Sắp xếp
    data = sortData(data, sortBy, sortOrder);

    // Phân trang
    if (page) {
      const result = paginate(data, Number(page), Number(limit) || 10);
      return response(result.data, 'Thành công', result.pagination);
    }

    return response(data);
  },

  getById: async (id) => {
    await delay();
    const item = store[entityKey].find((i) => i.id === Number(id));
    if (!item) errorResponse(`Không tìm thấy dữ liệu với ID: ${id}`, 404);
    return response(clone(item));
  },

  create: async (data) => {
    await delay(200);
    const newItem = { id: getNextId(store[entityKey]), ...data };
    store[entityKey].push(newItem);
    return response(clone(newItem), 'Tạo mới thành công');
  },

  update: async (id, data) => {
    await delay(200);
    const index = store[entityKey].findIndex((i) => i.id === Number(id));
    if (index === -1) errorResponse(`Không tìm thấy dữ liệu với ID: ${id}`, 404);
    store[entityKey][index] = { ...store[entityKey][index], ...data, id: Number(id) };
    return response(clone(store[entityKey][index]), 'Cập nhật thành công');
  },

  delete: async (id) => {
    await delay(200);
    const index = store[entityKey].findIndex((i) => i.id === Number(id));
    if (index === -1) errorResponse(`Không tìm thấy dữ liệu với ID: ${id}`, 404);
    const deleted = store[entityKey].splice(index, 1)[0];
    return response(clone(deleted), 'Xóa thành công');
  },
});

// ============================================================
// AUTH API - Xác thực
// ============================================================
export const authAPI = {
  login: async (username, password) => {
    await delay();
    const user = users.find((u) => u.username === username && u.password === password);
    if (!user) errorResponse('Tên đăng nhập hoặc mật khẩu không đúng', 401);
    const { password: _, ...userData } = user;
    return response({
      user: userData,
      token: 'mock-jwt-token-' + user.role + '-' + Date.now(),
    });
  },

  logout: async () => {
    await delay(100);
    return response(null, 'Đăng xuất thành công');
  },

  getProfile: async () => {
    await delay();
    const { password: _, ...userData } = users[0];
    return response(userData);
  },

  updateProfile: async (data) => {
    await delay(200);
    return response({ ...users[0], ...data, password: undefined }, 'Cập nhật thông tin thành công');
  },

  changePassword: async (oldPassword, newPassword) => {
    await delay(200);
    if (oldPassword !== users[0].password) errorResponse('Mật khẩu cũ không đúng', 400);
    return response(null, 'Đổi mật khẩu thành công');
  },
};

// ============================================================
// MOVIE API - Quản lý phim
// ============================================================
export const movieAPI = {
  ...createCrudAPI('movies', ['title', 'originalTitle', 'director', 'description'], ['status', 'rated']),

  getByStatus: async (status) => {
    await delay();
    const data = store.movies.filter((m) => m.status === status);
    return response(clone(data));
  },

  getByGenre: async (genreId) => {
    await delay();
    const data = store.movies.filter((m) => m.genres.includes(Number(genreId)));
    return response(clone(data));
  },

  updateStatus: async (id, status) => {
    await delay(200);
    const index = store.movies.findIndex((m) => m.id === Number(id));
    if (index === -1) errorResponse('Không tìm thấy phim', 404);
    store.movies[index].status = status;
    return response(clone(store.movies[index]), 'Cập nhật trạng thái phim thành công');
  },
};

// ============================================================
// GENRE API - Quản lý thể loại
// ============================================================
export const genreAPI = createCrudAPI('genres', ['name', 'description'], []);

// ============================================================
// ROOM API - Quản lý phòng chiếu
// ============================================================
export const roomAPI = {
  ...createCrudAPI('rooms', ['name'], ['status', 'type']),

  getSeats: async (roomId) => {
    await delay();
    const data = store.seats.filter((s) => s.roomId === Number(roomId));
    if (data.length === 0) errorResponse('Không tìm thấy phòng chiếu', 404);
    return response(clone(data));
  },

  updateStatus: async (id, status) => {
    await delay(200);
    const index = store.rooms.findIndex((r) => r.id === Number(id));
    if (index === -1) errorResponse('Không tìm thấy phòng chiếu', 404);
    store.rooms[index].status = status;

    // Cập nhật trạng thái ghế theo phòng
    if (status === 'maintenance') {
      store.seats.forEach((s) => {
        if (s.roomId === Number(id)) s.status = 'maintenance';
      });
    } else {
      store.seats.forEach((s) => {
        if (s.roomId === Number(id) && s.status === 'maintenance') s.status = 'available';
      });
    }

    return response(clone(store.rooms[index]), 'Cập nhật trạng thái phòng thành công');
  },
};

// ============================================================
// SEAT API - Quản lý ghế
// ============================================================
export const seatAPI = {
  ...createCrudAPI('seats', ['row'], ['roomId', 'type', 'status']),

  getByRoom: async (roomId) => {
    await delay();
    const data = store.seats.filter((s) => s.roomId === Number(roomId));
    return response(clone(data));
  },

  updateStatus: async (id, status) => {
    await delay(200);
    const index = store.seats.findIndex((s) => s.id === Number(id));
    if (index === -1) errorResponse('Không tìm thấy ghế', 404);
    store.seats[index].status = status;
    return response(clone(store.seats[index]), 'Cập nhật trạng thái ghế thành công');
  },

  updatePrice: async (id, price) => {
    await delay(200);
    const index = store.seats.findIndex((s) => s.id === Number(id));
    if (index === -1) errorResponse('Không tìm thấy ghế', 404);
    store.seats[index].price = price;
    return response(clone(store.seats[index]), 'Cập nhật giá ghế thành công');
  },

  bulkUpdatePrice: async (roomId, type, price) => {
    await delay(300);
    let count = 0;
    store.seats.forEach((s) => {
      if (s.roomId === Number(roomId) && s.type === type) {
        s.price = price;
        count++;
      }
    });
    return response({ updatedCount: count }, `Đã cập nhật giá cho ${count} ghế`);
  },
};

// ============================================================
// SHOWTIME API - Quản lý suất chiếu
// ============================================================
export const showtimeAPI = {
  ...createCrudAPI('showtimes', [], ['movieId', 'roomId', 'date', 'status']),

  getByDate: async (date) => {
    await delay();
    const data = store.showtimes.filter((s) => s.date === date);
    return response(clone(data));
  },

  getByMovie: async (movieId) => {
    await delay();
    const data = store.showtimes.filter((s) => s.movieId === Number(movieId) && s.status === 'active');
    return response(clone(data));
  },

  getByRoom: async (roomId, date) => {
    await delay();
    let data = store.showtimes.filter((s) => s.roomId === Number(roomId));
    if (date) data = data.filter((s) => s.date === date);
    return response(clone(data));
  },

  getAvailableSeats: async (showtimeId) => {
    await delay();
    const showtime = store.showtimes.find((s) => s.id === Number(showtimeId));
    if (!showtime) errorResponse('Không tìm thấy suất chiếu', 404);

    const roomSeats = store.seats.filter((s) => s.roomId === showtime.roomId);

    // Tìm ghế đã đặt cho suất chiếu này
    const bookedSeatIds = new Set();
    store.bookings
      .filter((b) => b.showtimeId === showtime.id && b.paymentStatus !== 'cancelled')
      .forEach((b) => b.seats.forEach((sId) => bookedSeatIds.add(sId)));

    const seatsWithStatus = roomSeats.map((seat) => ({
      ...seat,
      isBooked: bookedSeatIds.has(seat.id),
    }));

    return response(clone(seatsWithStatus));
  },

  cancel: async (id) => {
    await delay(200);
    const index = store.showtimes.findIndex((s) => s.id === Number(id));
    if (index === -1) errorResponse('Không tìm thấy suất chiếu', 404);
    store.showtimes[index].status = 'cancelled';
    return response(clone(store.showtimes[index]), 'Hủy suất chiếu thành công');
  },
};

// ============================================================
// COMBO API - Quản lý bắp nước
// ============================================================
export const comboAPI = {
  ...createCrudAPI('combos', ['name', 'description'], ['status']),

  updateStatus: async (id, status) => {
    await delay(200);
    const index = store.combos.findIndex((c) => c.id === Number(id));
    if (index === -1) errorResponse('Không tìm thấy combo', 404);
    store.combos[index].status = status;
    return response(clone(store.combos[index]), 'Cập nhật trạng thái combo thành công');
  },
};

// ============================================================
// PROMOTION API - Quản lý khuyến mãi
// ============================================================
export const promotionAPI = {
  ...createCrudAPI('promotions', ['code', 'name', 'description'], ['status', 'type']),

  validateCode: async (code, orderValue) => {
    await delay();
    const promo = store.promotions.find((p) => p.code === code.toUpperCase());
    if (!promo) errorResponse('Mã khuyến mãi không tồn tại', 404);
    if (promo.status !== 'active') errorResponse('Mã khuyến mãi đã hết hạn hoặc chưa kích hoạt', 400);
    if (promo.usedCount >= promo.usageLimit) errorResponse('Mã khuyến mãi đã hết lượt sử dụng', 400);

    const now = new Date().toISOString().split('T')[0];
    if (now < promo.startDate) errorResponse('Mã khuyến mãi chưa có hiệu lực', 400);
    if (now > promo.endDate) errorResponse('Mã khuyến mãi đã hết hạn', 400);
    if (orderValue < promo.minOrderValue) {
      errorResponse(`Đơn hàng tối thiểu ${promo.minOrderValue.toLocaleString('vi-VN')}đ`, 400);
    }

    let discount = 0;
    if (promo.type === 'percent') {
      discount = Math.min((orderValue * promo.value) / 100, promo.maxDiscount);
    } else {
      discount = Math.min(promo.value, promo.maxDiscount);
    }

    return response({ promotion: clone(promo), discount }, 'Mã khuyến mãi hợp lệ');
  },

  updateStatus: async (id, status) => {
    await delay(200);
    const index = store.promotions.findIndex((p) => p.id === Number(id));
    if (index === -1) errorResponse('Không tìm thấy khuyến mãi', 404);
    store.promotions[index].status = status;
    return response(clone(store.promotions[index]), 'Cập nhật trạng thái khuyến mãi thành công');
  },
};

// ============================================================
// MEMBER API - Quản lý thành viên
// ============================================================
export const memberAPI = {
  ...createCrudAPI('members', ['fullName', 'email', 'phone'], ['status', 'tier']),

  getBookingHistory: async (memberId) => {
    await delay();
    const memberBookings = store.bookings.filter((b) => b.memberId === Number(memberId));
    const enriched = memberBookings.map((booking) => {
      const showtime = store.showtimes.find((s) => s.id === booking.showtimeId);
      const movie = showtime ? store.movies.find((m) => m.id === showtime.movieId) : null;
      return {
        ...booking,
        movieTitle: movie ? movie.title : '',
        showDate: showtime ? showtime.date : '',
        showTime: showtime ? showtime.startTime : '',
      };
    });
    return response(clone(enriched));
  },

  updatePoints: async (id, points) => {
    await delay(200);
    const index = store.members.findIndex((m) => m.id === Number(id));
    if (index === -1) errorResponse('Không tìm thấy thành viên', 404);
    store.members[index].points += points;

    // Tự động nâng hạng
    const totalPoints = store.members[index].points;
    if (totalPoints >= 20000) store.members[index].tier = 'platinum';
    else if (totalPoints >= 10000) store.members[index].tier = 'gold';
    else if (totalPoints >= 5000) store.members[index].tier = 'silver';

    return response(clone(store.members[index]), 'Cập nhật điểm thành công');
  },

  updateStatus: async (id, status) => {
    await delay(200);
    const index = store.members.findIndex((m) => m.id === Number(id));
    if (index === -1) errorResponse('Không tìm thấy thành viên', 404);
    store.members[index].status = status;
    return response(clone(store.members[index]), 'Cập nhật trạng thái thành viên thành công');
  },
};

// ============================================================
// STAFF API - Quản lý nhân viên
// ============================================================
export const staffAPI = {
  ...createCrudAPI('staff', ['fullName', 'email', 'phone'], ['status', 'role', 'department']),

  updateStatus: async (id, status) => {
    await delay(200);
    const index = store.staff.findIndex((s) => s.id === Number(id));
    if (index === -1) errorResponse('Không tìm thấy nhân viên', 404);
    store.staff[index].status = status;
    return response(clone(store.staff[index]), 'Cập nhật trạng thái nhân viên thành công');
  },
};

// ============================================================
// SLIDER API - Quản lý banner
// ============================================================
export const sliderAPI = {
  ...createCrudAPI('sliders', ['title'], ['status']),

  reorder: async (orderedIds) => {
    await delay(200);
    orderedIds.forEach((id, index) => {
      const slider = store.sliders.find((s) => s.id === id);
      if (slider) slider.order = index + 1;
    });
    return response(
      clone(store.sliders.sort((a, b) => a.order - b.order)),
      'Sắp xếp lại thứ tự thành công'
    );
  },

  updateStatus: async (id, status) => {
    await delay(200);
    const index = store.sliders.findIndex((s) => s.id === Number(id));
    if (index === -1) errorResponse('Không tìm thấy slider', 404);
    store.sliders[index].status = status;
    return response(clone(store.sliders[index]), 'Cập nhật trạng thái slider thành công');
  },
};

// ============================================================
// BOOKING API - Quản lý đặt vé
// ============================================================
export const bookingAPI = {
  ...createCrudAPI('bookings', [], ['paymentStatus', 'paymentMethod', 'memberId']),

  getAll: async (params = {}) => {
    await delay();
    let data = clone(store.bookings);
    const { search, sortBy, sortOrder, page, limit, paymentStatus, paymentMethod } = params;

    // Enrich với thông tin liên quan
    data = data.map((booking) => {
      const showtime = store.showtimes.find((s) => s.id === booking.showtimeId);
      const movie = showtime ? store.movies.find((m) => m.id === showtime.movieId) : null;
      const room = showtime ? store.rooms.find((r) => r.id === showtime.roomId) : null;
      const member = store.members.find((m) => m.id === booking.memberId);
      return {
        ...booking,
        movieTitle: movie ? movie.title : '',
        roomName: room ? room.name : '',
        showDate: showtime ? showtime.date : '',
        showTime: showtime ? showtime.startTime : '',
        customerName: member ? member.fullName : 'Khách vãng lai',
      };
    });

    // Tìm kiếm
    if (search) {
      data = data.filter((item) =>
        searchInFields(item, search, ['customerName', 'movieTitle', 'roomName'])
      );
    }

    // Lọc
    if (paymentStatus && paymentStatus !== 'all') {
      data = data.filter((b) => b.paymentStatus === paymentStatus);
    }
    if (paymentMethod && paymentMethod !== 'all') {
      data = data.filter((b) => b.paymentMethod === paymentMethod);
    }

    // Sắp xếp
    data = sortData(data, sortBy || 'id', sortOrder || 'desc');

    // Phân trang
    if (page) {
      const result = paginate(data, Number(page), Number(limit) || 10);
      return response(result.data, 'Thành công', result.pagination);
    }

    return response(data);
  },

  createBooking: async (bookingData) => {
    await delay(300);
    const { showtimeId, seatIds, combos: bookingCombos = [], memberId, paymentMethod } = bookingData;

    // Validate suất chiếu
    const showtime = store.showtimes.find((s) => s.id === Number(showtimeId));
    if (!showtime) errorResponse('Suất chiếu không tồn tại', 404);
    if (showtime.status !== 'active') errorResponse('Suất chiếu đã bị hủy', 400);

    // Validate ghế
    const bookedSeatIds = new Set();
    store.bookings
      .filter((b) => b.showtimeId === showtime.id && b.paymentStatus !== 'cancelled')
      .forEach((b) => b.seats.forEach((sId) => bookedSeatIds.add(sId)));

    for (const seatId of seatIds) {
      if (bookedSeatIds.has(seatId)) {
        const seat = store.seats.find((s) => s.id === seatId);
        errorResponse(`Ghế ${seat ? seat.row + seat.number : seatId} đã được đặt`, 400);
      }
    }

    // Tính tổng tiền
    const seatTotal = seatIds.reduce((sum, seatId) => {
      const seat = store.seats.find((s) => s.id === seatId);
      return sum + (seat ? seat.price : 0);
    }, 0);

    const comboTotal = bookingCombos.reduce((sum, c) => {
      const combo = store.combos.find((cb) => cb.id === c.comboId);
      return sum + (combo ? combo.price * c.quantity : 0);
    }, 0);

    const totalAmount = seatTotal + comboTotal;

    const newBooking = {
      id: getNextId(store.bookings),
      memberId: memberId || null,
      showtimeId: showtime.id,
      seats: seatIds,
      combos: bookingCombos,
      totalAmount,
      discountAmount: 0,
      finalAmount: totalAmount,
      promotionId: null,
      paymentMethod: paymentMethod || 'cash',
      paymentStatus: 'paid',
      createdAt: new Date().toISOString().slice(0, 19).replace('T', ' '),
      createdBy: 'admin',
    };

    store.bookings.push(newBooking);

    // Tạo hóa đơn tương ứng
    const movie = store.movies.find((m) => m.id === showtime.movieId);
    const room = store.rooms.find((r) => r.id === showtime.roomId);
    const member = memberId ? store.members.find((m) => m.id === memberId) : null;

    const seatNames = seatIds
      .map((sId) => {
        const s = store.seats.find((seat) => seat.id === sId);
        return s ? `${s.row}${s.number}` : '';
      })
      .filter(Boolean)
      .join(', ');

    const comboNames = bookingCombos
      .map((c) => {
        const combo = store.combos.find((cb) => cb.id === c.comboId);
        return combo ? `${combo.name} x${c.quantity}` : '';
      })
      .filter(Boolean)
      .join(', ');

    const newInvoice = {
      id: getNextId(store.invoices),
      bookingId: newBooking.id,
      invoiceNumber: `HD${String(store.invoices.length + 1).padStart(3, '0')}`,
      customerName: member ? member.fullName : 'Khách vãng lai',
      movieTitle: movie ? movie.title : '',
      roomName: room ? room.name : '',
      showDate: showtime.date,
      showTime: showtime.startTime,
      seats: seatNames,
      combos: comboNames,
      subtotal: totalAmount,
      discount: 0,
      total: totalAmount,
      paymentMethod: newBooking.paymentMethod,
      paymentStatus: newBooking.paymentStatus,
      createdAt: newBooking.createdAt,
      createdBy: newBooking.createdBy,
    };

    store.invoices.push(newInvoice);

    // Cập nhật điểm thành viên
    if (member) {
      const memberIndex = store.members.findIndex((m) => m.id === memberId);
      if (memberIndex !== -1) {
        const earnedPoints = Math.floor(totalAmount / 10000);
        store.members[memberIndex].points += earnedPoints;
        store.members[memberIndex].totalSpent += totalAmount;
      }
    }

    return response({ booking: clone(newBooking), invoice: clone(newInvoice) }, 'Đặt vé thành công');
  },

  cancelBooking: async (id) => {
    await delay(200);
    const index = store.bookings.findIndex((b) => b.id === Number(id));
    if (index === -1) errorResponse('Không tìm thấy đơn đặt vé', 404);
    if (store.bookings[index].paymentStatus === 'cancelled') {
      errorResponse('Đơn đặt vé đã được hủy trước đó', 400);
    }

    store.bookings[index].paymentStatus = 'cancelled';

    // Cập nhật hóa đơn tương ứng
    const invoiceIndex = store.invoices.findIndex((inv) => inv.bookingId === Number(id));
    if (invoiceIndex !== -1) {
      store.invoices[invoiceIndex].paymentStatus = 'cancelled';
    }

    return response(clone(store.bookings[index]), 'Hủy đặt vé thành công');
  },
};

// ============================================================
// INVOICE API - Quản lý hóa đơn
// ============================================================
export const invoiceAPI = {
  ...createCrudAPI('invoices', ['invoiceNumber', 'customerName', 'movieTitle'], ['paymentStatus', 'paymentMethod']),

  getAll: async (params = {}) => {
    await delay();
    let data = clone(store.invoices);
    const { search, sortBy, sortOrder, page, limit, paymentStatus, paymentMethod, fromDate, toDate } = params;

    // Tìm kiếm
    if (search) {
      data = data.filter((item) =>
        searchInFields(item, search, ['invoiceNumber', 'customerName', 'movieTitle', 'seats'])
      );
    }

    // Lọc theo trạng thái
    if (paymentStatus && paymentStatus !== 'all') {
      data = data.filter((inv) => inv.paymentStatus === paymentStatus);
    }
    if (paymentMethod && paymentMethod !== 'all') {
      data = data.filter((inv) => inv.paymentMethod === paymentMethod);
    }

    // Lọc theo ngày
    if (fromDate) {
      data = data.filter((inv) => inv.showDate >= fromDate);
    }
    if (toDate) {
      data = data.filter((inv) => inv.showDate <= toDate);
    }

    // Sắp xếp
    data = sortData(data, sortBy || 'id', sortOrder || 'desc');

    // Phân trang
    if (page) {
      const result = paginate(data, Number(page), Number(limit) || 10);
      return response(result.data, 'Thành công', result.pagination);
    }

    return response(data);
  },

  getByBooking: async (bookingId) => {
    await delay();
    const invoice = store.invoices.find((inv) => inv.bookingId === Number(bookingId));
    if (!invoice) errorResponse('Không tìm thấy hóa đơn', 404);
    return response(clone(invoice));
  },

  exportPdf: async (id) => {
    await delay(500);
    const invoice = store.invoices.find((inv) => inv.id === Number(id));
    if (!invoice) errorResponse('Không tìm thấy hóa đơn', 404);
    // Mô phỏng xuất PDF
    return response({ url: `#/invoice/${invoice.invoiceNumber}.pdf` }, 'Xuất hóa đơn thành công');
  },
};

// ============================================================
// DASHBOARD API - Thống kê tổng quan
// ============================================================
export const dashboardAPI = {
  getStats: async () => {
    await delay();

    const todayStr = new Date().toISOString().split('T')[0];

    const paidInvoices = store.invoices.filter((i) => i.paymentStatus === 'paid');
    const totalRevenue = paidInvoices.reduce((sum, i) => sum + i.total, 0);

    const todayInvoices = paidInvoices.filter((i) => i.showDate === todayStr);
    const todayRevenue = todayInvoices.reduce((sum, i) => sum + i.total, 0);

    const todayBookings = store.bookings.filter(
      (b) => b.paymentStatus === 'paid' && store.showtimes.find((s) => s.id === b.showtimeId)?.date === todayStr
    );

    const todayShowtimes = store.showtimes.filter((s) => s.date === todayStr && s.status === 'active');

    return response({
      totalRevenue,
      totalTickets: store.bookings.filter((b) => b.paymentStatus === 'paid').length,
      totalMembers: store.members.length,
      todayRevenue,
      todayTickets: todayBookings.length,
      showingMovies: store.movies.filter((m) => m.status === 'showing').length,
      todayShowtimes: todayShowtimes.length,
      activePromotions: store.promotions.filter((p) => p.status === 'active').length,
    });
  },

  getRevenue: async (fromDate, toDate) => {
    await delay();

    const paidInvoices = store.invoices.filter(
      (i) => i.paymentStatus === 'paid' && i.showDate >= fromDate && i.showDate <= toDate
    );

    // Gom theo ngày
    const revenueByDate = {};
    paidInvoices.forEach((inv) => {
      if (!revenueByDate[inv.showDate]) {
        revenueByDate[inv.showDate] = { date: inv.showDate, revenue: 0, tickets: 0 };
      }
      revenueByDate[inv.showDate].revenue += inv.total;
      revenueByDate[inv.showDate].tickets += 1;
    });

    const result = Object.values(revenueByDate).sort((a, b) => a.date.localeCompare(b.date));
    return response(result);
  },

  getRevenueByMovie: async () => {
    await delay();

    const paidInvoices = store.invoices.filter((i) => i.paymentStatus === 'paid');
    const revenueByMovie = {};

    paidInvoices.forEach((inv) => {
      const title = inv.movieTitle || 'Không xác định';
      if (!revenueByMovie[title]) {
        revenueByMovie[title] = { movieTitle: title, revenue: 0, tickets: 0 };
      }
      revenueByMovie[title].revenue += inv.total;
      revenueByMovie[title].tickets += 1;
    });

    const result = Object.values(revenueByMovie).sort((a, b) => b.revenue - a.revenue);
    return response(result);
  },

  getRevenueByPaymentMethod: async () => {
    await delay();

    const paidInvoices = store.invoices.filter((i) => i.paymentStatus === 'paid');
    const methodLabels = {
      cash: 'Tiền mặt',
      card: 'Thẻ ngân hàng',
      momo: 'MoMo',
      zalopay: 'ZaloPay',
    };

    const byMethod = {};
    paidInvoices.forEach((inv) => {
      const method = inv.paymentMethod;
      if (!byMethod[method]) {
        byMethod[method] = { method, label: methodLabels[method] || method, revenue: 0, count: 0 };
      }
      byMethod[method].revenue += inv.total;
      byMethod[method].count += 1;
    });

    return response(Object.values(byMethod));
  },

  getMemberStats: async () => {
    await delay();

    const tierCounts = { member: 0, silver: 0, gold: 0, platinum: 0 };
    store.members.forEach((m) => {
      if (tierCounts[m.tier] !== undefined) tierCounts[m.tier]++;
    });

    return response({
      total: store.members.length,
      active: store.members.filter((m) => m.status === 'active').length,
      inactive: store.members.filter((m) => m.status === 'inactive').length,
      byTier: tierCounts,
    });
  },

  getTopMovies: async (limit = 5) => {
    await delay();

    const paidInvoices = store.invoices.filter((i) => i.paymentStatus === 'paid');
    const movieStats = {};

    paidInvoices.forEach((inv) => {
      const title = inv.movieTitle || 'Không xác định';
      if (!movieStats[title]) {
        movieStats[title] = { movieTitle: title, revenue: 0, tickets: 0 };
      }
      movieStats[title].revenue += inv.total;
      movieStats[title].tickets += 1;
    });

    const result = Object.values(movieStats)
      .sort((a, b) => b.revenue - a.revenue)
      .slice(0, limit);

    return response(result);
  },

  getOccupancyRate: async () => {
    await delay();

    const todayStr = new Date().toISOString().split('T')[0];
    const todayShowtimes = store.showtimes.filter((s) => s.date === todayStr && s.status === 'active');

    const occupancyData = todayShowtimes.map((st) => {
      const room = store.rooms.find((r) => r.id === st.roomId);
      const movie = store.movies.find((m) => m.id === st.movieId);
      const bookedSeats = store.bookings
        .filter((b) => b.showtimeId === st.id && b.paymentStatus !== 'cancelled')
        .reduce((sum, b) => sum + b.seats.length, 0);

      const totalSeats = room ? room.totalSeats : 120;
      const rate = Math.round((bookedSeats / totalSeats) * 100);

      return {
        showtimeId: st.id,
        movieTitle: movie ? movie.title : '',
        roomName: room ? room.name : '',
        startTime: st.startTime,
        bookedSeats,
        totalSeats,
        occupancyRate: rate,
      };
    });

    return response(occupancyData);
  },
};

// ============================================================
// RESET STORE - Khôi phục dữ liệu ban đầu
// ============================================================
export const resetStore = () => {
  store = {
    movies: clone(movies),
    genres: clone(genres),
    rooms: clone(rooms),
    seats: clone(seats),
    showtimes: clone(showtimes),
    combos: clone(combos),
    promotions: clone(promotions),
    members: clone(members),
    staff: clone(staffList),
    sliders: clone(sliders),
    bookings: clone(bookings),
    invoices: clone(invoices),
  };
};
