"use client";

import { useEffect, useState } from "react";

/**
 * Stylized deep-sea background.
 * Layers (bottom to top):
 *   1. Vertical depth gradient — teal surface to midnight abyss
 *   2. Surface light glow — top-center bloom like distant sunlight
 *   3. Chunky godrays — crisp angled beams from the surface
 *   4. Kelp silhouettes — swaying strands at the left/right edges
 *   5. Rising bubble streams — drifting from the abyss up to the surface
 *   6. Edge vignette
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
            "linear-gradient(to bottom, #2e7aa6 0%, #1a568a 14%, #0e3a6b 34%, #062040 58%, #030d24 82%, #01060f 100%)",
        }}
      />

      <div
        className="absolute top-0 left-1/2 -translate-x-1/2 w-[900px] h-[420px] rounded-full blur-[90px]"
        style={{ background: "rgba(186, 230, 253, 0.18)" }}
      />

      <Godrays />
      <Kelp side="left" />
      <Kelp side="right" />
      <MarineLife />
      <Bubbles />

      <div
        className="absolute inset-0"
        style={{
          background:
            "radial-gradient(ellipse at center, transparent 50%, rgba(0,0,0,0.55) 100%)",
        }}
      />

      <style>{`
        @keyframes bubble-rise {
          0%   { transform: translate3d(0, 0, 0) scale(0.8); opacity: 0; }
          8%   { opacity: 1; transform: translate3d(0, -6vh, 0) scale(1); }
          90%  { opacity: 0.85; }
          100% { transform: translate3d(var(--bubble-drift, 20px), -115vh, 0) scale(1.05); opacity: 0; }
        }
        @keyframes godray-drift {
          0%, 100% { transform: translateX(0) skewX(-9deg); }
          50%      { transform: translateX(50px) skewX(-9deg); }
        }
        @keyframes kelp-sway-left {
          0%, 100% { transform: rotate(-2deg); }
          50%      { transform: rotate(2.5deg); }
        }
        @keyframes kelp-sway-right {
          0%, 100% { transform: rotate(2deg); }
          50%      { transform: rotate(-2.5deg); }
        }
        @keyframes fish-drift-right {
          0%   { transform: translateX(-20vw) translateY(0); }
          50%  { transform: translateX(50vw) translateY(-18px); }
          100% { transform: translateX(120vw) translateY(0); }
        }
        @keyframes fish-drift-left {
          0%   { transform: translateX(120vw) translateY(0) scaleX(-1); }
          50%  { transform: translateX(50vw) translateY(14px) scaleX(-1); }
          100% { transform: translateX(-20vw) translateY(0) scaleX(-1); }
        }
        @keyframes fish-tail {
          0%, 100% { transform: scaleY(1); }
          50%      { transform: scaleY(0.78); }
        }
        @keyframes jelly-rise {
          0%   { transform: translateY(12vh); opacity: 0; }
          8%   { opacity: 1; }
          92%  { opacity: 1; }
          100% { transform: translateY(-118vh); opacity: 0; }
        }
        @keyframes jelly-pulse {
          0%, 100% { transform: scaleY(1) scaleX(1); }
          50%      { transform: scaleY(0.82) scaleX(1.1); }
        }
        @keyframes jelly-sway {
          0%, 100% { transform: translateX(0); }
          50%      { transform: translateX(60px); }
        }
      `}</style>
    </div>
  );
}

function Godrays() {
  const rays = [
    { left: "14%", width: 150, dur: "24s", delay: "0s",   opacity: 0.22 },
    { left: "36%", width: 90,  dur: "30s", delay: "-8s",  opacity: 0.16 },
    { left: "58%", width: 170, dur: "26s", delay: "-14s", opacity: 0.24 },
    { left: "78%", width: 100, dur: "34s", delay: "-4s",  opacity: 0.14 },
  ];
  return (
    <>
      {rays.map((r, i) => (
        <div
          key={i}
          className="absolute top-[-10vh] h-[140vh]"
          style={{
            left: r.left,
            width: r.width,
            background: `linear-gradient(to bottom,
              rgba(186, 230, 253, ${r.opacity}) 0%,
              rgba(125, 211, 252, ${r.opacity * 0.55}) 35%,
              rgba(56, 189, 248, 0) 100%)`,
            transform: "skewX(-9deg)",
            animation: `godray-drift ${r.dur} ease-in-out ${r.delay} infinite`,
            mixBlendMode: "screen",
            filter: "blur(1px)",
          }}
        />
      ))}
    </>
  );
}

type Bubble = {
  left: string;
  size: number;
  dur: number;
  delay: number;
  drift: number;
  opacity: number;
};

function Bubbles() {
  const [bubbles, setBubbles] = useState<Bubble[]>([]);

  useEffect(() => {
    const next: Bubble[] = Array.from({ length: 36 }, () => {
      const size = 4 + Math.random() * 16;
      return {
        left: `${Math.random() * 100}%`,
        size,
        dur: 14 + Math.random() * 18,
        delay: -Math.random() * 30,
        drift: (Math.random() - 0.5) * 80,
        opacity: 0.35 + Math.random() * 0.45,
      };
    });
    setBubbles(next);
  }, []);

  return (
    <>
      {bubbles.map((b, i) => (
        <div
          key={i}
          className="absolute bottom-[-6vh] rounded-full"
          style={{
            left: b.left,
            width: b.size,
            height: b.size,
            background: `radial-gradient(circle at 32% 30%,
              rgba(224, 242, 254, ${b.opacity * 1.2}) 0%,
              rgba(125, 211, 252, ${b.opacity * 0.5}) 55%,
              rgba(56, 189, 248, ${b.opacity * 0.2}) 100%)`,
            border: `1px solid rgba(186, 230, 253, ${b.opacity * 0.6})`,
            boxShadow: `inset 1px 1px 2px rgba(255,255,255,0.45), 0 0 6px rgba(125, 211, 252, 0.25)`,
            animation: `bubble-rise ${b.dur}s linear ${b.delay}s infinite`,
            ["--bubble-drift" as string]: `${b.drift}px`,
          }}
        />
      ))}
    </>
  );
}

function MarineLife() {
  return (
    <>
      {/* Small fish, drifting right, upper-mid depth */}
      <div
        className="absolute top-[26%] will-change-transform"
        style={{
          animation: "fish-drift-right 58s linear infinite",
          animationDelay: "-12s",
        }}
      >
        <Fish size={62} />
      </div>

      {/* Larger fish, drifting left, lower-mid depth */}
      <div
        className="absolute top-[58%] will-change-transform"
        style={{
          animation: "fish-drift-left 72s linear infinite",
          animationDelay: "-38s",
        }}
      >
        <Fish size={96} />
      </div>

      {/* Tiny fish, drifting right, higher */}
      <div
        className="absolute top-[14%] will-change-transform"
        style={{
          animation: "fish-drift-right 48s linear infinite",
          animationDelay: "-26s",
        }}
      >
        <Fish size={38} />
      </div>

      {/* Bioluminescent jellyfish — rises, sways, pulses */}
      <div
        className="absolute left-[38%] bottom-0 will-change-transform"
        style={{ animation: "jelly-rise 56s linear infinite" }}
      >
        <div style={{ animation: "jelly-sway 9s ease-in-out infinite" }}>
          <Jellyfish />
        </div>
      </div>

      {/* A second jelly further right, offset timing */}
      <div
        className="absolute left-[72%] bottom-0 will-change-transform"
        style={{
          animation: "jelly-rise 64s linear infinite",
          animationDelay: "-32s",
        }}
      >
        <div style={{ animation: "jelly-sway 11s ease-in-out infinite" }}>
          <Jellyfish small />
        </div>
      </div>
    </>
  );
}

function Fish({ size }: { size: number }) {
  return (
    <svg
      width={size}
      height={size * 0.42}
      viewBox="0 0 120 50"
      aria-hidden
      style={{ opacity: 0.78 }}
    >
      {/* body */}
      <path
        d="M 8 25
           C 8 10, 40 2, 72 14
           L 100 2
           L 96 25
           L 100 48
           L 72 36
           C 40 48, 8 40, 8 25 Z"
        fill="#020a1c"
      />
      {/* top fin */}
      <path d="M 48 13 L 62 4 L 66 14 Z" fill="#020a1c" />
      {/* bottom fin */}
      <path d="M 44 37 L 56 46 L 60 37 Z" fill="#020a1c" />
      {/* tail accent line */}
      <path
        d="M 100 2 L 96 25 L 100 48"
        stroke="#0a1a33"
        strokeWidth="1"
        fill="none"
        style={{ transformOrigin: "96px 25px", animation: "fish-tail 0.9s ease-in-out infinite" }}
      />
      {/* eye */}
      <circle cx="22" cy="22" r="1.6" fill="#7dd3fc" opacity="0.9" />
    </svg>
  );
}

function Jellyfish({ small }: { small?: boolean }) {
  const scale = small ? 0.65 : 1;
  const w = 80 * scale;
  const h = 140 * scale;
  return (
    <div style={{ position: "relative", width: w, height: h }}>
      {/* soft bioluminescent glow */}
      <div
        className="absolute rounded-full"
        style={{
          left: "50%",
          top: "20%",
          transform: "translate(-50%, -50%)",
          width: w * 1.8,
          height: w * 1.8,
          background:
            "radial-gradient(circle, rgba(125, 211, 252, 0.35) 0%, rgba(125, 211, 252, 0.08) 45%, transparent 70%)",
          filter: "blur(4px)",
        }}
      />
      <svg
        width={w}
        height={h}
        viewBox="0 0 80 140"
        aria-hidden
        style={{ position: "relative", opacity: 0.9 }}
      >
        <defs>
          <linearGradient id="jelly-body" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#bae6fd" stopOpacity="0.55" />
            <stop offset="60%" stopColor="#7dd3fc" stopOpacity="0.38" />
            <stop offset="100%" stopColor="#38bdf8" stopOpacity="0.15" />
          </linearGradient>
        </defs>
        {/* dome — pulses */}
        <g
          style={{
            transformOrigin: "40px 34px",
            animation: "jelly-pulse 3.8s ease-in-out infinite",
          }}
        >
          <path
            d="M 8 38 Q 8 8, 40 8 Q 72 8, 72 38 L 68 46 Q 60 42, 56 46 Q 48 42, 40 46 Q 32 42, 24 46 Q 20 42, 12 46 Z"
            fill="url(#jelly-body)"
            stroke="rgba(186, 230, 253, 0.55)"
            strokeWidth="1"
          />
          {/* dome highlight */}
          <ellipse cx="32" cy="20" rx="10" ry="3.5" fill="rgba(224, 242, 254, 0.5)" />
        </g>
        {/* tentacles — wavy */}
        <g stroke="rgba(125, 211, 252, 0.55)" strokeWidth="1.4" fill="none" strokeLinecap="round">
          <path d="M 18 46 Q 14 70, 20 90 Q 26 110, 18 130" />
          <path d="M 30 46 Q 28 72, 34 92 Q 40 112, 32 132" />
          <path d="M 42 46 Q 40 74, 46 94 Q 52 114, 44 134" />
          <path d="M 54 46 Q 52 70, 58 90 Q 64 110, 56 130" />
          <path d="M 64 46 Q 60 72, 66 92 Q 72 112, 64 130" />
        </g>
      </svg>
    </div>
  );
}

function Kelp({ side }: { side: "left" | "right" }) {
  const isLeft = side === "left";
  return (
    <div
      className="absolute bottom-0 w-[240px] h-[72vh] origin-bottom"
      style={{
        [isLeft ? "left" : "right"]: "-30px",
        animation: `${isLeft ? "kelp-sway-left" : "kelp-sway-right"} 9s ease-in-out infinite`,
        transform: isLeft ? undefined : "scaleX(-1)",
      }}
    >
      <svg
        viewBox="0 0 240 720"
        preserveAspectRatio="none"
        className="w-full h-full"
        aria-hidden
      >
        {/* back layer — darker, taller */}
        <g fill="#010713" opacity="0.92">
          <path d="M 35 720 C 55 560, 15 420, 50 260 C 70 160, 40 60, 65 -20
                   L 78 -20 C 60 60, 85 170, 70 270 C 55 420, 90 560, 55 720 Z" />
          <path d="M 95 720 C 110 600, 85 470, 110 340 C 125 240, 105 140, 125 40
                   L 135 40 C 120 140, 140 240, 125 340 C 105 470, 125 600, 115 720 Z" />
        </g>
        {/* kelp pods (leaves) — back */}
        <g fill="#010713" opacity="0.92">
          <ellipse cx="46" cy="500" rx="22" ry="10" transform="rotate(-20 46 500)" />
          <ellipse cx="74" cy="330" rx="26" ry="11" transform="rotate(15 74 330)" />
          <ellipse cx="52" cy="180" rx="20" ry="9" transform="rotate(-10 52 180)" />
          <ellipse cx="108" cy="560" rx="20" ry="9" transform="rotate(25 108 560)" />
          <ellipse cx="130" cy="380" rx="24" ry="10" transform="rotate(-18 130 380)" />
          <ellipse cx="116" cy="200" rx="18" ry="8" transform="rotate(12 116 200)" />
        </g>

        {/* front layer — slightly lighter, shorter */}
        <g fill="#02122a" opacity="0.95">
          <path d="M 5 720 C 20 600, -10 490, 15 370 C 30 280, 10 180, 28 80
                   L 40 80 C 25 180, 45 280, 30 370 C 10 490, 40 600, 25 720 Z" />
          <path d="M 160 720 C 175 620, 150 510, 170 400 C 185 310, 170 210, 188 120
                   L 200 120 C 185 210, 205 310, 190 400 C 170 510, 195 620, 180 720 Z" />
        </g>
        {/* kelp pods — front */}
        <g fill="#02122a" opacity="0.95">
          <ellipse cx="20" cy="550" rx="24" ry="11" transform="rotate(-22 20 550)" />
          <ellipse cx="34" cy="380" rx="26" ry="11" transform="rotate(18 34 380)" />
          <ellipse cx="22" cy="200" rx="20" ry="9" transform="rotate(-14 22 200)" />
          <ellipse cx="176" cy="580" rx="22" ry="10" transform="rotate(20 176 580)" />
          <ellipse cx="190" cy="420" rx="26" ry="11" transform="rotate(-16 190 420)" />
          <ellipse cx="182" cy="250" rx="19" ry="9" transform="rotate(14 182 250)" />
        </g>
      </svg>
    </div>
  );
}
