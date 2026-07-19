import express from 'express';
import { getMovieComments, addComment, deleteComment } from '../controllers/commentController.js';
import { verifyToken } from '../middlewares/authMiddleware.js'; // Đã sửa thành verifyToken cho khớp với file của bạn

const router = express.Router();

// Route 1: Lấy bình luận -> Mở cửa tự do
router.get('/:movieId', getMovieComments);

// Route 2: Đăng bình luận -> Phải đi qua trạm kiểm soát "verifyToken"
router.post('/', verifyToken, addComment);

// Route 3: Xóa bình luận (Yêu cầu đăng nhập và đi qua trạm kiểm soát)
router.delete('/:commentId', verifyToken, deleteComment);

export default router;