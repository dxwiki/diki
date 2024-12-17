'use client';

import React, { useEffect, useRef } from 'react';
import { Node, Wave } from '@/libs/DEParticleSystem';
import { useTheme } from 'next-themes';

interface DEParticleStreamProps {
  width?: number;
  height?: number;
}

export default function DECanvas({
  width = 250,
  height = 400,
}: DEParticleStreamProps) {
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
    <div className="relative w-full min-h-[300px] rounded-2xl overflow-hidden shadow-lg border-2 border-white/10 backdrop-blur-md">
      <canvas
        ref={canvasRef}
        className="relative z-10 size-full"
      />
    </div>
  );
}