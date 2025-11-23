'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { CheckCircle, AlertCircle, Info, X } from 'lucide-react';

export type ToastType = 'success' | 'error' | 'info';

interface ToastProps {
  message: string;
  type?: ToastType;
  duration?: number;
  position?: 'top-right' | 'top-left' | 'bottom-right' | 'bottom-left';
  onClose?: ()=> void;
  offset?: number;
  createdAt: number; // 토스트 생성 시간
}

const Toast = ({
  message,
  type = 'success',
  duration = 5000,
  position = 'bottom-right',
  onClose,
  offset = 0,
  createdAt,
}: ToastProps) => {
  const [isVisible, setIsVisible] = useState(true);
  const [isFading, setIsFading] = useState(false);
  const [remainingTime, setRemainingTime] = useState(Math.ceil(duration / 1000));
  const [prevOffset, setPrevOffset] = useState(offset);

  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const fadeTimerRef = useRef<NodeJS.Timeout | null>(null);

  // 모든 타이머 정리
  const clearTimers = useCallback(() => {
    if (intervalRef.current) clearInterval(intervalRef.current);
    if (timerRef.current) clearTimeout(timerRef.current);
  }, []);

  const closeToast = useCallback(() => {
    setIsFading(true);

    fadeTimerRef.current = setTimeout(() => {
      setIsVisible(false);
      if (onClose) onClose();
    }, 300);
  }, [onClose]);

  useEffect(() => {
    const elapsedTime = Date.now() - createdAt;
    const actualDuration = Math.max(0, duration - elapsedTime);

    if (actualDuration <= 0) {
      closeToast();
      return;
    }

    timerRef.current = setTimeout(() => {
      closeToast();
    }, Math.max(0, actualDuration - 200));

    intervalRef.current = setInterval(() => {
      const currentElapsed = Date.now() - createdAt;
      const remainingMs = Math.max(0, duration - currentElapsed);
      const remainingSec = Math.ceil(remainingMs / 1000);

      setRemainingTime(remainingSec);

      if (remainingSec <= 0) {
        closeToast();
        clearTimers();
      }
    }, 200);

    return clearTimers;
  }, [duration, createdAt, closeToast, clearTimers]);

  useEffect(() => {
    setPrevOffset(offset);
  }, [offset]);

  useEffect(() => {
    return () => {
      if (fadeTimerRef.current) clearTimeout(fadeTimerRef.current);
    };
  }, []);

  if (!isVisible) return null;

  const positionClasses = {
    'top-right': 'top-8 right-4',
    'top-left': 'top-8 left-4',
    'bottom-right': 'bottom-8 right-4',
    'bottom-left': 'bottom-8 left-4',
  };

  const icons = {
    success: <CheckCircle className="size-5" />,
    error: <AlertCircle className="size-5" />,
    info: <Info className="size-5" />,
  };

  const bgColors = {
    success: 'bg-primary dark:bg-secondary text-white',
    error: 'bg-level-5 text-white border-level-5',
    info: 'bg-gray2 dark:bg-gray4 border border-white text-white',
  };

  const offsetStyle = {
    transform: `translateY(-${ offset }px)`,
    transition: 'transform 0.3s ease-out',
  };

  const animationClass = isFading
    ? 'animate-toastFadeOut'
    : offset === 0
      ? 'animate-slideUp'
      : prevOffset !== offset
        ? 'transition-transform duration-300 ease-out'
        : '';

  return (
    <div
      className={`fixed w-full max-w-[90vw] md:max-w-[40vw] h-12
        flex justify-between items-center p-3 rounded-lg shadow-lg z-50 hover:opacity-80
        ${ positionClasses[position] } ${ animationClass } ${ bgColors[type] }`}
      role="alert"
      style={offsetStyle}
    >
      <div className="flex items-center gap-3">
        {icons[type]}
        <span className="text-sm">{message}</span>
      </div>
      <div className="flex items-center">
        <span className="text-xs mr-2">{remainingTime > 0 ? remainingTime : 0}{'s'}</span>
        <button
          onClick={closeToast}
        >
          <X className="size-5" />
        </button>
      </div>
    </div>
  );
};

export default Toast;