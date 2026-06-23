// ============================================================
// CineZ Admin Dashboard - API Service (REAL API CONNECTION)
// Kết nối trực tiếp tới NodeJS Backend Server (Port 5001)
// ============================================================

import axios from 'axios';

const apiClient = axios.create({
  baseURL: 'http://localhost:5001/api/admin',
  headers: {
    'Content-Type': 'application/json',
  },
});

const formatResponse = (data, message = 'Thành công') => ({
  success: true,
  data,
  message,
});

// ============================================================
// REAL CONTROLLERS CONNECTION
// ============================================================

// Quản lý Phim
export const movieAPI = {
  getAll: async () => {
    const response = await apiClient.get('/movies');
    return formatResponse(response.data);
  },
  getById: async (id) => {
    const response = await apiClient.get(`/movies/${id}`);
    return formatResponse(response.data);
  },
  create: async (movieData) => {
    const response = await apiClient.post('/movies', movieData);
    return formatResponse(response.data.data, response.data.message);
  },
  update: async (id, movieData) => {
    const response = await apiClient.put(`/movies/${id}`, movieData);
    return formatResponse(response.data.data, response.data.message);
  },
  delete: async (id) => {
    const response = await apiClient.delete(`/movies/${id}`);
    return formatResponse(null, response.data.message);
  },
};

// Quản lý Suất chiếu
export const showtimeAPI = {
  getAll: async () => {
    const response = await apiClient.get('/showtimes');
    return formatResponse(response.data);
  },
  create: async (showtimeData) => {
    const response = await apiClient.post('/showtimes', showtimeData);
    return formatResponse(response.data.data, response.data.message);
  },
  delete: async (id) => {
    const response = await apiClient.delete(`/showtimes/${id}`);
    return formatResponse(null, response.data.message);
  },
};

// Hệ thống Xác thực Tài khoản Admin/Nhân viên
export const authAPI = {
  login: async (username, password) => {
    try {
      const response = await apiClient.post('/auth/login', { username, password });
      if (response.data && response.data.success) {
        localStorage.setItem('token', response.data.data.token);
        localStorage.setItem('user', JSON.stringify(response.data.data.user));
      }
      return response.data; 
    } catch (error) {
      const message = error.response?.data?.message || 'Tên đăng nhập hoặc mật khẩu không đúng';
      const err = new Error(message);
      err.success = false;
      throw err;
    }
  },
  logout: async () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    return { success: true, message: 'Đăng xuất thành công' };
  },
  getProfile: async () => {
    const userSession = JSON.parse(localStorage.getItem('user'));
    if (!userSession) return { success: false, message: 'Chưa đăng nhập' };
    return { success: true, data: userSession };
  },
  updateProfile: async (data) => formatResponse(data, 'Cập nhật thông tin thành công'),
  changePassword: async (username, oldPassword, newPassword) => {
    const response = await apiClient.put('/auth/change-password', { username, oldPassword, newPassword });
    return response.data;
  }
};

// Quản lý Thể loại phim
export const genreAPI = { 
  getAll: async () => {
    const response = await apiClient.get('/genres');
    return formatResponse(response.data);
  },
  create: async (genreData) => {
    const response = await apiClient.post('/genres', genreData);
    return formatResponse(response.data, 'Thêm thể loại thành công');
  },
  update: async (id, genreData) => {
    const response = await apiClient.put(`/genres/${id}`, genreData);
    return formatResponse(response.data, 'Cập nhật thể loại thành công');
  },
  delete: async (id) => {
    const response = await apiClient.delete(`/genres/${id}`);
    return formatResponse(null, 'Xóa thể loại thành công');
  }
};

// Quản lý Phòng chiếu & Sơ đồ ghế ngồi
export const roomAPI = { 
  getAll: async () => {
    const response = await apiClient.get('/rooms');
    return formatResponse(response.data);
  },
  getSeats: async (roomId) => {
    const response = await apiClient.get(`/rooms/${roomId}/seats`);
    return formatResponse(response.data);
  } 
};
export const seatAPI = { 
  getByRoom: async (roomId) => {
    const response = await apiClient.get(`/rooms/${roomId}/seats`);
    return formatResponse(response.data);
  } 
};

// Quản lý Combo bắp nước
export const comboAPI = { 
  getAll: async () => {
    const response = await apiClient.get('/combos');
    return formatResponse(response.data);
  },
  create: async (data) => {
    const response = await apiClient.post('/combos', data);
    return formatResponse(response.data, 'Thêm combo thành công');
  },
  update: async (id, data) => {
    const response = await apiClient.put(`/combos/${id}`, data);
    return formatResponse(response.data, 'Cập nhật combo thành công');
  },
  delete: async (id) => {
    const response = await apiClient.delete(`/combos/${id}`);
    return formatResponse(null, 'Xóa combo thành công');
  }
};

// Quản lý Mã Khuyến mãi
export const promotionAPI = { 
  getAll: async () => {
    const response = await apiClient.get('/promotions');
    return formatResponse(response.data);
  },
  create: async (data) => {
    const response = await apiClient.post('/promotions', data);
    return formatResponse(response.data, 'Thêm mã khuyến mãi thành công');
  },
  update: async (id, data) => {
    const response = await apiClient.put(`/promotions/${id}`, data);
    return formatResponse(response.data, 'Cập nhật mã thành công');
  },
  delete: async (id) => {
    await apiClient.delete(`/promotions/${id}`);
    return formatResponse(null, 'Xóa mã thành công');
  }
};

// Quản lý Thành viên (Khách hàng)
export const memberAPI = { 
  getAll: async () => {
    const response = await apiClient.get('/members');
    return formatResponse(response.data);
  } 
};

// Quản lý Nhân viên
export const staffAPI = { 
  getAll: async () => {
    const response = await apiClient.get('/staffs');
    return formatResponse(response.data);
  },
  create: async (data) => {
    const response = await apiClient.post('/staffs', data);
    return formatResponse(response.data, 'Thêm nhân viên thành công');
  },
  update: async (id, data) => {
    const response = await apiClient.put(`/staffs/${id}`, data);
    return formatResponse(response.data, 'Cập nhật thông tin nhân viên thành công');
  },
  delete: async (id) => {
    const response = await apiClient.delete(`/staffs/${id}`);
    return formatResponse(null, 'Xóa nhân viên thành công');
  }
};

// Quản lý Sliders/Banners
export const sliderAPI = { 
  getAll: async () => {
    const response = await apiClient.get('/sliders');
    return formatResponse(response.data);
  },
  create: async (data) => {
    const response = await apiClient.post('/sliders', data);
    return formatResponse(response.data, 'Thêm banner thành công');
  },
  update: async (id, data) => {
    const response = await apiClient.put(`/sliders/${id}`, data);
    return formatResponse(response.data, 'Cập nhật banner thành công');
  },
  delete: async (id) => {
    await apiClient.delete(`/sliders/${id}`);
    return formatResponse(null, 'Xóa banner thành công');
  }
};

// Quản lý Đặt vé & Hóa đơn
export const bookingAPI = { 
  getAll: async () => {
    const response = await apiClient.get('/bookings');
    return formatResponse(response.data);
  },
  updateStatus: async (id, paymentStatus) => {
    const response = await apiClient.put(`/bookings/${id}/status`, { paymentStatus });
    return formatResponse(response.data.data, response.data.message);
  }
};
export const invoiceAPI = { 
  getAll: async () => {
    const response = await apiClient.get('/bookings'); 
    return formatResponse(response.data);
  },
  updateStatus: async (id, paymentStatus) => {
    const response = await apiClient.put(`/bookings/${id}/status`, { paymentStatus });
    return formatResponse(response.data.data, response.data.message);
  }
};

// Thống kê biểu đồ Dashboard chính thức
export const dashboardAPI = { 
  getStats: async () => {
    const response = await apiClient.get('/dashboard/stats');
    return formatResponse(response.data.data); 
  } 
};

export const resetStore = () => {};