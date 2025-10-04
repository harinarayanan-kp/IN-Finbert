"use client";

import { NewsItem } from "@/lib/types";

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

const CompanyTags = ({ companies }: { companies: any[] }) => {
  if (!companies || companies.length === 0) return null;

  // Show max 3 companies to avoid overcrowding
  const displayCompanies = companies.slice(0, 3);
  const hasMore = companies.length > 3;

  return (
    <div style={{ marginTop: "12px", marginBottom: "8px" }}>
      <div
        style={{
          display: "flex",
          flexWrap: "wrap",
          gap: "6px",
          alignItems: "center",
        }}
      >
        <span
          style={{
            fontSize: "0.75rem",
            color: "#64748b",
            fontWeight: "500",
            marginRight: "4px",
          }}
        >
          📊 Companies:
        </span>
        {displayCompanies.map((company, index) => (
          <div
            key={company.nseScripCode || index}
            style={{
              display: "flex",
              alignItems: "center",
              gap: "4px",
              padding: "4px 8px",
              background: "linear-gradient(135deg, #667eea15, #764ba205)",
              border: "1px solid #667eea30",
              borderRadius: "4px",
              fontSize: "0.75rem",
              fontWeight: "500",
            }}
          >
            {company.imageUrl && (
              <img
                src={company.imageUrl}
                alt={company.companyShortName}
                style={{ width: "16px", height: "16px", borderRadius: "2px" }}
                onError={(e) => {
                  (e.target as HTMLImageElement).style.display = "none";
                }}
              />
            )}
            <span style={{ color: "#374151" }}>
              {company.companyShortName || company.companyName}
            </span>
            {company.livePriceDto && (
              <span
                style={{
                  color:
                    company.livePriceDto.dayChange >= 0 ? "#10b981" : "#ef4444",
                  fontSize: "0.7rem",
                  fontWeight: "600",
                }}
              >
                {company.livePriceDto.dayChange >= 0 ? "↗" : "↘"}
                {company.livePriceDto.dayChangePerc?.toFixed(1)}%
              </span>
            )}
          </div>
        ))}
        {hasMore && (
          <span
            style={{
              fontSize: "0.7rem",
              color: "#9ca3af",
              fontStyle: "italic",
            }}
          >
            +{companies.length - 3} more
          </span>
        )}
      </div>
    </div>
  );
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
  const sentimentData = newsItem.sentiment || null;

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

        {/* Show company tags for Groww news */}
        {newsItem.companies && <CompanyTags companies={newsItem.companies} />}

        {newsItem.description && (
          <p className="news-description">{newsItem.description}</p>
        )}
      </a>

      {sentimentData ? (
        <CompactSentimentBar data={sentimentData} />
      ) : (
        <div
          style={{
            padding: "12px",
            textAlign: "center",
            background: "#f8fafc",
            borderRadius: "8px",
            border: "1px solid #e2e8f0",
            marginTop: "12px",
            color: "#64748b",
            fontSize: "14px",
          }}
        >
          ⏳ Sentiment analysis pending...
        </div>
      )}
    </div>
  );
}
