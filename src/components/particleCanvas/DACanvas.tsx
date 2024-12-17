'use client';

import React, { useEffect, useRef } from 'react';
import { Particle } from '@/libs/DAParticleSystem';
import { useTheme } from 'next-themes';

interface ParticleStreamProps {
  width?: number;
  height?: number;
}

export default function DACanvas({
  width = 250,
  height = 400,
}: ParticleStreamProps) {
  const { theme } = useTheme();
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const particlesRef = useRef<Particle[]>([]);
  const animationFrameRef = useRef<number>();

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const MAX_DEPTH = 2000;
    const PARTICLE_COUNT = 70;

    canvas.width = width;
    canvas.height = height;

    // Theme-aware particle initialization
    particlesRef.current = Array.from(
      { length: PARTICLE_COUNT },
      () => new Particle(width, height, MAX_DEPTH)
    );

    function animate() {
      if(!ctx) return;

      // Clear with transparency
      ctx.clearRect(0, 0, width, height);

      particlesRef.current.forEach((particle) => particle.update(ctx, particlesRef.current));
      animationFrameRef.current = requestAnimationFrame(animate);
    }

    animate();

    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, [width, height, theme]); // theme 의존성 추가

  return (
    <div className="relative w-full min-h-[300px] rounded-2xl overflow-hidden shadow-lg border-2 border-black/10 dark:border-white/10 backdrop-blur-md">
      {/* <div className="absolute inset-0 bg-gradient-radial from-[rgba(0,100,0,0.4)] via-[rgba(0,80,0,0.3)] to-[rgba(0,60,0,0.2)] dark:from-[rgba(0,70,0,0.8)] dark:via-[rgba(0,40,0,0.8)] dark:to-[rgba(0,20,0,0.8)]" />
      <div className="absolute inset-0 bg-gradient-to-tr from-[rgba(144,238,144,0.1)] via-[rgba(0,255,0,0.05)] to-[rgba(0,100,0,0.02)] dark:from-[rgba(0,255,0,0.05)] dark:via-[rgba(0,200,0,0.02)] dark:to-[rgba(0,150,0,0.01)]" /> */}
      <canvas
        ref={canvasRef}
        className="relative z-10 size-full"
      />
    </div>
  );
}