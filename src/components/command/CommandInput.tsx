import { useState, useRef, type KeyboardEvent, useEffect } from 'react';
import { ArrowRight } from 'lucide-react';
import { useApp } from '@/state/AppContext';

export function CommandInput() {
  const { state, submitCommand } = useApp();
  const [value, setValue] = useState('');
  const [focused, setFocused] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const hasValue = value.trim().length > 0;
  const isSubmitting = state.isCommandRunning;

  // Clear input when command finishes running successfully
  useEffect(() => {
    if (!isSubmitting && value && !focused) {
      setValue('');
    }
  }, [isSubmitting, value, focused]);

  const handleSubmit = async () => {
    if (!hasValue || isSubmitting) return;
    const commandText = value.trim();
    setValue('');
    await submitCommand(commandText);
    inputRef.current?.blur();
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') handleSubmit();
    if (e.key === 'Escape') {
      setValue('');
      inputRef.current?.blur();
    }
  };

  const isFocused = focused || isSubmitting || hasValue;

  return (
    <div style={{ width: '100%', maxWidth: 520 }}>
      <div
        className="cima-glass"
        style={{
          borderRadius: 999,
          padding: '4px 5px 4px 18px',
          display: 'flex',
          alignItems: 'center',
          gap: 10,
          borderColor: isFocused ? 'var(--cima-border-strong)' : 'var(--cima-border)',
          transition: 'border-color 200ms var(--ease-quiet), background 200ms var(--ease-quiet)',
          background: isFocused ? 'rgba(255,255,255,0.045)' : 'var(--cima-surface-1)',
          opacity: isSubmitting ? 0.7 : 1,
        }}
      >
        <input
          ref={inputRef}
          className="cima-focusable"
          value={value}
          onChange={(e) => setValue(e.target.value)}
          onFocus={() => setFocused(true)}
          onBlur={() => setFocused(false)}
          onKeyDown={handleKeyDown}
          placeholder={isSubmitting ? "Processing..." : "Ask CIMA anything…"}
          aria-label="Command input"
          disabled={isSubmitting}
          style={{
            flex: 1,
            background: 'transparent',
            border: 'none',
            outline: 'none',
            color: 'var(--cima-text-primary)',
            fontSize: 13.5,
            padding: '10px 0',
            fontFamily: 'inherit',
          }}
        />
        <button
          type="button"
          className="cima-focusable"
          aria-label="Send command"
          disabled={!hasValue || isSubmitting}
          onClick={handleSubmit}
          style={{
            width: 32,
            height: 32,
            borderRadius: '50%',
            border: '1px solid var(--cima-border-strong)',
            background: hasValue ? 'var(--cima-accent-dim)' : 'transparent',
            color: hasValue ? 'var(--cima-accent)' : 'var(--cima-text-tertiary)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            cursor: hasValue ? 'pointer' : 'default',
            transition: 'all 180ms var(--ease-quiet)',
            flexShrink: 0,
          }}
        >
          <ArrowRight size={14} strokeWidth={2} />
        </button>
      </div>
      <p
        style={{
          textAlign: 'center',
          fontSize: 11.5,
          color: 'var(--cima-text-tertiary)',
          marginTop: 12,
          lineHeight: 1.5,
        }}
      >
        {isSubmitting ? 'Command sent to router...' : '⏎ Enter to send, Esc to clear'}
      </p>
    </div>
  );
}
