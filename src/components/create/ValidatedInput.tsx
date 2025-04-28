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
  showValidation,
}: InputFeedbackProps) => {
  const hasError = showValidation && (!value || value.trim() === '');

  // 에러와 안내 메시지를 모두 보여줄 수 있도록 변경
  return (
    <>
      {hasError && (
        <p className="text-sm text-level-5 ml-1">{errorMessage}</p>
      )}
      {guidanceMessage && (
        <p className="text-sm text-primary ml-1">{guidanceMessage}</p>
      )}
    </>
  );
};

// 기존 InputFeedback은 그대로 유지하고, 새로운 조건부 안내 메시지 컴포넌트 추가
interface IsolatedGuidanceMessageProps {
  value: string | undefined | null;
  guidanceMessage: string;
  showValidation: boolean;
}

export const IsolatedGuidanceMessage = ({
  value,
  guidanceMessage,
  showValidation,
}: IsolatedGuidanceMessageProps) => {
  const hasError = showValidation && (!value || value.trim() === '');

  return (
    <>
      {hasError && guidanceMessage && (
        <p className="text-sm text-primary ml-1">{guidanceMessage}</p>
      )}
    </>
  );
};