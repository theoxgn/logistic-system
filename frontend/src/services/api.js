const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:3000/api';

// Helper function for API calls
async function apiCall(endpoint, options = {}) {
  const response = await fetch(`${API_URL}${endpoint}`, {
    headers: {
      'Content-Type': 'application/json',
      ...options.headers,
    },
    ...options,
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.message || 'API call failed');
  }

  return data;
}

// Location API
export const searchLocation = (keyword) =>
  apiCall(`/location?keyword=${encodeURIComponent(keyword)}`);

// Shipping Cost API
export const checkShippingCost = (data) =>
  apiCall('/shipping-cost', {
    method: 'POST',
    body: JSON.stringify(data),
  });

// Order API
export const createOrder = (orderData) =>
  apiCall('/orders', {
    method: 'POST',
    body: JSON.stringify(orderData),
  });

export const getOrderDetails = (orderId) =>
  apiCall(`/orders/${orderId}`);

// Pickup API
export const getPickupTimeslots = () =>
  apiCall('/pickup/timeslots');

export const createPickupRequest = (data) =>
  apiCall('/pickup', {
    method: 'POST',
    body: JSON.stringify(data),
  });

export const cancelPickup = (pickupCode) =>
  apiCall('/pickup/cancel', {
    method: 'PATCH',
    body: JSON.stringify({ pickup_code: pickupCode }),
  });

export const getPrintDocument = (orderIds, type) =>
apiCall('/label', {
  method: 'POST',
  body: JSON.stringify({
    id: Array.isArray(orderIds) ? orderIds : [orderIds],
    type: type
  }),
});