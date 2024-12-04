import { useState } from 'react';
import { createOrder } from '../services/api';
import Button from '../components/common/Button';

function OrderCreate() {
  const [orderData, setOrderData] = useState({
    coverage: 'domestic',
    payment_type: 'postpay',
    consigner: {
      name: '',
      phone_number: ''
    },
    consignee: {
      name: '',
      phone_number: ''
    },
    courier: {
      cod: false,
      use_insurance: false
    },
    service_type: 1,
    origin: {
      address: '',
      area_id: ''
    },
    destination: {
      address: '',
      area_id: ''
    },
    package: {
      length: 1,  // Changed to number
      width: 1,   // Changed to number
      height: 1,  // Changed to number
      weight: 1,  // Changed to number
      package_type: 2, // Changed to number
      price: 0,   // Changed to number
      items: [
        {
          name: '',
          price: 0,  // Changed to number
          qty: 1     // Changed to number
        }
      ]
    }
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    const namePath = name.split('.');

    setOrderData(prev => {
      const newData = { ...prev };
      let current = newData;
      
      for (let i = 0; i < namePath.length - 1; i++) {
        current = current[namePath[i]];
      }

      const finalKey = namePath[namePath.length - 1];
      
      // Handle different types of inputs
      if (type === 'checkbox') {
        current[finalKey] = checked;
      } else {
        // Convert numeric fields to numbers
        if ([
          'service_type', 'area_id', 'length', 'width', 'height',
          'weight', 'package_type', 'price', 'qty'
        ].includes(finalKey)) {
          current[finalKey] = value === '' ? '' : Number(value);
        } else {
          current[finalKey] = value;
        }
      }

      return newData;
    });
  };

  const formatPayload = (data) => {
    // Deep clone the data
    const payload = JSON.parse(JSON.stringify(data));
    
    // Convert string area_ids to numbers
    if (payload.origin.area_id) {
      payload.origin.area_id = Number(payload.origin.area_id);
    }
    if (payload.destination.area_id) {
      payload.destination.area_id = Number(payload.destination.area_id);
    }

    // Calculate total package price from items
    const totalPackagePrice = payload.package.items.reduce((total, item) => {
      return total + (Number(item.price) * Number(item.qty));
    }, 0);

    // Ensure package related numbers are properly formatted
    payload.package = {
      ...payload.package,
      length: Number(payload.package.length),
      width: Number(payload.package.width),
      height: Number(payload.package.height),
      weight: Number(payload.package.weight),
      package_type: Number(payload.package.package_type),
      price: totalPackagePrice, // Set package price as total of items
      items: payload.package.items.map(item => ({
        ...item,
        price: Number(item.price),
        qty: Number(item.qty)
      }))
    };

    // Ensure service_type is a number
    payload.service_type = Number(payload.service_type);

    return payload;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess('');

    try {
      const formattedPayload = formatPayload(orderData);
      const response = await createOrder(formattedPayload);
      setSuccess('Order created successfully! Order ID: ' + response.data.order_id);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto">
      <h1 className="text-2xl font-bold mb-6">Create Order</h1>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Consigner Information */}
        <div className="bg-white p-6 rounded-lg shadow">
          <h2 className="text-lg font-semibold mb-4">Consigner Information</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Name
              </label>
              <input
                type="text"
                name="consigner.name"
                value={orderData.consigner.name}
                onChange={handleChange}
                className="w-full p-2 border border-gray-300 rounded-md"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Phone Number
              </label>
              <input
                type="text"
                name="consigner.phone_number"
                value={orderData.consigner.phone_number}
                onChange={handleChange}
                className="w-full p-2 border border-gray-300 rounded-md"
                required
              />
            </div>
          </div>
        </div>

        {/* Consignee Information */}
        <div className="bg-white p-6 rounded-lg shadow">
          <h2 className="text-lg font-semibold mb-4">Consignee Information</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Name
              </label>
              <input
                type="text"
                name="consignee.name"
                value={orderData.consignee.name}
                onChange={handleChange}
                className="w-full p-2 border border-gray-300 rounded-md"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Phone Number
              </label>
              <input
                type="text"
                name="consignee.phone_number"
                value={orderData.consignee.phone_number}
                onChange={handleChange}
                className="w-full p-2 border border-gray-300 rounded-md"
                required
              />
            </div>
          </div>
        </div>

        {/* Package Information */}
        <div className="bg-white p-6 rounded-lg shadow">
          <h2 className="text-lg font-semibold mb-4">Package Information</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Weight (kg)
              </label>
              <input
                type="number"
                name="package.weight"
                value={orderData.package.weight}
                onChange={handleChange}
                className="w-full p-2 border border-gray-300 rounded-md"
                required min="0"
                step="0.1"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Package Type
              </label>
              <select
                name="package.package_type"
                value={orderData.package.package_type}
                onChange={handleChange}
                className="w-full p-2 border border-gray-300 rounded-md"
              >
                <option value="1">Document</option>
                <option value="2">Package</option>
              </select>
            </div>
            
            {/* Dimensions */}
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Dimensions (cm)
              </label>
              <div className="grid grid-cols-3 gap-4">
                <input
                  type="number"
                  name="package.length"
                  value={orderData.package.length}
                  onChange={handleChange}
                  placeholder="Length"
                  className="w-full p-2 border border-gray-300 rounded-md"
                  required
                  min="0"
                />
                <input
                  type="number"
                  name="package.width"
                  value={orderData.package.width}
                  onChange={handleChange}
                  placeholder="Width"
                  className="w-full p-2 border border-gray-300 rounded-md"
                  required
                  min="0"
                />
                <input
                  type="number"
                  name="package.height"
                  value={orderData.package.height}
                  onChange={handleChange}
                  placeholder="Height"
                  className="w-full p-2 border border-gray-300 rounded-md"
                  required
                  min="0"
                />
              </div>
            </div>

            {/* Item Details */}
            <div className="md:col-span-2">
              <h3 className="text-md font-medium mb-2">Item Details</h3>
              <div className="space-y-2">
                <div className="grid grid-cols-3 gap-2">
                  <input
                    type="text"
                    name="package.items.0.name"
                    value={orderData.package.items[0].name}
                    onChange={handleChange}
                    placeholder="Item name"
                    className="w-full p-2 border border-gray-300 rounded-md"
                    required
                  />
                  <input
                    type="number"
                    name="package.items.0.price"
                    value={orderData.package.items[0].price}
                    onChange={handleChange}
                    placeholder="Price"
                    className="w-full p-2 border border-gray-300 rounded-md"
                    required
                    min="0"
                  />
                  <input
                    type="number"
                    name="package.items.0.qty"
                    value={orderData.package.items[0].qty}
                    onChange={handleChange}
                    placeholder="Quantity"
                    className="w-full p-2 border border-gray-300 rounded-md"
                    required
                    min="1"
                  />
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Location Information */}
        <div className="bg-white p-6 rounded-lg shadow">
          <h2 className="text-lg font-semibold mb-4">Location Information</h2>
          
          {/* Origin */}
          <div className="mb-6">
            <h3 className="text-md font-medium mb-2">Origin</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Area ID
                </label>
                <input
                  type="text"
                  name="origin.area_id"
                  value={orderData.origin.area_id}
                  onChange={handleChange}
                  className="w-full p-2 border border-gray-300 rounded-md"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Address
                </label>
                <input
                  type="text"
                  name="origin.address"
                  value={orderData.origin.address}
                  onChange={handleChange}
                  className="w-full p-2 border border-gray-300 rounded-md"
                  required
                />
              </div>
            </div>
          </div>

          {/* Destination */}
          <div>
            <h3 className="text-md font-medium mb-2">Destination</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Area ID
                </label>
                <input
                  type="text"
                  name="destination.area_id"
                  value={orderData.destination.area_id}
                  onChange={handleChange}
                  className="w-full p-2 border border-gray-300 rounded-md"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Address
                </label>
                <input
                  type="text"
                  name="destination.address"
                  value={orderData.destination.address}
                  onChange={handleChange}
                  className="w-full p-2 border border-gray-300 rounded-md"
                  required
                />
              </div>
            </div>
          </div>
        </div>

        {/* Shipping Options */}
        <div className="bg-white p-6 rounded-lg shadow">
          <h2 className="text-lg font-semibold mb-4">Shipping Options</h2>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Service Type
              </label>
              <select
                name="service_type"
                value={orderData.service_type}
                onChange={handleChange}
                className="w-full p-2 border border-gray-300 rounded-md"
              >
                <option value="1">Regular</option>
                <option value="2">Express</option>
                <option value="4">Trucking</option>
                <option value="5">Same Day</option>
              </select>
            </div>

            <div className="flex items-center space-x-4">
              <label className="inline-flex items-center">
                <input
                  type="checkbox"
                  name="courier.cod"
                  checked={orderData.courier.cod}
                  onChange={handleChange}
                  className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                />
                <span className="ml-2">Cash on Delivery</span>
              </label>

              <label className="inline-flex items-center">
                <input
                  type="checkbox"
                  name="courier.use_insurance"
                  checked={orderData.courier.use_insurance}
                  onChange={handleChange}
                  className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                />
                <span className="ml-2">Use Insurance</span>
              </label>
            </div>
          </div>
        </div>

        {/* Submit Button */}
        <div className="flex justify-end">
          <Button
            type="submit"
            loading={loading}
            disabled={loading}
          >
            Create Order
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

export default OrderCreate;