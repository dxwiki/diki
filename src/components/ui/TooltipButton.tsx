'use client';
import Link from 'next/link';

interface TooltipButtonProps {
  onClick?: ()=> void;
  tooltip: string;
  children: React.ReactNode;
  isLink?: boolean;
  href?: string;
}

const TooltipButton = ({ onClick, tooltip, children, isLink, href }: TooltipButtonProps) => {
  const buttonClasses = 'p-2 border border-extreme-light rounded-md hover:bg-extreme-light text-gray1 hover:text-sub block';

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
      <div className="animate-slideDown absolute -bottom-8 hidden group-hover:block bg-extreme-light text-main text-xs py-1 px-2 rounded whitespace-nowrap">
        {tooltip}
      </div>
    </div>
  );
};

export default TooltipButton;