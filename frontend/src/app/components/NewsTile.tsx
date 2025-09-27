"use client";

import { NewsItem } from "@/lib/types";
import { useState, useEffect } from "react";

type SentimentData = {
  label: string;
  score: number;
  all_scores: {
    negative: number;
    neutral: number;
    positive: number;
  };
};

const getSentimentColor = (sentiment: string) => {
  switch (sentiment) {
    case "positive":
      return "#10b981";
    case "negative":
      return "#ef4444";
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

const CompactSentimentBar = ({ data }: { data: SentimentData }) => {
  const { label, score, all_scores } = data;
  const confidence = Math.round(score * 100);

  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        gap: "12px",
        padding: "12px 16px",
        background: `linear-gradient(90deg, ${getSentimentColor(
          label
        )}15, ${getSentimentColor(label)}05)`,
        border: `1px solid ${getSentimentColor(label)}30`,
        borderRadius: "8px",
        marginTop: "12px",
      }}
    >
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: "6px",
          minWidth: "100px",
        }}
      >
        <span style={{ fontSize: "18px" }}>{getSentimentEmoji(label)}</span>
        <span
          style={{
            fontSize: "14px",
            fontWeight: "600",
            color: getSentimentColor(label),
            textTransform: "capitalize",
          }}
        >
          {label} ({confidence}%)
        </span>
      </div>

      <div
        style={{
          flex: 1,
          display: "flex",
          height: "6px",
          borderRadius: "3px",
          overflow: "hidden",
          background: "#f1f5f9",
        }}
      >
        <div
          style={{
            width: `${Math.round(all_scores.positive * 100)}%`,
            background: getSentimentColor("positive"),
            transition: "width 0.6s ease-out",
          }}
        />
        <div
          style={{
            width: `${Math.round(all_scores.neutral * 100)}%`,
            background: getSentimentColor("neutral"),
            transition: "width 0.6s ease-out",
          }}
        />
        <div
          style={{
            width: `${Math.round(all_scores.negative * 100)}%`,
            background: getSentimentColor("negative"),
            transition: "width 0.6s ease-out",
          }}
        />
      </div>

      <div
        style={{
          display: "flex",
          gap: "8px",
          fontSize: "12px",
          fontWeight: "500",
        }}
      >
        <span style={{ color: getSentimentColor("positive") }}>
          +{Math.round(all_scores.positive * 100)}%
        </span>
        <span style={{ color: getSentimentColor("neutral") }}>
          ={Math.round(all_scores.neutral * 100)}%
        </span>
        <span style={{ color: getSentimentColor("negative") }}>
          -{Math.round(all_scores.negative * 100)}%
        </span>
      </div>
    </div>
  );
};

const SentimentVisualization = ({ data }: { data: SentimentData }) => {
  const { label, score, all_scores } = data;
  const confidence = Math.round(score * 100);

  return (
    <div
      style={{
        background: "rgba(255, 255, 255, 0.98)",
        borderRadius: "16px",
        padding: "20px",
        margin: "16px 0",
        boxShadow: "0 8px 32px rgba(0,0,0,0.1)",
        border: "1px solid #e2e8f0",
      }}
    >
      <div
        style={{
          textAlign: "center",
          marginBottom: "20px",
          padding: "16px",
          borderRadius: "12px",
          background: `linear-gradient(135deg, ${getSentimentColor(
            label
          )}15, ${getSentimentColor(label)}05)`,
          border: `2px solid ${getSentimentColor(label)}30`,
        }}
      >
        <div style={{ fontSize: "32px", marginBottom: "8px" }}>
          {getSentimentEmoji(label)}
        </div>
        <div
          style={{
            fontSize: "24px",
            fontWeight: "bold",
            color: getSentimentColor(label),
            textTransform: "capitalize",
            marginBottom: "4px",
          }}
        >
          {label}
        </div>
        <div
          style={{
            fontSize: "16px",
            color: "#64748b",
          }}
        >
          {confidence}% Confidence
        </div>
      </div>

      <div style={{ marginBottom: "16px" }}>
        <h4
          style={{
            margin: "0 0 12px 0",
            color: "#1a202c",
            fontSize: "16px",
            fontWeight: "600",
          }}
        >
          Sentiment Breakdown
        </h4>

        {Object.entries(all_scores).map(([sentiment, scoreValue]) => {
          const percentage = Math.round(scoreValue * 100);
          return (
            <div
              key={sentiment}
              style={{
                display: "flex",
                alignItems: "center",
                marginBottom: "8px",
                gap: "12px",
              }}
            >
              <span
                style={{
                  minWidth: "70px",
                  fontSize: "14px",
                  fontWeight: "500",
                  color: getSentimentColor(sentiment),
                  textTransform: "capitalize",
                }}
              >
                {getSentimentEmoji(sentiment)} {sentiment}
              </span>

              <div
                style={{
                  flex: 1,
                  height: "8px",
                  background: "#f1f5f9",
                  borderRadius: "4px",
                  overflow: "hidden",
                }}
              >
                <div
                  style={{
                    width: `${percentage}%`,
                    height: "100%",
                    background: getSentimentColor(sentiment),
                    borderRadius: "4px",
                    transition: "width 0.6s ease-out",
                  }}
                />
              </div>

              <span
                style={{
                  minWidth: "40px",
                  textAlign: "right",
                  fontSize: "14px",
                  fontWeight: "600",
                  color: "#374151",
                }}
              >
                {percentage}%
              </span>
            </div>
          );
        })}
      </div>

      <div
        style={{
          background: "#f8fafc",
          padding: "12px",
          borderRadius: "8px",
          border: "1px solid #e2e8f0",
        }}
      >
        <div
          style={{
            fontSize: "14px",
            fontWeight: "600",
            color: "#374151",
            marginBottom: "4px",
          }}
        >
          Market Interpretation:
        </div>
        <div
          style={{
            fontSize: "13px",
            color: "#64748b",
            lineHeight: "1.4",
          }}
        >
          {label === "positive" &&
            "Bullish sentiment detected. Market conditions appear favorable."}
          {label === "negative" &&
            "Bearish sentiment detected. Exercise caution in market positions."}
          {label === "neutral" &&
            "Neutral sentiment. Market shows balanced investor emotions."}
        </div>
      </div>
    </div>
  );
};

export default function NewsTile({ newsItem }: { newsItem: NewsItem }) {
  const [sentimentData, setSentimentData] = useState<SentimentData | null>(
    newsItem.sentiment || null
  );
  const [loading, setLoading] = useState(false);

  // Auto-analyze sentiment on component mount if not already available
  useEffect(() => {
    if (!sentimentData && !loading) {
      analyzeSentiment();
    }
  }, [newsItem]);

  const analyzeSentiment = async () => {
    setLoading(true);

    try {
      // Combine title and description for analysis
      const textToAnalyze = newsItem.description
        ? `${newsItem.title}. ${newsItem.description}`
        : newsItem.title;

      const response = await fetch("http://127.0.0.1:8000/analyze", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text: textToAnalyze }),
      });

      const data = await response.json();
      setSentimentData(data);
    } catch (error) {
      console.error("Error analyzing sentiment:", error);
    } finally {
      setLoading(false);
    }
  };

  // Get tile background color based on sentiment
  const getTileStyle = () => {
    if (!sentimentData) return {};

    const baseStyle = {};
    const sentimentColor = getSentimentColor(sentimentData.label);

    return {
      ...baseStyle,
      borderColor: sentimentColor,
      borderWidth: "2px",
      background: `linear-gradient(135deg, ${sentimentColor}08, ${sentimentColor}03)`,
    };
  };

  return (
    <div className="news-tile" style={getTileStyle()}>
      <a
        href={newsItem.url}
        target="_blank"
        rel="noopener noreferrer"
        style={{ textDecoration: "none", color: "inherit" }}
      >
        <h3 className="news-title">{newsItem.title}</h3>
        <p className="news-timestamp">{newsItem.timestamp}</p>

        {newsItem.description && (
          <p className="news-description">{newsItem.description}</p>
        )}
      </a>

      {loading ? (
        <div
          style={{
            padding: "12px",
            textAlign: "center",
            background: "#f8fafc",
            borderRadius: "8px",
            border: "1px solid #e2e8f0",
            marginTop: "12px",
          }}
        >
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: "8px",
              color: "#64748b",
            }}
          >
            <div
              style={{
                width: "6px",
                height: "6px",
                borderRadius: "50%",
                background: "#667eea",
                animation: "pulse 1.5s ease-in-out infinite",
              }}
            />
            <div
              style={{
                width: "6px",
                height: "6px",
                borderRadius: "50%",
                background: "#667eea",
                animation: "pulse 1.5s ease-in-out infinite 0.2s",
              }}
            />
            <div
              style={{
                width: "6px",
                height: "6px",
                borderRadius: "50%",
                background: "#667eea",
                animation: "pulse 1.5s ease-in-out infinite 0.4s",
              }}
            />
            <span style={{ marginLeft: "8px", fontSize: "14px" }}>
              Analyzing sentiment...
            </span>
          </div>
        </div>
      ) : sentimentData ? (
        <CompactSentimentBar data={sentimentData} />
      ) : null}
    </div>
  );
}
