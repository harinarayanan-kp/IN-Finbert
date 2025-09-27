import { NewsItem } from "@/lib/types";
import NewsDashboard from "./components/NewsDashboard";
import ManualSentimentInput from "./components/ManualSentimentInput";

async function getNews(): Promise<NewsItem[] | null> {
  try {
    const res = await fetch(`${process.env.NEXT_PUBLIC_APP_URL}/api/news`, {
      next: { revalidate: 600 },
    });

    if (!res.ok) {
      console.error("Failed to fetch news from API route");
      return null;
    }

    const data = await res.json();
    return data.news;
  } catch (error) {
    console.error("Error in getNews function:", error);
    return null;
  }
}

export default async function HomePage() {
  const newsItems = await getNews();

  if (!newsItems) {
    return (
      <main className="error-container">
        <p className="error-text">Failed to load news.</p>
      </main>
    );
  }

  return (
    <main className="main-container">
      <div className="content-wrapper">
        <header className="header-section">
          <h1 className="main-title">Stock Market Sentiment Analysis</h1>
          <p className="subtitle">
            Analyze market sentiment from live news or custom text
          </p>
        </header>

        <ManualSentimentInput />

        <section>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "1rem",
              marginBottom: "2rem",
              paddingBottom: "1rem",
              borderBottom: "1px solid rgba(0, 0, 0, 0.08)",
            }}
          >
            <h2
              style={{
                fontSize: "1.5rem",
                fontWeight: "600",
                color: "#1a202c",
                margin: 0,
              }}
            >
              📰 Live Market News
            </h2>
            <div
              style={{
                fontSize: "0.85rem",
                color: "#64748b",
                background: "rgba(0, 0, 0, 0.04)",
                padding: "4px 12px",
                borderRadius: "4px",
                border: "1px solid rgba(0, 0, 0, 0.06)",
              }}
            >
              Economic Times
            </div>
          </div>
          <NewsDashboard newsItems={newsItems} />
        </section>
      </div>
    </main>
  );
}
