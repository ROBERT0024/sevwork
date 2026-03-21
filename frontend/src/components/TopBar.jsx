// TopBar.jsx — Barra superior contextual
import React from 'react';

const VIEW_TITLES = {
  home:'🏠', notes:'📝', tasks:'✅', calendar:'📅',
  favorites:'⭐', shared:'👥', trash:'🗑', editor:'📄',
};
const VIEW_NAMES = {
  home:'Inicio', notes:'Notas', tasks:'Tareas', calendar:'Calendario',
  favorites:'Favoritos', shared:'Compartido', trash:'Papelera', editor:'Nota',
};

function TopBar({ activeView, onSearchOpen, onNewNote, onNewTask, noteTitle }) {
  const icon  = VIEW_TITLES[activeView] || '🏠';
  const title = activeView === 'editor' && noteTitle ? noteTitle : (VIEW_NAMES[activeView] || 'Inicio');

  return (
    <header className="topbar">
      <div className="topbar-left">
        <span className="topbar-icon">{icon}</span>
        <h1 className="topbar-title">{title}</h1>
      </div>
      <div className="topbar-center">
        <button className="search-trigger" onClick={onSearchOpen}>
          <span className="search-trigger-icon">🔍</span>
          <span className="search-trigger-text">Buscar...</span>
          <kbd className="search-kbd">Ctrl K</kbd>
        </button>
      </div>
      <div className="topbar-right">
        {activeView === 'notes' && <button className="btn-topbar-action" onClick={onNewNote}>+ Nueva nota</button>}
        {activeView === 'tasks' && <button className="btn-topbar-action" onClick={onNewTask}>+ Nueva tarea</button>}
        <button className="btn-logout-top" onClick={() => { localStorage.clear(); window.location.href = '/'; }}>Salir</button>
      </div>
    </header>
  );
}

export default TopBar;
