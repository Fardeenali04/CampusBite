
import { Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import BrandLogo from "../components/BrandLogo";

const dashboardContent = {
  CUSTOMER: {
    title: "Your food journey starts here.",
    description: "Discover restaurants, explore menus and manage your orders.",
    links: [
      ["Browse Restaurants", "/restaurants"],
      ["My Orders", "/orders"],
      ["AI Order Insights", "/insights"],
    ],
  },
  OWNER: {
    title: "Manage your restaurant.",
    description: "Manage your menu, incoming orders and customer requests.",
    links: [
      ["Manage Menu", "/owner/menu"],
      ["Manage Orders", "/owner/orders"],
      ["Reminders", "/owner/reminders"],
      ["Refund Management", "/owner/refunds"],
    ],
  },
  DELIVERY_PARTNER: {
    title: "Your deliveries.",
    description: "View assigned orders and manage your deliveries.",
    links: [
      ["Assigned Deliveries", "/delivery/orders"],
      ["Delivery History", "/delivery/history"],
    ],
  },
};

export default function Dashboard() {
  const { user, logout } = useAuth();
  const content = dashboardContent[user?.role];

  return (
    <div className="dashboard-page">
      <header className="topbar">
        <BrandLogo />

        <div className="topbar-right">
          <span>{user?.full_name}</span>
          <button className="logout-button" onClick={logout}>
            Logout
          </button>
        </div>
      </header>

      <main className="dashboard-content">
        <p className="eyebrow">{user?.role?.replaceAll("_", " ")}</p>
        <h1>{content?.title || "Welcome to CampusBite"}</h1>
        <p className="muted">{content?.description}</p>

        <div className="dashboard-grid">
          {content?.links.map(([label, path]) => (
            <Link to={path} className="dashboard-card" key={path}>
              <span>{label}</span>
              <span className="card-arrow">→</span>
            </Link>
          ))}
        </div>
      </main>
    </div>
  );
}
