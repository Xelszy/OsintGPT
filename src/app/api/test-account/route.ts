import { NextResponse } from 'next/server';

// Function to test without external API
const sampleResponse = {
  status: true,
  message: "Success",
  data: {
    account_bank: "artos",
    account_number: "106475040998",
    account_name: "SITI JULAEHA",
    status: "Success"
  }
};

export async function GET() {
  return NextResponse.json(sampleResponse);
}

export async function POST(req: Request) {
  try {
    console.log("Test API called");
    
    // Try calling the real API
    try {
      const response = await fetch('https://cekrekening-api.belibayar.online/api/v1/account-inquiry', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': '*/*',
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/125.0.6422.112 Safari/537.36',
          'Origin': 'https://cekrekening.github.io',
          'Referer': 'https://cekrekening.github.io/'
        },
        body: JSON.stringify({
          account_bank: "artos",
          account_number: "106475040998"
        })
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error("Error from real API:", response.status, errorText);
        return NextResponse.json({ 
          error: true, 
          message: "External API error", 
          status: response.status, 
          externalResponse: errorText,
          mockData: sampleResponse 
        });
      }

      const result = await response.json();
      console.log("Success from real API:", result);
      return NextResponse.json({ 
        success: true, 
        externalResponse: result 
      });
    } catch (error) {
      console.error("Error calling external API:", error);
      
      // Fall back to sample response
      return NextResponse.json({ 
        error: true, 
        message: "Could not contact external API", 
        error_details: (error as Error).message,
        mockData: sampleResponse 
      });
    }
  } catch (error) {
    console.error('Test error:', error);
    return NextResponse.json({
      error: 'Internal test error',
      message: (error as Error).message,
      mockData: sampleResponse
    });
  }
} 