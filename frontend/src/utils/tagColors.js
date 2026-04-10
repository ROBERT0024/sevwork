// Mapa de colores de etiquetas — Secure Workspace
// Soporta colores predeterminados y personalizados persistidos en localStorage

const DEFAULT_TAGS = {
  trabajo:  { bg: 'bg-blue-500/10',    text: 'text-blue-400',    border: 'border-blue-500/30',    dot: 'bg-blue-400',    hex: '#60a5fa' },
  personal: { bg: 'bg-violet-500/10',  text: 'text-violet-400',  border: 'border-violet-500/30',  dot: 'bg-violet-400',  hex: '#a78bfa' },
  ideas:    { bg: 'bg-amber-500/10',   text: 'text-amber-400',   border: 'border-amber-500/30',   dot: 'bg-amber-400',   hex: '#fbbf24' },
  urgente:  { bg: 'bg-red-500/10',     text: 'text-red-400',     border: 'border-red-500/30',     dot: 'bg-red-400',     hex: '#f87171' },
  estudio:  { bg: 'bg-emerald-500/10', text: 'text-emerald-400', border: 'border-emerald-500/30', dot: 'bg-emerald-400', hex: '#34d399' },
};

function getCustomTags() {
  try {
    const saved = localStorage.getItem('sw_custom_tags');
    return saved ? JSON.parse(saved) : {};
  } catch { return {}; }
}

export const getAllTags = () => {
  const custom = getCustomTags();
  const merged = { ...DEFAULT_TAGS };
  Object.keys(custom).forEach(tag => {
    const hex = custom[tag].hex;
    merged[tag] = {
      bg: `bg-[${hex}]/10`,
      text: `text-[${hex}]`,
      border: `border-[${hex}]/30`,
      dot: `bg-[${hex}]`,
      hex,
      isCustom: true
    };
  });
  return merged;
};

export const TAG_OPTIONS = Object.keys(getAllTags());

export const getTagClasses = (tag) => {
  const all = getAllTags();
  if (all[tag]) return all[tag];
  return { bg: 'bg-border/30', text: 'text-textMuted', border: 'border-border', dot: 'bg-textMuted', hex: '#94a3b8' };
};

export const tagBadgeClass = (tag) => {
  const c = getTagClasses(tag);
  // Nota: Tailwind no soporta clases dinámicas tipo bg-[${hex}] sin estar en el safeList o ser inline style.
  // Pero aquí usamos clases pre-calculadas para DEFAULT o inline styles para personalizados.
  const base = `inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full border text-[10px] font-bold uppercase tracking-wider`;
  if (c.isCustom) return base;
  return `${base} ${c.bg} ${c.text} ${c.border}`;
};

// Como Tailwind no procesa strings dinámicos, para los personalizados usaremos inline styles en los componentes.
// Esta función ayuda a generar ese objeto de estilo.
export const getTagStyle = (tag) => {
  const c = getTagClasses(tag);
  if (!c.isCustom) return {};
  return {
    backgroundColor: `${c.hex}15`,
    color: c.hex,
    borderColor: `${c.hex}40`
  };
};
