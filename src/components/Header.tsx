import { Menu, X, User, LogOut } from "lucide-react";
import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";

export default function Header({ isLoggedIn, onLogout }: any) {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const navigate = useNavigate();

  const handleLogoutClick = () => {
    onLogout();
    navigate("/login");
  };

  const publicLinks = [
    { name: "Home", path: "/" },
    { name: "About Us", path: "/about" },
    { name: "Services", path: "/services" },
    { name: "Industries", path: "/industries" },
    { name: "Track Shipment", path: "/track" },
    { name: "Contact", path: "/contact" },
  ];

  return (
    <header className="bg-white shadow-md sticky top-0 z-50 w-full">
      <nav className="container mx-auto px-4 py-4">
        <div className="flex justify-between items-center">
          {isLoggedIn ? (
            <div className="flex items-center space-x-2 cursor-default">
              <img src="/assets/favicon.png" alt="Logo" className="h-8 w-8" />
              <span className="text-xl font-bold text-gray-800">
                AMBATI LOGISTICS
              </span>
            </div>
          ) : (
            <Link to="/" className="flex items-center space-x-2">
              <img src="/assets/favicon.png" alt="Logo" className="h-8 w-8" />
              <span className="text-xl font-bold text-gray-800">
                AMBATI LOGISTICS
              </span>
            </Link>
          )}

          {/* Desktop */}
          <div className="hidden md:flex items-center space-x-6">
            {!isLoggedIn &&
              publicLinks.map((item) => (
                <Link
                  key={item.name}
                  to={item.path}
                  className="text-gray-600 hover:text-blue-600 transition-colors"
                >
                  {item.name}
                </Link>
              ))}

            {isLoggedIn ? (
              <button
                onClick={handleLogoutClick}
                className="text-red-600 hover:text-red-800 flex items-center gap-1"
              >
                <LogOut size={18} />
                Logout
              </button>
            ) : (
              <Link
                to="/login"
                className="flex items-center space-x-1 text-blue-600 hover:text-blue-800"
              >
                <User className="w-5 h-5" />
                <span>Login</span>
              </Link>
            )}
          </div>

          {/* Mobile menu button */}
          <button
            className="md:hidden"
            onClick={() => setIsMenuOpen(!isMenuOpen)}
          >
            {isMenuOpen ? (
              <X className="h-6 w-6 text-gray-600" />
            ) : (
              <Menu className="h-6 w-6 text-gray-600" />
            )}
          </button>
        </div>

        {/* Mobile Navigation */}
        {isMenuOpen && (
          <div className="md:hidden mt-4 space-y-2">
            {!isLoggedIn &&
              publicLinks.map((item) => (
                <Link
                  key={item.name}
                  to={item.path}
                  className="block py-2 text-gray-600 hover:text-blue-600"
                  onClick={() => setIsMenuOpen(false)}
                >
                  {item.name}
                </Link>
              ))}
            {isLoggedIn ? (
              <button
                onClick={handleLogoutClick}
                className="block w-full text-left py-2 text-red-600 hover:text-red-800"
              >
                Logout
              </button>
            ) : (
              <Link
                to="/login"
                className="block py-2 text-blue-600 hover:text-blue-800"
                onClick={() => setIsMenuOpen(false)}
              >
                Login
              </Link>
            )}
          </div>
        )}
      </nav>
    </header>
  );
}
