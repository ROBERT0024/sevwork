// Dashboard — Secure Workspace (Notion-style)
// Editor markdown con preview, Ctrl+K, tags, tareas y workspaces múltiples

import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import {
  getNotes, createNote, updateNote, deleteNote,
  getWorkspaces, createWorkspace,
  getTasks, createTask, updateTask, deleteTask,
} from '../services/api.js';

const TAG_COLORS = {
  trabajo: '#6366f1', personal: '#10b981', ideas: '#f59e0b',
  urgente: '#ef4444', estudio: '#3b82f6', '': '#475569',
};
const TAG_OPTIONS = ['trabajo', 'personal', 'ideas', 'urgente', 'estudio'];

// ── Toolbar de Markdown ──
function MarkdownToolbar({ onInsert }) {
  const tools = [
    { label: 'B', md: '**texto**', title: 'Negrita' },
    { label: 'I', md: '_texto_', title: 'Cursiva' },
    { label: 'H1', md: '# Título', title: 'Título' },
    { label: 'H2', md: '## Título', title: 'Subtítulo' },
    { label: '`', md: '`código`', title: 'Código inline' },
    { label: '```', md: '```\ncódigo\n```', title: 'Bloque código' },
    { label: '—', md: '---', title: 'Separador' },
    { label: '☑', md: '- [ ] tarea', title: 'Tarea' },
    { label: '•', md: '- elemento', title: 'Lista' },
  ];
  return (
    <div className="md-toolbar">
      {tools.map((t) => (
        <button
          key={t.label}
          type="button"
          className="md-tool-btn"
          title={t.title}
          onClick={() => onInsert(t.md)}
        >
          {t.label}
        </button>
      ))}
    </div>
  );
}

// ── Tarjeta de Nota ──
function NoteCard({ note, onPin, onEdit, onDelete }) {
  const [expanded, setExpanded] = useState(false);

  return (
    <div className={`note-card ${note.is_pinned ? 'pinned' : ''}`}>
      <div className="note-header">
        <div className="note-title-row" onClick={() => setExpanded(!expanded)} style={{ cursor: 'pointer' }}>
          {note.is_pinned && <span className="pin-icon">📌</span>}
          <h3>{note.title}</h3>
        </div>
        <div className="note-actions">
          <button className="btn-icon-sm" onClick={() => onPin(note)} title={note.is_pinned ? 'Desfijar' : 'Fijar'}>
            {note.is_pinned ? '📌' : '📍'}
          </button>
          <button className="btn-icon-sm" onClick={() => onEdit(note)} title="Editar">✏️</button>
          <button className="btn-delete" onClick={() => onDelete(note.id)} title="Eliminar">✕</button>
        </div>
      </div>

      {note.tag && (
        <span className="tag-badge" style={{ background: TAG_COLORS[note.tag] || '#475569' }}>
          {note.tag}
        </span>
      )}

      <div className={`note-body ${expanded ? 'expanded' : ''}`}>
        <ReactMarkdown remarkPlugins={[remarkGfm]}>{note.content || '_Sin contenido_'}</ReactMarkdown>
      </div>

      {!expanded && note.content && note.content.length > 150 && (
        <button className="btn-expand" onClick={() => setExpanded(true)}>Ver más ↓</button>
      )}

      <div className="note-meta">
        <span>📊 {note.word_count} palabras</span>
        <span>{new Date(note.updated_at).toLocaleDateString('es-ES', { day: '2-digit', month: 'short' })}</span>
      </div>
    </div>
  );
}

// ── Modal de Edición ──
function EditModal({ note, onSave, onClose }) {
  const [title, setTitle] = useState(note.title);
  const [content, setContent] = useState(note.content);
  const [tag, setTag] = useState(note.tag || '');
  const [preview, setPreview] = useState(false);
  const textareaRef = useRef(null);

  const insertMd = (md) => {
    const el = textareaRef.current;
    if (!el) return;
    const start = el.selectionStart;
    const end = el.selectionEnd;
    const before = content.slice(0, start);
    const after = content.slice(end);
    const newContent = before + md + after;
    setContent(newContent);
    setTimeout(() => {
      el.focus();
      el.setSelectionRange(start + md.length, start + md.length);
    }, 0);
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-card" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <input
            className="modal-title-input"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Título de la nota..."
          />
          <div className="modal-controls">
            <select value={tag} onChange={(e) => setTag(e.target.value)} className="tag-select-sm">
              <option value="">Sin etiqueta</option>
              {TAG_OPTIONS.map((t) => <option key={t} value={t}>{t}</option>)}
            </select>
            <button
              className={`btn-toggle ${preview ? 'active' : ''}`}
              onClick={() => setPreview(!preview)}
            >
              {preview ? '✏️ Editar' : '👁 Preview'}
            </button>
          </div>
        </div>

        {!preview ? (
          <>
            <MarkdownToolbar onInsert={insertMd} />
            <textarea
              ref={textareaRef}
              className="modal-editor"
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="Escribe en **markdown**...&#10;&#10;**Negrita**, _cursiva_, `código`&#10;# Título&#10;- Lista&#10;- [ ] Tarea"
            />
          </>
        ) : (
          <div className="modal-preview">
            <ReactMarkdown remarkPlugins={[remarkGfm]}>{content || '_Sin contenido_'}</ReactMarkdown>
          </div>
        )}

        <div className="modal-footer">
          <button className="btn-cancel" onClick={onClose}>Cancelar</button>
          <button className="btn-save" onClick={() => onSave(note.id, { title, content, tag })}>💾 Guardar</button>
        </div>
      </div>
    </div>
  );
}

// ── Dashboard principal ──
function Dashboard() {
  const [notes, setNotes] = useState([]);
  const [tasks, setTasks] = useState([]);
  const [workspaces, setWorkspaces] = useState([]);
  const [activeWorkspace, setActiveWorkspace] = useState(null);
  const [activeView, setActiveView] = useState('notes');
  const [search, setSearch] = useState('');
  const [filterTag, setFilterTag] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Formulario nueva nota
  const [noteTitle, setNoteTitle] = useState('');
  const [noteContent, setNoteContent] = useState('');
  const [noteTag, setNoteTag] = useState('');
  const [showNoteForm, setShowNoteForm] = useState(false);
  const [notePreview, setNotePreview] = useState(false);
  const newNoteTextareaRef = useRef(null);

  // Edición
  const [editingNote, setEditingNote] = useState(null);

  // Tarea
  const [taskTitle, setTaskTitle] = useState('');

  // Workspace
  const [showNewWs, setShowNewWs] = useState(false);
  const [newWsName, setNewWsName] = useState('');

  const searchRef = useRef(null);
  const navigate = useNavigate();

  // Ctrl+K para enfocar búsqueda
  useEffect(() => {
    const handleKeyDown = (e) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
        e.preventDefault();
        searchRef.current?.focus();
        searchRef.current?.select();
      }
      if (e.key === 'Escape' && editingNote) {
        setEditingNote(null);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [editingNote]);

  useEffect(() => { loadWorkspaces(); }, []);
  useEffect(() => {
    if (activeWorkspace) { loadNotes(); loadTasks(); }
  }, [activeWorkspace, filterTag]);

  useEffect(() => {
    const t = setTimeout(() => { if (activeWorkspace) loadNotes(); }, 350);
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
    } catch { setError('Error al cargar espacios'); }
    finally { setLoading(false); }
  };

  const loadNotes = useCallback(async () => {
    try {
      const res = await getNotes(activeWorkspace, search, filterTag);
      setNotes(res.data);
      setError('');
    } catch { setError('Error al cargar notas'); }
  }, [activeWorkspace, search, filterTag]);

  const loadTasks = useCallback(async () => {
    try {
      const res = await getTasks(activeWorkspace);
      setTasks(res.data);
    } catch { setError('Error al cargar tareas'); }
  }, [activeWorkspace]);

  const handleCreateNote = async (e) => {
    e.preventDefault();
    if (!noteTitle.trim()) return;
    try {
      await createNote(noteTitle, noteContent, activeWorkspace, noteTag);
      setNoteTitle(''); setNoteContent(''); setNoteTag('');
      setShowNoteForm(false); setNotePreview(false);
      loadNotes();
    } catch { setError('Error al crear nota'); }
  };

  const handleSaveEdit = async (noteId, data) => {
    try {
      await updateNote(noteId, data);
      setEditingNote(null);
      loadNotes();
    } catch { setError('Error al guardar nota'); }
  };

  const handlePinNote = async (note) => {
    try {
      await updateNote(note.id, { is_pinned: !note.is_pinned });
      loadNotes();
    } catch { setError('Error al fijar nota'); }
  };

  const handleDeleteNote = async (noteId) => {
    if (!window.confirm('¿Eliminar esta nota?')) return;
    try {
      await deleteNote(noteId);
      setNotes(notes.filter((n) => n.id !== noteId));
    } catch { setError('Error al eliminar nota'); }
  };

  const handleCreateTask = async (e) => {
    e.preventDefault();
    if (!taskTitle.trim()) return;
    try {
      await createTask(taskTitle, activeWorkspace);
      setTaskTitle(''); loadTasks();
    } catch { setError('Error al crear tarea'); }
  };

  const handleToggleTask = async (task) => {
    try {
      await updateTask(task.id, { completed: !task.completed });
      loadTasks();
    } catch { setError('Error al actualizar tarea'); }
  };

  const handleDeleteTask = async (taskId) => {
    try {
      await deleteTask(taskId);
      setTasks(tasks.filter((t) => t.id !== taskId));
    } catch { setError('Error al eliminar tarea'); }
  };

  const handleCreateWorkspace = async (e) => {
    e.preventDefault();
    if (!newWsName.trim()) return;
    try {
      const res = await createWorkspace(newWsName);
      setWorkspaces([...workspaces, res.data]);
      setActiveWorkspace(res.data.id);
      setNewWsName(''); setShowNewWs(false);
    } catch { setError('Error al crear espacio'); }
  };

  const insertMdToNew = (md) => {
    const el = newNoteTextareaRef.current;
    if (!el) return;
    const s = el.selectionStart, end = el.selectionEnd;
    const newC = noteContent.slice(0, s) + md + noteContent.slice(end);
    setNoteContent(newC);
    setTimeout(() => { el.focus(); el.setSelectionRange(s + md.length, s + md.length); }, 0);
  };

  const completedTasks = tasks.filter((t) => t.completed).length;
  const ws = workspaces.find((w) => w.id === activeWorkspace);

  if (loading) return (
    <div className="loading-screen">
      <div className="loading-spinner"></div>
      <p>Cargando tu espacio...</p>
    </div>
  );

  return (
    <div className="dashboard-container">
      {/* Modal de edición */}
      {editingNote && (
        <EditModal
          note={editingNote}
          onSave={handleSaveEdit}
          onClose={() => setEditingNote(null)}
        />
      )}

      {/* Header */}
      <header className="dashboard-header">
        <div className="header-left">
          <span className="logo-small">🔒</span>
          <span className="app-name">Secure Workspace</span>
        </div>

        <div className="header-search">
          <span className="search-icon">🔍</span>
          <input
            ref={searchRef}
            type="text"
            className="search-input"
            placeholder="Buscar... (Ctrl+K)"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
          {search && (
            <button className="search-clear" onClick={() => setSearch('')}>✕</button>
          )}
        </div>

        <button className="btn-logout" onClick={() => { localStorage.clear(); navigate('/'); }}>
          Salir
        </button>
      </header>

      <div className="dashboard-content">
        {/* Sidebar */}
        <aside className="sidebar">
          <div className="sidebar-section">
            <div className="sidebar-label">
              <span>Espacios</span>
              <button className="btn-icon-xs" onClick={() => setShowNewWs(!showNewWs)}>+</button>
            </div>

            {showNewWs && (
              <form onSubmit={handleCreateWorkspace} className="inline-form">
                <input
                  autoFocus
                  value={newWsName}
                  onChange={(e) => setNewWsName(e.target.value)}
                  placeholder="Nombre..."
                  className="inline-input"
                />
                <button type="submit" className="btn-xs-primary">OK</button>
              </form>
            )}

            <ul className="workspace-list">
              {workspaces.map((w) => (
                <li
                  key={w.id}
                  className={w.id === activeWorkspace ? 'active' : ''}
                  onClick={() => setActiveWorkspace(w.id)}
                >
                  <span className="ws-icon">📁</span>
                  <span className="ws-name">{w.name}</span>
                </li>
              ))}
            </ul>
          </div>

          <div className="sidebar-section">
            <div className="sidebar-label"><span>Etiquetas</span></div>
            <div className="tag-pills">
              {TAG_OPTIONS.map((tag) => (
                <button
                  key={tag}
                  className={`tag-pill ${filterTag === tag ? 'active' : ''}`}
                  style={{ '--tc': TAG_COLORS[tag] }}
                  onClick={() => setFilterTag(filterTag === tag ? '' : tag)}
                >
                  {tag}
                </button>
              ))}
            </div>
          </div>

          <div className="sidebar-stats">
            <div className="stat">
              <span className="stat-n">{notes.length}</span>
              <span className="stat-l">notas</span>
            </div>
            <div className="stat-divider"></div>
            <div className="stat">
              <span className="stat-n">{completedTasks}/{tasks.length}</span>
              <span className="stat-l">tareas</span>
            </div>
          </div>
        </aside>

        {/* Main */}
        <main className="main-content">
          <div className="view-tabs">
            <button className={`tab ${activeView === 'notes' ? 'active' : ''}`} onClick={() => setActiveView('notes')}>
              📝 Notas
            </button>
            <button className={`tab ${activeView === 'tasks' ? 'active' : ''}`} onClick={() => setActiveView('tasks')}>
              ✅ Tareas
              {tasks.filter((t) => !t.completed).length > 0 && (
                <span className="badge">{tasks.filter((t) => !t.completed).length}</span>
              )}
            </button>
            <div className="tabs-right">
              {ws && <span className="ws-breadcrumb">📁 {ws.name}</span>}
              {filterTag && (
                <span className="filter-chip" style={{ '--tc': TAG_COLORS[filterTag] }}>
                  {filterTag} <button onClick={() => setFilterTag('')}>✕</button>
                </span>
              )}
            </div>
          </div>

          {error && <div className="error-bar">{error}</div>}

          {/* ── Vista Notas ── */}
          {activeView === 'notes' && (
            <>
              {!showNoteForm ? (
                <button className="btn-new-note" onClick={() => setShowNoteForm(true)}>
                  + Nueva nota
                </button>
              ) : (
                <div className="note-composer">
                  <div className="composer-header">
                    <input
                      className="composer-title"
                      placeholder="Título de la nota..."
                      value={noteTitle}
                      onChange={(e) => setNoteTitle(e.target.value)}
                      autoFocus
                    />
                    <div className="composer-controls">
                      <select value={noteTag} onChange={(e) => setNoteTag(e.target.value)} className="tag-select-sm">
                        <option value="">Sin etiqueta</option>
                        {TAG_OPTIONS.map((t) => <option key={t} value={t}>{t}</option>)}
                      </select>
                      <button
                        type="button"
                        className={`btn-toggle ${notePreview ? 'active' : ''}`}
                        onClick={() => setNotePreview(!notePreview)}
                      >
                        {notePreview ? '✏️' : '👁'}
                      </button>
                    </div>
                  </div>

                  {!notePreview ? (
                    <>
                      <MarkdownToolbar onInsert={insertMdToNew} />
                      <textarea
                        ref={newNoteTextareaRef}
                        className="composer-editor"
                        value={noteContent}
                        onChange={(e) => setNoteContent(e.target.value)}
                        placeholder="Escribe en **markdown**...&#10;**negrita**, _cursiva_, `código`, # Título"
                        rows={6}
                      />
                    </>
                  ) : (
                    <div className="composer-preview">
                      <ReactMarkdown remarkPlugins={[remarkGfm]}>{noteContent || '_Sin contenido_'}</ReactMarkdown>
                    </div>
                  )}

                  <div className="composer-footer">
                    <button className="btn-cancel" onClick={() => { setShowNoteForm(false); setNotePreview(false); }}>
                      Cancelar
                    </button>
                    <button className="btn-primary" onClick={handleCreateNote} disabled={!noteTitle.trim()}>
                      Crear nota
                    </button>
                  </div>
                </div>
              )}

              <div className="notes-grid">
                {notes.length === 0 ? (
                  <div className="empty-state">
                    {search ? `Sin resultados para "${search}"` : '📝 No hay notas. Crea tu primera nota arriba.'}
                  </div>
                ) : (
                  notes.map((note) => (
                    <NoteCard
                      key={note.id}
                      note={note}
                      onPin={handlePinNote}
                      onEdit={setEditingNote}
                      onDelete={handleDeleteNote}
                    />
                  ))
                )}
              </div>
            </>
          )}

          {/* ── Vista Tareas ── */}
          {activeView === 'tasks' && (
            <>
              <form onSubmit={handleCreateTask} className="task-composer">
                <input
                  className="task-input"
                  placeholder="Agregar tarea... (Enter para confirmar)"
                  value={taskTitle}
                  onChange={(e) => setTaskTitle(e.target.value)}
                  id="task-title"
                />
                <button type="submit" className="btn-primary" id="create-task-btn">Agregar</button>
              </form>

              {tasks.length > 0 && (
                <div className="progress-row">
                  <div className="progress-track">
                    <div className="progress-fill" style={{ width: `${(completedTasks / tasks.length) * 100}%` }}></div>
                  </div>
                  <span className="progress-label">{completedTasks} / {tasks.length}</span>
                </div>
              )}

              <div className="tasks-list">
                {tasks.length === 0 ? (
                  <div className="empty-state">✅ Sin tareas. Agrega la primera arriba.</div>
                ) : (
                  tasks.map((task) => (
                    <div key={task.id} className={`task-row ${task.completed ? 'done' : ''}`}>
                      <button
                        className={`checkbox ${task.completed ? 'checked' : ''}`}
                        onClick={() => handleToggleTask(task)}
                      >
                        {task.completed && '✓'}
                      </button>
                      <span className="task-text">{task.title}</span>
                      <span className="task-date">{new Date(task.created_at).toLocaleDateString('es-ES', { day: '2-digit', month: 'short' })}</span>
                      <button className="btn-delete" onClick={() => handleDeleteTask(task.id)}>✕</button>
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
