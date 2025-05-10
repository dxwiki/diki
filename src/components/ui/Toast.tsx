'use client';

import { useState, useEffect, useRef } from 'react';
import { CheckCircle, AlertCircle, Info, X } from 'lucide-react';

export type ToastType = 'success' | 'error' | 'info';

interface ToastProps {
  message: string;
  type?: ToastType;
  duration?: number;
  position?: 'top-right' | 'top-left' | 'bottom-right' | 'bottom-left';
  onClose?: ()=> void;
  offset?: number;
}

const Toast = ({
  message,
  type = 'success',
  duration = 5000,
  position = 'bottom-left',
  onClose,
  offset = 0,
}: ToastProps) => {
  const [isVisible, setIsVisible] = useState(true);
  const [remainingTime, setRemainingTime] = useState(Math.ceil(duration / 1000));
  const [prevOffset, setPrevOffset] = useState(offset);
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    timerRef.current = setTimeout(() => {
      setIsVisible(false);
      if (onClose) onClose();
    }, duration);

    intervalRef.current = setInterval(() => {
      setRemainingTime((prev) => {
        if (prev <= 1) return 0;
        return prev - 1;
      });
    }, 1000);

    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [duration, onClose]);

  useEffect(() => {
    setPrevOffset(offset);
  }, [offset]);

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
    info: 'bg-gray3 ',
  };

  // 새 토스트가 나타나거나 기존 토스트가 위로 이동할 때의 애니메이션
  const offsetStyle = {
    transform: `translateY(-${ offset }px)`,
    transition: 'transform 0.3s ease-out',
  };

  const animationClass = offset === 0
    ? 'animate-slideUp'
    : prevOffset !== offset
      ? 'transition-transform duration-300 ease-out'
      : '';

  return (
    <div
      className={`fixed w-full max-w-[90vw] md:max-w-[40vw] xl:max-w-[25vw] h-12 ${ positionClasses[position] } flex justify-between items-center p-3 rounded-lg shadow-lg z-50 ${ animationClass } ${ bgColors[type] } hover:opacity-80`}
      role="alert"
      style={offsetStyle}
    >
      <div className="flex items-center gap-3">
        {icons[type]}
        <span className="text-white text-sm">{message}</span>
      </div>
      <div className="flex items-center">
        <span className="text-white text-xs mr-2">{remainingTime}{'s'}</span>
        <button
          onClick={() => {
            setIsVisible(false);
            if (onClose) onClose();
          }}
          className="text-white"
        >
          <X className="size-5" />
        </button>
      </div>
    </div>
  );
};

export default Toast;