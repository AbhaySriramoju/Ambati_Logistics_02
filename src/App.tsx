import { useEffect, useState } from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  useNavigate,
  Navigate,
} from "react-router-dom";
import Header from "./components/Header";
import Footer from "./components/Footer";
import Home from "./pages/Home";
import About from "./pages/About";
import Services from "./pages/Services";
import Industries from "./pages/Industries";
import Track from "./pages/Track";
import UserTracking from "./pages/UserTracking";
import LoginPage from "./pages/LoginPage";
import Dashboard from "./pages/Dashboard";
import Warehouse from "./pages/Warehouse";
import CreateShipment from "./pages/CreateShipment";
import Staff from "./pages/Staff";
import SignupPage from "./pages/SignupPage";
import ForgotPassword from "./pages/ForgotPassword";
import ResetPassword from "./pages/ResetPassword";
import Contact from "./pages/Contact";
import ScrollToTop from "./components/ScrollToTop";
import WhatsAppButton from "./components/WhatsAppButton";
import PODLogin from "./pages/PODLogin";
import PODPage from "./pages/PODPage";
import ShipmentPaymentPage from "./pages/ShipmentPaymentPage";
import ClientInvoicePage from "./pages/ClientInvoicePage";
import ClientsPage from "./pages/ClientsPage";

function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  useEffect(() => {
    const loginStatus = localStorage.getItem("isLoggedIn");
    setIsLoggedIn(loginStatus === "true");
  }, []);

  const handleLogin = () => {
    localStorage.setItem("isLoggedIn", "true");
    setIsLoggedIn(true);
  };

  const handleLogout = () => {
    localStorage.removeItem("isLoggedIn");
    setIsLoggedIn(false);
    // Remove supabase sign out for now (no supabase in this scope)
    // If you add supabase, import and use it here
  };

  return (
    <Router basename="/">
      <ScrollToTop />
      <Header isLoggedIn={isLoggedIn} onLogout={handleLogout} />
      <main className="flex-grow">
        <Routes>
          {/* Redirect root path based on login status */}
          <Route
            path="/"
            element={
              isLoggedIn ? <Navigate to="/dashboard" replace /> : <Home />
            }
          />
          <Route path="/about" element={<About />} />
          <Route path="/services" element={<Services />} />
          <Route path="/industries" element={<Industries />} />
          <Route path="/track" element={<Track />} />
          <Route
            path="/user-tracking/:trackingNumber?"
            element={<UserTracking />}
          />
          <Route path="/contact" element={<Contact />} />
          <Route path="/login" element={<LoginPage onLogin={handleLogin} />} />
          <Route path="/signup" element={<SignupPage />} />
          <Route path="/forgot-password" element={<ForgotPassword />} />
          <Route path="/reset-password" element={<ResetPassword />} />
          <Route path="/create-shipment" element={<CreateShipment />} />

          {/* Protected Routes */}
          <Route
            path="/dashboard"
            element={
              isLoggedIn ? <Dashboard /> : <Navigate to="/login" replace />
            }
          />
          <Route
            path="/warehouse"
            element={
              isLoggedIn ? <Warehouse /> : <Navigate to="/warehouse" replace />
            }
          />
          <Route
            path="/staff"
            element={isLoggedIn ? <Staff /> : <Navigate to="/staff" replace />}
          />
          <Route
            path="/clients"
            element={
              isLoggedIn ? <ClientsPage /> : <Navigate to="/login" replace />
            }
          />
          {/* POD (Proof of Delivery) routes */}
          <Route path="/pod-login" element={<PODLogin />} />
          <Route path="/pod" element={<PODPage />} />
          <Route path="/shipment-payment" element={<ShipmentPaymentPage />} />
          <Route path="/client-invoice" element={<ClientInvoicePage />} />
        </Routes>
      </main>
      <Footer isLoggedIn={isLoggedIn} />
      <WhatsAppButton />
    </Router>
  );
}

export default App;
