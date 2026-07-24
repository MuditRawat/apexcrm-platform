import React, { useEffect } from 'react';
import { CheckCircle, AlertCircle, X } from 'lucide-react';
import styles from './Toast.module.css';

export interface ToastProps {
  id: string;
  type: 'success' | 'error' | 'info' | 'warning';
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
  duration,
  onClose
}) => {
  const resolvedDuration = duration !== undefined ? duration : (
    type === 'success' ? 2000 :
    type === 'info' ? 2000 :
    type === 'warning' ? 3000 :
    type === 'error' ? 4000 : 2000
  );

  useEffect(() => {
    if (resolvedDuration === Infinity) return;
    const timer = setTimeout(() => {
      onClose(id);
    }, resolvedDuration);
    return () => clearTimeout(timer);
  }, [id, resolvedDuration, onClose]);

  const iconMap = {
    success: <CheckCircle className={styles.iconSuccess} size={20} />,
    error: <AlertCircle className={styles.iconError} size={20} />,
    info: <CheckCircle className={styles.iconInfo} size={20} />,
    warning: <AlertCircle className={styles.iconWarning} size={20} />
  };

  const hasProgressBar = resolvedDuration !== Infinity;

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
      {hasProgressBar && (
        <div 
          className={styles.progressBar}
          style={{ '--toast-duration': `${resolvedDuration}ms` } as React.CSSProperties}
        />
      )}
    </div>
  );
};
