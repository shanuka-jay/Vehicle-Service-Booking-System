import { BrowserRouter, Routes, Route } from "react-router-dom";
import { ToastContainer } from "react-toastify";
import ScrollToTop from "./components/ScrollToTop";
import ErrorBoundary from "./components/ErrorBoundary";
import { AuthProvider } from "./context/AuthContext";
import { SiteProvider } from "./context/SiteContext";
import Navbar from "./components/Navbar";
import Footer from "./components/Footer";
import ProtectedRoute from "./components/ProtectedRoute";
import OwnerRoute from "./components/OwnerRoute";
import AdminLayout from "./components/AdminLayout";
import Home from "./pages/Home";
import Services from "./pages/Services";
import ServiceDetail from "./pages/ServiceDetail";
import Booking from "./pages/Booking";
import BookingStatus from "./pages/BookingStatus";
import Contact from "./pages/Contact";
import AdminLogin from "./pages/AdminLogin";
import Dashboard from "./pages/admin/Dashboard";
import Bookings from "./pages/admin/Bookings";
import ServicesManage from "./pages/admin/ServicesManage";
import Testimonials from "./pages/admin/Testimonials";
import Messages from "./pages/admin/Messages";
import Gallery from "./pages/admin/Gallery";
import Users from "./pages/admin/Users";
import Website from "./pages/admin/Website";
import Settings from "./pages/admin/Settings";
const PublicLayout = ({ children }) => <><Navbar/>{children}<Footer/></>;
function AppRoutes() { return <Routes>
  <Route path="/" element={<PublicLayout><Home/></PublicLayout>}/><Route path="/services" element={<PublicLayout><Services/></PublicLayout>}/><Route path="/services/:slug" element={<PublicLayout><ServiceDetail/></PublicLayout>}/><Route path="/booking" element={<PublicLayout><Booking/></PublicLayout>}/><Route path="/status" element={<PublicLayout><BookingStatus/></PublicLayout>}/><Route path="/contact" element={<PublicLayout><Contact/></PublicLayout>}/>
  <Route path="/admin/login" element={<AdminLogin/>}/><Route path="/admin" element={<ProtectedRoute><AdminLayout/></ProtectedRoute>}><Route index element={<Dashboard/>}/><Route path="bookings" element={<Bookings/>}/><Route path="services" element={<ServicesManage/>}/><Route path="testimonials" element={<Testimonials/>}/><Route path="messages" element={<Messages/>}/><Route path="gallery" element={<Gallery/>}/><Route path="website" element={<OwnerRoute><Website/></OwnerRoute>}/><Route path="users" element={<OwnerRoute><Users/></OwnerRoute>}/><Route path="settings" element={<Settings/>}/></Route>
  <Route path="*" element={<PublicLayout><div className="section container empty-state"><h1>Page not found</h1><p>The page you requested does not exist.</p></div></PublicLayout>}/>
</Routes>; }
export default function App() { return <BrowserRouter><ToastContainer position="top-right" autoClose={6500} newestOnTop closeOnClick pauseOnHover theme="light"/><ScrollToTop/><ErrorBoundary><SiteProvider><AuthProvider><AppRoutes/></AuthProvider></SiteProvider></ErrorBoundary></BrowserRouter>; }
