// FavoritesView.jsx — Notas fijadas
import React, { useEffect, useState } from 'react';
import { getNotes, updateNote, deleteNote } from '../services/api.js';

const TAG_COLORS = { trabajo:'#6366f1', personal:'#10b981', ideas:'#f59e0b', urgente:'#ef4444', estudio:'#3b82f6' };

function FavoritesView({ activeWorkspace, onOpenNote }) {
  const [notes, setNotes] = useState([]);

  const load = () => {
    if (!activeWorkspace) return;
    getNotes(activeWorkspace).then(r => setNotes(r.data.filter(n => n.is_pinned))).catch(() => {});
  };

  useEffect(() => { load(); }, [activeWorkspace]);

  const handleUnpin = async (note, e) => {
    e.stopPropagation();
    await updateNote(note.id, { is_pinned: false });
    load();
  };
  const handleDelete = async (id, e) => {
    e.stopPropagation();
    if (!window.confirm('¿Eliminar nota favorita?')) return;
    await deleteNote(id);
    setNotes(p => p.filter(n => n.id !== id));
  };

  return (
    <div className="view-favorites">
      {notes.length === 0 ? (
        <div className="view-empty"><span>⭐</span><p>No tienes favoritos aún.<br/>Fija una nota con el ícono 📌 desde Notas.</p></div>
      ) : (
        <>
          <p className="fav-count">{notes.length} nota{notes.length !== 1 ? 's' : ''} fijada{notes.length !== 1 ? 's' : ''}</p>
          <div className="fav-grid">
            {notes.map(note => (
              <div key={note.id} className="fav-card" onClick={() => onOpenNote(note)}>
                <div className="fav-card-header">
                  <span className="fav-icon">📌</span>
                  <h3>{note.title}</h3>
                  <div className="fav-actions">
                    <button title="Desfijar" onClick={e => handleUnpin(note, e)} className="fav-action-btn">📍</button>
                    <button title="Eliminar" onClick={e => handleDelete(note.id, e)} className="fav-action-btn danger">🗑</button>
                  </div>
                </div>
                {note.tag && <span className="note-tag-inline" style={{ background: TAG_COLORS[note.tag] || '#475569' }}>{note.tag}</span>}
                <p className="fav-preview">{note.content?.slice(0, 120) || 'Sin contenido...'}</p>
                <span className="fav-date">{new Date(note.updated_at).toLocaleDateString('es-ES', { day:'2-digit', month:'short', year:'2-digit' })}</span>
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  );
}

export default FavoritesView;
