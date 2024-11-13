import { Event } from '../types';

interface NagerHoliday {
  date: string;
  localName: string;
  name: string;
  countryCode: string;
  fixed: boolean;
  global: boolean;
  types: string[];
}

// Define a type for cache entries to enhance type safety
interface CacheEntry<T> {
  data: T;
  timestamp: number;
}

// Cache for storing holiday data
const CACHE_DURATION = 24 * 60 * 60 * 1000; // 24 hours
const holidayCache: Record<string, CacheEntry<Event[]>> = {};

// Add delay between API calls to respect rate limits
const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

/**
 * Fetches holidays for a given year from the Nager.Date API.
 * Utilizes caching to minimize unnecessary API calls and includes rate limiting to respect API constraints.
 * @param year - The year for which to fetch holidays.
 * @returns A promise that resolves to an array of Event objects.
 */
export const fetchHolidays = async (year: number): Promise<Event[]> => {
  const cacheKey = `holidays-${year}`;
  
  // Check cache first
  const cached = holidayCache[cacheKey];
  if (cached && (Date.now() - cached.timestamp < CACHE_DURATION)) {
    console.log(`Returning cached holidays for year ${year}`);
    return cached.data;
  }

  try {
    // First, get available countries
    const countriesResponse = await fetch(
      'https://date.nager.at/api/v3/AvailableCountries',
      { headers: { 'Accept': 'application/json' } }
    );
    
    if (!countriesResponse.ok) {
      throw new Error(`Failed to fetch countries: ${countriesResponse.statusText}`);
    }
    
    const availableCountries: { countryCode: string }[] = await countriesResponse.json();
    const holidays: Event[] = [];

    // Process countries in smaller batches to avoid rate limiting
    const BATCH_SIZE = 3;
    for (let i = 0; i < availableCountries.length; i += BATCH_SIZE) {
      const batch = availableCountries.slice(i, i + BATCH_SIZE);
      
      await Promise.all(
        batch.map(async (country) => {
          try {
            // Add delay between requests
            await delay(500);
            
            const response = await fetch(
              `https://date.nager.at/api/v3/PublicHolidays/${year}/${country.countryCode}`,
              { headers: { 'Accept': 'application/json' } }
            );

            if (response.ok) {
              const countryHolidays: NagerHoliday[] = await response.json();
              holidays.push(
                ...countryHolidays.map(holiday => ({
                  id: `${holiday.date}-${country.countryCode}`,
                  title: holiday.name,
                  description: holiday.localName !== holiday.name ? holiday.localName : '',
                  date: new Date(holiday.date),
                  color: getRandomColor(),
                  country: country.countryCode
                }))
              );
            } else {
              console.warn(
                `Failed to fetch holidays for ${country.countryCode}: ${response.statusText}`
              );
            }
          } catch (error) {
            console.warn(`Error fetching holidays for ${country.countryCode}:`, error);
          }
        })
      );

      // Add delay between batches
      if (i + BATCH_SIZE < availableCountries.length) {
        await delay(1000);
      }
    }

    // Add seasonal events
    const seasonalEvents = getSeasonalEvents(year);
    const allEvents = [...seasonalEvents, ...holidays];

    // Update cache
    holidayCache[cacheKey] = {
      data: allEvents,
      timestamp: Date.now()
    };

    console.log(`Fetched and cached holidays for year ${year}`);
    return allEvents;
  } catch (error) {
    console.error('Failed to fetch holidays:', error);
    // Return cached data if available, otherwise return seasonal events
    if (holidayCache[cacheKey]) {
      console.warn('Returning cached data due to fetch failure.');
      return holidayCache[cacheKey].data;
    }
    console.warn('No cached data available. Returning seasonal events.');
    return getSeasonalEvents(year);
  }
};

/**
 * Generates a list of seasonal events for a given year.
 * @param year - The year for which to generate seasonal events.
 * @returns An array of Event objects representing seasonal events.
 */
const getSeasonalEvents = (year: number): Event[] => [
  {
    id: `spring-equinox-${year}`,
    title: 'Spring Equinox',
    description: 'Beginning of Spring',
    date: new Date(year, 2, 20),
    color: '#2ECC40',
    country: 'GLOBAL'
  },
  {
    id: `summer-solstice-${year}`,
    title: 'Summer Solstice',
    description: 'Longest Day of the Year',
    date: new Date(year, 5, 21),
    color: '#FFDC00',
    country: 'GLOBAL'
  },
  {
    id: `autumn-equinox-${year}`,
    title: 'Autumn Equinox',
    description: 'Beginning of Fall',
    date: new Date(year, 8, 22),
    color: '#FF851B',
    country: 'GLOBAL'
  },
  {
    id: `winter-solstice-${year}`,
    title: 'Winter Solstice',
    description: 'Shortest Day of the Year',
    date: new Date(year, 11, 21),
    color: '#7FDBFF',
    country: 'GLOBAL'
  }
];

/**
 * Selects a random color from a predefined list.
 * @returns A string representing a hex color code.
 */
const getRandomColor = (): string => {
  const colors = [
    '#FF4136', '#FF851B', '#FFDC00', '#2ECC40', '#0074D9', 
    '#B10DC9', '#85144b', '#F012BE', '#39CCCC', '#01FF70'
  ];
  return colors[Math.floor(Math.random() * colors.length)];
};
