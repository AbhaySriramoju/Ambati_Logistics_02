import { Truck, Mail, Phone, MapPin, Instagram, Facebook, Linkedin, Twitter } from "lucide-react";
import { Link } from "react-router-dom";

export default function Footer({ isLoggedIn }: any) {
  return (
    <footer className="bg-gray-900 text-white">
      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div>
            <div className="flex items-center space-x-2 mb-4">
              <img src="/assets/favicon.png" alt="Logo" className="h-8 w-8" />
              <span className="text-xl font-bold">AMBATI LOGISTICS</span>
            </div>
            <p className="text-gray-400">Your trusted partner in global logistics solutions.</p>
            <div className="flex space-x-4 mt-6">
              <a href="https://instagram.com" className="text-gray-400 hover:text-white"><Instagram /></a>
              <a href="https://facebook.com" className="text-gray-400 hover:text-white"><Facebook /></a>
              <a href="https://linkedin.com" className="text-gray-400 hover:text-white"><Linkedin /></a>
              <a href="https://twitter.com" className="text-gray-400 hover:text-white"><Twitter /></a>
            </div>
          </div>

          {!isLoggedIn && (
            <div>
              <h3 className="text-lg font-semibold mb-4">Quick Links</h3>
              <ul className="space-y-2">
                <li><Link to="/about" className="text-gray-400 hover:text-white">About Us</Link></li>
                <li><Link to="/services" className="text-gray-400 hover:text-white">Services</Link></li>
                <li><Link to="/industries" className="text-gray-400 hover:text-white">Industries</Link></li>
                <li><Link to="/track" className="text-gray-400 hover:text-white">Track Shipment</Link></li>
                <li><Link to="/clients-partners" className="text-gray-400 hover:text-white">Clients & Partners</Link></li>
              </ul>
            </div>
          )}

          <div>
            <h3 className="text-lg font-semibold mb-4">Contact Info</h3>
            <ul className="space-y-2 text-gray-400">
              <li className="flex items-center space-x-2"><MapPin className="text-blue-400" /> <span>3-9-90 Sharadha Nagar, Hyderabad</span></li>
              <li className="flex items-center space-x-2"><Phone className="text-blue-400" /> <span>+91-8297333338</span></li>
              <li className="flex items-center space-x-2"><Mail className="text-blue-400" /> <span>info@ambatilogistics.com</span></li>
            </ul>
          </div>

          <div>
            <h3 className="text-lg font-semibold mb-4">Business Hours</h3>
            <p className="text-gray-400">Monday - Sunday: 9:00 AM - 6:00 PM</p>
          </div>
        </div>
        <div className="border-t border-gray-800 mt-8 pt-6 text-center text-gray-400">
          &copy; {new Date().getFullYear()} AMBATI LOGISTICS. All rights reserved.
        </div>
      </div>
    </footer>
  );
}
