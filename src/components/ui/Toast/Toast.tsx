import React, { useEffect } from 'react';
import { CheckCircle, AlertCircle, X } from 'lucide-react';
import styles from './Toast.module.css';

export interface ToastProps {
  id: string;
  type: 'success' | 'error' | 'info';
  title: string;
  message: string;
  duration?: number;
  onClose: (id: string) => void;
}

export const Toast: React.FC<ToastProps> = ({
  id,
  type,
  title,
  message,
  duration = 5000,
  onClose
}) => {
  useEffect(() => {
    if (duration === Infinity) return;
    const timer = setTimeout(() => {
      onClose(id);
    }, duration);
    return () => clearTimeout(timer);
  }, [id, duration, onClose]);

  const iconMap = {
    success: <CheckCircle className={styles.iconSuccess} size={20} />,
    error: <AlertCircle className={styles.iconError} size={20} />,
    info: <CheckCircle className={styles.iconInfo} size={20} />
  };

  return (
    <div className={`${styles.toast} ${styles[type]}`} role="alert">
      <div className={styles.iconContainer}>
        {iconMap[type]}
      </div>
      <div className={styles.textContainer}>
        <div className={styles.title}>{title}</div>
        <div className={styles.message}>{message}</div>
      </div>
      <button 
        onClick={() => onClose(id)} 
        className={styles.closeButton}
        aria-label="Close notification"
      >
        <X size={16} />
      </button>
    </div>
  );
};
