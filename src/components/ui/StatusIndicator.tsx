interface StatusIndicatorProps {
  color: string;
  pulse?: boolean;
  size?: number;
}

export function StatusIndicator({ color, pulse = false, size = 6 }: StatusIndicatorProps) {
  return (
    <span
      style={{
        position: 'relative',
        display: 'inline-flex',
        width: size,
        height: size,
        borderRadius: 999,
        background: color,
        flexShrink: 0,
      }}
    >
      {pulse && (
        <span
          style={{
            position: 'absolute',
            inset: 0,
            borderRadius: 999,
            background: color,
            animation: 'cima-pulse-ring 2.4s var(--ease-quiet) infinite',
          }}
        />
      )}
    </span>
  );
}
