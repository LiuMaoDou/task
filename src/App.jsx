import { useState, useEffect } from 'react';
import Sidebar from './components/Sidebar.jsx';
import TaskList from './components/TaskList.jsx';
import DetailPanel from './components/DetailPanel.jsx';
import TweaksPanel from './components/TweaksPanel.jsx';
import CalendarPanel from './components/CalendarPanel.jsx';
import { api, fetchBootstrap } from './api.js';
import {
  COLOR_SCHEMES, NOW, uid,
  isToday, isThisWeek, isThisMonth, isThisYear, fmtDateLabel,
} from './data.js';

const TWEAK_DEFAULTS = {
  colorScheme: 'default',
  fontSize: 16,
  compactMode: false,
  showCompleted: true,
  sidebarWidth: 220,
  dark: false,
};

export default function App() {
  const [tweaks, setTweaks] = useState(TWEAK_DEFAULTS);
  const [groups, setGroups] = useState([]);
  const [lists, setLists] = useState([]);
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [savingError, setSavingError] = useState('');

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

  useEffect(() => {
    let alive = true;
    fetchBootstrap()
      .then(data => {
        if (!alive) return;
        setTweaks({ ...TWEAK_DEFAULTS, ...data.settings });
        setGroups(data.groups);
        setLists(data.lists);
        setTasks(data.tasks);
        setLoading(false);
      })
      .catch(err => {
        if (!alive) return;
        setError(err.message || '加载数据失败');
        setLoading(false);
      });
    return () => { alive = false; };
  }, []);

  const scheme = COLOR_SCHEMES[tweaks.colorScheme] || COLOR_SCHEMES.default;
  const palette = tweaks.dark ? scheme.dark : scheme.light;

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

  useEffect(() => {
    if (!selectedTask) return;
    const next = tasks.find(t => t.id === selectedTask.id);
    setSelectedTask(next || null);
  }, [tasks, selectedTask?.id]);

  const fail = (message = '保存失败，已恢复') => {
    setSavingError(message);
    window.setTimeout(() => setSavingError(''), 2600);
  };

  const runOptimistic = async (apply, request, rollback) => {
    apply();
    try {
      await request();
    } catch (err) {
      rollback();
      fail(err.message || '保存失败，已恢复');
    }
  };

  const setTweak = (key, value) => {
    const prev = tweaks;
    const next = { ...tweaks, [key]: value };
    runOptimistic(
      () => setTweaks(next),
      () => api.updateSettings({ [key]: value }),
      () => setTweaks(prev)
    );
  };

  const addGroup = (group) => {
    const prev = groups;
    runOptimistic(
      () => setGroups(gs => [...gs, group]),
      () => api.createGroup(group),
      () => setGroups(prev)
    );
  };

  const renameGroup = (id, name) => {
    const prev = groups;
    runOptimistic(
      () => setGroups(gs => gs.map(g => g.id === id ? { ...g, name } : g)),
      () => api.updateGroup(id, { name }),
      () => setGroups(prev)
    );
  };

  const deleteGroup = (id) => {
    const prevGroups = groups;
    const prevLists = lists;
    runOptimistic(
      () => {
        setLists(ls => ls.map(l => l.groupId === id ? { ...l, groupId: null } : l));
        setGroups(gs => gs.filter(g => g.id !== id));
      },
      () => api.deleteGroup(id),
      () => { setGroups(prevGroups); setLists(prevLists); }
    );
  };

  const addList = (list) => {
    const prev = lists;
    runOptimistic(
      () => setLists(ls => [...ls, list]),
      () => api.createList(list),
      () => setLists(prev)
    );
    setActiveNav(list.id);
  };

  const updateList = (id, patch) => {
    const prev = lists;
    runOptimistic(
      () => setLists(ls => ls.map(l => l.id === id ? { ...l, ...patch } : l)),
      () => api.updateList(id, patch),
      () => setLists(prev)
    );
  };

  const deleteList = (id) => {
    const prevLists = lists;
    const prevTasks = tasks;
    const prevActive = activeNav;
    runOptimistic(
      () => {
        setLists(ls => ls.filter(l => l.id !== id));
        setTasks(ts => ts.map(t => t.listId === id ? { ...t, listId: 'inbox' } : t));
        if (activeNav === id) setActiveNav('today');
      },
      () => api.deleteList(id),
      () => { setLists(prevLists); setTasks(prevTasks); setActiveNav(prevActive); }
    );
  };

  const updateTaskLocal = (id, patch) => {
    setTasks(ts => ts.map(t => t.id === id ? { ...t, ...patch } : t));
  };

  const toggleTask = (id) => {
    const task = tasks.find(t => t.id === id);
    if (!task) return;
    const patch = { done: !task.done };
    const prev = tasks;
    runOptimistic(
      () => updateTaskLocal(id, patch),
      () => api.updateTask(id, patch),
      () => setTasks(prev)
    );
  };

  const updateTask = (id, patch) => {
    const prev = tasks;
    runOptimistic(
      () => updateTaskLocal(id, patch),
      () => api.updateTask(id, patch),
      () => setTasks(prev)
    );
  };

  const deleteTask = (id) => {
    const prev = tasks;
    runOptimistic(
      () => setTasks(ts => ts.filter(t => t.id !== id)),
      () => api.deleteTask(id),
      () => setTasks(prev)
    );
    if (selectedTask?.id === id) setSelectedTask(null);
  };

  const updateSubtask = (tid, sid, patch) => {
    const prev = tasks;
    runOptimistic(
      () => setTasks(ts => ts.map(t =>
        t.id !== tid ? t : { ...t, subtasks: t.subtasks.map(s => s.id === sid ? { ...s, ...patch } : s) }
      )),
      () => api.updateSubtask(sid, patch),
      () => setTasks(prev)
    );
  };

  const toggleSub = (tid, sid) => {
    const task = tasks.find(t => t.id === tid);
    const subtask = task?.subtasks.find(s => s.id === sid);
    if (!subtask) return;
    updateSubtask(tid, sid, { done: !subtask.done });
  };

  const addSubtask = (tid, text) => {
    if (!text.trim()) return;
    const subtask = { id: uid(), text: text.trim(), done: false, due: null, note: '' };
    const prev = tasks;
    runOptimistic(
      () => setTasks(ts => ts.map(t => t.id === tid ? { ...t, subtasks: [...t.subtasks, subtask] } : t)),
      () => api.createSubtask(tid, subtask),
      () => setTasks(prev)
    );
  };

  const submitNewTask = () => {
    if (!newTaskTitle.trim()) { setAddingTask(false); return; }
    const smartViews = ['today', 'week', 'month', 'year'];
    const listId = smartViews.includes(activeNav) ? (lists[0]?.id ?? 'inbox') : activeNav;
    const [h, m] = newTaskTime ? newTaskTime.split(':').map(Number) : [12, 0];
    const due = newTaskDate ? new Date(newTaskDate) : new Date(NOW);
    due.setHours(h || 12, m || 0, 0, 0);
    const task = { id: uid(), listId, title: newTaskTitle.trim(), note: '', due, priority: 0, done: false, subtasks: [] };
    const prev = tasks;
    setNewTaskTitle('');
    setNewTaskTime('');
    setAddingTask(false);
    runOptimistic(
      () => setTasks(ts => [...ts, task]),
      () => api.createTask(task),
      () => setTasks(prev)
    );
  };

  const getVisibleTasks = () => {
    let base = tasks.filter(t => tweaks.showCompleted ? true : !t.done);
    if (searching && searchQuery) {
      return base.filter(t => t.title.includes(searchQuery) || (t.note || '').includes(searchQuery));
    }
    if (activeNav === 'today') return base.filter(t => t.due && isToday(t.due));
    if (activeNav === 'week')  return base.filter(t => t.due && isThisWeek(t.due));
    if (activeNav === 'month') return base.filter(t => t.due && isThisMonth(t.due));
    if (activeNav === 'year')  return base.filter(t => t.due && isThisYear(t.due));
    if (activeNav === 'inbox') return base.filter(t => t.listId === 'inbox');
    return base.filter(t => t.listId === activeNav);
  };

  const groupTasks = (taskList) => {
    if (activeNav === 'today' || activeNav === 'week' || activeNav === 'month' || activeNav === 'year' || searching) {
      const groupsByLabel = {};
      taskList.forEach(t => {
        const label = t.due ? fmtDateLabel(t.due) : '无日期';
        if (!groupsByLabel[label]) groupsByLabel[label] = [];
        groupsByLabel[label].push(t);
      });
      const order = ['今天', '明天', '后天', '已过期'];
      const sorted = Object.keys(groupsByLabel).sort((a, b) => {
        const ai = order.indexOf(a), bi = order.indexOf(b);
        if (ai >= 0 && bi >= 0) return ai - bi;
        if (ai >= 0) return -1;
        if (bi >= 0) return 1;
        return a.localeCompare(b);
      });
      return sorted.map(label => ({ label, tasks: groupsByLabel[label] }));
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
    if (activeNav === 'inbox') return '收件箱';
    const list = lists.find(l => l.id === activeNav);
    return list ? list.name : '';
  };

  if (loading) {
    return <StatusPage text="正在加载任务…" />;
  }

  if (error) {
    return <StatusPage text={error} />;
  }

  return (
    <div style={{ display: 'flex', height: '100vh', width: '100vw', fontSize: tweaks.fontSize, background: 'var(--bg-app)' }}>
      {savingError && <Toast message={savingError} />}
      <Sidebar
        sidebarWidth={tweaks.sidebarWidth}
        activeNav={activeNav} scheme={scheme} tweaks={tweaks} setTweak={setTweak}
        groups={groups} lists={lists} tasks={tasks}
        searching={searching} searchQuery={searchQuery}
        setSearchQuery={setSearchQuery} setSearching={setSearching}
        setActiveNav={setActiveNav} setSelectedTask={setSelectedTask}
        addGroup={addGroup} renameGroup={renameGroup} deleteGroup={deleteGroup}
        addList={addList} updateList={updateList} deleteList={deleteList}
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

function StatusPage({ text }) {
  return (
    <div style={{
      height: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center',
      background: 'var(--bg-app)', color: 'var(--text-muted)', fontSize: 14,
    }}>
      {text}
    </div>
  );
}

function Toast({ message }) {
  return (
    <div style={{
      position: 'fixed', top: 16, left: '50%', transform: 'translateX(-50%)',
      zIndex: 2000, background: '#ef4444', color: 'white',
      padding: '7px 12px', borderRadius: 8, fontSize: 13,
      boxShadow: '0 8px 24px rgba(0,0,0,0.18)',
    }}>
      {message}
    </div>
  );
}
