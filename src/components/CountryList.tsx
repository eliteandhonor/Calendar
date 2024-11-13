import React, { useState, useEffect } from 'react';
import { Search, MapPin, Clock } from 'lucide-react';
import { Country } from '../types';

interface CountryListProps {
  countries: Country[];
  selectedCountry: string | null;
  onSelectCountry: (countryCode: string) => void;
}

export const CountryList: React.FC<CountryListProps> = ({
  countries,
  selectedCountry,
  onSelectCountry
}) => {
  const [search, setSearch] = useState('');
  const [times, setTimes] = useState<Record<string, string>>({});

  useEffect(() => {
    const updateTimes = () => {
      const newTimes: Record<string, string> = {};
      countries.forEach(country => {
        const time = new Date().toLocaleTimeString('en-US', {
          timeZone: country.timezone,
          hour: '2-digit',
          minute: '2-digit',
          second: '2-digit',
          hour12: true
        });
        newTimes[country.code] = time;
      });
      setTimes(newTimes);
    };

    updateTimes();
    const interval = setInterval(updateTimes, 1000);
    return () => clearInterval(interval);
  }, [countries]);

  const filteredCountries = countries.filter(country =>
    country.name.toLowerCase().includes(search.toLowerCase()) ||
    country.capital.toLowerCase().includes(search.toLowerCase())
  );

  const handleCountryClick = async (countryCode: string) => {
    try {
      const response = await fetch(`https://date.nager.at/api/v3/PublicHolidays/2024/${countryCode}`, {
        headers: {
          'Authorization': `Bearer 0POWIN268B36`
        }
      });
      
      if (!response.ok) throw new Error('Failed to fetch holidays');
      const holidays = await response.json();
      
      // Show holidays in a modal or panel
      console.log(holidays); // Replace with your modal/panel display logic
      onSelectCountry(countryCode);
    } catch (error) {
      console.error('Error fetching holidays:', error);
    }
  };

  return (
    <div className="bg-gray-900 rounded-lg p-4 h-full flex flex-col">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-semibold flex items-center gap-2">
          <MapPin className="w-5 h-5" />
          Countries
        </h2>
      </div>
      
      <div className="relative mb-4">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
        <input
          type="text"
          placeholder="Search countries or capitals..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full bg-gray-800 text-white rounded-lg pl-10 pr-4 py-2 focus:ring-2 focus:ring-blue-500 focus:outline-none"
        />
      </div>

      <div className="grid grid-cols-1 gap-3 overflow-y-auto custom-scrollbar pr-2">
        {filteredCountries.map((country) => (
          <button
            key={country.code}
            onClick={() => handleCountryClick(country.code)}
            className={`
              flex items-center gap-4 p-4 rounded-lg transition-all duration-200
              ${country.code === selectedCountry 
                ? 'bg-blue-500 hover:bg-blue-600' 
                : 'bg-gray-800 hover:bg-gray-700'}
            `}
          >
            <img
              src={country.flag}
              alt={`${country.name} flag`}
              className="w-16 h-10 object-cover rounded shadow-sm"
            />
            <div className="flex-1 min-w-0">
              <h3 className="font-semibold text-white truncate">
                {country.name}
              </h3>
              <div className="flex items-center gap-2 text-sm text-gray-300">
                <span className="truncate">{country.capital}</span>
                <span className="flex items-center gap-1">
                  <Clock className="w-3.5 h-3.5" />
                  {times[country.code]}
                </span>
              </div>
            </div>
          </button>
        ))}
      </div>
    </div>
  );
};