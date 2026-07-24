import React, { createContext, useContext, useState, useCallback, useEffect } from 'react';
import { Toast, ToastProps } from '../components/ui/Toast/Toast';
import styles from './ToastContext.module.css';

interface ToastOptions {
  type: 'success' | 'error' | 'info' | 'warning';
  title: string;
  message: string;
  duration?: number;
}

interface ToastContextType {
  showToast: (options: ToastOptions) => void;
}

const ToastContext = createContext<ToastContextType | undefined>(undefined);

export const ToastProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [toasts, setToasts] = useState<Omit<ToastProps, 'onClose'>[]>([]);
  const [footerVisibleHeight, setFooterVisibleHeight] = useState(0);

  const removeToast = useCallback((id: string) => {
    setToasts((prevToasts) => prevToasts.filter((t) => t.id !== id));
  }, []);

  const showToast = useCallback(({ type, title, message, duration }: ToastOptions) => {
    const id = Math.random().toString(36).substring(2, 9);
    const resolvedDuration = duration !== undefined ? duration : (
      type === 'success' ? 2000 :
      type === 'info' ? 2000 :
      type === 'warning' ? 3000 :
      type === 'error' ? 4000 : 2000
    );
    setToasts((prevToasts) => [
      ...prevToasts,
      { id, type, title, message, duration: resolvedDuration }
    ]);
  }, []);

  useEffect(() => {
    const handleScroll = () => {
      const footerBottomBar = document.querySelector('footer > div:last-child');
      if (footerBottomBar) {
        const rect = footerBottomBar.getBoundingClientRect();
        const viewportHeight = window.innerHeight;
        
        if (rect.top < viewportHeight) {
          const visibleAmount = viewportHeight - rect.top;
          setFooterVisibleHeight(visibleAmount + 8);
        } else {
          setFooterVisibleHeight(0);
        }
      } else {
        setFooterVisibleHeight(0);
      }
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    window.addEventListener('resize', handleScroll);
    handleScroll();

    return () => {
      window.removeEventListener('scroll', handleScroll);
      window.removeEventListener('resize', handleScroll);
    };
  }, []);

  return (
    <ToastContext.Provider value={{ showToast }}>
      {children}
      {/* Toast Portal/Container fixed at bottom-right of viewport */}
      <div 
        className={styles.container}
        style={{
          '--footer-shift': `${footerVisibleHeight}px`
        } as React.CSSProperties}
      >
        {toasts.map((toast) => (
          <Toast
            key={toast.id}
            {...toast}
            onClose={removeToast}
          />
        ))}
      </div>
    </ToastContext.Provider>
  );
};

export const useToast = () => {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error('useToast must be used within a ToastProvider');
  }
  return context;
};
