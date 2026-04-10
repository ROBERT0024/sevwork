// TagManager.jsx — Gestor de etiquetas con colores personalizables
import React, { useState } from 'react';
import { X, Plus, Palette } from 'lucide-react';

const DEFAULT_TAGS = {
  trabajo:  { bg: 'bg-blue-500/20',    text: 'text-blue-400',    border: 'border-blue-500/40',    dot: 'bg-blue-400',    hex: '#60a5fa' },
  personal: { bg: 'bg-violet-500/20',  text: 'text-violet-400',  border: 'border-violet-500/40',  dot: 'bg-violet-400',  hex: '#a78bfa' },
  ideas:    { bg: 'bg-amber-500/20',   text: 'text-amber-400',   border: 'border-amber-500/40',   dot: 'bg-amber-400',   hex: '#fbbf24' },
  urgente:  { bg: 'bg-red-500/20',     text: 'text-red-400',     border: 'border-red-500/40',     dot: 'bg-red-400',     hex: '#f87171' },
  estudio:  { bg: 'bg-emerald-500/20', text: 'text-emerald-400', border: 'border-emerald-500/40', dot: 'bg-emerald-400', hex: '#34d399' },
};

export function getCustomTags() {
  try {
    const saved = localStorage.getItem('sw_custom_tags');
    return saved ? JSON.parse(saved) : {};
  } catch { return {}; }
}

export function saveCustomTags(tags) {
  localStorage.setItem('sw_custom_tags', JSON.stringify(tags));
}

export function getAllTags() {
  const custom = getCustomTags();
  const merged = { ...DEFAULT_TAGS };
  // Overwrite hex colors from custom
  Object.keys(custom).forEach(tag => {
    if (merged[tag]) merged[tag] = { ...merged[tag], hex: custom[tag].hex };
    else merged[tag] = buildTagFromHex(tag, custom[tag].hex);
  });
  return merged;
}

export function buildTagFromHex(name, hex) {
  return {
    bg: `bg-[${hex}]/20`,
    text: `text-[${hex}]`,
    border: `border-[${hex}]/40`,
    dot: `bg-[${hex}]`,
    hex,
  };
}

function TagManager({ onClose }) {
  const [customTags, setCustomTags] = useState(getCustomTags);
  const [newTagName, setNewTagName] = useState('');
  const [newTagColor, setNewTagColor] = useState('#6366f1');

  const allTagNames = Array.from(new Set([...Object.keys(DEFAULT_TAGS), ...Object.keys(customTags)]));

  const getHex = (tag) => customTags[tag]?.hex || DEFAULT_TAGS[tag]?.hex || '#6366f1';

  const handleColorChange = (tag, hex) => {
    const updated = { ...customTags, [tag]: { hex } };
    setCustomTags(updated);
    saveCustomTags(updated);
  };

  const handleAddTag = () => {
    const name = newTagName.trim().toLowerCase().replace(/\s+/g, '-');
    if (!name || allTagNames.includes(name)) return;
    const updated = { ...customTags, [name]: { hex: newTagColor } };
    setCustomTags(updated);
    saveCustomTags(updated);
    setNewTagName('');
    setNewTagColor('#6366f1');
  };

  const handleRemoveCustom = (tag) => {
    if (DEFAULT_TAGS[tag]) return; // no borrar las predeterminadas
    const updated = { ...customTags };
    delete updated[tag];
    setCustomTags(updated);
    saveCustomTags(updated);
  };

  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center bg-black/60 backdrop-blur-sm" onClick={onClose}>
      <div className="w-full max-w-md bg-surface border border-border rounded-2xl shadow-2xl overflow-hidden animate-fade-in-up" onClick={e => e.stopPropagation()}>
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-5 border-b border-border">
          <div className="flex items-center gap-3">
            <Palette className="w-5 h-5 text-primary" />
            <h2 className="text-base font-bold text-textMain">Gestor de Etiquetas</h2>
          </div>
          <button onClick={onClose} className="p-2 rounded-lg hover:bg-surfaceHover text-textMuted hover:text-textMain transition-colors">
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Tag list */}
        <div className="px-6 py-4 space-y-3 max-h-[50vh] overflow-y-auto">
          {allTagNames.map(tag => {
            const hex = getHex(tag);
            const isDefault = !!DEFAULT_TAGS[tag];
            return (
              <div key={tag} className="flex items-center gap-3">
                {/* Color swatch + picker */}
                <label className="relative cursor-pointer shrink-0">
                  <div className="w-8 h-8 rounded-lg border-2 border-white/20 shadow-sm transition-transform hover:scale-110" style={{ backgroundColor: hex }} />
                  <input
                    type="color"
                    value={hex}
                    onChange={e => handleColorChange(tag, e.target.value)}
                    className="absolute inset-0 opacity-0 cursor-pointer w-full h-full"
                  />
                </label>
                {/* Name */}
                <span className="flex-1 text-sm font-bold text-textMain capitalize">{tag}</span>
                {/* Badge preview */}
                <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full border text-[10px] font-bold uppercase tracking-wider"
                  style={{ backgroundColor: `${hex}20`, color: hex, borderColor: `${hex}60` }}>
                  <span className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: hex }} />
                  {tag}
                </span>
                {!isDefault && (
                  <button onClick={() => handleRemoveCustom(tag)} className="p-1 text-textMuted hover:text-danger rounded-md transition-colors">
                    <X className="w-3.5 h-3.5" />
                  </button>
                )}
                {isDefault && <span className="text-[10px] text-textMuted/40 font-medium w-5" />}
              </div>
            );
          })}
        </div>

        {/* Add new tag */}
        <div className="px-6 py-4 border-t border-border">
          <p className="text-xs font-bold text-textMuted uppercase tracking-widest mb-3">Nueva etiqueta</p>
          <div className="flex gap-2 items-center">
            <label className="relative cursor-pointer shrink-0">
              <div className="w-8 h-8 rounded-lg border-2 border-white/20 shadow-sm" style={{ backgroundColor: newTagColor }} />
              <input type="color" value={newTagColor} onChange={e => setNewTagColor(e.target.value)} className="absolute inset-0 opacity-0 cursor-pointer w-full h-full" />
            </label>
            <input
              value={newTagName}
              onChange={e => setNewTagName(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && handleAddTag()}
              placeholder="Nombre de etiqueta..."
              className="flex-1 bg-background border border-border rounded-lg px-3 py-2 text-sm text-textMain outline-none focus:border-primary placeholder:text-textMuted"
            />
            <button onClick={handleAddTag} className="p-2 bg-primary hover:bg-primaryHover text-white rounded-lg transition-colors">
              <Plus className="w-4 h-4" />
            </button>
          </div>
        </div>

        <div className="px-6 py-4 bg-background/30 border-t border-border">
          <p className="text-[11px] text-textMuted/60">Haz clic en el círculo de color para cambiar el tono de cualquier etiqueta. Los cambios se guardan automáticamente.</p>
        </div>
      </div>
    </div>
  );
}

export default TagManager;
