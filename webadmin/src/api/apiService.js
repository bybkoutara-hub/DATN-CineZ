import axios from 'axios';

const BASE_URL = 'http://localhost:5000/api/admin';

const apiClient = axios.create({
  baseURL: BASE_URL,
  headers: { 'Content-Type': 'application/json' },
});

apiClient.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

const formatResponse = (data, message = 'Thành công') => ({
  success: true, data, message,
});

export const movieAPI = {
  getAll: async (params) => {
    const response = await apiClient.get('/movies', { params });
    return formatResponse(response.data);
  },
  getById: async (id) => {
    const response = await apiClient.get(`/movies/${id}`);
    return formatResponse(response.data);
  },
  create: async (movieData) => {
    const response = await apiClient.post('/movies', movieData);
    return formatResponse(response.data.data || response.data, response.data.message);
  },
  update: async (id, movieData) => {
    const response = await apiClient.put(`/movies/${id}`, movieData);
    return formatResponse(response.data.data || response.data, response.data.message);
  },
  delete: async (id) => {
    const response = await apiClient.delete(`/movies/${id}`);
    return formatResponse(null, response.data.message);
  },
};

export const showtimeAPI = {
  getAll: async (params) => {
    const response = await apiClient.get('/showtimes', { params });
    return formatResponse(response.data);
  },
  getById: async (id) => {
    const response = await apiClient.get(`/showtimes/${id}`);
    return formatResponse(response.data);
  },
  create: async (data) => {
    const response = await apiClient.post('/showtimes', data);
    return formatResponse(response.data.data || response.data, response.data.message);
  },
  update: async (id, data) => {
    const response = await apiClient.put(`/showtimes/${id}`, data);
    return formatResponse(response.data.data || response.data, response.data.message);
  },
  delete: async (id) => {
    const response = await apiClient.delete(`/showtimes/${id}`);
    return formatResponse(null, response.data.message);
  },
  getBookedSeats: async (id) => {
    const response = await apiClient.get(`/showtimes/${id}/booked-seats`);
    return response.data;
  },
};

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
    try {
      const response = await apiClient.get('/auth/profile');
      return response.data;
    } catch {
      const userSession = JSON.parse(localStorage.getItem('user'));
      if (!userSession) return { success: false, message: 'Chưa đăng nhập' };
      return { success: true, data: userSession };
    }
  },
  updateProfile: async (data) => {
    const response = await apiClient.put('/auth/profile', data);
    return response.data;
  },
  changePassword: async (oldPassword, newPassword) => {
    const response = await apiClient.put('/auth/change-password', { oldPassword, newPassword });
    return response.data;
  },
  register: async (data) => {
    const response = await apiClient.post('/auth/register', data);
    return response.data;
  },
};

export const genreAPI = {
  getAll: async () => {
    const response = await apiClient.get('/genres');
    return formatResponse(response.data);
  },
  getById: async (id) => {
    const response = await apiClient.get(`/genres/${id}`);
    return formatResponse(response.data);
  },
  create: async (data) => {
    const response = await apiClient.post('/genres', data);
    return formatResponse(response.data.data || response.data, response.data.message || 'Thêm thể loại thành công');
  },
  update: async (id, data) => {
    const response = await apiClient.put(`/genres/${id}`, data);
    return formatResponse(response.data.data || response.data, response.data.message || 'Cập nhật thể loại thành công');
  },
  delete: async (id) => {
    const response = await apiClient.delete(`/genres/${id}`);
    return formatResponse(null, response.data.message || 'Xóa thể loại thành công');
  },
};

export const roomAPI = {
  getAll: async () => {
    const response = await apiClient.get('/rooms');
    return formatResponse(response.data);
  },
  getById: async (id) => {
    const response = await apiClient.get(`/rooms/${id}`);
    return formatResponse(response.data);
  },
  create: async (data) => {
    const response = await apiClient.post('/rooms', data);
    return formatResponse(response.data.data || response.data, response.data.message);
  },
  update: async (id, data) => {
    const response = await apiClient.put(`/rooms/${id}`, data);
    return formatResponse(response.data.data || response.data, response.data.message);
  },
  delete: async (id) => {
    const response = await apiClient.delete(`/rooms/${id}`);
    return formatResponse(null, response.data.message);
  },
};

export const seatAPI = {
  getAll: async (params) => {
    const response = await apiClient.get('/seats', { params });
    return formatResponse(response.data);
  },
  getByRoom: async (roomId) => {
    const response = await apiClient.get(`/seats/room/${roomId}`);
    return formatResponse(response.data);
  },
  bulkCreate: async (roomId, seats) => {
    const response = await apiClient.post('/seats/bulk', { room: roomId, seats });
    return formatResponse(response.data.data || response.data, response.data.message);
  },
  update: async (id, data) => {
    const response = await apiClient.put(`/seats/${id}`, data);
    return formatResponse(response.data.data || response.data, response.data.message);
  },
  remove: async (id) => {
    const response = await apiClient.delete(`/seats/${id}`);
    return formatResponse(null, response.data.message);
  },
};

export const comboAPI = {
  getAll: async () => {
    const response = await apiClient.get('/combos');
    return formatResponse(response.data);
  },
  getById: async (id) => {
    const response = await apiClient.get(`/combos/${id}`);
    return formatResponse(response.data);
  },
  create: async (data) => {
    const response = await apiClient.post('/combos', data);
    return formatResponse(response.data.data || response.data, response.data.message || 'Thêm combo thành công');
  },
  update: async (id, data) => {
    const response = await apiClient.put(`/combos/${id}`, data);
    return formatResponse(response.data.data || response.data, response.data.message || 'Cập nhật combo thành công');
  },
  delete: async (id) => {
    const response = await apiClient.delete(`/combos/${id}`);
    return formatResponse(null, response.data.message || 'Xóa combo thành công');
  },
};

export const promotionAPI = {
  getAll: async (params) => {
    const response = await apiClient.get('/promotions', { params });
    return formatResponse(response.data);
  },
  getById: async (id) => {
    const response = await apiClient.get(`/promotions/${id}`);
    return formatResponse(response.data);
  },
  create: async (data) => {
    const response = await apiClient.post('/promotions', data);
    return formatResponse(response.data.data || response.data, response.data.message);
  },
  update: async (id, data) => {
    const response = await apiClient.put(`/promotions/${id}`, data);
    return formatResponse(response.data.data || response.data, response.data.message);
  },
  delete: async (id) => {
    const response = await apiClient.delete(`/promotions/${id}`);
    return formatResponse(null, response.data.message);
  },
  validate: async (code, orderValue) => {
    const response = await apiClient.post('/promotions/validate', { code, orderValue });
    return response.data;
  },
};

export const memberAPI = {
  getAll: async (params) => {
    const response = await apiClient.get('/members', { params });
    return formatResponse(response.data);
  },
  getById: async (id) => {
    const response = await apiClient.get(`/members/${id}`);
    return formatResponse(response.data);
  },
  update: async (id, data) => {
    const response = await apiClient.put(`/members/${id}`, data);
    return formatResponse(response.data.data || response.data, response.data.message);
  },
  getBookings: async (id) => {
    const response = await apiClient.get(`/members/${id}/bookings`);
    return formatResponse(response.data);
  },
};

export const staffAPI = {
  getAll: async (params) => {
    const response = await apiClient.get('/staff', { params });
    return formatResponse(response.data);
  },
  getById: async (id) => {
    const response = await apiClient.get(`/staff/${id}`);
    return formatResponse(response.data);
  },
  create: async (data) => {
    const response = await apiClient.post('/staff', data);
    return formatResponse(response.data.data || response.data, response.data.message);
  },
  update: async (id, data) => {
    const response = await apiClient.put(`/staff/${id}`, data);
    return formatResponse(response.data.data || response.data, response.data.message);
  },
  delete: async (id) => {
    const response = await apiClient.delete(`/staff/${id}`);
    return formatResponse(null, response.data.message);
  },
};

export const sliderAPI = {
  getAll: async (params) => {
    const response = await apiClient.get('/sliders', { params });
    return formatResponse(response.data);
  },
  getById: async (id) => {
    const response = await apiClient.get(`/sliders/${id}`);
    return formatResponse(response.data);
  },
  create: async (data) => {
    const response = await apiClient.post('/sliders', data);
    return formatResponse(response.data.data || response.data, response.data.message);
  },
  update: async (id, data) => {
    const response = await apiClient.put(`/sliders/${id}`, data);
    return formatResponse(response.data.data || response.data, response.data.message);
  },
  delete: async (id) => {
    const response = await apiClient.delete(`/sliders/${id}`);
    return formatResponse(null, response.data.message);
  },
  reorder: async (items) => {
    const response = await apiClient.put('/sliders/reorder', { items });
    return formatResponse(null, response.data.message);
  },
};

export const bookingAPI = {
  getAll: async (params) => {
    const response = await apiClient.get('/bookings', { params });
    return formatResponse(response.data);
  },
  getById: async (id) => {
    const response = await apiClient.get(`/bookings/${id}`);
    return formatResponse(response.data);
  },
  update: async (id, data) => {
    const response = await apiClient.put(`/bookings/${id}`, data);
    return formatResponse(response.data.data || response.data, response.data.message);
  },
  cancel: async (id) => {
    const response = await apiClient.put(`/bookings/${id}/cancel`);
    return formatResponse(response.data.data || response.data, response.data.message);
  },
};

export const invoiceAPI = {
  getAll: async (params) => {
    const response = await apiClient.get('/invoices', { params });
    return formatResponse(response.data);
  },
  getById: async (id) => {
    const response = await apiClient.get(`/invoices/${id}`);
    return formatResponse(response.data);
  },
  create: async (data) => {
    const response = await apiClient.post('/invoices', data);
    return formatResponse(response.data.data || response.data, response.data.message);
  },
  update: async (id, data) => {
    const response = await apiClient.put(`/invoices/${id}`, data);
    return formatResponse(response.data.data || response.data, response.data.message);
  },
  getByBooking: async (bookingId) => {
    const response = await apiClient.get(`/invoices/booking/${bookingId}`);
    return formatResponse(response.data);
  },
};

export const dashboardAPI = {
  getStats: async () => {
    const response = await apiClient.get('/dashboard/stats');
    return response.data;
  },
  getRevenue: async (params) => {
    const response = await apiClient.get('/dashboard/revenue', { params });
    return formatResponse(response.data);
  },
  getRevenueByMovie: async () => {
    const response = await apiClient.get('/dashboard/revenue-by-movie');
    return formatResponse(response.data);
  },
  getTopMovies: async (limit) => {
    const response = await apiClient.get('/dashboard/top-movies', { params: { limit } });
    return formatResponse(response.data);
  },
};

export const resetStore = () => {};
