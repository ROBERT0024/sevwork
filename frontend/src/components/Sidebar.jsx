// Sidebar.jsx — Navegación principal tipo Notion
import React, { useState } from 'react';

const NAV_ITEMS = [
  { id: 'home',      icon: '🏠', label: 'Inicio'     },
  { id: 'notes',     icon: '📝', label: 'Notas'      },
  { id: 'tasks',     icon: '✅', label: 'Tareas'     },
  { id: 'calendar',  icon: '📅', label: 'Calendario' },
  { id: 'favorites', icon: '⭐', label: 'Favoritos'  },
  { id: 'shared',    icon: '👥', label: 'Compartido' },
  { id: 'trash',     icon: '🗑', label: 'Papelera'   },
];

function Sidebar({ activeView, onNavigate, workspaces, activeWorkspace, onWorkspaceChange, onCreateWorkspace, userEmail }) {
  const [showNewWs, setShowNewWs] = useState(false);
  const [newWsName, setNewWsName] = useState('');

  const handleCreateWs = (e) => {
    e.preventDefault();
    if (!newWsName.trim()) return;
    onCreateWorkspace(newWsName);
    setNewWsName(''); setShowNewWs(false);
  };

  return (
    <aside className="sidebar">
      <div className="sidebar-workspace-header">
        <div className="workspace-logo">SW</div>
        <div className="workspace-info">
          <span className="workspace-name">{workspaces.find(w => w.id === activeWorkspace)?.name || 'Workspace'}</span>
          <span className="workspace-user">{userEmail}</span>
        </div>
      </div>

      <nav className="sidebar-nav">
        {NAV_ITEMS.map(item => (
          <button key={item.id} className={`nav-item ${activeView === item.id ? 'active' : ''}`} onClick={() => onNavigate(item.id)}>
            <span className="nav-icon">{item.icon}</span>
            <span className="nav-label">{item.label}</span>
          </button>
        ))}
      </nav>

      <div className="sidebar-divider" />

      <div className="sidebar-section">
        <div className="section-header">
          <span>Espacios</span>
          <button className="btn-add" onClick={() => setShowNewWs(v => !v)}>+</button>
        </div>
        {showNewWs && (
          <form onSubmit={handleCreateWs} className="new-ws-form">
            <input autoFocus value={newWsName} onChange={e => setNewWsName(e.target.value)} placeholder="Nombre..." className="new-ws-input" />
            <button type="submit" className="btn-ws-ok">✓</button>
          </form>
        )}
        <ul className="ws-list">
          {workspaces.map(ws => (
            <li key={ws.id} className={`ws-item ${ws.id === activeWorkspace ? 'active' : ''}`} onClick={() => onWorkspaceChange(ws.id)}>
              <span className="ws-dot" /><span className="ws-name">{ws.name}</span>
            </li>
          ))}
        </ul>
      </div>

      <div className="sidebar-divider" />
      <button className="sidebar-invite-btn" onClick={() => onNavigate('shared')}>
        <span>➕</span> Invitar colaboradores
      </button>
    </aside>
  );
}

export default Sidebar;
