import React, { useState, useEffect } from 'react';
import { useCalendarCommitData } from '../hooks/useCalendarCommitData';

const MiniCalendar = () => {
  const [currentDate, setCurrentDate] = useState(new Date());
  const { hasCommitOnDate, fetchCommitDatesForMonth, loading } = useCalendarCommitData();
  
  // Get current month and year
  const currentMonth = currentDate.getMonth();
  const currentYear = currentDate.getFullYear();
  const today = new Date();
  
  // Fetch commit data when month changes
  useEffect(() => {
    fetchCommitDatesForMonth(currentYear, currentMonth);
  }, [currentYear, currentMonth, fetchCommitDatesForMonth]);
  
  // Get first day of month and number of days
  const firstDayOfMonth = new Date(currentYear, currentMonth, 1);
  const lastDayOfMonth = new Date(currentYear, currentMonth + 1, 0);
  const startingDayOfWeek = firstDayOfMonth.getDay();
  const daysInMonth = lastDayOfMonth.getDate();
  
  // Month names
  const monthNames = [
    "January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December"
  ];
  
  // Day names
  const dayNames = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
  
  // Generate calendar days
  const calendarDays = [];
  
  // Empty cells for days before month starts
  for (let i = 0; i < startingDayOfWeek; i++) {
    calendarDays.push(null);
  }
  
  // Days of the month
  for (let day = 1; day <= daysInMonth; day++) {
    calendarDays.push(day);
  }
  
  // Navigation functions
  const goToPreviousMonth = () => {
    setCurrentDate(new Date(currentYear, currentMonth - 1, 1));
  };
  
  const goToNextMonth = () => {
    setCurrentDate(new Date(currentYear, currentMonth + 1, 1));
  };
  
  // Check if a day is today
  const isToday = (day) => {
    if (!day) return false;
    return (
      day === today.getDate() &&
      currentMonth === today.getMonth() &&
      currentYear === today.getFullYear()
    );
  };
  
  // Check if a day has commits
  const hasCommitsOnDay = (day) => {
    if (!day) return false;
    const date = new Date(currentYear, currentMonth, day);
    return hasCommitOnDate(date);
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
          ‹
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
          ›
        </button>
      </div>
      
      <div className="calendar-weekdays">
        {dayNames.map(day => (
          <div key={day} className="calendar-weekday">
            {day}
          </div>
        ))}
      </div>
      
      <div className="calendar-days">
        {calendarDays.map((day, index) => (
          <div 
            key={index} 
            className={`calendar-day ${day ? 'has-day' : 'empty-day'} ${isToday(day) ? 'today' : ''} ${hasCommitsOnDay(day) ? 'has-commits' : ''}`}
          >
            {day && (
              <>
                <span className="day-number">{day}</span>
                {hasCommitsOnDay(day) && <div className="commit-indicator"></div>}
              </>
            )}
          </div>
        ))}
      </div>
      
      {loading && (
        <div className="calendar-loading">
          Loading commits...
        </div>
      )}
    </div>
  );
};

export default MiniCalendar;
