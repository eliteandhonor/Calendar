import React, { useState, useEffect } from 'react';
import { Globe, ChevronLeft, ChevronRight, Download } from 'lucide-react';
import { Event, Country } from './types';
import { Calendar } from './components/Calendar';
import { CountryList } from './components/CountryList';
import { CountryFilter } from './components/CountryFilter';
import { fetchCountries } from './services/api';
import { fetchHolidays } from './services/holidays';
import { generatePDF } from './utils/pdf';

export default function App() {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [events, setEvents] = useState<Event[]>([]);
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [selectedCountry, setSelectedCountry] = useState<string | null>(null);
  const [selectedCalendarCountries, setSelectedCalendarCountries] = useState<string[]>([]);
  const [showFilter, setShowFilter] = useState(false);
  const [countries, setCountries] = useState<Country[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadData = async () => {
      try {
        const [countriesData, holidaysData] = await Promise.all([
          fetchCountries(),
          fetchHolidays(new Date().getFullYear())
        ]);
        setCountries(countriesData);
        setEvents(holidaysData);
      } catch (error) {
        console.error('Failed to load data:', error);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, []);

  const handlePrevMonth = () => setCurrentDate(subMonths(currentDate, 1));
  const handleNextMonth = () => setCurrentDate(addMonths(currentDate, 1));

  const handleExport = () => {
    generatePDF(events, new Date(currentDate.getFullYear(), 0, 1), new Date(currentDate.getFullYear(), 11, 31));
  };

  const handleToggleCountry = (code: string) => {
    setSelectedCalendarCountries(prev => 
      prev.includes(code) 
        ? prev.filter(c => c !== code)
        : [...prev, code]
    );
  };

  const filteredEvents = selectedCountry
    ? events.filter(event => event.country === selectedCountry)
    : events;

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-950 text-white flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
          <p className="text-lg">Loading calendar data...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-950 text-white p-4 md:p-8">
      <div className="max-w-[1920px] mx-auto">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-blue-500 to-purple-500 bg-clip-text text-transparent flex items-center gap-3">
            <Globe className="w-8 h-8 md:w-10 md:h-10" />
            World Calendar
          </h1>
          <button
            onClick={handleExport}
            className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 flex items-center gap-2"
          >
            <Download className="w-4 h-4" />
            Export
          </button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          <div className="lg:col-span-3 h-[calc(100vh-12rem)] overflow-hidden">
            <CountryList
              countries={countries}
              selectedCountry={selectedCountry}
              onSelectCountry={setSelectedCountry}
            />
          </div>
          
          <div className="lg:col-span-9">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-2xl font-semibold">
                Events & Holidays
              </h2>
              <div className="flex gap-2">
                <button
                  onClick={handlePrevMonth}
                  className="p-2 hover:bg-gray-800 rounded-lg transition-colors"
                >
                  <ChevronLeft className="w-6 h-6" />
                </button>
                <button
                  onClick={handleNextMonth}
                  className="p-2 hover:bg-gray-800 rounded-lg transition-colors"
                >
                  <ChevronRight className="w-6 h-6" />
                </button>
              </div>
            </div>

            <Calendar
              currentDate={currentDate}
              events={filteredEvents}
              onDateClick={setSelectedDate}
              selectedCountries={selectedCalendarCountries}
              onToggleFilter={() => setShowFilter(true)}
            />
          </div>
        </div>

        {showFilter && (
          <CountryFilter
            countries={countries}
            selectedCountries={selectedCalendarCountries}
            onSelectCountry={handleToggleCountry}
            onClose={() => setShowFilter(false)}
          />
        )}
      </div>
    </div>
  );
}