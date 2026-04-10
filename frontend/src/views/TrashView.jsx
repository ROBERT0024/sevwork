// TrashView.jsx
import React, { useState, useEffect, useCallback } from 'react';
import { getNotes, getTasks, updateNote, updateTask, deleteNote, deleteTask } from '../services/api.js';
import { Trash2, RotateCcw, XCircle, FileText, CheckSquare } from 'lucide-react';
import toast from 'react-hot-toast';

function TrashView({ activeWorkspace }) {
  const [deletedNotes, setDeletedNotes] = useState([]);
  const [deletedTasks, setDeletedTasks] = useState([]);

  const load = useCallback(async () => {
    if (!activeWorkspace) return;
    try {
      const [notesRes, tasksRes] = await Promise.all([
        getNotes(activeWorkspace, '', '', true),
        getTasks(activeWorkspace, true)
      ]);
      setDeletedNotes(notesRes.data);
      setDeletedTasks(tasksRes.data);
    } catch {
      toast.error('Error al cargar la papelera');
    }
  }, [activeWorkspace]);

  useEffect(() => { load(); }, [load]);

  const handleRestoreNote = async (id) => {
    try { await updateNote(id, { is_deleted: false }); load(); toast.success('Nota restaurada'); }
    catch { toast.error('Error al restaurar nota'); }
  };

  const handleRestoreTask = async (id) => {
    try { await updateTask(id, { is_deleted: false }); load(); toast.success('Tarea restaurada'); }
    catch { toast.error('Error al restaurar tarea'); }
  };

  const handlePermDeleteNote = async (id) => {
    if (!window.confirm('¿Seguro que deseas destruir esta nota para siempre?')) return;
    try { await deleteNote(id); load(); toast.success('Nota eliminada permanentemente'); }
    catch { toast.error('Error al eliminar'); }
  };

  const handlePermDeleteTask = async (id) => {
    if (!window.confirm('¿Seguro que deseas destruir esta tarea para siempre?')) return;
    try { await deleteTask(id); load(); toast.success('Tarea eliminada permanentemente'); }
    catch { toast.error('Error al eliminar'); }
  };

  const totalItems = deletedNotes.length + deletedTasks.length;

  return (
    <div className="p-8 sm:p-12 max-w-4xl mx-auto h-full flex flex-col flex-1 pb-20 overflow-y-auto">
      <div className="flex items-center gap-4 mb-8 border-b border-border pb-6">
        <Trash2 className="w-8 h-8 text-textMuted" />
        <div>
          <h2 className="text-2xl font-bold text-textMain tracking-tight">Papelera</h2>
          <p className="text-sm text-textMuted font-medium mt-1">Los elementos eliminados se guardarán temporalmente aquí.</p>
        </div>
      </div>

      {totalItems === 0 && (
        <div className="flex flex-col items-center justify-center flex-1 text-textMuted opacity-50 mt-12">
          <Trash2 className="w-16 h-16 mb-4" />
          <p className="font-semibold text-lg text-textMain">La papelera está vacía.</p>
        </div>
      )}

      {deletedNotes.length > 0 && (
        <div className="mb-10 w-full animate-fade-in-up">
          <h3 className="text-sm font-bold text-textMuted uppercase tracking-wider mb-4 flex items-center gap-2">
            <FileText className="w-4 h-4" /> Notas ({deletedNotes.length})
          </h3>
          <div className="flex flex-col gap-2">
            {deletedNotes.map(n => (
              <div key={n.id} className="flex items-center justify-between p-4 bg-surface border border-danger/20 rounded-xl hover:border-danger/50 transition-colors">
                <span className="text-sm font-semibold text-textMain truncate mr-4 line-through opacity-70">{n.title}</span>
                <div className="flex gap-2 shrink-0">
                  <button onClick={() => handleRestoreNote(n.id)} className="p-2 bg-success/10 hover:bg-success/20 text-success rounded-lg transition-colors flex items-center gap-2 text-xs font-bold" title="Restaurar">
                    <RotateCcw className="w-4 h-4" /> <span className="hidden sm:inline">Restaurar</span>
                  </button>
                  <button onClick={() => handlePermDeleteNote(n.id)} className="p-2 bg-danger/10 hover:bg-danger/20 text-danger rounded-lg transition-colors" title="Eliminación Permanente">
                    <XCircle className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {deletedTasks.length > 0 && (
        <div className="w-full animate-fade-in-up">
          <h3 className="text-sm font-bold text-textMuted uppercase tracking-wider mb-4 flex items-center gap-2">
             <CheckSquare className="w-4 h-4" /> Tareas ({deletedTasks.length})
          </h3>
          <div className="flex flex-col gap-2">
            {deletedTasks.map(t => (
              <div key={t.id} className="flex items-center justify-between p-4 bg-surface border border-danger/20 rounded-xl hover:border-danger/50 transition-colors">
                <span className="text-sm font-semibold text-textMain truncate mr-4 line-through opacity-70">{t.title}</span>
                <div className="flex gap-2 shrink-0">
                  <button onClick={() => handleRestoreTask(t.id)} className="p-2 bg-success/10 hover:bg-success/20 text-success rounded-lg transition-colors flex items-center gap-2 text-xs font-bold" title="Restaurar">
                    <RotateCcw className="w-4 h-4" /> <span className="hidden sm:inline">Restaurar</span>
                  </button>
                  <button onClick={() => handlePermDeleteTask(t.id)} className="p-2 bg-danger/10 hover:bg-danger/20 text-danger rounded-lg transition-colors" title="Eliminación Permanente">
                    <XCircle className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

export default TrashView;
