import React, { useState, useEffect } from 'react';
import { FiTrash2, FiSearch, FiMessageSquare, FiStar, FiAlertCircle, FiCheckCircle, FiLoader, FiChevronLeft, FiChevronRight } from 'react-icons/fi';
import { reviewAPI } from '../api/apiService';
import './Reviews.css';

const Reviews = () => {
  const [reviews, setReviews] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [pagination, setPagination] = useState({ page: 1, limit: 20, total: 0, pages: 0 });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  useEffect(() => {
    fetchReviews();
  }, [pagination.page]);

  useEffect(() => {
    if (successMessage) {
      const timer = setTimeout(() => setSuccessMessage(''), 3000);
      return () => clearTimeout(timer);
    }
  }, [successMessage]);

  useEffect(() => {
    if (error) {
      const timer = setTimeout(() => setError(''), 3000);
      return () => clearTimeout(timer);
    }
  }, [error]);

  const fetchReviews = async () => {
    setLoading(true);
    setError('');
    try {
      const result = await reviewAPI.getAll({ page: pagination.page, limit: pagination.limit });
      if (result.success && Array.isArray(result.data)) {
        setReviews(result.data);
        if (result.pagination) setPagination(prev => ({ ...prev, ...result.pagination }));
      } else {
        setReviews(result.data || []);
      }
    } catch (err) {
      const errorMsg = err?.response?.data?.message || err?.message || 'Không thể tải danh sách bình luận';
      setError(errorMsg);
      console.error('Error fetching reviews:', err);
    } finally {
      setLoading(false);
    }
  };

  const filteredReviews = reviews.filter(r =>
    r.comment?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    r.movie?.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    r.user?.fullName?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleDelete = async (id) => {
    if (window.confirm('Bạn có chắc chắn muốn xóa bình luận này?')) {
      setError('');
      try {
        await reviewAPI.delete(id);
        setReviews(reviews.filter(r => (r._id || r.id) !== id));
        setSuccessMessage('Xóa bình luận thành công');
      } catch (err) {
        const errorMsg = err?.response?.data?.message || err?.message || 'Lỗi khi xóa bình luận';
        setError(errorMsg);
        console.error('Error deleting review:', err);
      }
    }
  };

  const renderStars = (rating) => {
    const stars = [];
    for (let i = 1; i <= 5; i++) {
      stars.push(
        <FiStar
          key={i}
          size={14}
          style={{ color: i <= rating ? 'var(--warning)' : 'var(--border)', fill: i <= rating ? 'var(--warning)' : 'none' }}
        />
      );
    }
    return stars;
  };

  return (
    <div className="reviews-page animate-fade-in">
      <div className="page-header">
        <h1 className="page-title"><FiMessageSquare /> Quản lý Bình luận</h1>
      </div>

      {error && (
        <div className="page-alert page-alert-error">
          <FiAlertCircle size={20} />
          <span>{error}</span>
        </div>
      )}

      {successMessage && (
        <div className="page-alert page-alert-success">
          <FiCheckCircle size={20} />
          <span>{successMessage}</span>
        </div>
      )}

      <div className="card glass">
        <div className="flex justify-between items-center mb-md">
          <div className="search-box relative" style={{ width: '350px' }}>
            <FiSearch className="absolute left-3 top-3 text-muted" />
            <input
              type="text"
              className="form-input pl-10"
              placeholder="Tìm kiếm bình luận, phim, người dùng..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <span className="text-muted text-sm">Tổng số: {pagination.total} bình luận</span>
        </div>

        {loading ? (
          <div className="table-loading">
            <FiLoader size={28} />
            <span>Đang tải dữ liệu...</span>
          </div>
        ) : (
          <>
            <div className="table-responsive">
              <table>
                <thead>
                  <tr>
                    <th style={{ width: '60px' }}>STT</th>
                    <th style={{ width: '180px' }}>Phim</th>
                    <th style={{ width: '160px' }}>Người dùng</th>
                    <th style={{ width: '100px' }}>Đánh giá</th>
                    <th>Nội dung</th>
                    <th style={{ width: '140px' }}>Ngày tạo</th>
                    <th style={{ width: '80px' }}>Thao tác</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredReviews.map((review, index) => (
                    <tr key={review._id || review.id}>
                      <td>{(pagination.page - 1) * pagination.limit + index + 1}</td>
                      <td className="font-semibold">{review.movie?.title || 'Không xác định'}</td>
                      <td>{review.user?.fullName || review.user?.name || 'Ẩn danh'}</td>
                      <td>
                        <div className="flex gap-xs" style={{ gap: '2px' }}>
                          {renderStars(review.rating)}
                        </div>
                      </td>
                      <td className="text-muted" style={{ maxWidth: '350px' }}>
                        {review.comment || '-'}
                      </td>
                      <td className="text-sm text-muted">
                        {review.createdAt ? new Date(review.createdAt).toLocaleDateString('vi-VN') : '-'}
                      </td>
                      <td>
                        <button className="btn-icon text-danger" onClick={() => handleDelete(review._id || review.id)} title="Xóa">
                          <FiTrash2 />
                        </button>
                      </td>
                    </tr>
                  ))}
                  {!loading && filteredReviews.length === 0 && (
                    <tr>
                      <td colSpan="7" className="text-center text-muted py-lg">
                        {reviews.length === 0 ? 'Chưa có bình luận nào.' : 'Không tìm thấy bình luận nào phù hợp.'}
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>

            {pagination.pages > 1 && (
              <div className="flex justify-center items-center gap-md mt-lg">
                <button
                  className="btn btn-ghost btn-sm"
                  disabled={pagination.page <= 1}
                  onClick={() => setPagination(prev => ({ ...prev, page: prev.page - 1 }))}
                >
                  <FiChevronLeft /> Trước
                </button>
                <span className="text-sm text-muted">
                  Trang {pagination.page} / {pagination.pages}
                </span>
                <button
                  className="btn btn-ghost btn-sm"
                  disabled={pagination.page >= pagination.pages}
                  onClick={() => setPagination(prev => ({ ...prev, page: prev.page + 1 }))}
                >
                  Sau <FiChevronRight />
                </button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default Reviews;