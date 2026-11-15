
import { useCallback, useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { apiRequest } from "../services/api";
import "./Customer.css";

const statusLabels = {
  PLACED: "Order Placed",
  ACCEPTED: "Accepted",
  PREPARING: "Preparing",
  READY: "Ready",
  ASSIGNED: "Delivery Partner Assigned",
  OUT_FOR_DELIVERY: "Out for Delivery",
  DELIVERED: "Delivered",
  CANCELLED: "Cancelled",
  REFUNDED: "Refunded",
};

export default function MyOrders() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [actionError, setActionError] = useState("");
  const [notice, setNotice] = useState("");
  const [cancellingId, setCancellingId] = useState(null);
  const [reviewingId, setReviewingId] = useState(null);
  const [refundingId, setRefundingId] = useState(null);
  const [reviewsSubmitted, setReviewsSubmitted] = useState([]);
  const [refundsSubmitted, setRefundsSubmitted] = useState([]);
  const [reviewForms, setReviewForms] = useState({});
  const [refundReasons, setRefundReasons] = useState({});

  const loadOrders = useCallback(async () => {
    setLoading(true);
    setError("");

    try {
      const data = await apiRequest("/orders/my-orders");
      setOrders(Array.isArray(data) ? data : []);
    } catch (err) {
      setError(err.message || "Could not load your orders.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadOrders();
  }, [loadOrders]);

  async function cancelOrder(orderId) {
    if (!window.confirm(`Are you sure you want to cancel order #${orderId}?`)) {
      return;
    }

    setCancellingId(orderId);
    setActionError("");
    setNotice("");

    try {
      const updatedOrder = await apiRequest(`/orders/${orderId}/cancel`, {
        method: "PATCH",
      });

      setOrders((current) =>
        current.map((order) => order.id === orderId ? updatedOrder : order)
      );
      setNotice(`Order #${orderId} cancelled.`);
    } catch (err) {
      setActionError(err.message || "Could not cancel this order.");
    } finally {
      setCancellingId(null);
    }
  }

  function updateReviewForm(orderId, field, value) {
    setReviewForms((current) => ({
      ...current,
      [orderId]: {
        rating: current[orderId]?.rating || "5",
        comment: current[orderId]?.comment || "",
        [field]: value,
      },
    }));
  }

  async function submitReview(orderId) {
    const form = reviewForms[orderId] || { rating: "5", comment: "" };

    if (form.comment.trim().length < 3) {
      setActionError("Please enter a review of at least 3 characters.");
      return;
    }

    setReviewingId(orderId);
    setActionError("");
    setNotice("");

    try {
      await apiRequest("/reviews/", {
        method: "POST",
        body: JSON.stringify({
          order_id: orderId,
          rating: Number(form.rating),
          comment: form.comment.trim(),
        }),
      });

      setReviewsSubmitted((current) => [...current, orderId]);
      setNotice(`Review submitted for order #${orderId}.`);
    } catch (err) {
      setActionError(err.message || "Could not submit your review.");
    } finally {
      setReviewingId(null);
    }
  }

  async function submitRefund(orderId) {
    const reason = refundReasons[orderId]?.trim() || "";

    if (reason.length < 5) {
      setActionError("Please enter a refund reason of at least 5 characters.");
      return;
    }

    if (!window.confirm(`Submit a refund request for order #${orderId}?`)) {
      return;
    }

    setRefundingId(orderId);
    setActionError("");
    setNotice("");

    try {
      await apiRequest("/refunds/", {
        method: "POST",
        body: JSON.stringify({
          order_id: orderId,
          reason,
        }),
      });

      setRefundsSubmitted((current) => [...current, orderId]);
      setNotice(`Refund request submitted for order #${orderId}.`);
    } catch (err) {
      setActionError(err.message || "Could not submit your refund request.");
    } finally {
      setRefundingId(null);
    }
  }

  if (loading) {
    return <main className="customer-page">Loading your orders...</main>;
  }

  return (
    <main className="customer-page">
      <div className="customer-heading">
        <div>
          <p className="eyebrow">CAMPUSBITE</p>
          <h1>My Orders</h1>
          <p>View your orders and track their progress.</p>
        </div>

        <Link to="/restaurants" className="cart-link">
          Order Again
        </Link>
      </div>

      {error && <p className="customer-error">{error}</p>}
      {actionError && <p className="customer-error">{actionError}</p>}
      {notice && <p className="customer-success">{notice}</p>}

      {!error && orders.length === 0 && (
        <div className="empty-cart">
          <h2>No orders yet</h2>
          <p>Your placed orders will appear here.</p>
          <Link to="/restaurants" className="primary-link">
            Browse Restaurants
          </Link>
        </div>
      )}

      <div className="orders-list">
        {orders.map((order) => (
          <article className="order-card" key={order.id}>
            <div className="order-card-header">
              <div>
                <p className="eyebrow">ORDER #{order.id}</p>
                <h2>Order from Restaurant #{order.restaurant_id}</h2>
              </div>

              <span className={`order-status status-${order.status?.toLowerCase()}`}>
                {statusLabels[order.status] || order.status}
              </span>
            </div>

            <div className="order-items">
              {(order.items || []).map((item) => (
                <div className="order-item-row" key={item.id}>
                  <span>
                    Menu item #{item.menu_item_id} × {item.quantity}
                  </span>
                  <strong>
                    ₹{(Number(item.unit_price) * item.quantity).toFixed(2)}
                  </strong>
                </div>
              ))}
            </div>

            <div className="order-details">
              <div>
                <span>Total amount</span>
                <strong>₹{Number(order.total_amount).toFixed(2)}</strong>
              </div>
              <div>
                <span>Delivery address</span>
                <strong>{order.delivery_address}</strong>
              </div>
            </div>

            <div className="order-progress">
              <span>Current status</span>
              <strong>{statusLabels[order.status] || order.status}</strong>
            </div>

            {order.status === "PLACED" && (
              <button
                className="cancel-order-button"
                disabled={cancellingId === order.id}
                onClick={() => cancelOrder(order.id)}
              >
                {cancellingId === order.id ? "Cancelling..." : "Cancel Order"}
              </button>
            )}

            {order.status === "DELIVERED" && (
              <div className="order-feedback">
                <h3>Share your experience</h3>

                {reviewsSubmitted.includes(order.id) ? (
                  <p className="customer-success">Review submitted. Thank you!</p>
                ) : (
                  <div className="feedback-form">
                    <label>
                      Rating
                      <select
                        value={reviewForms[order.id]?.rating || "5"}
                        onChange={(event) =>
                          updateReviewForm(order.id, "rating", event.target.value)
                        }
                      >
                        <option value="5">5 - Excellent</option>
                        <option value="4">4 - Very good</option>
                        <option value="3">3 - Good</option>
                        <option value="2">2 - Fair</option>
                        <option value="1">1 - Poor</option>
                      </select>
                    </label>

                    <label>
                      Your review
                      <textarea
                        rows="3"
                        placeholder="Tell us about your experience..."
                        value={reviewForms[order.id]?.comment || ""}
                        onChange={(event) =>
                          updateReviewForm(order.id, "comment", event.target.value)
                        }
                      />
                    </label>

                    <button
                      className="feedback-button"
                      disabled={reviewingId === order.id}
                      onClick={() => submitReview(order.id)}
                    >
                      {reviewingId === order.id ? "Submitting..." : "Submit Review"}
                    </button>
                  </div>
                )}

                <div className="refund-form">
                  <h3>Need a refund?</h3>

                  {refundsSubmitted.includes(order.id) ? (
                    <p className="customer-success">Refund request submitted. Awaiting owner review.</p>
                  ) : (
                    <>
                      <textarea
                        rows="2"
                        placeholder="Explain why you are requesting a refund..."
                        value={refundReasons[order.id] || ""}
                        onChange={(event) =>
                          setRefundReasons((current) => ({
                            ...current,
                            [order.id]: event.target.value,
                          }))
                        }
                      />

                      <button
                        className="feedback-button refund-button"
                        disabled={refundingId === order.id}
                        onClick={() => submitRefund(order.id)}
                      >
                        {refundingId === order.id ? "Submitting..." : "Request Refund"}
                      </button>
                    </>
                  )}
                </div>
              </div>
            )}
          </article>
        ))}
      </div>
    </main>
  );
}