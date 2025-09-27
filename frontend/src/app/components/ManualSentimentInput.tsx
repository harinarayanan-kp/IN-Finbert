"use client";

import { useState } from "react";

type SentimentData = {
  label: string;
  score: number;
  all_scores: {
    negative: number;
    neutral: number;
    positive: number;
  };
};

// Helper functions
const getSentimentColor = (sentiment: string) => {
  switch (sentiment) {
    case "positive":
      return "#059669";
    case "negative":
      return "#dc2626";
    case "neutral":
      return "#6b7280";
    default:
      return "#6b7280";
  }
};

const getSentimentEmoji = (sentiment: string) => {
  switch (sentiment) {
    case "positive":
      return "📈";
    case "negative":
      return "📉";
    case "neutral":
      return "⚖️";
    default:
      return "🤔";
  }
};

// Enhanced Sentiment Visualization Component
const SentimentResult = ({ data }: { data: SentimentData }) => {
  const { label, score, all_scores } = data;
  const confidence = Math.round(score * 100);

  return (
    <div className="sentiment-result">
      {/* Main Result Card */}
      <div
        className="sentiment-main-card"
        style={{
          background: `linear-gradient(135deg, ${getSentimentColor(
            label
          )}15, ${getSentimentColor(label)}05)`,
          borderColor: getSentimentColor(label),
        }}
      >
        <div style={{ fontSize: "40px", marginBottom: "12px" }}>
          {getSentimentEmoji(label)}
        </div>
        <div
          style={{
            fontSize: "28px",
            fontWeight: "600",
            color: getSentimentColor(label),
            textTransform: "capitalize",
            marginBottom: "8px",
            letterSpacing: "-0.01em",
          }}
        >
          {label}
        </div>
        <div
          style={{
            fontSize: "18px",
            color: "#64748b",
            fontWeight: "500",
          }}
        >
          {confidence}% Confidence
        </div>
      </div>

      {/* Score Breakdown */}
      <div className="sentiment-breakdown">
        <h4 className="sentiment-breakdown-title">Detailed Analysis</h4>

        {Object.entries(all_scores).map(([sentiment, scoreValue]) => {
          const percentage = Math.round(scoreValue * 100);
          return (
            <div key={sentiment} className="sentiment-score-row">
              <span
                style={{
                  minWidth: "90px",
                  fontSize: "15px",
                  fontWeight: "500",
                  color: getSentimentColor(sentiment),
                  textTransform: "capitalize",
                  display: "flex",
                  alignItems: "center",
                  gap: "6px",
                }}
              >
                {getSentimentEmoji(sentiment)} {sentiment}
              </span>

              <div className="sentiment-progress-bar">
                <div
                  className="sentiment-progress-fill"
                  style={{
                    width: `${percentage}%`,
                    background: getSentimentColor(sentiment),
                  }}
                />
              </div>

              <span className="sentiment-percentage">{percentage}%</span>
            </div>
          );
        })}
      </div>

      {/* Market Interpretation */}
      <div className="market-interpretation">
        <div className="interpretation-title">Market Interpretation</div>
        <div className="interpretation-text">
          {label === "positive" &&
            "📊 Bullish sentiment detected. Market conditions appear favorable for investment opportunities."}
          {label === "negative" &&
            "⚠️ Bearish sentiment detected. Exercise caution and consider risk management strategies."}
          {label === "neutral" &&
            "🔍 Neutral sentiment observed. Market shows balanced investor emotions and mixed signals."}
        </div>
      </div>
    </div>
  );
};

export default function ManualSentimentInput() {
  const [inputText, setInputText] = useState("");
  const [sentimentData, setSentimentData] = useState<SentimentData | null>(
    null
  );
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const analyzeSentiment = async () => {
    if (!inputText.trim()) return;

    setLoading(true);
    setError(null);

    try {
      const response = await fetch("http://127.0.0.1:8000/analyze", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text: inputText.trim() }),
      });

      const data = await response.json();

      if (response.ok) {
        setSentimentData(data);
      } else {
        setError("Failed to analyze sentiment. Please try again.");
      }
    } catch (error) {
      console.error("Error analyzing sentiment:", error);
      setError(
        "Unable to connect to the analysis server. Please check your connection."
      );
    } finally {
      setLoading(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && e.ctrlKey) {
      analyzeSentiment();
    }
  };

  const clearAll = () => {
    setInputText("");
    setSentimentData(null);
    setError(null);
  };

  return (
    <div className="manual-sentiment-container">
      <div className="manual-sentiment-header">
        <h2 className="manual-sentiment-title">📝 Custom Sentiment Analysis</h2>
        <p className="manual-sentiment-subtitle">
          Enter your own market news or financial text to analyze sentiment
        </p>
      </div>

      <div className="manual-input-section">
        <div className="input-wrapper">
          <label htmlFor="sentiment-input" className="input-label">
            Market News Text
          </label>
          <textarea
            id="sentiment-input"
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Enter market news, financial reports, or any text you want to analyze for sentiment... 

Example: 'Apple stock surged 5% after strong quarterly earnings beat analyst expectations with record iPhone sales.'"
            className="sentiment-textarea"
            rows={6}
            maxLength={5000}
          />
          <div className="input-meta">
            <span className="character-count">
              {inputText.length} / 5000 characters
            </span>
            <span className="input-hint">Press Ctrl + Enter to analyze</span>
          </div>
        </div>

        <div className="button-group">
          <button
            onClick={analyzeSentiment}
            disabled={loading || !inputText.trim()}
            className="analyze-btn"
          >
            {loading ? (
              <>
                <div className="spinner" />
                Analyzing...
              </>
            ) : (
              <>
                <span>🔍</span>
                Analyze Sentiment
              </>
            )}
          </button>

          <button onClick={clearAll} disabled={loading} className="clear-btn">
            🗑️ Clear
          </button>
        </div>
      </div>

      {error && (
        <div className="error-message">
          <span>⚠️</span>
          {error}
        </div>
      )}

      {sentimentData && <SentimentResult data={sentimentData} />}
    </div>
  );
}
