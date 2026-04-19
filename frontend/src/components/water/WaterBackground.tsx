"use client";

import { useEffect, useRef } from "react";

/**
 * Global animated water background.
 * Layers (bottom to top):
 *   1. Depth gradient — surface to abyss
 *   2. Ambient color orbs
 *   3. Caustic light — SVG turbulence, screen-blended
 *   4. Marine snow — canvas particle drift
 *   5. Edge vignette — pulls focus to center
 */
export default function WaterBackground() {
  return (
    <div
      aria-hidden
      className="pointer-events-none fixed inset-0 -z-10 overflow-hidden"
    >
      <div
        className="absolute inset-0"
        style={{
          background:
            "radial-gradient(ellipse 120% 80% at 50% -10%, #0f2747 0%, #081428 30%, #040a18 60%, #020610 100%)",
        }}
      />

      <div className="absolute top-[12%] left-[8%] w-[540px] h-[540px] rounded-full bg-flow/[0.06] blur-[130px]" />
      <div className="absolute top-[30%] right-[6%] w-[440px] h-[440px] rounded-full bg-clarity/[0.05] blur-[120px]" />
      <div className="absolute bottom-[8%] left-[28%] w-[380px] h-[380px] rounded-full bg-surface/15 blur-[100px]" />

      <Caustics />
      <MarineSnow />

      <div
        className="absolute inset-0"
        style={{
          background:
            "radial-gradient(ellipse at center, transparent 55%, rgba(0,0,0,0.55) 100%)",
        }}
      />
    </div>
  );
}

function Caustics() {
  return (
    <svg
      className="absolute inset-0 w-full h-full opacity-[0.09] mix-blend-screen"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden
    >
      <defs>
        <filter id="caustic-noise" x="0%" y="0%" width="100%" height="100%">
          <feTurbulence
            type="fractalNoise"
            baseFrequency="0.014"
            numOctaves="2"
            seed="7"
          >
            <animate
              attributeName="baseFrequency"
              values="0.011;0.019;0.011"
              dur="16s"
              repeatCount="indefinite"
            />
          </feTurbulence>
          <feColorMatrix
            type="matrix"
            values="0 0 0 0 0.24
                    0 0 0 0 0.75
                    0 0 0 0 0.95
                    0 0 0 1.4 -0.1"
          />
          <feGaussianBlur stdDeviation="1.3" />
        </filter>
      </defs>
      <rect width="100%" height="100%" filter="url(#caustic-noise)" />
    </svg>
  );
}

type Particle = {
  x: number;
  y: number;
  r: number;
  vy: number;
  sway: number;
  phase: number;
  alpha: number;
};

function MarineSnow() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const dpr = Math.max(1, window.devicePixelRatio || 1);
    let width = 0;
    let height = 0;

    const resize = () => {
      width = window.innerWidth;
      height = window.innerHeight;
      canvas.width = width * dpr;
      canvas.height = height * dpr;
      canvas.style.width = `${width}px`;
      canvas.style.height = `${height}px`;
      ctx.setTransform(1, 0, 0, 1, 0, 0);
      ctx.scale(dpr, dpr);
    };

    resize();
    window.addEventListener("resize", resize);

    const makeParticle = (): Particle => {
      const depth = Math.random();
      return {
        x: Math.random() * width,
        y: Math.random() * height,
        r: 0.5 + (1 - depth) * 1.6,
        vy: 0.05 + (1 - depth) * 0.28,
        sway: 0.15 + Math.random() * 0.45,
        phase: Math.random() * Math.PI * 2,
        alpha: 0.18 + (1 - depth) * 0.55,
      };
    };

    const particles: Particle[] = Array.from({ length: 90 }, makeParticle);

    let raf = 0;
    const tick = () => {
      ctx.clearRect(0, 0, width, height);
      for (const p of particles) {
        p.y -= p.vy;
        p.phase += 0.008;
        const x = p.x + Math.sin(p.phase) * p.sway;
        if (p.y < -6) {
          p.y = height + 6;
          p.x = Math.random() * width;
        }
        ctx.beginPath();
        ctx.arc(x, p.y, p.r, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(186, 230, 253, ${p.alpha})`;
        ctx.fill();
      }
      raf = requestAnimationFrame(tick);
    };
    tick();

    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("resize", resize);
    };
  }, []);

  return <canvas ref={canvasRef} className="absolute inset-0" aria-hidden />;
}
