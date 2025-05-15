import { NextResponse } from 'next/server';
import { getJson } from 'serpapi';

// Define interface for Yandex search results
interface YandexSearchResults {
  search_metadata?: any;
  search_parameters?: any;
  images_results?: any[];
  inline_images?: any[];
  image_sizes_message?: string;
  vision_text?: any;
  similar_images?: any[];
  suggested_searches?: any[];
  error?: string;
}

export async function POST(req: Request) {
  try {
    const { image_url, text } = await req.json();
    
    if (!image_url) {
      return NextResponse.json({ error: 'Image URL is required' }, { status: 400 });
    }

    console.log(`Processing reverse image search for: ${image_url}${text ? ` with text: ${text}` : ''}`);

    // Check for API key presence
    const apiKey = process.env.SERPAPI_KEY;
    if (!apiKey) {
      console.error('SERPAPI_KEY environment variable is not set.');
      return NextResponse.json({ error: 'Server configuration error: SERPAPI_KEY is missing' }, { status: 500 });
    }

    // Call the SerpApi Yandex Reverse Image search API
    const results = await performYandexReverseImageSearch(image_url, text);
    
    console.log('SerpApi response:', JSON.stringify(results, null, 2));

    // Check for specific Yandex "no results" message
    if (results.image_sizes_message === "No matching images found") {
      console.warn(`Yandex Images: No matching images found`);
      return NextResponse.json({
        success: false,
        image_url,
        no_matches: true,
        search_metadata: results.search_metadata,
        message: 'Yandex tidak menemukan gambar yang cocok. Coba dengan gambar lain atau tambahkan kata kunci yang lebih spesifik.'
      }, { status: 200 });
    }
    
    // Check if there was an API error
    if (results.error) {
      console.warn(`SerpApi warning: ${results.error}`);
      return NextResponse.json({
        success: false,
        image_url,
        error: results.error,
        search_metadata: results.search_metadata,
        message: 'Coba tambahkan parameter text yang lebih spesifik untuk hasil yang lebih baik'
      }, { status: 200 });
    }
    
    return NextResponse.json({
      success: true,
      image_url,
      results
    });
  } catch (error: any) {
    console.error('Error in reverse image search API:', error);
    return NextResponse.json({ 
      error: 'Failed to perform reverse image search',
      details: error.message
    }, { status: 500 });
  }
}

async function performYandexReverseImageSearch(imageUrl: string, text?: string): Promise<YandexSearchResults> {
  try {
    const apiKey = process.env.SERPAPI_KEY;
    
    if (!apiKey) {
      throw new Error('SerpApi key not configured. Add SERPAPI_KEY to your environment variables.');
    }

    // Validate API key format
    if (!apiKey.match(/^[a-zA-Z0-9]{32,}$/)) {
      throw new Error('Invalid API key format. Please check your SERPAPI_KEY.');
    }
    
    console.log('Using SERPAPI_KEY:', apiKey.substring(0, 4) + '...' + apiKey.substring(apiKey.length - 4));

    // Build the search parameters according to the documentation
    const params = new URLSearchParams({
      engine: 'yandex_images',
      api_key: apiKey,
      output: 'json',
      url: imageUrl,
      text: "i",
      yandex_domain: 'yandex.com'
    });

    if (text) {
      params.append('text', text);
    }

    const searchUrl = `https://serpapi.com/search.json?${params.toString()}`;
    console.log('Search URL (without API key):', searchUrl.replace(apiKey, 'HIDDEN'));

    // Make the request with proper error handling and timeout
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 60000);

    try {
      const response = await fetch(searchUrl, {
        method: 'GET',
        headers: {
          'Accept': 'application/json',
        },
        signal: controller.signal
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`SerpApi error: ${response.status} - ${errorText}`);
      }

      const data = await response.json();
      console.log('SerpApi response metadata:', data.search_metadata);

      return {
        search_metadata: data.search_metadata,
        search_parameters: data.search_parameters,
        images_results: data.images_results || [],
        inline_images: data.inline_images || [],
        image_sizes_message: data.image_sizes_message,
        vision_text: data.vision_text || null,
        similar_images: data.similar_images || [],
        suggested_searches: data.suggested_searches || [],
        error: data.error || null
      };
    } finally {
      clearTimeout(timeoutId);
    }
  } catch (error: any) {
    console.error('Error performing Yandex reverse image search:', error);
    throw error;
  }
}
