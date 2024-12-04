import { useState } from 'react';
import { checkShippingCost } from '../services/api';

function ShippingCostCalculator() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [results, setResults] = useState(null);

  const [formData, setFormData] = useState({
    origin: {
      lat: '',
      lng: ''
    },
    destination: {
      lat: '',
      lng: ''
    },
    cod: false,
    for_order: false,
    item_value: '',
    weight: '',
    length: '',
    width: '',
    height: '',
    limit: 30,
    sort_by: ['final_price']
  });

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    
    // Handle nested object fields
    if (name.includes('.')) {
      const [parent, child] = name.split('.');
      setFormData(prev => ({
        ...prev,
        [parent]: {
          ...prev[parent],
          [child]: type === 'number' ? Number(value) : value
        }
      }));
    } else {
      // Handle top-level fields
      setFormData(prev => ({
        ...prev,
        [name]: type === 'checkbox' ? checked : 
                type === 'number' ? Number(value) : value
      }));
    }
  };

  // const handleSubmit = async (e) => {
  //   e.preventDefault();
  //   setLoading(true);
  //   setError('');
  //   try {
  //     const response = await checkShippingCost({
  //       ...formData,
  //       weight: parseFloat(formData.weight),
  //       length: parseFloat(formData.length),
  //       width: parseFloat(formData.width),
  //       height: parseFloat(formData.height),
  //       item_value: parseFloat(formData.item_value),
  //       destination: {
  //         ...parseFloat(formData.destination),
  //         area_id: parseFloat(Number(formData.destination.area_id)),
  //         suburb_id: parseFloat(Number(formData.destination.suburb_id))
  //       },
  //       origin: {
  //         ...parseFloat(formData.origin),
  //         area_id: parseFloat(Number(formData.origin.area_id)),
  //         suburb_id: parseFloat(Number(formData.origin.suburb_id))
  //       }
  //     });
  //     setResults(response.data);
  //   } catch (err) {
  //     setError(err.message);
  //   } finally {
  //     setLoading(false);
  //   }
  // };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      const response = await checkShippingCost({
        origin: {
          lat: formData.origin.lat,
          lng: formData.origin.lng
        },
        destination: {
          lat: formData.destination.lat,
          lng: formData.destination.lng
        },
        cod: formData.cod,
        for_order: formData.for_order,
        item_value: parseFloat(formData.item_value),
        weight: parseFloat(formData.weight),
        length: parseFloat(formData.length),
        width: parseFloat(formData.width),
        height: parseFloat(formData.height),
        limit: formData.limit,
        sort_by: formData.sort_by
      });

    // Set the results from the response data
      setResults(response.data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto p-4">
      <h1 className="text-2xl font-bold mb-6">Calculate Shipping Cost</h1>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Origin Location */}
        <div className="bg-gray-50 p-4 rounded-lg">
          <h2 className="text-lg font-medium mb-4">Origin Location</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Latitude
              </label>
              <input
                type="text"
                name="origin.lat"
                value={formData.origin.lat}
                onChange={handleChange}
                className="w-full p-2 border border-gray-300 rounded-md"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Longitude
              </label>
              <input
                type="text"
                name="origin.lng"
                value={formData.origin.lng}
                onChange={handleChange}
                className="w-full p-2 border border-gray-300 rounded-md"
                required
              />
            </div>
          </div>
        </div>

        {/* Destination Location */}
        <div className="bg-gray-50 p-4 rounded-lg">
          <h2 className="text-lg font-medium mb-4">Destination Location</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Latitude
              </label>
              <input
                type="text"
                name="destination.lat"
                value={formData.destination.lat}
                onChange={handleChange}
                className="w-full p-2 border border-gray-300 rounded-md"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Longitude
              </label>
              <input
                type="text"
                name="destination.lng"
                value={formData.destination.lng}
                onChange={handleChange}
                className="w-full p-2 border border-gray-300 rounded-md"
                required
              />
            </div>
          </div>
        </div>

        {/* Package Details */}
        <div className="bg-gray-50 p-4 rounded-lg">
          <h2 className="text-lg font-medium mb-4">Package Details</h2>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Weight (kg)
              </label>
              <input
                type="number"
                name="weight"
                value={formData.weight}
                onChange={handleChange}
                step="0.1"
                min="0"
                className="w-full p-2 border border-gray-300 rounded-md"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Length (cm)
              </label>
              <input
                type="number"
                name="length"
                value={formData.length}
                onChange={handleChange}
                min="0"
                className="w-full p-2 border border-gray-300 rounded-md"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Width (cm)
              </label>
              <input
                type="number"
                name="width"
                value={formData.width}
                onChange={handleChange}
                min="0"
                className="w-full p-2 border border-gray-300 rounded-md"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Height (cm)
              </label>
              <input
                type="number"
                name="height"
                value={formData.height}
                onChange={handleChange}
                min="0"
                className="w-full p-2 border border-gray-300 rounded-md"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Item Value (IDR)
              </label>
              <input
                type="number"
                name="item_value"
                value={formData.item_value}
                onChange={handleChange}
                min="0"
                className="w-full p-2 border border-gray-300 rounded-md"
                required
              />
            </div>
          </div>
        </div>

        {/* Additional Options */}
        <div className="bg-gray-50 p-4 rounded-lg">
          <div className="flex items-center space-x-4">
            <div className="flex items-center">
              <input
                type="checkbox"
                id="cod"
                name="cod"
                checked={formData.cod}
                onChange={handleChange}
                className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
              />
              <label htmlFor="cod" className="ml-2 text-sm text-gray-700">
                Cash on Delivery (COD)
              </label>
            </div>
          </div>
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full px-6 py-3 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50"
        >
          {loading ? 'Calculating...' : 'Calculate Shipping Cost'}
        </button>
      </form>

      {error && (
        <div className="mt-6 p-4 bg-red-100 text-red-700 rounded-md">
        {error}
      </div>
      )}

      {/* Results Display */}
      {results && results.pricings && results.pricings.length > 0 && (
        <div className="mt-6 bg-white rounded-lg shadow p-4">
          <h2 className="text-lg font-semibold mb-4">Available Shipping Rates</h2>
          <div className="space-y-4">
            {results.pricings.map((pricing, index) => (
              <div key={index} className="border rounded-lg p-4 hover:shadow-md transition-shadow">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center space-x-4">
                    <img 
                      src={pricing.logistic.logo_url} 
                      alt={pricing.logistic.name}
                      className="h-8 object-contain"
                    />
                    <div>
                      <h3 className="font-semibold">{pricing.logistic.name}</h3>
                      <p className="text-sm text-gray-600">{pricing.rate.name} - {pricing.rate.description}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-bold text-lg">
                      {new Intl.NumberFormat('id-ID', {
                        style: 'currency',
                        currency: 'IDR'
                      }).format(pricing.final_price)}
                    </p>
                    <p className="text-sm text-gray-600">
                      {pricing.min_day}-{pricing.max_day} hari
                    </p>
                  </div>
                </div>
                
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4 text-sm">
                  <div>
                    <p className="text-gray-600">Berat</p>
                    <p>{pricing.weight} kg</p>
                  </div>
                  <div>
                    <p className="text-gray-600">Asuransi</p>
                    <p>{new Intl.NumberFormat('id-ID', {
                      style: 'currency',
                      currency: 'IDR'
                    }).format(pricing.insurance_fee)}</p>
                  </div>
                  {pricing.logistic.cod_fee > 0 && (
                    <div>
                      <p className="text-gray-600">COD Fee</p>
                      <p>{pricing.logistic.cod_fee}%</p>
                    </div>
                  )}
                </div>
                
                {pricing.rate.full_description && (
                  <div className="mt-2 text-sm text-gray-600">
                    <p>{pricing.rate.full_description}</p>
                  </div>
                )}
              </div>
            ))}
          </div>
          
          {results.pagination && (
            <div className="mt-4 text-sm text-gray-600">
              <p>Halaman {results.pagination.current_page} dari {results.pagination.total_pages}</p>
              <p>Total {results.pagination.total_elements} hasil</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default ShippingCostCalculator;