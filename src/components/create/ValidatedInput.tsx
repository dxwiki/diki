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