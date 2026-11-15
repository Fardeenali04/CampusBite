
import { useCallback, useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { apiRequest } from "../services/api";
import { useAuth } from "../context/AuthContext";
import BrandLogo from "../components/BrandLogo";
import "./OwnerRefunds.css";

export default function OwnerRefunds() {
  const { user, logout } = useAuth();
  const [refunds, setRefunds] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  const [processingId, setProcessingId] = useState(null);

  const loadRefunds = useCallback(async () => {
    setLoading(true);
    setError("");

    try {
      const data = await apiRequest("/refunds/owner-requests");
      setRefunds(Array.isArray(data) ? data : []);
    } catch (err) {
      setError(err.message || "Could not load refund requests.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadRefunds();
  }, [loadRefunds]);

  async function decideRefund(refundId, status) {
    const action = status === "APPROVED" ? "approve" : "reject";

    if (!window.confirm(`Are you sure you want to ${action} this refund?`)) {
      return;
    }

    setProcessingId(refundId);
    setError("");
    setNotice("");

    try {
      const updated = await apiRequest(`/refunds/${refundId}/decision`, {
        method: "PATCH",
        body: JSON.stringify({ status }),
      });

      setRefunds((current) =>
        current.map((refund) => refund.id === refundId ? updated : refund)
      );

      setNotice(`Refund #${refundId} ${status.toLowerCase()}.`);
    } catch (err) {
      setError(err.message || "Could not process refund decision.");
    } finally {
      setProcessingId(null);
    }
  }

  return (
    <div className="owner-refunds-page">
      <header className="owner-refunds-topbar">
        <div className="owner-refunds-brand-wrapper">
          <BrandLogo />
          <span className="owner-refunds-owner-tag">OWNER</span>
        </div>

        <div>
          <span>{user?.full_name}</span>
          <button onClick={logout}>Logout</button>
        </div>
      </header>

      <main className="owner-refunds-content">
        <Link to="/owner/orders" className="owner-refunds-back">
          ← Back to Owner Dashboard
        </Link>

        <p className="owner-refunds-eyebrow">CUSTOMER REQUESTS</p>
        <h1>Refund Management</h1>
        <p className="owner-refunds-subtitle">
          Review customer refund requests and record your decision.
        </p>

        <div className="owner-refunds-toolbar">
          <span>{refunds.length} refund request(s)</span>
          <button onClick={loadRefunds}>Refresh</button>
        </div>

        {error && <div className="owner-refunds-alert error">{error}</div>}
        {notice && <div className="owner-refunds-alert success">{notice}</div>}

        {loading ? (
          <p className="owner-refunds-empty">Loading refund requests...</p>
        ) : refunds.length === 0 ? (
          <div className="owner-refunds-empty">
            <h2>No refund requests</h2>
            <p>Customer refund requests will appear here.</p>
          </div>
        ) : (
          <section className="owner-refunds-list">
            {refunds.map((refund) => (
              <article className="owner-refund-card" key={refund.id}>
                <div className="owner-refund-heading">
                  <div>
                    <p>REFUND REQUEST #{refund.id}</p>
                    <h2>Order #{refund.order_id}</h2>
                  </div>

                  <span className={`refund-status ${refund.status.toLowerCase()}`}>
                    {refund.status}
                  </span>
                </div>

                <div className="owner-refund-details">
                  <div>
                    <span>Customer ID</span>
                    <strong>{refund.customer_id}</strong>
                  </div>
                  <div>
                    <span>Refund amount</span>
                    <strong>₹{Number(refund.amount).toFixed(2)}</strong>
                  </div>
                </div>

                <div className="owner-refund-reason">
                  <span>Customer's reason</span>
                  <p>{refund.reason}</p>
                </div>

                {refund.status === "PENDING" ? (
                  <div className="owner-refund-actions">
                    <button
                      className="approve-refund"
                      disabled={processingId === refund.id}
                      onClick={() => decideRefund(refund.id, "APPROVED")}
                    >
                      {processingId === refund.id ? "Processing..." : "Approve"}
                    </button>

                    <button
                      className="reject-refund"
                      disabled={processingId === refund.id}
                      onClick={() => decideRefund(refund.id, "REJECTED")}
                    >
                      {processingId === refund.id ? "Processing..." : "Reject"}
                    </button>
                  </div>
                ) : (
                  <p className="refund-reviewed">
                    This request has been {refund.status.toLowerCase()}.
                  </p>
                )}
              </article>
            ))}
          </section>
        )}
      </main>
    </div>
  );
}
