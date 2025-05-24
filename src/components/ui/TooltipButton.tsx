'use client';
import Link from 'next/link';

interface TooltipButtonProps {
  onClick?: ()=> void;
  tooltip?: string;
  children: React.ReactNode;
  isLink?: boolean;
  href?: string;
  className?: string;
  ariaLabel?: string;
}

const TooltipButton = ({ onClick, tooltip, children, isLink = false, href, className, ariaLabel }: TooltipButtonProps) => {
  return (
    <div className="relative group flex items-end">
      {isLink ? (
        <Link href={href!} className={`${ className }`} aria-label={ariaLabel}>
          {children}
        </Link>
      ) : (
        <button onClick={onClick} className={`${ className }`} aria-label={ariaLabel}>
          {children}
        </button>
      )}
      {tooltip && (
        <div
          className="animate-slideDown absolute -bottom-8 hidden group-hover:block shadow-md
          bg-background-secondary text-main text-xs py-1 px-2 rounded whitespace-nowrap
          z-50 before:content-[''] before:absolute before:top-[-4px] before:left-[12px]
          before:size-0 before:border-x-4 before:border-x-transparent before:border-b-4
          before:border-b-background-secondary"
        >
          <span className='font-semibold'>{tooltip}</span>
        </div>
      )}
    </div>
  );
};

export default TooltipButton;