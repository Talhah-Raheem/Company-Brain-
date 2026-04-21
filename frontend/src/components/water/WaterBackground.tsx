"use client";

import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import { motion } from "framer-motion";

type Bubble = {
  left: string;
  size: number;
  dur: number;
  delay: number;
  drift: number;
  opacity: number;
};

type SceneConfig = {
  name: string;
  gradient: string;
  lightBloom: string;
  horizonGlow?: string;
  sunGlow?: string;
  sunDisk?: string;
  haze?: string;
  vignette: string;
  bubbleTint: string;
  fishColor: string;
  fishAccent: string;
  kelpBack: string;
  kelpFront: string;
  kelpOpacity?: "full" | "light" | "none";
  reef?: boolean;
  bottomFeature?: "none" | "vents";
  particleMode?: "bubbles" | "embers";
  anglerLights?: boolean;
  jellyHue: "surface" | "shallow" | "deep";
  rays: Array<{
    left: string;
    width: number;
    dur: string;
    delay: string;
    opacity: number;
    blur?: string;
  }>;
  fish: Array<{
    top: string;
    size: number;
    direction: "left" | "right";
    duration: string;
    delay: string;
    opacity?: number;
  }>;
  jellies: Array<{
    left: string;
    duration: string;
    delay?: string;
    small?: boolean;
  }>;
};

const defaultScene = "/";

const sceneByRoute: Record<string, SceneConfig> = {
  "/": {
    name: "Surface",
    gradient:
      "linear-gradient(to bottom, #ffb36d 0%, #ff8d73 10%, #f36b7b 18%, #7fc0d9 28%, #3c88b4 48%, #15436e 72%, #071b37 100%)",
    lightBloom:
      "radial-gradient(circle at 50% 8%, rgba(255, 226, 168, 0.65) 0%, rgba(255, 186, 129, 0.22) 30%, rgba(255, 186, 129, 0) 62%)",
    horizonGlow:
      "linear-gradient(to bottom, rgba(255, 214, 170, 0.42), rgba(255, 214, 170, 0) 78%)",
    sunGlow:
      "radial-gradient(circle, rgba(255, 238, 199, 0.82) 0%, rgba(255, 184, 113, 0.35) 45%, rgba(255, 184, 113, 0) 72%)",
    sunDisk: "linear-gradient(180deg, rgba(255, 247, 214, 0.96), rgba(255, 205, 137, 0.92))",
    haze:
      "linear-gradient(to bottom, rgba(255,255,255,0.18) 0%, rgba(255,255,255,0.04) 22%, rgba(255,255,255,0) 42%)",
    vignette:
      "radial-gradient(ellipse at center, transparent 44%, rgba(3, 9, 24, 0.34) 100%)",
    bubbleTint: "rgba(255, 244, 220, OPACITY)",
    fishColor: "#18324d",
    fishAccent: "#fff3cf",
    kelpBack: "#10233c",
    kelpFront: "#183b5b",
    bottomFeature: "none",
    particleMode: "bubbles",
    jellyHue: "surface",
    rays: [
      { left: "10%", width: 180, dur: "24s", delay: "0s", opacity: 0.2, blur: "1px" },
      { left: "34%", width: 120, dur: "28s", delay: "-6s", opacity: 0.14, blur: "1px" },
      { left: "58%", width: 210, dur: "26s", delay: "-14s", opacity: 0.18, blur: "2px" },
      { left: "79%", width: 110, dur: "30s", delay: "-4s", opacity: 0.12, blur: "1px" },
    ],
    fish: [],
    jellies: [],
  },
  "/ingest": {
    name: "20m",
    gradient:
      "linear-gradient(to bottom, #67d7d1 0%, #42c4c5 16%, #2da8b5 34%, #21859d 56%, #145b77 78%, #0a344c 100%)",
    lightBloom:
      "radial-gradient(circle at 50% 2%, rgba(209, 255, 241, 0.34) 0%, rgba(110, 238, 226, 0.2) 36%, rgba(110, 238, 226, 0) 62%)",
    haze:
      "linear-gradient(to bottom, rgba(231,255,247,0.12) 0%, rgba(231,255,247,0) 30%)",
    vignette:
      "radial-gradient(ellipse at center, transparent 48%, rgba(1, 9, 24, 0.45) 100%)",
    bubbleTint: "rgba(211, 255, 239, OPACITY)",
    fishColor: "#16324a",
    fishAccent: "#f7ffcc",
    kelpBack: "#11394c",
    kelpFront: "#20586e",
    kelpOpacity: "light",
    reef: true,
    bottomFeature: "none",
    particleMode: "bubbles",
    jellyHue: "shallow",
    rays: [
      { left: "14%", width: 160, dur: "24s", delay: "0s", opacity: 0.16 },
      { left: "37%", width: 104, dur: "30s", delay: "-8s", opacity: 0.12 },
      { left: "59%", width: 188, dur: "26s", delay: "-14s", opacity: 0.18 },
      { left: "80%", width: 104, dur: "34s", delay: "-4s", opacity: 0.11 },
    ],
    fish: [
      { top: "22%", size: 44, direction: "right", duration: "50s", delay: "-26s" },
      { top: "38%", size: 72, direction: "right", duration: "58s", delay: "-8s" },
      { top: "62%", size: 96, direction: "left", duration: "72s", delay: "-36s" },
    ],
    jellies: [{ left: "73%", duration: "70s", delay: "-26s", small: true }],
  },
  "/audit": {
    name: "120m",
    gradient:
      "linear-gradient(to bottom, #4bb4c8 0%, #2d9dbc 16%, #1d789f 34%, #125c86 56%, #0a3f62 78%, #051f38 100%)",
    lightBloom:
      "radial-gradient(circle at 50% 2%, rgba(190, 245, 243, 0.3) 0%, rgba(103, 225, 233, 0.16) 36%, rgba(103, 225, 233, 0) 62%)",
    haze:
      "linear-gradient(to bottom, rgba(206,255,251,0.09) 0%, rgba(206,255,251,0) 30%)",
    vignette:
      "radial-gradient(ellipse at center, transparent 48%, rgba(1, 9, 24, 0.45) 100%)",
    bubbleTint: "rgba(202, 246, 252, OPACITY)",
    fishColor: "#0d2139",
    fishAccent: "#c6fff9",
    kelpBack: "#071527",
    kelpFront: "#0f2743",
    kelpOpacity: "full",
    bottomFeature: "none",
    particleMode: "bubbles",
    jellyHue: "shallow",
    rays: [
      { left: "14%", width: 150, dur: "24s", delay: "0s", opacity: 0.18 },
      { left: "36%", width: 90, dur: "30s", delay: "-8s", opacity: 0.12 },
      { left: "58%", width: 170, dur: "26s", delay: "-14s", opacity: 0.2 },
      { left: "78%", width: 100, dur: "34s", delay: "-4s", opacity: 0.1 },
    ],
    fish: [
      { top: "26%", size: 62, direction: "right", duration: "58s", delay: "-12s" },
      { top: "58%", size: 96, direction: "left", duration: "72s", delay: "-38s" },
      { top: "14%", size: 38, direction: "right", duration: "48s", delay: "-26s" },
    ],
    jellies: [
      { left: "38%", duration: "56s" },
      { left: "72%", duration: "64s", delay: "-32s", small: true },
    ],
  },
  "/search": {
    name: "500m",
    gradient:
      "linear-gradient(to bottom, #4a89b5 0%, #2f6f9c 18%, #1e567e 36%, #144261 56%, #0d3048 80%, #081d31 100%)",
    lightBloom:
      "radial-gradient(circle at 50% -8%, rgba(187, 230, 255, 0.28) 0%, rgba(131, 209, 255, 0.14) 34%, rgba(131, 209, 255, 0) 60%)",
    haze:
      "linear-gradient(to bottom, rgba(219,244,255,0.08) 0%, rgba(219,244,255,0) 26%)",
    vignette:
      "radial-gradient(ellipse at center, transparent 52%, rgba(0,0,0,0.34) 100%)",
    bubbleTint: "rgba(208, 240, 255, OPACITY)",
    fishColor: "#0c2138",
    fishAccent: "#7dd3fc",
    kelpBack: "#0a1830",
    kelpFront: "#11304c",
    kelpOpacity: "light",
    bottomFeature: "none",
    particleMode: "bubbles",
    jellyHue: "deep",
    rays: [
      { left: "18%", width: 120, dur: "28s", delay: "-3s", opacity: 0.08 },
      { left: "44%", width: 84, dur: "34s", delay: "-16s", opacity: 0.06 },
      { left: "70%", width: 140, dur: "31s", delay: "-9s", opacity: 0.09 },
    ],
    fish: [
      { top: "22%", size: 34, direction: "right", duration: "64s", delay: "-34s", opacity: 0.56 },
      { top: "50%", size: 72, direction: "left", duration: "80s", delay: "-18s", opacity: 0.62 },
    ],
    jellies: [{ left: "66%", duration: "72s", delay: "-20s", small: true }],
  },
  "/governance": {
    name: "2000m",
    gradient:
      "linear-gradient(to bottom, #3a719d 0%, #275980 16%, #1d4a70 34%, #294d72 56%, #37486d 78%, #21283f 100%)",
    lightBloom:
      "radial-gradient(circle at 50% -8%, rgba(197, 240, 255, 0.34) 0%, rgba(144, 221, 255, 0.16) 30%, rgba(144, 221, 255, 0) 60%)",
    haze:
      "linear-gradient(to bottom, rgba(205,245,255,0.12) 0%, rgba(205,245,255,0) 28%)",
    vignette:
      "radial-gradient(ellipse at center, transparent 58%, rgba(5,8,18,0.28) 84%, rgba(5,8,18,0.52) 100%)",
    bubbleTint: "rgba(145, 241, 255, OPACITY)",
    fishColor: "#01040b",
    fishAccent: "#64f1ff",
    kelpBack: "#01030a",
    kelpFront: "#020811",
    kelpOpacity: "light",
    bottomFeature: "vents",
    particleMode: "embers",
    anglerLights: true,
    jellyHue: "deep",
    rays: [
      { left: "32%", width: 78, dur: "36s", delay: "-12s", opacity: 0.03, blur: "2px" },
      { left: "66%", width: 92, dur: "40s", delay: "-24s", opacity: 0.04, blur: "2px" },
    ],
    fish: [],
    jellies: [
      { left: "30%", duration: "82s", delay: "-14s", small: true },
      { left: "58%", duration: "88s", delay: "-36s", small: true },
      { left: "78%", duration: "92s", delay: "-46s", small: true },
    ],
  },
};

function getScene(pathname: string) {
  return sceneByRoute[pathname] ?? sceneByRoute[defaultScene];
}

export default function WaterBackground() {
  const pathname = usePathname();
  const scene = getScene(pathname);

  return (
    <div
      aria-hidden
      className="pointer-events-none fixed inset-0 -z-10 overflow-hidden"
      data-depth-scene={scene.name}
    >
      <div className="absolute inset-0" style={{ background: scene.gradient }} />

      {scene.horizonGlow && (
        <div className="absolute inset-x-0 top-0 h-[26vh]" style={{ background: scene.horizonGlow }} />
      )}

      {scene.haze && (
        <div className="absolute inset-x-0 top-0 h-[34vh]" style={{ background: scene.haze }} />
      )}

      <div
        className="absolute top-0 left-1/2 -translate-x-1/2 w-[980px] h-[460px] rounded-full blur-[90px]"
        style={{ background: scene.lightBloom }}
      />

      {scene.name === "2000m" && (
        <div
          className="absolute inset-0"
          style={{
            background:
              "radial-gradient(ellipse at center, rgba(176, 233, 255, 0.14) 0%, rgba(176, 233, 255, 0.06) 26%, rgba(176, 233, 255, 0) 60%)",
          }}
        />
      )}

      {scene.sunGlow && (
        <div
          className="absolute top-[4vh] left-1/2 -translate-x-1/2 w-[300px] h-[300px] rounded-full blur-[42px]"
          style={{ background: scene.sunGlow }}
        />
      )}

      {scene.sunDisk && (
        <div
          className="absolute top-[9vh] left-1/2 -translate-x-1/2 w-32 h-32 rounded-full opacity-90"
          style={{ background: scene.sunDisk, boxShadow: "0 0 90px rgba(255, 208, 143, 0.45)" }}
        />
      )}

      <Godrays rays={scene.rays} />
      {scene.kelpOpacity !== "none" && (
        <>
          <Kelp
            side="left"
            back={scene.kelpBack}
            front={scene.kelpFront}
            opacityMode={scene.kelpOpacity ?? "full"}
          />
          <Kelp
            side="right"
            back={scene.kelpBack}
            front={scene.kelpFront}
            opacityMode={scene.kelpOpacity ?? "full"}
          />
        </>
      )}
      <MarineLife scene={scene} />
      {scene.reef && <CoralReef />}
      {scene.bottomFeature === "vents" && <HydrothermalVents />}
      {scene.anglerLights && <AnglerLights />}
      <Particles tint={scene.bubbleTint} mode={scene.particleMode ?? "bubbles"} />

      <div className="absolute inset-0" style={{ background: scene.vignette }} />

      <style>{`
        @keyframes bubble-rise {
          0%   { transform: translate3d(0, 0, 0) scale(0.8); opacity: 0; }
          8%   { opacity: 1; transform: translate3d(0, -6vh, 0) scale(1); }
          90%  { opacity: 0.85; }
          100% { transform: translate3d(var(--bubble-drift, 20px), -115vh, 0) scale(1.05); opacity: 0; }
        }
        @keyframes ember-rise {
          0%   { transform: translate3d(0, 0, 0) scale(0.7); opacity: 0; }
          10%  { opacity: 0.9; }
          100% { transform: translate3d(var(--bubble-drift, 8px), -72vh, 0) scale(1.25); opacity: 0; }
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

function Godrays({ rays }: { rays: SceneConfig["rays"] }) {
  return (
    <>
      {rays.map((ray, index) => (
        <div
          key={index}
          className="absolute top-[-10vh] h-[140vh]"
          style={{
            left: ray.left,
            width: ray.width,
            background: `linear-gradient(to bottom,
              rgba(250, 244, 225, ${ray.opacity}) 0%,
              rgba(167, 225, 247, ${ray.opacity * 0.6}) 35%,
              rgba(56, 189, 248, 0) 100%)`,
            transform: "skewX(-9deg)",
            animation: `godray-drift ${ray.dur} ease-in-out ${ray.delay} infinite`,
            mixBlendMode: "screen",
            filter: `blur(${ray.blur ?? "1px"})`,
          }}
        />
      ))}
    </>
  );
}

function Particles({
  tint,
  mode,
}: {
  tint: string;
  mode: "bubbles" | "embers";
}) {
  const [bubbles, setBubbles] = useState<Bubble[]>([]);

  useEffect(() => {
    const count = mode === "embers" ? 26 : 34;
    const next: Bubble[] = Array.from({ length: count }, () => {
      const size = mode === "embers" ? 3 + Math.random() * 9 : 4 + Math.random() * 16;
      return {
        left: `${Math.random() * 100}%`,
        size,
        dur: mode === "embers" ? 10 + Math.random() * 12 : 14 + Math.random() * 18,
        delay: -Math.random() * 30,
        drift: mode === "embers" ? (Math.random() - 0.5) * 18 : (Math.random() - 0.5) * 80,
        opacity: mode === "embers" ? 0.45 + Math.random() * 0.4 : 0.3 + Math.random() * 0.4,
      };
    });
    setBubbles(next);
  }, [mode]);

  return (
    <>
      {bubbles.map((bubble, index) => {
        const center = tint.replace("OPACITY", `${bubble.opacity * (mode === "embers" ? 1.2 : 1.05)}`);
        const mid = tint.replace("OPACITY", `${bubble.opacity * (mode === "embers" ? 0.72 : 0.46)}`);
        const edge = tint.replace("OPACITY", `${bubble.opacity * (mode === "embers" ? 0.22 : 0.16)}`);
        const border = tint.replace("OPACITY", `${bubble.opacity * (mode === "embers" ? 0.18 : 0.5)}`);

        return (
          <div
            key={index}
            className="absolute bottom-[-6vh] rounded-full"
            style={{
              left: bubble.left,
              width: bubble.size,
              height: bubble.size,
              background: `radial-gradient(circle at 32% 30%, ${center} 0%, ${mid} 55%, ${edge} 100%)`,
              border: mode === "bubbles" ? `1px solid ${border}` : "none",
              boxShadow:
                mode === "embers"
                  ? `0 0 8px ${mid}, 0 0 18px ${edge}`
                  : "inset 1px 1px 2px rgba(255,255,255,0.45), 0 0 6px rgba(125, 211, 252, 0.18)",
              animation: `${mode === "embers" ? "ember-rise" : "bubble-rise"} ${bubble.dur}s linear ${bubble.delay}s infinite`,
              ["--bubble-drift" as string]: `${bubble.drift}px`,
            }}
          />
        );
      })}
    </>
  );
}

function HydrothermalVents() {
  return (
    <>
      <div
        className="absolute inset-x-0 bottom-0 h-[22vh]"
        style={{
          background:
            "linear-gradient(to top, rgba(18, 18, 34, 0.7) 0%, rgba(18, 18, 34, 0.38) 45%, rgba(18, 18, 34, 0) 100%)",
        }}
      />
      <Vent x="18%" width={90} height={150} plumeColor="rgba(93, 245, 255, 0.14)" />
      <Vent x="48%" width={120} height={185} plumeColor="rgba(102, 237, 255, 0.18)" />
      <Vent x="76%" width={80} height={132} plumeColor="rgba(143, 101, 255, 0.12)" />
    </>
  );
}

function CoralReef() {
  return (
    <>
      <div
        className="absolute inset-x-0 bottom-0 h-[24vh]"
        style={{
          background:
            "linear-gradient(to top, rgba(8, 39, 54, 0.56) 0%, rgba(8, 39, 54, 0.16) 48%, rgba(8, 39, 54, 0) 100%)",
        }}
      />
      <CoralCluster x="6%" scale={1.05} />
      <CoralCluster x="26%" scale={0.8} />
      <CoralCluster x="54%" scale={1.15} />
      <CoralCluster x="80%" scale={0.92} />
    </>
  );
}

function CoralCluster({ x, scale }: { x: string; scale: number }) {
  return (
    <div
      className="absolute bottom-0"
      style={{ left: x, transform: `scale(${scale})`, transformOrigin: "bottom left" }}
    >
      <svg width="154" height="116" viewBox="0 0 154 116" aria-hidden>
        <path
          d="M 12 116 C 18 92, 20 76, 18 60 C 16 46, 22 38, 30 34 C 38 38, 40 48, 38 60 C 36 74, 40 92, 50 116 Z"
          fill="#ff8e80"
          opacity="0.9"
        />
        <circle cx="24" cy="30" r="11" fill="#ff9f8d" opacity="0.92" />
        <circle cx="34" cy="40" r="8" fill="#ffb09b" opacity="0.76" />

        <path
          d="M 52 116 C 58 96, 60 80, 58 62 C 56 44, 62 34, 70 28 C 78 34, 82 46, 80 62 C 78 80, 84 98, 94 116 Z"
          fill="#ffa86f"
          opacity="0.88"
        />
        <circle cx="64" cy="26" r="8" fill="#ffd084" opacity="0.94" />
        <circle cx="75" cy="20" r="10" fill="#ffbe73" opacity="0.84" />
        <circle cx="84" cy="31" r="7" fill="#ffd69f" opacity="0.72" />

        <path
          d="M 98 116 C 106 95, 110 76, 108 60 C 106 44, 111 34, 118 30 C 126 35, 130 47, 128 64 C 126 82, 132 98, 142 116 Z"
          fill="#ff6f91"
          opacity="0.86"
        />
        <circle cx="110" cy="24" r="9" fill="#ff83a5" opacity="0.92" />
        <circle cx="122" cy="18" r="11" fill="#ff91b0" opacity="0.84" />
        <circle cx="131" cy="30" r="7" fill="#ffadc3" opacity="0.72" />

        <path
          d="M 0 116 C 24 108, 42 104, 74 103 C 108 102, 130 106, 154 116"
          stroke="rgba(234,255,247,0.24)"
          strokeWidth="2"
          fill="none"
        />
        <circle cx="48" cy="58" r="3" fill="rgba(212,255,240,0.38)" />
        <circle cx="101" cy="52" r="3" fill="rgba(212,255,240,0.32)" />
      </svg>
    </div>
  );
}

function AnglerLights() {
  const lights = [
    { left: "14%", top: "34%", color: "rgba(118, 244, 255, 0.88)", trail: "rgba(118, 244, 255, 0.22)" },
    { left: "72%", top: "44%", color: "rgba(158, 124, 255, 0.8)", trail: "rgba(158, 124, 255, 0.18)" },
    { left: "58%", top: "60%", color: "rgba(118, 244, 255, 0.72)", trail: "rgba(118, 244, 255, 0.18)" },
  ];

  return (
    <>
      {lights.map((light, index) => (
        <div
          key={index}
          className="absolute"
          style={{ left: light.left, top: light.top }}
        >
          <div
            className="absolute left-[-18px] top-[2px] h-[2px] rounded-full"
            style={{
              width: 22,
              background: `linear-gradient(to right, rgba(255,255,255,0), ${light.trail})`,
              filter: "blur(1px)",
            }}
          />
          <motion.div
            className="rounded-full"
            style={{
              width: 7,
              height: 7,
              background: light.color,
              boxShadow: `0 0 10px ${light.color}, 0 0 26px ${light.trail}`,
            }}
            animate={{ opacity: [0.45, 1, 0.45], scale: [0.92, 1.18, 0.92] }}
            transition={{ duration: 3.4 + index, repeat: Infinity, ease: "easeInOut" }}
          />
        </div>
      ))}
    </>
  );
}

function Vent({
  x,
  width,
  height,
  plumeColor,
}: {
  x: string;
  width: number;
  height: number;
  plumeColor: string;
}) {
  return (
    <div className="absolute bottom-0" style={{ left: x }}>
      <div
        className="absolute bottom-[60px] left-1/2 -translate-x-1/2 rounded-full blur-[26px]"
        style={{
          width: width * 1.6,
          height,
          background: `linear-gradient(to top, ${plumeColor} 0%, rgba(67, 210, 255, 0.08) 38%, rgba(67, 210, 255, 0) 100%)`,
        }}
      />
      <svg width={width} height={78} viewBox={`0 0 ${width} 78`} aria-hidden>
        <path
          d={`M 8 78 C 12 50, 20 26, ${width * 0.24} 20 C ${width * 0.32} 14, ${width * 0.36} 2, ${width * 0.44} 0 C ${width * 0.5} 10, ${width * 0.56} 22, ${width * 0.66} 26 C ${width * 0.76} 31, ${width * 0.86} 48, ${width - 8} 78 Z`}
          fill="#1d2238"
        />
        <path
          d={`M ${width * 0.39} 6 C ${width * 0.44} 18, ${width * 0.48} 26, ${width * 0.53} 30`}
          stroke="rgba(98, 242, 255, 0.4)"
          strokeWidth="2"
          strokeLinecap="round"
        />
      </svg>
    </div>
  );
}

function MarineLife({ scene }: { scene: SceneConfig }) {
  return (
    <>
      {scene.fish.map((fish, index) => (
        <div
          key={`${fish.top}-${index}`}
          className="absolute will-change-transform"
          style={{
            top: fish.top,
            opacity: fish.opacity ?? 0.78,
            animation:
              fish.direction === "right"
                ? `fish-drift-right ${fish.duration} linear infinite`
                : `fish-drift-left ${fish.duration} linear infinite`,
            animationDelay: fish.delay,
          }}
        >
          <Fish
            size={fish.size}
            bodyColor={scene.fishColor}
            accentColor={scene.fishAccent}
          />
        </div>
      ))}

      {scene.jellies.map((jelly, index) => (
        <div
          key={`${jelly.left}-${index}`}
          className="absolute bottom-0 will-change-transform"
          style={{
            left: jelly.left,
            animation: `jelly-rise ${jelly.duration} linear infinite`,
            animationDelay: jelly.delay,
          }}
        >
          <div style={{ animation: `jelly-sway ${jelly.small ? "11s" : "9s"} ease-in-out infinite` }}>
            <Jellyfish small={jelly.small} hue={scene.jellyHue} />
          </div>
        </div>
      ))}
    </>
  );
}

function Fish({
  size,
  bodyColor,
  accentColor,
}: {
  size: number;
  bodyColor: string;
  accentColor: string;
}) {
  return (
    <svg
      width={size}
      height={size * 0.42}
      viewBox="0 0 120 50"
      aria-hidden
    >
      <path
        d="M 8 25
           C 8 10, 40 2, 72 14
           L 100 2
           L 96 25
           L 100 48
           L 72 36
           C 40 48, 8 40, 8 25 Z"
        fill={bodyColor}
      />
      <path d="M 48 13 L 62 4 L 66 14 Z" fill={bodyColor} />
      <path d="M 44 37 L 56 46 L 60 37 Z" fill={bodyColor} />
      <path
        d="M 100 2 L 96 25 L 100 48"
        stroke={accentColor}
        strokeWidth="1"
        fill="none"
        opacity="0.22"
        style={{ transformOrigin: "96px 25px", animation: "fish-tail 0.9s ease-in-out infinite" }}
      />
      <circle cx="22" cy="22" r="1.6" fill={accentColor} opacity="0.9" />
    </svg>
  );
}

function Jellyfish({ small, hue }: { small?: boolean; hue: SceneConfig["jellyHue"] }) {
  const scale = small ? 0.65 : 1;
  const w = 80 * scale;
  const h = 140 * scale;

  const palette = {
    surface: {
      glow: "radial-gradient(circle, rgba(255, 231, 195, 0.28) 0%, rgba(255, 193, 139, 0.08) 45%, transparent 70%)",
      stops: [
        { offset: "0%", color: "#fff1d8", opacity: 0.45 },
        { offset: "60%", color: "#ffd49f", opacity: 0.24 },
        { offset: "100%", color: "#f7a96e", opacity: 0.08 },
      ],
      stroke: "rgba(255, 235, 200, 0.46)",
      line: "rgba(255, 219, 170, 0.42)",
      highlight: "rgba(255, 245, 223, 0.48)",
    },
    shallow: {
      glow: "radial-gradient(circle, rgba(170, 255, 245, 0.24) 0%, rgba(106, 239, 229, 0.08) 45%, transparent 70%)",
      stops: [
        { offset: "0%", color: "#d7fffb", opacity: 0.4 },
        { offset: "60%", color: "#92f3e7", opacity: 0.24 },
        { offset: "100%", color: "#4ec9c3", opacity: 0.1 },
      ],
      stroke: "rgba(180, 255, 250, 0.42)",
      line: "rgba(115, 246, 232, 0.44)",
      highlight: "rgba(227, 255, 252, 0.4)",
    },
    deep: {
      glow: "radial-gradient(circle, rgba(125, 211, 252, 0.35) 0%, rgba(125, 211, 252, 0.08) 45%, transparent 70%)",
      stops: [
        { offset: "0%", color: "#bae6fd", opacity: 0.55 },
        { offset: "60%", color: "#7dd3fc", opacity: 0.38 },
        { offset: "100%", color: "#38bdf8", opacity: 0.15 },
      ],
      stroke: "rgba(186, 230, 253, 0.55)",
      line: "rgba(125, 211, 252, 0.55)",
      highlight: "rgba(224, 242, 254, 0.5)",
    },
  }[hue];

  const gradientId = `jelly-body-${hue}-${small ? "sm" : "lg"}`;

  return (
    <div style={{ position: "relative", width: w, height: h }}>
      <div
        className="absolute rounded-full"
        style={{
          left: "50%",
          top: "20%",
          transform: "translate(-50%, -50%)",
          width: w * 1.8,
          height: w * 1.8,
          background: palette.glow,
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
          <linearGradient id={gradientId} x1="0" y1="0" x2="0" y2="1">
            {palette.stops.map((stop) => (
              <stop
                key={stop.offset}
                offset={stop.offset}
                stopColor={stop.color}
                stopOpacity={stop.opacity}
              />
            ))}
          </linearGradient>
        </defs>
        <g
          style={{
            transformOrigin: "40px 34px",
            animation: "jelly-pulse 3.8s ease-in-out infinite",
          }}
        >
          <path
            d="M 8 38 Q 8 8, 40 8 Q 72 8, 72 38 L 68 46 Q 60 42, 56 46 Q 48 42, 40 46 Q 32 42, 24 46 Q 20 42, 12 46 Z"
            fill={`url(#${gradientId})`}
            stroke={palette.stroke}
            strokeWidth="1"
          />
          <ellipse cx="32" cy="20" rx="10" ry="3.5" fill={palette.highlight} />
        </g>
        <g stroke={palette.line} strokeWidth="1.4" fill="none" strokeLinecap="round">
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

function Kelp({
  side,
  back,
  front,
  opacityMode,
}: {
  side: "left" | "right";
  back: string;
  front: string;
  opacityMode: "full" | "light" | "none";
}) {
  const isLeft = side === "left";
  const backOpacity = opacityMode === "light" ? "0.42" : "0.92";
  const frontOpacity = opacityMode === "light" ? "0.5" : "0.95";

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
        <g fill={back} opacity={backOpacity}>
          <path d="M 35 720 C 55 560, 15 420, 50 260 C 70 160, 40 60, 65 -20 L 78 -20 C 60 60, 85 170, 70 270 C 55 420, 90 560, 55 720 Z" />
          <path d="M 95 720 C 110 600, 85 470, 110 340 C 125 240, 105 140, 125 40 L 135 40 C 120 140, 140 240, 125 340 C 105 470, 125 600, 115 720 Z" />
        </g>
        <g fill={back} opacity={backOpacity}>
          <ellipse cx="46" cy="500" rx="22" ry="10" transform="rotate(-20 46 500)" />
          <ellipse cx="74" cy="330" rx="26" ry="11" transform="rotate(15 74 330)" />
          <ellipse cx="52" cy="180" rx="20" ry="9" transform="rotate(-10 52 180)" />
          <ellipse cx="108" cy="560" rx="20" ry="9" transform="rotate(25 108 560)" />
          <ellipse cx="130" cy="380" rx="24" ry="10" transform="rotate(-18 130 380)" />
          <ellipse cx="116" cy="200" rx="18" ry="8" transform="rotate(12 116 200)" />
        </g>

        <g fill={front} opacity={frontOpacity}>
          <path d="M 5 720 C 20 600, -10 490, 15 370 C 30 280, 10 180, 28 80 L 40 80 C 25 180, 45 280, 30 370 C 10 490, 40 600, 25 720 Z" />
          <path d="M 160 720 C 175 620, 150 510, 170 400 C 185 310, 170 210, 188 120 L 200 120 C 185 210, 205 310, 190 400 C 170 510, 195 620, 180 720 Z" />
        </g>
        <g fill={front} opacity={frontOpacity}>
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
