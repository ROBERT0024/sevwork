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
import { getWorkspaces, createWorkspace } from './services/api.js';

function TrashView() {
  return <div className="view-empty" style={{paddingTop:80}}><span>🗑</span><p>La papelera está vacía.</p></div>;
}

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
    <div className="app-shell">
      <Sidebar activeView={activeView} onNavigate={handleNavigate}
        workspaces={workspaces} activeWorkspace={activeWs}
        onWorkspaceChange={setActiveWs} onCreateWorkspace={handleCreateWorkspace}
        userEmail={userEmail} />
      <div className="app-main">
        <TopBar activeView={activeView} onSearchOpen={() => setShowSearch(true)}
          onNewNote={() => { setView('notes'); setTriggerNewNote(true); }}
          onNewTask={() => { setView('tasks'); setTriggerNewTask(true); }}
          noteTitle={openNote?.title} />
        <div className="app-content">
          {activeView === 'home'     && <HomeView onNavigate={handleNavigate} onOpenNote={handleOpenNote} activeWorkspace={activeWs} />}
          {activeView === 'notes'    && <NotesView onOpenNote={handleOpenNote} activeWorkspace={activeWs} showNewForm={triggerNewNote} onFormShown={() => setTriggerNewNote(false)} />}
          {activeView === 'editor'   && openNote && <NoteEditorView note={openNote} onBack={handleBackEditor} />}
          {activeView === 'tasks'    && <TasksView activeWorkspace={activeWs} showNewForm={triggerNewTask} onFormShown={() => setTriggerNewTask(false)} />}
          {activeView === 'calendar' && <CalendarView activeWorkspace={activeWs} />}
          {activeView === 'favorites'&& <FavoritesView activeWorkspace={activeWs} onOpenNote={handleOpenNote} />}
          {activeView === 'shared'   && <SharedView />}
          {activeView === 'trash'    && <TrashView />}
        </div>
      </div>
      {showSearch && <SearchModal onClose={() => setShowSearch(false)}
        onOpenNote={(n) => { handleOpenNote(n); setShowSearch(false); }}
        onNavigate={(v) => { handleNavigate(v); setShowSearch(false); }} />}
    </div>
  );
}

export default MainLayout;
