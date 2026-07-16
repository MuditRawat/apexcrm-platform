import React, { useId } from 'react';
import styles from './Input.module.css';

interface Option {
  value: string;
  label: string;
}

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement> {
  label: string;
  error?: string;
  helperText?: string;
  as?: 'input' | 'textarea' | 'select';
  options?: Option[];
  rows?: number;
}

export const Input: React.FC<InputProps> = ({
  label,
  error,
  helperText,
  as = 'input',
  options = [],
  className = '',
  rows = 4,
  id,
  required,
  ...props
}) => {
  const generatedId = useId();
  const inputId = id || generatedId;
  const errorId = `${inputId}-error`;
  const helperId = `${inputId}-helper`;

  const inputClass = [
    styles.inputField,
    error ? styles.inputError : '',
    as === 'textarea' ? styles.textarea : '',
    as === 'select' ? styles.select : ''
  ].filter(Boolean).join(' ');

  const renderControl = () => {
    switch (as) {
      case 'textarea':
        return (
          <textarea
            id={inputId}
            className={inputClass}
            rows={rows}
            aria-invalid={!!error}
            aria-describedby={
              error ? errorId : helperText ? helperId : undefined
            }
            required={required}
            {...(props as React.TextareaHTMLAttributes<HTMLTextAreaElement>)}
          />
        );
      case 'select':
        return (
          <select
            id={inputId}
            className={inputClass}
            aria-invalid={!!error}
            aria-describedby={
              error ? errorId : helperText ? helperId : undefined
            }
            required={required}
            {...(props as React.SelectHTMLAttributes<HTMLSelectElement>)}
          >
            <option value="" disabled>Select an option</option>
            {options.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>
        );
      case 'input':
      default:
        return (
          <input
            id={inputId}
            className={inputClass}
            aria-invalid={!!error}
            aria-describedby={
              error ? errorId : helperText ? helperId : undefined
            }
            required={required}
            {...(props as React.InputHTMLAttributes<HTMLInputElement>)}
          />
        );
    }
  };

  return (
    <div className={`${styles.inputContainer} ${className}`} id={`container-${inputId}`}>
      <label htmlFor={inputId} className={styles.label}>
        {label} {required && <span className={styles.required} aria-hidden="true">*</span>}
      </label>
      <div className={styles.controlWrapper}>
        {renderControl()}
        {as === 'select' && (
          <span className={styles.selectArrow} aria-hidden="true">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M6 9l6 6 6-6" />
            </svg>
          </span>
        )}
      </div>
      {error ? (
        <p id={errorId} className={styles.errorMessage} role="alert">
          {error}
        </p>
      ) : helperText ? (
        <p id={helperId} className={styles.helperMessage}>
          {helperText}
        </p>
      ) : null}
    </div>
  );
};
