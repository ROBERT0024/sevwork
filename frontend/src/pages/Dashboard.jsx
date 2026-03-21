// Página de Dashboard — Secure Workspace
// Gestión de notas: crear, listar y eliminar

import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  getNotes,
  createNote,
  deleteNote,
  getWorkspaces,
  createWorkspace,
} from '../services/api.js';

function Dashboard() {
  const [notes, setNotes] = useState([]);
  const [workspaces, setWorkspaces] = useState([]);
  const [activeWorkspace, setActiveWorkspace] = useState(null);
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  // Cargar workspaces al montar el componente
  useEffect(() => {
    loadWorkspaces();
  }, []);

  // Cargar notas cuando cambia el workspace activo
  useEffect(() => {
    if (activeWorkspace) {
      loadNotes();
    }
  }, [activeWorkspace]);

  const loadWorkspaces = async () => {
    try {
      const res = await getWorkspaces();
      setWorkspaces(res.data);
      // Si no hay workspaces, crear uno por defecto
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

  const loadNotes = async () => {
    try {
      const res = await getNotes(activeWorkspace);
      setNotes(res.data);
    } catch {
      setError('Error al cargar notas');
    }
  };

  const handleCreateNote = async (e) => {
    e.preventDefault();
    if (!title.trim()) return;
    setError('');

    try {
      await createNote(title, content, activeWorkspace);
      setTitle('');
      setContent('');
      loadNotes();
    } catch {
      setError('Error al crear la nota');
    }
  };

  const handleDeleteNote = async (noteId) => {
    try {
      await deleteNote(noteId);
      setNotes(notes.filter((n) => n.id !== noteId));
    } catch {
      setError('Error al eliminar la nota');
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('access_token');
    localStorage.removeItem('refresh_token');
    navigate('/');
  };

  if (loading) {
    return (
      <div className="dashboard-container">
        <div className="loading">Cargando...</div>
      </div>
    );
  }

  return (
    <div className="dashboard-container">
      {/* Barra superior */}
      <header className="dashboard-header">
        <div className="header-left">
          <span className="logo-small">🔒</span>
          <h1>Secure Workspace</h1>
        </div>
        <button className="btn-logout" onClick={handleLogout}>
          Cerrar sesión
        </button>
      </header>

      <div className="dashboard-content">
        {/* Panel lateral — Workspaces */}
        <aside className="sidebar">
          <h2>Espacios de Trabajo</h2>
          <ul className="workspace-list">
            {workspaces.map((ws) => (
              <li
                key={ws.id}
                className={ws.id === activeWorkspace ? 'active' : ''}
                onClick={() => setActiveWorkspace(ws.id)}
              >
                📁 {ws.name}
              </li>
            ))}
          </ul>
        </aside>

        {/* Área principal — Notas */}
        <main className="main-content">
          {/* Formulario para crear nota */}
          <div className="create-note-card">
            <h2>Nueva Nota</h2>
            <form onSubmit={handleCreateNote}>
              <input
                type="text"
                placeholder="Título de la nota"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                required
                id="note-title"
              />
              <textarea
                placeholder="Escribe el contenido de tu nota..."
                value={content}
                onChange={(e) => setContent(e.target.value)}
                rows={3}
                id="note-content"
              />
              <button type="submit" className="btn-primary">
                Crear nota
              </button>
            </form>
          </div>

          {error && <div className="error-message">{error}</div>}

          {/* Lista de notas */}
          <div className="notes-list">
            {notes.length === 0 ? (
              <div className="empty-state">
                <p>📝 No hay notas aún. ¡Crea tu primera nota!</p>
              </div>
            ) : (
              notes.map((note) => (
                <div key={note.id} className="note-card">
                  <div className="note-header">
                    <h3>{note.title}</h3>
                    <button
                      className="btn-delete"
                      onClick={() => handleDeleteNote(note.id)}
                      title="Eliminar nota"
                    >
                      ✕
                    </button>
                  </div>
                  <p className="note-content">{note.content}</p>
                  <div className="note-meta">
                    <span>📊 {note.word_count} palabras</span>
                    <span>{new Date(note.created_at).toLocaleDateString('es-ES')}</span>
                  </div>
                </div>
              ))
            )}
          </div>
        </main>
      </div>
    </div>
  );
}

export default Dashboard;
