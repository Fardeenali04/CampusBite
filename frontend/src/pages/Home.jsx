
import { Link } from "react-router-dom";
import BrandLogo from "../components/BrandLogo";
import { useAuth } from "../context/AuthContext";

export default function Home() {
  const { user, logout } = useAuth();

  const role = user?.role;

  const roleDetails = {
    CUSTOMER: {
      label: "CUSTOMER",
      title: "Your favourite food is just a few clicks away.",
      description: "Explore campus restaurants, discover delicious dishes and track your orders.",
      primary: "Browse Restaurants",
      primaryLink: "/restaurants",
      secondary: "My Orders",
      secondaryLink: "/orders",
    },
    OWNER: {
      label: "RESTAURANT OWNER",
      title: "Manage your restaurant with CampusBite.",
      description: "Manage your menu, process incoming orders and keep your restaurant running smoothly.",
      primary: "Owner Dashboard",
      primaryLink: "/owner/menu",
      secondary: "Manage Orders",
      secondaryLink: "/owner/orders",
    },
    DELIVERY_PARTNER: {
      label: "DELIVERY PARTNER",
      title: "Ready for your next delivery?",
      description: "View assigned deliveries, update delivery statuses and track your completed orders.",
      primary: "Assigned Deliveries",
      primaryLink: "/delivery/orders",
      secondary: "Delivery History",
      secondaryLink: "/delivery/history",
    },
  };

  const details = roleDetails[role];

  return (
    <main className="home-page">
      <nav className="topbar">
        <BrandLogo />

        <div className="topbar-right">
          {user ? (
            <>
              <span className="nav-link">
                Hi, {user.full_name}
              </span>

              <Link to="/dashboard" className="nav-link">
                Dashboard
              </Link>

              <button
                type="button"
                className="nav-button"
                onClick={logout}
              >
                Logout
              </button>
            </>
          ) : (
            <>
              <Link to="/login" className="nav-link">
                Sign in
              </Link>

              <Link to="/register" className="nav-button">
                Get started
              </Link>
            </>
          )}
        </div>
      </nav>

      <section className="hero">
        <div className="hero-copy">
          {user && details ? (
            <>
              <p className="eyebrow">{details.label}</p>

              <h1>Welcome back, {user.full_name}!</h1>

              <h2>{details.title}</h2>

              <p className="muted">{details.description}</p>

              <div className="hero-actions">
                <Link to={details.primaryLink} className="primary-button">
                  {details.primary} →
                </Link>

                <Link to={details.secondaryLink} className="secondary-button">
                  {details.secondary}
                </Link>
              </div>

              <p className="hero-note">
                Good food. Campus life. CampusBite.
              </p>
            </>
          ) : user ? (
            <>
              <p className="eyebrow">CAMPUSBITE</p>
              <h1>Welcome back, {user.full_name}!</h1>
              <p className="muted">
                Access your CampusBite dashboard to continue.
              </p>

              <div className="hero-actions">
                <Link to="/dashboard" className="primary-button">
                  Go to Dashboard →
                </Link>
              </div>
            </>
          ) : (
            <>
              <p className="eyebrow">GOOD FOOD. CAMPUS LIFE.</p>

              <h1>Your campus cravings, delivered.</h1>

              <p className="muted">
                Discover local campus restaurants, explore delicious menus
                and get your favourite meals without the hassle.
              </p>

              <div className="hero-actions">
                <Link to="/register" className="primary-button">
                  Get started →
                </Link>

                <Link to="/login" className="secondary-button">
                  Sign in
                </Link>
              </div>

              <p className="hero-note">Made for campus life.</p>
            </>
          )}
        </div>

        <div className="hero-visual">
          <div className="hero-image-placeholder">
            <span>🍜</span>
            <p>
              {user
                ? "Welcome to your CampusBite dashboard."
                : "Something delicious is waiting."}
            </p>
          </div>
        </div>
      </section>
    </main>
  );
}
