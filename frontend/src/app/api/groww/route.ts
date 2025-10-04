import { NextResponse } from "next/server";

export interface GrowwNewsItem {
  id: string;
  title: string;
  summary: string;
  url: string;
  imageUrl: string;
  contifyImageUrl: string;
  pubDate: string;
  source: string;
  companies: Array<{
    isin: string;
    companyName: string;
    companyShortName: string;
    nseScripCode: string;
    bseScripCode: string;
    bseScriptGroup: string | null;
    imageUrl: string;
    blogUrl: string;
    searchId: string;
    livePriceDto: {
      type: string;
      symbol: string;
      tsInMillis: number;
      open: number;
      high: number;
      low: number;
      close: number;
      ltp: number;
      dayChange: number;
      dayChangePerc: number;
      lowPriceRange: number;
      highPriceRange: number;
      volume: number;
      totalBuyQty: number;
      totalSellQty: number;
      oiDayChange: number;
      oiDayChangePerc: number;
      lastTradeQty: number;
      lastTradeTime: number;
    };
    liveIndicesDto: any;
  }>;
  topics: string[];
  hidden: boolean;
}

export interface GrowwNewsResponse {
  results: GrowwNewsItem[];
}

// This function handles GET requests to /api/groww
export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const page = searchParams.get("page") || "0";
  const size = searchParams.get("size") || "50";

  const url = `https://groww.in/v1/api/groww_news/v1/stocks_news/news?page=${page}&size=${size}`;

  const headers = {
    "User-Agent":
      "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36",
    Accept: "application/json, text/plain, */*",
    "Accept-Language": "en-US,en;q=0.9",
    Referer: "https://groww.in/",
    Origin: "https://groww.in",
  };

  try {
    console.log(`Fetching Groww news from: ${url}`);

    // Fetch the JSON data from Groww API
    const response = await fetch(url, {
      headers,
      method: "GET",
      cache: "no-store", // Prevent caching issues
    });

    console.log(`Groww API response status: ${response.status}`);

    if (!response.ok) {
      const errorText = await response.text();
      console.error(`Groww API error: ${response.status} - ${errorText}`);
      return NextResponse.json(
        {
          error: `Failed to fetch news from Groww: ${response.status} - ${errorText}`,
        },
        { status: response.status }
      );
    }

    const data: GrowwNewsResponse = await response.json();
    console.log(`Groww API returned ${data.results?.length || 0} items`);

    // Check if we have valid data
    if (!data.results || !Array.isArray(data.results)) {
      console.error("Groww API returned invalid data structure:", data);
      return NextResponse.json(
        { error: "Invalid response format from Groww API" },
        { status: 500 }
      );
    }

    // Transform the data to match our NewsItem interface if needed
    const transformedNews = data.results.map((item) => ({
      id: item.id,
      title: item.title,
      summary: item.summary,
      url: item.url,
      imageUrl: item.imageUrl,
      contifyImageUrl: item.contifyImageUrl,
      timestamp: item.pubDate,
      source: `Groww - ${item.source}`, // Add prefix to distinguish from ET
      companies: item.companies,
      topics: item.topics,
      hidden: item.hidden,
      // Additional fields for compatibility with existing NewsItem interface
      description: item.summary, // Use summary as description
    }));

    console.log(
      `Successfully transformed ${transformedNews.length} Groww news items`
    );

    return NextResponse.json({
      news: transformedNews,
      total: data.results.length,
      page: parseInt(page),
      size: parseInt(size),
      source: "groww", // Add source identifier
    });
  } catch (error) {
    console.error("Error fetching Groww news:", error);
    return NextResponse.json(
      {
        error: "Failed to fetch news from Groww API",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}
