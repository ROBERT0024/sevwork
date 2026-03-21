// NoteEditorView.jsx — Editor completo tipo Notion
import React, { useState, useEffect, useRef, useCallback } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { updateNote } from '../services/api.js';

const TAG_OPTIONS = ['trabajo', 'personal', 'ideas', 'urgente', 'estudio'];
const TAG_COLORS  = { trabajo:'#6366f1', personal:'#10b981', ideas:'#f59e0b', urgente:'#ef4444', estudio:'#3b82f6' };
const MD_TOOLS = [
  { label:'B',   md:'**texto**',        title:'Negrita'       },
  { label:'I',   md:'_texto_',          title:'Cursiva'       },
  { label:'H1',  md:'# Título',         title:'Título'        },
  { label:'H2',  md:'## Subtítulo',     title:'Subtítulo'     },
  { label:'`',   md:'`código`',         title:'Código'        },
  { label:'```', md:'```\ncódigo\n```', title:'Bloque código' },
  { label:'—',   md:'---',             title:'Separador'     },
  { label:'☑',   md:'- [ ] tarea',      title:'Checkbox'      },
  { label:'•',   md:'- elemento',       title:'Lista'         },
  { label:'"',   md:'> cita',           title:'Cita'          },
];

function NoteEditorView({ note, onBack }) {
  const [title,   setTitle]   = useState(note.title    || '');
  const [content, setContent] = useState(note.content  || '');
  const [tag,     setTag]     = useState(note.tag      || '');
  const [pinned,  setPinned]  = useState(note.is_pinned || false);
  const [preview, setPreview] = useState(false);
  const [saved,   setSaved]   = useState(true);
  const textareaRef = useRef(null);
  const saveTimer   = useRef(null);

  const autoSave = useCallback(async (t, c, tg, p) => {
    try { await updateNote(note.id, { title: t, content: c, tag: tg, is_pinned: p }); setSaved(true); }
    catch { /* ignore */ }
  }, [note.id]);

  useEffect(() => {
    setSaved(false);
    clearTimeout(saveTimer.current);
    saveTimer.current = setTimeout(() => autoSave(title, content, tag, pinned), 1500);
    return () => clearTimeout(saveTimer.current);
  }, [title, content, tag, pinned]);

  const insertMd = (md) => {
    const el = textareaRef.current; if (!el) return;
    const s = el.selectionStart, e = el.selectionEnd;
    setContent(content.slice(0, s) + md + content.slice(e));
    setTimeout(() => { el.focus(); el.setSelectionRange(s + md.length, s + md.length); }, 0);
  };

  const wordCount = content.trim().split(/\s+/).filter(Boolean).length;

  return (
    <div className="note-editor-view">
      <div className="editor-topbar">
        <button className="btn-back" onClick={onBack}>← Volver</button>
        <div className="editor-meta">
          <select value={tag} onChange={e => setTag(e.target.value)} className="editor-tag-select"
            style={tag ? { color: TAG_COLORS[tag], borderColor: TAG_COLORS[tag] } : {}}>
            <option value="">Sin etiqueta</option>
            {TAG_OPTIONS.map(t => <option key={t} value={t}>{t}</option>)}
          </select>
          <button className={`editor-pin-btn ${pinned ? 'pinned' : ''}`} onClick={() => setPinned(p => !p)}>{pinned ? '📌' : '📍'}</button>
          <button className={`editor-preview-btn ${preview ? 'active' : ''}`} onClick={() => setPreview(p => !p)}>{preview ? '✏️ Editar' : '👁 Preview'}</button>
        </div>
        <div className="editor-status">
          <span className="editor-wordcount">{wordCount} palabras</span>
          <span className={`editor-saved ${saved ? 'ok' : 'saving'}`}>{saved ? '✓ Guardado' : '● Guardando...'}</span>
        </div>
      </div>
      <div className="editor-body">
        <input className="editor-title-input" placeholder="Título..." value={title} onChange={e => setTitle(e.target.value)} />
        {!preview && (
          <div className="editor-md-toolbar">
            {MD_TOOLS.map(tool => <button key={tool.label} type="button" className="editor-md-tool" onClick={() => insertMd(tool.md)} title={tool.title}>{tool.label}</button>)}
          </div>
        )}
        {preview ? (
          <div className="editor-preview-content">
            {content ? <ReactMarkdown remarkPlugins={[remarkGfm]}>{content}</ReactMarkdown> : <p className="editor-placeholder">Sin contenido aún...</p>}
          </div>
        ) : (
          <textarea ref={textareaRef} className="editor-textarea"
            placeholder={'Empieza a escribir... (soporta **markdown**)\n\n# Puedes usar títulos\n**negrita**, _cursiva_, `código`\n- [ ] Lista de tareas'}
            value={content} onChange={e => setContent(e.target.value)} />
        )}
      </div>
      <div className="editor-footer">
        <span>Última edición: {new Date(note.updated_at).toLocaleString('es-ES')}</span>
      </div>
    </div>
  );
}

export default NoteEditorView;
