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
}

const toastOffset = 70;
const maxToasts = 5;

export const ToastProvider = ({ children }: ToastProviderProps) => {
  const [toasts, setToasts] = useState<ToastData[]>([]);

  useEffect(() => {
    if (toasts.length > maxToasts) {
      const oldestToast = toasts[0];
      setToasts((prevToasts) => prevToasts.filter((toast) => toast.id !== oldestToast.id));
    }
  }, [toasts]);

  const showToast = (
    message: string,
    type: ToastType = 'success',
    duration: number = 3000
  ) => {
    const id = Date.now();
    setToasts((prevToasts) => [
      ...prevToasts,
      { id, message, type, duration },
    ]);
  };

  const removeToast = (id: number) => {
    setToasts((prevToasts) => prevToasts.filter((toast) => toast.id !== id));
  };

  // 최신 토스트(마지막 인덱스)는 offset 0, 그 다음은 위로 쌓임
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
        />
      ))}
    </ToastContext.Provider>
  );
};

export default ToastProvider;