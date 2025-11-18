import SecurityBanner from "../components/SecurityBanner";

export default function About() {
  return (
    <>
      <SecurityBanner />
      <div className="min-h-screen">
        {/* Hero Section */}
        <div
          className="h-[400px] relative bg-cover bg-center"
          style={{
            backgroundImage: 'url("/assets/GlobalLogistics_01.jpeg")'
          }}
        >
          <div className="absolute inset-0 bg-gradient-to-r from-blue-900/80 to-transparent" />
          <div className="container mx-auto px-4 h-full flex items-center relative">
            <div className="text-white max-w-2xl">
              <h1 className="text-5xl font-bold mb-4">Who We Are</h1>
              <p className="text-xl text-blue-100">
                A leading logistics solutions provider with over two decades of experience
              </p>
            </div>
          </div>
        </div>

        {/* Mission & Vision */}
        <section className="py-20 bg-gradient-to-b from-white to-blue-50">
          <div className="container mx-auto px-4">
            <div className="grid md:grid-cols-2 gap-12">
              <div className="bg-white p-8 rounded-2xl shadow-lg hover:shadow-xl transition-shadow">
                <h2 className="text-3xl font-bold mb-6 text-blue-600">Our Mission</h2>
                <p className="text-gray-600 leading-relaxed mb-6">
                  Our mission is to revolutionize the logistics industry by providing reliable, efficient, and sustainable solutions that empower businesses to thrive in the global marketplace.
                </p>
                <img
                  src="/assets/ambati_serv.png"
                  alt="Mission"
                  className="w-full h-64 object-cover rounded-lg"
                />
              </div>
              <div className="bg-white p-8 rounded-2xl shadow-lg hover:shadow-xl transition-shadow">
                <h2 className="text-3xl font-bold mb-6 text-blue-600">Our Vision</h2>
                <p className="text-gray-600 leading-relaxed mb-6">
                  We envision being the most trusted and innovative logistics partner globally, setting new standards through technological advancement and sustainable practices.
                </p>
                <img
                  src="/assets/SupplyChain_01.jpeg"
                  alt="Vision"
                  className="w-full h-64 object-cover rounded-lg"
                />
              </div>
            </div>
          </div>
        </section>

        {/* Our Approach */}
        <section className="py-20 bg-white">
          <div className="container mx-auto px-4">
            <h2 className="text-4xl font-bold text-center mb-16">Our Approach to Excellence</h2>
            <div className="grid md:grid-cols-3 gap-8">
              {[
                {
                  title: "Innovation",
                  description: "We leverage cutting-edge technologies including AI-powered route optimization and automated warehousing solutions. Our innovative approach combines advanced tracking systems with machine learning to ensure efficient, timely deliveries while maintaining the highest service standards.",
                  image: "/assets/SupplyChain_01.jpeg"
                },
                {
                  title: "Sustainability",
                  description: "Our commitment to sustainability includes a green fleet of electric and hybrid vehicles, solar-powered warehouses, and eco-friendly packaging solutions. We're actively working towards carbon neutrality through smart route planning and renewable energy adoption.",
                  image: "/assets/Sustainability.jpeg"
                },
                {
                  title: "Reliability",
                  description: "With a 99.8% on-time delivery rate and 24/7 customer support, we ensure consistent, dependable service. Our robust systems and trained professionals work together to maintain high standards and provide uninterrupted service delivery.",
                  image: "/assets/Reliability.jpeg"
                }
              ].map((item) => (
                <div key={item.title} className="group">
                  <div className="relative overflow-hidden rounded-xl mb-6">
                    <img
                      src={item.image}
                      alt={item.title}
                      className="w-full h-64 object-cover group-hover:scale-110 transition-transform duration-500"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                  </div>
                  <h3 className="text-2xl font-semibold mb-4 text-blue-600">{item.title}</h3>
                  <p className="text-gray-600 leading-relaxed">{item.description}</p>
                </div>
              ))}
            </div>
          </div>
        </section>
      </div>
    </>
  );
}