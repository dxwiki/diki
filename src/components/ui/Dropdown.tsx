'use client';

import { useContext, ReactNode, useRef, useEffect } from 'react';
import {
  DropdownContext,
  DropdownProvider,
} from '@/components/ui/DropdownProvider';

const Dropdown = ({ children }: { children: ReactNode }) => {
  return <DropdownProvider>{children}</DropdownProvider>;
};

// DropdownTrigger 컴포넌트
const DropdownTrigger = ({ children }: { children: React.ReactElement }) => {
  const { toggle } = useContext(DropdownContext);

  // 이벤트 전파를 막아 외부 클릭 핸들러와 충돌하지 않도록 함
  const handleClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    toggle();
  };

  return <div onClick={handleClick}>{children}</div>;
};

// DropdownList 컴포넌트
const DropdownList = ({
  children,
  align = 'start',
}: {
  children: ReactNode;
  align?: 'start' | 'end';
}) => {
  const { isOpen, close } = useContext(DropdownContext);
  const contentRef = useRef<HTMLDivElement>(null);

  // 메뉴 외부를 클릭했을 때 닫기 위한 이벤트 핸들러
  useEffect(() => {
    // 전역 클릭 이벤트 핸들러
    const handleGlobalClick = (event: MouseEvent) => {
      // contentRef가 참조하는 요소가 클릭된 것이 아니라면 드롭다운을 닫음
      if (isOpen && contentRef.current && !contentRef.current.contains(event.target as Node)) {
        close();
      }
    };

    // 스크롤 이벤트 핸들러
    const handleScroll = () => {
      if (isOpen) {
        close();
      }
    };

    // 이벤트 리스너 등록
    document.addEventListener('click', handleGlobalClick, true);
    window.addEventListener('scroll', handleScroll, true);

    // 컴포넌트 언마운트 시 이벤트 리스너 제거
    return () => {
      document.removeEventListener('click', handleGlobalClick, true);
      window.removeEventListener('scroll', handleScroll, true);
    };
  }, [isOpen, close]);

  // 메뉴 내부 클릭 시 이벤트 전파 방지
  const handleMenuClick = (e: React.MouseEvent) => {
    e.stopPropagation();
  };

  return isOpen ? (
    <div
      ref={contentRef}
      className={`animate-slideDown absolute flex flex-col p-1 z-40 mt-2 min-w-36 rounded-lg bg-background border border-secondary shadow-lg ring-1 ring-black/5 transition duration-200 ease-out ${
        align === 'end' ? 'right-0' : 'left-0'
      }`}
      onClick={handleMenuClick}
    >
      {children}
    </div>
  ) : null;
};

// DropdownItem 컴포넌트
const DropdownItem = ({
  children,
  onClick,
  className,
  ariaLabel,
}: {
  children: ReactNode;
  onClick?: ()=> void;
  className?: string;
  ariaLabel?: string;
}) => {
  const { close } = useContext(DropdownContext);

  const handleItemClick = () => {
    if (onClick) onClick();
    close();
  };

  return (
    <div
      className={`w-full rounded-md transition-colors duration-150 ease-in-out text-sm hover:bg-background-secondary cursor-pointer ${ className }`}
      onClick={handleItemClick}
      aria-label={ariaLabel}
    >
      {children}
    </div>
  );
};

export {
  DropdownContext,
  Dropdown,
  DropdownTrigger,
  DropdownList,
  DropdownItem,
};
