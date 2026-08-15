import axios from "axios";
import { Alert } from "react-native/Libraries/Alert/Alert";

// Đảm bảo dùng IP máy ảo Android Studio (10.0.2.2) mà bạn đã cấu hình thành công trước đó
const BASE_URL = "http://10.0.2.2:5001/api/comments";

// Hàm lấy danh sách bình luận (Mở cửa tự do)
export const fetchMovieComments = async (movieId: string) => {
  try {
    const response = await axios.get(`${BASE_URL}/${movieId}`);
    return response.data;
  } catch (error) {
    console.error("Lỗi lấy bình luận:", error);
    throw error;
  }
};
// Trong file commentService.ts, hãy chắc chắn có đoạn này:
export const deleteCommentService = async (commentId: string, token: string) => {
  try {
    const response = await axios.delete(`${BASE_URL}/${commentId}`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    return response.data;
  } catch (error) {
    console.error("Lỗi khi xóa bình luận:", error);
    throw error;
  }
};

// Hàm đăng bình luận (Bắt buộc mang theo Token)
export const sendComment = async (movieId: string, content: string, token: string) => {
  try {
    const response = await axios.post(
      BASE_URL,
      { movieId, content, rating: 5 }, // Tạm thời set mặc định 5 sao
      {
        headers: {
          Authorization: `Bearer ${token}`, // Gắn "chìa khóa" đi qua trạm kiểm soát
        },
      }
    );
    return response.data;
  } catch (error) {
    console.error("Lỗi đăng bình luận:", error);
    throw error;
  }
  
};