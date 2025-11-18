import { ArrowRight, Truck, Package, Globe, BarChart, Users, Warehouse } from 'lucide-react';
import { Link } from 'react-router-dom';
import SecurityBanner from '../components/SecurityBanner';

export default function Home() {
  return (
    <div className="min-h-screen">
      {/* Security Banner */}
      <SecurityBanner />
      
      {/* Hero Section */}
      <div
        className="bg-cover bg-center h-[600px] relative"
        style={{
          backgroundImage: 'url("/assets/Home_01.jpeg")',
        }}
      >
        <div className="absolute inset-0 bg-gradient-to-r from-blue-900/80 to-transparent" />
        <div className="container mx-auto px-4 h-full flex items-center relative">
          <div className="text-white max-w-2xl">
            <h1 className="text-5xl md:text-6xl font-bold mb-6">
              Global Logistics Solutions for Your Business
            </h1>
            <p className="text-xl mb-8 text-blue-100">
              Reliable, efficient, and secure logistics services tailored to meet your needs.
            </p>
            <Link
              to="/contact"
              className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-4 rounded-full inline-flex items-center space-x-2 text-lg font-semibold shadow-lg hover:shadow-xl transition-all"
            >
              <span>Get Started</span>
              <ArrowRight className="h-5 w-5" />
            </Link>
            {/* POD Login Button */}
            {/* <Link
              to="/pod-login"
              className="mt-6 ml-4 bg-green-600 hover:bg-green-700 text-white px-6 py-3 rounded-full inline-flex items-center space-x-2 text-lg font-semibold shadow-lg hover:shadow-xl transition-all"
              style={{ display: 'inline-flex' }}
            >
              <span>POD Login</span>
              <ArrowRight className="h-5 w-5" />
            </Link> */}
          </div>
        </div>
      </div>

      {/* About Our Mission */}
      <section className="py-20 bg-white">
        <div className="container mx-auto px-4">
          <h2 className="text-4xl font-bold text-center mb-16">About Our Mission</h2>
          <div className="grid md:grid-cols-3 gap-12">
            <div className="text-center group hover:transform hover:scale-105 transition-all">
              <div className="bg-blue-100 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6 group-hover:bg-blue-200 transition-colors">
                <Truck className="h-10 w-10 text-blue-600" />
              </div>
              <h3 className="text-2xl font-semibold mb-4">Reliable Delivery</h3>
              <p className="text-gray-600">
                We ensure your shipments reach their destination safely and on time.
              </p>
            </div>
            <div className="text-center group hover:transform hover:scale-105 transition-all">
              <div className="bg-blue-100 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6 group-hover:bg-blue-200 transition-colors">
                <Package className="h-10 w-10 text-blue-600" />
              </div>
              <h3 className="text-2xl font-semibold mb-4">Secure Handling</h3>
              <p className="text-gray-600">
                Your cargo is handled with utmost care throughout its journey.
              </p>
            </div>
            <div className="text-center group hover:transform hover:scale-105 transition-all">
              <div className="bg-blue-100 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6 group-hover:bg-blue-200 transition-colors">
                <Globe className="h-10 w-10 text-blue-600" />
              </div>
              <h3 className="text-2xl font-semibold mb-4">Global Network</h3>
              <p className="text-gray-600">
                Our extensive network ensures worldwide coverage for your logistics needs.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Premium Metrics/Stats Section */}
      <section className="py-16 bg-gradient-to-b from-white to-blue-50">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl md:text-4xl font-bold text-center mb-2 text-gray-800">Flexibility, Reliability and Scale</h2>
          <h3 className="text-2xl md:text-3xl font-bold text-center mb-12 text-blue-700">
            The Answer is Ambati Logistics
            <span className="block w-16 h-1 bg-blue-600 mx-auto mt-2 rounded animate-pulse"></span>
          </h3>
          <div className="relative flex flex-col md:flex-row justify-between items-center gap-8 md:gap-0">
            {/* Animated connecting line for desktop */}
            <div className="hidden md:block absolute left-0 right-0 top-1/2 h-1 bg-gradient-to-r from-blue-100 via-blue-300 to-blue-100 z-0 animate-pulse" style={{zIndex:0}} />
            {/* Metrics */}
            <div className="flex-1 flex flex-col items-center md:items-start md:flex-row md:justify-between w-full z-10">
              {[
                { icon: <Package className="h-10 w-10 text-blue-600" />, value: '3.4 Bn+', label: 'Parcels shipped since inception' },
                { icon: <Globe className="h-10 w-10 text-blue-600" />, value: '99.5%', label: 'Indian population covered' },
                { icon: <Truck className="h-10 w-10 text-blue-600" />, value: '6.1 Mn+', label: 'Tonnes Freight shipped' },
                { icon: <Warehouse className="h-10 w-10 text-blue-600" />, value: '20 Mn+', label: 'Sq. ft. logistics infrastructure covered' }
              ].map((item, idx) => (
                <div
                  key={item.value}
                  className="group flex flex-col items-center bg-white/70 backdrop-blur-lg border border-blue-100 rounded-2xl shadow-2xl px-8 py-10 mx-2 min-w-[200px] relative overflow-hidden transition-all duration-500 hover:scale-105 hover:shadow-blue-200 hover:bg-white/90"
                  style={{boxShadow: '0 8px 32px 0 rgba(31, 38, 135, 0.10)'}}
                >
                  {/* Animated blue accent line */}
                  <span className="absolute top-0 left-1/2 -translate-x-1/2 w-20 h-1 bg-gradient-to-r from-blue-400 via-blue-600 to-blue-400 rounded-b-full animate-moveLine" />
                  <div className="bg-blue-100 p-5 rounded-full mb-5 shadow-md group-hover:scale-110 transition-transform duration-500">
                    {item.icon}
                  </div>
                  <div className="text-4xl font-extrabold text-blue-900 mb-2 tracking-tight drop-shadow-lg animate-fadeInUp">
                    {item.value}
                  </div>
                  <div className="text-gray-600 text-base mb-2 text-center animate-fadeInUp delay-100">
                    {item.label}
                  </div>
                  <div className="w-16 h-1 bg-blue-600 rounded mx-auto mt-4 animate-pulse" />
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Our Services */}
      <section className="py-20 bg-gradient-to-b from-gray-50 to-white">
        <div className="container mx-auto px-4">
          <h2 className="text-4xl font-bold text-center mb-16">Our Services</h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {[
              {
                name: 'Transportation',
                description: 'Efficient ground, air, and sea transportation solutions',
                image: '/assets/Home_01.jpeg'
              },
              {
                name: 'Warehousing',
                description: 'State-of-the-art storage and inventory management',
                image: '/assets/Warehouse_01.jpeg'
              },
              {
                name: 'Supply Chain',
                description: 'End-to-end supply chain optimization and management',
                image: '/assets/SupplyChain_01.jpeg'
              },
              {
                name: 'Global Logistics',
                description: 'Comprehensive international shipping and customs solutions',
                image: '/assets/GlobalLogistics_01.jpeg'
              },
            ].map((service) => (
              <div
                key={service.name}
                className="group relative overflow-hidden rounded-xl shadow-lg hover:shadow-xl transition-all"
              >
                <img 
                  src={service.image} 
                  alt={service.name}
                  className="w-full h-64 object-cover group-hover:scale-110 transition-transform duration-500"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent flex items-end">
                  <div className="p-6">
                    <h3 className="text-2xl font-semibold text-white mb-2">{service.name}</h3>
                    <p className="text-gray-200">
                      {service.description}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Industries We Serve */}
      <section className="py-20 bg-gradient-to-b from-gray-50 to-white">
        <div className="container mx-auto px-4">
          <h2 className="text-4xl font-bold text-center mb-16">Industries We Serve</h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[
              {
                name: 'Manufacturing',
                image: '/assets/Manufacturing_01.jpeg'
              },
              {
                name: 'Retail',
                image: '/assets/Retail_01.jpeg'
              },
              {
                name: 'E-commerce',
                image: '/assets/E-commerce_01.jpeg'
              },
              {
                name: 'Healthcare',
                image: '/assets/Healthcare_01.jpeg'
              },
              {
                name: 'Technology',
                image: '/assets/Technology_01.jpeg'
              },
              {
                name: 'Automotive',
                image: '/assets/Automotive_01.jpeg'
              },
            ].map((industry) => (
              <div
                key={industry.name}
                className="group relative overflow-hidden rounded-xl shadow-lg hover:shadow-xl transition-all"
              >
                <img 
                  src={industry.image} 
                  alt={industry.name}
                  className="w-full h-64 object-cover group-hover:scale-110 transition-transform duration-500"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent flex items-end">
                  <div className="p-6">
                    <h3 className="text-2xl font-semibold text-white mb-2">{industry.name}</h3>
                    <p className="text-gray-200">
                      Specialized logistics solutions tailored for the {industry.name.toLowerCase()} sector.
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}