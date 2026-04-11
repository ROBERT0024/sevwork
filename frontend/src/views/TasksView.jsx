// TasksView.jsx
import React, { useState, useEffect, useCallback } from 'react';
import { getTasks, createTask, updateTask, deleteTask } from '../services/api.js';
import { CheckCircle2, Circle, Calendar as CalendarIcon, Trash2, Plus, X, Star } from 'lucide-react';
import toast from 'react-hot-toast';

const PRIORITIES = {
  high:   { label: 'Urgente', color: 'text-red-400',    border: 'border-red-400'    },
  medium: { label: 'Media',   color: 'text-orange-400', border: 'border-orange-400' },
  low:    { label: 'Baja',    color: 'text-green-400',  border: 'border-green-400'  },
};
const FILTERS = ['todas', 'pendientes', 'completadas', 'alta', 'media', 'baja'];

function TasksView({ activeWorkspace, showNewForm, onFormShown }) {
  const [tasks, setTasks]       = useState([]);
  const [filter, setFilter]     = useState('todas');
  const [showForm, setShowForm] = useState(false);
  const [editingTask, setEditingTask] = useState(null);
  const [title, setTitle]       = useState('');
  const [priority, setPriority] = useState('medium');
  const [dueDate, setDueDate]   = useState('');
  const [description, setDescription] = useState('');
  const [comments, setComments]       = useState('');

  useEffect(() => { if (showNewForm) { setShowForm(true); onFormShown?.(); } }, [showNewForm]);

  const load = useCallback(() => {
    if (!activeWorkspace) return;
    getTasks(activeWorkspace).then(r => setTasks(r.data)).catch(() => toast.error('Error al cargar tareas'));
  }, [activeWorkspace]);

  useEffect(() => { load(); }, [load]);

  const handleCreate = async (e) => {
    e.preventDefault();
    if (!title.trim()) return;
    const loadingToast = toast.loading(editingTask ? 'Actualizando tarea...' : 'Creando tarea...');
    try { 
      if (editingTask) {
        await updateTask(editingTask.id, { title, priority, due_date: dueDate || null, description, comments });
        toast.success('Tarea actulizada', { id: loadingToast });
      } else {
        await createTask(title, activeWorkspace, priority, dueDate || null, description, comments); 
        toast.success('Tarea agregada', { id: loadingToast });
      }
      resetForm();
      load(); 
    }
    catch { toast.error('No se pudo guardar la tarea', { id: loadingToast }); }
  };

  const resetForm = () => {
    setTitle(''); setPriority('medium'); setDueDate(''); setDescription(''); setComments(''); setEditingTask(null); setShowForm(false);
  };

  const openEdit = (t) => {
    setEditingTask(t);
    setTitle(t.title);
    setPriority(t.priority);
    setDueDate(t.due_date ? t.due_date.split('T')[0] : '');
    setDescription(t.description || '');
    setComments(t.comments || '');
    setShowForm(true);
  };

  const handleToggle = async (t) => {
    try { await updateTask(t.id, { completed: !t.completed }); load(); }
    catch { toast.error('Error al sincronizar tarea'); }
  };
  
  const handleDelete = async (id) => {
    try { await updateTask(id, { is_deleted: true }); setTasks(p => p.filter(t => t.id !== id)); toast.success('Enviada a papelera'); }
    catch { toast.error('Error al enviar a papelera'); }
  };

  const handleFavorite = async (task) => {
    try { await updateTask(task.id, { is_pinned: !task.is_pinned }); load(); }
    catch { toast.error('Error al actualizar favorito'); }
  };

  const filtered = tasks.filter(t => {
    if (filter === 'pendientes')  return !t.completed;
    if (filter === 'completadas') return  t.completed;
    if (filter === 'alta')   return t.priority === 'high';
    if (filter === 'media')  return t.priority === 'medium';
    if (filter === 'baja')   return t.priority === 'low';
    return true;
  });

  const completed = tasks.filter(t => t.completed).length;
  const progress  = tasks.length ? Math.round((completed / tasks.length) * 100) : 0;
  const isOverdue = (t) => t.due_date && !t.completed && new Date(t.due_date) < new Date();

  return (
    <div className="p-8 sm:p-12 max-w-4xl mx-auto h-full flex flex-col">
      {/* Progress */}
      {tasks.length > 0 && (
        <div className="bg-surface border border-border rounded-xl p-5 mb-8 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="relative w-12 h-12 flex items-center justify-center shrink-0">
              <svg className="w-full h-full -rotate-90" viewBox="0 0 36 36">
                <path className="text-border fill-none stroke-current" strokeWidth="4" d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" />
                <path className="text-primary fill-none stroke-current transition-all duration-1000" strokeWidth="4" strokeDasharray={`${progress}, 100`} d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" />
              </svg>
              <span className="absolute text-[10px] font-bold text-textMain">{progress}%</span>
            </div>
            <div>
              <h3 className="text-sm font-bold text-textMain">Progreso General</h3>
              <p className="text-xs text-textMuted">{completed} de {tasks.length} tareas listas</p>
            </div>
          </div>
        </div>
      )}

      {/* Toolbar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6 relative z-10">
        <div className="flex flex-wrap gap-2">
          {FILTERS.map(f => (
            <button 
              key={f} 
              className={`px-3 py-1.5 rounded-full text-[11px] font-bold uppercase tracking-wider border transition-all ${filter === f ? 'bg-primary/20 border-primary text-primaryHover' : 'border-border text-textMuted hover:border-primary/50'}`}
              onClick={() => setFilter(f)}
            >
              {f}
            </button>
          ))}
        </div>
        <button className="bg-primary hover:bg-primaryHover text-white text-xs font-bold px-4 py-2 rounded-lg transition-colors flex items-center gap-1.5" onClick={() => setShowForm(true)}>
          <Plus className="w-4 h-4" /> Agregar tarea
        </button>
      </div>

      {/* Form */}
      {showForm && (
        <form onSubmit={handleCreate} className="bg-surface border border-primary/50 rounded-xl p-5 mb-6 shadow-glow animate-fade-in-up">
          <div className="mb-4">
            <span className="text-[10px] font-bold text-primary uppercase tracking-widest">{editingTask ? 'Editando Tarea' : 'Nueva Tarea'}</span>
            <input 
              autoFocus 
              className="w-full bg-transparent border-none text-base font-bold text-textMain outline-none placeholder:text-textMuted mt-1" 
              placeholder="¿Qué necesitas hacer hoy?" 
              value={title} 
              onChange={e => setTitle(e.target.value)} 
            />
            <textarea
              className="w-full bg-black/20 border border-border rounded-lg p-3 text-sm text-textMuted outline-none mt-3 resize-none h-[80px]"
              placeholder="Detalles adicionales (opcional)..."
              value={description}
              onChange={e => setDescription(e.target.value)}
            />
            <div className="mt-4">
              <label className="text-[10px] font-bold text-textMuted uppercase tracking-widest ml-1">Bitácora / Comentarios</label>
              <textarea
                className="w-full bg-black/30 border border-dashed border-primary/30 rounded-lg p-3 text-sm text-textMain outline-none mt-1 resize-none h-[80px] focus:border-primary/60 transition-colors placeholder:text-textMuted/50"
                placeholder="Anota qué hiciste o por qué se retrasó..."
                value={comments}
                onChange={e => setComments(e.target.value)}
              />
            </div>
          </div>
          <div className="flex flex-wrap justify-between items-center border-t border-border pt-4 gap-3">
            <div className="flex items-center gap-3">
              <select value={priority} onChange={e => setPriority(e.target.value)} className="bg-black/30 border border-border rounded-lg px-3 py-2 text-xs font-semibold text-textMain outline-none focus:border-primary">
                <option value="high">🔴 Alta Prioridad</option>
                <option value="medium">🟡 Prioridad Media</option>
                <option value="low">🟢 Baja Prioridad</option>
              </select>
              <input type="date" className="bg-black/30 border border-border rounded-lg px-3 py-1.5 text-xs text-textMain outline-none [color-scheme:dark] h-[34px]" value={dueDate} onChange={e => setDueDate(e.target.value)} />
            </div>
            <div className="flex gap-2">
              <button type="button" className="p-2 text-textMuted hover:text-danger rounded-lg transition-colors" onClick={resetForm}>
                <X className="w-4 h-4" />
              </button>
              <button type="submit" className="bg-primary hover:bg-primaryHover text-white text-xs font-bold px-4 py-1.5 rounded-lg transition-colors">
                {editingTask ? 'Actualizar' : 'Guardar'}
              </button>
            </div>
          </div>
        </form>
      )}

      {/* List */}
      <div className="flex flex-col gap-2 flex-1 overflow-y-auto pr-2 pb-10">
        {filtered.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 text-center">
            <CheckCircle2 className="w-12 h-12 text-border mb-4" />
            <p className="text-sm text-textMuted font-medium">{filter === 'todas' ? 'Todo al día. No hay tareas pendientes.' : `Ninguna tarea en categoría "${filter}"`}</p>
          </div>
        ) : filtered.map(task => {
          const pc = PRIORITIES[task.priority] || PRIORITIES.medium;
          const overdue = isOverdue(task);
          return (
            <div key={task.id} className={`flex items-center gap-4 bg-surface border rounded-xl p-4 transition-all hover:border-primary/40 group ${task.completed ? 'opacity-60 border-border bg-background' : 'border-border shadow-sm'} ${overdue ? 'border-danger/30 bg-danger/5' : ''}`}>
              
              <button 
                className={`w-5 h-5 rounded-full border-2 flex items-center justify-center shrink-0 transition-colors ${task.completed ? 'bg-success border-success' : 'border-textMuted hover:border-primary'}`} 
                onClick={() => handleToggle(task)}
              >
                {task.completed && <CheckCircle2 className="w-3.5 h-3.5 text-white" />}
              </button>
              
              <div className="flex-1 min-w-0 flex flex-col">
                <div className="flex flex-col">
                  <span className={`text-sm font-semibold truncate ${task.completed ? 'text-textMuted line-through' : 'text-textMain'}`}>
                    {task.title}
                  </span>
          {task.description && (
                    <span className={`text-xs mt-1 truncate ${task.completed ? 'text-textMuted/50' : 'text-textMuted'}`}>
                      {task.description}
                    </span>
                  )}
                  {task.comments && (
                    <div className="mt-2 p-2 bg-primary/5 border-l-2 border-primary rounded text-[11px] text-textMain italic">
                      <span className="font-bold not-italic mr-1">Nota:</span> {task.comments}
                    </div>
                  )}
                </div>
                
                <div className="flex items-center gap-3 mt-1.5">
                  <span className={`flex items-center gap-1 text-[10px] font-bold uppercase tracking-wider ${pc.color}`}>
                    <span className={`w-1.5 h-1.5 rounded-full bg-current`} /> {pc.label}
                  </span>
                  
                  {task.due_date && (
                    <span className={`flex items-center gap-1 text-[11px] font-medium ${overdue ? 'text-danger' : 'text-textMuted'}`}>
                      <CalendarIcon className="w-3 h-3" /> 
                      {new Date(task.due_date).toLocaleDateString('es-ES', { day:'2-digit', month:'short' })}
                      {overdue && ' (Atrasada)'}
                    </span>
                  )}
                </div>
              </div>

              <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                <button 
                  className={`p-1.5 rounded-lg transition-all ${task.is_pinned ? 'text-warning' : 'text-textMuted hover:text-warning hover:bg-warning/10'}`}
                  onClick={() => handleFavorite(task)}
                  title={task.is_pinned ? 'Quitar de favoritos' : 'Añadir a favoritos'}
                >
                  <Star className={`w-4 h-4 ${task.is_pinned ? 'fill-white text-white' : ''}`} />
                </button>
                <button 
                  className="p-1.5 text-textMuted hover:text-primary hover:bg-primary/10 rounded-lg transition-all" 
                  onClick={() => openEdit(task)}
                  title="Editar Tarea"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>
                </button>
                <button 
                  className="p-1.5 text-textMuted hover:text-danger hover:bg-danger/10 rounded-lg transition-all" 
                  onClick={() => handleDelete(task.id)}
                  title="Eliminar"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

export default TasksView;
