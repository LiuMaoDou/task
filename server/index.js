import express from 'express';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import {
  createGroup,
  createList,
  createSubtask,
  createTask,
  deleteGroup,
  deleteList,
  deleteSubtask,
  deleteTask,
  getBootstrap,
  openDb,
  updateGroup,
  updateList,
  updateSettings,
  updateSubtask,
  updateTask,
} from './db.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const app = express();
const db = openDb();
const port = Number(process.env.PORT || 8003);

app.use(express.json({ limit: '1mb' }));

function sendNotFound(res, entity = 'Resource') {
  res.status(404).json({ error: `${entity} not found` });
}

function route(handler) {
  return (req, res, next) => {
    try {
      handler(req, res);
    } catch (error) {
      next(error);
    }
  };
}

app.get('/api/health', (_req, res) => {
  res.json({ ok: true });
});

app.get('/api/bootstrap', route((_req, res) => {
  res.json(getBootstrap(db));
}));

app.patch('/api/settings', route((req, res) => {
  res.json(updateSettings(db, req.body || {}));
}));

app.post('/api/groups', route((req, res) => {
  res.status(201).json(createGroup(db, req.body || {}));
}));

app.patch('/api/groups/:id', route((req, res) => {
  const group = updateGroup(db, req.params.id, req.body || {});
  if (!group) return sendNotFound(res, 'Group');
  res.json(group);
}));

app.delete('/api/groups/:id', route((req, res) => {
  deleteGroup(db, req.params.id);
  res.status(204).end();
}));

app.post('/api/lists', route((req, res) => {
  res.status(201).json(createList(db, req.body || {}));
}));

app.patch('/api/lists/:id', route((req, res) => {
  const list = updateList(db, req.params.id, req.body || {});
  if (!list) return sendNotFound(res, 'List');
  res.json(list);
}));

app.delete('/api/lists/:id', route((req, res) => {
  deleteList(db, req.params.id);
  res.status(204).end();
}));

app.post('/api/tasks', route((req, res) => {
  res.status(201).json(createTask(db, req.body || {}));
}));

app.patch('/api/tasks/:id', route((req, res) => {
  const task = updateTask(db, req.params.id, req.body || {});
  if (!task) return sendNotFound(res, 'Task');
  res.json(task);
}));

app.delete('/api/tasks/:id', route((req, res) => {
  deleteTask(db, req.params.id);
  res.status(204).end();
}));

app.post('/api/tasks/:taskId/subtasks', route((req, res) => {
  res.status(201).json(createSubtask(db, req.params.taskId, req.body || {}));
}));

app.patch('/api/subtasks/:id', route((req, res) => {
  const subtask = updateSubtask(db, req.params.id, req.body || {});
  if (!subtask) return sendNotFound(res, 'Subtask');
  res.json(subtask);
}));

app.delete('/api/subtasks/:id', route((req, res) => {
  deleteSubtask(db, req.params.id);
  res.status(204).end();
}));

const distDir = path.resolve(__dirname, '..', 'dist');
app.use(express.static(distDir));
app.get(/.*/, (_req, res) => {
  res.sendFile(path.join(distDir, 'index.html'));
});

app.use((error, _req, res, _next) => {
  console.error(error);
  res.status(500).json({ error: 'Internal server error' });
});

app.listen(port, '0.0.0.0', () => {
  console.log(`Task server listening on ${port}`);
});
