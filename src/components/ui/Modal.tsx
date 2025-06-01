import React, { useEffect } from 'react';
import { X } from 'lucide-react';

interface ModalProps {
  isOpen: boolean;
  onClose: ()=> void;
  title: string;
  children: React.ReactNode;
}

export const Modal = ({ isOpen, onClose, title, children }: ModalProps) => {
  useEffect(() => {
    if (isOpen) {
      const scrollbarWidth = window.innerWidth - document.documentElement.clientWidth;
      document.body.style.overflow = 'hidden';
      document.body.style.paddingRight = `${ scrollbarWidth }px`;
    }

    return () => {
      document.body.style.overflow = 'unset';
      document.body.style.paddingRight = '0px';
    };
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <>
      <div
        className="fixed inset-0 bg-black/70 z-50"
        onClick={onClose}
      />
      <div
        className="min-w-[90vw] md:min-w-[40vw] xl:min-w-[25vw] fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 bg-gray5 rounded-lg p-4 z-50"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex justify-between items-center border-b border-gray3 pb-2 mb-4">
          <span className="text-lg font-semibold text-main">{title}</span>
          <button onClick={onClose} className="p-1">
            <X className="size-5 text-main" />
          </button>
        </div>

        <div>
          {children}
        </div>
      </div>
    </>
  );
};

interface ConfirmModalProps {
  isOpen: boolean;
  onClose: ()=> void;
  onConfirm: ()=> void;
  title: string;
  message: string;
  submessage?: string | React.ReactNode;
  confirmText?: string;
  cancelText?: string;
  confirmButtonClass?: string;
}

export const ConfirmModal = ({
  isOpen,
  onClose,
  onConfirm,
  title,
  message,
  submessage,
  confirmText = '확인',
  cancelText = '취소',
  confirmButtonClass = 'px-4 py-2 text-white bg-primary dark:bg-secondary hover:bg-accent dark:hover:bg-background-secondary rounded-md border-gray4',
}: ConfirmModalProps) => {
  return (
    <Modal isOpen={isOpen} onClose={onClose} title={title}>
      <div className="flex flex-col gap-0.5 mb-4 text-main">
        {message}
        {typeof submessage === 'string' ? <p className="text-gray1">{submessage}</p> : submessage}
      </div>
      <div className="flex justify-end space-x-2">
        <button
          onClick={onClose}
          className="px-4 py-2 text-gray2 rounded-md hover:text-main"
        >
          {cancelText}
        </button>
        <button
          onClick={() => {
            onConfirm();
            onClose();
          }}
          className={`${ confirmButtonClass }`}
        >
          {confirmText}
        </button>
      </div>
    </Modal>
  );
};