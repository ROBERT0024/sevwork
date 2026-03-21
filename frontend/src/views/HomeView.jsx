// HomeView.jsx
import React, { useEffect, useState } from 'react';
import { getNotes, getTasks } from '../services/api.js';

function HomeView({ onNavigate, onOpenNote, activeWorkspace }) {
  const [notes, setNotes] = useState([]);
  const [tasks, setTasks] = useState([]);

  useEffect(() => {
    if (!activeWorkspace) return;
    getNotes(activeWorkspace).then(r => setNotes(r.data.slice(0, 6))).catch(() => {});
    getTasks(activeWorkspace).then(r => setTasks(r.data)).catch(() => {});
  }, [activeWorkspace]);

  const completed = tasks.filter(t => t.completed).length;
  const pending   = tasks.filter(t => !t.completed).length;
  const pinned    = notes.filter(n => n.is_pinned).length;
  const progress  = tasks.length ? Math.round((completed / tasks.length) * 100) : 0;
  const hour      = new Date().getHours();
  const greeting  = hour < 12 ? 'Buenos días' : hour < 18 ? 'Buenas tardes' : 'Buenas noches';

  return (
    <div className="view-home">
      <div className="home-hero">
        <h1 className="home-greeting">{greeting} 👋</h1>
        <p className="home-sub">Tu espacio de trabajo seguro y organizado.</p>
      </div>
      <div className="home-stats">
        <div className="stat-card" onClick={() => onNavigate('notes')}><div className="stat-card-icon">📝</div><div className="stat-card-num">{notes.length}</div><div className="stat-card-label">Notas</div></div>
        <div className="stat-card" onClick={() => onNavigate('tasks')}><div className="stat-card-icon">✅</div><div className="stat-card-num">{completed}/{tasks.length}</div><div className="stat-card-label">Tareas completadas</div></div>
        <div className="stat-card" onClick={() => onNavigate('favorites')}><div className="stat-card-icon">⭐</div><div className="stat-card-num">{pinned}</div><div className="stat-card-label">Favoritos</div></div>
        <div className="stat-card" onClick={() => onNavigate('tasks')}><div className="stat-card-icon">⏳</div><div className="stat-card-num">{pending}</div><div className="stat-card-label">Pendientes</div></div>
      </div>
      {tasks.length > 0 && (
        <div className="home-progress-block">
          <div className="home-progress-header"><span>Progreso de tareas</span><span className="progress-pct">{progress}%</span></div>
          <div className="home-progress-track"><div className="home-progress-fill" style={{ width: `${progress}%` }} /></div>
        </div>
      )}
      <div className="home-section">
        <div className="home-section-header"><h2>Notas recientes</h2><button className="link-btn" onClick={() => onNavigate('notes')}>Ver todas →</button></div>
        <div className="home-notes-grid">
          {notes.length === 0 ? (
            <div className="home-empty" onClick={() => onNavigate('notes')}><span>📝</span><p>No hay notas aún.<br/><strong>Crea la primera →</strong></p></div>
          ) : notes.map(note => (
            <div key={note.id} className="home-note-card" onClick={() => onOpenNote(note)}>
              {note.is_pinned && <span className="home-pin">📌</span>}
              <h3>{note.title}</h3>
              <p>{note.content?.slice(0, 80)}{note.content?.length > 80 ? '...' : ''}</p>
              {note.tag && <span className="home-tag">{note.tag}</span>}
            </div>
          ))}
        </div>
      </div>
      <div className="home-section">
        <h2>Acciones rápidas</h2>
        <div className="quick-actions">
          <button className="quick-action-btn" onClick={() => onNavigate('notes')}><span>📝</span> Nueva nota</button>
          <button className="quick-action-btn" onClick={() => onNavigate('tasks')}><span>✅</span> Nueva tarea</button>
          <button className="quick-action-btn" onClick={() => onNavigate('calendar')}><span>📅</span> Ver calendario</button>
          <button className="quick-action-btn" onClick={() => onNavigate('shared')}><span>👥</span> Invitar colaborador</button>
        </div>
      </div>
    </div>
  );
}

export default HomeView;
