import { NextResponse } from 'next/server';
import { API, TagTypes } from 'nhentai-api';

// Type definitions for nhentai-api
interface Book {
  id: number;
  title: string | { english?: string; japanese?: string; pretty?: string; };
  favorites: number;
  mediaId: number;
  uploadDate: Date;
  numPages: number;
  tags: any[];
  artists: string[];
  categories: string[];
  languages: string[];
  characters: string[];
  groups: string[];
  parodies: string[];
  pureTags: string[];
  cover: {
    t: string;
    w: number;
    h: number;
  };
  thumbnail: {
    t: string;
    w: number;
    h: number;
  };
  pages: {
    t: string;
    w: number;
    h: number;
  }[];
}

interface SearchResult {
  books: Book[];
  pages: number;
  perPage: number;
}

// Inisialisasi API client
const api = new API();

// Retry configuration
const MAX_RETRIES = 3;
const RETRY_DELAY_MS = 1000;

// Function to retry API calls with exponential backoff
async function retryApiCall<T>(apiCall: () => Promise<T>, retries = MAX_RETRIES): Promise<T> {
  try {
    return await apiCall();
  } catch (error: any) {
    // Check if it's a connection error (ECONNRESET)
    const isConnectionError = 
      error.code === 'ECONNRESET' || 
      (error.originalError && error.originalError.code === 'ECONNRESET');
    
    if (isConnectionError && retries > 0) {
      console.log(`API connection reset, retrying... (${MAX_RETRIES - retries + 1}/${MAX_RETRIES})`);
      // Wait before retrying with exponential backoff
      await new Promise(resolve => setTimeout(resolve, RETRY_DELAY_MS * (MAX_RETRIES - retries + 1)));
      return retryApiCall(apiCall, retries - 1);
    }
    
    // If not a connection error or no more retries left, rethrow
    throw error;
  }
}

// Rate limiting implementation
const RATE_LIMIT = 60; // requests per minute
const RATE_WINDOW = 60 * 1000; // 1 minute in milliseconds
const ipRequests = new Map<string, number[]>();

function getClientIp(req: Request): string {
  // Get IP from headers or default to a placeholder
  return req.headers.get('x-forwarded-for')?.split(',')[0] || 'unknown-ip';
}

function checkRateLimit(ip: string): boolean {
  const now = Date.now();
  const requests = ipRequests.get(ip) || [];
  
  // Remove old requests
  const recentRequests = requests.filter(time => time > now - RATE_WINDOW);
  
  if (recentRequests.length >= RATE_LIMIT) {
    return false;
  }
  
  recentRequests.push(now);
  ipRequests.set(ip, recentRequests);
  return true;
}

// Helper function to format title that might be an object
function formatTitle(title: any): string {
  if (typeof title === 'string') {
    return title;
  }
  
  if (title && typeof title === 'object') {
    // Check if it has english, japanese, pretty properties
    if (title.english) return title.english;
    if (title.pretty) return title.pretty;
    if (title.japanese) return title.japanese;
    
    // Return any other string property if available
    const stringProps = Object.values(title).filter(val => typeof val === 'string');
    if (stringProps.length > 0) return stringProps[0];
  }
  
  // Fallback
  return 'Untitled';
}

// Fungsi untuk menyalinkan objek tanpa circular reference
function serializeBook(book: any) {
  // Jika bukan objek, return langsung
  if (!book || typeof book !== 'object') return book;
  
  // Generate cover URL
  let coverUrl = null;
  
  // Logging untuk debugging
  console.log('Book data for thumbnail generation:', {
    id: book.id,
    mediaId: book.mediaId,
    hasCover: !!book.cover,
    coverType: book.cover?.t
  });
  
  // Menggunakan format URL yang benar (i2.nhentai.net)
  if (book.mediaId) {
    // mediaId adalah gallery_id yang diperlukan untuk URL gambar
    coverUrl = `https://i2.nhentai.net/galleries/${book.mediaId}/1.jpg`;
    console.log('Generated coverUrl with gallery ID:', coverUrl);
  } else if (book.id) {
    // Jika mediaId tidak ada, gunakan ID sebagai fallback
    // Tapi ini mungkin tidak bekerja karena perbedaan ID
    coverUrl = `https://i2.nhentai.net/galleries/${book.id}/1.jpg`;
    console.log('Fallback coverUrl from book ID (may not work):', coverUrl);
  }
  
  // Clone basic properties
  const safeBook: any = {
    id: book.id,
    title: typeof book.title === 'object' ? book.title : book.title, // Keep original title structure
    titleString: formatTitle(book.title), // Add a string version for display
    favorites: book.favorites,
    mediaId: book.mediaId,
    uploadDate: book.uploadDate,
    numPages: book.numPages,
    coverUrl // Add generated cover URL
  };
  
  // Ensure all collection fields are properly processed
  const ensureStringArray = (collection: any): string[] => {
    if (!collection) return [];
    if (typeof collection === 'string') return [collection];
    if (Array.isArray(collection)) {
      return collection.map(item => {
        if (typeof item === 'string') return item;
        if (item && typeof item === 'object' && item.name) return item.name;
        return String(item);
      });
    }
    return [];
  };
  
  // Tangani tags secara khusus (karena tags adalah array objek)
  if (book.tags && Array.isArray(book.tags)) {
    safeBook.tags = book.tags.map((tag: any) => {
      if (typeof tag === 'string') return tag;
      
      return {
        id: tag.id,
        type: tag.type ? { id: tag.type.id, type: tag.type.type } : undefined,
        name: tag.name,
        count: tag.count
      };
    });
  }
  
  // Salin kategori tag lainnya
  ['artists', 'categories', 'languages', 'characters', 'groups', 'parodies', 'pureTags'].forEach(tagType => {
    if (book[tagType]) {
      // Ensure this is always processed as an array of strings
      safeBook[tagType] = ensureStringArray(book[tagType]);
    }
  });
  
  // Handle cover, thumbnail, dan pages
  if (book.cover) {
    safeBook.cover = {
      t: book.cover.t,
      w: book.cover.w,
      h: book.cover.h
      // Sengaja tidak menyertakan 'book' untuk memutus circular reference
    };
  }
  
  if (book.thumbnail) {
    safeBook.thumbnail = {
      t: book.thumbnail.t,
      w: book.thumbnail.w,
      h: book.thumbnail.h
    };
  }
  
  // Handle pages array
  if (book.pages && Array.isArray(book.pages)) {
    safeBook.pages = book.pages.map((page: any) => {
      if (page && typeof page === 'object') {
        return {
          t: page.t, 
          w: page.w, 
          h: page.h
        };
      }
      return page;
    });
  }
  
  return safeBook;
}

export async function POST(req: Request) {
  // Rate limiting
  const ip = getClientIp(req);
  if (!checkRateLimit(ip)) {
    return NextResponse.json(
      { error: 'Rate limit exceeded. Please wait a minute.' }, 
      { status: 429 }
    );
  }

  try {
    const { action, query, id, page = 1, sort = 'date', name, tags } = await req.json();

    // Age verification check should be implemented in your frontend
    // This is just a simple reminder
    const ADULT_CONTENT_WARNING = "Peringatan: Konten ini hanya untuk pengguna 18+";

    let result;
    let formattedResponse = "";

    switch (action) {
      case 'search':
        if (!query) {
          return NextResponse.json({ error: 'Search query is required' }, { status: 400 });
        }
        
        const searchResult = await retryApiCall<SearchResult>(() => api.search(query, page));
        
        // Format respons untuk chat
        formattedResponse = `Hasil pencarian untuk "${query}" (halaman ${page}):\n\n`;
        
        if (searchResult.books.length === 0) {
          formattedResponse += "Tidak ditemukan hasil yang sesuai.";
        } else {
          // Seril saat iterasi
          const safeBooks = searchResult.books.map((book: Book) => serializeBook(book));
          
          safeBooks.forEach((book: any, idx: number) => {
            const tags = book.tags && book.tags.length > 0 
              ? `\nTags: ${book.tags.slice(0, 3).join(', ')}${book.tags.length > 3 ? '...' : ''}`
              : '';
              
            formattedResponse += `${idx + 1}. ${formatTitle(book.title)}\n`;
            formattedResponse += `   ID: ${book.id}${tags}\n\n`;
          });
          
          formattedResponse += `Halaman: ${page}/${searchResult.pages} - Total: ${searchResult.books.length} hasil`;
        }
        
        // Gunakan safe data
        const safeSearchResult = {
          ...searchResult,
          books: searchResult.books.map((book: Book) => serializeBook(book))
        };
        
        result = {
          type: 'search',
          rawData: safeSearchResult,
          formatted: formattedResponse
        };
        break;

      case 'get':
        if (!id) {
          return NextResponse.json({ error: 'Book ID is required' }, { status: 400 });
        }
        
        const book = await retryApiCall<Book>(() => api.getBook(Number(id)));
        let coverUrl = "";
        
        // Menggunakan format URL yang benar (i2.nhentai.net)
        if (book.mediaId) {
          coverUrl = `https://i2.nhentai.net/galleries/${book.mediaId}/1.jpg`;
        } else if (book.id) {
          // Fallback jika mediaId tidak tersedia
          coverUrl = `https://i2.nhentai.net/galleries/${book.id}/1.jpg`;
        }
        
        console.log("Generated coverUrl:", coverUrl);
        
        // Gunakan serializer untuk menghindari circular reference
        const safeBook = serializeBook(book);
        
        // Format tags by type
        const artists = Array.isArray(book.artists) ? book.artists.join(', ') : String(book.artists) || 'Unknown';
        const parodies = Array.isArray(book.parodies) ? book.parodies.join(', ') : String(book.parodies) || 'Original';
        const tags = Array.isArray(book.pureTags) ? book.pureTags.join(', ') : String(book.pureTags) || 'None';
        
        formattedResponse = `📖 ${formatTitle(book.title)}\n\n`;
        formattedResponse += `👤 Artist: ${artists}\n`;
        formattedResponse += `🔖 Parody: ${parodies}\n`;
        formattedResponse += `🏷️ Tags: ${tags}\n\n`;
        formattedResponse += `📄 ${book.pages.length} halaman\n`;
        formattedResponse += `❤️ ${book.favorites} favorit\n\n`;
        formattedResponse += `🖼️ Cover: ${coverUrl}\n`;
        formattedResponse += `🔗 Link: https://nhentai.net/g/${book.id}/`;
        
        result = {
          type: 'book',
          rawData: safeBook,
          coverUrl,
          formatted: formattedResponse
        };
        break;

      case 'random':
        try {
          const randomBook = await retryApiCall<Book>(() => api.getRandomBook());
          let randomCoverUrl = "";
          
          // Menggunakan format URL yang benar (i2.nhentai.net)
          if (randomBook.mediaId) {
            randomCoverUrl = `https://i2.nhentai.net/galleries/${randomBook.mediaId}/1.jpg`;
          } else if (randomBook.id) {
            // Fallback jika mediaId tidak tersedia
            randomCoverUrl = `https://i2.nhentai.net/galleries/${randomBook.id}/1.jpg`;
          }
          
          console.log("Generated random coverUrl:", randomCoverUrl);
          
          // Gunakan serializer untuk menghindari circular reference
          const safeRandomBook = serializeBook(randomBook);
          
          // Format tags by type
          const randomArtists = Array.isArray(randomBook.artists) ? randomBook.artists.join(', ') : String(randomBook.artists) || 'Unknown';
          const randomParodies = Array.isArray(randomBook.parodies) ? randomBook.parodies.join(', ') : String(randomBook.parodies) || 'Original';
          const randomTags = Array.isArray(randomBook.pureTags) ? randomBook.pureTags.join(', ') : String(randomBook.pureTags) || 'None';
          
          formattedResponse = `📖 ${formatTitle(randomBook.title)}\n\n`;
          formattedResponse += `👤 Artist: ${randomArtists}\n`;
          formattedResponse += `🔖 Parody: ${randomParodies}\n`;
          formattedResponse += `🏷️ Tags: ${randomTags}\n\n`;
          formattedResponse += `📄 ${randomBook.pages.length} halaman\n`;
          formattedResponse += `❤️ ${randomBook.favorites} favorit\n\n`;
          formattedResponse += `🖼️ Cover: ${randomCoverUrl}\n`;
          formattedResponse += `🔗 Link: https://nhentai.net/g/${randomBook.id}/`;
          
          result = {
            type: 'random',
            rawData: safeRandomBook,
            coverUrl: randomCoverUrl,
            formatted: formattedResponse
          };
        } catch (error) {
          console.error('Error getting random book:', error);
          formattedResponse = "Maaf, terjadi kesalahan saat mengambil random book.";
        }
        break;

      case 'tag':
        if (!name) {
          return NextResponse.json({ error: 'Tag name is required' }, { status: 400 });
        }
        
        // Menggunakan API untuk mencari berdasarkan tag
        const taggedResult = await retryApiCall<SearchResult>(() => api.searchTagged(Number(name) || name, 1));
        
        formattedResponse = `Hasil pencarian untuk tag "${name}" (halaman ${page}):\n\n`;
        
        if (taggedResult.books.length === 0) {
          formattedResponse += "Tidak ditemukan hasil yang sesuai.";
        } else {
          // Gunakan serializer untuk menghindari circular reference
          const safeTaggedBooks = taggedResult.books.map((book: Book) => serializeBook(book));
          
          safeTaggedBooks.forEach((book: any, idx: number) => {
            formattedResponse += `${idx + 1}. ${formatTitle(book.title)}\n`;
            formattedResponse += `   ID: ${book.id}\n\n`;
          });
          
          formattedResponse += `Halaman: ${page}/${taggedResult.pages} - Total: ${taggedResult.books.length} hasil`;
        }
        
        // Gunakan safe data
        const safeTaggedResult = {
          ...taggedResult,
          books: taggedResult.books.map((book: Book) => serializeBook(book))
        };
        
        result = {
          type: 'tag',
          rawData: safeTaggedResult,
          formatted: formattedResponse
        };
        break;

      default:
        return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
    }

    return NextResponse.json({
      warning: ADULT_CONTENT_WARNING,
      ...result
    });
  } catch (error: any) {
    console.error("nHentai API error:", error);
    
    // Check if it's a connection reset error
    const isConnectionReset = 
      error.code === 'ECONNRESET' || 
      (error.originalError && error.originalError.code === 'ECONNRESET') ||
      (error.message && error.message.includes('ECONNRESET'));
      
    // Provide a more user-friendly error message for connection issues
    let errorMessage = error.message || 'Unknown error occurred';
    let statusCode = 500;
    
    if (isConnectionReset) {
      errorMessage = 'Koneksi ke server nHentai terputus. Silakan coba lagi nanti.';
      statusCode = 503; // Service Unavailable
    }
    
    return NextResponse.json({ 
      error: errorMessage
    }, { 
      status: statusCode 
    });
  }
}