import { NextResponse } from 'next/server';

export async function POST(req: Request) {
  try {
    const { action, query, imageUrl } = await req.json();
    
    // Base Yandex URLs
    const YANDEX_SEARCH_URL = 'https://yandex.com/images/search';
    const YANDEX_REVERSE_URL = 'https://yandex.com/images/search?rpt=imageview&url=';

    switch (action) {
      case 'search':
        if (!query) {
          return NextResponse.json({ error: 'Search query is required' }, { status: 400 });
        }
        // Return direct Yandex image search URL
        return NextResponse.json({
          url: `${YANDEX_SEARCH_URL}?text=${encodeURIComponent(query)}`,
          message: 'Use this URL to view Yandex image search results'
        });

      case 'reverse':
        if (!imageUrl) {
          return NextResponse.json({ error: 'Image URL is required' }, { status: 400 });
        }
        // Return reverse image search URL
        return NextResponse.json({
          url: `${YANDEX_REVERSE_URL}${encodeURIComponent(imageUrl)}`,
          message: 'Use this URL to view reverse image search results'
        });

      default:
        return NextResponse.json({ error: 'Invalid action. Use "search" or "reverse".' }, { status: 400 });
    }
  } catch (error: any) {
    console.error('Yandex image search error:', error);
    return NextResponse.json({ 
      error: 'Failed to process image search request',
      details: error.message 
    }, { status: 500 });
  }
} 