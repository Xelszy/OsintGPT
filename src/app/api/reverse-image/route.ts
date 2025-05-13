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
    } else {
      console.log('SERPAPI_KEY is set.');
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
    // Get the SerpApi key from environment variables
    const apiKey = process.env.SERPAPI_KEY;
    
    if (!apiKey) {
      throw new Error('SerpApi key not configured. Add SERPAPI_KEY to your environment variables.');
    }
    
    // Use the serpapi library for Yandex reverse image search with URL and optional text
    return new Promise<YandexSearchResults>((resolve, reject) => {
      const params: any = {
        api_key: apiKey,
        engine: "yandex_images",
        url: imageUrl
      };
      if (text) {
        params.text = text; // Use text only if provided
      }
      getJson(params, (json: any) => {
        if (json.error) {
          // Instead of rejecting, pass the error through so we can handle it gracefully
          resolve({
            error: json.error,
            search_metadata: json.search_metadata || {},
            search_parameters: json.search_parameters || {}
          });
        } else {
          // Process and return the relevant results including specific Yandex fields
          resolve({
            search_metadata: json.search_metadata,
            search_parameters: json.search_parameters,
            images_results: json.images_results || [],
            inline_images: json.inline_images || [],
            image_sizes_message: json.image_sizes_message,
            vision_text: json.vision_text || null,
            similar_images: json.similar_images || []
          });
        }
      });
    });
  } catch (error) {
    console.error('Error performing Yandex reverse image search:', error);
    throw error;
  }
}
