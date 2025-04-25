const LoadingSpinner = () => {
  return (
    <div className="fixed inset-0 flex items-center justify-center bg-background/80 backdrop-blur-sm z-50">
      <div className="size-8 border-y-2 border-primary rounded-full animate-spin" />
      <span className="ml-3 text-sm sm:text-base text-gray1">{'Diki 검색중...'}</span>
    </div>
  );
};

export default LoadingSpinner;