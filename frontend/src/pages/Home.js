import { Link } from 'react-router-dom';

const features = [
  {
    title: 'Location Search',
    description: 'Search for locations and get area details',
    path: '/location',
    icon: '🔍',
    bgColor: 'bg-blue-50',
    borderColor: 'border-blue-200',
    hoverBorder: 'hover:border-blue-400'
  },
  {
    title: 'Shipping Cost',
    description: 'Calculate shipping costs between locations',
    path: '/shipping',
    icon: '💰',
    bgColor: 'bg-green-50',
    borderColor: 'border-green-200',
    hoverBorder: 'hover:border-green-400'
  },
  {
    title: 'Create Order',
    description: 'Create new shipping orders',
    path: '/order',
    icon: '📦',
    bgColor: 'bg-purple-50',
    borderColor: 'border-purple-200',
    hoverBorder: 'hover:border-purple-400'
  },
  {
    title: 'Manage Pickup',
    description: 'Schedule and manage pickups',
    path: '/pickup',
    icon: '🚚',
    bgColor: 'bg-orange-50',
    borderColor: 'border-orange-200',
    hoverBorder: 'hover:border-orange-400'
  }
];

function Home() {
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section */}
      <div className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto py-16 px-4 sm:px-6 lg:px-8">
          <h1 className="text-4xl font-bold text-gray-900 text-center mb-4">
            Welcome to Shipper Integration
          </h1>
          <p className="text-xl text-gray-600 text-center max-w-3xl mx-auto">
            Manage your shipping operations efficiently with our integrated platform
          </p>
        </div>
      </div>

      {/* Features Grid */}
      <div className="max-w-7xl mx-auto py-12 px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {features.map((feature, index) => (
            <Link
              key={index}
              to={feature.path}
              className={`group block p-6 rounded-lg border-2 ${feature.bgColor} ${feature.borderColor} ${feature.hoverBorder} transition-all duration-200 hover:shadow-lg`}
            >
              <div className="flex items-center mb-4">
                <span className="text-3xl mr-4">{feature.icon}</span>
                <h2 className="text-2xl font-semibold text-gray-900">
                  {feature.title}
                </h2>
              </div>
              <p className="text-gray-600 text-lg">
                {feature.description}
              </p>
            </Link>
          ))}
        </div>
      </div>

      {/* Footer */}
      <div className="bg-white mt-12">
        <div className="max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
          <p className="text-center text-gray-500">
            Powered by Shipper API
          </p>
        </div>
      </div>
    </div>
  );
}

export default Home;