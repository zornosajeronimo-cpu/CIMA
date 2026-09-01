import { useState, useRef, type KeyboardEvent } from 'react';
import { ArrowRight } from 'lucide-react';
import { useApp } from '@/state/AppContext';

type InputState = 'idle' | 'focused' | 'typing' | 'submitting';

/**
 * CommandInput — the primary interface for issuing commands to CIMA.
 *
 * Current behavior (Paso 0):
 *   User types → submits → activity logged → input cleared.
 *
 * Future behavior (Paso 1+):
 *   Submit → Command → CommandRouter → ContextBuilder → Brain → Tool → Result → Activity
 */
export function CommandInput() {
  const { submitCommand } = useApp();
  const [value, setValue] = useState('');
  const [inputState, setInputState] = useState<InputState>('idle');
  const inputRef = useRef<HTMLInputElement>(null);

  const hasValue = value.trim().length > 0;

  const handleSubmit = () => {
    if (!hasValue || inputState === 'submitting') return;

    setInputState('submitting');
    submitCommand(value.trim());

    // Brief submitting flash, then reset
    setTimeout(() => {
      setValue('');
      setInputState('idle');
      inputRef.current?.blur();
    }, 280);
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') handleSubmit();
    if (e.key === 'Escape') {
      setValue('');
      setInputState('idle');
      inputRef.current?.blur();
    }
  };

  const isFocused = inputState === 'focused' || inputState === 'typing' || inputState === 'submitting';

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
          opacity: inputState === 'submitting' ? 0.7 : 1,
        }}
      >
        <input
          ref={inputRef}
          className="cima-focusable"
          value={value}
          onChange={(e) => {
            setValue(e.target.value);
            setInputState(e.target.value ? 'typing' : 'focused');
          }}
          onFocus={() => setInputState(value ? 'typing' : 'focused')}
          onBlur={() => setInputState('idle')}
          onKeyDown={handleKeyDown}
          placeholder="Ask CIMA anything…"
          aria-label="Command input — type a command and press Enter"
          disabled={inputState === 'submitting'}
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
          disabled={!hasValue || inputState === 'submitting'}
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
        Research, design, build and execute — arriving as CIMA grows.
      </p>
    </div>
  );
}
