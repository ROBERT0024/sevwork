// HomeView.jsx
import React, { useEffect, useState, useMemo } from 'react';
import { getNotes, getTasks } from '../services/api.js';
import { FileText, CheckCircle2, Star, Clock, Plus, Users, CalendarDays, Pin, ArrowRight, Flame, TrendingUp, PieChart as PieIcon } from 'lucide-react';
import { getTagClasses, tagBadgeClass, getTagStyle } from '../utils/tagColors.js';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell, PieChart, Pie } from 'recharts';

function HomeView({ onNavigate, onOpenNote, activeWorkspace }) {
  const [notes, setNotes] = useState([]);
  const [tasks, setTasks] = useState([]);

  useEffect(() => {
    if (!activeWorkspace) return;
    getNotes(activeWorkspace).then(r => setNotes(r.data)).catch(() => {});
    getTasks(activeWorkspace).then(r => setTasks(r.data)).catch(() => {});
  }, [activeWorkspace]);

  const completed = tasks.filter(t => t.completed).length;
  const pending   = tasks.filter(t => !t.completed).length;
  // Bug fix: Count both pinned notes and pinned tasks correctly
  const pinnedNotes = notes.filter(n => n.is_pinned && !n.is_deleted).length;
  const pinnedTasks = tasks.filter(t => t.is_pinned && !t.is_deleted).length;
  const pinned = pinnedNotes + pinnedTasks;
  const progress  = tasks.length ? Math.round((completed / tasks.length) * 100) : 0;
  const hour      = new Date().getHours();
  const greeting  = hour < 12 ? 'Buenos días' : hour < 18 ? 'Buenas tardes' : 'Buenas noches';

  // --- Feature 5: Streak Logic ---
  const streak = useMemo(() => {
    if (tasks.length === 0) return 0;
    const completedDates = tasks
      .filter(t => t.completed && t.updated_at)
      .map(t => new Date(t.updated_at).toDateString());
    
    const uniqueDates = Array.from(new Set(completedDates));
    if (uniqueDates.length === 0) return 0;

    let currentStreak = 0;
    let today = new Date();
    today.setHours(0,0,0,0);
    
    // Check if at least one was completed today or yesterday to maintain streak
    const yesterday = new Date(today);
    yesterday.setDate(today.getDate() - 1);

    const hasToday = uniqueDates.includes(today.toDateString());
    const hasYesterday = uniqueDates.includes(yesterday.toDateString());

    if (!hasToday && !hasYesterday) return 0;

    let checkDate = hasToday ? today : yesterday;
    while (uniqueDates.includes(checkDate.toDateString())) {
      currentStreak++;
      checkDate.setDate(checkDate.getDate() - 1);
    }
    return currentStreak;
  }, [tasks]);

  // --- Feature 1: Charts Data ---
  const chartData = [
    { name: 'Completadas', value: completed, color: '#10b981' },
    { name: 'Pendientes',  value: pending,   color: '#6366f1' },
  ];

  const tagData = useMemo(() => {
    const counts = {};
    notes.forEach(n => {
      const t = n.tag || 'Sin etiqueta';
      counts[t] = (counts[t] || 0) + 1;
    });
    return Object.keys(counts).map(name => ({
      name,
      value: counts[name],
      color: getTagClasses(name).hex || '#94a3b8'
    })).sort((a, b) => b.value - a.value);
  }, [notes]);

  return (
    <div className="p-8 sm:p-12 max-w-6xl mx-auto animate-fade-in-up">
      
      {/* Hero */}
      <div className="mb-10 flex flex-col md:flex-row md:items-end md:justify-between gap-6">
        <div>
          <h1 className="text-3xl font-extrabold text-textMain mb-1">{greeting} 👋</h1>
          <p className="text-textMuted text-sm font-medium">Tu espacio de trabajo seguro y organizado.</p>
        </div>
        
        {/* Streak Badge */}
        {streak > 0 && (
          <div className="flex items-center gap-3 bg-orange-500/10 border border-orange-500/20 px-4 py-2 rounded-2xl animate-pulse">
            <Flame className="w-6 h-6 text-orange-500 fill-orange-500" />
            <div>
              <p className="text-xs font-bold text-orange-500 uppercase tracking-widest leading-none mb-0.5">Racha Actual</p>
              <p className="text-xl font-black text-orange-400 leading-none">{streak} días</p>
            </div>
          </div>
        )}
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-10">
        <div className="bg-surface border border-border hover:border-primary/50 hover:bg-surfaceHover p-5 rounded-2xl cursor-pointer transition-all shadow-sm group" onClick={() => onNavigate('notes')}>
          <FileText className="w-6 h-6 text-primary mb-3 group-hover:scale-110 transition-transform" />
          <div className="text-2xl font-black text-textMain leading-none mb-1">{notes.length}</div>
          <div className="text-xs font-semibold text-textMuted uppercase tracking-wider">Notas</div>
        </div>
        
        <div className="bg-surface border border-border hover:border-success/50 hover:bg-surfaceHover p-5 rounded-2xl cursor-pointer transition-all shadow-sm group" onClick={() => onNavigate('tasks')}>
          <CheckCircle2 className="w-6 h-6 text-success mb-3 group-hover:scale-110 transition-transform" />
          <div className="text-2xl font-black text-textMain leading-none mb-1">{completed}/{tasks.length}</div>
          <div className="text-xs font-semibold text-textMuted uppercase tracking-wider">Completadas</div>
        </div>

        <div className="bg-surface border border-border hover:border-warning/50 hover:bg-surfaceHover p-5 rounded-2xl cursor-pointer transition-all shadow-sm group" onClick={() => onNavigate('favorites')}>
          <Star className="w-6 h-6 text-warning mb-3 group-hover:scale-110 transition-transform" />
          <div className="text-2xl font-black text-textMain leading-none mb-1">{pinned}</div>
          <div className="text-xs font-semibold text-textMuted uppercase tracking-wider">Favoritos</div>
        </div>

        <div className="bg-surface border border-border hover:border-primary/50 hover:bg-surfaceHover p-5 rounded-2xl cursor-pointer transition-all shadow-sm group" onClick={() => onNavigate('tasks')}>
          <TrendingUp className="w-6 h-6 text-primaryLight mb-3 group-hover:scale-110 transition-transform" />
          <div className="text-2xl font-black text-textMain leading-none mb-1">{progress}%</div>
          <div className="text-xs font-semibold text-textMuted uppercase tracking-wider">Productividad</div>
        </div>
      </div>

      {/* Feature 1: Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-10">
        {/* Task Chart */}
        <div className="bg-surface border border-border rounded-2xl p-6 shadow-sm">
          <h3 className="text-xs font-bold text-textMuted uppercase tracking-widest mb-6 flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-success" /> Distribución de Tareas
          </h3>
          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#334155" vertical={false} />
                <XAxis dataKey="name" stroke="#94a3b8" fontSize={12} tickLine={false} axisLine={false} />
                <YAxis stroke="#94a3b8" fontSize={12} tickLine={false} axisLine={false} />
                <Tooltip 
                  contentStyle={{ backgroundColor: 'var(--surface)', border: '1px solid var(--border)', borderRadius: '12px' }}
                  itemStyle={{ fontSize: '12px', fontWeight: 'bold', color: 'var(--text-main)' }}
                  labelStyle={{ color: 'var(--text-muted)' }}
                  cursor={{ fill: 'transparent' }}
                />
                <Bar 
                  dataKey="value" 
                  radius={[4, 4, 0, 0]} 
                  barSize={40}
                  activeBar={{ fill: 'var(--text-main)', filter: 'drop-shadow(0 0 8px var(--primary))' }}
                >
                  {chartData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Tag Chart */}
        <div className="bg-surface border border-border rounded-2xl p-6 shadow-sm">
          <h3 className="text-xs font-bold text-textMuted uppercase tracking-widest mb-6 flex items-center gap-2">
            <PieIcon className="w-4 h-4 text-primary" /> Uso de Etiquetas
          </h3>
          <div className="h-64 w-full flex items-center">
            <div className="flex-1 h-full">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={tagData}
                    innerRadius={60}
                    outerRadius={80}
                    paddingAngle={5}
                    dataKey="value"
                  >
                    {tagData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip 
                    contentStyle={{ backgroundColor: 'var(--surface)', border: '1px solid var(--border)', borderRadius: '12px' }}
                    itemStyle={{ fontSize: '13px', fontWeight: 'bold', color: 'var(--text-main)' }}
                    labelStyle={{ color: 'var(--text-muted)' }}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>
            <div className="w-44 space-y-3">
              {tagData.slice(0, 5).map((t, i) => (
                <div key={i} className="flex items-center gap-2.5">
                  <div className="w-2.5 h-2.5 rounded-full shadow-sm" style={{ backgroundColor: t.color }} />
                  <span className="text-xs font-bold text-textMain capitalize truncate">{t.name}</span>
                  <span className="text-xs font-medium text-textMuted ml-auto">{t.value}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Progress Bar (Reduced) */}
      {tasks.length > 0 && (
        <div className="bg-surface border border-border rounded-2xl p-6 mb-10 overflow-hidden relative">
          <div className="flex justify-between items-end mb-3">
            <span className="text-xs font-bold text-textMuted uppercase tracking-wide">Meta Semanal</span>
            <span className="text-base font-black text-success">{progress}%</span>
          </div>
          <div className="h-1.5 w-full bg-border rounded-full overflow-hidden">
            <div className="h-full bg-gradient-to-r from-primary to-success transition-all duration-700 ease-out" style={{ width: `${progress}%` }} />
          </div>
        </div>
      )}

      {/* Recent Notes */}
      <div className="mb-10">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-base font-bold text-textMain flex items-center gap-2">
            <Clock className="w-4 h-4 text-primary" /> Notas recientes
          </h2>
          <button className="text-sm font-semibold text-primary hover:text-primaryHover transition-colors flex items-center gap-1" onClick={() => onNavigate('notes')}>
            Ver todas <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {notes.length === 0 ? (
            <div className="col-span-full border-2 border-dashed border-border rounded-2xl p-10 flex flex-col items-center justify-center text-center cursor-pointer hover:border-primary/50 hover:bg-surface/50 transition-all" onClick={() => onNavigate('notes')}>
              <FileText className="w-10 h-10 text-textMuted mb-3" />
              <p className="text-sm text-textMuted"><strong className="text-textMain block mb-1">Crea la primera nota</strong>Tu espacio está vacío</p>
            </div>
          ) : notes.slice(0, 3).map(note => (
            <div key={note.id} className="bg-surface border border-border rounded-xl p-5 cursor-pointer hover:border-primary/50 hover:shadow-glow transition-all relative group" onClick={() => onOpenNote(note)}>
              {note.is_pinned && <Star className="w-3.5 h-3.5 text-white absolute top-4 right-4 fill-white" />}
              <h3 className="text-sm font-bold text-textMain mb-2 pr-6 truncate">{note.title}</h3>
              <p className="text-xs text-textMuted leading-relaxed mb-4 line-clamp-2">{note.content || 'Sin contenido...'}</p>
              {note.tag && (
                <span className={tagBadgeClass(note.tag)} style={getTagStyle(note.tag)}>
                  <span className={`w-1.5 h-1.5 rounded-full ${getTagClasses(note.tag).dot}`} style={getTagClasses(note.tag).isCustom ? { backgroundColor: getTagClasses(note.tag).hex } : {}} />
                  {note.tag}
                </span>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Quick Actions */}
      <div>
        <h2 className="text-base font-bold text-textMain mb-4">Acciones rápidas</h2>
        <div className="flex flex-wrap gap-3">
          <button className="flex items-center gap-2 bg-surface hover:bg-surfaceHover hover:text-primary border border-border hover:border-primary px-4 py-2.5 rounded-xl text-sm font-semibold text-textMuted transition-all shadow-sm" onClick={() => onNavigate('notes')}>
            <Plus className="w-4 h-4" /> Nueva nota
          </button>
          <button className="flex items-center gap-2 bg-surface hover:bg-surfaceHover hover:text-success border border-border hover:border-success px-4 py-2.5 rounded-xl text-sm font-semibold text-textMuted transition-all shadow-sm" onClick={() => onNavigate('tasks')}>
            <CheckCircle2 className="w-4 h-4" /> Nueva tarea
          </button>
          <button className="flex items-center gap-2 bg-surface hover:bg-surfaceHover hover:text-warning border border-border hover:border-warning px-4 py-2.5 rounded-xl text-sm font-semibold text-textMuted transition-all shadow-sm" onClick={() => onNavigate('calendar')}>
            <CalendarDays className="w-4 h-4" /> Ver calendario
          </button>
          <button className="flex items-center gap-2 bg-surface hover:bg-surfaceHover hover:text-primary border border-border hover:border-primary px-4 py-2.5 rounded-xl text-sm font-semibold text-textMuted transition-all shadow-sm" onClick={() => onNavigate('shared')}>
            <Users className="w-4 h-4" /> Invitar equipo
          </button>
        </div>
      </div>

    </div>
  );
}

export default HomeView;
