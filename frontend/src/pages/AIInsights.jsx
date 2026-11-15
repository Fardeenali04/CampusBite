
import { useState } from "react";
import { Link } from "react-router-dom";
import BrandLogo from "../components/BrandLogo";
import { apiRequest } from "../services/api";
import "./AIInsights.css";

export default function AIInsights() {
  const [question, setQuestion] = useState("");
  const [answer, setAnswer] = useState("");
  const [ordersAnalyzed, setOrdersAnalyzed] = useState(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(event) {
    event.preventDefault();

    const trimmedQuestion = question.trim();

    if (!trimmedQuestion) {
      setError("Please enter a question.");
      return;
    }

    setLoading(true);
    setError("");
    setAnswer("");
    setOrdersAnalyzed(null);

    try {
      const data = await apiRequest("/ai/insights", {
        method: "POST",
        body: JSON.stringify({
          question: trimmedQuestion,
        }),
      });

      setAnswer(data.answer);
      setOrdersAnalyzed(data.orders_analyzed);
    } catch (err) {
      setError(err.message || "Unable to generate insights. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="ai-page">
      <nav className="ai-topbar">
        <BrandLogo />
        <Link to="/dashboard" className="ai-back-link">
          ← Dashboard
        </Link>
      </nav>

      <section className="ai-container">
        <div className="ai-heading">
          <span className="ai-eyebrow">CAMPUSBITE AI</span>
          <h1>Your Personal Order Insights</h1>
          <p>
            Ask questions about your spending, favourite dishes,
            order history and purchasing patterns.
          </p>
        </div>

        <form className="ai-form" onSubmit={handleSubmit}>
          <label htmlFor="ai-question">What would you like to know?</label>

          <textarea
            id="ai-question"
            value={question}
            onChange={(event) => setQuestion(event.target.value)}
            placeholder="Example: Which dish do I order most frequently?"
            rows={4}
            maxLength={1000}
            disabled={loading}
          />

          <button type="submit" disabled={loading || !question.trim()}>
            {loading ? "Analyzing your orders..." : "Generate Insights"}
          </button>
        </form>

        {error && (
          <div className="ai-error" role="alert">
            {error}
          </div>
        )}

        {answer && (
          <section className="ai-answer">
            <h2>AI Analysis</h2>
            <p className="ai-answer-text">{answer}</p>
            <span className="ai-meta">
              Based on {ordersAnalyzed} order(s)
            </span>
          </section>
        )}

        <div className="ai-suggestions">
          <h3>Try asking</h3>
          <button
            type="button"
            onClick={() => setQuestion("How much have I spent on CampusBite?")}
          >
            How much have I spent?
          </button>
          <button
            type="button"
            onClick={() => setQuestion("Which dish do I order most frequently?")}
          >
            What is my favourite dish?
          </button>
          <button
            type="button"
            onClick={() => setQuestion("How many of my orders have been refunded?")}
          >
            How many orders were refunded?
          </button>
        </div>
      </section>
    </main>
  );
}
