import { useState, useEffect, useReducer } from 'react';
import Sidebar from './components/Sidebar.jsx';
import TaskList from './components/TaskList.jsx';
import DetailPanel from './components/DetailPanel.jsx';
import TweaksPanel from './components/TweaksPanel.jsx';
import CalendarPanel from './components/CalendarPanel.jsx';
import {
  COLOR_SCHEMES, INITIAL_GROUPS, INITIAL_LISTS, INITIAL_TASKS, NOW,
  uid, isToday, isThisWeek, isThisMonth, isThisYear, fmtDateLabel,
} from './data.js';

const TWEAK_DEFAULTS = {
  colorScheme: 'default',
  fontSize: 16,
  compactMode: false,
  showCompleted: true,
  sidebarWidth: 220,
  dark: false,
};

function tweakReducer(state, { key, value }) {
  const next = { ...state, [key]: value };
  localStorage.setItem('tweaks', JSON.stringify(next));
  return next;
}

function loadTweaks() {
  try {
    const saved = JSON.parse(localStorage.getItem('tweaks') || '{}');
    return { ...TWEAK_DEFAULTS, ...saved };
  } catch {
    return TWEAK_DEFAULTS;
  }
}

export default function App() {
  const [tweaks, dispatch] = useReducer(tweakReducer, null, loadTweaks);
  const setTweak = (key, value) => dispatch({ key, value });

  const scheme = COLOR_SCHEMES[tweaks.colorScheme] || COLOR_SCHEMES.default;
  const palette = tweaks.dark ? scheme.dark : scheme.light;

  // Apply CSS variables whenever theme/palette changes
  useEffect(() => {
    const root = document.documentElement;
    root.style.setProperty('--accent',       scheme.accent);
    root.style.setProperty('--accent-light', scheme.accentLight);
    root.style.setProperty('--accent-text',  scheme.accentText);
    root.style.setProperty('--font-size',    tweaks.fontSize + 'px');
    root.style.setProperty('--bg-app',       palette.bg_app);
    root.style.setProperty('--bg-sidebar',   palette.bg_sidebar);
    root.style.setProperty('--bg-panel',     palette.bg_panel);
    root.style.setProperty('--bg-hover',     palette.bg_hover);
    root.style.setProperty('--bg-active',    palette.bg_active);
    root.style.setProperty('--bg-input',     palette.bg_input);
    root.style.setProperty('--border',       palette.border);
    root.style.setProperty('--border-mid',   palette.border_mid);
    root.style.setProperty('--text-main',    palette.text_main);
    root.style.setProperty('--text-sub',     palette.text_sub);
    root.style.setProperty('--text-muted',   palette.text_muted);
    root.style.setProperty('--text-faint',   palette.text_faint);
    root.style.setProperty('--text-nav',     palette.text_nav);
    root.style.setProperty('--scrollbar',    palette.scrollbar);
    root.setAttribute('data-dark', tweaks.dark ? '1' : '0');
  }, [tweaks.colorScheme, tweaks.fontSize, tweaks.dark, scheme, palette]);

  const [groups, setGroups] = useState(INITIAL_GROUPS);
  const [lists, setLists] = useState(INITIAL_LISTS);
  const [tasks, setTasks] = useState(INITIAL_TASKS);
  const [activeNav, setActiveNav] = useState('today');
  const [selectedTask, setSelectedTask] = useState(null);
  const [showCalendar, setShowCalendar] = useState(false);
  const [collapsed, setCollapsed] = useState({});
  const [addingTask, setAddingTask] = useState(false);
  const [newTaskTitle, setNewTaskTitle] = useState('');
  const [newTaskTime, setNewTaskTime] = useState('');
  const [newTaskDate, setNewTaskDate] = useState(
    `${NOW.getFullYear()}-${String(NOW.getMonth() + 1).padStart(2, '0')}-${String(NOW.getDate()).padStart(2, '0')}`
  );
  const [searchQuery, setSearchQuery] = useState('');
  const [searching, setSearching] = useState(false);

  // Keep selectedTask in sync with tasks state
  useEffect(() => {
    if (selectedTask) {
      const t = tasks.find(t => t.id === selectedTask.id);
      if (t) setSelectedTask(t);
    }
  }, [tasks]);

  // ── Derived ──────────────────────────────────────────────
  const getVisibleTasks = () => {
    let base = tasks.filter(t => tweaks.showCompleted ? true : !t.done);
    if (searching && searchQuery) {
      return base.filter(t => t.title.includes(searchQuery) || t.note.includes(searchQuery));
    }
    if (activeNav === 'today') return base.filter(t => isToday(t.due));
    if (activeNav === 'week')  return base.filter(t => isThisWeek(t.due));
    if (activeNav === 'month') return base.filter(t => isThisMonth(t.due));
    if (activeNav === 'year')  return base.filter(t => isThisYear(t.due));
    if (activeNav === 'inbox') return base.filter(t => t.listId === 'inbox');
    return base.filter(t => t.listId === activeNav);
  };

  const groupTasks = (taskList) => {
    if (activeNav === 'today' || activeNav === 'week' || activeNav === 'month' || activeNav === 'year' || searching) {
      const groups = {};
      taskList.forEach(t => {
        const label = fmtDateLabel(t.due);
        if (!groups[label]) groups[label] = [];
        groups[label].push(t);
      });
      const order = ['今天', '明天', '后天', '已过期'];
      const sorted = Object.keys(groups).sort((a, b) => {
        const ai = order.indexOf(a), bi = order.indexOf(b);
        if (ai >= 0 && bi >= 0) return ai - bi;
        if (ai >= 0) return -1;
        if (bi >= 0) return 1;
        return a.localeCompare(b);
      });
      return sorted.map(label => ({ label, tasks: groups[label] }));
    }
    return [{ label: null, tasks: taskList }];
  };

  const visibleTasks = getVisibleTasks();
  const groupedTasks = groupTasks(visibleTasks);

  const getNavLabel = () => {
    if (activeNav === 'today') return '今天';
    if (activeNav === 'week')  return '最近7天';
    if (activeNav === 'month') return '最近30天';
    if (activeNav === 'year')  return '最近1年';
    if (activeNav === 'inbox') return '收集箱';
    const l = lists.find(l => l.id === activeNav);
    return l ? l.name : '';
  };

  // ── Task actions ─────────────────────────────────────────
  const toggleTask = (id) => setTasks(ts => ts.map(t => t.id === id ? { ...t, done: !t.done } : t));

  const toggleSub = (tid, sid) => setTasks(ts => ts.map(t =>
    t.id === tid ? { ...t, subtasks: t.subtasks.map(s => s.id === sid ? { ...s, done: !s.done } : s) } : t
  ));

  const updateTask = (id, patch) => {
    setTasks(ts => ts.map(t => t.id === id ? { ...t, ...patch } : t));
    if (selectedTask?.id === id) setSelectedTask(prev => ({ ...prev, ...patch }));
  };

  const deleteTask = (id) => {
    setTasks(ts => ts.filter(t => t.id !== id));
    if (selectedTask?.id === id) setSelectedTask(null);
  };

  const updateSubtask = (tid, sid, patch) => {
    setTasks(ts => ts.map(t =>
      t.id !== tid ? t : { ...t, subtasks: t.subtasks.map(s => s.id === sid ? { ...s, ...patch } : s) }
    ));
    if (selectedTask?.id === tid) {
      setSelectedTask(prev => ({
        ...prev,
        subtasks: prev.subtasks.map(s => s.id === sid ? { ...s, ...patch } : s),
      }));
    }
  };

  const addSubtask = (tid, text) => {
    if (!text.trim()) return;
    const sub = { id: uid(), text, done: false };
    setTasks(ts => ts.map(t => t.id === tid ? { ...t, subtasks: [...t.subtasks, sub] } : t));
    if (selectedTask?.id === tid) setSelectedTask(prev => ({ ...prev, subtasks: [...prev.subtasks, sub] }));
  };

  const submitNewTask = () => {
    if (!newTaskTitle.trim()) { setAddingTask(false); return; }
    const smartViews = ['today', 'week', 'month', 'year'];
    const listId = smartViews.includes(activeNav) ? (lists[0]?.id ?? 'inbox') : activeNav;
    const [h, m] = newTaskTime ? newTaskTime.split(':').map(Number) : [12, 0];
    const due = newTaskDate ? new Date(newTaskDate) : new Date(NOW);
    due.setHours(h || 12, m || 0, 0, 0);
    const task = { id: uid(), listId, title: newTaskTitle.trim(), note: '', due, priority: 0, done: false, subtasks: [] };
    setTasks(ts => [...ts, task]);
    setNewTaskTitle('');
    setNewTaskTime('');
    setAddingTask(false);
  };

  return (
    <div style={{ display: 'flex', height: '100vh', width: '100vw', fontSize: tweaks.fontSize, background: 'var(--bg-app)' }}>
      <Sidebar
        sidebarWidth={tweaks.sidebarWidth}
        activeNav={activeNav} scheme={scheme} tweaks={tweaks} setTweak={setTweak}
        groups={groups} setGroups={setGroups}
        lists={lists} setLists={setLists}
        tasks={tasks} setTasks={setTasks}
        searching={searching} searchQuery={searchQuery}
        setSearchQuery={setSearchQuery} setSearching={setSearching}
        setActiveNav={setActiveNav} setSelectedTask={setSelectedTask}
      />

      <TaskList
        groupedTasks={groupedTasks} visibleTasks={visibleTasks}
        activeNav={activeNav} lists={lists}
        scheme={scheme} tweaks={tweaks}
        selectedTask={selectedTask} setSelectedTask={setSelectedTask}
        collapsed={collapsed} setCollapsed={setCollapsed}
        addingTask={addingTask} setAddingTask={setAddingTask}
        newTaskTitle={newTaskTitle} setNewTaskTitle={setNewTaskTitle}
        newTaskTime={newTaskTime} setNewTaskTime={setNewTaskTime}
        newTaskDate={newTaskDate} setNewTaskDate={setNewTaskDate}
        submitNewTask={submitNewTask}
        toggleTask={toggleTask} toggleSub={toggleSub}
        searching={searching} searchQuery={searchQuery}
        getNavLabel={getNavLabel}
        showCalendar={showCalendar} setShowCalendar={setShowCalendar}
      />

      {/* Right detail panel */}
      <div style={{
        width: selectedTask ? 320 : 0, overflow: 'hidden',
        transition: 'width 0.25s ease', background: 'var(--bg-panel)',
        display: 'flex', flexDirection: 'column', flexShrink: 0,
        borderLeft: '1px solid var(--border)',
      }}>
        {selectedTask && (
          <DetailPanel
            key={selectedTask.id}
            task={selectedTask} lists={lists}
            scheme={scheme} fontSize={tweaks.fontSize}
            onClose={() => setSelectedTask(null)}
            onUpdate={(patch) => updateTask(selectedTask.id, patch)}
            onDelete={() => deleteTask(selectedTask.id)}
            onToggleSub={(sid) => toggleSub(selectedTask.id, sid)}
            onAddSub={(text) => addSubtask(selectedTask.id, text)}
            onUpdateSub={(sid, patch) => updateSubtask(selectedTask.id, sid, patch)}
            onToggleMain={() => toggleTask(selectedTask.id)}
          />
        )}
      </div>

      {/* Calendar panel — rightmost column */}
      <div style={{
        width: showCalendar ? 260 : 0, overflow: 'hidden',
        transition: 'width 0.25s ease', background: 'var(--bg-panel)',
        display: 'flex', flexDirection: 'column', flexShrink: 0,
        borderLeft: '1px solid var(--border)',
      }}>
        {showCalendar && (
          <CalendarPanel tasks={tasks} scheme={scheme} tweaks={tweaks} setSelectedTask={setSelectedTask} />
        )}
      </div>

      <TweaksPanel tweaks={tweaks} setTweak={setTweak} />
    </div>
  );
}
