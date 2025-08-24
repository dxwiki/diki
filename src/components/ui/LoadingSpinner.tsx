interface LoadingSpinnerProps {
  size?: number;
  fixed?: boolean;
  text?: string;
}

const LoadingSpinner = ({ size = 8, fixed = true, text = 'Diki 검색중...' }: LoadingSpinnerProps) => {
  const containerClass = fixed
    ? 'fixed inset-0 flex items-center justify-center bg-background/80 backdrop-blur-sm z-50'
    : 'flex items-center justify-center';

  return (
    <div className={containerClass}>
      <div
        className="border-y-2 border-primary rounded-full animate-spin"
        style={{ width: `${ size }px`, height: `${ size }px` }}
      />
      {text && <span className="ml-3 text-sm sm:text-base text-gray1">{text}</span>}
    </div>
  );
};

export default LoadingSpinner;