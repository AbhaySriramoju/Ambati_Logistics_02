import { Star } from 'lucide-react';
import { FaMale, FaFemale } from "react-icons/fa";
import SecurityBanner from "../components/SecurityBanner";

export default function Industries() {
  const industries = [
    {
      title: "Manufacturing & Industrial",
      image: "/assets/Manufacturing_01.jpeg",
      points: [
        "Just-in-time delivery solutions",
        "Raw material transportation",
        "Finished goods distribution",
        "Inventory management systems",
      ],
    },
    {
      title: "Retail & E-commerce",
      image: "/assets/Retail_01.jpeg",
      points: [
        "Omnichannel fulfillment",
        "Last-mile delivery",
        "Returns management",
        "Inventory optimization",
      ],
    },
    {
      title: "Healthcare & Pharmaceuticals",
      image: "/assets/Healthcare_01.jpeg",
      points: [
        "Temperature-controlled transport",
        "Regulatory compliance",
        "Medical device logistics",
        "Healthcare supply chain solutions",
      ],
    },
    {
      title: "Technology & Electronics",
      image: "/assets/Technology_01.jpeg",
      points: [
        "High-value cargo handling",
        "Secure transportation",
        "Component logistics",
        "Reverse logistics",
      ],
    },
  ];

  const testimonials = [
    {
      name: "Anirudh",
      company: "Tech Solutions Inc.",
      content:
        "AMBATI LOGISTICS has transformed our supply chain efficiency. Their innovative solutions and reliable service have been instrumental in our growth.",
      image: "/assets/male_13281218.png",
    },
    {
      name: "Chaitanya",
      company: "Global Manufacturing Co.",
      content:
        "We've seen a 30% improvement in delivery times since partnering with AMBATI LOGISTICS. Their attention to detail and professional service is outstanding.",
      image: "/assets/male_13281218.png",
    },
    {
      name: "Aishwarya",
      company: "E-commerce Express",
      content:
        "The level of transparency and reliability we get with AMBATI LOGISTICS is unmatched. They're not just a service provider, but a true business partner.",
      image: "/assets/female_1443287.png",
    },
  ];
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
              <h1 className="text-5xl font-bold mb-6">Industries We Serve</h1>
              <p className="text-xl text-blue-100">
                Specialized logistics solutions tailored for diverse industry sectors
              </p>
            </div>
          </div>
        </div>

        <div className="py-20">
          <div className="container mx-auto px-4">
            <div className="grid md:grid-cols-2 gap-12">
              {industries.map((industry) => (
                <div key={industry.title} className="bg-white rounded-2xl shadow-lg overflow-hidden hover:shadow-xl transition-shadow">
                  <div className="relative h-64">
                    <img
                      src={industry.image}
                      alt={industry.title}
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent flex items-end">
                      <h2 className="text-2xl font-semibold text-white p-6">{industry.title}</h2>
                    </div>
                  </div>
                  <div className="p-6">
                    <ul className="space-y-3">
                      {industry.points.map((point) => (
                        <li key={point} className="flex items-center text-gray-600">
                          <span className="w-2 h-2 bg-blue-600 rounded-full mr-2"></span>
                          {point}
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Testimonials Section */}
        <section className="py-20 bg-gradient-to-b from-gray-50 to-white">
          <div className="container mx-auto px-4">
            <h2 className="text-4xl font-bold text-center mb-16">What Our Clients Say</h2>
            <div className="grid md:grid-cols-3 gap-8">
              {testimonials.map((testimonial) => (
                <div key={testimonial.name} className="bg-white p-6 rounded-2xl shadow-lg hover:shadow-xl transition-all">
                  <div className="flex items-center mb-6">
                    {[...Array(5)].map((_, i) => (
                      <Star
                        key={i}
                        className="h-5 w-5 text-yellow-400 fill-current"
                      />
                    ))}
                  </div>
                  <p className="text-gray-600 mb-6">"{testimonial.content}"</p>
                  <div className="flex items-center">
                    {/* Use gender icon instead of image */}
                    {testimonial.name === "Aishwarya" ? (
                      <div className="w-12 h-12 rounded-full bg-pink-100 text-pink-600 flex items-center justify-center text-2xl mr-4">
                        <FaFemale />
                      </div>
                    ) : (
                      <div className="w-12 h-12 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center text-2xl mr-4">
                        <FaMale />
                      </div>
                    )}
                    <div>
                      <p className="font-semibold">{testimonial.name}</p>
                      <p className="text-gray-500 text-sm">{testimonial.company}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>
      </div>
    </>
  );
}