import { useState, useRef, useEffect } from 'react';
import { Icon, LucideIcon } from '../Icon.jsx';
import { LUCIDE_ICON_LIST, uid } from '../data.js';

// ── Tiny helpers ─────────────────────────────────────────────
function NavItem({ icon, label, count, active, accent, selectionBg, onClick }) {
  const [hover, setHover] = useState(false);
  return (
    <div onClick={onClick}
      onMouseEnter={() => setHover(true)} onMouseLeave={() => setHover(false)}
      style={{
        display: 'flex', alignItems: 'center', gap: 8, padding: '6px 8px',
        borderRadius: 6, cursor: 'pointer',
        background: active ? (selectionBg || `${accent}18`) : hover ? 'var(--bg-hover)' : 'transparent',
        transition: 'background 0.1s',
      }}>
      <Icon name={icon} size={15} color={active ? accent : 'var(--text-muted)'} />
      <span style={{ flex: 1, fontWeight: active ? 600 : 400, color: active ? accent : 'var(--text-nav)' }}>
        {label}
      </span>
      {count > 0 && <span style={{ fontSize: 11, color: 'var(--text-faint)', fontWeight: 500 }}>{count}</span>}
    </div>
  );
}

function CtxMenuItem({ icon, label, danger, onClick }) {
  const [h, setH] = useState(false);
  return (
    <button onClick={onClick}
      onMouseEnter={() => setH(true)} onMouseLeave={() => setH(false)}
      style={{
        display: 'flex', alignItems: 'center', gap: 7, width: '100%',
        padding: '6px 12px', background: h ? 'var(--bg-hover)' : 'transparent',
        border: 'none', cursor: 'pointer', fontSize: 12,
        color: danger ? '#ef4444' : 'var(--text-nav)', textAlign: 'left',
      }}>
      <Icon name={icon} size={13} color={danger ? '#ef4444' : 'var(--text-muted)'} />
      {label}
    </button>
  );
}

// Inline editable text + "•••" hover menu
function InlineEdit({ value, onSave, onCancel }) {
  const [v, setV] = useState(value);
  const ref = useRef(null);
  useEffect(() => { ref.current?.focus(); ref.current?.select(); }, []);
  const commit = () => { if (v.trim()) onSave(v.trim()); else onCancel(); };
  return (
    <input ref={ref} value={v} onChange={e => setV(e.target.value)}
      onKeyDown={e => { if (e.key === 'Enter') commit(); if (e.key === 'Escape') onCancel(); }}
      onBlur={commit}
      onClick={e => e.stopPropagation()}
      style={{
        flex: 1, border: 'none', outline: 'none', background: 'transparent',
        fontSize: 13, color: 'var(--text-main)', padding: 0,
        borderBottom: '1px solid var(--accent)',
      }} />
  );
}

// Icon picker grid
function IconPicker({ selected, onSelect, accent, accentLight }) {
  return (
    <div style={{ display: 'flex', flexWrap: 'wrap', gap: 3, padding: '6px 8px' }}>
      {LUCIDE_ICON_LIST.slice(0, 20).map(ico => (
        <button key={ico} onClick={() => onSelect(ico)}
          style={{
            background: selected === ico ? accentLight : 'transparent',
            border: selected === ico ? `1.5px solid ${accent}` : '1.5px solid transparent',
            borderRadius: 5, padding: 4, cursor: 'pointer',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}>
          <LucideIcon name={ico} size={13} color={selected === ico ? accent : 'var(--text-muted)'} />
        </button>
      ))}
    </div>
  );
}

// ── List row inside a group ───────────────────────────────────
function ListItem({ list, count, active, accent, accentLight, selectionBg, onSelect, onRename, onChangeIcon, onDelete }) {
  const [hover, setHover] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [mode, setMode] = useState(null); // null | 'rename' | 'icon'
  const menuRef = useRef(null);

  useEffect(() => {
    if (!menuOpen) return;
    const h = e => { if (menuRef.current && !menuRef.current.contains(e.target)) { setMenuOpen(false); setMode(null); } };
    document.addEventListener('mousedown', h);
    return () => document.removeEventListener('mousedown', h);
  }, [menuOpen]);

  return (
    <div style={{ position: 'relative' }}
      onMouseEnter={() => setHover(true)} onMouseLeave={() => setHover(false)}>
      <div onClick={onSelect}
        style={{
          display: 'flex', alignItems: 'center', gap: 7,
          padding: '5px 8px 5px 28px', /* 28px indent for nesting */
          borderRadius: 6, cursor: 'pointer',
          background: active ? (selectionBg || `${accent}18`) : hover ? 'var(--bg-hover)' : 'transparent',
          transition: 'background 0.1s',
        }}>
        {/* Colored dot + icon */}
        <span style={{
          width: 20, height: 20, borderRadius: 5,
          background: active ? `${accent}28` : `${list.color}22`,
          display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
        }}>
          <LucideIcon name={list.icon} size={12} color={active ? accent : list.color} />
        </span>

        {mode === 'rename'
          ? <InlineEdit value={list.name}
              onSave={name => { onRename(name); setMode(null); setMenuOpen(false); }}
              onCancel={() => { setMode(null); setMenuOpen(false); }} />
          : <span style={{
              flex: 1, fontWeight: active ? 600 : 400,
              color: active ? accent : 'var(--text-nav)',
              whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis',
            }}>{list.name}</span>
        }

        {/* Count or "..." button */}
        {hover && mode !== 'rename'
          ? <button onClick={e => { e.stopPropagation(); setMenuOpen(v => !v); }}
              style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', padding: '1px 3px', borderRadius: 4, flexShrink: 0 }}
              onMouseEnter={e => e.currentTarget.style.color = accent}
              onMouseLeave={e => e.currentTarget.style.color = 'var(--text-muted)'}>
              <Icon name="more" size={13} color="currentColor" />
            </button>
          : count > 0 && mode !== 'rename' && <span style={{ fontSize: 11, color: 'var(--text-faint)' }}>{count}</span>
        }
      </div>

      {/* Context menu */}
      {menuOpen && (
        <div ref={menuRef} style={{
          position: 'absolute', left: 28, top: '100%', zIndex: 200,
          background: 'var(--bg-panel)', border: '1px solid var(--border)',
          borderRadius: 8, boxShadow: '0 4px 20px rgba(0,0,0,0.15)',
          minWidth: 150, padding: '4px 0', marginTop: 2,
        }}>
          <CtxMenuItem icon="note" label="重命名" onClick={() => { setMode('rename'); setMenuOpen(false); }} />
          <CtxMenuItem icon="tag"  label="更换图标" onClick={() => setMode(mode === 'icon' ? null : 'icon')} />
          {mode === 'icon' && (
            <IconPicker selected={list.icon} accent={accent} accentLight={accentLight}
              onSelect={ico => { onChangeIcon(ico); setMenuOpen(false); setMode(null); }} />
          )}
          <div style={{ height: 1, background: 'var(--border-mid)', margin: '3px 0' }} />
          <CtxMenuItem icon="trash" label="删除清单" danger onClick={() => { onDelete(); setMenuOpen(false); }} />
        </div>
      )}
    </div>
  );
}

// ── Group row (folder header) ─────────────────────────────────
function GroupItem({
  group, lists, taskCounts, activeNav, accent, accentLight, selectionBg,
  collapsed, onToggleCollapse,
  onRenameGroup, onDeleteGroup, onAddList,
  onSelectList, onRenameList, onChangeListIcon, onDeleteList,
}) {
  const [hover, setHover] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [renaming, setRenaming] = useState(false);
  const [addingList, setAddingList] = useState(false);
  const [newListName, setNewListName] = useState('');
  const [newListIcon, setNewListIcon] = useState('Inbox');
  const menuRef = useRef(null);

  useEffect(() => {
    if (!menuOpen) return;
    const h = e => { if (menuRef.current && !menuRef.current.contains(e.target)) setMenuOpen(false); };
    document.addEventListener('mousedown', h);
    return () => document.removeEventListener('mousedown', h);
  }, [menuOpen]);

  const submitAdd = () => {
    if (!newListName.trim()) { setAddingList(false); return; }
    onAddList(group.id, newListName.trim(), newListIcon);
    setNewListName(''); setNewListIcon('Inbox'); setAddingList(false);
  };

  return (
    <div>
      {/* Group header */}
      <div style={{ position: 'relative' }}
        onMouseEnter={() => setHover(true)} onMouseLeave={() => setHover(false)}>
        <div onClick={onToggleCollapse}
          style={{
            display: 'flex', alignItems: 'center', gap: 5,
            padding: '5px 8px', borderRadius: 6, cursor: 'pointer',
            background: hover ? 'var(--bg-hover)' : 'transparent', transition: 'background 0.1s',
            userSelect: 'none',
          }}>
          {/* Chevron */}
          <span style={{ display: 'inline-flex', transition: 'transform 0.2s', transform: collapsed ? 'rotate(-90deg)' : 'rotate(0deg)', flexShrink: 0 }}>
            <Icon name="chevron" size={13} color="var(--text-muted)" />
          </span>

          {renaming
            ? <InlineEdit value={group.name}
                onSave={n => { onRenameGroup(n); setRenaming(false); }}
                onCancel={() => setRenaming(false)} />
            : <span style={{ flex: 1, fontSize: 14, fontWeight: 700, color: 'var(--text-muted)' }}>
                {group.name}
              </span>
          }

          {/* Hover controls: + and ... */}
          {hover && !renaming && (
            <div style={{ display: 'flex', gap: 2, flexShrink: 0 }} onClick={e => e.stopPropagation()}>
              <button onClick={() => setAddingList(v => !v)}
                style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', padding: '2px 3px', borderRadius: 4 }}
                onMouseEnter={e => e.currentTarget.style.color = accent}
                onMouseLeave={e => e.currentTarget.style.color = 'var(--text-muted)'}>
                <Icon name="add" size={13} color="currentColor" />
              </button>
              <button onClick={() => setMenuOpen(v => !v)}
                style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', padding: '2px 3px', borderRadius: 4 }}
                onMouseEnter={e => e.currentTarget.style.color = accent}
                onMouseLeave={e => e.currentTarget.style.color = 'var(--text-muted)'}>
                <Icon name="more" size={13} color="currentColor" />
              </button>
            </div>
          )}
        </div>

        {/* Group context menu */}
        {menuOpen && (
          <div ref={menuRef} style={{
            position: 'absolute', right: 8, top: '100%', zIndex: 200,
            background: 'var(--bg-panel)', border: '1px solid var(--border)',
            borderRadius: 8, boxShadow: '0 4px 20px rgba(0,0,0,0.15)',
            minWidth: 140, padding: '4px 0', marginTop: 2,
          }}>
            <CtxMenuItem icon="note"  label="重命名分组" onClick={() => { setRenaming(true); setMenuOpen(false); }} />
            <CtxMenuItem icon="add"   label="添加清单"   onClick={() => { setAddingList(true); setMenuOpen(false); }} />
            <div style={{ height: 1, background: 'var(--border-mid)', margin: '3px 0' }} />
            <CtxMenuItem icon="trash" label="删除分组" danger onClick={() => { onDeleteGroup(); setMenuOpen(false); }} />
          </div>
        )}
      </div>

      {/* List items (collapsed hides them) */}
      {!collapsed && (
        <>
          {lists.map(list => (
            <ListItem key={list.id} list={list} count={taskCounts(list.id)}
              active={activeNav === list.id} accent={accent} accentLight={accentLight} selectionBg={selectionBg}
              onSelect={() => onSelectList(list.id)}
              onRename={name => onRenameList(list.id, name)}
              onChangeIcon={ico => onChangeListIcon(list.id, ico)}
              onDelete={() => onDeleteList(list.id)}
            />
          ))}

          {/* Inline "add list to group" form */}
          {addingList && (
            <div style={{ padding: '4px 8px 6px 28px' }}>
              <div style={{
                display: 'flex', alignItems: 'center', gap: 6,
                border: `1.5px solid ${accent}`, borderRadius: 7,
                padding: '5px 8px', background: accentLight,
              }}>
                <LucideIcon name={newListIcon} size={13} color={accent} />
                <input autoFocus value={newListName}
                  onChange={e => setNewListName(e.target.value)}
                  onKeyDown={e => { if (e.key === 'Enter') submitAdd(); if (e.key === 'Escape') { setAddingList(false); setNewListName(''); }}}
                  placeholder="清单名称…"
                  style={{ flex: 1, border: 'none', outline: 'none', background: 'transparent', fontSize: 12, color: 'var(--text-main)' }} />
                <button onClick={submitAdd}
                  style={{ background: accent, color: 'white', border: 'none', borderRadius: 4, padding: '2px 7px', cursor: 'pointer', fontSize: 11 }}>
                  添加
                </button>
              </div>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 3, marginTop: 5, paddingLeft: 2 }}>
                {LUCIDE_ICON_LIST.slice(0, 20).map(ico => (
                  <button key={ico} onClick={() => setNewListIcon(ico)}
                    style={{
                      background: newListIcon === ico ? accentLight : 'transparent',
                      border: newListIcon === ico ? `1.5px solid ${accent}` : '1.5px solid transparent',
                      borderRadius: 4, padding: 3, cursor: 'pointer',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                    }}>
                    <LucideIcon name={ico} size={12} color={newListIcon === ico ? accent : 'var(--text-muted)'} />
                  </button>
                ))}
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}

// ── Sidebar root ──────────────────────────────────────────────
export default function Sidebar({
  sidebarWidth, activeNav, scheme, tweaks, setTweak,
  groups, lists, tasks,
  searching, searchQuery, setSearchQuery, setSearching,
  setActiveNav, setSelectedTask,
  addGroup, renameGroup, deleteGroup,
  addList, updateList, deleteList,
}) {
  const accent = scheme.accent;
  const accentLight = scheme.accentLight;
  const selectionBg = scheme.selectionBg || `${accent}18`;

  // Which groups are collapsed
  const [collapsedGroups, setCollapsedGroups] = useState({});

  const toggleGroup = (gid) => setCollapsedGroups(c => ({ ...c, [gid]: !c[gid] }));

  // Task counts
  const taskCount = (lid) => tasks.filter(t => !t.done && t.listId === lid).length;
  const todayCount  = tasks.filter(t => !t.done && t.due && isToday(t.due)).length;
  const weekCount   = tasks.filter(t => !t.done && t.due && isThisWeek(t.due)).length;
  const monthCount  = tasks.filter(t => !t.done && t.due && isThisMonth(t.due)).length;
  const yearCount   = tasks.filter(t => !t.done && t.due && isThisYear(t.due)).length;

  const nav = (id) => { setActiveNav(id); setSelectedTask(null); setSearching(false); setSearchQuery(''); };

  // ── Group CRUD ──────────────────────────────────────────────
  const handleAddGroup = () => {
    const name = '新分组';
    const newGroup = { id: uid(), name };
    addGroup(newGroup);
  };

  // ── List CRUD ───────────────────────────────────────────────
  const addListToGroup = (gid, name, icon) => {
    const colors = ['#4a90e2', '#e06b2d', '#2bab8e', '#7c5cbf', '#ec4899', '#f59e0b'];
    const newList = { id: uid(), name, icon, color: colors[lists.length % colors.length], groupId: gid };
    addList(newList);
    setActiveNav(newList.id);
  };

  const renameList = (lid, name) => updateList(lid, { name });
  const changeListIcon = (lid, icon) => updateList(lid, { icon });

  // Ungrouped lists (groupId === null)
  const ungroupedLists = lists.filter(l => !l.groupId);

  return (
    <div style={{
      width: sidebarWidth, background: 'var(--bg-sidebar)',
      borderRight: '1px solid var(--border)',
      display: 'flex', flexDirection: 'column', flexShrink: 0,
      fontSize: 14,
    }}>
      {/* ── App title + dark mode toggle ── */}
      <div style={{ padding: '18px 14px 10px', display: 'flex', alignItems: 'center', gap: 8 }}>
        <div style={{ width: 28, height: 28, borderRadius: 8, background: accent, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <Icon name="timeline" size={16} color="white" />
        </div>
        <span style={{ fontWeight: 700, fontSize: 15, color: 'var(--text-main)', flex: 1 }}>时间</span>
        <button onClick={() => setTweak('dark', !tweaks.dark)}
          title={tweaks.dark ? '切换亮色' : '切换暗色'}
          style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', padding: 4, borderRadius: 6 }}
          onMouseEnter={e => { e.currentTarget.style.background = 'var(--bg-hover)'; e.currentTarget.style.color = accent; }}
          onMouseLeave={e => { e.currentTarget.style.background = 'none'; e.currentTarget.style.color = 'var(--text-muted)'; }}>
          <Icon name={tweaks.dark ? 'sun' : 'moon'} size={16} color="currentColor" />
        </button>
      </div>

      {/* ── Search ── */}
      <div style={{ padding: '0 10px 10px' }}>
        <div style={{
          display: 'flex', alignItems: 'center', gap: 6,
          background: 'var(--bg-panel)', border: '1px solid var(--border)',
          borderRadius: 8, padding: '6px 10px', cursor: 'text',
        }} onClick={() => setSearching(true)}>
          <Icon name="search" size={13} color="var(--text-faint)" />
          {searching
            ? <input value={searchQuery} onChange={e => setSearchQuery(e.target.value)}
                onBlur={() => { if (!searchQuery) setSearching(false); }}
                autoFocus
                style={{ border: 'none', outline: 'none', background: 'transparent', fontSize: 13, width: '100%', color: 'var(--text-main)' }}
                placeholder="搜索任务…" />
            : <span style={{ color: 'var(--text-faint)', fontSize: 13 }}>搜索任务…</span>
          }
        </div>
      </div>

      {/* ── Smart views ── */}
      <div style={{ padding: '0 6px 6px', display: 'flex', flexDirection: 'column', gap: 1 }}>
        <NavItem icon="inbox"    label="收件箱"   count={tasks.filter(t => !t.done && t.listId === 'inbox').length} active={activeNav === 'inbox'} accent={accent} selectionBg={selectionBg} onClick={() => nav('inbox')} />
        <div style={{ height: 1, background: 'var(--border-mid)', margin: '3px 4px' }} />
        <NavItem icon="today"    label="今天"    count={todayCount}  active={activeNav === 'today'}  accent={accent} selectionBg={selectionBg} onClick={() => nav('today')} />
        <NavItem icon="week"     label="最近7天"  count={weekCount}   active={activeNav === 'week'}   accent={accent} selectionBg={selectionBg} onClick={() => nav('week')} />
        <NavItem icon="calendar" label="最近30天" count={monthCount}  active={activeNav === 'month'}  accent={accent} selectionBg={selectionBg} onClick={() => nav('month')} />
        <NavItem icon="star"     label="最近1年"  count={yearCount}   active={activeNav === 'year'}   accent={accent} selectionBg={selectionBg} onClick={() => nav('year')} />
      </div>

      <div style={{ height: 1, background: 'var(--border-mid)', margin: '2px 10px 8px' }} />

      {/* ── Groups + nested lists ── */}
      <div style={{ flex: 1, overflowY: 'auto', padding: '0 6px' }}>

        {/* Ungrouped lists (if any) */}
        {ungroupedLists.map(list => (
          <ListItem key={list.id} list={list} count={taskCount(list.id)}
            active={activeNav === list.id} accent={accent} accentLight={accentLight} selectionBg={selectionBg}
            onSelect={() => nav(list.id)}
            onRename={name => renameList(list.id, name)}
            onChangeIcon={ico => changeListIcon(list.id, ico)}
            onDelete={() => deleteList(list.id)}
          />
        ))}

        {/* Grouped lists */}
        {groups.map(group => {
          const groupLists = lists.filter(l => l.groupId === group.id);
          return (
            <GroupItem key={group.id}
              group={group} lists={groupLists} taskCounts={taskCount}
              activeNav={activeNav} accent={accent} accentLight={accentLight} selectionBg={selectionBg}
              collapsed={!!collapsedGroups[group.id]}
              onToggleCollapse={() => toggleGroup(group.id)}
              onRenameGroup={name => renameGroup(group.id, name)}
              onDeleteGroup={() => deleteGroup(group.id)}
              onAddList={addListToGroup}
              onSelectList={lid => nav(lid)}
              onRenameList={renameList}
              onChangeListIcon={changeListIcon}
              onDeleteList={deleteList}
            />
          );
        })}
      </div>

      {/* ── Bottom bar ── */}
      <div style={{
        borderTop: '1px solid var(--border)', padding: '8px 10px',
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
      }}>
        {/* Left: completed + trash */}
        <div style={{ display: 'flex', gap: 4 }}>
          <NavItem icon="done"  label="" count={0} accent={accent} selectionBg={selectionBg}
            active={false} onClick={() => setTweak('showCompleted', !tweaks.showCompleted)} />
          <NavItem icon="trash" label="" count={0} accent={accent} selectionBg={selectionBg}
            active={false} onClick={() => {}} />
        </div>

        {/* Right: add group + settings (visual only) */}
        <div style={{ display: 'flex', gap: 4 }}>
          <button title="添加分组" onClick={handleAddGroup}
            style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', padding: '4px 6px', borderRadius: 6, fontSize: 12, gap: 4 }}
            onMouseEnter={e => { e.currentTarget.style.background = 'var(--bg-hover)'; e.currentTarget.style.color = accent; }}
            onMouseLeave={e => { e.currentTarget.style.background = 'none'; e.currentTarget.style.color = 'var(--text-muted)'; }}>
            <Icon name="add" size={14} color="currentColor" />
            <span style={{ fontSize: 12 }}>分组</span>
          </button>
        </div>
      </div>
    </div>
  );
}

import { isToday, isThisWeek, isThisMonth, isThisYear } from '../data.js';
