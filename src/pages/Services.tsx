import { Truck, Package, Globe, BarChart } from 'lucide-react';

export default function Services() {
  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <div
        className="h-[400px] relative bg-cover bg-center"
        style={{
          backgroundImage: 'url("/assets/Home_01.jpeg")'
        }}
      >
        <div className="absolute inset-0 bg-gradient-to-r from-blue-900/80 to-transparent" />
        <div className="container mx-auto px-4 h-full flex items-center relative">
          <div className="text-white max-w-3xl mx-auto text-center">
            <h1 className="text-5xl font-bold mb-6">
              Complete Logistics Services Designed for Your Business
            </h1>
            <p className="text-xl text-blue-100">
              Our comprehensive suite of services is designed to meet your diverse needs while ensuring efficiency, reliability, and cost-effectiveness.
            </p>
          </div>
        </div>
      </div>

      <div className="py-20">
        <div className="container mx-auto px-4">
          <div className="grid md:grid-cols-2 gap-12">
            <div className="bg-gradient-to-br from-blue-50 to-white p-8 rounded-2xl shadow-lg hover:shadow-xl transition-all">
              <div className="flex items-center mb-6">
                <Truck className="h-12 w-12 text-blue-600 mr-4" />
                <h2 className="text-3xl font-semibold">Transportation Services</h2>
              </div>
              <div className="space-y-6">
                <img
                  src="/assets/Home_01.jpeg"
                  alt="Transportation"
                  className="w-full h-48 object-cover rounded-lg mb-4"
                />
                <ul className="space-y-3 text-gray-600">
                  <li className="flex items-center">
                    <span className="w-2 h-2 bg-blue-600 rounded-full mr-2"></span>
                    Ground transportation and freight services
                  </li>
                  <li className="flex items-center">
                    <span className="w-2 h-2 bg-blue-600 rounded-full mr-2"></span>
                    Air freight solutions
                  </li>
                  <li className="flex items-center">
                    <span className="w-2 h-2 bg-blue-600 rounded-full mr-2"></span>
                    Ocean freight and maritime logistics
                  </li>
                  <li className="flex items-center">
                    <span className="w-2 h-2 bg-blue-600 rounded-full mr-2"></span>
                    Express delivery services
                  </li>
                </ul>
              </div>
            </div>

            <div className="bg-gradient-to-br from-blue-50 to-white p-8 rounded-2xl shadow-lg hover:shadow-xl transition-all">
              <div className="flex items-center mb-6">
                <Package className="h-12 w-12 text-blue-600 mr-4" />
                <h2 className="text-3xl font-semibold">Warehousing Solutions</h2>
              </div>
              <div className="space-y-6">
                <img
                  src="/assets/Warehouse_01.jpeg"
                  alt="Warehousing"
                  className="w-full h-48 object-cover rounded-lg mb-4"
                />
                <ul className="space-y-3 text-gray-600">
                  <li className="flex items-center">
                    <span className="w-2 h-2 bg-blue-600 rounded-full mr-2"></span>
                    Inventory management
                  </li>
                  <li className="flex items-center">
                    <span className="w-2 h-2 bg-blue-600 rounded-full mr-2"></span>
                    Order fulfillment
                  </li>
                  <li className="flex items-center">
                    <span className="w-2 h-2 bg-blue-600 rounded-full mr-2"></span>
                    Cross-docking services
                  </li>
                  <li className="flex items-center">
                    <span className="w-2 h-2 bg-blue-600 rounded-full mr-2"></span>
                    Climate-controlled storage
                  </li>
                </ul>
              </div>
            </div>

            <div className="bg-gradient-to-br from-blue-50 to-white p-8 rounded-2xl shadow-lg hover:shadow-xl transition-all">
              <div className="flex items-center mb-6">
                <Globe className="h-12 w-12 text-blue-600 mr-4" />
                <h2 className="text-3xl font-semibold">Global Logistics</h2>
              </div>
              <div className="space-y-6">
                <img
                  src="/assets/GlobalLogistics_01.jpeg"
                  alt="Global Logistics"
                  className="w-full h-48 object-cover rounded-lg mb-4"
                />
                <ul className="space-y-3 text-gray-600">
                  <li className="flex items-center">
                    <span className="w-2 h-2 bg-blue-600 rounded-full mr-2"></span>
                    International shipping
                  </li>
                  <li className="flex items-center">
                    <span className="w-2 h-2 bg-blue-600 rounded-full mr-2"></span>
                    Customs clearance
                  </li>
                  <li className="flex items-center">
                    <span className="w-2 h-2 bg-blue-600 rounded-full mr-2"></span>
                    Import/Export documentation
                  </li>
                  <li className="flex items-center">
                    <span className="w-2 h-2 bg-blue-600 rounded-full mr-2"></span>
                    Global trade compliance
                  </li>
                </ul>
              </div>
            </div>

            <div className="bg-gradient-to-br from-blue-50 to-white p-8 rounded-2xl shadow-lg hover:shadow-xl transition-all">
              <div className="flex items-center mb-6">
                <BarChart className="h-12 w-12 text-blue-600 mr-4" />
                <h2 className="text-3xl font-semibold">Supply Chain Solutions</h2>
              </div>
              <div className="space-y-6">
                <img
                  src="/assets/SupplyChain_01.jpeg"
                  alt="Supply Chain"
                  className="w-full h-48 object-cover rounded-lg mb-4"
                />
                <ul className="space-y-3 text-gray-600">
                  <li className="flex items-center">
                    <span className="w-2 h-2 bg-blue-600 rounded-full mr-2"></span>
                    Supply chain optimization
                  </li>
                  <li className="flex items-center">
                    <span className="w-2 h-2 bg-blue-600 rounded-full mr-2"></span>
                    Demand planning
                  </li>
                  <li className="flex items-center">
                    <span className="w-2 h-2 bg-blue-600 rounded-full mr-2"></span>
                    Network design
                  </li>
                  <li className="flex items-center">
                    <span className="w-2 h-2 bg-blue-600 rounded-full mr-2"></span>
                    Performance analytics
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}