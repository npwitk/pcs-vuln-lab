import React, { forwardRef, useEffect, useImperativeHandle, useRef } from 'react';
import styled from 'styled-components';

// Full-screen confetti on one canvas, no library. Paper pieces flutter (their
// width follows a spinning sine, like paper turning over) and fall under
// gravity with air drag. Imperative, through a ref:
//   burst({ x, y, angle, spread, count, power })  x/y in viewport px, angle in deg (-90 = up)
//   rain(seconds, perSecond)                       pieces drifting down from the top
// Does nothing for people who prefer reduced motion.

const COLORS = ['#AE5C2A', '#D4793D', '#F2C58A', '#5E5CE6', '#FF6B9A', '#30D158', '#FFD60A', '#64D2FF'];
const GRAVITY = 1400;   // px/s²
const DRAG = 0.9;       // velocity kept per 1/60 s
const MAX_PIECES = 700;

const Canvas = styled.canvas`
  position: fixed;
  inset: 0;
  width: 100vw;
  height: 100vh;
  pointer-events: none;
  z-index: 50;
`;

const reducedMotion = () => typeof window !== 'undefined'
  && window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;

function piece(x, y, vx, vy) {
  const shape = Math.random();
  return {
    x, y, vx, vy,
    w: 7 + Math.random() * 7,
    h: shape < 0.25 ? 0 : 10 + Math.random() * 8, // h 0 = round dot
    rot: Math.random() * Math.PI * 2,
    vr: (Math.random() - 0.5) * 12,
    flip: Math.random() * Math.PI * 2,
    vflip: 6 + Math.random() * 10,
    sway: Math.random() * Math.PI * 2,
    color: COLORS[Math.floor(Math.random() * COLORS.length)],
    age: 0,
    life: 4 + Math.random() * 3,
  };
}

const Confetti = forwardRef(function Confetti(_, ref) {
  const canvasRef = useRef(null);
  const pieces = useRef([]);
  const rainUntil = useRef(0);
  const rainRate = useRef(0);
  const frame = useRef(null);
  const last = useRef(0);
  const off = useRef(reducedMotion());

  const loop = (time) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    const dt = Math.min(0.033, last.current ? (time - last.current) / 1000 : 0.016);
    last.current = time;
    const W = window.innerWidth;
    const H = window.innerHeight;

    if (time < rainUntil.current) {
      const n = rainRate.current * dt;
      for (let i = 0; i < Math.floor(n) + (Math.random() < n % 1 ? 1 : 0); i++) {
        pieces.current.push(piece(Math.random() * W, -20, (Math.random() - 0.5) * 60, 40 + Math.random() * 80));
      }
    }

    ctx.clearRect(0, 0, W, H);
    const drag = Math.pow(DRAG, dt * 60);
    pieces.current = pieces.current.filter(p => p.age < p.life && p.y < H + 40);
    for (const p of pieces.current) {
      p.age += dt;
      p.vy = p.vy * drag + GRAVITY * dt * 0.35;
      p.vx = p.vx * drag + Math.sin(p.sway + p.age * 3) * 18 * dt;
      p.x += p.vx * dt;
      p.y += p.vy * dt;
      p.rot += p.vr * dt;
      p.flip += p.vflip * dt;
      const fade = p.age > p.life - 0.6 ? Math.max(0, (p.life - p.age) / 0.6) : 1;
      ctx.save();
      ctx.globalAlpha = fade;
      ctx.translate(p.x, p.y);
      ctx.rotate(p.rot);
      ctx.fillStyle = p.color;
      if (p.h === 0) {
        ctx.beginPath();
        ctx.arc(0, 0, p.w / 2.4, 0, Math.PI * 2);
        ctx.fill();
      } else {
        ctx.scale(Math.cos(p.flip), 1);
        ctx.fillRect(-p.w / 2, -p.h / 2, p.w, p.h);
      }
      ctx.restore();
    }

    frame.current = pieces.current.length || time < rainUntil.current ? requestAnimationFrame(loop) : null;
    if (!frame.current) last.current = 0;
  };

  const kick = () => {
    if (!frame.current) frame.current = requestAnimationFrame(loop);
  };

  useImperativeHandle(ref, () => ({
    burst({ x, y, angle = -90, spread = 70, count = 120, power = 900 }) {
      if (off.current) return;
      for (let i = 0; i < count; i++) {
        const a = ((angle + (Math.random() - 0.5) * spread) * Math.PI) / 180;
        const v = power * (0.45 + Math.random() * 0.55);
        pieces.current.push(piece(x, y, Math.cos(a) * v, Math.sin(a) * v));
      }
      if (pieces.current.length > MAX_PIECES) pieces.current.splice(0, pieces.current.length - MAX_PIECES);
      kick();
    },
    rain(seconds = 3, perSecond = 40) {
      if (off.current) return;
      rainUntil.current = performance.now() + seconds * 1000;
      rainRate.current = perSecond;
      kick();
    },
  }));

  useEffect(() => {
    const canvas = canvasRef.current;
    const size = () => {
      const dpr = Math.min(2, window.devicePixelRatio || 1);
      canvas.width = window.innerWidth * dpr;
      canvas.height = window.innerHeight * dpr;
      canvas.getContext('2d').setTransform(dpr, 0, 0, dpr, 0, 0);
    };
    size();
    window.addEventListener('resize', size);
    return () => {
      window.removeEventListener('resize', size);
      if (frame.current) cancelAnimationFrame(frame.current);
    };
  }, []);

  return <Canvas ref={canvasRef} aria-hidden="true" />;
});

export default Confetti;
