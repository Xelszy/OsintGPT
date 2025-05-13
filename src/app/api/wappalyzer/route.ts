import { NextResponse } from 'next/server';

interface Technology {
  name: string;
  description?: string;
  website?: string;
  categories?: string[];
  confidence?: number;
  version?: string;
}

interface WappalyzerResponse {
  technologies: Technology[];
  status: string;
  cached?: boolean;
  timestamp?: number;
}

// In-memory cache dengan TTL 24 jam
const cache: Record<string, { data: WappalyzerResponse; timestamp: number }> = {};
const CACHE_TTL = 24 * 60 * 60 * 1000; // 24 jam dalam milidetik

export async function POST(req: Request) {
  try {
    const { url } = await req.json();
    
    if (!url) {
      return NextResponse.json({ error: 'URL is required' }, { status: 400 });
    }

    console.log(`Processing Wappalyzer scan for: ${url}`);
    
    // Check cache first
    const cachedResult = getCachedResult(url);
    if (cachedResult) {
      console.log(`Returning cached Wappalyzer result for: ${url}`);
      return NextResponse.json({
        ...cachedResult,
        cached: true
      });
    }
    
    // If not in cache, perform a live scan
    const result = await scanWithWappalyzer(url);
    
    // Save to cache
    cache[url] = {
      data: result,
      timestamp: Date.now()
    };
    
    return NextResponse.json(result);
  } catch (error: any) {
    console.error('Error in Wappalyzer API:', error);
    return NextResponse.json({ 
      error: 'Failed to perform Wappalyzer scan',
      details: error.message
    }, { status: 500 });
  }
}

function getCachedResult(url: string): WappalyzerResponse | null {
  const cachedData = cache[url];
  
  if (!cachedData) {
    return null;
  }
  
  // Check if cache is still valid
  const now = Date.now();
  if (now - cachedData.timestamp > CACHE_TTL) {
    // Cache expired
    delete cache[url];
    return null;
  }
  
  return {
    ...cachedData.data,
    cached: true,
    timestamp: cachedData.timestamp
  };
}

async function scanWithWappalyzer(url: string): Promise<WappalyzerResponse> {
  try {
    // Menggunakan Wappalyzer API publik (via https://github.com/hunter-io/wappalyzer-api)
    // Ini bisa diganti dengan Docker deployment jika diperlukan
    const wappalyzerEndpoint = `https://api.wappalyzer.com/lookup/v2/?urls=${encodeURIComponent(url)}`;
    
    const headers: HeadersInit = {
      'Content-Type': 'application/json',
    };
    
    // Jika ada API key untuk Wappalyzer, tambahkan di sini
    const apiKey = process.env.WAPPALYZER_API_KEY;
    if (apiKey) {
      headers['X-Api-Key'] = apiKey;
    }

    console.log(`Performing live Wappalyzer scan for ${url}`);
    const response = await fetch(wappalyzerEndpoint, {
      method: 'GET',
      headers,
    });

    if (!response.ok) {
      // Jika API resmi gagal, coba dengan alternatif atau proxy lain
      console.warn(`Official Wappalyzer API failed with status ${response.status}. Trying alternative method...`);
      return await fallbackScan(url);
    }

    const data = await response.json();
    if (Array.isArray(data) && data.length > 0) {
      return {
        technologies: data[0].technologies || [],
        status: 'success'
      };
    }
    
    return {
      technologies: [],
      status: 'no_technologies_found'
    };
  } catch (error) {
    console.error('Error in Wappalyzer scan:', error);
    return await fallbackScan(url);
  }
}

async function fallbackScan(url: string): Promise<WappalyzerResponse> {
  try {
    // Implementasi alternatif menggunakan layanan proxy/publik lain
    // Sebagai contoh, kita bisa menggunakan APIs seperti urlscan.io atau builtwith
    // atau self-hosted Wappalyzer API seperti yang ada di GitHub repo yang disebutkan
    
    // Contoh dengan URLScan.io (perlu API key)
    const urlscanKey = process.env.URLSCAN_API_KEY;
    if (urlscanKey) {
      const urlscanResponse = await fetch('https://urlscan.io/api/v1/scan/', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'API-Key': urlscanKey,
        },
        body: JSON.stringify({ url, visibility: 'private' }),
      });
      
      if (urlscanResponse.ok) {
        const { uuid } = await urlscanResponse.json();
        
        // Wait for scan to complete (15s)
        await new Promise(resolve => setTimeout(resolve, 15000));
        
        // Get results
        const resultResponse = await fetch(`https://urlscan.io/api/v1/result/${uuid}/`);
        if (resultResponse.ok) {
          const resultData = await resultResponse.json();
          
          // Extract technology data from URLScan response
          const technologies = resultData.page?.technologies || [];
          return {
            technologies: technologies.map((tech: any) => ({
              name: tech.name,
              description: tech.description,
              website: tech.website,
              categories: tech.categories?.map((cat: any) => cat.name),
              version: tech.version
            })),
            status: 'success',
          };
        }
      }
    }
    
    // Jika semua metode gagal, kembalikan hasil kosong
    return {
      technologies: [],
      status: 'scan_failed'
    };
  } catch (error) {
    console.error('Error in fallback Wappalyzer scan:', error);
    return {
      technologies: [],
      status: 'scan_failed',
    };
  }
}

// Alternatif: Jika ingin menggunakan lokal docker image:
// docker run -d -p 3333:3000 ghcr.io/hunter-io/wappalyzer-api:3.6
// lalu gunakan fetch('http://localhost:3333/extract?url=' + encodeURIComponent(url)) 