
import { useEffect, useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { apiRequest } from "../services/api";
import BrandLogo from "../components/BrandLogo";
import "./DeliveryDashboard.css";

export default function DeliveryDashboard() {
  const location = useLocation();
  const isHistory = location.pathname === "/delivery/history";

  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [updatingId, setUpdatingId] = useState(null);

  async function loadOrders() {
    try {
      setLoading(true);
      setError("");
      const data = await apiRequest("/orders/delivery-orders");
      setOrders(Array.isArray(data) ? data : []);
    } catch (err) {
      setError(err.message || "Could not load deliveries.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadOrders();
  }, []);

  async function updateStatus(orderId, status) {
    try {
      setUpdatingId(orderId);
      setError("");

      await apiRequest(`/orders/${orderId}/delivery-status`, {
        method: "PATCH",
        body: JSON.stringify({ status }),
      });

      await loadOrders();
    } catch (err) {
      setError(err.message || "Could not update delivery status.");
    } finally {
      setUpdatingId(null);
    }
  }

  const visibleOrders = orders.filter((order) =>
    isHistory
      ? ["DELIVERED"].includes(order.status)
      : ["ASSIGNED", "OUT_FOR_DELIVERY"].includes(order.status)
  );

  function formatDate(value) {
    if (!value) return "—";
    return new Date(value).toLocaleString();
  }

  return (
    <main className="delivery-page">
      <div className="delivery-topbar">
        <BrandLogo />
      </div>

      <header className="delivery-header">
        <div>
          <p className="delivery-eyebrow">CAMPUSBITE DELIVERY</p>
          <h1>{isHistory ? "Delivery History" : "Assigned Deliveries"}</h1>
          <p>
            {isHistory
              ? "Your completed delivery records."
              : "Manage your assigned orders and update their delivery status."}
          </p>
        </div>

        <button className="delivery-refresh" onClick={loadOrders}>
          Refresh
        </button>
      </header>

      <nav className="delivery-tabs">
        <Link
          to="/delivery/orders"
          className={!isHistory ? "active" : ""}
        >
          Assigned Deliveries
        </Link>
        <Link
          to="/delivery/history"
          className={isHistory ? "active" : ""}
        >
          Delivery History
        </Link>
      </nav>

      {error && <div className="delivery-error">{error}</div>}

      {loading ? (
        <p className="delivery-message">Loading deliveries...</p>
      ) : visibleOrders.length === 0 ? (
        <div className="delivery-empty">
          <h3>{isHistory ? "No completed deliveries yet" : "No assigned deliveries"}</h3>
          <p>
            {isHistory
              ? "Completed orders will appear here."
              : "New deliveries assigned to you will appear here."}
          </p>
        </div>
      ) : (
        <section className="delivery-grid">
          {visibleOrders.map((order) => (
            <article className="delivery-card" key={order.id}>
              <div className="delivery-card-top">
                <div>
                  <span className="delivery-order-label">ORDER</span>
                  <h2>#{order.id}</h2>
                </div>
                <span className={`delivery-status ${order.status.toLowerCase()}`}>
                  {order.status.replaceAll("_", " ")}
                </span>
              </div>

              <div className="delivery-details">
                <div>
                  <span>Customer ID</span>
                  <strong>{order.customer_id}</strong>
                </div>
                <div>
                  <span>Order total</span>
                  <strong>₹{Number(order.total_amount).toFixed(2)}</strong>
                </div>
                <div className="delivery-address">
                  <span>Delivery address</span>
                  <strong>{order.delivery_address || "Address not available"}</strong>
                </div>
                <div>
                  <span>Order date</span>
                  <strong>{formatDate(order.created_at)}</strong>
                </div>
              </div>

              <div className="delivery-items">
                <h3>Order Items</h3>
                {order.items?.length ? (
                  order.items.map((item) => (
                    <div className="delivery-item" key={item.id}>
                      <span>
                        Item #{item.menu_item_id} × {item.quantity}
                      </span>
                      <strong>
                        ₹{(
                          Number(item.unit_price) * Number(item.quantity)
                        ).toFixed(2)}
                      </strong>
                    </div>
                  ))
                ) : (
                  <p>No item details available.</p>
                )}
              </div>

              {!isHistory && (
                <div className="delivery-actions">
                  {order.status === "ASSIGNED" && (
                    <button
                      disabled={updatingId === order.id}
                      onClick={() => updateStatus(order.id, "OUT_FOR_DELIVERY")}
                    >
                      {updatingId === order.id
                        ? "Updating..."
                        : "Start Delivery"}
                    </button>
                  )}

                  {order.status === "OUT_FOR_DELIVERY" && (
                    <button
                      disabled={updatingId === order.id}
                      onClick={() => updateStatus(order.id, "DELIVERED")}
                    >
                      {updatingId === order.id
                        ? "Updating..."
                        : "Mark as Delivered"}
                    </button>
                  )}
                </div>
              )}

              {isHistory && (
                <p className="delivery-completed">
                  <span>✓</span> Delivery completed
                </p>
              )}
            </article>
          ))}
        </section>
      )}
    </main>
  );
}
