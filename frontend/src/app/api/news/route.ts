import { NextResponse } from "next/server";
import * as cheerio from "cheerio";
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
    // Fetch the HTML content from the URL
    const response = await fetch(url, { headers });

    if (!response.ok) {
      return NextResponse.json(
        { error: "Failed to fetch news" },
        { status: response.status }
      );
    }

    const html = await response.text();
    const $ = cheerio.load(html);
    const newsItems: NewsItem[] = [];
    const baseUrl = "https://economictimes.indiatimes.com";

    // Parse the HTML to extract news data
    $(".eachStory").each((_i, el) => {
      const titleElement = $(el).find("h3 a");

      const relativeUrl = titleElement.attr("href");
      const title = titleElement.text();
      const timestamp = $(el).find("time").text();
      // Find the main paragraph, ignoring the one inside video summaries
      const description = $(el).find("p").not(".videoSumm").text().trim();

      if (relativeUrl && title) {
        newsItems.push({
          url: relativeUrl.startsWith("http")
            ? relativeUrl
            : baseUrl + relativeUrl,
          title,
          timestamp,
          description,
        });
      }
    });

    return NextResponse.json({ news: newsItems });
  } catch (error) {
    console.error("Error fetching or parsing news:", error);
    return NextResponse.json(
      { error: "An internal server error occurred" },
      { status: 500 }
    );
  }
}
