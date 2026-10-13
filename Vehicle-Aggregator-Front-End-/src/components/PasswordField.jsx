import React, { useState } from 'react';
import { Lock, Eye, EyeOff, AlertCircle, Check } from 'lucide-react';
import styles from './PasswordField.module.css';

export default function PasswordField({
  id,
  name,
  label,
  value,
  onChange,
  onBlur,
  placeholder,
  error,
  helperText,
  required = false,
  showRequirements = false,
  autoComplete,
}) {
  const [showPassword, setShowPassword] = useState(false);

  const errorId = error ? `${id}-error` : undefined;
  const helperId = helperText ? `${id}-helper` : undefined;

  // Requirement checks for password helper
  const hasMinLength = value.length >= 8;
  const hasLetter = /[a-zA-Z]/.test(value);
  const hasNumber = /[0-9]/.test(value);

  return (
    <div className={styles.fieldGroup}>
      <div className={styles.labelRow}>
        <label htmlFor={id} className={styles.label}>
          {label}
        </label>
      </div>

      <div
        className={`${styles.inputWrapper} ${error ? styles.hasError : ''}`}
      >
        <div className={styles.leadingIcon} aria-hidden="true">
          <Lock size={18} strokeWidth={2} />
        </div>

        <input
          id={id}
          name={name}
          type={showPassword ? 'text' : 'password'}
          value={value}
          onChange={onChange}
          onBlur={onBlur}
          placeholder={placeholder}
          required={required}
          autoComplete={autoComplete}
          className={styles.input}
          aria-invalid={error ? 'true' : 'false'}
          aria-describedby={error ? errorId : helperId}
        />

        <button
          type="button"
          className={styles.toggleButton}
          onClick={() => setShowPassword((prev) => !prev)}
          aria-label={showPassword ? 'Hide password' : 'Show password'}
          tabIndex={0}
        >
          {showPassword ? (
            <EyeOff size={18} strokeWidth={2} />
          ) : (
            <Eye size={18} strokeWidth={2} />
          )}
        </button>
      </div>

      {error ? (
        <p id={errorId} className={styles.errorMessage} role="alert">
          <AlertCircle size={14} className={styles.errorIcon} />
          <span>{error}</span>
        </p>
      ) : helperText ? (
        <p id={helperId} className={styles.helperText}>
          {helperText}
        </p>
      ) : null}

      {showRequirements && value.length > 0 && !error && (
        <div className={styles.requirementsList}>
          <span className={`${styles.reqItem} ${hasMinLength ? styles.met : ''}`}>
            <Check size={12} strokeWidth={hasMinLength ? 3 : 2} /> 8+ chars
          </span>
          <span className={`${styles.reqItem} ${hasLetter ? styles.met : ''}`}>
            <Check size={12} strokeWidth={hasLetter ? 3 : 2} /> Letters
          </span>
          <span className={`${styles.reqItem} ${hasNumber ? styles.met : ''}`}>
            <Check size={12} strokeWidth={hasNumber ? 3 : 2} /> Numbers
          </span>
        </div>
      )}
    </div>
  );
}
