// CalendarView.jsx — Calendario mensual con tareas por día
import React, { useState, useEffect } from 'react';
import { getTasks } from '../services/api.js';

const MONTHS = ['Enero','Febrero','Marzo','Abril','Mayo','Junio','Julio','Agosto','Septiembre','Octubre','Noviembre','Diciembre'];
const DAYS   = ['Dom','Lun','Mar','Mié','Jue','Vie','Sáb'];
const PRIORITY_COLOR = { high:'#ef4444', medium:'#f59e0b', low:'#22c55e' };

function CalendarView({ activeWorkspace }) {
  const today = new Date();
  const [year,  setYear]    = useState(today.getFullYear());
  const [month, setMonth]   = useState(today.getMonth());
  const [tasks, setTasks]   = useState([]);
  const [selected, setSelected] = useState(null);

  useEffect(() => {
    if (!activeWorkspace) return;
    getTasks(activeWorkspace).then(r => setTasks(r.data)).catch(() => {});
  }, [activeWorkspace]);

  const prevMonth = () => { if (month === 0) { setMonth(11); setYear(y => y-1); } else setMonth(m => m-1); };
  const nextMonth = () => { if (month === 11) { setMonth(0); setYear(y => y+1); } else setMonth(m => m+1); };

  const firstDay    = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const cells = [];
  for (let i = 0; i < firstDay; i++) cells.push(null);
  for (let d = 1; d <= daysInMonth; d++) cells.push(d);

  const getTasksForDay = (day) => {
    if (!day) return [];
    return tasks.filter(t => {
      if (!t.due_date) return false;
      const dd = new Date(t.due_date);
      return dd.getFullYear() === year && dd.getMonth() === month && dd.getDate() === day;
    });
  };
  const isToday = (day) => day === today.getDate() && month === today.getMonth() && year === today.getFullYear();

  return (
    <div className="view-calendar">
      <div className="cal-header">
        <button className="cal-nav-btn" onClick={prevMonth}>‹</button>
        <h2 className="cal-title">{MONTHS[month]} {year}</h2>
        <button className="cal-nav-btn" onClick={nextMonth}>›</button>
      </div>
      <div className="cal-grid">
        {DAYS.map(d => <div key={d} className="cal-day-label">{d}</div>)}
        {cells.map((day, i) => {
          const dayTasks  = getTasksForDay(day);
          const isSelected = selected?.day === day;
          return (
            <div key={i}
              className={`cal-cell ${!day ? 'empty' : ''} ${isToday(day) ? 'today' : ''} ${isSelected ? 'selected' : ''} ${dayTasks.length ? 'has-tasks' : ''}`}
              onClick={() => day && setSelected({ day, tasks: dayTasks })}>
              {day && (
                <>
                  <span className="cal-day-num">{day}</span>
                  {dayTasks.length > 0 && (
                    <div className="cal-task-dots">
                      {dayTasks.slice(0,3).map((t, idx) => <span key={idx} className="cal-dot" style={{ background: PRIORITY_COLOR[t.priority] || '#6366f1' }} />)}
                      {dayTasks.length > 3 && <span className="cal-dot-more">+{dayTasks.length-3}</span>}
                    </div>
                  )}
                </>
              )}
            </div>
          );
        })}
      </div>
      {selected && (
        <div className="cal-day-panel">
          <div className="cal-day-panel-header">
            <h3>{selected.day} de {MONTHS[month]}</h3>
            <button className="cal-panel-close" onClick={() => setSelected(null)}>✕</button>
          </div>
          {selected.tasks.length === 0 ? <div className="cal-day-empty">Sin tareas para este día.</div> : (
            <ul className="cal-day-tasks">
              {selected.tasks.map(t => (
                <li key={t.id} className="cal-task-item">
                  <span style={{ color: PRIORITY_COLOR[t.priority] }}>●</span>
                  <span className={t.completed ? 'line-through' : ''}>{t.title}</span>
                  {t.completed && <span className="cal-done-badge">✓</span>}
                </li>
              ))}
            </ul>
          )}
        </div>
      )}
      <div className="cal-legend">
        <span><span className="legend-dot" style={{ background:'#ef4444' }}/> Alta</span>
        <span><span className="legend-dot" style={{ background:'#f59e0b' }}/> Media</span>
        <span><span className="legend-dot" style={{ background:'#22c55e' }}/> Baja</span>
      </div>
    </div>
  );
}

export default CalendarView;
