import { useState, useRef, useEffect } from 'react';
import { Icon, LucideIcon } from '../Icon.jsx';
import { fmt, fmtDate, PRIORITY, PRIORITY_BG, PRIORITY_LABEL } from '../data.js';

function SubtaskRow({ sub, accent, fontSize, onToggle, onUpdate }) {
  const [open, setOpen] = useState(false);
  const [noteVal, setNoteVal] = useState(sub.note || '');

  const due = sub.due ? new Date(sub.due) : null;
  const dateStr = due
    ? `${due.getFullYear()}-${String(due.getMonth() + 1).padStart(2, '0')}-${String(due.getDate()).padStart(2, '0')}`
    : '';
  const timeStr = due
    ? `${String(due.getHours()).padStart(2, '0')}:${String(due.getMinutes()).padStart(2, '0')}`
    : '';

  const setDate = (val) => {
    if (!val) { onUpdate({ due: null }); return; }
    const [y, mo, day] = val.split('-').map(Number);
    const d = due ? new Date(due) : new Date();
    d.setFullYear(y, mo - 1, day);
    onUpdate({ due: d });
  };
  const setTime = (val) => {
    if (!val) return;
    const [h, m] = val.split(':').map(Number);
    const d = due ? new Date(due) : new Date();
    d.setHours(h, m, 0, 0);
    onUpdate({ due: d });
  };

  return (
    <div style={{ borderBottom: '1px solid var(--border-mid)' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '6px 0' }}>
        <div className={`sub-checkbox${sub.done ? ' checked' : ''}`} onClick={onToggle} />
        <span style={{
          flex: 1, fontSize: fontSize - 1,
          color: sub.done ? 'var(--text-faint)' : 'var(--text-sub)',
          textDecoration: sub.done ? 'line-through' : 'none',
        }}>{sub.text}</span>
        {due && (
          <span style={{ fontSize: fontSize - 3, color: accent, fontVariantNumeric: 'tabular-nums', flexShrink: 0 }}>
            {`${due.getMonth() + 1}/${due.getDate()} ${String(due.getHours()).padStart(2,'0')}:${String(due.getMinutes()).padStart(2,'0')}`}
          </span>
        )}
        <button onClick={() => setOpen(v => !v)}
          style={{ background: 'none', border: 'none', cursor: 'pointer', padding: '2px 3px', display: 'flex', alignItems: 'center', color: 'var(--text-faint)', flexShrink: 0 }}>
          <span style={{ display: 'inline-block', transform: open ? 'rotate(0deg)' : 'rotate(-90deg)', transition: 'transform 0.15s', fontSize: 16 }}>▾</span>
        </button>
      </div>
      {open && (
        <div style={{ paddingLeft: 24, paddingBottom: 8, display: 'flex', flexDirection: 'column', gap: 6 }}>
          <div style={{ display: 'flex', gap: 6 }}>
            <input type="date" value={dateStr} onChange={e => setDate(e.target.value)}
              style={{ flex: 1, border: '1px solid var(--border)', borderRadius: 5, padding: '4px 7px', fontSize: fontSize - 2, color: accent, background: 'var(--bg-hover)', outline: 'none', fontFamily: 'inherit' }} />
            <input type="time" value={timeStr} onChange={e => setTime(e.target.value)}
              style={{ flex: 1, border: '1px solid var(--border)', borderRadius: 5, padding: '4px 7px', fontSize: fontSize - 2, color: accent, background: 'var(--bg-hover)', outline: 'none', fontFamily: 'inherit' }} />
          </div>
          <input value={noteVal}
            onChange={e => setNoteVal(e.target.value)}
            onBlur={() => onUpdate({ note: noteVal })}
            placeholder="备注…"
            style={{ border: '1px solid var(--border)', borderRadius: 5, padding: '4px 7px', fontSize: fontSize - 2, color: 'var(--text-sub)', background: 'var(--bg-hover)', outline: 'none', fontFamily: 'inherit' }} />
        </div>
      )}
    </div>
  );
}

function IconBtn({ children, onClick }) {
  const [h, setH] = useState(false);
  return (
    <button onClick={onClick}
      onMouseEnter={() => setH(true)}
      onMouseLeave={() => setH(false)}
      style={{
        border: 'none', background: h ? 'var(--bg-hover)' : 'transparent',
        borderRadius: 6, padding: '5px', cursor: 'pointer', display: 'flex', alignItems: 'center',
      }}>
      {children}
    </button>
  );
}

export default function DetailPanel({ task, lists, scheme, fontSize, onClose, onUpdate, onDelete, onToggleSub, onAddSub, onUpdateSub, onToggleMain }) {
  const [noteVal, setNoteVal] = useState(task.note);
  const [addingSubtask, setAddingSubtask] = useState(false);
  const [newSub, setNewSub] = useState('');
  const [editTitle, setEditTitle] = useState(false);
  const [titleVal, setTitleVal] = useState(task.title);
  const subRef = useRef(null);
  const titleRef = useRef(null);

  const { accent, accentLight, accentText } = scheme;

  useEffect(() => { if (addingSubtask && subRef.current) subRef.current.focus(); }, [addingSubtask]);
  useEffect(() => { if (editTitle && titleRef.current) titleRef.current.focus(); }, [editTitle]);

  const submitSub = () => { onAddSub(newSub); setNewSub(''); setAddingSubtask(false); };
  const saveNote = () => { onUpdate({ note: noteVal }); };
  const saveTitle = () => { if (titleVal.trim()) onUpdate({ title: titleVal.trim() }); setEditTitle(false); };

  const list = lists.find(l => l.id === task.listId);
  const doneCount = task.subtasks.filter(s => s.done).length;
  const progress = task.subtasks.length > 0 ? doneCount / task.subtasks.length : 0;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%', background: 'var(--bg-panel)' }}>
      {/* Header */}
      <div style={{
        padding: '14px 16px 10px', borderBottom: '1px solid var(--border-mid)',
        display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexShrink: 0,
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          {list && (
            <span style={{
              fontSize: 11, color: 'var(--text-muted)', background: 'var(--bg-hover)',
              borderRadius: 4, padding: '2px 6px', display: 'inline-flex', alignItems: 'center', gap: 4,
            }}>
              <LucideIcon name={list.icon} size={11} color="var(--text-muted)" /> {list.name}
            </span>
          )}
          <span style={{ fontSize: 11, color: 'var(--text-faint)' }}>
            {fmtDate(task.due)} {fmt(task.due)}
          </span>
        </div>
        <div style={{ display: 'flex', gap: 4 }}>
          <IconBtn onClick={() => onDelete()}><Icon name="trash" size={14} color="#ccc" /></IconBtn>
          <IconBtn onClick={onClose}><Icon name="close" size={14} color="#ccc" /></IconBtn>
        </div>
      </div>

      <div style={{ flex: 1, overflowY: 'auto', padding: '16px' }}>
        {/* Title + checkbox */}
        <div style={{ display: 'flex', alignItems: 'flex-start', gap: 10, marginBottom: 12 }}>
          <div style={{ paddingTop: 3 }}>
            <div className={`task-checkbox${task.done ? ' checked' : ''}`} onClick={onToggleMain} />
          </div>
          {editTitle
            ? <input ref={titleRef} value={titleVal}
                onChange={e => setTitleVal(e.target.value)}
                onBlur={saveTitle}
                onKeyDown={e => { if (e.key === 'Enter') saveTitle(); if (e.key === 'Escape') setEditTitle(false); }}
                style={{
                  flex: 1, border: 'none', outline: 'none',
                  fontSize: fontSize + 4, fontWeight: 700,
                  color: 'var(--text-main)', background: 'transparent',
                  textDecoration: task.done ? 'line-through' : 'none',
                }} />
            : <div onClick={() => setEditTitle(true)}
                style={{
                  flex: 1, fontSize: fontSize + 4, fontWeight: 700,
                  color: task.done ? 'var(--text-faint)' : 'var(--text-main)',
                  textDecoration: task.done ? 'line-through' : 'none',
                  cursor: 'text', lineHeight: 1.3, wordBreak: 'break-all',
                }}>
                {task.title}
              </div>
          }
        </div>

        {/* Progress bar */}
        {task.subtasks.length > 0 && (
          <div style={{ marginBottom: 14 }}>
            <div style={{ height: 3, background: 'var(--border)', borderRadius: 2, overflow: 'hidden' }}>
              <div style={{ height: '100%', width: `${progress * 100}%`, background: accent, borderRadius: 2, transition: 'width 0.3s' }} />
            </div>
            <div style={{ fontSize: fontSize - 2, color: '#aaa', marginTop: 4 }}>{doneCount}/{task.subtasks.length} 已完成</div>
          </div>
        )}

        {/* Subtasks */}
        <div style={{ marginBottom: 12 }}>
          <div style={{ fontSize: fontSize - 1, fontWeight: 600, color: '#999', marginBottom: 8, display: 'flex', alignItems: 'center', gap: 4 }}>
            <Icon name="subtask" size={13} color="#bbb" />子任务
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
            {task.subtasks.map(s => (
              <SubtaskRow key={s.id} sub={s} accent={accent} fontSize={fontSize}
                onToggle={() => onToggleSub(s.id)}
                onUpdate={patch => onUpdateSub(s.id, patch)}
              />
            ))}
            {addingSubtask ? (
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <div className="sub-checkbox" style={{ borderColor: accent }} />
                <input ref={subRef} value={newSub}
                  onChange={e => setNewSub(e.target.value)}
                  onKeyDown={e => { if (e.key === 'Enter') submitSub(); if (e.key === 'Escape') { setAddingSubtask(false); setNewSub(''); } }}
                  onBlur={() => { if (!newSub) setAddingSubtask(false); }}
                  placeholder="子任务…"
                  style={{
                    flex: 1, border: 'none', borderBottom: `1px solid ${accent}`,
                    outline: 'none', fontSize: fontSize - 1, color: 'var(--text-main)',
                    background: 'transparent', paddingBottom: 2,
                  }} />
              </div>
            ) : (
              <button onClick={() => setAddingSubtask(true)}
                style={{ display: 'flex', alignItems: 'center', gap: 5, background: 'none', border: 'none', color: '#ccc', cursor: 'pointer', fontSize: fontSize - 1, padding: '4px 0', transition: 'color 0.15s' }}
                onMouseEnter={e => e.currentTarget.style.color = accent}
                onMouseLeave={e => e.currentTarget.style.color = '#ccc'}>
                <Icon name="add" size={12} color="currentColor" /> 添加子任务
              </button>
            )}
          </div>
        </div>

        {/* Note */}
        <div style={{ marginBottom: 12 }}>
          <div style={{ fontSize: fontSize - 1, fontWeight: 600, color: '#999', marginBottom: 6, display: 'flex', alignItems: 'center', gap: 4 }}>
            <Icon name="note" size={13} color="#bbb" />备注
          </div>
          <textarea value={noteVal}
            onChange={e => setNoteVal(e.target.value)}
            onBlur={saveNote}
            placeholder="添加备注…"
            style={{
              width: '100%', minHeight: 70, border: '1px solid var(--border-mid)',
              borderRadius: 6, padding: '8px', fontSize: fontSize - 1,
              color: 'var(--text-sub)', outline: 'none', resize: 'vertical',
              background: 'var(--bg-input)', fontFamily: 'inherit', lineHeight: 1.6,
            }} />
        </div>

        {/* Priority */}
        <div style={{ marginBottom: 12 }}>
          <div style={{ fontSize: fontSize - 1, fontWeight: 600, color: '#999', marginBottom: 6, display: 'flex', alignItems: 'center', gap: 4 }}>
            <Icon name="flag" size={13} color="#bbb" />优先级
          </div>
          <div style={{ display: 'flex', gap: 6 }}>
            {[0, 1, 2].map(p => (
              <button key={p} onClick={() => onUpdate({ priority: p })}
                style={{
                  padding: '4px 12px', borderRadius: 6,
                  border: `1.5px solid ${task.priority === p ? (PRIORITY[p] || accent) : 'var(--border)'}`,
                  background: task.priority === p ? (p === 0 ? accentLight : (PRIORITY_BG[p] || accentLight)) : 'var(--bg-panel)',
                  color: task.priority === p ? (PRIORITY[p] || accentText) : 'var(--text-muted)',
                  cursor: 'pointer', fontSize: fontSize - 2, fontWeight: 500, transition: 'all 0.15s',
                }}>
                {PRIORITY_LABEL[p]}
              </button>
            ))}
          </div>
        </div>

        {/* Due time */}
        <div>
          <div style={{ fontSize: fontSize - 1, fontWeight: 600, color: '#999', marginBottom: 6, display: 'flex', alignItems: 'center', gap: 4 }}>
            <Icon name="calendar" size={13} color="#bbb" />时间
          </div>
          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
            <input type="date"
              value={`${task.due.getFullYear()}-${String(task.due.getMonth() + 1).padStart(2, '0')}-${String(task.due.getDate()).padStart(2, '0')}`}
              onChange={e => {
                const [y, mo, day] = e.target.value.split('-').map(Number);
                const d = new Date(task.due); d.setFullYear(y, mo - 1, day); onUpdate({ due: d });
              }}
              style={{ border: '1px solid var(--border)', borderRadius: 6, padding: '6px 10px', fontSize: fontSize - 1, color: accentText, background: 'var(--bg-hover)', outline: 'none', fontFamily: 'inherit' }} />
            <input type="time"
              value={fmt(task.due)}
              onChange={e => {
                const [h, m] = e.target.value.split(':').map(Number);
                const d = new Date(task.due); d.setHours(h, m, 0, 0); onUpdate({ due: d });
              }}
              style={{ border: '1px solid var(--border)', borderRadius: 6, padding: '6px 10px', fontSize: fontSize - 1, color: accentText, background: 'var(--bg-hover)', outline: 'none', fontFamily: 'inherit' }} />
          </div>
        </div>
      </div>

      {/* Footer */}
      <div style={{
        borderTop: '1px solid var(--border-mid)', padding: '10px 16px',
        display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexShrink: 0,
      }}>
        <span style={{ fontSize: fontSize - 2, color: 'var(--text-faint)', display: 'flex', alignItems: 'center', gap: 4 }}>
          {list && <LucideIcon name={list.icon} size={12} color="var(--text-faint)" />} {list?.name}
        </span>
        <div style={{ display: 'flex', gap: 4 }}>
          <IconBtn><Icon name="flag" size={14} color="#ccc" /></IconBtn>
          <IconBtn><Icon name="bell" size={14} color="#ccc" /></IconBtn>
          <IconBtn><Icon name="more" size={14} color="#ccc" /></IconBtn>
        </div>
      </div>
    </div>
  );
}
