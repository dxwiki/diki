'use client';

import { useState, useEffect } from 'react';
import { Slider as MUISlider, styled } from '@mui/material';

interface CreateSliderProps {
  displayLevels: string[];
  value: number; // 1~5 범위의 값을 받음
  onChange: (newValue: number)=> void; // 1~5 범위의 값을 반환
}

// Styled MUI Slider component
const StyledSlider = styled(MUISlider)(() => ({
  color: 'var(--primary)',
  height: 3,
  '& .MuiSlider-thumb': {
    height: 12,
    width: 12,
    margin: 0,
    backgroundColor: 'var(--primary)',
    '&:focus, &:hover, &.Mui-active': {
      boxShadow: '0 0 0 8px var(--primary-opacity)',
    },
  },
  '& .MuiSlider-rail': {
    backgroundColor: 'var(--gray4)',
    opacity: 1,
  },
  '& .MuiSlider-track': {
    height: 3,
  },
  '& .MuiSlider-mark': {
    backgroundColor: 'var(--gray3)',
  },
  '& .MuiSlider-markActive': {
    backgroundColor: 'var(--gray4)',
  },
  '& .MuiSlider-markLabel': {
    color: 'var(--gray3)',
    fontSize: '12px',
  },
  '& .MuiSlider-markLabelActive': {
    color: 'var(--accent)',
  },
  '& .css-swtyag-MuiSlider-markLabel, .css-1qb795b-MuiSlider-markLabel': {
    fontFamily: 'Pretendard',
    top: '25px',
  },
}));

const CreateSlider = ({ displayLevels, value, onChange }: CreateSliderProps) => {
  const displayIndex = value - 1;
  const [sliderValue, setSliderValue] = useState<number>(
    ((displayIndex) / (displayLevels.length - 1)) * 100
  );

  const marks = displayLevels.map((level, index) => ({
    value: (index / (displayLevels.length - 1)) * 100,
    label: level,
  }));

  const stepValues = displayLevels.map((_, index) =>
    (index / (displayLevels.length - 1)) * 100
  );

  // 외부 값 변경 시 내부 값 업데이트
  useEffect(() => {
    const displayIndex = value - 1;
    setSliderValue((displayIndex / (displayLevels.length - 1)) * 100);
  }, [value, displayLevels.length]);

  const handleChange = (_event: Event, newValue: number | number[]) => {
    if (typeof newValue === 'number') {
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
      <StyledSlider
        value={sliderValue}
        onChange={handleChange}
        marks={marks}
        min={0}
        max={100}
        disableSwap={true}
      />
    </div>
  );
};

export default CreateSlider;