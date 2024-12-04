import { useState, useEffect } from 'react';
import { getPickupTimeslots, createPickupRequest } from '../services/api';
import Button from '../components/common/Button';

function PickupManagement() {
  const [timeslots, setTimeslots] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  
  const [pickupData, setPickupData] = useState({
    data: {
      order_activation: {
        order_id: [],
        timezone: "Asia/Jakarta"
      }
    }
  });

  useEffect(() => {
    fetchTimeslots();
  }, []);

  const fetchTimeslots = async () => {
    try {
      setLoading(true);
      const response = await getPickupTimeslots();
      // Mengakses time_slots dari response yang benar
      const timeslotsData = response.data.time_slots || [];
      setTimeslots(timeslotsData);
    } catch (err) {
      setError('Failed to fetch timeslots: ' + err.message);
      setTimeslots([]); // Set empty array on error
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!pickupData.data.order_activation.order_id.length) {
      setError('Please enter at least one order ID');
      return;
    }

    setLoading(true);
    setError('');
    setSuccess('');

    try {
      const response = await createPickupRequest(pickupData);
      setSuccess('Pickup request created successfully!');
      setPickupData({
        data: {
          order_activation: {
            order_id: [],
            timezone: "Asia/Jakarta"
          }
        }
      });
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleOrderIdChange = (e) => {
    const orderIds = e.target.value.split(',').map(id => id.trim()).filter(id => id);
    setPickupData(prev => ({
      data: {
        order_activation: {
          ...prev.data.order_activation,
          order_id: orderIds
        }
      }
    }));
  };

  const handleTimeslotSelect = (startTime, endTime) => {
    setPickupData(prev => ({
      data: {
        order_activation: {
          ...prev.data.order_activation,
          start_time: startTime,
          end_time: endTime
        }
      }
    }));
  };

  return (
    <div className="max-w-4xl mx-auto">
      <h1 className="text-2xl font-bold mb-6">Pickup Management</h1>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="bg-white p-6 rounded-lg shadow">
          <h2 className="text-lg font-semibold mb-4">Create Pickup Request</h2>

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Order IDs (comma-separated)
              </label>
              <input
                type="text"
                value={pickupData.data.order_activation.order_id.join(', ')}
                onChange={handleOrderIdChange}
                className="w-full p-2 border border-gray-300 rounded-md"
                placeholder="e.g., ORDER123, ORDER456"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Available Timeslots
              </label>
              {loading ? (
                <div className="text-center py-4">Loading timeslots...</div>
              ) : timeslots.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {timeslots.map((slot, index) => (
                    <button
                      key={index}
                      type="button"
                      onClick={() => handleTimeslotSelect(slot.start_time, slot.end_time)}
                      className={`p-4 border rounded-md hover:bg-blue-50 ${
                        pickupData.data.order_activation.start_time === slot.start_time
                          ? 'border-blue-500 bg-blue-50'
                          : 'border-gray-300'
                      }`}
                    >
                      <p className="font-medium">{new Date(slot.start_time).toLocaleTimeString()}</p>
                      <p className="text-sm text-gray-600">
                        to {new Date(slot.end_time).toLocaleTimeString()}
                      </p>
                    </button>
                  ))}
                </div>
              ) : (
                <div className="text-center py-4 text-gray-500">
                  No timeslots available
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Submit Button */}
        <div className="flex justify-end">
          <Button
            type="submit"
            loading={loading}
            disabled={loading || !pickupData.data.order_activation.start_time}
          >
            Create Pickup Request
          </Button>
        </div>

        {/* Messages */}
        {error && (
          <div className="p-4 bg-red-100 text-red-700 rounded-md">
            {error}
          </div>
        )}

        {success && (
          <div className="p-4 bg-green-100 text-green-700 rounded-md">
            {success}
          </div>
        )}
      </form>
    </div>
  );
}

export default PickupManagement;