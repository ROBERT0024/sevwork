// MainLayout.jsx — Shell: sidebar + topbar + vista activa
import React, { useState, useEffect } from 'react';
import Sidebar       from './components/Sidebar.jsx';
import TopBar        from './components/TopBar.jsx';
import SearchModal   from './components/SearchModal.jsx';
import HomeView      from './views/HomeView.jsx';
import NotesView     from './views/NotesView.jsx';
import NoteEditorView from './views/NoteEditorView.jsx';
import TasksView     from './views/TasksView.jsx';
import CalendarView  from './views/CalendarView.jsx';
import FavoritesView from './views/FavoritesView.jsx';
import SharedView    from './views/SharedView.jsx';
import TrashView     from './views/TrashView.jsx';
import { getWorkspaces, createWorkspace } from './services/api.js';


function MainLayout() {
  const [view, setView]           = useState('home');
  const [openNote, setOpenNote]   = useState(null);
  const [workspaces, setWorkspaces] = useState([]);
  const [activeWs, setActiveWs]   = useState(null);
  const [showSearch, setShowSearch] = useState(false);
  const [triggerNewNote, setTriggerNewNote] = useState(false);
  const [triggerNewTask, setTriggerNewTask] = useState(false);
  const userEmail = localStorage.getItem('user_email') || 'usuario@workspace';

  useEffect(() => {
    const handler = (e) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 'k') { e.preventDefault(); setShowSearch(true); }
      if (e.key === 'Escape') setShowSearch(false);
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, []);

  useEffect(() => {
    getWorkspaces().then(async res => {
      let ws = res.data;
      if (ws.length === 0) {
        const c = await createWorkspace('Mi Espacio', 'Espacio principal');
        ws = [c.data];
      }
      setWorkspaces(ws);
      setActiveWs(ws[0].id);
    }).catch(() => {});
  }, []);

  const handleCreateWorkspace = async (name) => {
    try { const res = await createWorkspace(name); setWorkspaces(p => [...p, res.data]); setActiveWs(res.data.id); }
    catch { /* ignore */ }
  };

  const handleOpenNote    = (note) => { setOpenNote(note); setView('editor'); };
  const handleBackEditor  = ()     => { setOpenNote(null); setView('notes'); };
  const handleNavigate    = (v)    => { if (v !== 'editor') setOpenNote(null); setView(v); };
  const activeView = openNote ? 'editor' : view;

  return (
    <div className="flex h-screen bg-background overflow-hidden selection:bg-primary/30">
      <Sidebar activeView={activeView} onNavigate={handleNavigate}
        workspaces={workspaces} activeWorkspace={activeWs}
        onWorkspaceChange={setActiveWs} onCreateWorkspace={handleCreateWorkspace}
        userEmail={userEmail} />
      
      <div className="flex flex-col flex-1 overflow-hidden bg-background">
        <TopBar activeView={activeView} onSearchOpen={() => setShowSearch(true)}
          onNewNote={() => { setView('notes'); setTriggerNewNote(true); }}
          onNewTask={() => { setView('tasks'); setTriggerNewTask(true); }}
          noteTitle={openNote?.title} />
        
        <main className="flex-1 overflow-y-auto w-full relative">
          {activeView === 'home'     && <HomeView onNavigate={handleNavigate} onOpenNote={handleOpenNote} activeWorkspace={activeWs} />}
          {activeView === 'notes'    && <NotesView onOpenNote={handleOpenNote} activeWorkspace={activeWs} showNewForm={triggerNewNote} onFormShown={() => setTriggerNewNote(false)} />}
          {activeView === 'editor'   && openNote && <NoteEditorView note={openNote} onBack={handleBackEditor} />}
          {activeView === 'tasks'    && <TasksView activeWorkspace={activeWs} showNewForm={triggerNewTask} onFormShown={() => setTriggerNewTask(false)} />}
          {activeView === 'calendar' && <CalendarView activeWorkspace={activeWs} />}
          {activeView === 'favorites'&& <FavoritesView activeWorkspace={activeWs} onOpenNote={handleOpenNote} />}
          {activeView === 'shared'   && <SharedView />}
          {activeView === 'trash'    && <TrashView activeWorkspace={activeWs} />}
        </main>
      </div>
      
      {showSearch && <SearchModal onClose={() => setShowSearch(false)}
        onOpenNote={(n) => { handleOpenNote(n); setShowSearch(false); }}
        onNavigate={(v) => { handleNavigate(v); setShowSearch(false); }} />}
    </div>
  );
}

export default MainLayout;
