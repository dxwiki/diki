'use client';
import Link from 'next/link';

interface TooltipButtonProps {
  onClick?: ()=> void;
  tooltip: string;
  children: React.ReactNode;
  isLink?: boolean;
  href?: string;
  className?: string;
}

const TooltipButton = ({ onClick, tooltip, children, isLink = false, href, className }: TooltipButtonProps) => {
  const buttonClasses = 'border border-extreme-light rounded-md hover:bg-extreme-light text-gray1 hover:text-sub block';

  return (
    <div className="relative group">
      {isLink ? (
        <Link href={href!} className={`${buttonClasses} ${className}`}>
          {children}
        </Link>
      ) : (
        <button onClick={onClick} className={`${buttonClasses} ${className}`}>
          {children}
        </button>
      )}
      <div
        className="animate-slideDown absolute -bottom-8 hidden group-hover:block
          bg-extreme-light text-main text-xs py-1 px-2 rounded whitespace-nowrap
          z-50 before:content-[''] before:absolute before:top-[-4px] before:left-[10px]
          before:size-0 before:border-x-4 before:border-x-transparent before:border-b-4
          before:border-b-extreme-light"
      >L
        {tooltip}
      </div>
    </div>
  );
};

export default TooltipButton;