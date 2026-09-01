import { useEffect, useRef } from 'react';
import { useApp } from '@/state/AppContext';

const STATE_LABEL: Record<string, string> = {
  idle: '',
  thinking: 'Entendiendo tu comando...',
  planning: 'Construyendo plan de acción...',
  awaiting_confirmation: 'Esperando tu aprobación',
  executing: 'Ejecutando...',
  completed: 'Completado',
  failed: 'Algo salió mal',
};

/**
 * Per-state motion profile. No hue is used anywhere — state is
 * communicated by rotation speed, brightness, and (for `failed`)
 * a jitter that reads as disruption without needing red.
 */
const STATE_MOTION: Record<string, { speed: number; energy: number; jitter: number }> = {
  idle:                   { speed: 0.0022, energy: 0.55, jitter: 0 },
  thinking:               { speed: 0.006,  energy: 0.85, jitter: 0 },
  planning:               { speed: 0.006,  energy: 0.85, jitter: 0 },
  awaiting_confirmation:  { speed: 0.003,  energy: 0.9,  jitter: 0 },
  executing:              { speed: 0.013,  energy: 1,    jitter: 0 },
  completed:              { speed: 0.006,  energy: 1,    jitter: 0 },
  failed:                 { speed: 0.004,  energy: 0.6,  jitter: 1.6 },
};

/** Evenly distributes N points on a unit sphere (Fibonacci sphere). */
function buildSphere(samples: number) {
  const points: [number, number, number][] = [];
  const goldenAngle = Math.PI * (3 - Math.sqrt(5));
  for (let i = 0; i < samples; i++) {
    const y = 1 - (i / (samples - 1)) * 2;
    const radiusAtY = Math.sqrt(1 - y * y);
    const theta = goldenAngle * i;
    points.push([Math.cos(theta) * radiusAtY, y, Math.sin(theta) * radiusAtY]);
  }
  return points;
}

const PARTICLE_COUNT = 620;
const TILT = 0.32; // fixed X-axis tilt so rotation reads as 3D, not a flat spin

export function AIOrb({ active, size = 176 }: { active?: boolean; size?: number }) {
  const { state } = useApp();
  const { commandState } = state;
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const pointsRef = useRef(buildSphere(PARTICLE_COUNT));
  const angleRef = useRef(0);
  const rafRef = useRef<number | null>(null);

  const isAnimated = active || (commandState !== 'idle' && commandState !== 'completed' && commandState !== 'failed');
  const label = STATE_LABEL[commandState];

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    canvas.width = size * dpr;
    canvas.height = size * dpr;
    ctx.scale(dpr, dpr);

    const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const cx = size / 2;
    const cy = size / 2;
    const R = size * 0.36;

    const render = () => {
      const motion = STATE_MOTION[commandState] ?? STATE_MOTION.idle;
      ctx.clearRect(0, 0, size, size);

      const cosT = Math.cos(TILT);
      const sinT = Math.sin(TILT);
      const cosA = Math.cos(angleRef.current);
      const sinA = Math.sin(angleRef.current);

      for (const [x, y, z] of pointsRef.current) {
        // Rotate around Y
        const x1 = x * cosA + z * sinA;
        const z1 = -x * sinA + z * cosA;
        // Tilt around X
        const y2 = y * cosT - z1 * sinT;
        const z2 = y * sinT + z1 * cosT;

        const depth = (z2 + 1) / 2; // 0..1, front is closer to 1
        const jx = motion.jitter ? (Math.random() - 0.5) * motion.jitter : 0;
        const jy = motion.jitter ? (Math.random() - 0.5) * motion.jitter : 0;

        const px = cx + x1 * R + jx;
        const py = cy + y2 * R + jy;

        const opacity = (0.12 + depth * 0.68) * motion.energy;
        const radius = 0.55 + depth * 1.15;

        ctx.beginPath();
        ctx.arc(px, py, radius, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(245, 245, 243, ${Math.min(opacity, 1).toFixed(3)})`;
        ctx.fill();
      }

      angleRef.current += motion.speed;

      if (!reduceMotion) {
        rafRef.current = requestAnimationFrame(render);
      }
    };

    render();

    return () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [commandState, size]);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 14 }}>
      <div style={{ position: 'relative', width: size, height: size }}>
        {isAnimated && (
          <div
            aria-hidden="true"
            style={{
              position: 'absolute',
              inset: size * -0.06,
              borderRadius: '50%',
              background: 'radial-gradient(circle, rgba(255,255,255,0.06), transparent 70%)',
            }}
          />
        )}
        <canvas
          ref={canvasRef}
          style={{ width: size, height: size, display: 'block' }}
          role="img"
          aria-label={label || 'CIMA idle'}
        />
      </div>
      {label && (
        <div className="cima-mono" style={{ fontSize: 11, color: 'var(--cima-text-secondary)', letterSpacing: '0.03em' }}>
          {label}
        </div>
      )}
    </div>
  );
}
