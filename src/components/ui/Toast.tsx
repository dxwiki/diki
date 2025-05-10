'use client';

import { useState, useEffect } from 'react';
import { CheckCircle, AlertCircle, Info, X } from 'lucide-react';

export type ToastType = 'success' | 'error' | 'info';

interface ToastProps {
  message: string;
  type?: ToastType;
  duration?: number;
  position?: 'top-right' | 'top-left' | 'bottom-right' | 'bottom-left';
  onClose?: ()=> void;
}

const Toast = ({
  message,
  type = 'success',
  duration = 3000,
  position = 'bottom-left',
  onClose,
}: ToastProps) => {
  const [isVisible, setIsVisible] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsVisible(false);
      if (onClose) onClose();
    }, duration);

    return () => clearTimeout(timer);
  }, [duration, onClose]);

  if (!isVisible) return null;

  const positionClasses = {
    'top-right': 'top-8 right-4',
    'top-left': 'top-8 left-4',
    'bottom-right': 'bottom-8 right-4',
    'bottom-left': 'bottom-8 left-4',
  };

  const icons = {
    success: <CheckCircle className="size-5 text-white" />,
    error: <AlertCircle className="size-5 text-white" />,
    info: <Info className="size-5 text-white" />,
  };

  const bgColors = {
    success: 'bg-accent ',
    error: 'bg-level-5',
    info: 'bg-secondary ',
  };

  return (
    <div
      className={`fixed ${ positionClasses[position] } flex items-center p-3 rounded-lg shadow-md z-50 animate-slideUp ${ bgColors[type] } hover:opacity-80`}
      role="alert"
    >
      <div className="flex items-center gap-3">
        {icons[type]}
        <span className="text-white text-sm">{message}</span>
      </div>
      <button
        onClick={() => {
          setIsVisible(false);
          if (onClose) onClose();
        }}
        className="ml-3 text-white"
      >
        <X className="size-4" />
      </button>
    </div>
  );
};

export default Toast;