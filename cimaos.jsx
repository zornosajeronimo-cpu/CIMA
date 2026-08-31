import React, { useState, useEffect, useRef, useMemo } from "react";
import {
  Compass,
  BookOpen,
  Users,
  Layers,
  Search,
  TrendingUp,
  GitBranch,
  Lightbulb,
  FlaskConical,
  Archive,
  ArrowUpRight,
  ArrowRight,
  Circle,
} from "lucide-react";

/**
 * NEXO OS — Paso 0: Foundation / Command Center
 * ------------------------------------------------------------------
 * This is the first structural + visual core of NEXO OS: a personal
 * operating system for working with AI. Nothing here is a real agent,
 * a real backend, or real automation — it is the disciplined shell
 * those things will eventually live inside.
 *
 * Data model (documented in JSDoc, since this file is JS, not TS):
 *
 * @typedef {Object} Client
 * @property {string} id
 * @property {string} name
 * @property {"Discovery"|"Solution Design"|"Build"|"Live"} stage
 * @property {"On track"|"Needs input"|"Blocked"} status
 * @property {string} nextAction
 *
 * @typedef {Object} Activity
 * @property {string} id
 * @property {string} label
 * @property {"active"|"queued"|"done"} state
 *
 * @typedef {Object} TodayItem
 * @property {string} id
 * @property {string} label
 * @property {string} meta
 * @property {boolean} done
 *
 * @typedef {Object} SystemComponentStatus
 * @property {string} id
 * @property {string} name
 * @property {"operational"|"ready"|"standby"} status
 *
 * @typedef {Object} NavSection
 * @property {string} id
 * @property {string} label
 * @property {any} icon
 * @property {boolean} structural  // true = placeholder only, not built yet
 */

// ---------------------------------------------------------------------------
// Design tokens
// ---------------------------------------------------------------------------

const TOKENS = `
  :root {
    --nexo-bg: #101211;
    --nexo-bg-elevated: #141716;
    --nexo-surface-1: rgba(255,255,255,0.035);
    --nexo-surface-2: rgba(255,255,255,0.06);
    --nexo-border: rgba(237,240,238,0.09);
    --nexo-border-strong: rgba(237,240,238,0.16);
    --nexo-text-primary: #EEF1EF;
    --nexo-text-secondary: #99A29D;
    --nexo-text-tertiary: #656E69;
    --nexo-accent: #4E9E74;
    --nexo-accent-dim: rgba(78,158,116,0.14);
    --nexo-accent-line: rgba(78,158,116,0.35);
    --nexo-amber: #B9925B;
    --nexo-red: #B96060;
    --radius-sm: 8px;
    --radius-md: 12px;
    --radius-lg: 18px;
    --ease-quiet: cubic-bezier(0.22, 1, 0.36, 1);
    --space-1: 4px;
    --space-2: 8px;
    --space-3: 12px;
    --space-4: 16px;
    --space-5: 24px;
    --space-6: 32px;
    --space-7: 48px;
    --space-8: 64px;
  }

  .nexo-root {
    background:
      radial-gradient(ellipse 900px 500px at 50% -8%, rgba(78,158,116,0.055), transparent 60%),
      var(--nexo-bg);
    color: var(--nexo-text-primary);
    font-family: "Inter", -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif;
    -webkit-font-smoothing: antialiased;
    min-height: 100%;
  }

  .nexo-mono {
    font-family: "IBM Plex Mono", ui-monospace, SFMono-Regular, Menlo, monospace;
    letter-spacing: 0.01em;
  }

  .nexo-scroll::-webkit-scrollbar { width: 6px; height: 6px; }
  .nexo-scroll::-webkit-scrollbar-thumb { background: rgba(255,255,255,0.08); border-radius: 4px; }
  .nexo-scroll::-webkit-scrollbar-track { background: transparent; }

  .nexo-focusable:focus-visible {
    outline: 1.5px solid var(--nexo-accent-line);
    outline-offset: 2px;
    border-radius: var(--radius-sm);
  }

  .nexo-glass {
    background: var(--nexo-surface-1);
    border: 1px solid var(--nexo-border);
    backdrop-filter: blur(18px);
    -webkit-backdrop-filter: blur(18px);
  }

  .nexo-glass-raised {
    background: linear-gradient(180deg, rgba(255,255,255,0.05), rgba(255,255,255,0.02));
    border: 1px solid var(--nexo-border-strong);
    box-shadow: 0 1px 0 rgba(255,255,255,0.04) inset, 0 20px 40px -24px rgba(0,0,0,0.6);
  }

  @keyframes nexo-breathe {
    0%, 100% { transform: scale(1); opacity: 0.9; }
    50% { transform: scale(1.035); opacity: 1; }
  }
  @keyframes nexo-rotate-slow {
    from { transform: rotate(0deg); }
    to { transform: rotate(360deg); }
  }
  @keyframes nexo-rotate-slow-rev {
    from { transform: rotate(0deg); }
    to { transform: rotate(-360deg); }
  }
  @keyframes nexo-pulse-ring {
    0% { transform: scale(0.92); opacity: 0.35; }
    70% { opacity: 0; }
    100% { transform: scale(1.28); opacity: 0; }
  }
  @keyframes nexo-fade-in {
    from { opacity: 0; }
    to { opacity: 1; }
  }

  @media (prefers-reduced-motion: reduce) {
    .nexo-anim, .nexo-anim * { animation: none !important; transition: none !important; }
  }
`;

// ---------------------------------------------------------------------------
// Mock data
// ---------------------------------------------------------------------------

/** @type {Client[]} */
const CLIENTS = [
  {
    id: "plantulas",
    name: "Plántulas de Colombia",
    stage: "Discovery",
    status: "On track",
    nextAction: "Map operations with the agronomy team",
  },
  {
    id: "plasticpack",
    name: "Plasticpack",
    stage: "Solution Design",
    status: "Needs input",
    nextAction: "Confirm process scope with plant manager",
  },
  {
    id: "colegio",
    name: "Colegio",
    stage: "Discovery",
    status: "On track",
    nextAction: "Draft first discovery summary",
  },
];

/** @type {Activity[]} */
const ACTIVITIES = [
  { id: "a1", label: "Reviewing Plántulas operations", state: "active" },
  { id: "a2", label: "Preparing Plasticpack discovery notes", state: "active" },
  { id: "a3", label: "Researching agent architecture patterns", state: "queued" },
  { id: "a4", label: "Testing a new coding workflow", state: "queued" },
  { id: "a5", label: "Building Colegio process map", state: "done" },
];

/** @type {TodayItem[]} */
const TODAY_ITEMS = [
  { id: "t1", label: "Plasticpack — solution design review", meta: "11:00", done: false },
  { id: "t2", label: "Draft Colegio discovery summary", meta: "Before 3pm", done: false },
  { id: "t3", label: "Read up on context engineering", meta: "Ongoing", done: true },
];

/** @type {SystemComponentStatus[]} */
const SYSTEM_STATUS = [
  { id: "core", name: "NEXO Core", status: "operational" },
  { id: "knowledge", name: "Knowledge", status: "ready" },
  { id: "agents", name: "Agents", status: "standby" },
  { id: "automations", name: "Automations", status: "ready" },
];

/** @type {NavSection[]} */
const NAV_SECTIONS = [
  { id: "overview", label: "Overview", icon: Compass, structural: false },
  { id: "knowledge", label: "Knowledge", icon: BookOpen, structural: true },
  { id: "clients", label: "Clients", icon: Users, structural: true },
  { id: "systems", label: "Systems", icon: Layers, structural: true },
  { id: "research", label: "Research", icon: Search, structural: true },
  { id: "sales", label: "Sales", icon: TrendingUp, structural: true },
  { id: "decisions", label: "Decisions", icon: GitBranch, structural: true },
  { id: "lessons", label: "Lessons", icon: Lightbulb, structural: true },
  { id: "experiments", label: "Experiments", icon: FlaskConical, structural: true },
  { id: "archive", label: "Archive", icon: Archive, structural: true },
];

const STATUS_META = {
  operational: { color: "var(--nexo-accent)", label: "Operational" },
  ready: { color: "var(--nexo-accent)", label: "Ready" },
  standby: { color: "var(--nexo-text-tertiary)", label: "Standby" },
  "On track": { color: "var(--nexo-accent)" },
  "Needs input": { color: "var(--nexo-amber)" },
  Blocked: { color: "var(--nexo-red)" },
};

// ---------------------------------------------------------------------------
// Primitive components
// ---------------------------------------------------------------------------

function GlassSurface({ children, raised = false, className = "", style = {} }) {
  return (
    <div
      className={`${raised ? "nexo-glass-raised" : "nexo-glass"} ${className}`}
      style={{ borderRadius: "var(--radius-lg)", ...style }}
    >
      {children}
    </div>
  );
}

function StatusIndicator({ color, pulse = false, size = 6 }) {
  return (
    <span
      className="nexo-anim"
      style={{
        position: "relative",
        display: "inline-flex",
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
            position: "absolute",
            inset: 0,
            borderRadius: 999,
            background: color,
            animation: "nexo-pulse-ring 2.4s var(--ease-quiet) infinite",
          }}
        />
      )}
    </span>
  );
}

function SectionHeader({ eyebrow, title, action }) {
  return (
    <div
      style={{
        display: "flex",
        alignItems: "baseline",
        justifyContent: "space-between",
        marginBottom: "var(--space-4)",
      }}
    >
      <div>
        {eyebrow && (
          <div
            className="nexo-mono"
            style={{
              fontSize: 11,
              color: "var(--nexo-text-tertiary)",
              marginBottom: 2,
            }}
          >
            {eyebrow}
          </div>
        )}
        <h2 style={{ fontSize: 15, fontWeight: 600, letterSpacing: "-0.01em", margin: 0 }}>
          {title}
        </h2>
      </div>
      {action}
    </div>
  );
}

// ---------------------------------------------------------------------------
// AI Orb — abstract, minimal, not a chatbot avatar. Precursor to IRIS.
// ---------------------------------------------------------------------------

function AIOrb({ active = true }) {
  return (
    <div
      className="nexo-anim"
      style={{
        position: "relative",
        width: 116,
        height: 116,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
      }}
      aria-hidden="true"
    >
      {/* outer ambient ring */}
      <div
        style={{
          position: "absolute",
          inset: 0,
          borderRadius: "50%",
          border: "1px solid rgba(78,158,116,0.14)",
          animation: "nexo-rotate-slow 22s linear infinite",
        }}
      >
        <div
          style={{
            position: "absolute",
            top: -1.5,
            left: "50%",
            width: 3,
            height: 3,
            borderRadius: 999,
            background: "var(--nexo-accent)",
            transform: "translateX(-50%)",
          }}
        />
      </div>

      {/* inner ring, counter-rotating */}
      <div
        style={{
          position: "absolute",
          inset: 16,
          borderRadius: "50%",
          border: "1px solid rgba(237,240,238,0.08)",
          animation: "nexo-rotate-slow-rev 16s linear infinite",
        }}
      />

      {/* core */}
      <div
        style={{
          position: "relative",
          width: 46,
          height: 46,
          borderRadius: "50%",
          background:
            "radial-gradient(circle at 32% 28%, rgba(150,210,180,0.9), rgba(78,158,116,0.55) 45%, rgba(78,158,116,0.12) 72%)",
          boxShadow: active
            ? "0 0 26px rgba(78,158,116,0.28), 0 0 2px rgba(78,158,116,0.6)"
            : "none",
          animation: active ? "nexo-breathe 4.5s var(--ease-quiet) infinite" : "none",
        }}
      />
    </div>
  );
}

// ---------------------------------------------------------------------------
// Command input
// ---------------------------------------------------------------------------

function CommandInput() {
  const [value, setValue] = useState("");
  const [focused, setFocused] = useState(false);

  return (
    <div style={{ width: "100%", maxWidth: 560 }}>
      <div
        className="nexo-glass"
        style={{
          borderRadius: 999,
          padding: "4px 6px 4px 20px",
          display: "flex",
          alignItems: "center",
          gap: 12,
          borderColor: focused ? "var(--nexo-border-strong)" : "var(--nexo-border)",
          transition: "border-color 220ms var(--ease-quiet), background 220ms var(--ease-quiet)",
          background: focused ? "rgba(255,255,255,0.05)" : "var(--nexo-surface-1)",
        }}
      >
        <input
          className="nexo-focusable"
          value={value}
          onChange={(e) => setValue(e.target.value)}
          onFocus={() => setFocused(true)}
          onBlur={() => setFocused(false)}
          placeholder="Ask NEXO anything…"
          aria-label="Command input"
          style={{
            flex: 1,
            background: "transparent",
            border: "none",
            outline: "none",
            color: "var(--nexo-text-primary)",
            fontSize: 14,
            padding: "10px 0",
          }}
        />
        <button
          type="button"
          className="nexo-focusable"
          aria-label="Send command"
          disabled={!value.trim()}
          style={{
            width: 34,
            height: 34,
            borderRadius: "50%",
            border: "1px solid var(--nexo-border-strong)",
            background: value.trim() ? "var(--nexo-accent-dim)" : "transparent",
            color: value.trim() ? "var(--nexo-accent)" : "var(--nexo-text-tertiary)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            cursor: value.trim() ? "pointer" : "default",
            transition: "all 200ms var(--ease-quiet)",
            flexShrink: 0,
          }}
        >
          <ArrowRight size={15} strokeWidth={2} />
        </button>
      </div>
      <p
        style={{
          textAlign: "center",
          fontSize: 12,
          color: "var(--nexo-text-tertiary)",
          marginTop: 14,
        }}
      >
        Research, design, build and execute — arriving as NEXO grows.
      </p>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Live activity
// ---------------------------------------------------------------------------

function LiveActivity() {
  return (
    <GlassSurface style={{ padding: "var(--space-5)", height: "100%" }}>
      <SectionHeader eyebrow="Live" title="What NEXO is doing" />
      <ul style={{ listStyle: "none", margin: 0, padding: 0, display: "flex", flexDirection: "column", gap: 14 }}>
        {ACTIVITIES.slice(0, 4).map((a) => (
          <li key={a.id} style={{ display: "flex", alignItems: "flex-start", gap: 10 }}>
            <span style={{ marginTop: 5 }}>
              <StatusIndicator
                color={
                  a.state === "active"
                    ? "var(--nexo-accent)"
                    : a.state === "queued"
                    ? "var(--nexo-text-tertiary)"
                    : "rgba(237,240,238,0.22)"
                }
                pulse={a.state === "active"}
              />
            </span>
            <span
              style={{
                fontSize: 13.5,
                color: a.state === "done" ? "var(--nexo-text-tertiary)" : "var(--nexo-text-secondary)",
                textDecoration: a.state === "done" ? "line-through" : "none",
                lineHeight: 1.4,
              }}
            >
              {a.label}
            </span>
          </li>
        ))}
      </ul>
    </GlassSurface>
  );
}

// ---------------------------------------------------------------------------
// Today
// ---------------------------------------------------------------------------

function TodayPanel() {
  return (
    <GlassSurface style={{ padding: "var(--space-5)", height: "100%" }}>
      <SectionHeader eyebrow="Today" title="What matters right now" />
      <ul style={{ listStyle: "none", margin: 0, padding: 0, display: "flex", flexDirection: "column", gap: 14 }}>
        {TODAY_ITEMS.map((t) => (
          <li key={t.id} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 10 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
              <span
                style={{
                  width: 13,
                  height: 13,
                  borderRadius: 4,
                  border: `1px solid ${t.done ? "var(--nexo-accent-line)" : "var(--nexo-border-strong)"}`,
                  background: t.done ? "var(--nexo-accent-dim)" : "transparent",
                  flexShrink: 0,
                }}
              />
              <span
                style={{
                  fontSize: 13.5,
                  color: t.done ? "var(--nexo-text-tertiary)" : "var(--nexo-text-secondary)",
                  textDecoration: t.done ? "line-through" : "none",
                }}
              >
                {t.label}
              </span>
            </div>
            <span className="nexo-mono" style={{ fontSize: 11, color: "var(--nexo-text-tertiary)", flexShrink: 0 }}>
              {t.meta}
            </span>
          </li>
        ))}
      </ul>
    </GlassSurface>
  );
}

// ---------------------------------------------------------------------------
// Clients
// ---------------------------------------------------------------------------

function ClientCard({ client }) {
  const statusColor = STATUS_META[client.status]?.color ?? "var(--nexo-text-tertiary)";
  return (
    <div
      className="nexo-focusable"
      tabIndex={0}
      style={{
        padding: "14px 16px",
        borderRadius: "var(--radius-md)",
        border: "1px solid var(--nexo-border)",
        display: "flex",
        flexDirection: "column",
        gap: 8,
        cursor: "default",
        transition: "border-color 200ms var(--ease-quiet), background 200ms var(--ease-quiet)",
      }}
      onMouseEnter={(e) => (e.currentTarget.style.borderColor = "var(--nexo-border-strong)")}
      onMouseLeave={(e) => (e.currentTarget.style.borderColor = "var(--nexo-border)")}
    >
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <span style={{ fontSize: 13.5, fontWeight: 500 }}>{client.name}</span>
        <span style={{ display: "flex", alignItems: "center", gap: 6 }}>
          <StatusIndicator color={statusColor} />
          <span className="nexo-mono" style={{ fontSize: 10.5, color: "var(--nexo-text-tertiary)" }}>
            {client.status}
          </span>
        </span>
      </div>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <span
          style={{
            fontSize: 11,
            color: "var(--nexo-text-secondary)",
            background: "var(--nexo-surface-2)",
            border: "1px solid var(--nexo-border)",
            padding: "2px 8px",
            borderRadius: 999,
          }}
        >
          {client.stage}
        </span>
      </div>
      <p style={{ fontSize: 12, color: "var(--nexo-text-tertiary)", margin: 0, lineHeight: 1.4 }}>
        {client.nextAction}
      </p>
    </div>
  );
}

function ClientList() {
  return (
    <GlassSurface style={{ padding: "var(--space-5)", height: "100%" }}>
      <SectionHeader eyebrow="Clients" title="Active engagements" />
      <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
        {CLIENTS.map((c) => (
          <ClientCard key={c.id} client={c} />
        ))}
      </div>
    </GlassSurface>
  );
}

// ---------------------------------------------------------------------------
// System status strip
// ---------------------------------------------------------------------------

function SystemStatus() {
  return (
    <div
      className="nexo-glass"
      style={{
        borderRadius: "var(--radius-md)",
        padding: "12px 20px",
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        flexWrap: "wrap",
        gap: 16,
      }}
    >
      <span className="nexo-mono" style={{ fontSize: 11, color: "var(--nexo-text-tertiary)" }}>
        System status
      </span>
      <div style={{ display: "flex", alignItems: "center", gap: 22, flexWrap: "wrap" }}>
        {SYSTEM_STATUS.map((s) => (
          <div key={s.id} style={{ display: "flex", alignItems: "center", gap: 7 }}>
            <StatusIndicator
              color={STATUS_META[s.status]?.color ?? "var(--nexo-text-tertiary)"}
              pulse={s.status === "operational"}
            />
            <span style={{ fontSize: 12.5, color: "var(--nexo-text-secondary)" }}>{s.name}</span>
            <span className="nexo-mono" style={{ fontSize: 11, color: "var(--nexo-text-tertiary)" }}>
              {STATUS_META[s.status]?.label}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Sidebar + top bar + shell
// ---------------------------------------------------------------------------

function Sidebar({ selected, onSelect }) {
  return (
    <aside
      style={{
        width: 232,
        flexShrink: 0,
        borderRight: "1px solid var(--nexo-border)",
        display: "flex",
        flexDirection: "column",
        padding: "22px 14px",
        gap: 26,
      }}
    >
      <div style={{ display: "flex", alignItems: "center", gap: 9, padding: "0 8px" }}>
        <div
          style={{
            width: 20,
            height: 20,
            borderRadius: 6,
            background: "linear-gradient(160deg, rgba(150,210,180,0.9), rgba(78,158,116,0.5))",
            boxShadow: "0 0 10px rgba(78,158,116,0.25)",
          }}
        />
        <span style={{ fontSize: 13.5, fontWeight: 600, letterSpacing: "0.01em" }}>NEXO OS</span>
      </div>

      <nav style={{ display: "flex", flexDirection: "column", gap: 2 }}>
        {NAV_SECTIONS.map((section) => {
          const Icon = section.icon;
          const isActive = selected === section.id;
          return (
            <button
              key={section.id}
              className="nexo-focusable"
              onClick={() => onSelect(section.id)}
              style={{
                display: "flex",
                alignItems: "center",
                gap: 10,
                padding: "8px 10px",
                borderRadius: "var(--radius-sm)",
                border: "none",
                background: isActive ? "var(--nexo-surface-2)" : "transparent",
                color: isActive ? "var(--nexo-text-primary)" : "var(--nexo-text-secondary)",
                fontSize: 13,
                textAlign: "left",
                cursor: "pointer",
                transition: "background 160ms var(--ease-quiet), color 160ms var(--ease-quiet)",
              }}
              onMouseEnter={(e) => {
                if (!isActive) e.currentTarget.style.background = "rgba(255,255,255,0.03)";
              }}
              onMouseLeave={(e) => {
                if (!isActive) e.currentTarget.style.background = "transparent";
              }}
            >
              <Icon size={15} strokeWidth={1.75} style={{ flexShrink: 0 }} />
              <span style={{ flex: 1 }}>{section.label}</span>
              {section.structural && (
                <span
                  style={{
                    width: 4,
                    height: 4,
                    borderRadius: 999,
                    background: "var(--nexo-text-tertiary)",
                    opacity: 0.6,
                  }}
                  aria-hidden="true"
                />
              )}
            </button>
          );
        })}
      </nav>

      <div style={{ marginTop: "auto", padding: "10px 8px 0" }}>
        <div style={{ height: 1, background: "var(--nexo-border)", marginBottom: 12 }} />
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <StatusIndicator color="var(--nexo-accent)" pulse />
          <span className="nexo-mono" style={{ fontSize: 10.5, color: "var(--nexo-text-tertiary)" }}>
            Core operational
          </span>
        </div>
      </div>
    </aside>
  );
}

function TopBar({ sectionLabel }) {
  const [time, setTime] = useState(new Date());
  useEffect(() => {
    const id = setInterval(() => setTime(new Date()), 30000);
    return () => clearInterval(id);
  }, []);
  const formatted = useMemo(
    () =>
      time.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }) +
      " · " +
      time.toLocaleDateString([], { weekday: "long", day: "numeric", month: "long" }),
    [time]
  );
  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        padding: "16px 28px",
        borderBottom: "1px solid var(--nexo-border)",
      }}
    >
      <span className="nexo-mono" style={{ fontSize: 11.5, color: "var(--nexo-text-tertiary)" }}>
        {sectionLabel}
      </span>
      <span className="nexo-mono" style={{ fontSize: 11.5, color: "var(--nexo-text-tertiary)" }}>
        {formatted}
      </span>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Overview / Command Center home
// ---------------------------------------------------------------------------

function CommandCenter() {
  return (
    <div
      style={{
        maxWidth: 1080,
        margin: "0 auto",
        padding: "48px 28px 64px",
        display: "flex",
        flexDirection: "column",
        gap: 44,
      }}
    >
      <header style={{ textAlign: "center" }}>
        <h1
          style={{
            fontSize: 26,
            fontWeight: 600,
            letterSpacing: "-0.015em",
            margin: 0,
          }}
        >
          NEXO OS
        </h1>
        <p style={{ fontSize: 13.5, color: "var(--nexo-text-secondary)", marginTop: 6 }}>
          Personal Intelligence &amp; Operations System
        </p>
      </header>

      <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 26, padding: "10px 0 6px" }}>
        <AIOrb />
        <CommandInput />
      </div>

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(3, 1fr)",
          gap: 18,
        }}
      >
        <LiveActivity />
        <TodayPanel />
        <ClientList />
      </div>

      <SystemStatus />
    </div>
  );
}

// ---------------------------------------------------------------------------
// Structural placeholder for not-yet-built sections
// ---------------------------------------------------------------------------

function StructuralPlaceholder({ section, onBack }) {
  return (
    <div style={{ maxWidth: 720, margin: "0 auto", padding: "72px 28px" }}>
      <GlassSurface style={{ padding: "40px 36px" }}>
        <div className="nexo-mono" style={{ fontSize: 11, color: "var(--nexo-text-tertiary)", marginBottom: 10 }}>
          Structural — not yet built
        </div>
        <h2 style={{ fontSize: 20, fontWeight: 600, margin: "0 0 10px" }}>{section.label}</h2>
        <p style={{ fontSize: 13.5, color: "var(--nexo-text-secondary)", lineHeight: 1.6, maxWidth: 480 }}>
          This module is reserved in NEXO OS's information architecture. Its interface and
          logic will be designed in a later step — Paso 0 only establishes where it lives.
        </p>
        <button
          onClick={onBack}
          className="nexo-focusable"
          style={{
            marginTop: 22,
            display: "inline-flex",
            alignItems: "center",
            gap: 6,
            background: "transparent",
            border: "1px solid var(--nexo-border-strong)",
            color: "var(--nexo-text-primary)",
            borderRadius: 999,
            padding: "8px 16px",
            fontSize: 12.5,
            cursor: "pointer",
          }}
        >
          Back to Overview <ArrowUpRight size={13} />
        </button>
      </GlassSurface>
    </div>
  );
}

// ---------------------------------------------------------------------------
// App shell
// ---------------------------------------------------------------------------

export default function NexoOS() {
  const [selected, setSelected] = useState("overview");
  const activeSection = NAV_SECTIONS.find((s) => s.id === selected) ?? NAV_SECTIONS[0];

  return (
    <div className="nexo-root nexo-anim" style={{ display: "flex", height: "100%", minHeight: 640 }}>
      <style>{TOKENS}</style>
      <link rel="preconnect" href="https://fonts.googleapis.com" />
      <link
        href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600&family=IBM+Plex+Mono:wght@400;500&display=swap"
        rel="stylesheet"
      />
      <Sidebar selected={selected} onSelect={setSelected} />
      <div style={{ flex: 1, display: "flex", flexDirection: "column", minWidth: 0 }} className="nexo-scroll">
        <TopBar sectionLabel={activeSection.label} />
        <div style={{ flex: 1, overflowY: "auto" }} className="nexo-scroll">
          {selected === "overview" ? (
            <CommandCenter />
          ) : (
            <StructuralPlaceholder section={activeSection} onBack={() => setSelected("overview")} />
          )}
        </div>
      </div>
    </div>
  );
}