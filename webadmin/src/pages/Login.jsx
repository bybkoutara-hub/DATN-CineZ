import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { FiUser, FiLock, FiEye, FiEyeOff, FiAlertCircle, FiLogIn } from 'react-icons/fi';
import { MdLocalMovies } from 'react-icons/md';
import './Login.css';

const Login = () => {
  const { user, login } = useAuth();
  const navigate = useNavigate();

  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  // Auto-redirect if already logged in
  useEffect(() => {
    if (user) navigate('/dashboard', { replace: true });
  }, [user, navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!username.trim()) {
      setError('Vui lòng nhập tên đăng nhập');
      return;
    }
    if (!password) {
      setError('Vui lòng nhập mật khẩu');
      return;
    }

    setLoading(true);
    try {
      await login(username.trim(), password);
      navigate('/dashboard', { replace: true });
    } catch (err) {
      const msg =
        err?.response?.data?.message ||
        err?.message ||
        'Đăng nhập thất bại. Vui lòng thử lại.';
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  // Don't render login form if already authenticated
  if (user) return null;

  return (
    <div className="login-page">
      {/* Floating Particles */}
      <div className="login-particles">
        {Array.from({ length: 8 }).map((_, i) => (
          <div key={i} className="login-particle" />
        ))}
      </div>

      {/* Login Card */}
      <div className="login-card">
        {/* Brand */}
        <div className="login-brand">
          <div className="login-brand-icon">
            <MdLocalMovies />
          </div>
          <h1>CineZ Admin</h1>
          <p>Đăng nhập vào hệ thống quản trị</p>
        </div>

        {/* Error */}
        {error && (
          <div className="login-error">
            <FiAlertCircle className="login-error-icon" />
            <span>{error}</span>
          </div>
        )}

        {/* Form */}
        <form className="login-form" onSubmit={handleSubmit}>
          <div className="login-field">
            <label htmlFor="login-username">Tên đăng nhập</label>
            <div className="login-input-wrapper">
              <FiUser className="login-input-icon" />
              <input
                id="login-username"
                type="text"
                className="login-input"
                placeholder="Nhập tên đăng nhập"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                autoComplete="username"
                autoFocus
              />
            </div>
          </div>

          <div className="login-field">
            <label htmlFor="login-password">Mật khẩu</label>
            <div className="login-input-wrapper">
              <FiLock className="login-input-icon" />
              <input
                id="login-password"
                type={showPassword ? 'text' : 'password'}
                className="login-input"
                placeholder="Nhập mật khẩu"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                autoComplete="current-password"
              />
              <button
                type="button"
                className="login-password-toggle"
                onClick={() => setShowPassword(!showPassword)}
                tabIndex={-1}
                aria-label={showPassword ? 'Ẩn mật khẩu' : 'Hiện mật khẩu'}
              >
                {showPassword ? <FiEyeOff /> : <FiEye />}
              </button>
            </div>
          </div>

          <button
            type="submit"
            className="login-submit"
            disabled={loading}
          >
            <span className="login-submit-content">
              {loading ? (
                <>
                  <span className="login-spinner" />
                  Đang xử lý...
                </>
              ) : (
                <>
                  <FiLogIn />
                  Đăng nhập
                </>
              )}
            </span>
          </button>
        </form>

        {/* Footer */}
        <div className="login-footer">
          <span>© 2026 CineZ</span> — Hệ thống quản trị rạp chiếu phim
        </div>
      </div>
    </div>
  );
};

export default Login;
