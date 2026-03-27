import { useState, useEffect, useCallback } from 'react';
import { useCalendarCommitData } from '../hooks/useCalendarCommitData';
import { LuChevronLeft, LuChevronRight, LuGitCommitHorizontal, LuX } from 'react-icons/lu';

const DAY_NAMES_SHORT = ["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"];
const MONTH_NAMES = [
  "January","February","March","April","May","June",
  "July","August","September","October","November","December"
];

const MiniCalendar = () => {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [flippedDay, setFlippedDay] = useState(null);
  const { getCommitCount, getCommitDetails, fetchCommitDatesForMonth, loading } = useCalendarCommitData();

  const currentMonth = currentDate.getMonth();
  const currentYear  = currentDate.getFullYear();
  const today        = new Date();

  useEffect(() => {
    fetchCommitDatesForMonth(currentYear, currentMonth);
    setFlippedDay(null);
  }, [currentYear, currentMonth, fetchCommitDatesForMonth]);

  const firstDayOfMonth   = new Date(currentYear, currentMonth, 1);
  const startingDayOfWeek = firstDayOfMonth.getDay();
  const daysInMonth       = new Date(currentYear, currentMonth + 1, 0).getDate();

  const calendarDays = [];
  for (let i = 0; i < startingDayOfWeek; i++) calendarDays.push(null);
  for (let d = 1; d <= daysInMonth; d++) calendarDays.push(d);

  const goToPrev  = () => setCurrentDate(new Date(currentYear, currentMonth - 1, 1));
  const goToNext  = () => setCurrentDate(new Date(currentYear, currentMonth + 1, 1));
  const goToToday = () => setCurrentDate(new Date());

  const isToday = (day) =>
    day &&
    day === today.getDate() &&
    currentMonth === today.getMonth() &&
    currentYear === today.getFullYear();

  const getIntensityClass = (count) => {
    if (count === 0) return '';
    if (count <= 2)  return 'commits-level-1';
    if (count <= 5)  return 'commits-level-2';
    return 'commits-level-3';
  };

  const handleCellClick = useCallback((day) => {
    if (!day) return;
    setFlippedDay(prev => prev === day ? null : day);
  }, []);

  return (
    <div className="mini-calendar" onClick={(e) => {
      if (e.target.closest('.calendar-cell')) return;
      setFlippedDay(null);
    }}>

      {/* ── Header ── */}
      <div className="calendar-header">
        <button className="calendar-nav-btn" onClick={goToPrev} aria-label="Previous month" disabled={loading}>
          <LuChevronLeft size={12} />
        </button>
        <button className="calendar-title-btn" onClick={goToToday} title="Jump to today">
          {MONTH_NAMES[currentMonth]} {currentYear}
        </button>
        <button className="calendar-nav-btn" onClick={goToNext} aria-label="Next month" disabled={loading}>
          <LuChevronRight size={12} />
        </button>
      </div>

      {/* ── Weekday labels ── */}
      <div className="calendar-weekdays">
        {DAY_NAMES_SHORT.map(d => (
          <div key={d} className="calendar-weekday">{d}</div>
        ))}
      </div>

      {/* ── Day grid ── */}
      <div className="calendar-grid">
        {calendarDays.map((day, idx) => {
          if (!day) return <div key={idx} className="calendar-cell empty-cell" />;

          const date    = new Date(currentYear, currentMonth, day);
          const count   = getCommitCount(date);
          const details = getCommitDetails(date);
          const isFlipped = flippedDay === day;
          const todayCell = isToday(day);
          const intensity = getIntensityClass(count);

          const dateLabel = `${MONTH_NAMES[currentMonth].slice(0,3)} ${day}`;

          return (
            <div
              key={idx}
              className={`calendar-cell has-day ${todayCell ? 'today' : ''} ${intensity} ${isFlipped ? 'flipped' : ''}`}
              onClick={() => handleCellClick(day)}
              role="button"
              tabIndex={0}
              aria-label={`${dateLabel}: ${count} commit${count !== 1 ? 's' : ''}`}
              onKeyDown={(e) => e.key === 'Enter' && handleCellClick(day)}
            >
              <div className="cell-inner">

                {/* ── Front face ── */}
                <div className="cell-face cell-front">
                  <span className="cell-day">{day}</span>
                  {count > 0 ? (
                    <span className="cell-count">{count}</span>
                  ) : (
                    <span className="cell-empty-dot" />
                  )}
                </div>

                {/* ── Back face ── */}
                <div className="cell-face cell-back">
                  <div className="back-header">
                    <span className="back-date">{day}</span>
                    <LuX size={8} className="back-close-hint" />
                  </div>
                  {count > 0 ? (
                    <>
                      <div className="back-commits">
                        <LuGitCommitHorizontal size={8} />
                        <span>{count}</span>
                      </div>
                      <div className="back-repos">
                        {details.repos.slice(0, 3).map(repo => (
                          <span key={repo} className="back-repo-tag">{repo}</span>
                        ))}
                      </div>
                    </>
                  ) : (
                    <span className="back-empty">—</span>
                  )}
                </div>

              </div>
            </div>
          );
        })}
      </div>

      {/* ── Legend ── */}
      <div className="calendar-legend">
        <span className="legend-label">Less</span>
        <span className="legend-swatch level-0" />
        <span className="legend-swatch level-1" />
        <span className="legend-swatch level-2" />
        <span className="legend-swatch level-3" />
        <span className="legend-label">More</span>
      </div>

      {loading && (
        <div className="calendar-loading">
          <span className="loading-dot" />
          <span className="loading-dot" />
          <span className="loading-dot" />
        </div>
      )}
    </div>
  );
};

export default MiniCalendar;
