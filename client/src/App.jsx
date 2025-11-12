import React, { useState } from "react";
import { Routes, Route } from "react-router-dom";
import AdminLayout from "./components/admin/AdminLayout.jsx";
import PublicLayout from "./components/PublicLayout.jsx";
import Dashboard from "./pages/admin/Dashboard.jsx";
import OrderManagement from "./pages/admin/OrderManagement.jsx";
import MenuManagement from "./pages/admin/MenuManagement.jsx";
import UserManagement from "./pages/admin/UserManagement.jsx";
import Analytics from "./pages/admin/Analytics.jsx";
import Transactions from "./pages/admin/Transactions.jsx";
import Reviews from "./pages/admin/Reviews.jsx";
import PromoCodes from "./pages/admin/PromoCodes.jsx";
import Delivery from "./pages/admin/Delivery.jsx";
import Settings from "./pages/admin/Settings.jsx";

export default function App() {
  const [isCartOpen, setIsCartOpen] = useState(false);

  return (
    <Routes>
      {/* Admin Routes */}
      <Route path="/admin" element={<AdminLayout />}>
        <Route index element={<Dashboard />} />
        <Route path="orders" element={<OrderManagement />} />
        <Route path="menu" element={<MenuManagement />} />
        <Route path="users" element={<UserManagement />} />
        <Route path="analytics" element={<Analytics />} />
        <Route path="transactions" element={<Transactions />} />
        <Route path="reviews" element={<Reviews />} />
        <Route path="promo-codes" element={<PromoCodes />} />
        <Route path="delivery" element={<Delivery />} />
        <Route path="settings" element={<Settings />} />
      </Route>

      {/* Public Routes */}
      <Route
        path="/*"
        element={
          <PublicLayout isCartOpen={isCartOpen} setIsCartOpen={setIsCartOpen} />
        }
      />
    </Routes>
  );
}
