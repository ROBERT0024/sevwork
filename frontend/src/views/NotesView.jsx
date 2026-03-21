// NotesView.jsx — Lista de notas como páginas
import React, { useState, useEffect, useCallback } from 'react';
import { getNotes, createNote, deleteNote, updateNote } from '../services/api.js';

const TAG_COLORS = { trabajo:'#6366f1', personal:'#10b981', ideas:'#f59e0b', urgente:'#ef4444', estudio:'#3b82f6' };
const TAG_OPTIONS = ['trabajo', 'personal', 'ideas', 'urgente', 'estudio'];

function NotesView({ activeWorkspace, onOpenNote, showNewForm, onFormShown }) {
  const [notes, setNotes]         = useState([]);
  const [search, setSearch]       = useState('');
  const [filterTag, setFilterTag] = useState('');
  const [showForm, setShowForm]   = useState(false);
  const [title, setTitle]         = useState('');
  const [tag, setTag]             = useState('');
  const [error, setError]         = useState('');

  useEffect(() => { if (showNewForm) { setShowForm(true); onFormShown?.(); } }, [showNewForm]);

  const load = useCallback(() => {
    if (!activeWorkspace) return;
    getNotes(activeWorkspace, search, filterTag).then(r => setNotes(r.data)).catch(() => setError('Error al cargar notas'));
  }, [activeWorkspace, search, filterTag]);

  useEffect(() => { load(); }, [load]);
  useEffect(() => { const t = setTimeout(load, 350); return () => clearTimeout(t); }, [search]);

  const handleCreate = async (e) => {
    e.preventDefault();
    if (!title.trim()) return;
    try { const res = await createNote(title, '', activeWorkspace, tag); setTitle(''); setTag(''); setShowForm(false); onOpenNote(res.data); }
    catch { setError('Error al crear nota'); }
  };
  const handlePin = async (note, e) => {
    e.stopPropagation();
    try { await updateNote(note.id, { is_pinned: !note.is_pinned }); load(); }
    catch { setError('Error al fijar nota'); }
  };
  const handleDelete = async (id, e) => {
    e.stopPropagation();
    if (!window.confirm('¿Eliminar esta nota?')) return;
    try { await deleteNote(id); setNotes(p => p.filter(n => n.id !== id)); }
    catch { setError('Error al eliminar nota'); }
  };

  return (
    <div className="view-notes">
      <div className="notes-toolbar">
        <div className="notes-search-wrap">
          <span className="ns-icon">🔍</span>
          <input className="notes-search" placeholder="Buscar notas..." value={search} onChange={e => setSearch(e.target.value)} />
        </div>
        <div className="notes-tags-filter">
          {TAG_OPTIONS.map(t => (
            <button key={t} className={`tag-filter-btn ${filterTag === t ? 'active' : ''}`}
              style={{ '--tc': TAG_COLORS[t] }} onClick={() => setFilterTag(filterTag === t ? '' : t)}>{t}</button>
          ))}
        </div>
      </div>
      {error && <div className="error-bar">{error}</div>}
      {showForm && (
        <form onSubmit={handleCreate} className="quick-note-form">
          <input autoFocus className="quick-note-title" placeholder="Título de la nota..." value={title} onChange={e => setTitle(e.target.value)} id="note-title" />
          <div className="quick-note-row">
            <select value={tag} onChange={e => setTag(e.target.value)} className="tag-select-sm">
              <option value="">Sin etiqueta</option>
              {TAG_OPTIONS.map(t => <option key={t} value={t}>{t}</option>)}
            </select>
            <button type="submit" className="btn-primary-sm" id="create-note-btn">Crear</button>
            <button type="button" className="btn-cancel-sm" onClick={() => setShowForm(false)}>✕</button>
          </div>
        </form>
      )}
      <div className="notes-page-list">
        {notes.length === 0 ? (
          <div className="view-empty"><span>📝</span><p>{search ? `Sin resultados para "${search}"` : 'No hay notas. Crea la primera con el botón de arriba.'}</p></div>
        ) : notes.map(note => (
          <div key={note.id} className={`note-page-row ${note.is_pinned ? 'pinned' : ''}`} onClick={() => onOpenNote(note)}>
            <div className="note-page-left">
              <span className="note-page-emoji">📄</span>
              <div className="note-page-info">
                <div className="note-page-title-row">
                  {note.is_pinned && <span className="note-pin-indicator">📌</span>}
                  <span className="note-page-title">{note.title}</span>
                  {note.tag && <span className="note-tag-inline" style={{ background: TAG_COLORS[note.tag] || '#475569' }}>{note.tag}</span>}
                </div>
                <span className="note-page-preview">{note.content?.slice(0, 100) || 'Sin contenido...'}</span>
              </div>
            </div>
            <div className="note-page-right">
              <span className="note-page-date">{new Date(note.updated_at).toLocaleDateString('es-ES', { day:'2-digit', month:'short', year:'2-digit' })}</span>
              <button className="note-action-btn" onClick={e => handlePin(note, e)} title="Fijar">{note.is_pinned ? '📌' : '📍'}</button>
              <button className="note-action-btn danger" onClick={e => handleDelete(note.id, e)} title="Eliminar">🗑</button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default NotesView;
