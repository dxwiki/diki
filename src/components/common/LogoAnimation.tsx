'use client';

import { useState, useEffect, useRef } from 'react';

interface LogoAnimationProps {
  fontSize?: string;
  delayAnimation?: boolean;
}

interface LogoText {
  prefix: string;
  key: number;
}

const LogoAnimation = ({ fontSize = '4rem', delayAnimation = true }: LogoAnimationProps) => {
  const [currentLogo, setCurrentLogo] = useState<LogoText>({ prefix: 'DataW', key: 0 });
  const [isAnimating, setIsAnimating] = useState(false);
  const [nextLogo, setNextLogo] = useState<LogoText>({ prefix: 'D', key: 1 });
  const [animationEnabled, setAnimationEnabled] = useState(!delayAnimation);
  const responsiveFontSize = `clamp(4rem, ${ fontSize }, 10rem)`;
  const animationStarted = useRef(false);

  useEffect(() => {
    if (delayAnimation && !animationStarted.current) {
      const timer = setTimeout(() => {
        setAnimationEnabled(true);
        animationStarted.current = true;
      }, 2000);

      return () => clearTimeout(timer);
    }
  }, [delayAnimation]);

  useEffect(() => {
    if (!animationEnabled) return;

    const logos: LogoText[] = [
      { prefix: 'DataW', key: 0 },
      { prefix: 'D', key: 1 },
    ];

    const interval = setInterval(() => {
      setIsAnimating(true);

      const nextIndex = (logos.findIndex((logo) => logo.key === currentLogo.key) + 1) % logos.length;
      const upcomingLogo = logos[nextIndex];
      setNextLogo(upcomingLogo);

      setTimeout(() => {
        setCurrentLogo(upcomingLogo);
        setIsAnimating(false);
      }, 400);
    }, 3000);

    return () => clearInterval(interval);
  }, [currentLogo, animationEnabled]);

  return (
    <div className="relative">
      <h1 className="sr-only">{'Diki, DataWiki, 디키, 데이터위키'}</h1>

      <div className="flex font-bold text-main" style={{ fontSize : responsiveFontSize }}>
        <div className="relative flex justify-end overflow-hidden w-[6ch]">
          {/* 현재 텍스트 */}
          <span
            className={`absolute flex justify-end top-0 right-0 w-full text-primary ${
              isAnimating && animationEnabled ? 'animate-slideDownOut' : ''
            }`}
          >
            {currentLogo.prefix}
          </span>
          {/* 다음 텍스트 */}
          {isAnimating && animationEnabled && (
            <span
              className="absolute flex justify-end top-0 right-0 w-full text-primary animate-slideDownIn"
            >
              {nextLogo.prefix}
            </span>
          )}
        </div>
        <span className="text-main">{'iki'}</span>
      </div>
    </div>
  );
};

export default LogoAnimation;
