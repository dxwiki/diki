'use client';

import React, { useEffect, useRef } from 'react';
import { Node, Wave } from '@/libs/DEParticleSystem';
import { useTheme } from 'next-themes';

interface DEParticleStreamProps {
  width?: number;
  height?: number;
  title: string;
  score: number;
  description: string;
}

export default function DECanvas(props: DEParticleStreamProps) {
  const { width = 250, height = 400, title, score, description } = props;
  const { theme } = useTheme();
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const nodesRef = useRef<Node[]>([]);
  const wavesRef = useRef<Wave[]>([]);
  const animationFrameRef = useRef<number>();

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const MAX_DEPTH = 1500;
    const NODE_COUNT = 25;
    const WAVE_COUNT = 20;

    canvas.width = width;
    canvas.height = height;

    // Initialize nodes and waves with theme-dependent colors
    nodesRef.current = Array.from(
      { length: NODE_COUNT },
      () => new Node(width, height, MAX_DEPTH)
    );

    wavesRef.current = Array.from(
      { length: WAVE_COUNT },
      () => new Wave(width, height)
    );

    function animate() {
      if(!ctx) return;
      ctx.clearRect(0, 0, width, height);

      // Update waves and nodes
      wavesRef.current.forEach((wave) => wave.update(ctx));
      nodesRef.current.forEach((node) => node.update(ctx));

      animationFrameRef.current = requestAnimationFrame(animate);
    }

    animate();

    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, [width, height, theme]); // theme을 의존성 배열에 추가

  return (
    <div className="relative w-full min-h-[300px] rounded-2xl overflow-hidden
      shadow-[0_0_15px_rgba(0,0,0,0.1)] dark:shadow-[0_0_15px_rgba(255,255,255,0.1)]
      border-2 border-black/5 dark:border-white/10
      bg-white/30 dark:bg-black/30 backdrop-blur-md
      before:absolute before:inset-0 before:z-0
      before:bg-gradient-to-b before:from-transparent before:to-white/5 dark:before:to-white/10"
    >
      <div className="absolute top-2 right-2 text-sub backdrop-blur-sm rounded px-2">
        {'DA | L'}
        <span className='text-yellow-400'>{score}</span>
      </div>
      <div className='absolute bottom-2 left-2 mr-2 min-h-[100px] space-y-1'>
        <div className='text-yellow-400 text-lg font-bold inline-block bg-background/20 dark:bg-background/80 backdrop-blur-sm rounded px-2'>
          {title}
        </div>
        <div className='text-sub inline-block bg-background/20 dark:bg-background/80 backdrop-blur-sm rounded-lg px-2'>
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