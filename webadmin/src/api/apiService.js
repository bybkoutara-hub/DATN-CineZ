// ============================================================
// CineZ Admin Dashboard - API Service (REAL API CONNECTION)
// Kết nối trực tiếp tới NodeJS Backend Server (Port 5001)
// ============================================================

import axios from 'axios';

// 1. Cấu hình cấu trúc Base URL trỏ về Server NodeJS Backend của bạn
const BASE_URL = 'http://localhost:5001/api/admin';

const apiClient = axios.create({
  baseURL: 'http://localhost:5001/api/admin',
  headers: {
    'Content-Type': 'application/json',
  },
});

// Helper định dạng phản hồi để giữ nguyên cấu trúc mong muốn của giao diện Frontend
const formatResponse = (data, message = 'Thành công') => ({
  success: true,
  data,
  message,
});

// ============================================================
// MOVIE API - Kết nối API Quản lý phim thật
// ============================================================
export const movieAPI = {
  // Lấy toàn bộ danh sách phim từ MongoDB đổ lên Table dữ liệu của Danh + Đại
  getAll: async () => {
    const response = await apiClient.get('/movies');
    return formatResponse(response.data);
  },

  // Xem chi tiết 1 bộ phim theo ID
  getById: async (id) => {
    const response = await apiClient.get(`/movies/${id}`);
    return formatResponse(response.data);
  },

  // Thêm phim mới thông qua Form biểu mẫu nhập liệu
  create: async (movieData) => {
    const response = await apiClient.post('/movies', movieData);
    return formatResponse(response.data.data, response.data.message);
  },

  // Cập nhật, sửa đổi thông tin phim theo ID
  update: async (id, movieData) => {
    const response = await apiClient.put(`/movies/${id}`, movieData);
    return formatResponse(response.data.data, response.data.message);
  },

  // Xóa phim ra khỏi hệ thống cơ sở dữ liệu
  delete: async (id) => {
    const response = await apiClient.delete(`/movies/${id}`);
    return formatResponse(null, response.data.message);
  },
};

// ============================================================
// SHOWTIME API - Kết nối API Quản lý suất chiếu thật
// ============================================================
export const showtimeAPI = {
  // Lấy toàn bộ suất chiếu (Đã được populate đầy đủ thông tin phim từ backend)
  getAll: async () => {
    const response = await apiClient.get('/showtimes');
    return formatResponse(response.data);
  },

  // Tạo suất chiếu mới cho phim
  create: async (showtimeData) => {
    const response = await apiClient.post('/showtimes', showtimeData);
    return formatResponse(response.data.data, response.data.message);
  },

  // Xóa một suất chiếu theo ID
  delete: async (id) => {
    const response = await apiClient.delete(`/showtimes/${id}`);
    return formatResponse(null, response.data.message);
  },
};

// ============================================================
// MOCK APIS (Giữ tạm để giao diện không bị crash các tính năng chưa code xong)
// ============================================================

// ============================================================
// REAL AUTH API - Kết nối dữ liệu tài khoản thật từ MongoDB
// ============================================================
export const authAPI = {
  // Gắn hàm này vào Form Đăng nhập ở giao diện Web
  login: async (username, password) => {
    try {
      const response = await apiClient.post('/auth/login', { username, password });
      
      // Nếu đăng nhập thành công, lưu thông tin phiên làm việc vào localStorage
      if (response.data && response.data.success) {
        localStorage.setItem('token', response.data.data.token);
        localStorage.setItem('user', JSON.stringify(response.data.data.user));
      }
      return response.data; 
    } catch (error) {
      // Trả lỗi từ hệ thống backend về để giao diện hiển thị thông báo alert
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
    // Trả thông tin hiển thị lên góc avatar admin màn hình chính từ session đã lưu
    const userSession = JSON.parse(localStorage.getItem('user'));
    if (!userSession) {
      return { success: false, message: 'Chưa đăng nhập' };
    }
    return { success: true, data: userSession };
  },

  updateProfile: async (data) => {
    // Tạm thời giữ nguyên mock phục vụ đồ án cơ bản
    return { success: true, message: 'Cập nhật thông tin thành công' };
  },

  changePassword: async (oldPassword, newPassword) => {
    // Tạm thời giữ nguyên mock phục vụ đồ án cơ bản
    return { success: true, message: 'Đổi mật khẩu thành công' };
  },
};

// Kết nối trang Quản lý thể loại phim
export const genreAPI = { 
  getAll: async () => {
    const response = await apiClient.get('/genres');
    return formatResponse(response.data);
  },

  create: async (genreData) => {
    const response = await apiClient.post('/genres', genreData);
    return formatResponse(response.data.data || response.data, response.data.message || 'Thêm thể loại thành công');
  },

  update: async (id, genreData) => {
    const response = await apiClient.put(`/genres/${id}`, genreData);
    return formatResponse(response.data.data || response.data, response.data.message || 'Cập nhật thể loại thành công');
  },

  delete: async (id) => {
    const response = await apiClient.delete(`/genres/${id}`);
    return formatResponse(null, response.data.message || 'Xóa thể loại thành công');
  }
};

// Kết nối trang Quản lý phòng chiếu
export const roomAPI = { 
  getAll: async () => {
    const response = await apiClient.get('/rooms');
    return formatResponse(response.data);
  },
  getSeats: async () => formatResponse([]) 
};

export const seatAPI = { getByRoom: async () => formatResponse([]) };

// Kết nối trang Quản lý Combo bắp nước
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

// Kết nối mã khuyến mãi
export const promotionAPI = { getAll: async () => formatResponse([]) };

// Kết nối trang Quản lý thành viên (Khách hàng)
export const memberAPI = { 
  getAll: async () => {
    const response = await apiClient.get('/members');
    return formatResponse(response.data);
  } 
};

export const staffAPI = { getAll: async () => formatResponse([]) };
export const sliderAPI = { getAll: async () => formatResponse([]) };
export const bookingAPI = { getAll: async () => formatResponse([]) };
export const invoiceAPI = { getAll: async () => formatResponse([]) };

// Kết nối trang chủ Dashboard để vẽ biểu đồ doanh thu thật
export const dashboardAPI = { 
  getStats: async () => {
    const response = await apiClient.get('/dashboard/stats');
    // Vì backend của bạn trả về { success: true, data: { ... } }
    // nên ở đây lấy đúng trường .data từ server trả về
    return formatResponse(response.data.data); 
  } 
};

export const resetStore = () => {};