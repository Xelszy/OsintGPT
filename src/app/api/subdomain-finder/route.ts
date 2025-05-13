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
    
    console.log(`Discovering subdomains for: ${domain}`);

    // Use SecurityTrails API for subdomain enumeration
    const apiKey = process.env.SECURITYTRAILS_API_KEY;
    if (!apiKey) {
      throw new Error('SecurityTrails API key not configured');
    }

    const response = await fetch(`https://api.securitytrails.com/v1/domain/${domain}/subdomains`, {
      headers: {
        'APIKEY': apiKey,
        'Accept': 'application/json'
      }
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`SecurityTrails API error: ${response.status} - ${errorText}`);
    }

    const data = await response.json();
    
    if (!data.subdomains || !Array.isArray(data.subdomains)) {
      throw new Error('Invalid response format from SecurityTrails API');
    }

    // Format the response
    const subdomains = data.subdomains.map((sub: string) => ({
      name: `${sub}.${domain}`,
      domain: domain,
      subdomain: sub
    }));

    return NextResponse.json({
      domain,
      count: subdomains.length,
      subdomains,
      source: 'SecurityTrails'
    });
  } catch (error: any) {
    console.error('Error in subdomain finder API:', error);
    return NextResponse.json({ 
      error: 'Failed to enumerate subdomains',
      details: error.message
    }, { status: 500 });
  }
}

async function fetchSecurityTrailsSubdomains(domain: string) {
  const apiKey = process.env.SECURITY_TRAILS_API_KEY;
  
  if (!apiKey) {
    console.warn('SecurityTrails API key not found. Please add SECURITY_TRAILS_API_KEY to your .env.local file.');
    console.info('You can create a .env.local file in the root of your project with: SECURITY_TRAILS_API_KEY=your_api_key_here');
    return { error: 'API key not configured - To use SecurityTrails, add your API key to .env.local' };
  }
  
  try {
    // SecurityTrails API endpoint for subdomains
    const response = await fetch(`https://api.securitytrails.com/v1/domain/${domain}/subdomains`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'APIKEY': apiKey
      }
    });
    
    if (!response.ok) {
      const errorText = await response.text();
      console.error(`SecurityTrails API responded with status ${response.status}`);
      if (response.status === 401) {
        console.error('API key might be invalid or expired. Please check your SecurityTrails account.');
      } else if (response.status === 429) {
        console.error('API rate limit reached. Consider upgrading your SecurityTrails plan or waiting before making more requests.');
      }
      throw new Error(`SecurityTrails API error: ${response.status} - ${errorText}`);
    }
    
    return await response.json();
  } catch (error) {
    console.error('SecurityTrails API request failed:', error);
    return { error: error instanceof Error ? error.message : 'Unknown error' };
  }
}

function parseSecurityTrailsSubdomains(data: any) {
  if (!data || data.error || !data.subdomains || !Array.isArray(data.subdomains)) {
    return [];
  }
  
  const rootDomain = data.domain || '';
  
  // Convert from SecurityTrails format to our format
  return data.subdomains.map((subdomain: string) => {
    const fullDomain = subdomain + '.' + rootDomain;
    return {
      name: fullDomain,
      subdomain: subdomain,
      domain: rootDomain
    };
  });
} 