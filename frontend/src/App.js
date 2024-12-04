import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Navbar from './components/Navbar';
import Home from './pages/Home';
import LocationSearch from './pages/LocationSearch';
import ShippingCost from './pages/ShippingCost';
import OrderCreate from './pages/OrderCreate';
import PickupManagement from './pages/PickupManagement';
import LabelManagement from './pages/ShippingLabelPage';
import OrderTracking from './pages/OrderTracking';
import IntegratedShipping from './pages/IntegratedShipping';


function App() {
  return (
    <Router>
      <div className="min-h-screen bg-gray-50">
        <Navbar />
        <div className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
          {/* Content area */}
          <div className="px-4 py-6 sm:px-0">
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/location" element={<LocationSearch />} />
              <Route path="/shipping" element={<ShippingCost />} />
              <Route path="/order" element={<OrderCreate />} />
              <Route path="/pickup" element={<PickupManagement />} />
              <Route path="/label" element={<LabelManagement />} />
              <Route path="/order-tracking" element={<OrderTracking />} />
              <Route path="/integrated-shipping" element={<IntegratedShipping />} />
            </Routes>
          </div>
        </div>
      </div>
    </Router>
  );
}

export default App;