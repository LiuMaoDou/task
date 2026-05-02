import Database from 'better-sqlite3';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { INITIAL_GROUPS, INITIAL_LISTS, INITIAL_TASKS } from '../src/data.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

export const DEFAULT_SETTINGS = {
  colorScheme: 'default',
  fontSize: 16,
  compactMode: false,
  showCompleted: true,
  sidebarWidth: 220,
  dark: false,
};

function uid() {
  return Math.random().toString(36).slice(2, 10);
}

function toIso(value) {
  if (!value) return null;
  const date = value instanceof Date ? value : new Date(value);
  return Number.isNaN(date.getTime()) ? null : date.toISOString();
}

function boolToInt(value) {
  return value ? 1 : 0;
}

function rowToSettings(row) {
  return {
    colorScheme: row.colorScheme,
    fontSize: row.fontSize,
    compactMode: !!row.compactMode,
    showCompleted: !!row.showCompleted,
    sidebarWidth: row.sidebarWidth,
    dark: !!row.dark,
  };
}

function rowToTask(row) {
  return {
    id: row.id,
    listId: row.listId,
    title: row.title,
    note: row.note || '',
    due: row.dueAt,
    priority: row.priority,
    done: !!row.done,
    subtasks: [],
  };
}

function rowToSubtask(row) {
  return {
    id: row.id,
    taskId: row.taskId,
    text: row.text,
    note: row.note || '',
    due: row.dueAt,
    done: !!row.done,
  };
}

export function openDb() {
  const dataDir = process.env.DATA_DIR || path.resolve(__dirname, '..', 'data');
  fs.mkdirSync(dataDir, { recursive: true });

  const db = new Database(path.join(dataDir, 'task.sqlite'));
  db.pragma('journal_mode = WAL');
  db.pragma('foreign_keys = ON');
  migrate(db);
  seedIfEmpty(db);
  return db;
}

function migrate(db) {
  db.exec(`
    CREATE TABLE IF NOT EXISTS settings (
      id INTEGER PRIMARY KEY CHECK (id = 1),
      colorScheme TEXT NOT NULL,
      fontSize INTEGER NOT NULL,
      compactMode INTEGER NOT NULL,
      showCompleted INTEGER NOT NULL,
      sidebarWidth INTEGER NOT NULL,
      dark INTEGER NOT NULL
    );

    CREATE TABLE IF NOT EXISTS groups (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      position INTEGER NOT NULL DEFAULT 0
    );

    CREATE TABLE IF NOT EXISTS lists (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      icon TEXT NOT NULL,
      color TEXT NOT NULL,
      groupId TEXT REFERENCES groups(id) ON DELETE SET NULL,
      position INTEGER NOT NULL DEFAULT 0
    );

    CREATE TABLE IF NOT EXISTS tasks (
      id TEXT PRIMARY KEY,
      listId TEXT NOT NULL REFERENCES lists(id) ON DELETE RESTRICT,
      title TEXT NOT NULL,
      note TEXT NOT NULL DEFAULT '',
      dueAt TEXT,
      priority INTEGER NOT NULL DEFAULT 0,
      done INTEGER NOT NULL DEFAULT 0,
      createdAt TEXT NOT NULL,
      updatedAt TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS subtasks (
      id TEXT PRIMARY KEY,
      taskId TEXT NOT NULL REFERENCES tasks(id) ON DELETE CASCADE,
      text TEXT NOT NULL,
      note TEXT NOT NULL DEFAULT '',
      dueAt TEXT,
      done INTEGER NOT NULL DEFAULT 0,
      position INTEGER NOT NULL DEFAULT 0
    );
  `);
}

function seedIfEmpty(db) {
  const hasSettings = db.prepare('SELECT COUNT(*) AS count FROM settings').get().count > 0;
  const hasGroups = db.prepare('SELECT COUNT(*) AS count FROM groups').get().count > 0;
  const hasLists = db.prepare('SELECT COUNT(*) AS count FROM lists').get().count > 0;
  const hasTasks = db.prepare('SELECT COUNT(*) AS count FROM tasks').get().count > 0;
  if (hasSettings || hasGroups || hasLists || hasTasks) return;

  const insertSettings = db.prepare(`
    INSERT INTO settings (id, colorScheme, fontSize, compactMode, showCompleted, sidebarWidth, dark)
    VALUES (1, @colorScheme, @fontSize, @compactMode, @showCompleted, @sidebarWidth, @dark)
  `);
  const insertGroup = db.prepare('INSERT INTO groups (id, name, position) VALUES (@id, @name, @position)');
  const insertList = db.prepare(`
    INSERT INTO lists (id, name, icon, color, groupId, position)
    VALUES (@id, @name, @icon, @color, @groupId, @position)
  `);
  const insertTask = db.prepare(`
    INSERT INTO tasks (id, listId, title, note, dueAt, priority, done, createdAt, updatedAt)
    VALUES (@id, @listId, @title, @note, @dueAt, @priority, @done, @createdAt, @updatedAt)
  `);
  const insertSubtask = db.prepare(`
    INSERT INTO subtasks (id, taskId, text, note, dueAt, done, position)
    VALUES (@id, @taskId, @text, @note, @dueAt, @done, @position)
  `);

  db.transaction(() => {
    insertSettings.run({
      ...DEFAULT_SETTINGS,
      compactMode: boolToInt(DEFAULT_SETTINGS.compactMode),
      showCompleted: boolToInt(DEFAULT_SETTINGS.showCompleted),
      dark: boolToInt(DEFAULT_SETTINGS.dark),
    });
    INITIAL_GROUPS.forEach((group, position) => insertGroup.run({ ...group, position }));
    INITIAL_LISTS.forEach((list, position) => insertList.run({ ...list, position }));
    INITIAL_TASKS.forEach((task, taskIndex) => {
      const now = new Date().toISOString();
      insertTask.run({
        id: task.id,
        listId: task.listId,
        title: task.title,
        note: task.note || '',
        dueAt: toIso(task.due),
        priority: task.priority || 0,
        done: boolToInt(task.done),
        createdAt: now,
        updatedAt: now,
      });
      (task.subtasks || []).forEach((subtask, subIndex) => {
        insertSubtask.run({
          id: subtask.id,
          taskId: task.id,
          text: subtask.text,
          note: subtask.note || '',
          dueAt: toIso(subtask.due),
          done: boolToInt(subtask.done),
          position: taskIndex * 100 + subIndex,
        });
      });
    });
  })();
}

export function getBootstrap(db) {
  const settingsRow = db.prepare('SELECT * FROM settings WHERE id = 1').get();
  const groups = db.prepare('SELECT id, name FROM groups ORDER BY position, rowid').all();
  const lists = db.prepare('SELECT id, name, icon, color, groupId FROM lists ORDER BY position, rowid').all();
  const tasks = db.prepare('SELECT * FROM tasks ORDER BY dueAt IS NULL, dueAt, createdAt').all().map(rowToTask);
  const subtasks = db.prepare('SELECT * FROM subtasks ORDER BY position, rowid').all().map(rowToSubtask);
  const byTaskId = new Map(tasks.map(task => [task.id, task]));
  subtasks.forEach(subtask => {
    byTaskId.get(subtask.taskId)?.subtasks.push(({ taskId, ...rest }) => rest)(subtask);
  });
  return { settings: rowToSettings(settingsRow), groups, lists, tasks };
}

export function createGroup(db, input) {
  const group = {
    id: input.id || uid(),
    name: String(input.name || '新分组').trim() || '新分组',
    position: input.position ?? db.prepare('SELECT COUNT(*) AS count FROM groups').get().count,
  };
  db.prepare('INSERT INTO groups (id, name, position) VALUES (@id, @name, @position)').run(group);
  return { id: group.id, name: group.name };
}

export function updateGroup(db, id, input) {
  const current = db.prepare('SELECT * FROM groups WHERE id = ?').get(id);
  if (!current) return null;
  const next = { name: input.name ?? current.name, position: input.position ?? current.position, id };
  db.prepare('UPDATE groups SET name = @name, position = @position WHERE id = @id').run(next);
  return { id, name: next.name };
}

export function deleteGroup(db, id) {
  db.transaction(() => {
    db.prepare('UPDATE lists SET groupId = NULL WHERE groupId = ?').run(id);
    db.prepare('DELETE FROM groups WHERE id = ?').run(id);
  })();
}

export function createList(db, input) {
  const list = {
    id: input.id || uid(),
    name: String(input.name || '新清单').trim() || '新清单',
    icon: input.icon || 'Inbox',
    color: input.color || '#4a90e2',
    groupId: input.groupId ?? null,
    position: input.position ?? db.prepare('SELECT COUNT(*) AS count FROM lists').get().count,
  };
  db.prepare(`
    INSERT INTO lists (id, name, icon, color, groupId, position)
    VALUES (@id, @name, @icon, @color, @groupId, @position)
  `).run(list);
  return { id: list.id, name: list.name, icon: list.icon, color: list.color, groupId: list.groupId };
}

export function updateList(db, id, input) {
  const current = db.prepare('SELECT * FROM lists WHERE id = ?').get(id);
  if (!current) return null;
  const next = {
    id,
    name: input.name ?? current.name,
    icon: input.icon ?? current.icon,
    color: input.color ?? current.color,
    groupId: Object.hasOwn(input, 'groupId') ? input.groupId : current.groupId,
    position: input.position ?? current.position,
  };
  db.prepare(`
    UPDATE lists SET name = @name, icon = @icon, color = @color, groupId = @groupId, position = @position
    WHERE id = @id
  `).run(next);
  return { id, name: next.name, icon: next.icon, color: next.color, groupId: next.groupId };
}

export function deleteList(db, id) {
  db.transaction(() => {
    db.prepare('UPDATE tasks SET listId = ? WHERE listId = ?').run('inbox', id);
    db.prepare('DELETE FROM lists WHERE id = ?').run(id);
  })();
}

export function createTask(db, input) {
  const now = new Date().toISOString();
  const task = {
    id: input.id || uid(),
    listId: input.listId || 'inbox',
    title: String(input.title || '').trim(),
    note: input.note || '',
    dueAt: toIso(input.due ?? input.dueAt),
    priority: input.priority || 0,
    done: boolToInt(input.done),
    createdAt: now,
    updatedAt: now,
  };
  db.prepare(`
    INSERT INTO tasks (id, listId, title, note, dueAt, priority, done, createdAt, updatedAt)
    VALUES (@id, @listId, @title, @note, @dueAt, @priority, @done, @createdAt, @updatedAt)
  `).run(task);
  return rowToTask(db.prepare('SELECT * FROM tasks WHERE id = ?').get(task.id));
}

export function updateTask(db, id, input) {
  const current = db.prepare('SELECT * FROM tasks WHERE id = ?').get(id);
  if (!current) return null;
  const next = {
    id,
    listId: input.listId ?? current.listId,
    title: input.title ?? current.title,
    note: input.note ?? current.note,
    dueAt: Object.hasOwn(input, 'due') || Object.hasOwn(input, 'dueAt') ? toIso(input.due ?? input.dueAt) : current.dueAt,
    priority: input.priority ?? current.priority,
    done: Object.hasOwn(input, 'done') ? boolToInt(input.done) : current.done,
    updatedAt: new Date().toISOString(),
  };
  db.prepare(`
    UPDATE tasks
    SET listId = @listId, title = @title, note = @note, dueAt = @dueAt,
        priority = @priority, done = @done, updatedAt = @updatedAt
    WHERE id = @id
  `).run(next);
  const task = rowToTask(db.prepare('SELECT * FROM tasks WHERE id = ?').get(id));
  task.subtasks = db.prepare('SELECT * FROM subtasks WHERE taskId = ? ORDER BY position, rowid').all(id).map(rowToSubtask);
  return task;
}

export function deleteTask(db, id) {
  db.prepare('DELETE FROM tasks WHERE id = ?').run(id);
}

export function createSubtask(db, taskId, input) {
  const subtask = {
    id: input.id || uid(),
    taskId,
    text: String(input.text || '').trim(),
    note: input.note || '',
    dueAt: toIso(input.due ?? input.dueAt),
    done: boolToInt(input.done),
    position: input.position ?? db.prepare('SELECT COUNT(*) AS count FROM subtasks WHERE taskId = ?').get(taskId).count,
  };
  db.prepare(`
    INSERT INTO subtasks (id, taskId, text, note, dueAt, done, position)
    VALUES (@id, @taskId, @text, @note, @dueAt, @done, @position)
  `).run(subtask);
  return rowToSubtask(db.prepare('SELECT * FROM subtasks WHERE id = ?').get(subtask.id));
}

export function updateSubtask(db, id, input) {
  const current = db.prepare('SELECT * FROM subtasks WHERE id = ?').get(id);
  if (!current) return null;
  const next = {
    id,
    text: input.text ?? current.text,
    note: input.note ?? current.note,
    dueAt: Object.hasOwn(input, 'due') || Object.hasOwn(input, 'dueAt') ? toIso(input.due ?? input.dueAt) : current.dueAt,
    done: Object.hasOwn(input, 'done') ? boolToInt(input.done) : current.done,
    position: input.position ?? current.position,
  };
  db.prepare(`
    UPDATE subtasks SET text = @text, note = @note, dueAt = @dueAt, done = @done, position = @position
    WHERE id = @id
  `).run(next);
  return rowToSubtask(db.prepare('SELECT * FROM subtasks WHERE id = ?').get(id));
}

export function deleteSubtask(db, id) {
  db.prepare('DELETE FROM subtasks WHERE id = ?').run(id);
}

export function updateSettings(db, input) {
  const current = rowToSettings(db.prepare('SELECT * FROM settings WHERE id = 1').get());
  const next = { ...current, ...input };
  db.prepare(`
    UPDATE settings
    SET colorScheme = @colorScheme, fontSize = @fontSize, compactMode = @compactMode,
        showCompleted = @showCompleted, sidebarWidth = @sidebarWidth, dark = @dark
    WHERE id = 1
  `).run({
    ...next,
    compactMode: boolToInt(next.compactMode),
    showCompleted: boolToInt(next.showCompleted),
    dark: boolToInt(next.dark),
  });
  return next;
}
