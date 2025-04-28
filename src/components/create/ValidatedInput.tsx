import { useState, useEffect } from 'react';

interface ValidationHookOptions {
  formSelector?: string;
}

export const useFormValidation = (options: ValidationHookOptions = {}) => {
  const { formSelector = 'form' } = options;
  const [showValidation, setShowValidation] = useState(false);

  // HTML 폼 제출 시 발생하는 이벤트 리스너 추가
  useEffect(() => {
    const handleInvalid = () => {
      setShowValidation(true);
    };

    // form 요소에 invalid 이벤트 리스너 추가
    const form = document.querySelector(formSelector);
    if (form) {
      form.addEventListener('invalid', handleInvalid, true);
      form.addEventListener('submit', () => setShowValidation(true), true);
    }

    return () => {
      if (form) {
        form.removeEventListener('invalid', handleInvalid, true);
        form.removeEventListener('submit', () => setShowValidation(true), true);
      }
    };
  }, [formSelector]);

  const getInputClassName = (
    value: string | undefined | null,
    baseClass = 'w-full p-2 border rounded-md',
    errorClass = 'border-level-5'
  ) => {
    if (showValidation && (!value || value.trim() === '')) {
      return `${ baseClass } ${ errorClass }`;
    }
    return `${ baseClass } border-gray4`;
  };

  return { showValidation, setShowValidation, getInputClassName };
};

// 유효성 검사 오류 또는 안내 메시지를 표시하는 컴포넌트
interface InputFeedbackProps {
  value: string | undefined | null;
  errorMessage: string;
  guidanceMessage?: string;
  showValidation: boolean;
}

export const InputFeedback = ({ 
  value, 
  errorMessage, 
  guidanceMessage, 
  showValidation 
}: InputFeedbackProps) => {
  const hasError = showValidation && (!value || value.trim() === '');
  
  if (hasError) {
    return (
      <p className="text-sm text-level-5 ml-1">{errorMessage}</p>
    );
  } else if (guidanceMessage) {
    return (
      <p className="text-sm text-gray2 ml-1">{guidanceMessage}</p>
    );
  }
  
  return null;
};