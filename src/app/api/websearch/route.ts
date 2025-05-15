import { NextResponse } from 'next/server';

// ===== Rate Limiting & Quota Config =====
const RATE_LIMIT_WINDOW_MS = 60 * 1000; // 1 menit
const RATE_LIMIT_MAX = 10; // Maks 10 request per IP per menit
const USER_QUOTA_DAILY = 100; // Maks 100 request per user per hari

// Penyimpanan sementara (in-memory, reset saat server restart)
const ipRateLimitMap = new Map(); // { ip: { count, windowStart } }
const userQuotaMap = new Map(); // { userId: { count, lastReset } }

function getClientIp(req: Request) {
  // Next.js edge API: X-Forwarded-For atau fallback ke undefined
  const xff = req.headers.get('x-forwarded-for');
  if (xff) return xff.split(',')[0].trim();
  return undefined;
}

function getUserId(req: Request) {
  // Ambil dari header X-User-Id jika ada, fallback ke IP
  const userId = req.headers.get('x-user-id');
  if (userId) return userId;
  return getClientIp(req) || 'anonymous';
}

export async function POST(req: Request) {
  // ===== Rate Limiting per IP =====
  const ip = getClientIp(req) || 'unknown';
  const now = Date.now();
  let ipData = ipRateLimitMap.get(ip);
  if (!ipData || now - ipData.windowStart > RATE_LIMIT_WINDOW_MS) {
    ipData = { count: 1, windowStart: now };
  } else {
    ipData.count++;
  }
  ipRateLimitMap.set(ip, ipData);
  if (ipData.count > RATE_LIMIT_MAX) {
    return NextResponse.json({ error: 'Rate limit exceeded. Please wait a minute.' }, { status: 429 });
  }

  // ===== Quota per User per Hari =====
  const userId = getUserId(req);
  let userData = userQuotaMap.get(userId);
  const today = new Date().toISOString().slice(0, 10); // YYYY-MM-DD
  if (!userData || userData.lastReset !== today) {
    userData = { count: 1, lastReset: today };
  } else {
    userData.count++;
  }
  userQuotaMap.set(userId, userData);
  if (userData.count > USER_QUOTA_DAILY) {
    return NextResponse.json({ error: 'Daily quota exceeded. Please try again tomorrow.' }, { status: 429 });
  }

  try {
    const { query, num = 10 } = await req.json();
    if (!query) {
      return NextResponse.json({ error: 'Search query is required' }, { status: 400 });
    }

    console.log(`Performing search with query: ${query}`);
    
    // Replace with actual web search API (e.g., SerpAPI) endpoint and key
    const apiKey = process.env.SERPAPI_KEY || 'your-serpapi-key-here';
    
    // Build the search URL with additional parameters
    const searchUrl = new URL('https://serpapi.com/search.json');
    searchUrl.searchParams.append('q', query);
    searchUrl.searchParams.append('api_key', apiKey);
    searchUrl.searchParams.append('num', num.toString()); // Number of results to return
    searchUrl.searchParams.append('gl', 'us');  // Google country
    
    // If the query looks like a dork (contains special operators), add safe search off
    if (query.includes('site:') || query.includes('inurl:') || query.includes('intitle:') || 
        query.includes('intext:') || query.includes('filetype:') || query.includes('ext:')) {
      console.log('Dork query detected, adjusting parameters');
      searchUrl.searchParams.append('safe', 'off');
    }
    
    console.log(`Sending request to SerpAPI: ${searchUrl.toString().replace(apiKey, '[REDACTED]')}`);
    
    const response = await fetch(searchUrl);

    if (!response.ok) {
      const errorText = await response.text();
      console.error(`Web search API error: ${response.status}`, errorText);
      throw new Error(`Web search API error: ${response.status}`);
    }

    const data = await response.json();
    console.log('SerpAPI response received');
    
    if (data.error) {
      console.error('SerpAPI returned an error:', data.error);
      throw new Error(`SerpAPI error: ${data.error}`);
    }
    
    // Process organic search results
    const organicResults = data.organic_results 
      ? data.organic_results.slice(0, Math.min(num, data.organic_results.length)).map((result: any) => ({
          title: result.title,
          link: result.link,
          snippet: result.snippet || result.description || '',
          position: result.position,
          displayed_link: result.displayed_link,
        })) 
      : [];
      
    // Also collect any related results that might be relevant for dorking
    const relatedResults = [];
    
    // Include "People also ask" if available
    if (data.related_questions && data.related_questions.length > 0) {
      relatedResults.push({
        section: 'Related Questions',
        items: data.related_questions.slice(0, 3).map((q: any) => ({
          question: q.question,
          answer: q.answer?.replace(/<\/?[^>]+(>|$)/g, "") || 'No answer available'
        }))
      });
    }
    
    // Include "Knowledge Graph" if available (useful for entity information)
    if (data.knowledge_graph) {
      const kg = data.knowledge_graph;
      relatedResults.push({
        section: 'Entity Information',
        title: kg.title,
        subtitle: kg.subtitle || kg.type,
        description: kg.description,
        website: kg.website,
      });
    }

    // Add new search handlers for SerpApi features
    if (query.includes('serpapi_videos')) {
      const videoQuery = query.replace('serpapi_videos ', '');
      const results = await fetchSerpApiVideos(videoQuery);
      return NextResponse.json({ results });
    } else if (query.includes('serpapi_yandex_reverse')) {
      const imageUrl = query.replace('serpapi_yandex_reverse ', '');
      const results = await fetchSerpApiYandexReverse(imageUrl);
      return NextResponse.json({ results });
    } else if (query.includes('serpapi_yandex_images')) {
      const imageQuery = query.replace('serpapi_yandex_images ', '');
      const results = await fetchSerpApiYandexImages(imageQuery);
      return NextResponse.json({ results });
    }

    return NextResponse.json({ 
      results: organicResults,
      related: relatedResults.length > 0 ? relatedResults : undefined,
      search_metadata: data.search_metadata ? {
        id: data.search_metadata.id,
        status: data.search_metadata.status,
        total_time_taken: data.search_metadata.total_time_taken,
      } : undefined
    });
  } catch (error: any) {
    console.error('Error in web search API:', error);
    return NextResponse.json({ 
      error: 'Failed to perform web search',
      details: error.message
    }, { status: 500 });
  }
}

// Define helper functions
async function fetchSerpApiVideos(query: string) {
  const apiKey = process.env.SERPAPI_KEY;
  if (!apiKey) {
    console.error('SERPAPI_KEY environment variable is not set.');
    throw new Error('SERPAPI_KEY is missing. Please ensure it is properly set in your environment variables.');
  }
  if (!apiKey.match(/^[a-zA-Z0-9]{32,}$/)) {
    console.error('Invalid SERPAPI_KEY format');
    throw new Error('Invalid API key format. Please check your SERPAPI_KEY.');
  }
  const url = `https://serpapi.com/search.json?engine=google&api_key=${apiKey}&q=${encodeURIComponent(query)}&tbm=vid`;
  const response = await fetch(url);
  if (!response.ok) {
    const errorText = await response.text();
    console.error('Video search failed:', errorText);
    throw new Error(`Video search failed: ${response.status} ${errorText}`);
  }
  return await response.json();
}

async function fetchSerpApiYandexReverse(imageUrl: string) {
  const apiKey = process.env.SERPAPI_KEY;
  if (!apiKey) {
    console.error('SERPAPI_KEY environment variable is not set.');
    throw new Error('SERPAPI_KEY is missing. Please ensure it is properly set in your environment variables.');
  }
  if (!apiKey.match(/^[a-zA-Z0-9]{32,}$/)) {
    console.error('Invalid SERPAPI_KEY format');
    throw new Error('Invalid API key format. Please check your SERPAPI_KEY.');
  }
  if (!imageUrl || typeof imageUrl !== 'string' || imageUrl.trim().length === 0) {
    throw new Error('Image URL must be a non-empty string');
  }
  const url = `https://serpapi.com/search.json?engine=yandex_images&api_key=${apiKey}&source=reverse_image&url=${encodeURIComponent(imageUrl.trim())}&yandex_domain=yandex.ru`;
  const response = await fetch(url);
  if (!response.ok) {
    const errorText = await response.text();
    console.error('Reverse image search failed:', errorText);
    throw new Error(`Reverse image search failed: ${response.status} ${errorText}`);
  }
  const data = await response.json();
  return {
    search_metadata: data.search_metadata,
    search_parameters: data.search_parameters,
    images_results: data.images_results || [],
    inline_images: data.inline_images || [],
    similar_images: data.similar_images || [],
    vision_text: data.vision_text || null,
    suggested_searches: data.suggested_searches || []
  };
}

async function fetchSerpApiYandexImages(query: string) {
  const apiKey = process.env.SERPAPI_KEY;
  if (!apiKey) {
    console.error('SERPAPI_KEY environment variable is not set.');
    throw new Error('SERPAPI_KEY is missing. Please ensure it is properly set in your environment variables.');
  }
  if (!apiKey.match(/^[a-zA-Z0-9]{32,}$/)) {
    console.error('Invalid SERPAPI_KEY format');
    throw new Error('Invalid API key format. Please check your SERPAPI_KEY.');
  }
  if (!query || typeof query !== 'string' || query.trim().length === 0) {
    throw new Error('Search query must be a non-empty string');
  }
  const url = `https://serpapi.com/search.json?engine=yandex_images&api_key=${apiKey}&q=${encodeURIComponent(query.trim())}&yandex_domain=yandex.ru`;
  const response = await fetch(url);
  if (!response.ok) {
    const errorText = await response.text();
    console.error('Image search failed:', errorText);
    throw new Error(`Image search failed: ${response.status} ${errorText}`);
  }
  const data = await response.json();
  return {
    search_metadata: data.search_metadata,
    search_parameters: data.search_parameters,
    images_results: data.images_results || [],
    inline_images: data.inline_images || [],
    similar_images: data.similar_images || [],
    suggested_searches: data.suggested_searches || []
  };
} 