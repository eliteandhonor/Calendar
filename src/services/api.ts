import { Country } from '../types';

const NAGER_API_KEY = '0POWIN268B36';

export const fetchCountries = async (): Promise<Country[]> => {
  try {
    // Get available countries from Nager.Date API
    const response = await fetch('https://date.nager.at/api/v3/AvailableCountries', {
      headers: {
        'Authorization': `Bearer ${NAGER_API_KEY}`
      }
    });
    
    if (!response.ok) throw new Error('Failed to fetch countries');
    const availableCountries = await response.json();

    // Get detailed country info from restcountries API
    const countriesResponse = await fetch('https://restcountries.com/v3.1/all');
    if (!countriesResponse.ok) throw new Error('Failed to fetch country details');
    const countriesData = await countriesResponse.json();

    // Combine data from both APIs
    const countries = availableCountries
      .map((nagerCountry: any) => {
        const countryDetails = countriesData.find(
          (c: any) => c.cca2 === nagerCountry.countryCode
        );
        
        if (!countryDetails) return null;

        return {
          code: nagerCountry.countryCode,
          name: countryDetails.name.common,
          flag: countryDetails.flags.svg,
          timezone: countryDetails.timezones[0],
          capital: countryDetails.capital?.[0] || 'N/A'
        };
      })
      .filter(Boolean)
      .sort((a: Country, b: Country) => a.name.localeCompare(b.name));

    return countries;
  } catch (error) {
    console.error('Failed to fetch countries:', error);
    return [];
  }
};