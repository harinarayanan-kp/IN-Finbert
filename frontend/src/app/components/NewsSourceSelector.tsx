"use client";
import { useState, useEffect } from "react";
import { NewsItem, GrowwNewsItem } from "@/lib/types";
import NewsDashboard from "./NewsDashboard";

export default function NewsSourceSelector() {
  const [selectedSource, setSelectedSource] = useState<
    "economic-times" | "groww"
  >("groww");
  const [newsItems, setNewsItems] = useState<NewsItem[]>([]);
  const [allNewsItems, setAllNewsItems] = useState<NewsItem[]>([]); // Store all items for filtering
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [sentimentFilter, setSentimentFilter] = useState<string>("all");
  const [analyzingCount, setAnalyzingCount] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);

  // Function to analyze sentiment for a single news item
  const analyzeSentiment = async (newsItem: NewsItem): Promise<NewsItem> => {
    try {
      const textToAnalyze = newsItem.description
        ? `${newsItem.title}. ${newsItem.description}`
        : newsItem.title;

      const response = await fetch("http://127.0.0.1:8000/analyze", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text: textToAnalyze }),
      });

      if (response.ok) {
        const sentimentData = await response.json();
        return { ...newsItem, sentiment: sentimentData };
      }
    } catch (error) {
      console.error(
        "Error analyzing sentiment for item:",
        newsItem.title,
        error
      );
    }
    return newsItem;
  };

  // Function to analyze sentiment for new items and update the main state
  const analyzeBatchSentiment = async (itemsToAnalyze: NewsItem[]) => {
    if (itemsToAnalyze.length === 0) return;

    setAnalyzingCount(itemsToAnalyze.length);

    // Process items in batches to avoid overwhelming the API
    const batchSize = 3;
    for (let i = 0; i < itemsToAnalyze.length; i += batchSize) {
      const batch = itemsToAnalyze.slice(i, i + batchSize);
      const batchPromises = batch.map((item) => analyzeSentiment(item));
      const batchResults = await Promise.all(batchPromises);

      // Update allNewsItems by replacing items that were analyzed
      setAllNewsItems((currentAllItems) => {
        const updatedItems = currentAllItems.map((existingItem) => {
          const analyzedItem = batchResults.find(
            (result) => result.url === existingItem.url
          );
          return analyzedItem || existingItem;
        });
        return updatedItems;
      });

      setAnalyzingCount(itemsToAnalyze.length - (i + batch.length));

      // Small delay between batches to be nice to the API
      if (i + batchSize < itemsToAnalyze.length) {
        await new Promise((resolve) => setTimeout(resolve, 100));
      }
    }

    setAnalyzingCount(0);
  };

  const fetchNews = async (source: "economic-times" | "groww") => {
    setLoading(true);
    setError(null);

    try {
      const apiEndpoint = source === "groww" ? "/api/groww" : "/api/news";
      console.log(`Fetching from ${source} using endpoint: ${apiEndpoint}`);

      const response = await fetch(apiEndpoint);

      if (!response.ok) {
        throw new Error(
          `Failed to fetch news from ${source}: ${response.status}`
        );
      }

      const data = await response.json();
      console.log(`${source} API Response:`, data);

      if (data.news && data.news.length > 0) {
        console.log(
          `Successfully loaded ${data.news.length} items from ${source}`
        );

        // Set initial news items without sentiment
        setAllNewsItems(data.news);
        setNewsItems(data.news);
        setSentimentFilter("all"); // Reset filter when switching sources
        setCurrentPage(selectedSource === "groww" ? 0 : 1);
        setHasMore(true);

        // Start sentiment analysis in the background for items without sentiment
        const itemsToAnalyze = data.news.filter(
          (item: NewsItem) => !item.sentiment
        );
        if (itemsToAnalyze.length > 0) {
          analyzeBatchSentiment(itemsToAnalyze);
        }
      } else {
        console.log(`No news items found in ${source} response`);
        setAllNewsItems([]);
        setNewsItems([]);
      }
    } catch (err) {
      console.error(`Error fetching ${source} news:`, err);
      setError(err instanceof Error ? err.message : "Failed to fetch news");
      setNewsItems([]);
    } finally {
      setLoading(false);
    }
  };

  const loadMoreNews = async () => {
    if (loadingMore || !hasMore) return;

    setLoadingMore(true);
    const nextPage = currentPage + 1;

    try {
      const apiEndpoint =
        selectedSource === "groww" ? "/api/groww" : "/api/news";
      console.log(
        `Loading more news from ${selectedSource} using ${apiEndpoint}?page=${nextPage}`
      );
      const response = await fetch(`${apiEndpoint}?page=${nextPage}`);
      const data = await response.json();

      if (response.ok && data.news && data.news.length > 0) {
        // Filter out duplicates based on URL
        const newItems = data.news.filter(
          (newItem: NewsItem) =>
            !allNewsItems.some(
              (existingItem) => existingItem.url === newItem.url
            )
        );

        if (newItems.length > 0) {
          // Add new items to allNewsItems
          const updatedAllItems = [...allNewsItems, ...newItems];
          setAllNewsItems(updatedAllItems);

          // Update filtered items based on current sentiment filter
          if (sentimentFilter === "all") {
            setNewsItems(updatedAllItems);
          } else {
            const filtered = updatedAllItems.filter(
              (item) =>
                item.sentiment?.label?.toLowerCase() ===
                sentimentFilter.toLowerCase()
            );
            setNewsItems(filtered);
          }

          setCurrentPage(nextPage);

          // Analyze sentiment for the new items only (without awaiting)
          const itemsToAnalyze = newItems.filter(
            (item: NewsItem) => !item.sentiment
          );
          if (itemsToAnalyze.length > 0) {
            analyzeBatchSentiment(itemsToAnalyze);
          }
        } else {
          setHasMore(false);
        }
      } else {
        setHasMore(false);
      }
    } catch (error) {
      console.error("Error loading more news:", error);
    } finally {
      setLoadingMore(false);
    }
  };

  useEffect(() => {
    fetchNews(selectedSource);
  }, [selectedSource]);

  // Filter news items based on sentiment
  useEffect(() => {
    if (sentimentFilter === "all") {
      setNewsItems(allNewsItems);
    } else {
      const filtered = allNewsItems.filter(
        (item) =>
          item.sentiment?.label?.toLowerCase() === sentimentFilter.toLowerCase()
      );
      setNewsItems(filtered);
    }
  }, [sentimentFilter, allNewsItems]);

  // Get sentiment counts for filter badges
  const getSentimentCounts = () => {
    const counts = {
      positive: 0,
      negative: 0,
      neutral: 0,
      total: allNewsItems.length,
    };

    allNewsItems.forEach((item) => {
      const sentiment = item.sentiment?.label?.toLowerCase();
      if (sentiment === "positive") counts.positive++;
      else if (sentiment === "negative") counts.negative++;
      else if (sentiment === "neutral") counts.neutral++;
    });

    return counts;
  };

  const sentimentCounts = getSentimentCounts();

  return (
    <>
      {/* News Source Selector */}
      <div className="news-source-selector">
        <h2 className="source-selector-title">📰 Choose News Source</h2>
        <div className="source-buttons">
          <button
            className={`source-btn ${
              selectedSource === "groww" ? "active" : ""
            }`}
            onClick={() => setSelectedSource("groww")}
          >
            <span className="source-icon">📈</span>
            <div className="source-info">
              <span className="source-name">Groww</span>
              <span className="source-desc">
                Stock Market News with Live Prices
              </span>
            </div>
          </button>
          <button
            className={`source-btn ${
              selectedSource === "economic-times" ? "active" : ""
            }`}
            onClick={() => setSelectedSource("economic-times")}
          >
            <span className="source-icon">📰</span>
            <div className="source-info">
              <span className="source-name">Economic Times</span>
              <span className="source-desc">Latest Financial News</span>
            </div>
          </button>
        </div>
      </div>

      {/* News Content */}
      <section>
        <div className="news-header">
          <h2 className="news-section-title">📰 Live Market News</h2>

          {/* Sentiment Filter Tags */}
          <div className="sentiment-filters">
            <button
              className={`filter-tag ${
                sentimentFilter === "all" ? "active" : ""
              }`}
              onClick={() => setSentimentFilter("all")}
            >
              🔍 All
              <span className="filter-count">({sentimentCounts.total})</span>
            </button>
            <button
              className={`filter-tag positive ${
                sentimentFilter === "positive" ? "active" : ""
              }`}
              onClick={() => setSentimentFilter("positive")}
            >
              📈 Positive
              <span className="filter-count">({sentimentCounts.positive})</span>
            </button>
            <button
              className={`filter-tag negative ${
                sentimentFilter === "negative" ? "active" : ""
              }`}
              onClick={() => setSentimentFilter("negative")}
            >
              📉 Negative
              <span className="filter-count">({sentimentCounts.negative})</span>
            </button>
            <button
              className={`filter-tag neutral ${
                sentimentFilter === "neutral" ? "active" : ""
              }`}
              onClick={() => setSentimentFilter("neutral")}
            >
              ⚖️ Neutral
              <span className="filter-count">({sentimentCounts.neutral})</span>
            </button>
          </div>

          <div className="news-source-badge">
            {selectedSource === "groww" ? "Groww" : "Economic Times"}
            {newsItems.length > 0 && (
              <span
                style={{ marginLeft: "8px", fontSize: "0.7em", opacity: 0.7 }}
              >
                ({newsItems.length} items)
              </span>
            )}
          </div>
          {loading && (
            <div className="loading-indicator">
              <div className="spinner"></div>
              Loading from {selectedSource}...
            </div>
          )}
          {analyzingCount > 0 && (
            <div className="loading-indicator">
              <div className="spinner"></div>
              Analyzing sentiment... ({analyzingCount} remaining)
            </div>
          )}
        </div>

        {error ? (
          <div className="error-message">
            <span>⚠️ {error}</span>
            <button
              onClick={() => fetchNews(selectedSource)}
              className="retry-btn"
            >
              Retry
            </button>
          </div>
        ) : (
          <NewsDashboard
            newsItems={newsItems}
            loading={loading}
            newsSource={selectedSource}
            hasMore={hasMore}
            loadingMore={loadingMore}
            onLoadMore={loadMoreNews}
          />
        )}
      </section>
    </>
  );
}
