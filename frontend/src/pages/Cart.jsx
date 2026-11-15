
import { Link, useNavigate } from "react-router-dom";
import { useCart } from "../context/CartContext";
import "./Customer.css";

export default function Cart() {
  const navigate = useNavigate();

  const {
    cartItems,
    itemCount,
    totalAmount,
    updateQuantity,
    removeFromCart,
    clearCart,
  } = useCart();

  return (
    <main className="customer-page">
      <div className="customer-heading">
        <div>
          <p className="eyebrow">CAMPUSBITE</p>
          <h1>Your Cart</h1>
          <p>{itemCount} item(s) in your cart</p>
        </div>

        <Link to="/restaurants" className="cart-link">
          Continue Shopping
        </Link>
      </div>

      {cartItems.length === 0 ? (
        <div className="empty-cart">
          <h2>Your cart is empty 🛒</h2>
          <p>Browse restaurants and add your favourite dishes.</p>
          <Link to="/restaurants" className="primary-link">
            Explore Restaurants
          </Link>
        </div>
      ) : (
        <>
          <p className="cart-restaurant">
            Ordering from: <strong>{cartItems[0].restaurantName}</strong>
          </p>

          <div className="cart-list">
            {cartItems.map((item) => (
              <article className="cart-item" key={item.id}>
                <div className="cart-item-info">
                  <h3>{item.name}</h3>
                  <p>₹{item.price.toFixed(2)} each</p>
                  <strong>
                    ₹{(item.price * item.quantity).toFixed(2)}
                  </strong>
                </div>

                <div className="quantity-controls">
                  <button
                    onClick={() =>
                      updateQuantity(item.id, item.quantity - 1)
                    }
                  >
                    −
                  </button>

                  <span>{item.quantity}</span>

                  <button
                    onClick={() =>
                      updateQuantity(item.id, item.quantity + 1)
                    }
                  >
                    +
                  </button>
                </div>

                <button
                  className="remove-button"
                  onClick={() => removeFromCart(item.id)}
                >
                  Remove
                </button>
              </article>
            ))}
          </div>

          <div className="cart-summary">
            <div>
              <span>Total items</span>
              <strong>{itemCount}</strong>
            </div>

            <div>
              <span>Total amount</span>
              <strong>₹{totalAmount.toFixed(2)}</strong>
            </div>

            <button className="clear-cart-button" onClick={clearCart}>
              Clear Cart
            </button>

            <button
              className="primary-button checkout-button"
              onClick={() => navigate("/checkout")}
            >
              Proceed to Checkout
            </button>
          </div>
        </>
      )}
    </main>
  );
}
