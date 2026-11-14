
import { Link } from "react-router-dom";

export default function Home() {
  return (
    <main className="home-page">
      <nav className="topbar">
        <Link to="/" className="brand">
          <span className="brand-mark">C</span>
          CampusBite
        </Link>

        <div className="topbar-right">
          <Link to="/login" className="nav-link">Sign in</Link>
          <Link to="/register" className="nav-button">Get started</Link>
        </div>
      </nav>

      <section className="hero">
        <div className="hero-copy">
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
        </div>

        <div className="hero-visual">
          <div className="hero-image-placeholder">
            <span>🍜</span>
            <p>Something delicious is waiting.</p>
          </div>
        </div>
      </section>
    </main>
  );
}
