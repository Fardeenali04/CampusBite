import { Navigate, Route, Routes } from "react-router-dom";
import { useAuth } from "./context/AuthContext";

import Home from "./pages/Home";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Dashboard from "./pages/Dashboard";

import ProtectedRoute from "./components/ProtectedRoute";
import GuestRoute from "./components/GuestRoute";

function DashboardRedirect() {
  const { user } = useAuth();
  return user ? <Dashboard /> : <Navigate to="/login" replace />;
}

function Placeholder({ title }) {
  return (
    <main className="dashboard-content">
      <h1>{title}</h1>
      <p className="muted">Coming soon.</p>
      <a href="/dashboard">← Back to dashboard</a>
    </main>
  );
}

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<Home />} />

      <Route element={<GuestRoute />}>
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
      </Route>

      <Route element={<ProtectedRoute />}>
        <Route path="/dashboard" element={<DashboardRedirect />} />
      </Route>

      <Route element={<ProtectedRoute allowedRoles={["CUSTOMER"]} />}>
        <Route path="/restaurants" element={<Placeholder title="Browse Restaurants" />} />
        <Route path="/orders" element={<Placeholder title="My Orders" />} />
        <Route path="/insights" element={<Placeholder title="AI Order Insights" />} />
      </Route>

      <Route element={<ProtectedRoute allowedRoles={["OWNER"]} />}>
        <Route path="/owner/menu" element={<Placeholder title="Menu Management" />} />
        <Route path="/owner/orders" element={<Placeholder title="Order Management" />} />
        <Route path="/owner/reminders" element={<Placeholder title="Order Reminders" />} />
      </Route>

      <Route element={<ProtectedRoute allowedRoles={["DELIVERY_PARTNER"]} />}>
        <Route path="/delivery/orders" element={<Placeholder title="Assigned Deliveries" />} />
        <Route path="/delivery/history" element={<Placeholder title="Delivery History" />} />
      </Route>

      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}