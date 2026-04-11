// NotesView.jsx
import React, { useState, useEffect, useCallback } from 'react';
import { getNotes, createNote, deleteNote, updateNote } from '../services/api.js';
import { Search, FileText, Star, Trash2, Plus, X, Settings2, Pencil } from 'lucide-react';
import toast from 'react-hot-toast';
import { TAG_OPTIONS, getTagClasses, tagBadgeClass, getTagStyle } from '../utils/tagColors.js';
import TagManager from '../components/TagManager.jsx';

function NotesView({ activeWorkspace, onOpenNote, showNewForm, onFormShown }) {
  const [notes, setNotes]         = useState([]);
  const [search, setSearch]       = useState('');
  const [filterTag, setFilterTag] = useState('');
  const [showForm, setShowForm]   = useState(false);
  const [showTagMgr, setShowTagMgr]= useState(false);
  const [title, setTitle]         = useState('');
  const [tag, setTag]             = useState('');

  useEffect(() => { if (showNewForm) { setShowForm(true); onFormShown?.(); } }, [showNewForm, onFormShown]);

  const load = useCallback(() => {
    if (!activeWorkspace) return;
    getNotes(activeWorkspace, search, filterTag).then(r => setNotes(r.data)).catch(() => toast.error('Error al cargar notas'));
  }, [activeWorkspace, search, filterTag]);

  useEffect(() => { load(); }, [load]);
  useEffect(() => { const t = setTimeout(load, 300); return () => clearTimeout(t); }, [search, load]);

  const handleCreate = async (e) => {
    e.preventDefault();
    if (!title.trim()) return;
    const loadingToast = toast.loading('Creando nota...');
    try { 
      const res = await createNote(title, '', activeWorkspace, tag); 
      setTitle(''); setTag(''); setShowForm(false); 
      toast.success('Nota creada', { id: loadingToast });
      onOpenNote(res.data); 
    }
    catch { toast.error('No se pudo crear la nota', { id: loadingToast }); }
  };

  const handlePin = async (note, e) => {
    e.stopPropagation();
    try { 
      await updateNote(note.id, { is_pinned: !note.is_pinned }); 
      load(); 
    } catch { toast.error('Error al actualizar favorito'); }
  };

  const handleDelete = async (id, e) => {
    e.stopPropagation();
    try { 
      await updateNote(id, { is_deleted: true }); 
      setNotes(p => p.filter(n => n.id !== id)); 
      toast.success('Nota enviada a papelera');
    } catch { toast.error('Error al enviar a papelera'); }
  };

  return (
    <div className="p-8 sm:p-12 max-w-5xl mx-auto h-full flex flex-col">
      {showTagMgr && <TagManager onClose={() => { setShowTagMgr(false); load(); }} />}

      {/* Toolbar */}
      <div className="flex flex-col md:flex-row gap-4 mb-6 items-center">
        <div className="relative flex-1 w-full">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-textMuted" />
          <input 
            className="w-full bg-surface border border-border rounded-xl pl-10 pr-4 py-2 text-sm text-textMain outline-none focus:border-primary focus:ring-1 focus:ring-primary/50 transition-all" 
            placeholder="Buscar en tus notas..." 
            value={search} 
            onChange={e => setSearch(e.target.value)} 
          />
        </div>
        <div className="flex gap-2 items-center flex-wrap">
          {TAG_OPTIONS.map(t => {
            const c = getTagClasses(t);
            return (
              <button 
                key={t} 
                className={`px-3 py-1.5 rounded-lg text-xs font-bold uppercase tracking-wider border transition-all ${
                  filterTag === t 
                    ? `${c.bg} ${c.border} ${c.text} shadow-sm` 
                    : 'border-border text-textMuted hover:border-primary/50 hover:text-textMain'
                }`}
                style={filterTag === t ? getTagStyle(t) : {}}
                onClick={() => setFilterTag(filterTag === t ? '' : t)}
              >
                {t}
              </button>
            );
          })}
          <button 
            onClick={() => setShowTagMgr(true)}
            className="p-2 bg-surface border border-border rounded-lg text-textMuted hover:text-primary transition-all shadow-sm"
            title="Gestionar Etiquetas"
          >
            <Settings2 className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Creation Form */}
      {showForm && (
        <form onSubmit={handleCreate} className="bg-surface border border-primary/50 rounded-xl p-5 mb-6 shadow-glow animate-fade-in-up">
          <input 
            autoFocus 
            className="w-full bg-transparent border-none text-lg font-bold text-textMain mb-4 outline-none placeholder:text-textMuted" 
            placeholder="Título de tu nueva nota..." 
            value={title} 
            onChange={e => setTitle(e.target.value)} 
          />
          <div className="flex justify-between items-center border-t border-border pt-3">
            <div className="flex flex-wrap gap-1.5">
              <button
                type="button"
                onClick={() => setTag('')}
                className={`px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider border transition-all ${
                  tag === '' ? 'bg-border text-textMain border-border' : 'border-border/40 text-textMuted hover:border-border'
                }`}
              >Ninguna</button>
              {TAG_OPTIONS.map(t => {
                const c = getTagClasses(t);
                return (
                  <button
                    key={t}
                    type="button"
                    onClick={() => setTag(t)}
                    className={`px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider border transition-all ${
                      tag === t ? `${c.bg} ${c.text} ${c.border}` : `border-border/40 text-textMuted hover:${c.border} hover:${c.text}`
                    }`}
                    style={tag === t ? getTagStyle(t) : {}}
                  >
                    {t}
                  </button>
                );
              })}
            </div>
            <div className="flex gap-2">
              <button type="button" className="p-1.5 text-textMuted hover:text-danger rounded-lg transition-colors border border-transparent hover:border-danger/30" onClick={() => setShowForm(false)}>
                <X className="w-4 h-4" />
              </button>
              <button type="submit" className="bg-primary hover:bg-primaryHover text-white text-xs font-bold px-4 py-1.5 rounded-lg transition-colors shadow-sm flex items-center gap-1.5">
                <Plus className="w-3.5 h-3.5" /> Crear
              </button>
            </div>
          </div>
        </form>
      )}

      {/* List */}
      <div className="flex flex-col bg-surface border border-border rounded-xl overflow-hidden flex-1 overflow-y-auto min-h-[300px]">
        {notes.length === 0 ? (
          <div className="flex flex-col items-center justify-center p-12 text-center h-full m-auto">
            <FileText className="w-12 h-12 text-border mb-4" />
            <p className="text-sm text-textMuted font-medium">{search ? `Cero resultados para "${search}"` : 'Aún no hay notas. Crea una para comenzar tu documentación.'}</p>
          </div>
        ) : notes.map(note => (
          <div key={note.id} className={`flex items-center gap-4 p-4 border-b border-border cursor-pointer transition-colors hover:bg-surfaceHover last:border-0 ${note.is_pinned ? 'bg-primary/5' : ''}`} onClick={() => onOpenNote(note)}>
            
            <div className="bg-background border border-border rounded-lg p-2 shrink-0 hidden sm:block">
              <FileText className="w-4 h-4 text-primary" />
            </div>
            
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-1">
                {note.is_pinned && <Star className="w-3.5 h-3.5 fill-white text-white shrink-0" />}
                <span className="text-sm font-semibold text-textMain truncate">{note.title}</span>
                {note.tag && (
                  <span className={tagBadgeClass(note.tag)} style={getTagStyle(note.tag)}>
                    <span 
                      className={`w-1.5 h-1.5 rounded-full ${getTagClasses(note.tag).dot}`}
                      style={getTagClasses(note.tag).isCustom ? { backgroundColor: getTagClasses(note.tag).hex } : {}} 
                    />
                    {note.tag}
                  </span>
                )}
              </div>
              <span className="block text-xs text-textMuted truncate">{note.content?.replace(/\n/g, ' ') || 'Página en blanco...'}</span>
            </div>

            <div className="flex items-center gap-2 shrink-0">
              <span className="text-[11px] text-textMuted/60 mr-2 hidden md:inline-block border border-border px-2 py-0.5 rounded-md">
                {new Date(note.updated_at).toLocaleDateString('es-ES', { day:'2-digit', month:'short' })}
              </span>
              <button 
                className={`p-2 rounded-lg transition-colors ${note.is_pinned ? 'text-warning hover:bg-warning/20' : 'text-textMuted hover:bg-background hover:text-warning'}`} 
                onClick={e => handlePin(note, e)} 
                title={note.is_pinned ? "Quitar de favoritos" : "Añadir a favoritos"}
              >
                <Star className={`w-4 h-4 ${note.is_pinned ? 'fill-current' : ''}`} />
              </button>
              <button 
                className="p-2 rounded-lg text-textMuted hover:bg-primary/10 hover:text-primary transition-colors" 
                onClick={e => { e.stopPropagation(); onOpenNote(note); }}
                title="Editar Nota"
              >
                <Pencil className="w-4 h-4" />
              </button>
              <button 
                className="p-2 rounded-lg text-textMuted hover:bg-danger/20 hover:text-danger transition-colors" 
                onClick={e => handleDelete(note.id, e)}
                title="Eliminar Nota"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default NotesView;
