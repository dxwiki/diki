'use client';

import React, { useEffect, useRef } from 'react';
import { Particle, CONSTANTS } from '@/libs/DSParticleSystem';

interface DSParticleStreamProps {
  width?: number;
  height?: number;
}

export default function DSParticleStream({
  width = 250,
  height = 400,
}: DSParticleStreamProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const particlesRef = useRef<Particle[]>([]);
  const animationFrameRef = useRef<number>();
  const connectionPhaseRef = useRef<number>(0);
  const lastTimeRef = useRef<number>(0);
  const lastFlashTimeRef = useRef<number>(0);
  const currentFlashIntervalRef = useRef<number>(Math.random());

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const PARTICLE_COUNT = 60;

    canvas.width = width;
    canvas.height = height;

    // Initialize particles
    particlesRef.current = Array.from({ length: PARTICLE_COUNT }, () => {
      const particle = new Particle();
      particle.radius = (Math.random() * (CONSTANTS.MAX_RADIUS - CONSTANTS.MIN_RADIUS)) + CONSTANTS.MIN_RADIUS;
      return particle;
    });

    function animate(currentTime: number) {
      if (!ctx || !canvas) return;

      const deltaTime = (currentTime - lastTimeRef.current) / 1000;
      lastTimeRef.current = currentTime;

      lastFlashTimeRef.current += deltaTime;
      if (lastFlashTimeRef.current > currentFlashIntervalRef.current) {
        lastFlashTimeRef.current = 0;
        currentFlashIntervalRef.current = Math.random();

        const availableParticles = particlesRef.current.filter((p) => !p.isFlashing);
        const flashCount = Math.floor(Math.random() * 4);

        for (let i = 0; i < Math.min(flashCount, availableParticles.length); i++) {
          const randomIndex = Math.floor(Math.random() * availableParticles.length);
          const particle = availableParticles[randomIndex];
          particle.isFlashing = true;
          particle.flashProgress = 0;
          availableParticles.splice(randomIndex, 1);
        }
      }

      ctx.clearRect(0, 0, canvas.width, canvas.height);

      connectionPhaseRef.current += 0.005;
      particlesRef.current.forEach((particle) =>
        particle.update(ctx, deltaTime, particlesRef.current, connectionPhaseRef.current, width, height)
      );

      animationFrameRef.current = requestAnimationFrame(animate);
    }

    animate(0);

    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, [width, height]);

  return (
    <div className="relative w-full min-h-[300px] rounded-2xl overflow-hidden shadow-lg border-2 border-white/10 backdrop-blur-md">
      <div className="absolute inset-0 bg-gradient-radial from-[rgba(70,0,0,0.8)] via-[rgba(35,0,0,0.8)] to-[rgba(20,0,0,0.8)]" />
      <canvas
        ref={canvasRef}
        className="relative z-10 size-full"
      />
    </div>
  );
}