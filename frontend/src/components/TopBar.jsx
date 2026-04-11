import React, { useState, useEffect } from 'react';
import { Home, FileText, CheckSquare, CalendarDays, Star, Users, Trash2, Search, Plus, LogOut, FileEdit, Sun, Moon } from 'lucide-react';

const VIEW_TITLES = {
  home: Home, notes: FileText, tasks: CheckSquare, calendar: CalendarDays,
  favorites: Star, shared: Users, trash: Trash2, editor: FileEdit,
};

const VIEW_NAMES = {
  home:'Inicio', notes:'Notas', tasks:'Tareas', calendar:'Calendario',
  favorites:'Favoritos', shared:'Compartido', trash:'Papelera', editor:'Nota',
};

function TopBar({ activeView, onSearchOpen, onNewNote, onNewTask, noteTitle }) {
  const Icon  = VIEW_TITLES[activeView] || Home;
  const title = activeView === 'editor' && noteTitle ? noteTitle : (VIEW_NAMES[activeView] || 'Inicio');

  const [isDark, setIsDark] = useState(document.documentElement.classList.contains('dark'));

  const toggleTheme = () => {
    const newTheme = !isDark;
    setIsDark(newTheme);
    if (newTheme) {
      document.documentElement.classList.add('dark');
      localStorage.setItem('theme', 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('theme', 'light');
    }
  };

  return (
    <header className="h-14 bg-surface/50 backdrop-blur-md border-b border-border flex items-center justify-between px-6 shrink-0 sticky top-0 z-10 w-full">
      <div className="flex items-center gap-3 shrink-0">
        <Icon className="w-5 h-5 text-primaryHover" />
        <h1 className="text-sm font-bold text-textMain tracking-wide">{title}</h1>
      </div>
      
      <div className="flex-1 flex justify-center px-4">
        <button 
          className="flex items-center gap-2 bg-background border border-border hover:border-border/80 rounded-full px-4 py-1.5 min-w-[240px] max-w-[360px] w-full text-textMuted transition-all group"
          onClick={onSearchOpen}
        >
          <Search className="w-3.5 h-3.5 group-hover:text-primary transition-colors" />
          <span className="text-[13px] flex-1 text-left">Buscar...</span>
          <kbd className="hidden sm:inline-block text-[10px] bg-surface font-semibold px-1.5 py-0.5 rounded border border-border/50 text-textMuted/80">Ctrl K</kbd>
        </button>
      </div>

      <div className="flex items-center gap-3 shrink-0">
        {activeView === 'notes' && (
          <button 
            className="hidden sm:flex items-center gap-1.5 bg-primary hover:bg-primaryHover text-white text-xs font-bold px-3 py-1.5 rounded-lg transition-colors shadow-sm"
            onClick={onNewNote}
          >
            <Plus className="w-3.5 h-3.5" /> Nueva nota
          </button>
        )}
        {activeView === 'tasks' && (
          <button 
            className="hidden sm:flex items-center gap-1.5 bg-primary hover:bg-primaryHover text-white text-xs font-bold px-3 py-1.5 rounded-lg transition-colors shadow-sm"
            onClick={onNewTask}
          >
            <Plus className="w-3.5 h-3.5" /> Nueva tarea
          </button>
        )}
        <button 
          className="flex items-center justify-center bg-transparent border border-border hover:bg-surface hover:text-primary p-2 rounded-lg transition-all"
          onClick={toggleTheme}
          title={isDark ? "Cambiar a modo claro" : "Cambiar a modo oscuro"}
        >
          {isDark ? <Sun className="w-3.5 h-3.5" /> : <Moon className="w-3.5 h-3.5" />}
        </button>

        <button 
          className="flex items-center gap-1.5 bg-transparent border border-border hover:bg-surface hover:text-danger hover:border-danger/50 text-textMuted px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ml-1"
          onClick={() => { localStorage.clear(); window.location.href = '/'; }}
        >
          <LogOut className="w-3.5 h-3.5" /> <span className="hidden sm:inline">Salir</span>
        </button>
      </div>
    </header>
  );
}

export default TopBar;
