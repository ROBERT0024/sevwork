// FavoritesView.jsx — Notas y Tareas favoritas (Rediseño Tailwind)
import React, { useEffect, useState, useCallback } from 'react';
import { getNotes, getTasks, updateNote, updateTask } from '../services/api.js';
import { Star, FileText, CheckSquare, Pin } from 'lucide-react';
import { tagBadgeClass, getTagClasses } from '../utils/tagColors.js';

const PRIORITY_COLOR = { high: 'text-red-400', medium: 'text-amber-400', low: 'text-emerald-400' };
const PRIORITY_LABEL = { high: 'Crítica', medium: 'Media', low: 'Baja' };

function FavoritesView({ activeWorkspace, onOpenNote }) {
  const [notes, setNotes] = useState([]);
  const [tasks, setTasks] = useState([]);

  const load = useCallback(() => {
    if (!activeWorkspace) return;
    getNotes(activeWorkspace).then(r => setNotes(r.data.filter(n => n.is_pinned && !n.is_deleted))).catch(() => {});
    getTasks(activeWorkspace).then(r => setTasks(r.data.filter(t => t.is_pinned && !t.is_deleted))).catch(() => {});
  }, [activeWorkspace]);

  useEffect(() => { load(); }, [load]);

  const handleUnpinNote = async (note, e) => {
    e.stopPropagation();
    await updateNote(note.id, { is_pinned: false });
    load();
  };

  const handleUnpinTask = async (task, e) => {
    e.stopPropagation();
    await updateTask(task.id, { is_pinned: false });
    load();
  };

  const total = notes.length + tasks.length;

  return (
    <div className="p-8 sm:p-12 max-w-5xl mx-auto h-full flex flex-col animate-fade-in-up">
      {/* Header */}
      <div className="flex items-center gap-4 mb-8 border-b border-border pb-6">
        <Star className="w-8 h-8 text-warning fill-warning" />
        <div>
          <h2 className="text-2xl font-bold text-textMain tracking-tight">Favoritos</h2>
          <p className="text-sm text-textMuted mt-1">
            {total === 0 ? 'Aún no tienes favoritos.' : `${total} elemento${total !== 1 ? 's' : ''} marcado${total !== 1 ? 's' : ''} como favorito`}
          </p>
        </div>
      </div>

      {total === 0 && (
        <div className="flex-1 flex flex-col items-center justify-center text-center text-textMuted opacity-60 gap-4">
          <Star className="w-16 h-16 text-warning/30" />
          <div>
            <p className="text-lg font-bold text-textMain">No tienes favoritos aún</p>
            <p className="text-sm mt-1">Pulsa la estrella ⭐ en cualquier nota o tarea para añadirla aquí.</p>
          </div>
        </div>
      )}

      {/* Notas Favoritas */}
      {notes.length > 0 && (
        <div className="mb-10">
          <h3 className="text-xs font-bold text-textMuted uppercase tracking-widest mb-4 flex items-center gap-2">
            <FileText className="w-4 h-4" /> Notas favoritas ({notes.length})
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {notes.map(note => (
              <div
                key={note.id}
                className="bg-surface border border-warning/20 hover:border-warning/60 rounded-xl p-5 cursor-pointer transition-all hover:shadow-[0_0_15px_rgba(251,191,36,0.1)] group relative"
                onClick={() => onOpenNote(note)}
              >
                <div className="flex justify-between items-start mb-3">
                  <Star className="w-4 h-4 text-warning fill-warning shrink-0" />
                  <button
                    onClick={e => handleUnpinNote(note, e)}
                    className="opacity-0 group-hover:opacity-100 transition-opacity p-1 rounded hover:bg-warning/10 text-textMuted hover:text-warning text-xs font-bold"
                    title="Quitar de favoritos"
                  >
                    Quitar
                  </button>
                </div>
                <h4 className="text-sm font-bold text-textMain mb-2 truncate">{note.title}</h4>
                <p className="text-xs text-textMuted line-clamp-2 leading-relaxed mb-3">
                  {note.content || 'Sin contenido...'}
                </p>
                <div className="flex items-center justify-between">
                  {note.tag
                    ? <span className={tagBadgeClass(note.tag)}><span className={`w-1.5 h-1.5 rounded-full ${getTagClasses(note.tag).dot}`}/>{note.tag}</span>
                    : <span />
                  }
                  <span className="text-[10px] text-textMuted/60">
                    {new Date(note.updated_at).toLocaleDateString('es-ES', { day:'2-digit', month:'short' })}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Tareas Favoritas */}
      {tasks.length > 0 && (
        <div>
          <h3 className="text-xs font-bold text-textMuted uppercase tracking-widest mb-4 flex items-center gap-2">
            <CheckSquare className="w-4 h-4" /> Tareas favoritas ({tasks.length})
          </h3>
          <div className="flex flex-col gap-3">
            {tasks.map(task => (
              <div
                key={task.id}
                className="flex items-center gap-4 bg-surface border border-warning/20 hover:border-warning/60 rounded-xl p-4 transition-all group"
              >
                <Star className="w-4 h-4 text-warning fill-warning shrink-0" />
                <div className="flex-1 min-w-0">
                  <span className={`text-sm font-bold ${task.completed ? 'line-through text-textMuted' : 'text-textMain'}`}>
                    {task.title}
                  </span>
                  {task.description && (
                    <p className="text-xs text-textMuted truncate mt-0.5">{task.description}</p>
                  )}
                  <span className={`text-[10px] font-bold uppercase tracking-wider ${PRIORITY_COLOR[task.priority] || 'text-textMuted'}`}>
                    {PRIORITY_LABEL[task.priority] || task.priority}
                  </span>
                </div>
                <button
                  onClick={e => handleUnpinTask(task, e)}
                  className="opacity-0 group-hover:opacity-100 transition-opacity text-xs font-bold text-textMuted hover:text-warning px-2 py-1 rounded hover:bg-warning/10"
                  title="Quitar de favoritos"
                >
                  Quitar
                </button>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

export default FavoritesView;
