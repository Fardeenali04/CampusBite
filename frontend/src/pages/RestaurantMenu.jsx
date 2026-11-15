import { useEffect, useMemo, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { apiRequest } from "../services/api";
import { useCart } from "../context/CartContext";
import "./Customer.css";

export default function RestaurantMenu() {
  const { restaurantId } = useParams();
  const { addToCart, itemCount } = useCart();

  const [restaurant, setRestaurant] = useState(null);
  const [menuItems, setMenuItems] = useState([]);
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");

  useEffect(() => {
    let cancelled = false;

    async function loadRestaurant() {
      setLoading(true);
      setError("");

      try {
        const [restaurantData, menuData] = await Promise.all([
          apiRequest(`/restaurants/${restaurantId}`),
          apiRequest(`/menu/restaurant/${restaurantId}?skip=0&limit=100`),
        ]);

        if (!cancelled) {
          setRestaurant(restaurantData);
          setMenuItems(
            Array.isArray(menuData) ? menuData : menuData.items || []
          );
        }
      } catch (err) {
        if (!cancelled) {
          setError(err.message || "Could not load this restaurant.");
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    loadRestaurant();

    return () => {
      cancelled = true;
    };
  }, [restaurantId]);

  const categories = useMemo(
    () => [...new Set(menuItems.map((item) => item.category).filter(Boolean))],
    [menuItems]
  );

  const filteredItems = menuItems.filter((item) => {
    const matchesSearch = item.name
      .toLowerCase()
      .includes(search.toLowerCase());

    const matchesCategory = !category || item.category === category;

    return matchesSearch && matchesCategory;
  });

  function handleAdd(item) {
    const result = addToCart(item, restaurant);
    setMessage(
      result.success ? `${item.name} added to cart.` : result.message
    );
  }

  if (loading) {
    return <main className="customer-page">Loading restaurant menu...</main>;
  }

  if (error) {
    return (
      <main className="customer-page">
        <p className="customer-error">{error}</p>
        <Link to="/restaurants">Back to restaurants</Link>
      </main>
    );
  }

  return (
    <main className="customer-page">
      <div className="customer-heading">
        <div>
          <Link to="/restaurants" className="back-link">
            ← All restaurants
          </Link>
          <p className="eyebrow">RESTAURANT MENU</p>
          <h1>{restaurant?.name}</h1>
          <p>{restaurant?.description}</p>
          <small>{restaurant?.address}</small>
        </div>

        <Link to="/cart" className="cart-link">
          Cart ({itemCount})
        </Link>
      </div>

      {!restaurant?.is_available && (
        <p className="customer-error">
          This restaurant is currently unavailable.
        </p>
      )}

      <div className="menu-filters">
        <input
          className="customer-search"
          type="search"
          placeholder="Search dishes..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />

        <select
          className="category-select"
          value={category}
          onChange={(e) => setCategory(e.target.value)}
        >
          <option value="">All categories</option>
          {categories.map((itemCategory) => (
            <option key={itemCategory} value={itemCategory}>
              {itemCategory}
            </option>
          ))}
        </select>
      </div>

      {message && <p className="customer-message">{message}</p>}

      {filteredItems.length === 0 ? (
        <p className="customer-message">No dishes found.</p>
      ) : (
        <div className="menu-grid">
          {filteredItems.map((item) => (
            <article className="menu-card" key={item.id}>
              {item.image_url ? (
                <img src={item.image_url} alt={item.name} />
              ) : (
                <div className="menu-placeholder">🍛</div>
              )}

              <div className="menu-card-content">
                <div className="menu-card-title">
                  <h2>{item.name}</h2>
                  <span className="food-type">
                    {item.is_vegetarian ? "🟢 Veg" : "🔴 Non-veg"}
                  </span>
                </div>

                <p>{item.description || item.category}</p>
                <strong>₹{Number(item.price).toFixed(2)}</strong>

                <button
                  className="primary-button"
                  disabled={!item.is_available || !restaurant?.is_available}
                  onClick={() => handleAdd(item)}
                >
                  {item.is_available ? "Add to Cart" : "Unavailable"}
                </button>
              </div>
            </article>
          ))}
        </div>
      )}
    </main>
  );
}