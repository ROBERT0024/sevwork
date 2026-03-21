// TasksView.jsx — Tareas con prioridad, fecha límite y filtros
import React, { useState, useEffect, useCallback } from 'react';
import { getTasks, createTask, updateTask, deleteTask } from '../services/api.js';

const PRIORITY_CONFIG = {
  high:   { label:'Alta',  color:'#ef4444', icon:'🔴' },
  medium: { label:'Media', color:'#f59e0b', icon:'🟡' },
  low:    { label:'Baja',  color:'#22c55e', icon:'🟢' },
};
const FILTERS = ['todas', 'pendientes', 'completadas', 'alta', 'media', 'baja'];

function TasksView({ activeWorkspace, showNewForm, onFormShown }) {
  const [tasks, setTasks]   = useState([]);
  const [filter, setFilter] = useState('todas');
  const [showForm, setShowForm] = useState(false);
  const [title, setTitle]   = useState('');
  const [priority, setPriority] = useState('medium');
  const [dueDate, setDueDate]   = useState('');
  const [error, setError]   = useState('');

  useEffect(() => { if (showNewForm) { setShowForm(true); onFormShown?.(); } }, [showNewForm]);

  const load = useCallback(() => {
    if (!activeWorkspace) return;
    getTasks(activeWorkspace).then(r => setTasks(r.data)).catch(() => setError('Error al cargar tareas'));
  }, [activeWorkspace]);

  useEffect(() => { load(); }, [load]);

  const handleCreate = async (e) => {
    e.preventDefault();
    if (!title.trim()) return;
    try { await createTask(title, activeWorkspace, priority, dueDate || null); setTitle(''); setPriority('medium'); setDueDate(''); setShowForm(false); load(); }
    catch { setError('Error al crear tarea'); }
  };
  const handleToggle = async (t) => {
    try { await updateTask(t.id, { completed: !t.completed }); load(); }
    catch { setError('Error al actualizar tarea'); }
  };
  const handleDelete = async (id) => {
    try { await deleteTask(id); setTasks(p => p.filter(t => t.id !== id)); }
    catch { setError('Error al eliminar tarea'); }
  };

  const filtered = tasks.filter(t => {
    if (filter === 'pendientes')  return !t.completed;
    if (filter === 'completadas') return  t.completed;
    if (filter === 'alta')   return t.priority === 'high';
    if (filter === 'media')  return t.priority === 'medium';
    if (filter === 'baja')   return t.priority === 'low';
    return true;
  });

  const completed = tasks.filter(t => t.completed).length;
  const progress  = tasks.length ? Math.round((completed / tasks.length) * 100) : 0;
  const isOverdue = (t) => t.due_date && !t.completed && new Date(t.due_date) < new Date();

  return (
    <div className="view-tasks">
      {tasks.length > 0 && (
        <div className="tasks-summary">
          <div className="tasks-progress-info"><span>{completed} de {tasks.length} completadas</span><span className="tasks-pct">{progress}%</span></div>
          <div className="tasks-progress-track"><div className="tasks-progress-fill" style={{ width: `${progress}%` }} /></div>
        </div>
      )}
      <div className="tasks-filters">
        {FILTERS.map(f => <button key={f} className={`filter-btn ${filter === f ? 'active' : ''}`} onClick={() => setFilter(f)}>{f.charAt(0).toUpperCase() + f.slice(1)}</button>)}
        <button className="btn-new-task-inline" onClick={() => setShowForm(true)}>+ Nueva</button>
      </div>
      {error && <div className="error-bar">{error}</div>}
      {showForm && (
        <form onSubmit={handleCreate} className="task-create-form">
          <input autoFocus className="task-create-input" placeholder="¿Qué hay que hacer?" value={title} onChange={e => setTitle(e.target.value)} id="task-title" />
          <div className="task-create-row">
            <select value={priority} onChange={e => setPriority(e.target.value)} className="task-priority-select">
              <option value="high">🔴 Alta</option>
              <option value="medium">🟡 Media</option>
              <option value="low">🟢 Baja</option>
            </select>
            <input type="date" className="task-date-input" value={dueDate} onChange={e => setDueDate(e.target.value)} />
            <button type="submit" className="btn-primary-sm" id="create-task-btn">Agregar</button>
            <button type="button" className="btn-cancel-sm" onClick={() => setShowForm(false)}>✕</button>
          </div>
        </form>
      )}
      <div className="tasks-list-view">
        {filtered.length === 0 ? (
          <div className="view-empty"><span>✅</span><p>{filter === 'todas' ? 'Sin tareas. ¡Agrega la primera!' : `Sin tareas en "${filter}"`}</p></div>
        ) : filtered.map(task => {
          const pc = PRIORITY_CONFIG[task.priority] || PRIORITY_CONFIG.medium;
          const overdue = isOverdue(task);
          return (
            <div key={task.id} className={`task-item-view ${task.completed ? 'done' : ''} ${overdue ? 'overdue' : ''}`}>
              <button className={`task-cb ${task.completed ? 'checked' : ''}`} onClick={() => handleToggle(task)}>{task.completed && '✓'}</button>
              <div className="task-item-body">
                <span className="task-item-title">{task.title}</span>
                <div className="task-item-meta">
                  <span className="task-priority-badge" style={{ color: pc.color }}>{pc.icon} {pc.label}</span>
                  {task.due_date && <span className={`task-due ${overdue ? 'overdue-text' : ''}`}>📅 {new Date(task.due_date).toLocaleDateString('es-ES', { day:'2-digit', month:'short' })}{overdue && ' · Vencida'}</span>}
                </div>
              </div>
              <button className="task-delete-btn" onClick={() => handleDelete(task.id)}>✕</button>
            </div>
          );
        })}
      </div>
    </div>
  );
}

export default TasksView;
