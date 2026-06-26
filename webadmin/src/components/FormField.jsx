import { useRef, useState } from 'react';
import { FiUpload, FiX } from 'react-icons/fi';
import './FormField.css';

export default function FormField({
  label,
  type = 'text',
  name,
  value,
  onChange,
  placeholder = '',
  error,
  required = false,
  options = [],
  rows = 4,
  accept,
  disabled = false,
}) {
  const fileRef = useRef(null);
  const [preview, setPreview] = useState(null);

  const handleFileChange = (e) => {
    const file = e.target.files?.[0] || null;
    onChange({ target: { name, value: file } });

    if (file && file.type.startsWith('image/')) {
      const reader = new FileReader();
      reader.onload = (ev) => setPreview(ev.target.result);
      reader.readAsDataURL(file);
    } else {
      setPreview(null);
    }
  };

  const clearFile = () => {
    if (fileRef.current) fileRef.current.value = '';
    onChange({ target: { name, value: null } });
    setPreview(null);
  };

  const fieldId = `ff-${name}`;
  const hasError = !!error;

  return (
    <div className={`ff-group ${hasError ? 'ff-has-error' : ''} ${disabled ? 'ff-disabled' : ''}`}>
      {label && (
        <label className="ff-label" htmlFor={fieldId}>
          {label}
          {required && <span className="ff-required">*</span>}
        </label>
      )}

      {type === 'select' ? (
        <select
          id={fieldId}
          name={name}
          value={value || ''}
          onChange={onChange}
          className="ff-input ff-select"
          disabled={disabled}
        >
          <option value="" disabled>
            {placeholder || 'Chọn...'}
          </option>
          {options.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>
      ) : type === 'textarea' ? (
        <textarea
          id={fieldId}
          name={name}
          value={value || ''}
          onChange={onChange}
          placeholder={placeholder}
          rows={rows}
          className="ff-input ff-textarea"
          disabled={disabled}
        />
      ) : type === 'file' ? (
        <div className="ff-file-wrapper">
          <input
            ref={fileRef}
            type="file"
            id={fieldId}
            name={name}
            accept={accept}
            onChange={handleFileChange}
            className="ff-file-native"
            disabled={disabled}
          />
          <button
            type="button"
            className="ff-file-btn"
            onClick={() => fileRef.current?.click()}
            disabled={disabled}
          >
            <FiUpload />
            <span>{value ? (value.name || 'Đã chọn tệp') : 'Chọn tệp'}</span>
          </button>
          {preview && (
            <div className="ff-file-preview">
              <img src={preview} alt="Xem trước" />
              <button type="button" className="ff-file-clear" onClick={clearFile}>
                <FiX />
              </button>
            </div>
          )}
          {value && !preview && (
            <div className="ff-file-name">
              <span>{value.name}</span>
              <button type="button" className="ff-file-clear-inline" onClick={clearFile}>
                <FiX />
              </button>
            </div>
          )}
        </div>
      ) : (
        <input
          id={fieldId}
          type={type}
          name={name}
          value={value || ''}
          onChange={onChange}
          placeholder={placeholder}
          className="ff-input"
          disabled={disabled}
        />
      )}

      {hasError && <span className="ff-error">{error}</span>}
    </div>
  );
}
