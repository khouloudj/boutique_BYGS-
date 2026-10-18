import { useEffect } from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { fetchCart } from "./store";
import Navbar from "./components/Navbar";
import Footer from "./components/Footer";
import ScrollToTop from "./components/ScrollToTop";
import Shop from "./pages/Shop";
import Product from "./pages/Product";
import Auth from "./pages/Auth";
import Cart from "./pages/Cart";
import Orders from "./pages/Orders";
import Admin from "./pages/Admin";
import Wishlist from "./pages/Wishlist";

const Private = ({ role, children }) => {
  const u = useSelector((s) => s.auth.user);
  if (!u) return <Navigate to="/login" />;
  if (role && u.role !== role) return <Navigate to="/" />;
  return children;
};

export default function App() {
  const d = useDispatch();
  const user = useSelector((s) => s.auth.user);
  useEffect(() => { if (user?.role === "user") d(fetchCart()); }, [user, d]);

  return (
    <>
      <ScrollToTop />
      <Navbar />
      <main className="container">
        <Routes>
          <Route path="/" element={<Shop />} />
          <Route path="/product/:id" element={<Product />} />
          <Route path="/wishlist" element={<Wishlist />} />
          <Route path="/login" element={<Auth />} />
          <Route path="/cart" element={<Private role="user"><Cart /></Private>} />
          <Route path="/orders" element={<Private role="user"><Orders /></Private>} />
          <Route path="/admin" element={<Private role="admin"><Admin /></Private>} />
          <Route path="*" element={<Navigate to="/" />} />
        </Routes>
      </main>
      <Footer />
    </>
  );
}