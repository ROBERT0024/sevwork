// getColombianHolidays.js
export function getEaster(year) {
  const f = Math.floor;
  const G = year % 19;
  const C = f(year / 100);
  const H = (C - f(C / 4) - f((8 * C + 13) / 25) + 19 * G + 15) % 30;
  const I = H - f(H / 28) * (1 - f(29 / (H + 1)) * f((21 - G) / 11));
  const J = (year + f(year / 4) + I + 2 - C + f(C / 4)) % 7;
  const L = I - J;
  const month = 3 + f((L + 40) / 44);
  const day = L + 28 - 31 * f(month / 4);
  
  return new Date(year, month - 1, day);
}

export function getColombianHolidays(year) {
  const addDays = (date, days) => {
    const d = new Date(date);
    d.setDate(d.getDate() + days);
    return d;
  };

  const getNextMondayIfNeeded = (date) => {
    const d = new Date(date);
    const day = d.getDay();
    if (day !== 1) {
      const diff = (1 - day + 7) % 7;
      d.setDate(d.getDate() + diff);
    }
    return d;
  };

  const toStr = (date) => {
    return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
  };

  const holidays = [];

  const addHoliday = (dateObj, name) => {
    holidays.push({ date: toStr(dateObj), name });
  };

  // Fixed exact dates
  addHoliday(new Date(year, 0, 1), "Año Nuevo");
  addHoliday(new Date(year, 4, 1), "Día del Trabajo");
  addHoliday(new Date(year, 6, 20), "Grito de Independencia");
  addHoliday(new Date(year, 7, 7), "Batalla de Boyacá");
  addHoliday(new Date(year, 11, 8), "Inmaculada Concepción");
  addHoliday(new Date(year, 11, 25), "Navidad");

  // Moved to next Monday
  addHoliday(getNextMondayIfNeeded(new Date(year, 0, 6)), "Día de los Reyes Magos");
  addHoliday(getNextMondayIfNeeded(new Date(year, 2, 19)), "Día de San José");
  addHoliday(getNextMondayIfNeeded(new Date(year, 5, 29)), "San Pedro y San Pablo");
  addHoliday(getNextMondayIfNeeded(new Date(year, 7, 15)), "Asunción de la Virgen");
  addHoliday(getNextMondayIfNeeded(new Date(year, 9, 12)), "Día de la Raza");
  addHoliday(getNextMondayIfNeeded(new Date(year, 10, 1)), "Todos los Santos");
  addHoliday(getNextMondayIfNeeded(new Date(year, 10, 11)), "Independencia de Cartagena");

  // Easter related
  const easter = getEaster(year);
  addHoliday(addDays(easter, -3), "Jueves Santo");
  addHoliday(addDays(easter, -2), "Viernes Santo");
  addHoliday(addDays(easter, 43), "Ascensión del Señor");  // 39 + next Monday = 43
  addHoliday(addDays(easter, 64), "Corpus Christi");       // 60 + next Monday = 64
  addHoliday(addDays(easter, 71), "Sagrado Corazón de Jesús"); // 68 + next Monday = 71

  return holidays;
}

export function isHolidayOrWeekend(dateObj) {
  if (!dateObj) return { isOff: false };
  
  const day = dateObj.getDay();
  const isWeekend = day === 0 || day === 6; // Sunday or Saturday

  const year = dateObj.getFullYear();
  const holidays = getColombianHolidays(year);
  
  const dateStr = `${year}-${String(dateObj.getMonth() + 1).padStart(2, '0')}-${String(dateObj.getDate()).padStart(2, '0')}`;
  
  const holiday = holidays.find(h => h.date === dateStr);

  return {
    isOff: isWeekend || !!holiday,
    isWeekend,
    holidayName: holiday ? holiday.name : null
  };
}
