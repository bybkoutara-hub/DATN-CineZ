import { useEffect, useCallback, useRef } from 'react';
import { FiAlertTriangle, FiAlertCircle, FiInfo } from 'react-icons/fi';
import './ConfirmDialog.css';

const TYPE_MAP = {
  danger: {
    icon: <FiAlertTriangle />,
    className: 'cd-danger',
    defaultConfirm: 'Xóa',
  },
  warning: {
    icon: <FiAlertCircle />,
    className: 'cd-warning',
    defaultConfirm: 'Xác nhận',
  },
  info: {
    icon: <FiInfo />,
    className: 'cd-info',
    defaultConfirm: 'Đồng ý',
  },
};

export default function ConfirmDialog({
  isOpen,
  onConfirm,
  onCancel,
  title = 'Xác nhận',
  message = 'Bạn có chắc chắn muốn thực hiện hành động này?',
  type = 'danger',
  confirmText,
  cancelText = 'Hủy',
}) {
  const overlayRef = useRef(null);
  const config = TYPE_MAP[type] || TYPE_MAP.danger;

  const handleKeyDown = useCallback(
    (e) => {
      if (e.key === 'Escape') onCancel();
    },
    [onCancel]
  );

  useEffect(() => {
    if (isOpen) {
      document.addEventListener('keydown', handleKeyDown);
      document.body.style.overflow = 'hidden';
    }
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = '';
    };
  }, [isOpen, handleKeyDown]);

  const handleOverlayClick = (e) => {
    if (e.target === overlayRef.current) onCancel();
  };

  if (!isOpen) return null;

  return (
    <div className="cd-overlay" ref={overlayRef} onClick={handleOverlayClick}>
      <div className={`cd-card ${config.className}`}>
        <div className="cd-icon-wrapper">
          <div className="cd-icon-circle">{config.icon}</div>
        </div>
        <h3 className="cd-title">{title}</h3>
        <p className="cd-message">{message}</p>
        <div className="cd-actions">
          <button className="cd-btn cd-btn-cancel" onClick={onCancel}>
            {cancelText}
          </button>
          <button className="cd-btn cd-btn-confirm" onClick={onConfirm}>
            {confirmText || config.defaultConfirm}
          </button>
        </div>
      </div>
    </div>
  );
}
