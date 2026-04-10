// SearchModal.jsx — Búsqueda global mejorada con Tailwind, resaltado y navegación por teclado
import React, { useState, useEffect, useRef, useCallback } from 'react';
import { getNotes, getTasks } from '../services/api.js';
import { Search, FileText, CheckSquare, ArrowRight, Loader2 } from 'lucide-react';
import { tagBadgeClass, getTagClasses } from '../utils/tagColors.js';

const PRIORITY_COLOR = { high: 'text-red-400', medium: 'text-orange-400', low: 'text-green-400' };

function highlight(text, query) {
  if (!query.trim()) return text;
  const parts = text.split(new RegExp(`(${query.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')})`, 'gi'));
  return parts.map((p, i) =>
    p.toLowerCase() === query.toLowerCase()
      ? <mark key={i} className="bg-primary/40 text-white rounded px-0.5">{p}</mark>
      : p
  );
}

function SearchModal({ onClose, onOpenNote, onNavigate, activeWorkspace }) {
  const [query,    setQuery]    = useState('');
  const [notes,    setNotes]    = useState([]);
  const [tasks,    setTasks]    = useState([]);
  const [loading,  setLoading]  = useState(false);
  const [selected, setSelected] = useState(0);
  const inputRef = useRef(null);

  useEffect(() => { inputRef.current?.focus(); }, []);

  useEffect(() => {
    if (!query.trim()) { setNotes([]); setTasks([]); setSelected(0); return; }
    const t = setTimeout(async () => {
      setLoading(true);
      try {
        const [nr, tr] = await Promise.all([
          getNotes(activeWorkspace, query),
          getTasks(activeWorkspace),
        ]);
        setNotes(nr.data.slice(0, 5));
        setTasks(tr.data.filter(t => t.title.toLowerCase().includes(query.toLowerCase())).slice(0, 5));
        setSelected(0);
      } catch { /* ignore */ }
      setLoading(false);
    }, 300);
    return () => clearTimeout(t);
  }, [query, activeWorkspace]);

  const allResults = [
    ...notes.map(n => ({ type: 'note', data: n })),
    ...tasks.map(t => ({ type: 'task', data: t })),
  ];

  const handleSelect = useCallback((item) => {
    if (item.type === 'note') { onOpenNote(item.data); onClose(); }
    else { onNavigate('tasks'); onClose(); }
  }, [onOpenNote, onNavigate, onClose]);

  const handleKey = (e) => {
    if (e.key === 'ArrowDown')  { e.preventDefault(); setSelected(s => Math.min(s + 1, allResults.length - 1)); }
    if (e.key === 'ArrowUp')    { e.preventDefault(); setSelected(s => Math.max(s - 1, 0)); }
    if (e.key === 'Enter' && allResults[selected]) handleSelect(allResults[selected]);
    if (e.key === 'Escape') onClose();
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-start justify-center pt-[12vh] bg-black/60 backdrop-blur-sm" onClick={onClose}>
      <div
        className="w-full max-w-2xl bg-surface border border-border rounded-2xl shadow-2xl overflow-hidden animate-fade-in-up"
        onClick={e => e.stopPropagation()}
        onKeyDown={handleKey}
      >
        {/* Input */}
        <div className="flex items-center gap-3 px-5 py-4 border-b border-border">
          {loading
            ? <Loader2 className="w-5 h-5 text-primary animate-spin shrink-0" />
            : <Search className="w-5 h-5 text-textMuted shrink-0" />
          }
          <input
            ref={inputRef}
            className="flex-1 bg-transparent text-base text-textMain placeholder:text-textMuted outline-none"
            placeholder="Buscar notas, tareas..."
            value={query}
            onChange={e => setQuery(e.target.value)}
          />
          <div className="flex items-center gap-1.5 shrink-0">
            <kbd className="hidden sm:flex items-center gap-1 text-[10px] font-bold text-textMuted bg-background border border-border px-2 py-1 rounded-md">Ctrl</kbd>
            <kbd className="hidden sm:flex items-center gap-1 text-[10px] font-bold text-textMuted bg-background border border-border px-2 py-1 rounded-md">K</kbd>
            <kbd className="text-[10px] font-bold text-textMuted bg-background border border-border px-2 py-1 rounded-md cursor-pointer hover:border-primary transition-colors" onClick={onClose}>Esc</kbd>
          </div>
        </div>

        {/* Results */}
        <div className="max-h-[60vh] overflow-y-auto py-2">
          {!query && (
            <div className="p-4 space-y-1">
              <p className="text-[10px] font-bold text-textMuted uppercase tracking-widest px-2 mb-3">Accesos rápidos</p>
              {[
                { label: 'Ver todas las notas',  icon: FileText,    view: 'notes'    },
                { label: 'Ver todas las tareas', icon: CheckSquare, view: 'tasks'    },
                { label: 'Ir al calendario',     icon: ArrowRight,  view: 'calendar' },
              ].map(({ label, icon: Icon, view }) => (
                <button key={view} onClick={() => { onNavigate(view); onClose(); }}
                  className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm text-textMuted hover:bg-surfaceHover hover:text-textMain transition-colors">
                  <Icon className="w-4 h-4 text-primary" /> {label}
                </button>
              ))}
            </div>
          )}

          {query && allResults.length === 0 && !loading && (
            <div className="py-12 text-center text-textMuted">
              <Search className="w-10 h-10 mx-auto mb-3 opacity-20" />
              <p className="text-sm font-medium">Sin resultados para <strong className="text-textMain">"{query}"</strong></p>
            </div>
          )}

          {notes.length > 0 && (
            <div className="px-2 mb-2">
              <p className="text-[10px] font-bold text-textMuted uppercase tracking-widest px-2 py-2">Notas</p>
              {notes.map((n, i) => (
                <button key={n.id} onClick={() => handleSelect({ type: 'note', data: n })}
                  className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-left transition-colors ${selected === i ? 'bg-primary/20 text-textMain' : 'hover:bg-surfaceHover text-textMuted'}`}>
                  <FileText className="w-4 h-4 text-primary shrink-0" />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-textMain truncate">{highlight(n.title, query)}</p>
                    <p className="text-xs truncate">{n.content?.slice(0, 60) || 'Sin contenido'}</p>
                  </div>
                  {n.tag && <span className={tagBadgeClass(n.tag)}><span className={`w-1.5 h-1.5 rounded-full ${getTagClasses(n.tag).dot}`}/>{n.tag}</span>}
                </button>
              ))}
            </div>
          )}

          {tasks.length > 0 && (
            <div className="px-2 mb-2">
              <p className="text-[10px] font-bold text-textMuted uppercase tracking-widest px-2 py-2">Tareas</p>
              {tasks.map((t, i) => {
                const idx = notes.length + i;
                return (
                  <button key={t.id} onClick={() => handleSelect({ type: 'task', data: t })}
                    className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-left transition-colors ${selected === idx ? 'bg-primary/20 text-textMain' : 'hover:bg-surfaceHover text-textMuted'}`}>
                    <CheckSquare className="w-4 h-4 text-primary shrink-0" />
                    <div className="flex-1 min-w-0">
                      <p className={`text-sm font-semibold truncate ${t.completed ? 'line-through text-textMuted' : 'text-textMain'}`}>{highlight(t.title, query)}</p>
                    </div>
                    <span className={`text-[10px] font-bold uppercase ${PRIORITY_COLOR[t.priority] || ''}`}>{t.priority}</span>
                  </button>
                );
              })}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center gap-4 px-5 py-3 border-t border-border text-[11px] text-textMuted/60">
          <span>↑↓ Navegar</span>
          <span>↵ Seleccionar</span>
          <span>Esc Cerrar</span>
        </div>
      </div>
    </div>
  );
}

export default SearchModal;
