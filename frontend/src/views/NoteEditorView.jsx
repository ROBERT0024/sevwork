// NoteEditorView.jsx
import React, { useState, useEffect, useRef, useCallback } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { updateNote } from '../services/api.js';
import { ArrowLeft, Star, Eye, Edit3, Bold, Italic, Type, Code, List, Quote, Terminal, CheckSquare, Minus, Maximize2, Minimize2, Download, FileJson, FileText, ChevronDown } from 'lucide-react';
import { TAG_OPTIONS, getTagClasses, tagBadgeClass, getTagStyle } from '../utils/tagColors.js';
import toast from 'react-hot-toast';

const MD_TOOLS = [
  { label:'B', icon: Bold, md:'**texto**', title:'Negrita' },
  { label:'I', icon: Italic, md:'_texto_', title:'Cursiva' },
  { label:'H1', icon: Type, md:'# Título', title:'Título' },
  { label:'`', icon: Code, md:'`código`', title:'Código' },
  { label:'```', icon: Terminal, md:'```\ncódigo\n```', title:'Bloque código' },
  { label:'—', icon: Minus, md:'\n---\n', title:'Separador' },
  { label:'☑', icon: CheckSquare, md:'- [ ] tarea\n', title:'Checkbox' },
  { label:'•', icon: List, md:'- elemento\n', title:'Lista' },
  { label:'"', icon: Quote, md:'> cita\n', title:'Cita' },
];

function NoteEditorView({ note, onBack }) {
  const [title,   setTitle]   = useState(note.title || '');
  const [content, setContent] = useState(note.content || '');
  const [tag,     setTag]     = useState(note.tag || '');
  const [pinned,  setPinned]  = useState(note.is_pinned || false);
  const [preview, setPreview] = useState(false);
  const [isFocus, setIsFocus] = useState(false);
  const [showExport, setShowExport] = useState(false);
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
  }, [title, content, tag, pinned, autoSave]);

  const insertMd = (md) => {
    const el = textareaRef.current; 
    if (!el) return;
    const s = el.selectionStart, e = el.selectionEnd;
    setContent(content.slice(0, s) + md + content.slice(e));
    setTimeout(() => { el.focus(); el.setSelectionRange(s + md.length, s + md.length); }, 0);
  };

  const exportMD = () => {
    const blob = new Blob([`# ${title}\n\n${content}`], { type: 'text/markdown' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${title.replace(/\s+/g, '_') || 'nota'}.md`;
    a.click();
    toast.success('Nota exportada como Markdown');
    setShowExport(false);
  };

  const exportPDF = async () => {
    const html2pdf = (await import('html2pdf.js')).default;
    const element = document.createElement('div');
    element.innerHTML = `
      <div style="padding: 40px; font-family: sans-serif; color: #1e293b;">
        <h1 style="font-size: 32px; font-weight: 800; margin-bottom: 20px;">${title}</h1>
        <div style="font-size: 14px; color: #64748b; margin-bottom: 40px;">Etiqueta: ${tag || 'Sin etiqueta'}</div>
        <div style="line-height: 1.6; white-space: pre-wrap;">${content}</div>
      </div>
    `;
    
    const opt = {
      margin:       1,
      filename:     `${title.replace(/\s+/g, '_') || 'nota'}.pdf`,
      image:        { type: 'jpeg', quality: 0.98 },
      html2canvas:  { scale: 2 },
      jsPDF:        { unit: 'in', format: 'letter', orientation: 'portrait' }
    };

    html2pdf().from(element).set(opt).save();
    toast.success('Nota exportada como PDF');
    setShowExport(false);
  };

  const wordCount = content.trim().split(/\s+/).filter(Boolean).length;

  return (
    <div className={`flex flex-col h-full bg-background relative animate-fade-in-up ${isFocus ? 'fixed inset-0 z-[100] bg-background' : ''}`}>
      {/* Editor Topbar */}
      <div className="flex flex-wrap items-center justify-between gap-4 px-6 py-4 border-b border-border bg-surface/80 backdrop-blur-md sticky top-0 z-10 w-full shrink-0">
        <div className="flex items-center gap-4">
          {!isFocus && (
            <button className="flex items-center gap-1.5 text-sm font-semibold text-textMuted hover:text-primary transition-colors bg-background border border-border hover:border-primary px-3 py-1.5 rounded-lg" onClick={onBack}>
              <ArrowLeft className="w-4 h-4" /> Volver
            </button>
          )}
          
          {/* Tag picker pill */}
          <div className="hidden sm:flex items-center gap-1.5">
            {tag && (
              <span className={tagBadgeClass(tag)} style={getTagStyle(tag)}>
                <span className={`w-1.5 h-1.5 rounded-full ${getTagClasses(tag).dot}`} style={getTagClasses(tag).isCustom ? { backgroundColor: getTagClasses(tag).hex } : {}} />
                {tag}
                <button onClick={() => setTag('')} className="ml-1 opacity-60 hover:opacity-100 text-[11px] leading-none">×</button>
              </span>
            )}
            {!tag && (
              <select 
                value={tag} 
                onChange={e => setTag(e.target.value)} 
                className="outline-none cursor-pointer bg-background border border-border text-xs font-bold uppercase tracking-wider rounded-lg px-3 py-1.5 shadow-sm text-textMuted"
              >
                <option value="">+ Etiqueta</option>
                {TAG_OPTIONS.map(t => <option key={t} value={t}>{t}</option>)}
              </select>
            )}
          </div>
        </div>

        <div className="flex items-center gap-3">
          <div className="hidden md:flex flex-col items-end mr-4">
            <span className={`text-[10px] font-bold uppercase tracking-widest ${saved ? 'text-success' : 'text-warning animate-pulse'}`}>
              {saved ? '✓ Guardado' : '● Guardando...'}
            </span>
            <span className="text-[11px] text-textMuted">{wordCount} palabras</span>
          </div>

          {/* Export Menu */}
          <div className="relative">
            <button 
              className={`p-2 rounded-lg border transition-all bg-background border-border text-textMuted hover:border-primary/50 flex items-center gap-1`}
              onClick={() => setShowExport(!showExport)}
            >
              <Download className="w-4 h-4" />
              <ChevronDown className={`w-3 h-3 transition-transform ${showExport ? 'rotate-180' : ''}`} />
            </button>
            {showExport && (
              <div className="absolute right-0 top-full mt-2 w-48 bg-surface border border-border rounded-xl shadow-2xl z-20 py-1 overflow-hidden animate-fade-in-up">
                <button onClick={exportMD} className="w-full flex items-center gap-3 px-4 py-2.5 text-sm font-semibold text-textMuted hover:bg-surfaceHover hover:text-primary transition-colors">
                  <FileText className="w-4 h-4" /> Markdown (.md)
                </button>
                <button onClick={exportPDF} className="w-full flex items-center gap-3 px-4 py-2.5 text-sm font-semibold text-textMuted hover:bg-surfaceHover hover:text-danger transition-colors">
                  <FileJson className="w-4 h-4" /> PDF (.pdf)
                </button>
              </div>
            )}
          </div>

          <button 
            className={`p-2 rounded-lg border transition-all ${isFocus ? 'bg-orange-500/20 border-orange-500 text-orange-400' : 'bg-background border-border text-textMuted hover:border-orange-500/50'}`} 
            onClick={() => setIsFocus(!isFocus)} 
            title="Modo Enfoque"
          >
            {isFocus ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
          </button>

          <button 
            className={`p-2 rounded-lg border transition-all ${pinned ? 'bg-primary/20 border-primary text-primaryHover' : 'bg-background border-border text-textMuted hover:border-primary/50'}`} 
            onClick={() => setPinned(!pinned)} 
            title="Marcar Favorito"
          >
            <Star className={`w-4 h-4 ${pinned ? 'fill-white text-white' : ''}`} />
          </button>
          
          <button 
            className={`flex items-center gap-2 px-3 py-1.5 rounded-lg border text-sm font-bold transition-all ${preview ? 'bg-primary border-primary text-white shadow-glow' : 'bg-background border-border text-textMuted hover:border-primary/50'}`} 
            onClick={() => setPreview(!preview)}
          >
            {preview ? <><Edit3 className="w-4 h-4" /> Editar</> : <><Eye className="w-4 h-4" /> Preview</>}
          </button>
        </div>
      </div>

      {/* Editor Body */}
      <div className="flex-1 flex justify-center overflow-y-auto bg-surface/10">
        <div className={`w-full max-w-4xl px-8 py-10 flex flex-col h-full shrink-0 ${isFocus ? 'max-w-3xl' : ''}`}>
          
          {/* Focus Mode Indicator */}
          {isFocus && (
            <div className="fixed top-6 left-1/2 -translate-x-1/2 flex items-center gap-2 bg-orange-500/10 border border-orange-500/20 px-3 py-1 rounded-full pointer-events-none">
              <div className="w-1.5 h-1.5 bg-orange-500 rounded-full animate-pulse" />
              <span className="text-[10px] font-bold text-orange-400 uppercase tracking-widest">Modo Enfoque Activo</span>
            </div>
          )}

          {/* Title Input */}
          <input 
            className="w-full bg-transparent border-none text-3xl sm:text-4xl font-black text-textMain outline-none placeholder:text-border mb-8 placeholder:font-black transition-colors focus:placeholder:opacity-50 break-words whitespace-normal" 
            placeholder="Título impactante..." 
            value={title} 
            onChange={e => setTitle(e.target.value)} 
          />

          {!preview && (
            <div className="flex flex-wrap items-center gap-1.5 bg-surface border border-border p-1.5 rounded-xl mb-6 shadow-sm sticky top-20 z-10 w-max">
              {MD_TOOLS.map(tool => {
                const Icon = tool.icon;
                return (
                  <button 
                    key={tool.label} 
                    type="button" 
                    className="p-2 rounded-lg text-textMuted hover:text-textMain hover:bg-background border border-transparent hover:border-border transition-colors tooltip relative group" 
                    onClick={() => insertMd(tool.md)} 
                    title={tool.title}
                  >
                    <Icon className="w-3.5 h-3.5" />
                  </button>
                )
              })}
            </div>
          )}

          {/* Content Area */}
          <div className="flex-1 flex flex-col pb-20">
            {preview ? (
              <div className="prose prose-invert prose-indigo w-full max-w-none prose-headings:font-black text-textMuted prose-a:text-primary">
                {content ? <ReactMarkdown remarkPlugins={[remarkGfm]}>{content}</ReactMarkdown> : <div className="text-center py-20 text-border border-2 border-dashed border-border rounded-xl">Sin contenido todavía...</div>}
              </div>
            ) : (
              <textarea 
                ref={textareaRef} 
                className="w-full flex-1 min-h-[500px] bg-transparent border-none text-[15px] sm:text-base text-textMuted leading-relaxed outline-none resize-none font-mono selection:bg-primary/30 placeholder:opacity-40"
                placeholder={'Empieza a escribir... \n\n# Puedes usar jerarquía\n**negrita**, _cursiva_, `código`\n- [ ] Listas interactuables'}
                value={content} 
                onChange={e => setContent(e.target.value)} 
              />
            )}
          </div>

        </div>
      </div>
    </div>
  );
}

export default NoteEditorView;
