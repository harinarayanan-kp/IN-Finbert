import ManualSentimentInput from "./components/ManualSentimentInput";
import NewsSourceSelector from "./components/NewsSourceSelector";

export default function HomePage() {
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

        <NewsSourceSelector />
      </div>
    </main>
  );
}
