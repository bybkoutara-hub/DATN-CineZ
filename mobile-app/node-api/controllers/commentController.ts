import { type Request, type Response } from 'express';
import CommentModel from '../models/commentModel.js';

// [GET] /api/comments/:movieId - Lấy danh sách bình luận của 1 phim
export const getMovieComments = async (req: Request, res: Response) => {
  try {
    const { movieId } = req.params;
    
    // Tắt kiểm tra lỗi của TypeScript cho dòng Mongoose này
    // @ts-ignore
    const comments = await CommentModel.find({ movieId })
      .populate('userId' as any, 'fullName email')
      .sort({ createdAt: -1 });

    res.status(200).json({ success: true, comments });
  } catch (error: any) {
    res.status(500).json({ success: false, message: 'Lỗi server khi lấy bình luận', error });
  }
};
// [DELETE] /api/comments/:commentId - Xóa bình luận
export const deleteComment = async (req: Request | any, res: Response) => {
  try {
    const { commentId } = req.params;
    const userId = req.user.id; // Lấy ID người dùng từ Token đã xác thực

    const comment = await CommentModel.findById(commentId);

    if (!comment) {
      return res.status(404).json({ success: false, message: 'Không tìm thấy bình luận' });
    }

    // Kiểm tra xem người xóa có phải là chủ nhân bình luận không
    if (comment.userId.toString() !== userId) {
      return res.status(403).json({ success: false, message: 'Bạn không có quyền xóa bình luận này' });
    }

    await CommentModel.findByIdAndDelete(commentId);
    res.status(200).json({ success: true, message: 'Đã xóa bình luận' });
  } catch (error: any) {
    res.status(500).json({ success: false, message: 'Lỗi server khi xóa', error });
  }
};

// [POST] /api/comments - Thêm bình luận mới (YÊU CẦU ĐĂNG NHẬP)
export const addComment = async (req: Request | any, res: Response) => {
  try {
    const { movieId, content, rating } = req.body;
    
    const userId = req.user.id; 

    if (!content) {
      return res.status(400).json({ success: false, message: 'Nội dung bình luận không được để trống' });
    }

    const newComment = new CommentModel({
      movieId,
      userId,
      content,
      rating: rating || 5 
    });

    await newComment.save();

    // Tắt kiểm tra lỗi của TypeScript
    // @ts-ignore
    const populatedComment = await CommentModel.findById(newComment._id).populate('userId' as any, 'fullName email');

    res.status(201).json({ success: true, message: 'Đã gửi bình luận', comment: populatedComment });
  } catch (error: any) { // Đã thêm ": any" vào đây để sửa lỗi báo đỏ biến error
    res.status(500).json({ success: false, message: 'Lỗi server khi đăng bình luận', error });
  }
  
};