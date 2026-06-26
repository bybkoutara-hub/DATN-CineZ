import { createContext, useContext, useState, useCallback, useRef, useEffect } from 'react';
import {
  FiCheckCircle,
  FiXCircle,
  FiAlertTriangle,
  FiInfo,
  FiX,
} from 'react-icons/fi';
import './Toast.css';

const ToastContext = createContext(null);

let toastIdCounter = 0;

const TYPE_CONFIG = {
  success: { icon: <FiCheckCircle />, className: 'toast-success' },
  error: { icon: <FiXCircle />, className: 'toast-error' },
  warning: { icon: <FiAlertTriangle />, className: 'toast-warning' },
  info: { icon: <FiInfo />, className: 'toast-info' },
};

function ToastItem({ toast, onDismiss }) {
  const config = TYPE_CONFIG[toast.type] || TYPE_CONFIG.info;
  const [exiting, setExiting] = useState(false);
  const timerRef = useRef(null);
  const duration = toast.duration || 4000;

  const dismiss = useCallback(() => {
    setExiting(true);
    setTimeout(() => onDismiss(toast.id), 300);
  }, [onDismiss, toast.id]);

  useEffect(() => {
    timerRef.current = setTimeout(dismiss, duration);
    return () => clearTimeout(timerRef.current);
  }, [dismiss, duration]);

  return (
    <div
      className={`toast-item ${config.className} ${exiting ? 'toast-exit' : 'toast-enter'}`}
      onClick={dismiss}
    >
      <span className="toast-icon">{config.icon}</span>
      <div className="toast-content">
        {toast.title && <strong className="toast-title">{toast.title}</strong>}
        <p className="toast-message">{toast.message}</p>
      </div>
      <button className="toast-dismiss" onClick={(e) => { e.stopPropagation(); dismiss(); }}>
        <FiX />
      </button>
      <div
        className="toast-progress"
        style={{ animationDuration: `${duration}ms` }}
      />
    </div>
  );
}

export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([]);

  const addToast = useCallback(({ type = 'info', title, message, duration }) => {
    const id = ++toastIdCounter;
    setToasts((prev) => [...prev, { id, type, title, message, duration }]);
    return id;
  }, []);

  const removeToast = useCallback((id) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const toast = useCallback(
    {
      success: (message, opts = {}) => addToast({ type: 'success', message, ...opts }),
      error: (message, opts = {}) => addToast({ type: 'error', message, ...opts }),
      warning: (message, opts = {}) => addToast({ type: 'warning', message, ...opts }),
      info: (message, opts = {}) => addToast({ type: 'info', message, ...opts }),
    },
    [addToast]
  );

  return (
    <ToastContext.Provider value={toast}>
      {children}
      <div className="toast-container">
        {toasts.map((t) => (
          <ToastItem key={t.id} toast={t} onDismiss={removeToast} />
        ))}
      </div>
    </ToastContext.Provider>
  );
}

export function useToast() {
  const ctx = useContext(ToastContext);
  if (!ctx) throw new Error('useToast phải được sử dụng bên trong <ToastProvider>');
  return ctx;
}
