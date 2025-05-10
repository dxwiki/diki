'use client';

import { createContext, useContext, useState, ReactNode, useEffect } from 'react';
import Toast, { ToastType } from '../components/ui/Toast';

interface ToastContextProps {
  showToast: (message: string, type?: ToastType, duration?: number)=> void;
}

const ToastContext = createContext<ToastContextProps | undefined>(undefined);

export const useToast = () => {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error('useToast must be used within a ToastProvider');
  }
  return context;
};

interface ToastProviderProps {
  children: ReactNode;
}

interface ToastData {
  id: number;
  message: string;
  type: ToastType;
  duration: number;
  createdAt: number;
}

const toastOffset = 70;
const maxToasts = 5;
const defaultDuration = 5000;

export const ToastProvider = ({ children }: ToastProviderProps) => {
  const [toasts, setToasts] = useState<ToastData[]>([]);

  useEffect(() => {
    if (toasts.length > maxToasts) {
      const oldestId = toasts[0].id;
      setToasts((prevToasts) => prevToasts.filter((toast) => toast.id !== oldestId));
    }
  }, [toasts]);

  // 새 토스트 생성
  const showToast = (
    message: string,
    type: ToastType = 'success',
    duration: number = defaultDuration
  ) => {
    const createdAt = Date.now();

    setToasts((prevToasts) => [
      ...prevToasts,
      {
        id: createdAt,
        message,
        type,
        duration,
        createdAt,
      },
    ]);
  };

  const removeToast = (id: number) => {
    setToasts((prevToasts) => prevToasts.filter((toast) => toast.id !== id));
  };

  const getToastOffset = (index: number): number => {
    const reverseIndex = toasts.length - 1 - index;
    return reverseIndex * toastOffset;
  };

  return (
    <ToastContext.Provider value={{ showToast }}>
      {children}
      {toasts.map((toast, index) => (
        <Toast
          key={toast.id}
          message={toast.message}
          type={toast.type}
          duration={toast.duration}
          onClose={() => removeToast(toast.id)}
          offset={getToastOffset(index)}
          createdAt={toast.createdAt}
        />
      ))}
    </ToastContext.Provider>
  );
};

export default ToastProvider;