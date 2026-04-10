import React, { useState } from 'react';
import { Home, FileText, CheckSquare, CalendarDays, Star, Users, Trash2, Plus, Zap, UserPlus } from 'lucide-react';

const NAV_ITEMS = [
  { id: 'home',      icon: Home,         label: 'Inicio'     },
  { id: 'notes',     icon: FileText,     label: 'Notas'      },
  { id: 'tasks',     icon: CheckSquare,  label: 'Tareas'     },
  { id: 'calendar',  icon: CalendarDays, label: 'Calendario' },
  { id: 'favorites', icon: Star,         label: 'Favoritos'  },
  { id: 'shared',    icon: Users,        label: 'Compartido' },
  { id: 'trash',     icon: Trash2,       label: 'Papelera'   },
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
    <aside className="w-60 min-w-[240px] bg-surface border-r border-border flex flex-col h-full shrink-0 overflow-y-auto">
      
      {/* Header / Workspace Selector Placeholder */}
      <div className="flex items-center gap-3 p-4 border-b border-border">
        <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-primary to-primaryHover flex items-center justify-center text-white shadow-glow shrink-0">
          <Zap className="w-4 h-4 fill-white text-white" />
        </div>
        <div className="flex flex-col min-w-0">
          <span className="text-sm font-bold text-textMain truncate">
            {workspaces.find(w => w.id === activeWorkspace)?.name || 'Workspace'}
          </span>
          <span className="text-[11px] text-textMuted font-medium truncate">
            {userEmail}
          </span>
        </div>
      </div>

      {/* Main Nav */}
      <nav className="flex flex-col px-3 py-4 space-y-0.5">
        {NAV_ITEMS.map(item => {
          const Icon = item.icon;
          const isActive = activeView === item.id;
          return (
            <button 
              key={item.id} 
              className={`flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-all w-full text-left
                ${isActive 
                  ? 'bg-primary/10 text-primaryHover font-semibold' 
                  : 'text-textMuted hover:bg-surfaceHover hover:text-textMain'
                }`}
              onClick={() => onNavigate(item.id)}
            >
              <Icon className={`w-4 h-4 shrink-0 ${isActive ? 'text-primaryHover' : 'text-textMuted/80'}`} />
              <span className="truncate">{item.label}</span>
            </button>
          )
        })}
      </nav>

      <div className="h-px bg-border mx-4 my-2" />

      {/* Workspaces List */}
      <div className="px-3 py-2 flex flex-col pt-3">
        <div className="flex items-center justify-between px-3 mb-2">
          <span className="text-[10px] font-bold text-textMuted uppercase tracking-widest">Espacios</span>
          <button 
            className="text-textMuted hover:text-primary transition-colors p-0.5 rounded-md hover:bg-surfaceHover"
            onClick={() => setShowNewWs(!showNewWs)}
          >
            <Plus className="w-3.5 h-3.5" />
          </button>
        </div>
        
        {showNewWs && (
          <form onSubmit={handleCreateWs} className="flex gap-1 px-2 mb-3">
            <input 
              autoFocus 
              value={newWsName} 
              onChange={e => setNewWsName(e.target.value)} 
              placeholder="Nombre..." 
              className="flex-1 bg-background border border-border rounded-md px-2 py-1.5 text-xs text-textMain outline-none focus:border-primary focus:ring-1 focus:ring-primary/30" 
            />
          </form>
        )}
        
        <ul className="flex flex-col space-y-0.5">
          {workspaces.map(ws => (
            <li 
              key={ws.id} 
              className={`flex items-center gap-2 px-3 py-1.5 rounded-md text-xs font-medium cursor-pointer transition-colors
                ${ws.id === activeWorkspace ? 'bg-primary/10 text-primaryHover' : 'text-textMuted hover:bg-surfaceHover hover:text-textMain'}`} 
              onClick={() => onWorkspaceChange(ws.id)}
            >
              <div className={`w-1.5 h-1.5 rounded-full shrink-0 ${ws.id === activeWorkspace ? 'bg-primaryHover' : 'bg-textMuted/50'}`} />
              <span className="truncate">{ws.name}</span>
            </li>
          ))}
        </ul>
      </div>

      <div className="mt-auto pt-4 pb-4 px-4">
        <button 
          className="flex items-center justify-center gap-2 w-full py-2 px-3 border border-dashed border-border rounded-lg text-xs font-semibold text-textMuted hover:text-primary hover:border-primary transition-colors"
          onClick={() => onNavigate('shared')}
        >
          <UserPlus className="w-3.5 h-3.5" />
          <span>Invitar equipo</span>
        </button>
      </div>
    </aside>
  );
}

export default Sidebar;
