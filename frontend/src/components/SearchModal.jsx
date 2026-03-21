// SearchModal.jsx — Búsqueda global Ctrl+K
import React, { useState, useEffect, useRef } from 'react';
import { getNotes, getTasks } from '../services/api.js';

function SearchModal({ onClose, onOpenNote, onNavigate }) {
  const [query,   setQuery]   = useState('');
  const [notes,   setNotes]   = useState([]);
  const [tasks,   setTasks]   = useState([]);
  const [loading, setLoading] = useState(false);
  const inputRef = useRef(null);

  useEffect(() => { inputRef.current?.focus(); }, []);

  useEffect(() => {
    if (!query.trim()) { setNotes([]); setTasks([]); return; }
    const t = setTimeout(async () => {
      setLoading(true);
      try {
        const [nr, tr] = await Promise.all([getNotes(null, query), getTasks()]);
        setNotes(nr.data.slice(0, 5));
        setTasks(tr.data.filter(t => t.title.toLowerCase().includes(query.toLowerCase())).slice(0, 5));
      } catch { /* ignore */ }
      setLoading(false);
    }, 300);
    return () => clearTimeout(t);
  }, [query]);

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="search-modal" onClick={e => e.stopPropagation()} onKeyDown={e => e.key === 'Escape' && onClose()}>
        <div className="search-modal-input-row">
          <span className="sm-icon">🔍</span>
          <input ref={inputRef} className="search-modal-input" placeholder="Buscar notas, tareas..." value={query} onChange={e => setQuery(e.target.value)} />
          {loading && <span className="sm-loading">...</span>}
          <kbd className="sm-esc" onClick={onClose}>Esc</kbd>
        </div>

        {query ? (
          <div className="search-results">
            {notes.length === 0 && tasks.length === 0 && !loading && <div className="search-empty">Sin resultados para "{query}"</div>}
            {notes.length > 0 && (
              <div className="result-group">
                <div className="result-group-label">📝 Notas</div>
                {notes.map(n => (
                  <button key={n.id} className="result-item" onClick={() => { onOpenNote(n); onClose(); }}>
                    <span className="result-icon">📄</span>
                    <div className="result-text">
                      <span className="result-title">{n.title}</span>
                      <span className="result-sub">{n.tag || 'sin etiqueta'}</span>
                    </div>
                  </button>
                ))}
              </div>
            )}
            {tasks.length > 0 && (
              <div className="result-group">
                <div className="result-group-label">✅ Tareas</div>
                {tasks.map(t => (
                  <button key={t.id} className="result-item" onClick={() => { onNavigate('tasks'); onClose(); }}>
                    <span className="result-icon">{t.completed ? '✓' : '○'}</span>
                    <div className="result-text">
                      <span className="result-title">{t.title}</span>
                      <span className="result-sub">{t.priority} · {t.completed ? 'completada' : 'pendiente'}</span>
                    </div>
                  </button>
                ))}
              </div>
            )}
          </div>
        ) : (
          <div className="search-hints">
            <div className="hint-item" onClick={() => { onNavigate('notes'); onClose(); }}>📝 Ver todas las notas</div>
            <div className="hint-item" onClick={() => { onNavigate('tasks'); onClose(); }}>✅ Ver todas las tareas</div>
            <div className="hint-item" onClick={() => { onNavigate('calendar'); onClose(); }}>📅 Ir al calendario</div>
          </div>
        )}
      </div>
    </div>
  );
}

export default SearchModal;
