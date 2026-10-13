import React from 'react';
import { AlertCircle } from 'lucide-react';
import styles from './InputField.module.css';

export default function InputField({
  id,
  name,
  label,
  type = 'text',
  value,
  onChange,
  onBlur,
  placeholder,
  icon: Icon,
  error,
  helperText,
  required = false,
  countrySelector = null,
  autoComplete,
  maxLength,
  inputMode,
  onKeyDown,
  ...restProps
}) {
  const errorId = error ? `${id}-error` : undefined;
  const helperId = helperText ? `${id}-helper` : undefined;

  return (
    <div className={styles.fieldGroup}>
      <label htmlFor={id} className={styles.label}>
        {label}
      </label>

      <div
        className={`${styles.inputWrapper} ${error ? styles.hasError : ''}`}
      >
        {Icon && (
          <div className={styles.leadingIcon} aria-hidden="true">
            <Icon size={18} strokeWidth={2} />
          </div>
        )}

        {countrySelector && (
          <div className={styles.countrySelectorWrapper}>
            {countrySelector}
          </div>
        )}

        <input
          id={id}
          name={name}
          type={type}
          value={value}
          onChange={onChange}
          onBlur={onBlur}
          onKeyDown={onKeyDown}
          placeholder={placeholder}
          required={required}
          autoComplete={autoComplete}
          maxLength={maxLength}
          inputMode={inputMode}
          className={`${styles.input} ${Icon ? styles.withIcon : ''} ${
            countrySelector ? styles.withCountry : ''
          }`}
          aria-invalid={error ? 'true' : 'false'}
          aria-describedby={error ? errorId : helperId}
          {...restProps}
        />
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
    </div>
  );
}
