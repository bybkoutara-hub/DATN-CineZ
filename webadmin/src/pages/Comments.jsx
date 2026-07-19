import React, { useState, useEffect } from 'react';
import {
  FiTrash2, FiSearch, FiMessageSquare, FiStar, FiAlertCircle,
  FiCheckCircle, FiLoader, FiEye, FiCheck, FiEyeOff, FiXOctagon,
  FiUserX, FiUserCheck, FiFilter
} from 'react-icons/fi';
import { reviewAPI } from '../api/apiService';
import './Comments.css';

const STATUS_OPTIONS = [
  { value: '', label: 'Tất cả' },
  { value: 'pending', label: 'Chờ duyệt' },
  { value: 'approved', label: 'Đã duyệt' },
  { value: 'hidden', label: 'Đã ẩn' },
  { value: 'banned', label: 'Bị cấm' },
];

const Comments = () => {
  const [reviews, setReviews] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('');

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  useEffect(() => {
    fetchReviews();
  }, []);

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
      const result = await reviewAPI.getAll();
      if (result.success && Array.isArray(result.data)) {
        setReviews(result.data);
      } else {
        setReviews(result.data || []);
      }
    } catch (err) {
      const errorMsg = err?.response?.data?.message || err?.message || 'Không thể tải danh sách bình luận';
      setError(errorMsg);
    } finally {
      setLoading(false);
    }
  };

  const filteredReviews = reviews.filter(r => {
    const matchSearch = searchTerm
      ? (r.comment || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
        (r.user?.name || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
        (r.movie?.title || '').toLowerCase().includes(searchTerm.toLowerCase())
      : true;
    const matchStatus = statusFilter ? r.status === statusFilter : true;
    return matchSearch && matchStatus;
  });

  const handleAction = async (action, review) => {
    const id = review._id || review.id;
    setError('');
    try {
      switch (action) {
        case 'approve':
          await reviewAPI.updateStatus(id, 'approved');
          setReviews(reviews.map(r => (r._id || r.id) === id ? { ...r, status: 'approved' } : r));
          setSuccessMessage('Đã duyệt bình luận');
          break;
        case 'hide':
          await reviewAPI.updateStatus(id, 'hidden');
          setReviews(reviews.map(r => (r._id || r.id) === id ? { ...r, status: 'hidden' } : r));
          setSuccessMessage('Đã ẩn bình luận');
          break;
        case 'ban':
          if (window.confirm('Cấm bình luận này? Người dùng vẫn có thể bình luận ở phim khác.')) {
            await reviewAPI.updateStatus(id, 'banned');
            setReviews(reviews.map(r => (r._id || r.id) === id ? { ...r, status: 'banned' } : r));
            setSuccessMessage('Đã cấm bình luận');
          }
          break;
        case 'delete':
          if (window.confirm('Bạn có chắc chắn muốn xóa bình luận này?')) {
            await reviewAPI.delete(id);
            setReviews(reviews.filter(r => (r._id || r.id) !== id));
            setSuccessMessage('Đã xóa bình luận');
          }
          break;
        case 'blockUser':
          if (window.confirm(`Chặn người dùng "${review.user?.name || 'Ẩn danh'}" không cho bình luận?`)) {
            const userId = review.user?._id || review.user?.id;
            if (userId) {
              await reviewAPI.blockUser(userId);
              setReviews(reviews.map(r =>
                (r.user?._id || r.user?.id) === userId ? { ...r, user: { ...r.user, isCommentBlocked: true } } : r
              ));
              setSuccessMessage(`Đã chặn "${review.user?.name}" bình luận`);
            }
          }
          break;
        case 'unblockUser':
          if (window.confirm(`Bỏ chặn người dùng "${review.user?.name}"?`)) {
            const userId = review.user?._id || review.user?.id;
            if (userId) {
              await reviewAPI.unblockUser(userId);
              setReviews(reviews.map(r =>
                (r.user?._id || r.user?.id) === userId ? { ...r, user: { ...r.user, isCommentBlocked: false } } : r
              ));
              setSuccessMessage(`Đã bỏ chặn "${review.user?.name}"`);
            }
          }
          break;
      }
    } catch (err) {
      const errorMsg = err?.response?.data?.message || err?.message || 'Lỗi thao tác';
      setError(errorMsg);
    }
  };

  const renderStars = (rating) => {
    return Array.from({ length: 5 }, (_, i) => (
      <FiStar
        key={i}
        size={14}
        style={{ fill: i < rating ? '#fbbf24' : 'none', color: i < rating ? '#fbbf24' : 'var(--text-muted)' }}
      />
    ));
  };

  const renderStatusBadge = (status) => {
    const map = {
      pending: { label: 'Chờ duyệt', className: 'badge badge-warning' },
      approved: { label: 'Đã duyệt', className: 'badge badge-success' },
      hidden: { label: 'Đã ẩn', className: 'badge badge-danger' },
      banned: { label: 'Bị cấm', className: 'badge badge-danger' },
    };
    const s = map[status] || { label: status, className: 'badge' };
    return <span className={s.className}>{s.label}</span>;
  };

  const pendingCount = reviews.filter(r => r.status === 'pending').length;

  return (
    <div className="comments-page animate-fade-in">
      <div className="page-header">
        <h1 className="page-title">
          <FiMessageSquare /> Quản lý Bình luận
          {pendingCount > 0 && <span className="pending-badge">{pendingCount} chờ duyệt</span>}
        </h1>
      </div>

      {error && (
        <div className="msg msg-error">
          <FiAlertCircle size={20} />
          <span>{error}</span>
        </div>
      )}

      {successMessage && (
        <div className="msg msg-success">
          <FiCheckCircle size={20} />
          <span>{successMessage}</span>
        </div>
      )}

      <div className="card glass">
        <div className="comments-toolbar">
          <div className="search-box relative" style={{ width: '260px' }}>
            <FiSearch className="absolute left-3 top-3 text-muted" />
            <input
              type="text"
              className="form-input pl-10"
              placeholder="Tìm kiếm bình luận..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <div className="filter-group">
            <FiFilter className="filter-icon" />
            <select
              className="form-select"
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              style={{ width: '150px' }}
            >
              {STATUS_OPTIONS.map(opt => (
                <option key={opt.value} value={opt.value}>{opt.label}</option>
              ))}
            </select>
          </div>
          <button className="btn btn-ghost btn-sm" onClick={fetchReviews}>
            <FiEye /> Làm mới
          </button>
        </div>

        {loading ? (
          <div className="loading-state">
            <FiLoader size={32} className="spinner-icon" />
            <span>Đang tải dữ liệu...</span>
          </div>
        ) : (
          <div className="table-responsive">
            <table>
              <thead>
                <tr>
                  <th style={{ width: '50px' }}>STT</th>
                  <th style={{ width: '140px' }}>Người dùng</th>
                  <th style={{ width: '140px' }}>Phim</th>
                  <th style={{ width: '90px' }}>Đánh giá</th>
                  <th>Nội dung</th>
                  <th style={{ width: '100px' }}>Trạng thái</th>
                  <th style={{ width: '110px' }}>Ngày</th>
                  <th style={{ width: '180px' }}>Thao tác</th>
                </tr>
              </thead>
              <tbody>
                {filteredReviews.map((review, index) => (
                  <tr key={review._id || review.id} className={`review-row status-${review.status}`}>
                    <td>{index + 1}</td>
                    <td>
                      <div className="user-cell">
                        <span className="font-semibold">{review.user?.name || 'Ẩn danh'}</span>
                        {review.user?.isCommentBlocked && (
                          <span className="blocked-tag" title="Đã bị chặn bình luận">Bị chặn</span>
                        )}
                      </div>
                    </td>
                    <td className="text-accent">{review.movie?.title || '-'}</td>
                    <td>
                      <div className="stars-row">
                        {renderStars(review.rating || 0)}
                      </div>
                    </td>
                    <td className="comment-text" title={review.comment}>{review.comment || '-'}</td>
                    <td>{renderStatusBadge(review.status)}</td>
                    <td className="text-muted text-sm">
                      {review.createdAt ? new Date(review.createdAt).toLocaleDateString('vi-VN') : '-'}
                    </td>
                    <td>
                      <div className="action-btns">
                        {review.status !== 'approved' && (
                          <button className="btn btn-success btn-sm" onClick={() => handleAction('approve', review)} title="Duyệt">
                            <FiCheck />
                          </button>
                        )}
                        {review.status !== 'hidden' && (
                          <button className="btn btn-warning btn-sm" onClick={() => handleAction('hide', review)} title="Ẩn">
                            <FiEyeOff />
                          </button>
                        )}
                        {review.status !== 'banned' && (
                          <button className="btn btn-danger btn-sm" onClick={() => handleAction('ban', review)} title="Cấm">
                            <FiXOctagon />
                          </button>
                        )}
                        {(review.user?._id || review.user?.id) && (
                          review.user?.isCommentBlocked ? (
                            <button className="btn btn-success btn-sm" onClick={() => handleAction('unblockUser', review)} title="Bỏ chặn người dùng">
                              <FiUserCheck />
                            </button>
                          ) : (
                            <button className="btn btn-danger btn-sm" onClick={() => handleAction('blockUser', review)} title="Chặn người dùng">
                              <FiUserX />
                            </button>
                          )
                        )}
                        <button className="btn btn-danger btn-sm" onClick={() => handleAction('delete', review)} title="Xóa">
                          <FiTrash2 />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
                {!loading && filteredReviews.length === 0 && (
                  <tr>
                    <td colSpan="8" className="text-center text-muted py-lg">
                      {reviews.length === 0 ? 'Chưa có bình luận nào.' : 'Không tìm thấy bình luận nào phù hợp.'}
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default Comments;
