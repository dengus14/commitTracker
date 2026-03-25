import { useState, useEffect } from 'react';
import { useCalendarCommitData } from '../hooks/useCalendarCommitData';
import { LuChevronLeft, LuChevronRight } from 'react-icons/lu';

const MiniCalendar = () => {
  const [currentDate, setCurrentDate] = useState(new Date());
  const { getCommitCount, fetchCommitDatesForMonth, loading } = useCalendarCommitData();

  const currentMonth = currentDate.getMonth();
  const currentYear = currentDate.getFullYear();
  const today = new Date();

  useEffect(() => {
    fetchCommitDatesForMonth(currentYear, currentMonth);
  }, [currentYear, currentMonth, fetchCommitDatesForMonth]);

  const firstDayOfMonth = new Date(currentYear, currentMonth, 1);
  const lastDayOfMonth = new Date(currentYear, currentMonth + 1, 0);
  const startingDayOfWeek = firstDayOfMonth.getDay();
  const daysInMonth = lastDayOfMonth.getDate();

  const monthNames = [
    "January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December"
  ];

  const dayNames = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

  const calendarDays = [];
  for (let i = 0; i < startingDayOfWeek; i++) calendarDays.push(null);
  for (let day = 1; day <= daysInMonth; day++) calendarDays.push(day);

  const goToPreviousMonth = () => setCurrentDate(new Date(currentYear, currentMonth - 1, 1));
  const goToNextMonth = () => setCurrentDate(new Date(currentYear, currentMonth + 1, 1));

  const isToday = (day) =>
    day &&
    day === today.getDate() &&
    currentMonth === today.getMonth() &&
    currentYear === today.getFullYear();

  const getIntensityClass = (day) => {
    if (!day) return '';
    const count = getCommitCount(new Date(currentYear, currentMonth, day));
    if (count === 0) return '';
    if (count <= 2) return 'commits-level-1';
    if (count <= 5) return 'commits-level-2';
    return 'commits-level-3';
  };

  const getTooltip = (day) => {
    if (!day) return undefined;
    const count = getCommitCount(new Date(currentYear, currentMonth, day));
    if (count === 0) return undefined;
    const monthName = monthNames[currentMonth];
    return `${count} commit${count !== 1 ? 's' : ''} on ${monthName} ${day}`;
  };

  return (
    <div className="mini-calendar">
      <div className="calendar-header">
        <button
          className="calendar-nav-btn"
          onClick={goToPreviousMonth}
          aria-label="Previous month"
          disabled={loading}
        >
          <LuChevronLeft size={14} />
        </button>
        <h3 className="calendar-title">
          {monthNames[currentMonth]} {currentYear}
        </h3>
        <button
          className="calendar-nav-btn"
          onClick={goToNextMonth}
          aria-label="Next month"
          disabled={loading}
        >
          <LuChevronRight size={14} />
        </button>
      </div>

      <div className="calendar-weekdays">
        {dayNames.map(day => (
          <div key={day} className="calendar-weekday">{day}</div>
        ))}
      </div>

      <div className="calendar-days">
        {calendarDays.map((day, index) => {
          const intensityClass = getIntensityClass(day);
          const tooltip = getTooltip(day);
          return (
            <div
              key={index}
              className={`calendar-day ${day ? 'has-day' : 'empty-day'} ${isToday(day) ? 'today' : ''} ${intensityClass}`}
              title={tooltip}
            >
              {day && <span className="day-number">{day}</span>}
            </div>
          );
        })}
      </div>

      {loading && (
        <div className="calendar-loading">Loading commits...</div>
      )}
    </div>
  );
};

export default MiniCalendar;
