import { NextResponse } from 'next/server';

interface AccountInquiryRequest {
  account_bank: string;
  account_number: string;
}

export async function POST(req: Request) {
  try {
    console.log("Account inquiry API called");
    const data = await req.json() as AccountInquiryRequest;
    
    if (!data.account_bank || !data.account_number) {
      console.log("Missing required fields:", data);
      return NextResponse.json(
        { error: 'Account bank and account number are required' },
        { status: 400 }
      );
    }

    console.log("Making request to CekRekening API with:", data);
    
    // Forward the request to the Cek Rekening API
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
        account_bank: data.account_bank,
        account_number: data.account_number
      })
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error("Error from CekRekening API:", response.status, errorText);
      let errorData;
      try {
        errorData = JSON.parse(errorText);
      } catch {
        errorData = { message: errorText };
      }
      
      return NextResponse.json(
        { success: false, message: 'API Error', details: errorData },
        { status: 200 } // Return 200 even if external API fails to allow UI to show error message
      );
    }

    const result = await response.json();
    console.log("Successful response from CekRekening API:", result);
    
    // Ensure the response has the correct structure for our UI
    const responseData = {
      success: true,
      message: result.message || 'Success',
      data: {
        account_bank: data.account_bank,
        account_number: data.account_number,
        account_holder: result.data?.account_holder || result.data?.account_name, 
        status: 'Success'
      }
    };
    
    return NextResponse.json(responseData);
  } catch (error) {
    console.error('Account inquiry error:', error);
    return NextResponse.json(
      { 
        success: false, 
        message: 'Internal server error', 
        error: (error as Error).message 
      },
      { status: 200 } // Return 200 to allow UI to show error message
    );
  }
} 