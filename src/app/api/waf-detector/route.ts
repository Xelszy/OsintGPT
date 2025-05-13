import { NextResponse } from 'next/server';

export async function POST(req: Request) {
  try {
    const { target } = await req.json();
    if (!target) {
      return NextResponse.json({ error: 'Target domain is required' }, { status: 400 });
    }

    // Extract domain from URL if full URL provided
    const domainMatch = target.match(/^(?:https?:\/\/)?(?:[^@\n]+@)?(?:www\.)?([^:\/\n?]+)/im);
    const domain = domainMatch ? domainMatch[1] : target;
    const url = target.startsWith('http') ? target : `https://${target}`;
    
    console.log(`Detecting WAF for: ${url}`);

    // Use simple technique to check for WAF presence
    const wafData = await detectWAF(url);

    return NextResponse.json({
      domain,
      url,
      wafInfo: wafData,
      bypassTechniques: wafData.detected ? getBypassTechniques(wafData.wafType) : []
    });
  } catch (error: any) {
    console.error('Error in WAF detector API:', error);
    return NextResponse.json({ 
      error: 'Failed to detect WAF',
      details: error.message
    }, { status: 500 });
  }
}

// Common WAF signature patterns to check against
const WAF_SIGNATURES = [
  { name: 'Cloudflare', 
    headers: { 
      'cf-ray': '.*',
      'cf-cache-status': '.*',
      'server': 'cloudflare'
    },
    cookiePatterns: ['__cfduid', 'cf_clearance']
  },
  { name: 'AWS WAF / Shield',
    headers: {
      'x-amzn-trace-id': '.*'
    }
  },
  { name: 'Imperva Incapsula',
    headers: {
      'x-iinfo': '.*',
      'x-cdn': 'Incapsula'
    },
    cookiePatterns: ['incap_ses_', 'visid_incap_']
  },
  { name: 'Akamai',
    headers: {
      'x-akamai-transformed': '.*',
      'x-akamai-ssl-client-sid': '.*'
    }
  },
  { name: 'Sucuri',
    headers: {
      'x-sucuri-cache': '.*',
      'x-sucuri-id': '.*',
      'server': '.*Sucuri.*'
    }
  },
  { name: 'F5 BIG-IP ASM',
    headers: {
      'server': '.*BIG-IP.*',
      'set-cookie': '.*BIGipServer.*'
    }
  },
  { name: 'Fastly',
    headers: {
      'x-served-by': '.*',
      'x-cache': '.*',
      'fastly-debug-digest': '.*'
    }
  },
  { name: 'ModSecurity',
    headers: {
      'server': '.*mod_security.*'
    }
  }
];

// Function to detect WAF based on response headers
async function detectWAF(url: string) {
  try {
    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
        'Accept-Language': 'en-US,en;q=0.5'
      },
      redirect: 'follow'
    });

    const headers: Record<string, string> = {};
    response.headers.forEach((value, key) => {
      headers[key.toLowerCase()] = value;
    });

    // Get cookies
    const cookies = response.headers.get('set-cookie') || '';

    // Check against WAF signatures
    for (const waf of WAF_SIGNATURES) {
      // Check headers
      let headerMatches = 0;
      let totalHeadersToCheck = 0;
      
      for (const [headerName, pattern] of Object.entries(waf.headers)) {
        totalHeadersToCheck++;
        const headerValue = headers[headerName.toLowerCase()];
        
        if (headerValue && new RegExp(pattern, 'i').test(headerValue)) {
          headerMatches++;
        }
      }
      
      // Check cookie patterns if defined
      let cookieMatches = 0;
      let totalCookiesToCheck = 0;
      
      if (waf.cookiePatterns && cookies) {
        for (const pattern of waf.cookiePatterns) {
          totalCookiesToCheck++;
          if (new RegExp(pattern, 'i').test(cookies)) {
            cookieMatches++;
          }
        }
      }
      
      // Calculate confidence score
      const totalChecks = totalHeadersToCheck + totalCookiesToCheck;
      const totalMatches = headerMatches + cookieMatches;
      
      if (totalMatches > 0) {
        const confidence = totalMatches / totalChecks;
        
        console.log(`Detected WAF: ${waf.name} with confidence ${confidence}`);
        
        return {
          detected: true,
          wafType: waf.name,
          confidence,
          source: 'Header Analysis',
          headers: Object.entries(headers)
            .filter(([key]) => Object.keys(waf.headers).includes(key))
            .reduce((obj, [key, value]) => ({ ...obj, [key]: value }), {})
        };
      }
    }

    // Additional checks for security headers
    const securityHeaders = [
      'x-xss-protection',
      'content-security-policy',
      'x-content-type-options',
      'x-frame-options',
      'strict-transport-security'
    ];
    
    const presentSecurityHeaders = securityHeaders.filter(h => headers[h]);
    
    if (presentSecurityHeaders.length >= 3) {
      return {
        detected: true,
        wafType: 'Unknown WAF or Security Measures',
        confidence: 0.5,
        source: 'Security Headers Analysis',
        headers: Object.entries(headers)
          .filter(([key]) => securityHeaders.includes(key))
          .reduce((obj, [key, value]) => ({ ...obj, [key]: value }), {})
      };
    }

    return {
      detected: false,
      wafType: 'None',
      confidence: 0,
      source: 'Analysis',
      headers: {}
    };
  } catch (error: any) {
    console.error('Error during WAF detection:', error);
    return {
      detected: false,
      wafType: 'Unknown',
      confidence: 0,
      error: error.message,
      source: 'Error'
    };
  }
}

// Function to provide potential bypass techniques based on WAF type
function getBypassTechniques(wafType: string): string[] {
  const commonTechniques = [
    'Use different User-Agent strings',
    'Change request methods (GET/POST/PUT)',
    'Try different encoding methods for payloads',
    'Use a legitimate referrer value'
  ];

  switch (wafType) {
    case 'Cloudflare':
      return [
        ...commonTechniques,
        'Use Cloudflare-specific bypass techniques like CF-Connecting-IP header',
        'Try rotating IP addresses to avoid rate limiting',
        'Consider using WebSockets if available'
      ];
    case 'AWS WAF / Shield':
      return [
        ...commonTechniques,
        'Distribute requests across multiple IPs',
        'Reduce request rates to avoid triggering rate limits',
        'Use legitimate AWS User-Agent strings'
      ];
    case 'Imperva Incapsula':
      return [
        ...commonTechniques,
        'Try different payload positions in the request',
        'Use obfuscation techniques specific to Imperva rules',
        'Test with various content-types'
      ];
    default:
      return commonTechniques;
  }
} 