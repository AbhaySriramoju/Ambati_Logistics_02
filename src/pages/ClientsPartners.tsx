import React from "react";
import SecurityBanner from "../components/SecurityBanner";

const clients = [
  { name: "Amazon India", logo: "/assets/clientA.png" },
  { name: "Flipkart", logo: "/assets/clientB.png" },
  { name: "Tata Steel", logo: "/assets/clientC.png" },
  { name: "Apollo Hospitals", logo: "/assets/clientD.png" },
  { name: "Reliance Retail", logo: "/assets/clientA.png" },
  { name: "Maruti Suzuki", logo: "/assets/clientB.png" },
  { name: "ITC Limited", logo: "/assets/clientC.png" },
  { name: "DHL Express", logo: "/assets/clientD.png" },
];

const testimonials = [
  {
    name: "Sandeep Kumar",
    company: "Amazon India",
    text: "Ambati Logistics has been a reliable partner for our supply chain needs. Their professionalism and timely deliveries are unmatched.",
    photo: "/assets/male_13281218.png"
  },
  {
    name: "Priya Sharma",
    company: "Flipkart",
    text: "We appreciate the transparency and efficiency Ambati brings to our logistics operations.",
    photo: "/assets/female_1443287.png"
  },
  {
    name: "Rahul Verma",
    company: "Tata Steel",
    text: "Their team is proactive and always ready to go the extra mile. Highly recommended for any business looking for logistics excellence.",
    photo: "/assets/male_13281218.png"
  },
  {
    name: "Anjali Mehta",
    company: "Apollo Hospitals",
    text: "Ambati Logistics ensures our medical supplies reach on time, every time. Their attention to detail is impressive.",
    photo: "/assets/female_1443287.png"
  },
];

export default function ClientsPartners() {
  return (
    <>
      <SecurityBanner />
      <div className="min-h-screen bg-white">
        <div className="container mx-auto px-4 py-16">
          <h1 className="text-4xl md:text-5xl font-bold text-center text-blue-800 mb-4">Our Clients & Partners</h1>
          <p className="text-center text-lg text-gray-600 mb-12">We are proud to serve industry leaders and innovative partners.</p>
          {/* Clients Grid */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mb-20">
            {clients.map((client) => (
              <div key={client.name} className="flex flex-col items-center">
                <div className="bg-blue-50 rounded-full w-24 h-24 flex items-center justify-center mb-3 shadow-md">
                  <img src={client.logo} alt={client.name} className="h-12 w-12 object-contain" />
                </div>
                <span className="text-blue-900 font-semibold text-lg">{client.name}</span>
              </div>
            ))}
          </div>
          {/* Testimonials */}
          <h2 className="text-3xl font-bold text-center text-blue-700 mb-10">What Our Clients Say</h2>
          <div className="grid md:grid-cols-2 gap-10">
            {testimonials.map((t, idx) => (
              <div key={idx} className="bg-blue-50 rounded-2xl p-8 shadow-lg flex flex-col items-center">
                <img src={t.photo} alt={t.name} className="w-16 h-16 rounded-full mb-4 border-4 border-white shadow" />
                <p className="text-lg text-gray-700 italic mb-4 text-center">“{t.text}”</p>
                <div className="text-blue-800 font-bold">{t.name}</div>
                <div className="text-blue-500 text-sm">{t.company}</div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </>
  );
}
