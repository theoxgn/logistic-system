import { useState } from 'react';
import { searchLocation } from '../services/api';
import { MapPin } from 'lucide-react';

function LocationSearch() {
  const [keyword, setKeyword] = useState('');
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState([]);
  const [error, setError] = useState('');

  const handleSearch = async (e) => {
    e.preventDefault();
    if (!keyword.trim()) return;

    setLoading(true);
    setError('');

    try {
      const response = await searchLocation(keyword);
      if (response?.data) {
        setResults(response.data || []);
        console.log(results)
        // setPagination(response.data.pagination || null);
      } else {
        setResults([]);
        // setPagination(null);
      }
    } catch (err) {
      setError(err.message || 'Failed to fetch location data');
      setResults([]);
      // setPagination(null);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-4">
      <h1 className="text-2xl font-bold mb-6">Location Search</h1>

      <form onSubmit={handleSearch} className="mb-8">
        <div className="flex gap-4">
          <input
            type="text"
            value={keyword}
            onChange={(e) => setKeyword(e.target.value)}
            placeholder="Enter location keyword (e.g., surabaya)"
            className="flex-1 p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          />
          <button
            type="submit"
            disabled={loading}
            className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50"
          >
            {loading ? 'Searching...' : 'Search'}
          </button>
        </div>
      </form>

      {error && (
        <div className="p-4 mb-4 text-red-700 bg-red-100 rounded-md">
          {error}
        </div>
      )}

      {results.length > 0 ? (
        <div className="space-y-4">
          {results.map((location, index) => (
            <div
              key={`${location.adm_level_cur.id}-${index}`}
              className="p-4 bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow"
            >
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <h3 className="text-lg font-semibold mb-2">
                    {location.display_txt}
                  </h3>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                    <div className="space-y-2">
                      <p className="text-sm">
                        <span className="font-medium">Current Level: </span>
                        {location.adm_level_cur.type} ({location.adm_level_cur.level})
                      </p>
                      <p className="text-sm">
                        <span className="font-medium">Postal Code: </span>
                        {location.postcodes.join(', ')}
                      </p>
                    </div>
                    
                    {location.adm_level_cur.geo_coord.lat !== 0 && (
                      <div className="flex items-center text-sm text-gray-600">
                        <MapPin className="w-4 h-4 mr-1" />
                        <span>
                          {location.adm_level_cur.geo_coord.lat.toFixed(6)}, 
                          {location.adm_level_cur.geo_coord.lng.toFixed(6)}
                        </span>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              <div className="mt-4 pt-4 border-t border-gray-200">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                  {[
                    location.adm_level_1,
                    location.adm_level_2,
                    location.adm_level_3,
                    location.adm_level_4,
                    location.adm_level_5
                  ].map((level, idx) => level && (
                    <div key={`${level.id}-${idx}`} className="px-3 py-2 bg-gray-50 rounded">
                      <p className="text-xs text-gray-500 mb-1">
                        {level.type.charAt(0).toUpperCase() + level.type.slice(1)}
                      </p>
                      <p className="font-medium">{level.name}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : !loading && (
        <div className="text-center text-gray-500 py-8">
          {keyword.trim() 
            ? 'No locations found for your search.' 
            : 'Enter a location to start searching.'}
        </div>
      )}
    </div>
  );
}

export default LocationSearch;