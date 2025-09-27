"use client";

import React, { useState, useRef, useEffect } from "react";

type Message = {
  text: string;
  sender: "user" | "bot";
  timestamp?: Date;
  data?: any; // For storing parsed sentiment data
};

type SentimentData = {
  label: string;
  score: number;
  all_scores: {
    negative: number;
    neutral: number;
    positive: number;
  };
};

// Helper function to parse sentiment data
const parseSentimentData = (text: string): SentimentData | null => {
  try {
    const data = JSON.parse(text);
    if (data.label && data.score && data.all_scores) {
      return data as SentimentData;
    }
  } catch (e) {
    // Not JSON or not sentiment data
  }
  return null;
};

// Sentiment Visualization Component
const SentimentVisualization = ({ data }: { data: SentimentData }) => {
  const { label, score, all_scores } = data;
  const confidence = Math.round(score * 100);

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

  return (
    <div
      style={{
        background: "rgba(255, 255, 255, 0.98)",
        borderRadius: "16px",
        padding: "20px",
        maxWidth: "400px",
        boxShadow: "0 8px 32px rgba(0,0,0,0.1)",
        border: "1px solid #e2e8f0",
      }}
    >
      {/* Main Result */}
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

      {/* Score Breakdown */}
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

      {/* Market Interpretation */}
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

export default function Chat() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const sendMessage = async () => {
    if (!input.trim()) return;
    const userMessage: Message = {
      text: input,
      sender: "user",
      timestamp: new Date(),
    };
    setMessages((msgs) => [...msgs, userMessage]);
    setInput("");
    setLoading(true);

    try {
      const response = await fetch("http://127.0.0.1:8000/analyze", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text: input }),
      });
      const data = await response.json();

      // Check if response is sentiment data
      const sentimentData = parseSentimentData(JSON.stringify(data));

      setMessages((msgs) => [
        ...msgs,
        {
          text: sentimentData
            ? "Sentiment Analysis Complete"
            : typeof data === "string"
            ? data
            : JSON.stringify(data),
          sender: "bot",
          timestamp: new Date(),
          data: sentimentData || undefined,
        },
      ]);
    } catch (error) {
      setMessages((msgs) => [
        ...msgs,
        {
          text: "Error: Unable to get response from server.",
          sender: "bot",
          timestamp: new Date(),
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") sendMessage();
  };

  return (
    <div
      style={{
        maxWidth: 800,
        margin: "20px auto",
        border: "1px solid #e2e8f0",
        borderRadius: 16,
        display: "flex",
        flexDirection: "column",
        height: "calc(100vh - 40px)",
        background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
        boxShadow: "0 20px 40px rgba(0,0,0,0.1)",
        overflow: "hidden",
      }}
    >
      {/* Header */}
      <div
        style={{
          background: "rgba(255, 255, 255, 0.95)",
          backdropFilter: "blur(10px)",
          padding: "16px 24px",
          borderBottom: "1px solid #e2e8f0",
          textAlign: "center",
        }}
      >
        <h2
          style={{
            margin: 0,
            color: "#1a202c",
            fontSize: "18px",
            fontWeight: 600,
            background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
            backgroundClip: "text",
            WebkitBackgroundClip: "text",
            WebkitTextFillColor: "transparent",
          }}
        >
          Stock Market Sentiment Analysis
        </h2>
        <p
          style={{
            margin: "4px 0 0 0",
            color: "#64748b",
            fontSize: "14px",
          }}
        >
          Ask me about market sentiment and analysis
        </p>
      </div>

      {/* Messages Area */}
      <div
        style={{
          flex: 1,
          overflowY: "auto",
          padding: "20px",
          display: "flex",
          flexDirection: "column",
          gap: 16,
          background: "rgba(255, 255, 255, 0.1)",
        }}
      >
        {messages.length === 0 && (
          <div
            style={{
              textAlign: "center",
              color: "rgba(255, 255, 255, 0.7)",
              fontSize: "16px",
              marginTop: "40px",
            }}
          >
            <div style={{ fontSize: "48px", marginBottom: "16px" }}>💬</div>
            <p>Start a conversation about stock market sentiment!</p>
            <p style={{ fontSize: "14px", opacity: 0.8 }}>
              Try asking: "What's the sentiment for AAPL?" or "Analyze Tesla
              stock"
            </p>
          </div>
        )}

        {messages.map((msg, idx) => (
          <div
            key={idx}
            style={{
              alignSelf: msg.sender === "user" ? "flex-end" : "flex-start",
              maxWidth: msg.data ? "90%" : "75%", // Wider for sentiment data
              animation: "fadeInUp 0.3s ease-out",
            }}
          >
            {/* Show sentiment visualization if data exists, otherwise show regular message */}
            {msg.data ? (
              <SentimentVisualization data={msg.data} />
            ) : (
              <div
                style={{
                  background:
                    msg.sender === "user"
                      ? "linear-gradient(135deg, #667eea 0%, #764ba2 100%)"
                      : "rgba(255, 255, 255, 0.95)",
                  color: msg.sender === "user" ? "#fff" : "#1a202c",
                  padding: "12px 16px",
                  borderRadius:
                    msg.sender === "user"
                      ? "20px 20px 4px 20px"
                      : "20px 20px 20px 4px",
                  wordBreak: "break-word",
                  boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
                  backdropFilter: msg.sender === "bot" ? "blur(10px)" : "none",
                  fontSize: "15px",
                  lineHeight: "1.4",
                }}
              >
                {msg.text}
              </div>
            )}
            {msg.timestamp && (
              <div
                style={{
                  fontSize: "12px",
                  color: "rgba(255, 255, 255, 0.6)",
                  textAlign: msg.sender === "user" ? "right" : "left",
                  marginTop: "4px",
                  paddingLeft: msg.sender === "user" ? "0" : "16px",
                  paddingRight: msg.sender === "user" ? "16px" : "0",
                }}
              >
                {msg.timestamp.toLocaleTimeString([], {
                  hour: "2-digit",
                  minute: "2-digit",
                })}
              </div>
            )}
          </div>
        ))}

        {loading && (
          <div
            style={{
              alignSelf: "flex-start",
              maxWidth: "75%",
            }}
          >
            <div
              style={{
                background: "rgba(255, 255, 255, 0.95)",
                color: "#64748b",
                padding: "12px 16px",
                borderRadius: "20px 20px 20px 4px",
                boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
                backdropFilter: "blur(10px)",
                fontSize: "15px",
                display: "flex",
                alignItems: "center",
                gap: "8px",
              }}
            >
              <div
                style={{
                  width: "8px",
                  height: "8px",
                  borderRadius: "50%",
                  background: "#667eea",
                  animation: "pulse 1.5s ease-in-out infinite",
                }}
              />
              <div
                style={{
                  width: "8px",
                  height: "8px",
                  borderRadius: "50%",
                  background: "#667eea",
                  animation: "pulse 1.5s ease-in-out infinite 0.2s",
                }}
              />
              <div
                style={{
                  width: "8px",
                  height: "8px",
                  borderRadius: "50%",
                  background: "#667eea",
                  animation: "pulse 1.5s ease-in-out infinite 0.4s",
                }}
              />
              <span style={{ marginLeft: "8px" }}>Analyzing...</span>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Input Area */}
      <div
        style={{
          background: "rgba(255, 255, 255, 0.95)",
          backdropFilter: "blur(10px)",
          borderTop: "1px solid #e2e8f0",
          padding: "16px 20px",
        }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "flex-end",
            gap: "12px",
            background: "#f8fafc",
            borderRadius: "24px",
            padding: "8px",
            border: "1px solid #e2e8f0",
            boxShadow: "0 2px 8px rgba(0,0,0,0.05)",
          }}
        >
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Ask about stock sentiment..."
            style={{
              flex: 1,
              padding: "12px 16px",
              border: "none",
              borderRadius: "20px",
              outline: "none",
              background: "transparent",
              fontSize: "15px",
              color: "#1a202c",
              resize: "none",
            }}
            disabled={loading}
          />
          <button
            onClick={sendMessage}
            disabled={loading || !input.trim()}
            style={{
              minWidth: "48px",
              height: "48px",
              border: "none",
              borderRadius: "50%",
              background: input.trim()
                ? "linear-gradient(135deg, #667eea 0%, #764ba2 100%)"
                : "#cbd5e1",
              color: "#fff",
              fontWeight: 600,
              cursor: loading || !input.trim() ? "not-allowed" : "pointer",
              transition: "all 0.2s ease",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: "16px",
              boxShadow: input.trim()
                ? "0 4px 12px rgba(102, 126, 234, 0.4)"
                : "none",
            }}
          >
            {loading ? "⏳" : "🚀"}
          </button>
        </div>
      </div>

      {/* CSS Animations */}
      <style jsx>{`
        @keyframes fadeInUp {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        @keyframes pulse {
          0%,
          80%,
          100% {
            transform: scale(0.8);
            opacity: 0.5;
          }
          40% {
            transform: scale(1);
            opacity: 1;
          }
        }

        /* Custom scrollbar */
        div::-webkit-scrollbar {
          width: 6px;
        }

        div::-webkit-scrollbar-track {
          background: rgba(255, 255, 255, 0.1);
          border-radius: 3px;
        }

        div::-webkit-scrollbar-thumb {
          background: rgba(255, 255, 255, 0.3);
          border-radius: 3px;
        }

        div::-webkit-scrollbar-thumb:hover {
          background: rgba(255, 255, 255, 0.5);
        }

        /* Responsive design */
        @media (max-width: 768px) {
          .chat-container {
            margin: 0;
            height: 100vh;
            border-radius: 0;
            max-width: 100%;
          }
        }
      `}</style>
    </div>
  );
}
