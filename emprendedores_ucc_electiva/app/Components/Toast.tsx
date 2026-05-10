"use client";

import React, { useState, useEffect, useCallback } from 'react';
import styles from '../css/modulos/toast.module.css';

type ToastType = 'success' | 'error' | 'info' | 'warning';

interface ToastData {
  id: number;
  message: string;
  type: ToastType;
}

let toastCount = 0;
let showToastGlobal: (message: string, type?: ToastType) => void = () => {};

export const showToast = (message: string, type: ToastType = 'info') => {
  showToastGlobal(message, type);
};

export default function ToastContainer() {
  const [toasts, setToasts] = useState<ToastData[]>([]);

  const addToast = useCallback((message: string, type: ToastType = 'info') => {
    const id = ++toastCount;
    setToasts(prev => [...prev, { id, message, type }]);

    // Auto remove after 5 seconds
    setTimeout(() => {
      setToasts(prev => prev.filter(t => t.id !== id));
    }, 5000);
  }, []);

  useEffect(() => {
    showToastGlobal = addToast;
    
    // Override native alert
    window.alert = (message: string) => {
      // Determine type based on common keywords
      let type: ToastType = 'info';
      const msg = message.toLowerCase();
      if (msg.includes('error') || msg.includes('falló') || msg.includes('incorrecto') || msg.includes('inválido')) {
        type = 'error';
      } else if (msg.includes('éxito') || msg.includes('correcto') || msg.includes('bien') || msg.includes('actualizado') || msg.includes('registrado') || msg.includes('publicado')) {
        type = 'success';
      } else if (msg.includes('cuidado') || msg.includes('atención') || msg.includes('advertencia')) {
        type = 'warning';
      }
      
      addToast(message, type);
    };
  }, [addToast]);

  const removeToast = (id: number) => {
    setToasts(prev => prev.filter(t => t.id !== id));
  };

  return (
    <div className={styles.container}>
      {toasts.map(toast => (
        <div 
          key={toast.id} 
          className={`${styles.toast} ${styles[toast.type]}`}
          onClick={() => removeToast(toast.id)}
        >
          <div className={styles.icon}>
            {toast.type === 'success' && (
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="20 6 9 17 4 12" />
              </svg>
            )}
            {toast.type === 'error' && (
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                <line x1="18" y1="6" x2="6" y2="18" />
                <line x1="6" y1="6" x2="18" y2="18" />
              </svg>
            )}
            {(toast.type === 'info' || toast.type === 'warning') && (
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                <line x1="12" y1="8" x2="12" y2="12" />
                <line x1="12" y1="16" x2="12.01" y2="16" />
                <circle cx="12" cy="12" r="10" />
              </svg>
            )}
          </div>
          <div className={styles.content}>
            <p className={styles.message}>{toast.message}</p>
          </div>
          <button className={styles.closeBtn}>✕</button>
        </div>
      ))}
    </div>
  );
}
