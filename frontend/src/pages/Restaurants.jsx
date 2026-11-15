import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { apiRequest } from "../services/api";
import "./Customer.css";

export default function Restaurants() {
  const [restaurants, setRestaurants] = useState([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let cancelled = false;

    async function loadRestaurants() {
      setLoading(true);
      setError("");

      try {
        const params = new URLSearchParams({
          search,
          skip: "0",
          limit: "50",
        });

        const data = await apiRequest(`/restaurants/?${params}`);

        if (!cancelled) {
          setRestaurants(Array.isArray(data) ? data : data.items || []);
        }
      } catch (err) {
        if (!cancelled) setError(err.message || "Could not load restaurants.");
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    loadRestaurants();

    return () => {
      cancelled = true;
    };
  }, [search]);

  return (
    <main className="customer-page">
      <div className="customer-heading">
        <div>
          <p className="eyebrow">CAMPUSBITE</p>
          <h1>Discover restaurants</h1>
          <p>Find something delicious around your campus.</p>
        </div>

        <Link to="/cart" className="cart-link">
          View Cart
        </Link>
      </div>

      <input
        className="customer-search"
        type="search"
        placeholder="Search restaurants..."
        value={search}
        onChange={(e) => setSearch(e.target.value)}
      />

      {loading && <p className="customer-message">Loading restaurants...</p>}

      {error && <p className="customer-error">{error}</p>}

      {!loading && !error && restaurants.length === 0 && (
        <p className="customer-message">No restaurants found.</p>
      )}

      <div className="restaurant-grid">
        {restaurants.map((restaurant) => (
          <article className="restaurant-card" key={restaurant.id}>
            {restaurant.image_url ? (
              <img
                src={restaurant.image_url}
                alt={restaurant.name}
                className="restaurant-image"
              />
            ) : (
              <div className="restaurant-image restaurant-placeholder">
                🍽️
              </div>
            )}

            <div className="restaurant-card-content">
              <div className="restaurant-card-title">
                <h2>{restaurant.name}</h2>
                <span
                  className={
                    restaurant.is_available
                      ? "availability available"
                      : "availability unavailable"
                  }
                >
                  {restaurant.is_available ? "Available" : "Unavailable"}
                </span>
              </div>

              <p>{restaurant.description || "Explore the menu."}</p>
              <small>{restaurant.address}</small>

              <Link
                to={`/restaurants/${restaurant.id}`}
                className="primary-link"
              >
                View Menu
              </Link>
            </div>
          </article>
        ))}
      </div>
    </main>
  );
}