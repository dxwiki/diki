'use client';

import { useState, useEffect, useRef, useCallback } from 'react';

interface SliderProps {
  displayLevels: string[];
  range: [number, number];
  onRangeChange: (newRange: [number, number])=> void;
}

const Slider = ({ displayLevels, range, onRangeChange }: SliderProps) => {
  const sliderRef = useRef<HTMLDivElement>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [activeHandle, setActiveHandle] = useState<'start' | 'end' | null>(null);

  const getPositionFromValue = (value: number) => {
    return (value / (displayLevels.length - 1)) * 100;
  };

  const handleMouseDown = (e: React.MouseEvent, handle: 'start' | 'end') => {
    e.preventDefault();
    setIsDragging(true);
    setActiveHandle(handle);
  };

  const handleMouseMove = useCallback((e: MouseEvent) => {
    if (!isDragging || !activeHandle) return;

    const getValueFromPosition = (position: number) => {
      const bounds = sliderRef.current?.getBoundingClientRect();
      if (!bounds) return 0;

      const percent = Math.max(0, Math.min(100, (position - bounds.left) / bounds.width * 100));
      const index = Math.round((percent / 100) * (displayLevels.length - 1));
      return Math.max(0, Math.min(displayLevels.length - 1, index));
    };

    const newValue = getValueFromPosition(e.clientX);
    const newRange: [number, number] = [...range];

    if (activeHandle === 'start') {
      newRange[0] = Math.min(newValue, range[1]);
    } else {
      newRange[1] = Math.max(newValue, range[0]);
    }

    onRangeChange(newRange);
  }, [isDragging, activeHandle, range, onRangeChange, displayLevels.length]);

  const handleMouseUp = () => {
    setIsDragging(false);
    setActiveHandle(null);
  };

  const handleTrackClick = useCallback((e: React.MouseEvent) => {
    const bounds = sliderRef.current?.getBoundingClientRect();
    if (!bounds) return;

    const percent = Math.max(0, Math.min(100, (e.clientX - bounds.left) / bounds.width * 100));
    const clickedValue = (percent / 100) * (displayLevels.length - 1);
    const clampedValue = Math.max(0, Math.min(displayLevels.length - 1, clickedValue));

    // 클릭한 위치가 시작 핸들과 끝 핸들 사이에 있는지 확인
    if (clampedValue > range[0] && clampedValue < range[1]) {
      // 클릭한 위치가 어느 핸들에 더 가까운지 계산
      const distanceToStart = Math.abs(clampedValue - range[0]);
      const distanceToEnd = Math.abs(clampedValue - range[1]);

      const newRange: [number, number] = [...range];
      if (distanceToStart <= distanceToEnd) {
        newRange[0] = Math.round(clampedValue);
      } else {
        newRange[1] = Math.round(clampedValue);
      }
      onRangeChange(newRange);
    } else {
      // 클릭한 위치가 범위 밖에 있는 경우, 가장 가까운 핸들을 이동
      const newRange: [number, number] = [...range];
      if (clampedValue <= range[0]) {
        newRange[0] = Math.round(clampedValue);
      } else {
        newRange[1] = Math.round(clampedValue);
      }
      onRangeChange(newRange);
    }
  }, [range, onRangeChange, displayLevels.length]);

  useEffect(() => {
    if (isDragging) {
      window.addEventListener('mousemove', handleMouseMove);
      window.addEventListener('mouseup', handleMouseUp);
    }
    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
    };
  }, [isDragging, activeHandle, handleMouseMove]);

  return (
    <div className="relative w-full h-12 px-2">
      {/* Level Markers */}
      {displayLevels.map((level, index) => (
        <div
          key={index}
          className="absolute top-1 text-center text-[13px] text-gray3 w-10 cursor-pointer z-10"
          style={{
            left: `${ getPositionFromValue(index) + 4.5 }%`,
            transform: 'translateX(-50%)',
          }}
          onClick={(e) => {
            e.stopPropagation();

            // 클릭한 마커가 현재 범위 내에 있는지 확인
            if (index > range[0] && index < range[1]) {
              // 더 가까운 핸들을 이동
              const distanceToStart = Math.abs(index - range[0]);
              const distanceToEnd = Math.abs(index - range[1]);

              const newRange: [number, number] = [...range];
              if (distanceToStart <= distanceToEnd) {
                newRange[0] = index;
              } else {
                newRange[1] = index;
              }
              onRangeChange(newRange);
            } else {
              // 범위 밖에 있는 경우 가장 가까운 핸들을 이동
              const newRange: [number, number] = [...range];
              if (index <= range[0]) {
                newRange[0] = index;
              } else {
                newRange[1] = index;
              }
              onRangeChange(newRange);
            }
          }}
        >
          {level}
        </div>
      ))}

      {/* Start Level Label */}
      <div
        className="absolute top-1 text-center text-[13px] text-primary w-10 z-10"
        style={{
          left: `${ getPositionFromValue(range[0]) + 4.5 }%`,
          transform: 'translateX(-50%)',
        }}
      >
        {displayLevels[range[0]]}
      </div>

      {/* End Level Label */}
      <div
        className="absolute top-1 text-center text-[13px] text-primary w-10 z-10"
        style={{
          left: `${ getPositionFromValue(range[1]) + 4.5 }%`,
          transform: 'translateX(-50%)',
        }}
      >
        {displayLevels[range[1]]}
      </div>

      {/* Background Track (Gray Bar) */}
      <div
        className="absolute top-6 w-full h-1 bg-gray4 z-0"
        style={{ top: '26px' }}
      />

      {/* Slider Track with Invisible Padding */}
      <div
        ref={sliderRef}
        className="absolute top-6 w-full h-1 cursor-pointer z-20"
        onClick={handleTrackClick}
        style={{ padding: '10px 0', marginTop: '-10px', backgroundColor: 'transparent' }}
      >
        {/* Level Markers on Track */}
        {displayLevels.map((_, index) => (
          <div
            key={index}
            className="absolute w-px h-2 bg-gray3 top-[8px] z-10"
            style={{
              left: `${ getPositionFromValue(index) }%`,
              transform: 'translateX(-50%)',
            }}
          />
        ))}

        {/* Selected Range */}
        <div
          className="absolute h-1 bg-primary rounded-full top-[12px] z-10"
          style={{
            left: `${ getPositionFromValue(range[0]) }%`,
            right: `${ 100 - getPositionFromValue(range[1]) }%`,
          }}
        />

        {/* Handles */}
        <div
          className={`absolute size-3 -mt-px ml-[-6px] bg-primary rounded-full cursor-pointer z-30 ${
            activeHandle === 'start' ? 'ring-4 ring-primary/10 dark:ring-primary/30' : ''
          }`}
          style={{ left: `${ getPositionFromValue(range[0]) }%`, top: '9px' }}
          onMouseDown={(e) => handleMouseDown(e, 'start')}
        />
        <div
          className={`absolute size-3 -mt-px ml-[-6px] bg-primary rounded-full cursor-pointer z-30 ${
            activeHandle === 'end' ? 'ring-4 ring-primary/10 dark:ring-primary/30' : ''
          }`}
          style={{ left: `${ getPositionFromValue(range[1]) }%`, top: '9px' }}
          onMouseDown={(e) => handleMouseDown(e, 'end')}
        />
      </div>
    </div>
  );
};

export default Slider;
