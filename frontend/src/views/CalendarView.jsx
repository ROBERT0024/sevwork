// CalendarView.jsx
import React, { useState, useEffect } from 'react';
import { getTasks } from '../services/api.js';
import { ChevronLeft, ChevronRight, CheckCircle2, Circle, X, Calendar as CalendarIcon, AlignLeft } from 'lucide-react';
import { isHolidayOrWeekend } from '../utils/holidays.js';

const MONTHS = ['Enero','Febrero','Marzo','Abril','Mayo','Junio','Julio','Agosto','Septiembre','Octubre','Noviembre','Diciembre'];
const DAYS   = ['Dom','Lun','Mar','Mié','Jue','Vie','Sáb'];
const PRIORITY_COLOR = { high: 'bg-red-400', medium: 'bg-orange-400', low: 'bg-green-400' };
const PRIORITY_TEXT  = { high: 'text-red-400', medium: 'text-orange-400', low: 'text-green-400' };

function CalendarView({ activeWorkspace }) {
  const today = new Date();
  const [year,  setYear]    = useState(today.getFullYear());
  const [month, setMonth]   = useState(today.getMonth());
  const [viewMode, setViewMode] = useState('month'); // month, week, day
  const [tasks, setTasks]   = useState([]);
  const [selected, setSelected] = useState(null);
  
  // Para la vista week/day, usamos 'currentDate' central
  const [currentDate, setCurrentDate] = useState(new Date());

  const isOverdue = (t) => t.due_date && !t.completed && new Date(t.due_date) < new Date();

  useEffect(() => {
    if (!activeWorkspace) return;
    getTasks(activeWorkspace).then(r => setTasks(r.data)).catch(() => {});
  }, [activeWorkspace]);

  const prev = () => {
    if (viewMode === 'month') {
      if (month === 0) { setMonth(11); setYear(y => y-1); } else setMonth(m => m-1);
    } else if (viewMode === 'week') {
      const d = new Date(currentDate); d.setDate(d.getDate() - 7); setCurrentDate(d);
    } else {
      const d = new Date(currentDate); d.setDate(d.getDate() - 1); setCurrentDate(d);
    }
  };

  const next = () => {
    if (viewMode === 'month') {
      if (month === 11) { setMonth(0); setYear(y => y+1); } else setMonth(m => m+1);
    } else if (viewMode === 'week') {
      const d = new Date(currentDate); d.setDate(d.getDate() + 7); setCurrentDate(d);
    } else {
      const d = new Date(currentDate); d.setDate(d.getDate() + 1); setCurrentDate(d);
    }
  };

  // Lógica de celdas Mensual
  const firstDay = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const monthCells = [];
  for (let i = 0; i < firstDay; i++) monthCells.push(null);
  for (let d = 1; d <= daysInMonth; d++) monthCells.push(new Date(year, month, d));
  // Fill remaining to create full rows 
  const remaining = (7 - (monthCells.length % 7)) % 7;
  for (let i = 0; i < remaining; i++) monthCells.push(null);

  // Lógica Semanal
  const getWeekCells = () => {
    const d = new Date(currentDate);
    const day = d.getDay();
    const diff = d.getDate() - day; // Adjust to Sunday
    const sunday = new Date(d.setDate(diff));
    const cells = [];
    for(let i = 0; i < 7; i++) {
        cells.push(new Date(sunday.getFullYear(), sunday.getMonth(), sunday.getDate() + i));
    }
    return cells;
  };

  // Filtrado de tareas nativo por Timezone
  const getTasksForDate = (dateObj) => {
    if (!dateObj) return [];
    return tasks.filter(t => {
      if (!t.due_date) return false;
      const dateOnlyStr = typeof t.due_date === 'string' ? t.due_date.split('T')[0] : '';
      if (!dateOnlyStr) return false;
      const [taskYear, taskMonth, taskDay] = dateOnlyStr.split('-');
      return parseInt(taskYear, 10) === dateObj.getFullYear() && 
             (parseInt(taskMonth, 10) - 1) === dateObj.getMonth() && 
             parseInt(taskDay, 10) === dateObj.getDate();
    });
  };

  const isTodayDate = (dateObj) => {
    if (!dateObj) return false;
    return dateObj.getDate() === today.getDate() && dateObj.getMonth() === today.getMonth() && dateObj.getFullYear() === today.getFullYear();
  };

  const renderCells = () => {
    let cellsToRender = [];
    if (viewMode === 'month') cellsToRender = monthCells;
    else if (viewMode === 'week') cellsToRender = getWeekCells();
    else cellsToRender = [currentDate]; // Day view

    if (viewMode === 'day') {
      const dayTasks = getTasksForDate(currentDate);
      const { isOff, holidayName } = isHolidayOrWeekend(currentDate);
      return (
        <div className={`col-span-7 p-6 rounded-xl border border-border min-h-[400px] ${isOff ? 'bg-red-500/5' : 'bg-surface'}`}>
           <h3 className="text-2xl font-bold text-textMain mb-6 flex items-center gap-3 flex-wrap">
             <CalendarIcon className="w-8 h-8 text-primary" />
             {currentDate.getDate()} de {MONTHS[currentDate.getMonth()]} del {currentDate.getFullYear()}
             {holidayName && <span className="text-sm px-3 py-1 bg-red-500/20 text-red-500 font-bold rounded-full">{holidayName}</span>}
             {isOff && !holidayName && <span className="text-sm px-3 py-1 bg-red-500/20 text-red-500 font-bold rounded-full">Fin de Semana</span>}
           </h3>
           {dayTasks.length === 0 ? (
             <div className="text-textMuted flex flex-col items-center justify-center p-10 opacity-70">
               <CheckCircle2 className="w-12 h-12 mb-3" />
               <p>No tienes tareas agendadas para este día.</p>
             </div>
           ) : (
             <div className="flex flex-col gap-3">
                {dayTasks.map(t => (
                  <div key={t.id} className="flex items-start gap-4 p-4 bg-background border border-border rounded-xl">
                    <div className="flex items-center gap-2 shrink-0 mt-1">
                      <div className={`w-2.5 h-2.5 rounded-full ${PRIORITY_COLOR[t.priority] || 'bg-primary'}`} />
                      {t.completed ? <CheckCircle2 className="w-5 h-5 text-success shrink-0" /> : <Circle className={`w-5 h-5 shrink-0 ${PRIORITY_TEXT[t.priority] || 'text-textMuted'}`} />}
                    </div>
                    <div className="flex-1">
                      <span className={`text-base font-bold ${t.completed ? 'text-textMuted line-through' : 'text-textMain'}`}>
                        {t.title}
                        {isOverdue(t) && <span className="text-danger ml-2">(Atrasada)</span>}
                      </span>
                      {t.description && <p className="text-sm text-textMuted mt-1">{t.description}</p>}
                    </div>
                  </div>
                ))}
             </div>
           )}
        </div>
      );
    }

    return cellsToRender.map((dateObj, i) => {
      const dayTasks = getTasksForDate(dateObj);
      const dayNum = dateObj ? dateObj.getDate() : null;
      const { isOff, holidayName, isWeekend } = isHolidayOrWeekend(dateObj);
      const isSelected = selected && dateObj && selected.day === dayNum && selected.month === dateObj.getMonth();
      const todayMark = isTodayDate(dateObj);

      return (
        <div 
          key={i}
          className={`p-2 transition-all relative border-t border-l border-border/50 ${viewMode==='week' ? 'min-h-[300px]' : 'min-h-[120px]'} ${!dateObj ? 'bg-background/20 opacity-50' : isOff ? 'bg-red-500/5 hover:bg-red-500/10 cursor-pointer' : 'bg-surface hover:bg-surfaceHover cursor-pointer'} ${isSelected ? 'ring-2 ring-inset ring-primary' : ''}`}
          onClick={() => dateObj && setSelected({ day: dayNum, month: dateObj.getMonth(), year: dateObj.getFullYear(), tasks: dayTasks, holidayName, isOff })}
        >
          {dateObj && (
            <>
              <div className="flex justify-between items-start mb-2">
                <span className={`inline-flex items-center justify-center w-7 h-7 rounded-full text-xs font-bold ${todayMark ? 'bg-primary text-white shadow-glow' : isOff ? 'text-red-400' : 'text-textMuted'}`}>
                  {dayNum} {viewMode === 'week' && <span className="ml-1 text-[10px] font-normal sm:hidden">{DAYS[dateObj.getDay()]}</span>}
                </span>
                {holidayName && <span className="text-[9px] text-red-500 font-bold bg-red-400/10 px-1.5 py-0.5 rounded truncate max-w-[70%] text-right">{holidayName}</span>}
              </div>
              
              {dayTasks.length > 0 && (
                <div className="flex flex-col gap-1 mt-1">
                  {dayTasks.slice(0, viewMode === 'week' ? 6 : 3).map((t, idx) => (
                    <div key={idx} className={`flex items-center gap-1.5 px-1.5 py-1 rounded bg-black/20 truncate group/task ${isOverdue(t) ? 'border border-danger/30' : ''}`}>
                      <div className={`w-1.5 h-1.5 rounded-full shrink-0 ${PRIORITY_COLOR[t.priority] || 'bg-primary'}`} />
                      <span className={`text-[10px] font-medium truncate ${t.completed ? 'line-through text-textMuted' : isOverdue(t) ? 'text-danger' : 'text-textMain'}`}>
                        {t.title}
                      </span>
                    </div>
                  ))}
                  {dayTasks.length > (viewMode === 'week' ? 6 : 3) && (
                    <span className="text-[10px] text-textMuted font-bold pl-1">+{dayTasks.length - (viewMode === 'week' ? 6 : 3)} más</span>
                  )}
                </div>
              )}
            </>
          )}
        </div>
      );
    });
  };

  const getHeaderTitle = () => {
    if (viewMode === 'month') return `${MONTHS[month]} ${year}`;
    if (viewMode === 'week')  return `Semana del ${currentDate.getDate()} de ${MONTHS[currentDate.getMonth()]}`;
    return `${currentDate.getDate()} ${MONTHS[currentDate.getMonth()]} ${currentDate.getFullYear()}`;
  };

  return (
    <div className="p-8 sm:p-12 max-w-6xl mx-auto h-full flex flex-col relative animate-fade-in-up">
      {/* Header and Controls */}
      <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between mb-8 gap-4">
        <h2 className="text-2xl font-bold text-textMain tracking-tight">Calendario</h2>
        
        <div className="flex flex-col sm:flex-row items-center gap-4">
          <div className="flex bg-surface p-1 rounded-xl border border-border shadow-sm">
            <button className={`px-4 py-1.5 rounded-lg text-xs font-bold transition-all ${viewMode === 'month' ? 'bg-primary text-white shadow-sm' : 'text-textMuted hover:text-textMain'}`} onClick={() => setViewMode('month')}>Mes</button>
            <button className={`px-4 py-1.5 rounded-lg text-xs font-bold transition-all ${viewMode === 'week' ? 'bg-primary text-white shadow-sm' : 'text-textMuted hover:text-textMain'}`} onClick={() => setViewMode('week')}>Semana</button>
            <button className={`px-4 py-1.5 rounded-lg text-xs font-bold transition-all ${viewMode === 'day' ? 'bg-primary text-white shadow-sm' : 'text-textMuted hover:text-textMain'}`} onClick={() => setViewMode('day')}>Día</button>
          </div>

          <div className="flex items-center gap-4 bg-surface border border-border px-4 py-1.5 rounded-xl shadow-sm">
            <button className="p-1 hover:bg-surfaceHover hover:text-primary rounded-md transition-colors text-textMuted" onClick={prev}><ChevronLeft className="w-5 h-5" /></button>
            <span className="text-sm font-bold text-textMain min-w-[140px] text-center uppercase tracking-wide">
              {getHeaderTitle()}
            </span>
            <button className="p-1 hover:bg-surfaceHover hover:text-primary rounded-md transition-colors text-textMuted" onClick={next}><ChevronRight className="w-5 h-5" /></button>
          </div>
        </div>
      </div>

      {/* Grid Container (Scrollable internally to fix overflow clipping) */}
      <div className="flex-1 overflow-y-auto pr-1 pb-4">
        <div className={`grid ${viewMode === 'day' ? 'grid-cols-1' : 'grid-cols-7'} gap-0 bg-border rounded-2xl overflow-hidden border border-border shadow-sm`}>
          {viewMode !== 'day' && DAYS.map(d => (
            <div key={d} className="bg-surface/80 py-3 text-center text-xs font-bold text-textMuted uppercase tracking-wider col-span-1">
              {d}
            </div>
          ))}
          {renderCells()}
        </div>
      </div>

      {/* Side Panel for Selected Day */}
      {selected && (
        <div className="fixed top-0 right-0 h-full w-[360px] md:w-[420px] bg-surface/95 backdrop-blur-3xl border-l border-white/10 shadow-2xl p-6 z-50 flex flex-col transform translate-x-0 transition-transform duration-300">
          <div className="flex justify-between items-start mb-8 border-b border-white/5 pb-4">
            <div>
              <div className="flex items-center gap-3 flex-wrap mb-1">
                <h3 className="text-xl font-bold text-textMain">{selected.day} de {MONTHS[selected.month]} {selected.year}</h3>
                {selected.holidayName && <span className="text-xs px-2 py-1 bg-red-500/20 text-red-500 font-bold rounded-lg">{selected.holidayName}</span>}
                {selected.isOff && !selected.holidayName && <span className="text-xs px-2 py-1 bg-red-500/20 text-red-500 font-bold rounded-lg">Fin de Semana</span>}
              </div>
              <p className="text-xs text-textMuted font-medium">Detalle de tareas agendadas</p>
            </div>
            <button className="p-2 bg-black/20 hover:bg-black/40 text-textMuted hover:text-white rounded-lg transition-colors border border-white/5" onClick={() => setSelected(null)}><X className="w-5 h-5" /></button>
          </div>
          
          <div className="flex-1 overflow-y-auto pr-2">
            {selected.tasks.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-full text-center text-textMuted opacity-60">
                <CheckCircle2 className="w-12 h-12 mb-3" />
                <p className="text-sm">No hay tareas para este día.</p>
              </div>
            ) : (
              <div className="flex flex-col gap-4">
                {selected.tasks.map(t => (
                  <div key={t.id} className="flex items-start gap-3 p-4 bg-black/20 border border-white/5 rounded-xl">
                    <div className="flex items-center gap-2 shrink-0 mt-1">
                      <div className={`w-2 h-2 rounded-full ${PRIORITY_COLOR[t.priority] || 'bg-primary'}`} />
                      {t.completed ? <CheckCircle2 className="w-4 h-4 text-success shrink-0" /> : <Circle className={`w-4 h-4 shrink-0 ${PRIORITY_TEXT[t.priority] || 'text-textMuted'}`} />}
                    </div>
                    <div className="flex-1 flex flex-col">
                      <span className={`text-sm tracking-wide font-bold mb-1 ${t.completed ? 'text-textMuted line-through' : 'text-textMain'}`}>
                        {t.title}
                        {isOverdue(t) && <span className="text-danger ml-2 font-bold">(Atrasada)</span>}
                      </span>
                      {t.description && <span className="text-xs text-textMuted flex items-start gap-1"><AlignLeft className="w-3 h-3 mt-0.5 shrink-0" /> {t.description}</span>}
                      {t.comments && (
                        <div className="mt-2 p-2 bg-primary/10 border-l border-primary rounded text-[10px] text-textMain italic">
                          <span className="font-bold not-italic">Bitácora:</span> {t.comments}
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

export default CalendarView;
