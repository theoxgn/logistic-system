import { useState } from 'react';
import Button from '../components/common/Button';
import { getOrderDetails } from '../services/api';

function OrderTracking() {
  const [trackingData, setTrackingData] = useState({
    tracking_id: '',
    order_tracking_id: ''
  });

  const [orderStatus, setOrderStatus] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [results, setResults] = useState([]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setTrackingData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess('');
  
    try {
      const response = await getOrderDetails(trackingData.tracking_id);
      if (response?.data) {
        setOrderStatus(response.data);
        setSuccess('Order status retrieved successfully');
      } else {
        throw new Error('No data found');
      }
    } catch (err) {
      setError(err.message || 'Failed to fetch order status');
      setOrderStatus(null);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto">
      <h1 className="text-2xl font-bold mb-6">Track Order</h1>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Tracking Information */}
        <div className="bg-white p-6 rounded-lg shadow">
          <h2 className="text-lg font-semibold mb-4">Tracking Information</h2>
          <div className="grid grid-cols-1 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Tracking ID
              </label>
              <input
                type="text"
                name="tracking_id"
                value={trackingData.tracking_id}
                onChange={handleChange}
                className="w-full p-2 border border-gray-300 rounded-md"
                required
                placeholder="Enter tracking ID"
              />
            </div>
          </div>
        </div>

        {/* Order Status Display */}
        {orderStatus && (
            <div className="bg-white p-6 rounded-lg shadow">
                <h2 className="text-lg font-semibold mb-4">Order Status</h2>
                
                {/* Basic Information */}
                <div className="grid grid-cols-2 gap-4 mb-6">
                <div>
                    <p className="text-sm font-medium text-gray-500">Order ID</p>
                    <p className="mt-1">{orderStatus.order_id}</p>
                </div>
                <div>
                    <p className="text-sm font-medium text-gray-500">AWB Number</p>
                    <p className="mt-1">{orderStatus.awb_number || '-'}</p>
                </div>
                </div>

                {/* Current Status */}
                <div className="bg-blue-50 p-4 rounded-lg">
                <h3 className="text-md font-medium mb-2">Current Status</h3>
                <div className="grid grid-cols-2 gap-4">
                    <div>
                    <p className="text-sm font-medium text-gray-500">Status</p>
                    <p className="mt-1">{orderStatus.tracking?.shipper_status?.name || '-'}</p>
                    </div>
                    <div>
                    <p className="text-sm font-medium text-gray-500">Description</p>
                    <p className="mt-1">{orderStatus.tracking?.shipper_status?.description || '-'}</p>
                    </div>
                </div>
                </div>

                {/* Shipment Details */}
                <div className="border-t pt-4 mt-4">
                <h3 className="text-md font-medium mb-2">Shipment Details</h3>
                <div className="grid grid-cols-2 gap-4">
                    <div>
                    <p className="text-sm font-medium text-gray-500">Creation Date</p>
                    <p className="mt-1">
                        {orderStatus.creation_date 
                        ? new Date(orderStatus.creation_date).toLocaleString()
                        : '-'}
                    </p>
                    </div>
                    <div>
                    <p className="text-sm font-medium text-gray-500">Last Updated</p>
                    <p className="mt-1">
                        {orderStatus.last_updated_date
                        ? new Date(orderStatus.last_updated_date).toLocaleString()
                        : '-'}
                    </p>
                    </div>
                </div>
                </div>

                {/* Tracking History */}
                <div className="border-t pt-4 mt-4">
                <h3 className="text-md font-medium mb-2">Tracking History</h3>
                {orderStatus.trackings?.map((track, index) => (
                    <div key={index} className="mb-4 p-3 bg-gray-50 rounded">
                    <p className="font-medium">{track.shipper_status.name}</p>
                    <p className="text-sm text-gray-600">{track.shipper_status.description}</p>
                    <p className="text-sm text-gray-500 mt-1">
                        {new Date(track.created_date).toLocaleString()}
                    </p>
                    </div>
                ))}
                </div>
            </div>
        )}


        {/* Submit Button */}
        <div className="flex justify-end">
          <Button
            type="submit"
            loading={loading}
            disabled={loading}
          >
            Track Order
          </Button>
        </div>

        {/* Messages */}
        {error && (
          <div className="p-4 bg-red-100 text-red-700 rounded-md">
            {error}
          </div>
        )}

      </form>
    </div>
  );
}

export default OrderTracking;