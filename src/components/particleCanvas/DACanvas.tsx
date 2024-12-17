'use client';

import React, { useEffect, useRef } from 'react';
import { Particle } from '@/libs/DAParticleSystem';
import { useTheme } from 'next-themes';

interface ParticleStreamProps {
  width?: number;
  height?: number;
  title?: string;
  score?: number;
  description?: string;
}

export default function DACanvas(props: ParticleStreamProps) {
  const { width = 250, height = 400, title, score, description } = props;
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
    <div className="relative w-full min-h-[300px] rounded-2xl overflow-hidden
      shadow-[0_0_15px_rgba(0,0,0,0.1)] dark:shadow-[0_0_15px_rgba(255,255,255,0.1)]
      border-2 border-black/5 dark:border-white/10
      bg-white/30 dark:bg-black/30 backdrop-blur-md
      before:absolute before:inset-0 before:z-0
      before:bg-gradient-to-b before:from-transparent before:to-white/5 dark:before:to-white/10"
    >
      <div className="absolute top-2 right-2 text-sub backdrop-blur-md rounded px-2">
        {'DA | L'}
        <span className='text-green-400'>{score}</span>
      </div>
      <div className='absolute bottom-2 left-2 mr-2 min-h-[100px] space-y-1'>
        <div className='text-green-400 text-lg font-bold inline-block bg-background/20 dark:bg-background/80 backdrop-blur-md rounded px-2'>
          {title}
        </div>
        <div className='text-sub inline-block bg-background/20 dark:bg-background/80 backdrop-blur-md rounded-lg px-2'>
          {description}
        </div>
      </div>
      <canvas
        ref={canvasRef}
        className="relative z-10 size-full"
      />
    </div>
  );
}