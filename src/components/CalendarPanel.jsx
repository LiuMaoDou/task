import { useState, useMemo } from 'react';
import { fmt, NOW, isToday } from '../data.js';

const WEEKDAYS = ['日', '一', '二', '三', '四', '五', '六'];

function toDateKey(d) {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
}

function makeHolidayRange(start, end, name) {
  const days = [];
  const cursor = new Date(`${start}T00:00:00`);
  const last = new Date(`${end}T00:00:00`);
  while (cursor <= last) {
    days.push({ date: toDateKey(cursor), name, type: 'holiday' });
    cursor.setDate(cursor.getDate() + 1);
  }
  return days;
}

function makeMonthlySaturdayWorkdays(year) {
  return Array.from({ length: 12 }, (_, month) => {
    const cursor = new Date(year, month + 1, 0);
    while (cursor.getDay() !== 6) cursor.setDate(cursor.getDate() - 1);
    if (month === 8) cursor.setDate(cursor.getDate() - 7);
    return { date: toDateKey(cursor), name: '月末周六', type: 'workday' };
  });
}

const HOLIDAY_ENTRIES = [
  ...makeHolidayRange('2026-01-01', '2026-01-03', '元旦'),
  { date: '2026-01-04', name: '元旦调休', type: 'workday' },
  ...makeHolidayRange('2026-02-15', '2026-02-23', '春节'),
  { date: '2026-02-14', name: '春节调休', type: 'workday' },
  { date: '2026-02-28', name: '春节调休', type: 'workday' },
  ...makeHolidayRange('2026-04-04', '2026-04-06', '清明节'),
  ...makeHolidayRange('2026-05-01', '2026-05-05', '劳动节'),
  { date: '2026-05-09', name: '劳动节调休', type: 'workday' },
  ...makeHolidayRange('2026-06-19', '2026-06-21', '端午节'),
  ...makeHolidayRange('2026-09-25', '2026-09-27', '中秋节'),
  ...makeHolidayRange('2026-10-01', '2026-10-07', '国庆节'),
  { date: '2026-09-20', name: '国庆节调休', type: 'workday' },
  { date: '2026-10-10', name: '国庆节调休', type: 'workday' },
  ...makeMonthlySaturdayWorkdays(2026),
];

const HOLIDAYS_BY_DATE = Object.fromEntries(HOLIDAY_ENTRIES.map(item => [item.date, item]));

const HOLIDAY_STYLE = {
  holiday: {
    text: '#dc2626',
    bg: '#fff1f0',
    hoverBg: '#ffe4e1',
    activeBg: '#fee2e2',
    border: '#fecaca',
    badge: '#ef4444',
  },
  workday: {
    text: '#b45309',
    bg: '#fff7ed',
    hoverBg: '#ffedd5',
    activeBg: '#fed7aa',
    border: '#fdba74',
    badge: '#f59e0b',
  },
};

function isSameDay(a, b) {
  return b && a.getDate() === b.getDate() && a.getMonth() === b.getMonth() && a.getFullYear() === b.getFullYear();
}

function buildCalendarCells(calMonth) {
  const y = calMonth.getFullYear(), m = calMonth.getMonth();
  const daysInMonth = new Date(y, m + 1, 0).getDate();
  const firstWeekday = new Date(y, m, 1).getDay();
  const totalCells = (firstWeekday + daysInMonth) <= 35 ? 35 : 42;
  const cells = [];
  for (let i = 0; i < firstWeekday; i++) {
    const day = new Date(y, m, 0).getDate() - (firstWeekday - 1 - i);
    cells.push({ date: new Date(y, m - 1, day), inMonth: false });
  }
  for (let d = 1; d <= daysInMonth; d++)
    cells.push({ date: new Date(y, m, d), inMonth: true });
  for (let d = 1; cells.length < totalCells; d++)
    cells.push({ date: new Date(y, m + 1, d), inMonth: false });
  return cells;
}

function DayCell({ cell, selectedDate, tasksByDay, accent, onSelect }) {
  const [hover, setHover] = useState(false);
  const today = isToday(cell.date);
  const selected = isSameDay(cell.date, selectedDate);
  const key = toDateKey(cell.date);
  const info = tasksByDay[key];
  const holidayInfo = HOLIDAYS_BY_DATE[key];
  const holidayStyle = holidayInfo ? HOLIDAY_STYLE[holidayInfo.type] : null;
  const dotColor = info?.hasOverdue ? '#ef4444' : info?.hasTask ? accent : null;

  let numBg = 'transparent', numColor = 'var(--text-main)', numBorder = 'none';
  if (holidayStyle) {
    numBg = holidayStyle.bg;
    numColor = holidayStyle.text;
    numBorder = `1px solid ${holidayStyle.border}`;
  }
  if (today) {
    numBg = holidayStyle ? holidayStyle.text : accent; numColor = 'white';
  } else if (selected) {
    const selectedColor = holidayStyle ? holidayStyle.text : accent;
    numBg = holidayStyle ? holidayStyle.activeBg : accent + '22';
    numColor = selectedColor; numBorder = `1.5px solid ${selectedColor}`;
  } else if (!cell.inMonth) {
    numColor = 'var(--text-faint)';
  } else if (hover) {
    numBg = holidayStyle ? holidayStyle.hoverBg : 'var(--bg-hover)';
  }

  return (
    <div
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
      onClick={() => onSelect(cell.date)}
      title={holidayInfo ? `${holidayInfo.name}${holidayInfo.type === 'workday' ? '上班' : '放假'}` : undefined}
      style={{
        display: 'flex', flexDirection: 'column', alignItems: 'center',
        position: 'relative', padding: '3px 0', cursor: 'pointer',
        opacity: cell.inMonth ? 1 : 0.42,
      }}>
      <div style={{
        width: 24, height: 24, borderRadius: '50%',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        fontSize: 12, fontWeight: today || selected || holidayInfo ? 600 : 400,
        background: numBg, color: numColor,
        border: numBorder, boxSizing: 'border-box',
        transition: 'background 0.1s, color 0.1s',
      }}>
        {cell.date.getDate()}
      </div>
      {holidayInfo && (
        <span style={{
          position: 'absolute', top: 0, right: 'calc(50% - 20px)',
          minWidth: 12, height: 12, padding: '0 2px', borderRadius: 6,
          background: holidayStyle.badge, color: 'white',
          fontSize: 8, lineHeight: '12px', fontWeight: 700,
          textAlign: 'center', boxShadow: '0 0 0 1px var(--bg-panel)',
        }}>
          {holidayInfo.type === 'workday' ? '班' : '休'}
        </span>
      )}
      <div style={{
        width: 5, height: 5, borderRadius: '50%', marginTop: 2,
        background: dotColor || 'transparent',
        visibility: dotColor ? 'visible' : 'hidden',
      }} />
    </div>
  );
}

function CalTaskRow({ task, accent, fontSize, onClick }) {
  const [hover, setHover] = useState(false);
  const due = new Date(task.due);
  const overdue = due < NOW && !isToday(due) && !task.done;
  return (
    <div onClick={onClick}
      onMouseEnter={() => setHover(true)} onMouseLeave={() => setHover(false)}
      style={{
        display: 'flex', alignItems: 'center', gap: 7,
        padding: '6px 4px', borderRadius: 6, cursor: 'pointer',
        background: hover ? 'var(--bg-hover)' : 'transparent',
        borderBottom: '1px solid var(--border-mid)',
      }}>
      <div className={`task-checkbox${task.done ? ' checked' : ''}`}
        style={{ pointerEvents: 'none', flexShrink: 0, width: 14, height: 14 }} />
      <span style={{
        flex: 1, fontSize: fontSize - 1,
        color: task.done ? 'var(--text-faint)' : 'var(--text-main)',
        textDecoration: task.done ? 'line-through' : 'none',
        whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis',
      }}>{task.title}</span>
      <span style={{
        fontSize: fontSize - 2, color: overdue ? '#ef4444' : accent,
        fontVariantNumeric: 'tabular-nums', flexShrink: 0,
      }}>{fmt(due)}</span>
    </div>
  );
}

export default function CalendarPanel({ tasks, scheme, tweaks, setSelectedTask }) {
  const accent = scheme.accent;
  const fontSize = tweaks.fontSize;

  const [calMonth, setCalMonth] = useState(() => new Date(NOW.getFullYear(), NOW.getMonth(), 1));
  const [selectedDate, setSelectedDate] = useState(new Date(NOW));

  const prevMonth = () => {
    setCalMonth(d => new Date(d.getFullYear(), d.getMonth() - 1, 1));
    setSelectedDate(null);
  };
  const nextMonth = () => {
    setCalMonth(d => new Date(d.getFullYear(), d.getMonth() + 1, 1));
    setSelectedDate(null);
  };

  const handleSelect = (date) => {
    if (!isSameDay(date, new Date(calMonth.getFullYear(), calMonth.getMonth(), date.getDate()))
      || date.getMonth() !== calMonth.getMonth()) {
      setCalMonth(new Date(date.getFullYear(), date.getMonth(), 1));
    }
    setSelectedDate(date);
  };

  const cells = useMemo(() => buildCalendarCells(calMonth), [calMonth]);

  const tasksByDay = useMemo(() => {
    const map = {};
    const nDay = new Date(NOW.getFullYear(), NOW.getMonth(), NOW.getDate());
    tasks.forEach(t => {
      if (!t.due) return;
      const d = new Date(t.due);
      const key = toDateKey(d);
      if (!map[key]) map[key] = { hasTask: false, hasOverdue: false };
      if (!t.done) {
        map[key].hasTask = true;
        const dDay = new Date(d.getFullYear(), d.getMonth(), d.getDate());
        if (dDay < nDay) map[key].hasOverdue = true;
      }
    });
    return map;
  }, [tasks]);

  const selectedDateTasks = useMemo(() => {
    if (!selectedDate) return [];
    return tasks
      .filter(t => {
        if (!t.due) return false;
        const d = new Date(t.due);
        return d.getDate() === selectedDate.getDate()
          && d.getMonth() === selectedDate.getMonth()
          && d.getFullYear() === selectedDate.getFullYear();
      })
      .sort((a, b) => new Date(a.due) - new Date(b.due));
  }, [tasks, selectedDate]);

  const selectedHoliday = selectedDate ? HOLIDAYS_BY_DATE[toDateKey(selectedDate)] : null;

  const navBtn = (onClick, label) => (
    <button onClick={onClick} style={{
      background: 'none', border: 'none', cursor: 'pointer',
      color: 'var(--text-muted)', padding: '4px 8px', borderRadius: 5,
      fontSize: 15, display: 'flex', alignItems: 'center',
    }}
      onMouseEnter={e => { e.currentTarget.style.background = 'var(--bg-hover)'; e.currentTarget.style.color = accent; }}
      onMouseLeave={e => { e.currentTarget.style.background = 'none'; e.currentTarget.style.color = 'var(--text-muted)'; }}>
      {label}
    </button>
  );

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%', minWidth: 0 }}>
      {/* Header */}
      <div style={{
        padding: '12px 8px 6px', display: 'flex', alignItems: 'center',
        justifyContent: 'space-between', flexShrink: 0,
        borderBottom: '1px solid var(--border-mid)',
      }}>
        {navBtn(prevMonth, '‹')}
        <span style={{ fontWeight: 700, fontSize: 14, color: 'var(--text-main)' }}>
          {calMonth.getFullYear()}年{calMonth.getMonth() + 1}月
        </span>
        {navBtn(nextMonth, '›')}
      </div>

      {/* Weekday labels */}
      <div style={{
        display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)',
        padding: '6px 6px 2px', flexShrink: 0,
      }}>
        {WEEKDAYS.map((d, i) => (
          <div key={d} style={{
            textAlign: 'center', fontSize: 11,
            color: i === 0 || i === 6 ? HOLIDAY_STYLE.holiday.text : 'var(--text-faint)',
            fontWeight: 600,
          }}>{d}</div>
        ))}
      </div>

      {/* Day grid */}
      <div style={{
        display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)',
        padding: '0 6px 8px', flexShrink: 0,
      }}>
        {cells.map((cell, i) => (
          <DayCell key={i} cell={cell} selectedDate={selectedDate}
            tasksByDay={tasksByDay} accent={accent} onSelect={handleSelect} />
        ))}
      </div>

      <div style={{
        display: 'flex', alignItems: 'center', gap: 10,
        padding: '0 12px 8px', color: 'var(--text-muted)',
        fontSize: 10, fontWeight: 600, flexShrink: 0,
      }}>
        <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4 }}>
          <i style={{ width: 8, height: 8, borderRadius: '50%', background: HOLIDAY_STYLE.holiday.badge }} />休 放假
        </span>
        <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4 }}>
          <i style={{ width: 8, height: 8, borderRadius: '50%', background: HOLIDAY_STYLE.workday.badge }} />班 调休上班
        </span>
      </div>

      {/* Divider + selected date label */}
      <div style={{ borderTop: '1px solid var(--border)', flexShrink: 0, padding: '8px 12px 4px' }}>
        <span style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-muted)' }}>
          {selectedDate
            ? `${selectedDate.getMonth() + 1}月${selectedDate.getDate()}日 · ${selectedDateTasks.length} 个任务`
            : '点击日期查看任务'}
        </span>
      </div>

      {selectedHoliday && (
        <div style={{
          padding: '0 12px 4px', fontSize: 11, fontWeight: 700,
          color: HOLIDAY_STYLE[selectedHoliday.type].text, flexShrink: 0,
        }}>
          {selectedHoliday.name}{selectedHoliday.type === 'workday' ? '上班' : '放假'}
        </div>
      )}

      {/* Task list */}
      <div style={{ flex: 1, overflowY: 'auto', padding: '4px 8px 8px' }}>
        {selectedDate ? (
          selectedDateTasks.length > 0
            ? selectedDateTasks.map(t => (
              <CalTaskRow key={t.id} task={t} accent={accent} fontSize={fontSize}
                onClick={() => setSelectedTask(t)} />
            ))
            : <div style={{ textAlign: 'center', padding: '24px 0', color: 'var(--text-faint)', fontSize: 13 }}>这天没有任务</div>
        ) : (
          <div style={{ textAlign: 'center', padding: '24px 0', color: 'var(--text-faint)', fontSize: 13 }}>点击日期查看任务</div>
        )}
      </div>
    </div>
  );
}
