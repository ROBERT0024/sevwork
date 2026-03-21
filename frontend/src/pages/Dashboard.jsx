// Dashboard — Secure Workspace
// Panel principal con: notas, tareas, búsqueda, tags, edición de notas y múltiples workspaces

import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  getNotes, createNote, updateNote, deleteNote,
  getWorkspaces, createWorkspace,
  getTasks, createTask, updateTask, deleteTask,
} from '../services/api.js';

const TAG_COLORS = {
  trabajo: '#6366f1',
  personal: '#10b981',
  ideas: '#f59e0b',
  urgente: '#ef4444',
  estudio: '#3b82f6',
  '': '#64748b',
};

const TAG_OPTIONS = ['', 'trabajo', 'personal', 'ideas', 'urgente', 'estudio'];

function Dashboard() {
  const [notes, setNotes] = useState([]);
  const [tasks, setTasks] = useState([]);
  const [workspaces, setWorkspaces] = useState([]);
  const [activeWorkspace, setActiveWorkspace] = useState(null);
  const [activeView, setActiveView] = useState('notes'); // 'notes' | 'tasks'
  const [search, setSearch] = useState('');
  const [filterTag, setFilterTag] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Formulario nueva nota
  const [noteTitle, setNoteTitle] = useState('');
  const [noteContent, setNoteContent] = useState('');
  const [noteTag, setNoteTag] = useState('');

  // Edición de nota
  const [editingNote, setEditingNote] = useState(null);
  const [editTitle, setEditTitle] = useState('');
  const [editContent, setEditContent] = useState('');
  const [editTag, setEditTag] = useState('');

  // Formulario nueva tarea
  const [taskTitle, setTaskTitle] = useState('');

  // Nuevo workspace
  const [showNewWs, setShowNewWs] = useState(false);
  const [newWsName, setNewWsName] = useState('');

  const navigate = useNavigate();

  // ── Carga inicial ──
  useEffect(() => { loadWorkspaces(); }, []);
  useEffect(() => {
    if (activeWorkspace) {
      loadNotes();
      loadTasks();
    }
  }, [activeWorkspace, filterTag]);

  // Búsqueda con debounce
  useEffect(() => {
    const t = setTimeout(() => { if (activeWorkspace) loadNotes(); }, 400);
    return () => clearTimeout(t);
  }, [search]);

  const loadWorkspaces = async () => {
    try {
      const res = await getWorkspaces();
      setWorkspaces(res.data);
      if (res.data.length === 0) {
        const newWs = await createWorkspace('Mi Espacio', 'Espacio de trabajo principal');
        setWorkspaces([newWs.data]);
        setActiveWorkspace(newWs.data.id);
      } else {
        setActiveWorkspace(res.data[0].id);
      }
    } catch {
      setError('Error al cargar espacios de trabajo');
    } finally {
      setLoading(false);
    }
  };

  const loadNotes = useCallback(async () => {
    try {
      const res = await getNotes(activeWorkspace, search, filterTag);
      setNotes(res.data);
    } catch {
      setError('Error al cargar notas');
    }
  }, [activeWorkspace, search, filterTag]);

  const loadTasks = useCallback(async () => {
    try {
      const res = await getTasks(activeWorkspace);
      setTasks(res.data);
    } catch {
      setError('Error al cargar tareas');
    }
  }, [activeWorkspace]);

  // ── Notas ──
  const handleCreateNote = async (e) => {
    e.preventDefault();
    if (!noteTitle.trim()) return;
    setError('');
    try {
      await createNote(noteTitle, noteContent, activeWorkspace, noteTag);
      setNoteTitle(''); setNoteContent(''); setNoteTag('');
      loadNotes();
    } catch { setError('Error al crear la nota'); }
  };

  const handlePinNote = async (note) => {
    try {
      await updateNote(note.id, { is_pinned: !note.is_pinned });
      loadNotes();
    } catch { setError('Error al fijar la nota'); }
  };

  const handleStartEdit = (note) => {
    setEditingNote(note.id);
    setEditTitle(note.title);
    setEditContent(note.content);
    setEditTag(note.tag || '');
  };

  const handleSaveEdit = async (noteId) => {
    try {
      await updateNote(noteId, { title: editTitle, content: editContent, tag: editTag });
      setEditingNote(null);
      loadNotes();
    } catch { setError('Error al guardar la nota'); }
  };

  const handleDeleteNote = async (noteId) => {
    if (!window.confirm('¿Seguro que quieres eliminar esta nota?')) return;
    try {
      await deleteNote(noteId);
      setNotes(notes.filter((n) => n.id !== noteId));
    } catch { setError('Error al eliminar la nota'); }
  };

  // ── Tareas ──
  const handleCreateTask = async (e) => {
    e.preventDefault();
    if (!taskTitle.trim()) return;
    setError('');
    try {
      await createTask(taskTitle, activeWorkspace);
      setTaskTitle('');
      loadTasks();
    } catch { setError('Error al crear la tarea'); }
  };

  const handleToggleTask = async (task) => {
    try {
      await updateTask(task.id, { completed: !task.completed });
      loadTasks();
    } catch { setError('Error al actualizar la tarea'); }
  };

  const handleDeleteTask = async (taskId) => {
    try {
      await deleteTask(taskId);
      setTasks(tasks.filter((t) => t.id !== taskId));
    } catch { setError('Error al eliminar la tarea'); }
  };

  // ── Workspaces ──
  const handleCreateWorkspace = async (e) => {
    e.preventDefault();
    if (!newWsName.trim()) return;
    try {
      const res = await createWorkspace(newWsName);
      setWorkspaces([...workspaces, res.data]);
      setActiveWorkspace(res.data.id);
      setNewWsName('');
      setShowNewWs(false);
    } catch { setError('Error al crear el espacio de trabajo'); }
  };

  const handleLogout = () => {
    localStorage.removeItem('access_token');
    localStorage.removeItem('refresh_token');
    navigate('/');
  };

  const completedTasks = tasks.filter((t) => t.completed).length;
  const ws = workspaces.find((w) => w.id === activeWorkspace);

  if (loading) {
    return (
      <div className="dashboard-container">
        <div className="loading-screen">
          <div className="loading-spinner"></div>
          <p>Cargando tu espacio de trabajo...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="dashboard-container">
      {/* ── Header ── */}
      <header className="dashboard-header">
        <div className="header-left">
          <span className="logo-small">🔒</span>
          <h1>Secure Workspace</h1>
        </div>
        <div className="header-search">
          <span className="search-icon">🔍</span>
          <input
            type="text"
            className="search-input"
            placeholder="Buscar en notas..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <button className="btn-logout" onClick={handleLogout}>
          Cerrar sesión
        </button>
      </header>

      <div className="dashboard-content">
        {/* ── Sidebar ── */}
        <aside className="sidebar">
          <div className="sidebar-section">
            <div className="sidebar-title-row">
              <h2>Espacios de Trabajo</h2>
              <button className="btn-icon" title="Nuevo espacio" onClick={() => setShowNewWs(!showNewWs)}>+</button>
            </div>

            {showNewWs && (
              <form onSubmit={handleCreateWorkspace} className="new-ws-form">
                <input
                  type="text"
                  placeholder="Nombre del espacio..."
                  value={newWsName}
                  onChange={(e) => setNewWsName(e.target.value)}
                  autoFocus
                />
                <button type="submit" className="btn-primary-sm">Crear</button>
              </form>
            )}

            <ul className="workspace-list">
              {workspaces.map((ws) => (
                <li
                  key={ws.id}
                  className={ws.id === activeWorkspace ? 'active' : ''}
                  onClick={() => setActiveWorkspace(ws.id)}
                >
                  <span>📁</span>
                  <span className="ws-name">{ws.name}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* Filtro por etiquetas */}
          <div className="sidebar-section">
            <h2>Etiquetas</h2>
            <div className="tag-filter-list">
              {TAG_OPTIONS.filter((t) => t !== '').map((tag) => (
                <button
                  key={tag}
                  className={`tag-filter-btn ${filterTag === tag ? 'active' : ''}`}
                  style={{ '--tag-color': TAG_COLORS[tag] }}
                  onClick={() => setFilterTag(filterTag === tag ? '' : tag)}
                >
                  {tag}
                </button>
              ))}
            </div>
          </div>

          {/* Stats */}
          <div className="sidebar-stats">
            <div className="stat-item">
              <span className="stat-num">{notes.length}</span>
              <span className="stat-label">Notas</span>
            </div>
            <div className="stat-item">
              <span className="stat-num">{completedTasks}/{tasks.length}</span>
              <span className="stat-label">Tareas</span>
            </div>
          </div>
        </aside>

        {/* ── Panel principal ── */}
        <main className="main-content">
          {/* Tabs */}
          <div className="view-tabs">
            <button
              className={`tab-btn ${activeView === 'notes' ? 'active' : ''}`}
              onClick={() => setActiveView('notes')}
            >
              📝 Notas
            </button>
            <button
              className={`tab-btn ${activeView === 'tasks' ? 'active' : ''}`}
              onClick={() => setActiveView('tasks')}
            >
              ✅ Tareas {tasks.length > 0 && <span className="tab-badge">{tasks.filter(t => !t.completed).length}</span>}
            </button>
            {ws && (
              <div className="ws-title">
                <span>📁 {ws.name}</span>
                {ws.description && <span className="ws-desc">{ws.description}</span>}
              </div>
            )}
          </div>

          {error && <div className="error-message">{error}</div>}

          {/* ── Vista Notas ── */}
          {activeView === 'notes' && (
            <>
              <div className="create-note-card">
                <h2>✏️ Nueva Nota</h2>
                <form onSubmit={handleCreateNote}>
                  <input
                    type="text"
                    placeholder="Título de la nota"
                    value={noteTitle}
                    onChange={(e) => setNoteTitle(e.target.value)}
                    required
                    id="note-title"
                  />
                  <textarea
                    placeholder="Escribe el contenido de tu nota..."
                    value={noteContent}
                    onChange={(e) => setNoteContent(e.target.value)}
                    rows={3}
                    id="note-content"
                  />
                  <div className="form-row">
                    <select
                      value={noteTag}
                      onChange={(e) => setNoteTag(e.target.value)}
                      className="tag-select"
                    >
                      <option value="">Sin etiqueta</option>
                      {TAG_OPTIONS.filter((t) => t !== '').map((t) => (
                        <option key={t} value={t}>{t}</option>
                      ))}
                    </select>
                    <button type="submit" className="btn-primary" id="create-note-btn">
                      Crear nota
                    </button>
                  </div>
                </form>
              </div>

              {filterTag && (
                <div className="active-filter">
                  Filtrando por etiqueta: <strong>{filterTag}</strong>
                  <button onClick={() => setFilterTag('')}>✕ Quitar</button>
                </div>
              )}

              <div className="notes-grid">
                {notes.length === 0 ? (
                  <div className="empty-state">
                    📝 {search ? 'No se encontraron notas para tu búsqueda.' : 'No hay notas aún. ¡Crea tu primera nota!'}
                  </div>
                ) : (
                  notes.map((note) => (
                    <div key={note.id} className={`note-card ${note.is_pinned ? 'pinned' : ''}`}>
                      {editingNote === note.id ? (
                        // Modo edición
                        <div className="note-edit-mode">
                          <input
                            type="text"
                            value={editTitle}
                            onChange={(e) => setEditTitle(e.target.value)}
                            className="edit-input"
                          />
                          <textarea
                            value={editContent}
                            onChange={(e) => setEditContent(e.target.value)}
                            rows={4}
                            className="edit-textarea"
                          />
                          <div className="form-row">
                            <select
                              value={editTag}
                              onChange={(e) => setEditTag(e.target.value)}
                              className="tag-select"
                            >
                              <option value="">Sin etiqueta</option>
                              {TAG_OPTIONS.filter((t) => t !== '').map((t) => (
                                <option key={t} value={t}>{t}</option>
                              ))}
                            </select>
                            <div className="edit-actions">
                              <button className="btn-save" onClick={() => handleSaveEdit(note.id)}>💾 Guardar</button>
                              <button className="btn-cancel" onClick={() => setEditingNote(null)}>Cancelar</button>
                            </div>
                          </div>
                        </div>
                      ) : (
                        // Modo visualización
                        <>
                          <div className="note-header">
                            <div className="note-title-row">
                              {note.is_pinned && <span className="pin-badge">📌</span>}
                              <h3>{note.title}</h3>
                            </div>
                            <div className="note-actions">
                              <button className="btn-icon-sm" onClick={() => handlePinNote(note)} title={note.is_pinned ? 'Desfijar' : 'Fijar'}>
                                {note.is_pinned ? '📌' : '📍'}
                              </button>
                              <button className="btn-icon-sm" onClick={() => handleStartEdit(note)} title="Editar">
                                ✏️
                              </button>
                              <button className="btn-delete" onClick={() => handleDeleteNote(note.id)} title="Eliminar">
                                ✕
                              </button>
                            </div>
                          </div>
                          {note.tag && (
                            <span className="tag-badge" style={{ background: TAG_COLORS[note.tag] || '#64748b' }}>
                              {note.tag}
                            </span>
                          )}
                          <p className="note-content">{note.content}</p>
                          <div className="note-meta">
                            <span>📊 {note.word_count} palabras</span>
                            <span>{new Date(note.updated_at).toLocaleDateString('es-ES')}</span>
                          </div>
                        </>
                      )}
                    </div>
                  ))
                )}
              </div>
            </>
          )}

          {/* ── Vista Tareas ── */}
          {activeView === 'tasks' && (
            <>
              <div className="create-note-card">
                <h2>☑️ Nueva Tarea</h2>
                <form onSubmit={handleCreateTask} className="task-form">
                  <input
                    type="text"
                    placeholder="¿Qué tienes que hacer?"
                    value={taskTitle}
                    onChange={(e) => setTaskTitle(e.target.value)}
                    required
                    id="task-title"
                  />
                  <button type="submit" className="btn-primary" id="create-task-btn">
                    Agregar tarea
                  </button>
                </form>
              </div>

              {tasks.length > 0 && (
                <div className="tasks-progress">
                  <div className="progress-bar">
                    <div
                      className="progress-fill"
                      style={{ width: `${tasks.length > 0 ? (completedTasks / tasks.length) * 100 : 0}%` }}
                    ></div>
                  </div>
                  <span>{completedTasks} de {tasks.length} completadas</span>
                </div>
              )}

              <div className="tasks-list">
                {tasks.length === 0 ? (
                  <div className="empty-state">✅ No hay tareas. ¡Agrega tu primera tarea!</div>
                ) : (
                  tasks.map((task) => (
                    <div key={task.id} className={`task-item ${task.completed ? 'completed' : ''}`}>
                      <button
                        className={`task-checkbox ${task.completed ? 'checked' : ''}`}
                        onClick={() => handleToggleTask(task)}
                      >
                        {task.completed ? '✓' : ''}
                      </button>
                      <span className="task-title">{task.title}</span>
                      <span className="task-date">{new Date(task.created_at).toLocaleDateString('es-ES')}</span>
                      <button className="btn-delete" onClick={() => handleDeleteTask(task.id)} title="Eliminar">
                        ✕
                      </button>
                    </div>
                  ))
                )}
              </div>
            </>
          )}
        </main>
      </div>
    </div>
  );
}

export default Dashboard;
