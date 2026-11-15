
import { useCallback, useEffect, useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { apiRequest } from "../services/api";
import { useAuth } from "../context/AuthContext";
import "./OwnerDashboard.css";

const API = {
  menu: "/owner-tools/menu",
  restaurant: "/restaurants/my-restaurant",
  orders: "/orders/owner-orders",
  reminders: "/reminders/owner",
  partners: "/owner-tools/delivery-partners",
};

export default function OwnerDashboard() {
  const location = useLocation();
  const { user, logout } = useAuth();

  const section = location.pathname.includes("/owner/orders")
    ? "orders"
    : location.pathname.includes("/owner/reminders")
      ? "reminders"
      : "menu";

  const [restaurant, setRestaurant] = useState(null);
  const [menu, setMenu] = useState([]);
  const [orders, setOrders] = useState([]);
  const [reminders, setReminders] = useState([]);
  const [partners, setPartners] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  const [saving, setSaving] = useState(false);
  const [editingId, setEditingId] = useState(null);

  const emptyForm = {
    name: "",
    description: "",
    price: "",
    category: "",
    is_vegetarian: true,
    image_url: "",
  };

  const [form, setForm] = useState(emptyForm);

  const loadData = useCallback(async () => {
    setLoading(true);
    setError("");

    try {
      const restaurantData = await apiRequest(API.restaurant);
      setRestaurant(restaurantData);

      if (section === "menu") {
        const data = await apiRequest(API.menu);
        setMenu(data);
      } else if (section === "orders") {
        const [orderData, partnerData] = await Promise.all([
          apiRequest(API.orders),
          apiRequest(API.partners),
        ]);
        setOrders(orderData);
        setPartners(partnerData);
      } else {
        const data = await apiRequest(API.reminders);
        setReminders(data);
      }
    } catch (err) {
      setError(err.message || "Unable to load owner dashboard.");
    } finally {
      setLoading(false);
    }
  }, [section]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  function updateForm(event) {
    const { name, value, type, checked } = event.target;

    setForm((current) => ({
      ...current,
      [name]: type === "checkbox" ? checked : value,
    }));
  }

  function startEdit(item) {
    setEditingId(item.id);
    setForm({
      name: item.name,
      description: item.description || "",
      price: String(item.price),
      category: item.category,
      is_vegetarian: item.is_vegetarian,
      image_url: item.image_url || "",
    });
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  function resetForm() {
    setEditingId(null);
    setForm(emptyForm);
  }

  async function saveMenuItem(event) {
    event.preventDefault();
    setSaving(true);
    setError("");
    setNotice("");

    const payload = {
      name: form.name.trim(),
      description: form.description.trim() || null,
      price: Number(form.price),
      category: form.category.trim(),
      is_vegetarian: form.is_vegetarian,
      image_url: form.image_url.trim() || null,
    };

    try {
      if (editingId) {
        await apiRequest(`/menu/${editingId}`, {
          method: "PATCH",
          body: JSON.stringify(payload),
        });
        setNotice("Menu item updated.");
      } else {
        await apiRequest("/menu/", {
          method: "POST",
          body: JSON.stringify(payload),
        });
        setNotice("Menu item added.");
      }

      resetForm();
      const data = await apiRequest(API.menu);
      setMenu(data);
    } catch (err) {
      setError(err.message || "Could not save menu item.");
    } finally {
      setSaving(false);
    }
  }

  async function toggleAvailability(item) {
    setError("");
    setNotice("");

    try {
      await apiRequest(`/menu/${item.id}`, {
        method: "PATCH",
        body: JSON.stringify({ is_available: !item.is_available }),
      });

      setMenu((current) =>
        current.map((entry) =>
          entry.id === item.id
            ? { ...entry, is_available: !entry.is_available }
            : entry
        )
      );
      setNotice("Availability updated.");
    } catch (err) {
      setError(err.message || "Could not update availability.");
    }
  }

  async function deleteMenuItem(item) {
    if (!window.confirm(`Delete "${item.name}" from your menu?`)) return;

    setError("");
    setNotice("");

    try {
      await apiRequest(`/menu/${item.id}`, { method: "DELETE" });
      setMenu((current) => current.filter((entry) => entry.id !== item.id));
      setNotice("Menu item deleted.");
    } catch (err) {
      setError(err.message || "Could not delete menu item.");
    }
  }

  async function updateOrder(order, nextStatus) {
    setError("");
    setNotice("");

    try {
      const updated = await apiRequest(`/orders/${order.id}/status`, {
        method: "PATCH",
        body: JSON.stringify({ status: nextStatus }),
      });

      setOrders((current) =>
        current.map((entry) => entry.id === order.id ? updated : entry)
      );
      setNotice(`Order #${order.id} updated to ${nextStatus}.`);
    } catch (err) {
      setError(err.message || "Could not update order.");
    }
  }

  async function assignPartner(order, partnerId) {
    if (!partnerId) return;

    setError("");
    setNotice("");

    try {
      const updated = await apiRequest(`/orders/${order.id}/assign`, {
        method: "PATCH",
        body: JSON.stringify({
          delivery_partner_id: Number(partnerId),
        }),
      });

      setOrders((current) =>
        current.map((entry) => entry.id === order.id ? updated : entry)
      );
      setNotice(`Delivery partner assigned to order #${order.id}.`);
    } catch (err) {
      setError(err.message || "Could not assign delivery partner.");
    }
  }

  const title = {
    menu: "Menu Management",
    orders: "Incoming Orders",
    reminders: "Order Reminders",
  }[section];

  return (
    <div className="owner-page">
      <header className="owner-topbar">
        <Link to="/dashboard" className="owner-brand">
          <span className="owner-brand-mark">C</span>
          CampusBite <span className="owner-tag">OWNER</span>
        </Link>

        <div className="owner-user">
          <span>{user?.full_name}</span>
          <button onClick={logout}>Logout</button>
        </div>
      </header>

      <div className="owner-layout">
        <aside className="owner-sidebar">
          <p className="owner-side-label">MANAGEMENT</p>
          <Link className={section === "menu" ? "active" : ""} to="/owner/menu">
            Menu
          </Link>
          <Link className={section === "orders" ? "active" : ""} to="/owner/orders">
            Orders
          </Link>
          <Link className={section === "reminders" ? "active" : ""} to="/owner/reminders">
            Reminders
          </Link>
          <Link to="/dashboard">Dashboard</Link>
        </aside>

        <main className="owner-content">
          <p className="owner-eyebrow">{restaurant?.name || "YOUR RESTAURANT"}</p>
          <h1>{title}</h1>
          <p className="owner-subtitle">
            {section === "menu" && "Create and manage your restaurant menu."}
            {section === "orders" && "Process orders and assign delivery partners."}
            {section === "reminders" && "Orders waiting for restaurant action."}
          </p>

          {error && <div className="owner-alert error">{error}</div>}
          {notice && <div className="owner-alert success">{notice}</div>}

          {loading ? (
            <p>Loading...</p>
          ) : (
            <>
              {section === "menu" && (
                <>
                  <form className="owner-form" onSubmit={saveMenuItem}>
                    <h2>{editingId ? "Edit menu item" : "Add a menu item"}</h2>

                    <div className="owner-form-grid">
                      <label>
                        Dish name
                        <input name="name" value={form.name} onChange={updateForm} required minLength={2} />
                      </label>

                      <label>
                        Price (₹)
                        <input name="price" type="number" min="0.01" step="0.01" value={form.price} onChange={updateForm} required />
                      </label>

                      <label>
                        Category
                        <input name="category" value={form.category} onChange={updateForm} required minLength={2} placeholder="Main Course, Snacks..." />
                      </label>

                      <label>
                        Image URL (optional)
                        <input name="image_url" type="url" value={form.image_url} onChange={updateForm} />
                      </label>

                      <label className="owner-full">
                        Description
                        <textarea name="description" value={form.description} onChange={updateForm} rows={2} />
                      </label>

                      <label className="owner-check">
                        <input name="is_vegetarian" type="checkbox" checked={form.is_vegetarian} onChange={updateForm} />
                        Vegetarian
                      </label>
                    </div>

                    <div className="owner-form-actions">
                      <button className="owner-primary" disabled={saving}>
                        {saving ? "Saving..." : editingId ? "Save Changes" : "Add Menu Item"}
                      </button>
                      {editingId && (
                        <button type="button" className="owner-secondary" onClick={resetForm}>
                          Cancel Edit
                        </button>
                      )}
                    </div>
                  </form>

                  <div className="owner-section-heading">
                    <h2>Your Menu ({menu.length})</h2>
                  </div>

                  <div className="owner-table-wrap">
                    <table className="owner-table">
                      <thead>
                        <tr>
                          <th>Dish</th>
                          <th>Category</th>
                          <th>Price</th>
                          <th>Availability</th>
                          <th>Actions</th>
                        </tr>
                      </thead>
                      <tbody>
                        {menu.map((item) => (
                          <tr key={item.id}>
                            <td>
                              <strong>{item.name}</strong>
                              <small>{item.is_vegetarian ? "Vegetarian" : "Non-vegetarian"}</small>
                            </td>
                            <td>{item.category}</td>
                            <td>₹{Number(item.price).toFixed(2)}</td>
                            <td>
                              <button
                                className={`owner-status ${item.is_available ? "on" : "off"}`}
                                onClick={() => toggleAvailability(item)}
                              >
                                {item.is_available ? "Available" : "Unavailable"}
                              </button>
                            </td>
                            <td className="owner-actions">
                              <button onClick={() => startEdit(item)}>Edit</button>
                              <button className="danger" onClick={() => deleteMenuItem(item)}>Delete</button>
                            </td>
                          </tr>
                        ))}
                        {menu.length === 0 && (
                          <tr><td colSpan="5">No menu items yet. Add your first dish above.</td></tr>
                        )}
                      </tbody>
                    </table>
                  </div>
                </>
              )}

              {section === "orders" && (
                <div className="owner-order-list">
                  {orders.map((order) => (
                    <article className="owner-order-card" key={order.id}>
                      <div className="owner-order-heading">
                        <div>
                          <p className="owner-eyebrow">ORDER #{order.id}</p>
                          <h2>₹{Number(order.total_amount).toFixed(2)}</h2>
                        </div>
                        <span className="owner-order-status">{order.status}</span>
                      </div>

                      <p><strong>Delivery:</strong> {order.delivery_address}</p>
                      <p><strong>Customer ID:</strong> {order.customer_id}</p>

                      <div className="owner-order-items">
                        {(order.items || []).map((item) => (
                          <span key={item.id}>
                            Menu #{item.menu_item_id} × {item.quantity}
                          </span>
                        ))}
                      </div>

                      <div className="owner-order-actions">
                        {order.status === "PLACED" && (
                          <button onClick={() => updateOrder(order, "ACCEPTED")}>Accept Order</button>
                        )}
                        {order.status === "ACCEPTED" && (
                          <button onClick={() => updateOrder(order, "PREPARING")}>Start Preparing</button>
                        )}
                        {order.status === "PREPARING" && (
                          <button onClick={() => updateOrder(order, "READY")}>Mark Ready</button>
                        )}

                        {order.status === "READY" && (
                          <select
                            defaultValue=""
                            onChange={(event) => assignPartner(order, event.target.value)}
                          >
                            <option value="" disabled>Assign delivery partner</option>
                            {partners.map((partner) => (
                              <option key={partner.id} value={partner.id}>
                                {partner.full_name} {partner.phone ? `— ${partner.phone}` : ""}
                              </option>
                            ))}
                          </select>
                        )}
                      </div>
                    </article>
                  ))}

                  {orders.length === 0 && <p>No orders received yet.</p>}
                </div>
              )}

              {section === "reminders" && (
                <div className="owner-reminder-list">
                  {reminders.map((reminder) => (
                    <article className="owner-reminder-card" key={reminder.id}>
                      <div>
                        <strong>Order #{reminder.order_id}</strong>
                        <span>{reminder.reminder_type}</span>
                      </div>
                      <p>{reminder.message}</p>
                      <small>
                        {reminder.sent_at
                          ? new Date(reminder.sent_at).toLocaleString()
                          : ""}
                      </small>
                    </article>
                  ))}
                  {reminders.length === 0 && <p>No reminders at the moment.</p>}
                </div>
              )}
            </>
          )}
        </main>
      </div>
    </div>
  );
}
