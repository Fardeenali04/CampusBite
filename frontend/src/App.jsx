
import { Routes, Route, Navigate } from "react-router-dom";

import Home from "./pages/Home";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Dashboard from "./pages/Dashboard";
import Restaurants from "./pages/Restaurants";
import RestaurantMenu from "./pages/RestaurantMenu";
import Cart from "./pages/Cart";
import Checkout from "./pages/Checkout";
import OrderSuccess from "./pages/OrderSuccess";
import MyOrders from "./pages/MyOrders";
import OwnerDashboard from "./pages/OwnerDashboard";
import OwnerRefunds from "./pages/OwnerRefunds";
import DeliveryDashboard from "./pages/DeliveryDashboard";

import ProtectedRoute from "./components/ProtectedRoute";
import GuestRoute from "./components/GuestRoute";

function App() {
  return (
    <Routes>
      <Route path="/" element={<Home />} />

      <Route path="/login" element={<GuestRoute><Login /></GuestRoute>} />
      <Route path="/register" element={<GuestRoute><Register /></GuestRoute>} />

      <Route
        path="/dashboard"
        element={<ProtectedRoute><Dashboard /></ProtectedRoute>}
      />

      <Route path="/restaurants" element={
        <ProtectedRoute allowedRoles={["CUSTOMER"]}>
          <Restaurants />
        </ProtectedRoute>
      } />

      <Route path="/restaurants/:restaurantId" element={
        <ProtectedRoute allowedRoles={["CUSTOMER"]}>
          <RestaurantMenu />
        </ProtectedRoute>
      } />

      <Route path="/cart" element={
        <ProtectedRoute allowedRoles={["CUSTOMER"]}>
          <Cart />
        </ProtectedRoute>
      } />

      <Route path="/checkout" element={
        <ProtectedRoute allowedRoles={["CUSTOMER"]}>
          <Checkout />
        </ProtectedRoute>
      } />

      <Route path="/order-success" element={
        <ProtectedRoute allowedRoles={["CUSTOMER"]}>
          <OrderSuccess />
        </ProtectedRoute>
      } />

      <Route path="/orders" element={
        <ProtectedRoute allowedRoles={["CUSTOMER"]}>
          <MyOrders />
        </ProtectedRoute>
      } />

      <Route path="/owner/menu" element={
        <ProtectedRoute allowedRoles={["OWNER"]}>
          <OwnerDashboard />
        </ProtectedRoute>
      } />

      <Route path="/owner/orders" element={
        <ProtectedRoute allowedRoles={["OWNER"]}>
          <OwnerDashboard />
        </ProtectedRoute>
      } />

      <Route path="/owner/reminders" element={
        <ProtectedRoute allowedRoles={["OWNER"]}>
          <OwnerDashboard />
        </ProtectedRoute>
      } />

      <Route path="/owner/refunds" element={
        <ProtectedRoute allowedRoles={["OWNER"]}>
          <OwnerRefunds />
        </ProtectedRoute>
      } />

      <Route path="/delivery/orders" element={
        <ProtectedRoute allowedRoles={["DELIVERY_PARTNER"]}>
          <DeliveryDashboard />
        </ProtectedRoute>
      } />

      <Route path="/delivery/history" element={
        <ProtectedRoute allowedRoles={["DELIVERY_PARTNER"]}>
          <DeliveryDashboard />
        </ProtectedRoute>
      } />

      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

export default App;