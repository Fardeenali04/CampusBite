
import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { apiRequest } from "../services/api";
import { useCart } from "../context/CartContext";
import BrandLogo from "../components/BrandLogo";
import "./Customer.css";

export default function Checkout() {
  const navigate = useNavigate();

  const {
    cartItems,
    itemCount,
    totalAmount,
    clearCart,
  } = useCart();

  const [address, setAddress] = useState("");
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  async function handlePlaceOrder(e) {
    e.preventDefault();
    setError("");

    if (!cartItems.length) {
      setError("Your cart is empty.");
      return;
    }

    if (address.trim().length < 5) {
      setError("Please enter a valid delivery address.");
      return;
    }

    const orderData = {
      restaurant_id: cartItems[0].restaurantId,
      delivery_address: address.trim(),
      items: cartItems.map((item) => ({
        menu_item_id: item.id,
        quantity: item.quantity,
      })),
    };

    setSubmitting(true);

    try {
      const order = await apiRequest("/orders/", {
        method: "POST",
        body: JSON.stringify(orderData),
      });

      clearCart();

      navigate("/order-success", {
        replace: true,
        state: { order },
      });
    } catch (err) {
      setError(err.message || "Unable to place your order.");
    } finally {
      setSubmitting(false);
    }
  }

  if (cartItems.length === 0) {
    return (
      <main className="customer-page">
        <div className="customer-topbar">
          <BrandLogo />
        </div>

        <h1>Your cart is empty</h1>
        <Link to="/restaurants" className="primary-link">
          Browse Restaurants
        </Link>
      </main>
    );
  }

  return (
    <main className="customer-page">
      <div className="customer-topbar">
        <BrandLogo />

        <Link to="/cart" className="cart-link">
          Back to Cart
        </Link>
      </div>

      <div className="customer-heading">
        <div>
          <p className="eyebrow">CAMPUSBITE CHECKOUT</p>
          <h1>Complete your order</h1>
          <p>Ordering from {cartItems[0].restaurantName}</p>
        </div>
      </div>

      <div className="checkout-layout">
        <form className="checkout-form" onSubmit={handlePlaceOrder}>
          <h2>Delivery Details</h2>

          <label htmlFor="delivery-address">Delivery address</label>
          <textarea
            id="delivery-address"
            value={address}
            onChange={(e) => setAddress(e.target.value)}
            placeholder="Enter your complete delivery address, including building, room number and landmark..."
            rows={5}
            required
            minLength={5}
            maxLength={500}
          />

          <h2>Payment Method</h2>

          <div className="dummy-payment">
            <strong>Dummy Payment</strong>
            <p>
              This is a simulated payment for project demonstration.
              No real money will be charged.
            </p>
            <span>Payment status after order: MOCK_PAID</span>
          </div>

          {error && <p className="customer-error">{error}</p>}

          <button
            type="submit"
            className="primary-button"
            disabled={submitting || !cartItems.length}
          >
            {submitting ? "Placing Order..." : "Place Order"}
          </button>
        </form>

        <section className="checkout-summary">
          <h2>Order Summary</h2>

          {cartItems.map((item) => (
            <div className="checkout-item" key={item.id}>
              <span>
                {item.name} × {item.quantity}
              </span>
              <strong>
                ₹{(item.price * item.quantity).toFixed(2)}
              </strong>
            </div>
          ))}

          <hr />

          <div className="checkout-item">
            <span>Total items</span>
            <strong>{itemCount}</strong>
          </div>

          <div className="checkout-total">
            <span>Total payable</span>
            <strong>₹{totalAmount.toFixed(2)}</strong>
          </div>
        </section>
      </div>
    </main>
  );
}
