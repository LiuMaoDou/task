import { useState, useRef, useEffect } from 'react';
import { Icon, LucideIcon } from '../Icon.jsx';
import { fmt, fmtDate, NOW, PRIORITY, PRIORITY_BG } from '../data.js';

// ── IconBtn ──────────────────────────────────────────────────
function IconBtn({ children, onClick }) {
  const [h, setH] = useState(false);
  return (
    <button onClick={onClick}
      onMouseEnter={() => setH(true)}
      onMouseLeave={() => setH(false)}
      style={{
        border: 'none', background: h ? 'var(--bg-hover)' : 'transparent',
        borderRadius: 6, padding: '5px', cursor: 'pointer',
        display: 'flex', alignItems: 'center',
      }}>
      {children}
    </button>
  );
}

// ── TaskRow ──────────────────────────────────────────────────
function TaskRow({ task, height, selected, accent, selectionBg, fontSize, onToggle, onToggleSub, onClick, activeNav, lists }) {
  const [hover, setHover] = useState(false);
  const [expanded, setExpanded] = useState(false);
  const list = lists.find(l => l.id === task.listId);
  const showList = activeNav === 'today' || activeNav === 'week' || activeNav === 'month';
  const overdue = task.due && task.due < NOW && !isToday(task.due) && !task.done;
  const hasSubs = task.subtasks.length > 0;
  const doneCount = task.subtasks.filter(s => s.done).length;

  return (
    <div onMouseEnter={() => setHover(true)} onMouseLeave={() => setHover(false)}
      style={{
        borderLeft: selected ? `3px solid ${accent}` : '3px solid transparent',
        background: selected ? (selectionBg || `${accent}18`) : hover ? 'var(--bg-hover)' : 'transparent',
        transition: 'background 0.1s',
        borderBottom: '1px solid var(--border)',
        marginBottom: 2,
      }}>
      {/* Main row */}
      <div onClick={() => { onClick(); if (hasSubs) setExpanded(v => !v); }}
        style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '4px 18px', height, cursor: 'pointer' }}>
        <div className={`task-checkbox${task.done ? ' checked' : ''}`}
          onClick={e => { e.stopPropagation(); onToggle(); }} />
        {hasSubs && (
          <span style={{ display: 'inline-block', transform: expanded ? 'rotate(0deg)' : 'rotate(-90deg)', transition: 'transform 0.2s', flexShrink: 0 }}>
            <Icon name="chevron" size={12} color={accent} />
          </span>
        )}
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6, overflow: 'hidden' }}>
            {task.priority > 0 && (
              <span style={{
                display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
                width: 14, height: 14, borderRadius: 3, background: PRIORITY_BG[task.priority], flexShrink: 0,
              }}>
                <Icon name="flag" size={9} color={PRIORITY[task.priority]} style={{ width: 9, height: 9 }} />
              </span>
            )}
            <span style={{
              fontSize, color: task.done ? 'var(--text-faint)' : 'var(--text-main)',
              textDecoration: task.done ? 'line-through' : 'none',
              whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis',
            }}>
              {task.title}
            </span>
          </div>
          {showList && list && (
            <div style={{ fontSize: fontSize - 3, color: 'var(--text-muted)', marginTop: 1, display: 'flex', alignItems: 'center', gap: 3 }}>
              <LucideIcon name={list.icon} size={11} color="var(--text-muted)" /> {list.name}
            </div>
          )}
        </div>
        {hasSubs && (
          <span style={{ fontSize: fontSize - 3, color: '#aaa', flexShrink: 0 }}>
            {doneCount}/{task.subtasks.length}
          </span>
        )}
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 1, flexShrink: 0 }}>
          <span style={{ fontSize: fontSize - 2, color: overdue ? '#ef4444' : accent, fontVariantNumeric: 'tabular-nums' }}>
            {task.due ? fmt(task.due) : '--:--'}
          </span>
          <span style={{ fontSize: fontSize - 4, color: overdue ? '#ef4444' : '#bbb', fontVariantNumeric: 'tabular-nums' }}>
            {task.due ? fmtDate(task.due) : '无日期'}
          </span>
        </div>
      </div>

      {/* Subtasks expanded */}
      {expanded && hasSubs && (
        <div style={{ paddingLeft: 46, paddingRight: 18, paddingBottom: 6, display: 'flex', flexDirection: 'column', gap: 2 }}>
          {task.subtasks.map(s => (
            <div key={s.id} style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '4px 0', borderBottom: '1px solid var(--border-mid)' }}>
              <div className={`sub-checkbox${s.done ? ' checked' : ''}`}
                onClick={e => { e.stopPropagation(); onToggleSub(s.id); }} />
              <span style={{ fontSize: fontSize - 1, color: s.done ? '#bbb' : '#444', textDecoration: s.done ? 'line-through' : 'none', flex: 1 }}>
                {s.text}
              </span>
              {s.due && (
                <span style={{ fontSize: fontSize - 4, color: '#aaa', flexShrink: 0, fontVariantNumeric: 'tabular-nums' }}>
                  {`${new Date(s.due).getMonth()+1}/${new Date(s.due).getDate()}`}
                </span>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// ── TaskList ─────────────────────────────────────────────────
export default function TaskList({
  groupedTasks, visibleTasks, activeNav, lists,
  scheme, tweaks, selectedTask, setSelectedTask,
  collapsed, setCollapsed, addingTask, setAddingTask,
  newTaskTitle, setNewTaskTitle, newTaskTime, setNewTaskTime,
  newTaskDate, setNewTaskDate, submitNewTask,
  toggleTask, toggleSub, searching, searchQuery, getNavLabel,
  showCalendar, setShowCalendar,
}) {
  const accent = scheme.accent;
  const accentLight = scheme.accentLight;
  const selectionBg = scheme.selectionBg || `${accent}18`;
  const rowH = tweaks.compactMode ? 36 : 44;
  const addInputRef = useRef(null);

  useEffect(() => { if (addingTask && addInputRef.current) addInputRef.current.focus(); }, [addingTask]);

  return (
    <div style={{ flex: 1, minWidth: 0, display: 'flex', flexDirection: 'column', background: 'var(--bg-panel)', borderRight: '1px solid var(--border)', fontSize: 14 }}>
      {/* Header */}
      <div style={{
        padding: '16px 20px 10px', borderBottom: '1px solid var(--border-mid)',
        display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexShrink: 0,
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <span style={{ fontSize: 18, fontWeight: 700, color: 'var(--text-main)' }}>
            {searching ? `"${searchQuery}"` : getNavLabel()}
          </span>
          <span style={{ fontSize: 12, color: 'var(--text-faint)', fontWeight: 500 }}>{visibleTasks.length}</span>
        </div>
        <IconBtn onClick={() => setShowCalendar(v => !v)}>
          <Icon name="calendar" size={15} color={showCalendar ? accent : 'var(--text-muted)'} />
        </IconBtn>
      </div>

      {/* Add task */}
      <div style={{ padding: '8px 16px', borderBottom: '1px solid var(--border-mid)', flexShrink: 0 }}>
        {addingTask ? (
          <div style={{
            display: 'flex', alignItems: 'center', gap: 8, padding: '8px 10px',
            border: `1.5px solid ${accent}`, borderRadius: 8, background: accentLight,
          }}>
            <div className="task-checkbox" style={{ borderColor: accent }} />
            <input ref={addInputRef} value={newTaskTitle}
              onChange={e => setNewTaskTitle(e.target.value)}
              onKeyDown={e => { if (e.key === 'Enter') submitNewTask(); if (e.key === 'Escape') { setAddingTask(false); setNewTaskTitle(''); } }}
              placeholder="添加任务…"
              style={{ flex: 1, border: 'none', outline: 'none', background: 'transparent', fontSize: tweaks.fontSize, color: 'var(--text-main)' }} />
            <input type="date" value={newTaskDate}
              onChange={e => setNewTaskDate(e.target.value)}
              style={{ border: 'none', outline: 'none', background: 'transparent', fontSize: tweaks.fontSize - 1, color: '#888', width: 120 }} />
            <input type="time" value={newTaskTime}
              onChange={e => setNewTaskTime(e.target.value)}
              style={{ border: 'none', outline: 'none', background: 'transparent', fontSize: tweaks.fontSize - 1, color: scheme.accentText, width: 72 }} />
            <button onClick={submitNewTask}
              style={{ background: accent, color: 'white', border: 'none', borderRadius: 6, padding: '3px 10px', cursor: 'pointer', fontSize: tweaks.fontSize - 1 }}>
              添加
            </button>
            <button onClick={() => { setAddingTask(false); setNewTaskTitle(''); }}
              style={{ background: 'transparent', color: '#999', border: 'none', cursor: 'pointer', padding: '2px 4px', fontSize: tweaks.fontSize }}>
              ✕
            </button>
          </div>
        ) : (
          <button onClick={() => setAddingTask(true)}
            style={{ display: 'flex', alignItems: 'center', gap: 6, color: '#bbb', background: 'none', border: 'none', cursor: 'pointer', padding: '4px 6px', fontSize: tweaks.fontSize, borderRadius: 6, transition: 'color 0.15s' }}
            onMouseEnter={e => e.currentTarget.style.color = accent}
            onMouseLeave={e => e.currentTarget.style.color = '#bbb'}>
            <Icon name="add" size={14} color="currentColor" />
            <span>添加任务</span>
          </button>
        )}
      </div>

      {/* Task groups */}
      <div style={{ flex: 1, overflowY: 'auto', padding: '4px 0' }}>
        {groupedTasks.map(({ label, tasks: gTasks }) => (
          <div key={label || 'all'}>
            {label && (
              <div style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '10px 18px 4px', cursor: 'pointer' }}
                onClick={() => setCollapsed(c => ({ ...c, [label]: !c[label] }))}>
                <span style={{ transform: collapsed[label] ? 'rotate(-90deg)' : 'rotate(0)', display: 'inline-block', transition: 'transform 0.2s' }}>
                  <Icon name="chevron" size={14} color="#aaa" />
                </span>
                <span style={{ fontSize: tweaks.fontSize - 1, fontWeight: 600, color: '#888' }}>{label}</span>
                <span style={{ fontSize: tweaks.fontSize - 2, color: '#ccc' }}>{gTasks.length}</span>
              </div>
            )}
            {!collapsed[label] && gTasks.map(task => (
              <TaskRow key={task.id} task={task} height={rowH} selected={selectedTask?.id === task.id}
                accent={accent} selectionBg={selectionBg} fontSize={tweaks.fontSize}
                onToggle={() => toggleTask(task.id)}
                onToggleSub={(sid) => toggleSub(task.id, sid)}
                onClick={() => setSelectedTask(task)}
                activeNav={activeNav} lists={lists}
              />
            ))}
          </div>
        ))}
        {visibleTasks.length === 0 && (
          <div style={{ textAlign: 'center', color: 'var(--text-faint)', padding: '60px 20px', fontSize: tweaks.fontSize - 1 }}>
            <div style={{ fontSize: 32, marginBottom: 8 }}>🎉</div>
            <div>暂无任务</div>
          </div>
        )}
      </div>
    </div>
  );
}

import { isToday } from '../data.js';
