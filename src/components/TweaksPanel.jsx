import { useState, useRef, useEffect } from 'react';
import { COLOR_SCHEMES } from '../data.js';

// ── Draggable floating panel ─────────────────────────────────
export default function TweaksPanel({ tweaks, setTweak }) {
  const [open, setOpen] = useState(false);
  const [pos, setPos] = useState({ x: null, y: null });
  const panelRef = useRef(null);
  const dragRef = useRef(null);

  // Position on first open
  useEffect(() => {
    if (open && pos.x === null) {
      setPos({ x: window.innerWidth - 296, y: 60 });
    }
  }, [open]);

  // Drag logic
  const onDragStart = (e) => {
    const startX = e.clientX - pos.x;
    const startY = e.clientY - pos.y;
    const onMove = (ev) => setPos({ x: ev.clientX - startX, y: ev.clientY - startY });
    const onUp = () => { window.removeEventListener('mousemove', onMove); window.removeEventListener('mouseup', onUp); };
    window.addEventListener('mousemove', onMove);
    window.addEventListener('mouseup', onUp);
  };

  if (!open) {
    return (
      <button onClick={() => setOpen(true)}
        style={{
          position: 'fixed', right: 16, bottom: 16, zIndex: 1000,
          background: 'rgba(250,249,247,0.85)', backdropFilter: 'blur(12px)',
          border: '0.5px solid rgba(255,255,255,0.6)', borderRadius: 10,
          padding: '7px 12px', cursor: 'pointer', fontSize: 12, fontWeight: 600,
          color: '#555', boxShadow: '0 4px 16px rgba(0,0,0,0.12)',
          display: 'flex', alignItems: 'center', gap: 6,
        }}>
        ✦ 设置
      </button>
    );
  }

  const scheme = COLOR_SCHEMES[tweaks.colorScheme] || COLOR_SCHEMES.default;

  return (
    <div ref={panelRef}
      style={{
        position: 'fixed', left: pos.x ?? 'auto', top: pos.y ?? 'auto',
        zIndex: 2147483646, width: 280,
        maxHeight: 'calc(100vh - 32px)',
        display: 'flex', flexDirection: 'column',
        background: 'rgba(250,249,247,0.92)', color: '#29261b',
        backdropFilter: 'blur(24px) saturate(160%)',
        WebkitBackdropFilter: 'blur(24px) saturate(160%)',
        border: '0.5px solid rgba(255,255,255,0.6)', borderRadius: 14,
        boxShadow: '0 1px 0 rgba(255,255,255,0.5) inset, 0 12px 40px rgba(0,0,0,0.18)',
        font: '11.5px/1.4 ui-sans-serif, system-ui, -apple-system, sans-serif',
        overflow: 'hidden',
      }}>
      {/* Header */}
      <div onMouseDown={onDragStart}
        style={{
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          padding: '10px 8px 10px 14px', cursor: 'move', userSelect: 'none',
        }}>
        <b style={{ fontSize: 12, fontWeight: 600, letterSpacing: '0.01em' }}>设置</b>
        <button onClick={() => setOpen(false)}
          style={{
            appearance: 'none', border: 0, background: 'transparent',
            color: 'rgba(41,38,27,0.55)', width: 22, height: 22,
            borderRadius: 6, cursor: 'pointer', fontSize: 13, lineHeight: 1,
          }}
          onMouseEnter={e => { e.currentTarget.style.background = 'rgba(0,0,0,0.06)'; e.currentTarget.style.color = '#29261b'; }}
          onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = 'rgba(41,38,27,0.55)'; }}>
          ×
        </button>
      </div>

      {/* Body */}
      <div style={{ padding: '2px 14px 14px', display: 'flex', flexDirection: 'column', gap: 10, overflowY: 'auto', minHeight: 0 }}>

        {/* Color scheme */}
        <Section label="配色方案">
          <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
            {Object.entries(COLOR_SCHEMES).map(([key, s]) => (
              <button key={key} onClick={() => setTweak('colorScheme', key)}
                style={{
                  display: 'flex', alignItems: 'center', gap: 8, padding: '5px 8px',
                  borderRadius: 7, border: tweaks.colorScheme === key ? `1.5px solid ${s.accent}` : '1.5px solid transparent',
                  background: tweaks.colorScheme === key ? `${s.accentLight}` : 'transparent',
                  cursor: 'pointer', textAlign: 'left',
                }}>
                <span style={{ width: 16, height: 16, borderRadius: '50%', background: s.accent, flexShrink: 0 }} />
                <span style={{ fontSize: 12, fontWeight: tweaks.colorScheme === key ? 600 : 400 }}>{s.name}</span>
              </button>
            ))}
          </div>
        </Section>

        {/* Display */}
        <Section label="显示">
          <SliderRow label="字体大小" value={tweaks.fontSize} min={12} max={17} step={1} unit="px"
            onChange={v => setTweak('fontSize', v)} />
          <ToggleRow label="紧凑模式" value={tweaks.compactMode} onChange={v => setTweak('compactMode', v)} />
          <ToggleRow label="显示已完成" value={tweaks.showCompleted} onChange={v => setTweak('showCompleted', v)} />
          <ToggleRow label="暗色模式" value={tweaks.dark} onChange={v => setTweak('dark', v)} />
        </Section>

        {/* Layout */}
        <Section label="布局">
          <SliderRow label="侧栏宽度" value={tweaks.sidebarWidth} min={180} max={280} step={10} unit="px"
            onChange={v => setTweak('sidebarWidth', v)} />
        </Section>
      </div>
    </div>
  );
}

function Section({ label, children }) {
  return (
    <div>
      <div style={{
        fontSize: 10, fontWeight: 600, letterSpacing: '0.06em', textTransform: 'uppercase',
        color: 'rgba(41,38,27,0.45)', padding: '10px 0 6px',
      }}>{label}</div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
        {children}
      </div>
    </div>
  );
}

function SliderRow({ label, value, min, max, step, unit, onChange }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', color: 'rgba(41,38,27,0.72)' }}>
        <span style={{ fontWeight: 500 }}>{label}</span>
        <span style={{ color: 'rgba(41,38,27,0.5)', fontVariantNumeric: 'tabular-nums' }}>{value}{unit}</span>
      </div>
      <input type="range" min={min} max={max} step={step} value={value}
        onChange={e => onChange(Number(e.target.value))}
        style={{ width: '100%', accentColor: '#555' }} />
    </div>
  );
}

function ToggleRow({ label, value, onChange }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 10 }}>
      <span style={{ color: 'rgba(41,38,27,0.72)', fontWeight: 500 }}>{label}</span>
      <button onClick={() => onChange(!value)}
        style={{
          width: 36, height: 20, borderRadius: 10, border: 'none', cursor: 'pointer',
          background: value ? '#333' : 'rgba(0,0,0,0.15)',
          position: 'relative', transition: 'background 0.2s', flexShrink: 0,
          padding: 0,
        }}>
        <span style={{
          position: 'absolute', top: 2, left: value ? 18 : 2,
          width: 16, height: 16, borderRadius: '50%',
          background: '#fff', boxShadow: '0 1px 3px rgba(0,0,0,0.2)',
          transition: 'left 0.2s',
        }} />
      </button>
    </div>
  );
}
