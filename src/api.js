async function request(path, options = {}) {
  const res = await fetch(path, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...(options.headers || {}),
    },
  });
  if (!res.ok) {
    const detail = await res.json().catch(() => ({}));
    throw new Error(detail.error || `Request failed: ${res.status}`);
  }
  if (res.status === 204) return null;
  return res.json();
}

function reviveTask(task) {
  return {
    ...task,
    due: task.due ? new Date(task.due) : null,
    subtasks: (task.subtasks || []).map(subtask => ({
      ...subtask,
      due: subtask.due ? new Date(subtask.due) : null,
    })),
  };
}

function serialize(value) {
  if (value instanceof Date) return value.toISOString();
  if (Array.isArray(value)) return value.map(serialize);
  if (value && typeof value === 'object') {
    return Object.fromEntries(Object.entries(value).map(([key, entry]) => [key, serialize(entry)]));
  }
  return value;
}

function body(payload) {
  return JSON.stringify(serialize(payload));
}

export async function fetchBootstrap() {
  const data = await request('/api/bootstrap');
  return { ...data, tasks: data.tasks.map(reviveTask) };
}

export const api = {
  updateSettings: patch => request('/api/settings', { method: 'PATCH', body: body(patch) }),

  createGroup: group => request('/api/groups', { method: 'POST', body: body(group) }),
  updateGroup: (id, patch) => request(`/api/groups/${id}`, { method: 'PATCH', body: body(patch) }),
  deleteGroup: id => request(`/api/groups/${id}`, { method: 'DELETE' }),

  createList: list => request('/api/lists', { method: 'POST', body: body(list) }),
  updateList: (id, patch) => request(`/api/lists/${id}`, { method: 'PATCH', body: body(patch) }),
  deleteList: id => request(`/api/lists/${id}`, { method: 'DELETE' }),

  createTask: async task => reviveTask(await request('/api/tasks', { method: 'POST', body: body(task) })),
  updateTask: async (id, patch) => reviveTask(await request(`/api/tasks/${id}`, { method: 'PATCH', body: body(patch) })),
  deleteTask: id => request(`/api/tasks/${id}`, { method: 'DELETE' }),

  createSubtask: (taskId, subtask) => request(`/api/tasks/${taskId}/subtasks`, { method: 'POST', body: body(subtask) }),
  updateSubtask: (id, patch) => request(`/api/subtasks/${id}`, { method: 'PATCH', body: body(patch) }),
  deleteSubtask: id => request(`/api/subtasks/${id}`, { method: 'DELETE' }),
};
