"use client";

import { NewsItem } from "@/lib/types";
import NewsTile from "./NewsTile";

export default function NewsDashboard({
  newsItems,
  loading = false,
  newsSource = "economic-times",
  hasMore = true,
  loadingMore = false,
  onLoadMore,
}: {
  newsItems: NewsItem[];
  loading?: boolean;
  newsSource?: "economic-times" | "groww";
  hasMore?: boolean;
  loadingMore?: boolean;
  onLoadMore?: () => void;
}) {
  // No internal state needed - everything is managed by parent component

  return (
    <div>
      <div className="news-list">
        {newsItems.map((item) => (
          <NewsTile key={item.url} newsItem={item} />
        ))}
      </div>

      {hasMore && (
        <div
          style={{
            display: "flex",
            justifyContent: "center",
            marginTop: "2rem",
            padding: "1rem",
          }}
        >
          <button
            onClick={onLoadMore}
            disabled={loadingMore}
            style={{
              padding: "14px 40px",
              background: loadingMore
                ? "linear-gradient(145deg, #9ca3af, #6b7280)"
                : "linear-gradient(145deg, #1a202c, #2d3748)",
              color: "white",
              border: "1px solid rgba(255, 255, 255, 0.1)",
              borderRadius: "6px",
              fontSize: "15px",
              fontWeight: "500",
              cursor: loadingMore ? "not-allowed" : "pointer",
              transition: "all 0.4s cubic-bezier(0.4, 0, 0.2, 1)",
              boxShadow:
                "0 2px 8px rgba(0, 0, 0, 0.15), 0 1px 3px rgba(0, 0, 0, 0.1)",
              minWidth: "160px",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: "10px",
              letterSpacing: "0.02em",
              textTransform: "uppercase",
              position: "relative",
              overflow: "hidden",
            }}
            onMouseOver={(e) => {
              if (!loadingMore) {
                e.currentTarget.style.background =
                  "linear-gradient(145deg, #2d3748, #4a5568)";
                e.currentTarget.style.transform = "translateY(-1px)";
                e.currentTarget.style.boxShadow =
                  "0 4px 16px rgba(0, 0, 0, 0.2), 0 2px 6px rgba(0, 0, 0, 0.15)";
              }
            }}
            onMouseOut={(e) => {
              if (!loadingMore) {
                e.currentTarget.style.background =
                  "linear-gradient(145deg, #1a202c, #2d3748)";
                e.currentTarget.style.transform = "translateY(0)";
                e.currentTarget.style.boxShadow =
                  "0 2px 8px rgba(0, 0, 0, 0.15), 0 1px 3px rgba(0, 0, 0, 0.1)";
              }
            }}
          >
            {loadingMore ? (
              <>
                <div
                  style={{
                    width: "16px",
                    height: "16px",
                    border: "2px solid rgba(255,255,255,0.3)",
                    borderTop: "2px solid white",
                    borderRadius: "50%",
                    animation: "spin 1s linear infinite",
                  }}
                />
                Loading...
              </>
            ) : (
              <>
                Load More News
                <span style={{ fontSize: "18px" }}>📰</span>
              </>
            )}
          </button>
        </div>
      )}

      {!hasMore && newsItems.length > 0 && (
        <div
          style={{
            textAlign: "center",
            padding: "2rem",
            color: "#64748b",
            fontSize: "16px",
          }}
        >
          <p>🎉 You've reached the end of the news feed!</p>
        </div>
      )}
    </div>
  );
}
