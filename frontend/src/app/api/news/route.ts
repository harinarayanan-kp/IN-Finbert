import { NextResponse } from "next/server";
import { NewsItem } from "@/lib/types";

// This function handles GET requests to /api/news
export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const page = searchParams.get("page") || "1";

  const url = `https://economictimes.indiatimes.com/lazyloadlistnew.cms?msid=2146843&curpg=${page}&img=0`;
  const headers = {
    Cookie: "geoinfo=CC:IN, RC:KL, CT:KOCHI, CO:AS, GL:1",
    "User-Agent":
      "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36",
  };

  try {
    console.log(`Fetching Economic Times news from: ${url}`);

    // Fetch the HTML content from the URL
    const response = await fetch(url, { headers });

    if (!response.ok) {
      console.error(`Economic Times API response status: ${response.status}`);
      return NextResponse.json(
        { error: "Failed to fetch news" },
        { status: response.status }
      );
    }

    const html = await response.text();
    console.log(`Economic Times HTML received, length: ${html.length}`);

    const newsItems: NewsItem[] = [];
    const baseUrl = "https://economictimes.indiatimes.com";

    // Parse HTML using simple string matching (cheerio-free approach)
    // Look for href patterns in the HTML
    const linkPattern = /href="([^"]*)"[^>]*>([^<]+)</g;
    const titlePattern =
      /<h3[^>]*>[\s\S]*?<a[^>]*href="([^"]*)"[^>]*>([^<]+)<\/a>/g;

    let match;
    while ((match = titlePattern.exec(html)) !== null) {
      const relativeUrl = match[1];
      const title = match[2].trim();

      // Skip if it doesn't look like a news article
      if (!title || title.length < 10 || !relativeUrl.includes("/")) {
        continue;
      }

      newsItems.push({
        url: relativeUrl.startsWith("http")
          ? relativeUrl
          : baseUrl + relativeUrl,
        title: title,
        timestamp: new Date().toISOString(), // Use current timestamp for simplicity
        description: `Economic Times news article: ${title.substring(
          0,
          100
        )}...`,
      });

      // Limit to prevent too many results
      if (newsItems.length >= 20) {
        break;
      }
    }

    console.log(`Economic Times: Parsed ${newsItems.length} news items`);

    if (newsItems.length === 0) {
      console.warn("No news items found, HTML structure might have changed");
      // Return fallback data if parsing fails
      const fallbackNewsItems: NewsItem[] = [
        {
          url: "https://economictimes.indiatimes.com/markets/stocks/news/sample-news-1",
          title: "Economic Times News - Parsing Issue",
          timestamp: new Date().toISOString(),
          description:
            "Economic Times data could not be parsed. The website structure may have changed.",
        },
      ];
      return NextResponse.json({ news: fallbackNewsItems });
    }

    return NextResponse.json({ news: newsItems });
  } catch (error) {
    console.error("Error fetching or parsing Economic Times news:", error);

    // Return fallback data on error
    const fallbackNewsItems: NewsItem[] = [
      {
        url: "https://economictimes.indiatimes.com/markets/stocks/news/error-fallback",
        title: "Economic Times - Service Temporarily Unavailable",
        timestamp: new Date().toISOString(),
        description:
          "Unable to fetch Economic Times news at the moment. Please try again later.",
      },
    ];

    return NextResponse.json({ news: fallbackNewsItems });
  }
}
