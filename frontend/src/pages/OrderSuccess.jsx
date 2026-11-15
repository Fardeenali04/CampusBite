
import { Link, useLocation, Navigate } from "react-router-dom";
import "./Customer.css";

export default function OrderSuccess() {
  const location = useLocation();
  const order = location.state?.order;

  if (!order) {
    return <Navigate to="/restaurants" replace />;
  }

  return (
    <main className="customer-page">
      <section className="order-success">
        <div className="success-icon">✓</div>

        <p className="eyebrow">ORDER CONFIRMED</p>
        <h1>Your order has been placed!</h1>
        <p>
          Your payment was simulated successfully. The restaurant
          can now receive your order.
        </p>

        <div className="success-details">
          <div>
            <span>Order ID</span>
            <strong>#{order.id}</strong>
          </div>

          <div>
            <span>Order Status</span>
            <strong>{order.status}</strong>
          </div>

          <div>
            <span>Payment</span>
            <strong>MOCK_PAID</strong>
          </div>

          <div>
            <span>Total Amount</span>
            <strong>₹{Number(order.total_amount).toFixed(2)}</strong>
          </div>
        </div>

        <h3>Delivery Address</h3>
        <p>{order.delivery_address}</p>

        <div className="success-actions">
          <Link to="/orders" className="primary-link">
            View My Orders
          </Link>

          <Link to="/restaurants" className="secondary-button">
            Continue Shopping
          </Link>
        </div>
      </section>
    </main>
  );
}
