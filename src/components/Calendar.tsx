import React, { useState } from 'react';
import { format, startOfMonth, endOfMonth, eachDayOfInterval, isSameMonth, isToday, isSameDay } from 'date-fns';
import { Event } from '../types';
import { Calendar as CalendarIcon, Filter, ChevronLeft, ChevronRight } from 'lucide-react';

interface CalendarProps {
  currentDate: Date;
  events: Event[];
  onDateClick: (date: Date) => void;
  countries: { code: string; name: string }[];
}

export const Calendar: React.FC<CalendarProps> = ({ currentDate, events, onDateClick, countries }) => {
  const [selectedCountries, setSelectedCountries] = useState<string[]>([]);
  const monthStart = startOfMonth(currentDate);
  const monthEnd = endOfMonth(currentDate);
  const days = eachDayOfInterval({ start: monthStart, end: monthEnd });

  const getEventsForDay = (date: Date) => {
    return events.filter(event => 
      isSameDay(event.date, date) && 
      (selectedCountries.length === 0 || selectedCountries.includes(event.country))
    );
  };

  return (
    <div className="bg-gray-900 rounded-lg shadow-xl p-6">
      {/* Calendar Header */}
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-2xl font-bold text-white flex items-center gap-2">
          <CalendarIcon className="w-6 h-6" />
          {format(currentDate, 'MMMM yyyy')}
        </h2>
        <div className="flex gap-2">
          <button
            onClick={() => onDateClick(new Date(currentDate.setMonth(currentDate.getMonth() - 1)))}
            className="p-2 hover:bg-gray-800 rounded-lg transition-colors"
          >
            <ChevronLeft className="w-6 h-6" />
          </button>
          <button
            onClick={() => onDateClick(new Date(currentDate.setMonth(currentDate.getMonth() + 1)))}
            className="p-2 hover:bg-gray-800 rounded-lg transition-colors"
          >
            <ChevronRight className="w-6 h-6" />
          </button>
        </div>
      </div>

      {/* Filter Section */}
      <div className="mb-6 bg-gray-800 rounded-lg p-4">
        <div className="flex items-center gap-2 mb-3">
          <Filter className="w-5 h-5 text-gray-400" />
          <h3 className="text-white font-medium">Filter Countries</h3>
        </div>
        <div className="flex flex-wrap gap-2">
          {countries.map(country => (
            <button
              key={country.code}
              onClick={() => {
                setSelectedCountries(prev =>
                  prev.includes(country.code)
                    ? prev.filter(c => c !== country.code)
                    : [...prev, country.code]
                );
              }}
              className={`
                px-3 py-1.5 rounded-full text-sm font-medium transition-colors
                ${selectedCountries.includes(country.code)
                  ? 'bg-blue-500 text-white'
                  : 'bg-gray-700 text-gray-300 hover:bg-gray-600'}
              `}
            >
              {country.name}
            </button>
          ))}
          {selectedCountries.length > 0 && (
            <button
              onClick={() => setSelectedCountries([])}
              className="px-3 py-1.5 rounded-full text-sm font-medium bg-red-500/10 text-red-400 hover:bg-red-500/20 transition-colors"
            >
              Clear All
            </button>
          )}
        </div>
      </div>

      {/* Calendar Grid */}
      <div className="grid grid-cols-7 gap-2">
        {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((day) => (
          <div key={day} className="text-gray-400 text-center font-semibold p-2">
            {day}
          </div>
        ))}
        {days.map((day) => {
          const dayEvents = getEventsForDay(day);
          const hasEvents = dayEvents.length > 0;
          
          return (
            <button
              key={day.toString()}
              onClick={() => onDateClick(day)}
              className={`
                min-h-[100px] p-2 rounded-lg transition-all relative
                ${!isSameMonth(day, currentDate) ? 'bg-gray-800/50' : 'bg-gray-800'}
                ${isToday(day) ? 'ring-2 ring-blue-500' : ''}
                ${hasEvents ? 'hover:scale-105' : 'hover:bg-gray-700'}
                focus:outline-none focus:ring-2 focus:ring-blue-500
              `}
            >
              <div className={`
                text-right mb-1 font-medium
                ${isToday(day) ? 'text-blue-400' : 'text-gray-300'}
              `}>
                {format(day, 'd')}
              </div>
              <div className="space-y-1">
                {dayEvents.slice(0, 3).map((event) => (
                  <div
                    key={event.id}
                    className="text-xs truncate rounded px-1.5 py-0.5 font-medium"
                    style={{ backgroundColor: event.color }}
                  >
                    {event.title}
                  </div>
                ))}
                {dayEvents.length > 3 && (
                  <div className="text-xs text-gray-400 pl-1.5">
                    +{dayEvents.length - 3} more
                  </div>
                )}
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
};