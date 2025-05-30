'use client';

import { useState, useEffect, useMemo } from 'react';
import BaseSlider from './BaseSlider';

interface CreateSliderProps {
  displayLevels: string[];
  value: number; // 1~5 범위의 값을 받음
  onChange: (newValue: number)=> void; // 1~5 범위의 값을 반환
}

const CreateSlider = ({ displayLevels, value, onChange }: CreateSliderProps) => {
  const displayIndex = value - 1;
  const [sliderValue, setSliderValue] = useState<number>(
    ((displayIndex) / (displayLevels.length - 1)) * 100
  );
  const [dragValue, setDragValue] = useState<number | null>(null);

  // 마크와 스텝 값 메모이제이션
  const marks = useMemo(() => displayLevels.map((level, index) => ({
    value: (index / (displayLevels.length - 1)) * 100,
    label: level,
  })), [displayLevels]);

  const stepValues = useMemo(() => displayLevels.map((_, index) =>
    (index / (displayLevels.length - 1)) * 100
  ), [displayLevels]);

  // 외부 값 변경 시 내부 값 업데이트
  useEffect(() => {
    const displayIndex = value - 1;
    setSliderValue((displayIndex / (displayLevels.length - 1)) * 100);
  }, [value, displayLevels.length]);

  const handleChange = (_event: Event, newValue: number | number[]) => {
    if (typeof newValue === 'number') {
      setDragValue(newValue);
    }
  };

  // 드래그 완료 시 처리
  const handleChangeCommitted = (_event: React.SyntheticEvent | Event, newValue: number | number[]) => {
    if (typeof newValue === 'number') {
      setDragValue(null);

      const closestStep = stepValues.reduce((prev, curr) =>
        Math.abs(curr - newValue) < Math.abs(prev - newValue) ? curr : prev
      );

      setSliderValue(closestStep);

      const displayIndex = stepValues.indexOf(closestStep);

      if (displayIndex !== -1 && displayIndex + 1 !== value) {
        onChange(displayIndex + 1);
      }
    }
  };

  return (
    <div className="relative w-full">
      <BaseSlider
        value={dragValue !== null ? dragValue : sliderValue}
        onChange={handleChange}
        onChangeCommitted={handleChangeCommitted}
        marks={marks}
        min={0}
        max={100}
        disableSwap={true}
      />
    </div>
  );
};

export default CreateSlider;