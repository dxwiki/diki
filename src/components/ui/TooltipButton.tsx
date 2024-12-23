'use client';
import Link from 'next/link';

interface TooltipButtonProps {
  onClick?: ()=> void;
  tooltip: string;
  children: React.ReactNode;
  isLink?: boolean;
  href?: string;
}

const TooltipButton = ({ onClick, tooltip, children, isLink = false, href }: TooltipButtonProps) => {
  const buttonClasses = 'p-2 border border-extreme-light rounded-md hover:bg-light text-gray1 hover:text-sub block';

  return (
    <div className="relative group">
      {isLink ? (
        <Link href={href!} className={buttonClasses}>
          {children}
        </Link>
      ) : (
        <button onClick={onClick} className={buttonClasses}>
          {children}
        </button>
      )}
      <div
        className="animate-slideDown absolute -bottom-8 hidden group-hover:block
          bg-light text-main text-xs py-1.5 px-2.5 rounded whitespace-nowrap
          z-50 before:content-[''] before:absolute before:top-[-4px] before:left-[10px]
          before:size-0 before:border-x-4 before:border-x-transparent before:border-b-4
          before:border-b-light"
      >
        {tooltip}
      </div>
    </div>
  );
};

export default TooltipButton;