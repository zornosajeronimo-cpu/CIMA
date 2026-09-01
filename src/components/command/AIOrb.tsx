interface AIorbProps {
  active?: boolean;
}

/**
 * AIOrb — abstract, minimal, not a chatbot avatar.
 * Precursor to IRIS. Keep it small, alive, and elegant.
 * The orb's design intentionally leaves room to evolve in Paso 1+.
 */
export function AIOrb({ active = true }: AIorbProps) {
  return (
    <div
      style={{
        position: 'relative',
        width: 100,
        height: 100,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
      }}
      aria-hidden="true"
      aria-label="CIMA intelligence core"
    >
      {/* Outer ambient ring */}
      <div
        style={{
          position: 'absolute',
          inset: 0,
          borderRadius: '50%',
          border: '1px solid rgba(78,158,116,0.13)',
          animation: 'cima-rotate-slow 24s linear infinite',
        }}
      >
        <div
          style={{
            position: 'absolute',
            top: -1.5,
            left: '50%',
            width: 3,
            height: 3,
            borderRadius: 999,
            background: 'var(--cima-accent)',
            transform: 'translateX(-50%)',
            opacity: 0.8,
          }}
        />
      </div>

      {/* Inner ring, counter-rotating */}
      <div
        style={{
          position: 'absolute',
          inset: 14,
          borderRadius: '50%',
          border: '1px solid rgba(237,240,238,0.06)',
          animation: 'cima-rotate-slow-rev 18s linear infinite',
        }}
      />

      {/* Core sphere */}
      <div
        style={{
          position: 'relative',
          width: 40,
          height: 40,
          borderRadius: '50%',
          background:
            'radial-gradient(circle at 32% 28%, rgba(150,210,180,0.88), rgba(78,158,116,0.5) 46%, rgba(78,158,116,0.1) 72%)',
          boxShadow: active
            ? '0 0 22px rgba(78,158,116,0.22), 0 0 2px rgba(78,158,116,0.5)'
            : 'none',
          animation: active ? 'cima-breathe 5s var(--ease-quiet) infinite' : 'none',
        }}
      />
    </div>
  );
}
