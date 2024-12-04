import { useState, useEffect } from 'react';
import { searchLocation, checkShippingCost, createOrder, getOrderDetails } from '../services/api';
import Button from '../components/common/Button';
import Alert from '../components/common/Alert';

function IntegratedShipping() {
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [searchResults, setSearchResults] = useState({
    sender: [],
    receiver: []
  });
  const [selectedLocation, setSelectedLocation] = useState({
    sender: null,
    receiver: null
  });
  const [shippingRates, setShippingRates] = useState([]);
  const [selectedCourier, setSelectedCourier] = useState(null);
  const [orders, setOrders] = useState([]);
  const [trackingInfo, setTrackingInfo] = useState(null);

  const [formData, setFormData] = useState({
    sender: {
      name: '',
      phone: '',
      address: ''
    },
    receiver: {
      name: '',
      phone: '',
      address: ''
    },
    package: {
      weight: 1,
      length: 1,
      width: 1,
      height: 1,
      items: [{ // Initialize items as array with default item
        name: '',
        price: 0,
        qty: 1
      }]
    }
  });    

  const Card = ({ children, className = '' }) => {
    return (
      <div className={`bg-white rounded-lg border border-gray-200 ${className}`}>
        {children}
      </div>
    );
  };

  // Function to get valid coordinates from location
  const getValidCoordinates = (location) => {
    // Check coordinates from adm_level_cur first
    if (location.adm_level_cur?.geo_coord?.lat && location.adm_level_cur?.geo_coord?.lng) {
      return {
        lat: location.adm_level_cur.geo_coord.lat,
        lng: location.adm_level_cur.geo_coord.lng
      };
    }

    // Check from lowest to highest level
    for (let i = 5; i >= 1; i--) {
      const level = location[`adm_level_${i}`];
      if (level?.geo_coord?.lat && level?.geo_coord?.lng) {
        return {
          lat: level.geo_coord.lat,
          lng: level.geo_coord.lng
        };
      }
    }

    // If no valid coordinates found
    return null;
  };

  // Handle location search
  const handleLocationSearch = async (keyword, type) => {
    if (!keyword.trim()) {
      setSearchResults(prev => ({ ...prev, [type]: [] }));
      return;
    }

    try {
      const response = await searchLocation(keyword);
      setSearchResults(prev => ({
        ...prev,
        [type]: response.data || []
      }));
    } catch (err) {
      setError(err.message);
    }
  };

  // Handle location selection
  const handleSelectLocation = (location, type) => {
    const coordinates = getValidCoordinates(location);
    
    if (!coordinates) {
      setError(`No valid coordinates found for selected ${type} location`);
      return;
    }
  
    setSelectedLocation(prev => ({
      ...prev,
      [type]: {
        ...location,
        adm_level_cur: {
          ...location.adm_level_cur,
          geo_coord: coordinates
        }
      }
    }));
  
    setFormData(prev => ({
      ...prev,
      [type]: {
        ...prev[type],
        address: location.display_txt
      }
    }));
  
    setSearchResults(prev => ({
      ...prev,
      [type]: []
    }));
  };

  // Handle form changes
  const handleChange = (e) => {
    const { name, value } = e.target;
    
    // Handle nested array fields (for package items)
    if (name.includes('items')) {
      const [_, __, index, field] = name.split('.');
      setFormData(prev => ({
        ...prev,
        package: {
          ...prev.package,
          items: prev.package.items.map((item, i) => {
            if (i === parseInt(index)) {
              return {
                ...item,
                [field]: field === 'qty' || field === 'price' ? Number(value) : value
              };
            }
            return item;
          })
        }
      }));
    } else if (name.includes('.')) {
      // Handle other nested fields
      const [section, field] = name.split('.');
      setFormData(prev => ({
        ...prev,
        [section]: {
          ...prev[section],
          [field]: value
        }
      }));
    }
  };

  // Check shipping rates
  const checkRates = async () => {
    if (!selectedLocation.sender || !selectedLocation.receiver) {
      setError('Please select valid locations for sender and receiver');
      return;
    }
  
    const senderCoordinates = getValidCoordinates(selectedLocation.sender);
    const receiverCoordinates = getValidCoordinates(selectedLocation.receiver);
    
    if (!senderCoordinates || !receiverCoordinates) {
      setError('Invalid coordinates for sender or receiver location');
      return;
    }
    setLoading(true);
    setError('');
    
    try {
      // Calculate total item value from all items
      const totalItemValue = formData.package.items.reduce((total, item) => {
        return total + (Number(item.price) * Number(item.qty));
      }, 0);

      const response = await checkShippingCost({
        origin: {
          lat: String(senderCoordinates.lat),
          lng: String(senderCoordinates.lng)
        },
        destination: {
          lat: String(receiverCoordinates.lat),
          lng: String(receiverCoordinates.lng)
        },
        cod: false,
        for_order: false,
        item_value: totalItemValue,
        weight: parseFloat(formData.package.weight),
        length: parseFloat(formData.package.length),
        width: parseFloat(formData.package.width),
        height: parseFloat(formData.package.height),
        limit: 30,
        sort_by: ['final_price']
      });
  
      setShippingRates(response.data.pricings || []);
      setStep(3);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const formatPayload = (data) => {
    // Format items and filter out invalid ones
    const formattedItems = data.package.items
      .filter(item => item.name && item.price > 0 && item.qty > 0)
      .map(item => ({
        name: item.name,
        price: Number(item.price),
        qty: Number(item.qty)
      }));

    // Calculate total price from all items
    const totalPrice = formattedItems.reduce((total, item) => {
      return total + (item.price * item.qty);
    }, 0);

    // Format payload structure
    return {
      coverage: "domestic",
      payment_type: "postpay",
      consigner: {
        name: data.sender.name,
        phone_number: data.sender.phone
      },
      consignee: {
        name: data.receiver.name,
        phone_number: data.receiver.phone
      },
      courier: {
        cod: false,
        use_insurance: false
      },
      service_type: 1,
      origin: {
        address: data.sender.address,
        area_id: selectedLocation.sender.adm_level_cur.id
      },
      destination: {
        address: data.receiver.address,
        area_id: selectedLocation.receiver.adm_level_cur.id
      },
      package: {
        length: Number(data.package.length),
        width: Number(data.package.width),
        height: Number(data.package.height),
        weight: Number(data.package.weight),
        package_type: 2,
        price: totalPrice,
        items: formattedItems
      }
    };
  };

  // Create shipping order
  const createShippingOrder = async () => {
    if (!selectedCourier) {
      setError('Please select a courier first');
      return;
    }
  
    // Validate required fields
    const requiredFields = {
      sender: ['name', 'phone', 'address'],
      receiver: ['name', 'phone', 'address'],
      package: ['weight', 'length', 'width', 'height']
    };
  
    for (const [section, fields] of Object.entries(requiredFields)) {
      for (const field of fields) {
        if (!formData[section][field]) {
          setError(`${section} ${field} is required`);
          return;
        }
      }
    }
  
    // Validate phone numbers
    const phoneRegex = /^[0-9]{10,13}$/;
    if (!phoneRegex.test(formData.sender.phone)) {
      setError('Invalid sender phone number');
      return;
    }
    if (!phoneRegex.test(formData.receiver.phone)) {
      setError('Invalid receiver phone number');
      return;
    }
  
    // Validate package dimensions and weight
    const numericFields = ['weight', 'length', 'width', 'height'];
    for (const field of numericFields) {
      const value = Number(formData.package[field]);
      if (isNaN(value) || value <= 0) {
        setError(`Invalid package ${field}`);
        return;
      }
    }
  
    setLoading(true);
    setError('');
  
    try {
      const formattedPayload = formatPayload(formData);
      const response = await createOrder(formattedPayload);
      setOrders(prev => [...prev, response.data]);
      setSuccess('Order created successfully!');
      setStep(4);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  // Handle order tracking
  const handleTrackOrder = async (orderId) => {
    setLoading(true);
    setError('');
    
    try {
      const response = await getOrderDetails(orderId);
      console.log(response.data)
      setTrackingInfo(response.data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  // Handle debounced location search
  const debounce = (func, wait) => {
    let timeout;
    return function executedFunction(...args) {
      const later = () => {
        clearTimeout(timeout);
        func(...args);
      };
      clearTimeout(timeout);
      timeout = setTimeout(later, wait);
    };
  };

  // Location search with debounce
  const debouncedLocationSearch = debounce(async (keyword, type) => {
    if (!keyword.trim()) {
      setSearchResults(prev => ({ ...prev, [type]: [] }));
      return;
    }

    try {
      const response = await searchLocation(keyword);
      setSearchResults(prev => ({
        ...prev,
        [type]: response.data || []
      }));
    } catch (err) {
      setError(err.message);
    }
  }, 500);

  // Handle input change with location search
  const handleAddressChange = (e, type) => {
    const { value } = e.target;
    handleChange(e);
    debouncedLocationSearch(value, type);
  };

  // Courier selection section
  const CourierSection = () => (
    <div className="space-y-4">
      <h2 className="text-lg font-semibold">Choose Courier</h2>
      
      <div className="space-y-3">
        {shippingRates.map((rate) => (
          <Card
            key={`${rate.logistic?.name}-${rate.rate?.name}`}
            className={`cursor-pointer transition-all duration-200 hover:bg-gray-50 ${
              selectedCourier?.id === rate.id 
                ? 'border-2 border-blue-500 bg-blue-50' 
                : 'border border-gray-200'
            }`}
          >
            <div 
              className="p-4 flex justify-between items-center"
              onClick={() => {
                setSelectedCourier(rate);
                // Set success message when courier is selected
                setSuccess(`Selected ${rate.logistic?.name} - ${rate.rate?.name}`);
                // Clear success message after 3 seconds
                setTimeout(() => setSuccess(''), 3000);
              }}
            >
              <div className="flex items-center space-x-3">
                {/* Selection indicator */}
                <div className={`w-4 h-4 rounded-full border ${
                  selectedCourier?.id === rate.id
                    ? 'border-blue-500 bg-blue-500'
                    : 'border-gray-300'
                }`}>
                  {selectedCourier?.id === rate.id && (
                    <div className="w-2 h-2 m-0.5 rounded-full bg-white" />
                  )}
                </div>
                
                {/* Courier info */}
                <div>
                  <h3 className="font-semibold text-gray-900">
                    {rate.logistic?.name || 'Unknown Courier'}
                  </h3>
                  <p className="text-sm text-gray-600">{rate.rate?.name || 'Standard Service'}</p>
                </div>
              </div>
              
              <div className="text-right">
                <p className="font-bold text-gray-900">
                  {new Intl.NumberFormat('id-ID', {
                    style: 'currency',
                    currency: 'IDR'
                  }).format(rate.final_price || 0)}
                </p>
                <p className="text-sm text-gray-600">
                  {rate.min_day || '1'}-{rate.max_day || '3'} days
                </p>
              </div>
            </div>
            
          </Card>
        ))}
        <div className="flex justify-between">
              <Button variant="outline" onClick={() => setStep(2)}>Back</Button>
              <Button onClick={createShippingOrder}>Create Order</Button>
            </div>
      </div>
      
      {/* Display message if no rates available */}
      {shippingRates.length === 0 && (
        <div className="text-center p-6 bg-gray-50 rounded-lg">
          <p className="text-gray-600">No shipping rates available at the moment</p>
        </div>
      )}
    </div>
  );

  return (
    <div className="max-w-4xl mx-auto p-4">
      <h1 className="text-2xl font-bold mb-6">Create Shipping Order</h1>

      {/* Progress Steps */}
      <div className="mb-8">
        <div className="flex justify-between">
          {['Sender Details', 'Receiver Details', 'Choose Courier', 'Order Summary'].map((title, index) => (
            <div 
              key={index}
              className={`text-sm ${step > index + 1 ? 'text-green-600' : step === index + 1 ? 'text-blue-600' : 'text-gray-400'}`}
            >
              {title}
            </div>
          ))}
        </div>
      </div>

      {/* Form Steps */}
      <div className="bg-white p-6 rounded-lg shadow">
        {/* Step 1: Sender Details */}
        {step === 1 && (
          <div className="space-y-4">
            <h2 className="text-lg font-semibold">Sender Information</h2>
            <input
              type="text"
              name="sender.name"
              placeholder="Sender Name"
              value={formData.sender.name}
              onChange={handleChange}
              className="w-full p-2 border rounded"
            />
            <input
              type="text"
              name="sender.phone"
              placeholder="Sender Phone"
              value={formData.sender.phone}
              onChange={handleChange}
              className="w-full p-2 border rounded"
            />
            <div className="relative">
              <input
                type="text"
                name="sender.address"
                placeholder="Search Sender Address"
                value={formData.sender.address}
                onChange={(e) => {
                  handleChange(e);
                  handleLocationSearch(e.target.value, 'sender');
                }}
                className="w-full p-2 border rounded"
              />
              {searchResults.sender.length > 0 && (
                <div className="absolute z-10 w-full mt-1 bg-white border rounded-md shadow-lg max-h-60 overflow-auto">
                  {searchResults.sender.map((location, index) => (
                    <div
                      key={index}
                      className="p-2 hover:bg-gray-100 cursor-pointer"
                      onClick={() => handleSelectLocation(location, 'sender')}
                    >
                      <p className="font-medium">{location.display_txt}</p>
                      <p className="text-sm text-gray-600">
                        {location.adm_level_cur.type} - {location.postcodes.join(', ')}
                      </p>
                    </div>
                  ))}
                </div>
              )}
            </div>
            <Button onClick={() => setStep(2)}>Next</Button>
          </div>
        )}

        {/* Step 2: Receiver Details */}
        {step === 2 && (
          <div className="space-y-4">
            <h2 className="text-lg font-semibold">Receiver Information</h2>
            <input
              type="text"
              name="receiver.name"
              placeholder="Receiver Name"
              value={formData.receiver.name}
              onChange={handleChange}
              className="w-full p-2 border rounded"
            />
            <input
              type="text"
              name="receiver.phone"
              placeholder="Receiver Phone"
              value={formData.receiver.phone}
              onChange={handleChange}
              className="w-full p-2 border rounded"
            />
            <div className="relative">
              <input
                type="text"
                name="receiver.address"
                placeholder="Search Receiver Address"
                value={formData.receiver.address}
                onChange={(e) => {
                  handleChange(e);
                  handleLocationSearch(e.target.value, 'receiver');
                }}
                className="w-full p-2 border rounded"
              />
              {searchResults.receiver.length > 0 && (
                <div className="absolute z-10 w-full mt-1 bg-white border rounded-md shadow-lg max-h-60 overflow-auto">
                  {searchResults.receiver.map((location, index) => (
                    <div
                      key={index}
                      className="p-2 hover:bg-gray-100 cursor-pointer"
                      onClick={() => handleSelectLocation(location, 'receiver')}
                    >
                      <p className="font-medium">{location.display_txt}</p>
                      <p className="text-sm text-gray-600">
                        {location.adm_level_cur.type} - {location.postcodes.join(', ')}
                      </p>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Package Details */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold">Package Details</h3>
              
              {/* Package Dimensions */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Weight (kg)
                  </label>
                  <input
                    type="number"
                    name="package.weight"
                    value={formData.package.weight}
                    onChange={handleChange}
                    className="w-full p-2 border rounded"
                    min="0"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Length (cm)
                  </label>
                  <input
                    type="number"
                    name="package.length"
                    value={formData.package.length}
                    onChange={handleChange}
                    className="w-full p-2 border rounded"
                    min="0"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Width (cm)
                  </label>
                  <input
                    type="number"
                    name="package.width"
                    value={formData.package.width}
                    onChange={handleChange}
                    className="w-full p-2 border rounded"
                    min="0"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Height (cm)</label>
                  <input
                    type="number"
                    name="package.height"
                    value={formData.package.height}
                    onChange={handleChange}
                    className="w-full p-2 border rounded"
                    min="0"
                  />
                </div>
              </div>

              {/* Item Value */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Total Item Value (IDR)
                </label>
                <input
                  type="number"
                  value={formData.package.items.reduce((total, item) => {
                    return total + (Number(item.price) * Number(item.qty));
                  }, 0)}
                  className="w-full p-2 border rounded bg-gray-100"
                  readOnly
                />
              </div>

              {/* Products List */}
              <div className="space-y-4">
                <h4 className="font-medium">Products</h4>
                {formData.package.items.map((item, index) => (
                  <div key={index} className="grid grid-cols-3 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Product Name
                      </label>
                      <input
                        type="text"
                        name={`package.items.${index}.name`}
                        value={item.name}
                        onChange={handleChange}
                        className="w-full p-2 border rounded"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Price
                      </label>
                      <input
                        type="number"
                        name={`package.items.${index}.price`}
                        value={item.price}
                        onChange={handleChange}
                        className="w-full p-2 border rounded"
                        min="0"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Quantity
                      </label>
                      <input
                        type="number"
                        name={`package.items.${index}.qty`}
                        value={item.qty}
                        onChange={handleChange}
                        className="w-full p-2 border rounded"
                        min="1"
                      />
                    </div>
                  </div>
                ))}
                
                {/* Add Product Button */}
                <button
                  type="button"
                  onClick={() => {
                    setFormData(prev => ({
                      ...prev,
                      package: {
                        ...prev.package,
                        items: [
                          ...prev.package.items,
                          { name: '', price: 0, qty: 1 }
                        ]
                      }
                    }));
                  }}
                  className="mt-2 px-4 py-2 text-sm font-medium text-blue-600 border border-blue-600 rounded-md hover:bg-blue-50"
                >
                  Add Another Product
                </button>
              </div>
            </div>

            <div className="flex justify-between">
              <Button variant="outline" onClick={() => setStep(1)}>Back</Button>
              <Button onClick={checkRates}>Check Rates</Button>
            </div>
          </div>
        )}

        {/* Step 3: Choose Courier */}

        {step === 3 && <CourierSection />}
        {/* {step === 3 && (
          <div className="space-y-4">
            <h2 className="text-lg font-semibold">Available Couriers</h2>
            <div className="space-y-4">
              {shippingRates.map((rate, index) => (
                <div
                  key={index}
                  className={`p-4 border rounded cursor-pointer ${
                    selectedCourier?.id === rate.id ? 'border-blue-500 bg-blue-50' : ''
                  }`}
                  onClick={() => setSelectedCourier(rate)}
                >
                  <div className="flex justify-between items-center">
                    <div>
                      <h3 className="font-semibold">{rate.logistic.name}</h3>
                      <p className="text-sm text-gray-600">{rate.rate.name}</p>
                    </div>
                    <div className="text-right">
                      <p className="font-bold">
                        {new Intl.NumberFormat('id-ID', {
                          style: 'currency',
                          currency: 'IDR'
                        }).format(rate.final_price)}
                      </p>
                      <p className="text-sm text-gray-600">
                        {rate.min_day}-{rate.max_day} days
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
            <div className="flex justify-between">
              <Button variant="outline" onClick={() => setStep(2)}>Back</Button>
              <Button onClick={createShippingOrder}>Create Order</Button>
            </div>
          </div>
        )} */}

        {/* Step 4: Order Summary */}
        {step === 4 && (
          <div className="space-y-4">
            <h2 className="text-lg font-semibold">Orders</h2>
            <div className="space-y-4">
              {orders.map((order, index) => (
                <div key={index} className="p-4 border rounded">
                  <div className="flex justify-between items-center">
                    <div>
                      <h3 className="font-semibold">Order #{order.order_id}</h3>
                      <p className="text-sm text-gray-600">
                        {order.consignee.name} - {order.destination.address}
                      </p>
                    </div>
                    <Button onClick={() => handleTrackOrder(order.order_id)}>
                      Track Order
                    </Button>
                  </div>
                </div>
              ))}
            </div>
            <Button onClick={() => setStep(1)}>Create New Order</Button>
          </div>
        )}
      </div>

      {/* Tracking Modal */}
      {trackingInfo && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg p-6 max-w-2xl w-full">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold">
                Tracking Order #{trackingInfo.order_id}
              </h3>
              <button
                onClick={() => setTrackingInfo(null)}
                className="text-gray-500 hover:text-gray-700"
              >
                ×
              </button>
            </div>
            <div className="space-y-4">
              <div className="bg-gray-50 p-4 rounded">
                <p className="font-medium">Current Status</p>
                {/* <p>{trackingInfo.status}</p> */}
                <div className="grid grid-cols-2 gap-4">
                    <div>
                    <p className="text-sm font-medium text-gray-500">Status</p>
                    <p className="mt-1">{trackingInfo.tracking?.shipper_status?.name || '-'}</p>
                    </div>
                    <div>
                    <p className="text-sm font-medium text-gray-500">Description</p>
                    <p className="mt-1">{trackingInfo.tracking?.shipper_status?.description || '-'}</p>
                    </div>
                </div>
              </div>
              <div className="space-y-2">
                {trackingInfo.trackings?.map((item, index) => (
                  <div key={index} className="border-l-2 border-blue-500 pl-4 py-2">
                    <p className="font-medium">{item.shipper_status.name}</p>
                    <p className="text-sm text-gray-600">{item.shipper_status.description}</p>
                    <p className="mt-1">
                        {trackingInfo.last_updated_date
                        ? new Date(trackingInfo.last_updated_date).toLocaleString()
                        : '-'}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}
    <br></br>
      {/* Messages */}
      {error && (
        <Alert
          type="error"
          message={error}
          onClose={() => setError('')}
        />
      )}

      {success && (
        <Alert
          type="success"
          message={success}
          onClose={() => setSuccess('')}
        />
      )}
    </div>
  );
}

export default IntegratedShipping;