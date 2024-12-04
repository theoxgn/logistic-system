import React, { useState } from 'react';
import { getPrintDocument } from '../services/api';

function ShippingLabelPage() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  
  const [formData, setFormData] = useState({
    order_ids: '',
    print_type: 'LBL' // Default to label
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const getOrderIds = () => {
    return formData.order_ids
      .split(',')
      .map(id => id.trim())
      .filter(id => id);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const orderIds = getOrderIds();
    
    if (orderIds.length === 0) {
      setError('Please enter at least one order ID');
      return;
    }

    setLoading(true);
    setError('');
    setSuccess('');

    try {
      const response = await getPrintDocument(orderIds, formData.print_type);
      
      if (response?.data?.url) {
        window.open(response.data.url, '_blank');
        setSuccess(`${formData.print_type === 'LBL' ? 'Shipping label' : 'Receipt'} generated successfully!`);
      } else {
        throw new Error(`Failed to generate ${formData.print_type === 'LBL' ? 'shipping label' : 'receipt'}`);
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const printTypeOptions = [
    { value: 'LBL', label: 'Shipping Label' },
    { value: 'RCP', label: 'Receipt' }
  ];

  return (
    <div className="max-w-3xl mx-auto p-4">
      <h1 className="text-2xl font-bold mb-6">Print Label & Receipt</h1>

      <div className="space-y-6">
        {/* Order IDs Input */}
        <div className="bg-gray-50 p-4 rounded-lg">
          <h2 className="text-lg font-medium mb-4">Order Details</h2>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Order IDs (comma-separated)
              </label>
              <input
                type="text"
                name="order_ids"
                value={formData.order_ids}
                onChange={handleChange}
                className="w-full p-2 border border-gray-300 rounded-md"
                placeholder="e.g., 24CQ7KG44DDME"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Print Type
              </label>
              <div className="flex space-x-4">
                {printTypeOptions.map(option => (
                  <label key={option.value} className="inline-flex items-center">
                    <input
                      type="radio"
                      name="print_type"
                      value={option.value}
                      checked={formData.print_type === option.value}
                      onChange={handleChange}
                      className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300"
                    />
                    <span className="ml-2 text-sm text-gray-700">{option.label}</span>
                  </label>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Action Button */}
        <button
          onClick={handleSubmit}
          disabled={loading}
          className="w-full px-6 py-3 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50"
        >
          {loading ? 'Generating...' : `Generate ${formData.print_type === 'LBL' ? 'Label' : 'Receipt'}`}
        </button>

        {/* Error Message */}
        {error && (
          <div className="p-4 bg-red-100 text-red-700 rounded-md">
            {error}
          </div>
        )}

        {/* Success Message */}
        {success && (
          <div className="p-4 bg-green-100 text-green-700 rounded-md">
            {success}
          </div>
        )}
      </div>
    </div>
  );
}

export default ShippingLabelPage;