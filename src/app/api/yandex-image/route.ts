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
    const { query } = await req.json();
    
    if (!query) {
      return NextResponse.json({ error: 'Search query is required for image search' }, { status: 400 });
    }

    console.log(`Processing image search for query: ${query}`);

    // Call the SerpApi Yandex search function
    const results = await performYandexImageSearch(query);
    
    // Handle no results case without throwing an error
    if (!results.images_results?.length && !results.similar_images?.length) {
      console.warn('No images found in Yandex search results');
      return NextResponse.json({
        success: false,
        no_matches: true,
        search_metadata: results.search_metadata,
        message: 'Yandex tidak menemukan gambar yang cocok. Coba dengan kata kunci yang lebih spesifik.'
      }, { status: 200 });
    }
    
    return NextResponse.json({
      success: true,
      results
    });
  } catch (error: any) {
    console.error('Error in Yandex image search API:', error);
    return NextResponse.json({ 
      error: 'Failed to perform image search',
      details: error.message
    }, { status: 500 });
  }
}

async function performYandexImageSearch(query: string): Promise<YandexSearchResults> {
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

    // Build the search parameters
    const params = new URLSearchParams({
      engine: 'yandex_images',
      api_key: apiKey,
      output: 'json',
      text: query,
      yandex_domain: 'yandex.ru'
    });

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
    console.error('Error performing Yandex image search:', error);
    throw error;
  }
} 