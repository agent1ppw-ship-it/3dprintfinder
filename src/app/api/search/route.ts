import { NextRequest, NextResponse } from "next/server";

interface SearchItem {
  id: string;
  title: string;
  price: number;
  currency: string;
  imageUrl: string;
  itemUrl: string;
  platform: "ebay" | "etsy";
}

// eBay Browse API
async function searchEbay(query: string): Promise<SearchItem[]> {
  const appId = process.env.EBAY_APP_ID;
  
  if (!appId) {
    // Return mock data if no API key
    return generateMockResults("ebay", query);
  }

  try {
    // Get OAuth token
    const tokenRes = await fetch('https://api.ebay.com/identity/v1/oauth2/token', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        'Authorization': `Basic ${Buffer.from(`${appId}:${process.env.EBAY_CLIENT_SECRET || ''}`).toString('base64')}`,
      },
      body: 'grant_type=client_credentials&scope=https://api.ebay.com/oauth/api_scope',
    });

    const tokenData = await tokenRes.json();
    const accessToken = tokenData.access_token;

    if (!accessToken) {
      return generateMockResults("ebay", query);
    }

    // Search eBay
    const searchRes = await fetch(
      `https://api.ebay.com/browse/v1/item_summary/search?q=${encodeURIComponent(query + " 3D printed")}&limit=20`,
      {
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Content-Type': 'application/json',
        },
      }
    );

    const searchData = await searchRes.json();
    
    return (searchData.itemSummaries || []).map((item: any) => ({
      id: item.itemId,
      title: item.title,
      price: parseFloat(item.price?.value || 0),
      currency: item.price?.currency || 'USD',
      imageUrl: item.image?.imageUrl || '',
      itemUrl: item.itemWebUrl || '',
      platform: 'ebay' as const,
    }));
  } catch (error) {
    console.error('eBay API error:', error);
    return generateMockResults("ebay", query);
  }
}

// Etsy API
async function searchEtsy(query: string): Promise<SearchItem[]> {
  const apiKey = process.env.ETSY_API_KEY;
  
  if (!apiKey) {
    return generateMockResults("etsy", query);
  }

  try {
    const res = await fetch(
      `https://openapi.etsy.com/v3/application/shops/-/listings/active?keywords=${encodeURIComponent(query + " 3D printed")}&limit=20&includes=Images`,
      {
        headers: {
          'Authorization': `Bearer ${apiKey}`,
          'Content-Type': 'application/json',
        },
      }
    );

    const data = await res.json();
    
    return (data.results || []).map((item: any) => ({
      id: String(item.listing_id),
      title: item.title,
      price: item.price?.amount ? item.price.amount / 100 : 0,
      currency: item.price?.currency_code || 'USD',
      imageUrl: item.Images?.[0]?.url_570xN || '',
      itemUrl: item.url || '',
      platform: 'etsy' as const,
    }));
  } catch (error) {
    console.error('Etsy API error:', error);
    return generateMockResults("etsy", query);
  }
}

// Mock data for demo purposes
function generateMockResults(platform: "ebay" | "etsy", query: string): SearchItem[] {
  const mockProducts = [
    { title: `3D Printed ${query} RC Car Body Shell`, price: 45.99 },
    { title: `Custom 3D Printed ${query} Model Train Parts`, price: 29.99 },
    { title: `Handcrafted 3D Printed ${query} - Custom Colors`, price: 35.00 },
    { title: `3D Printed ${query} Accessory Set`, price: 24.99 },
    { title: `Unique ${query} - 3D Printed to Order`, price: 55.00 },
    { title: `Customizable 3D Printed ${query}`, price: 19.99 },
    { title: `Premium ${query} 3D Printed - Various Sizes`, price: 39.99 },
    { title: `3D Printed ${query} for Hobbyists`, price: 15.99 },
    { title: `Artisan ${query} - 3D Printed Design`, price: 42.50 },
    { title: `Limited Edition 3D Printed ${query}`, price: 65.00 },
    { title: `3D Printed ${query} Replacement Parts`, price: 12.99 },
    { title: `Personalized ${query} - 3D Printed`, price: 28.00 },
  ];

  return mockProducts.map((product, index) => ({
    id: `${platform}-${index}`,
    title: product.title,
    price: product.price,
    currency: 'USD',
    imageUrl: `https://picsum.photos/seed/${platform}${index}/400/400`,
    itemUrl: platform === 'ebay' 
      ? `https://www.ebay.com/sch/i.html?_nkw=${encodeURIComponent(query)}`
      : `https://www.etsy.com/search?q=${encodeURIComponent(query)}`,
    platform,
  }));
}

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const query = searchParams.get('q') || '';
  const platform = searchParams.get('platform') || 'all';

  if (!query.trim()) {
    return NextResponse.json({ results: [] });
  }

  try {
    const results: SearchItem[] = [];
    
    if (platform === 'all' || platform === 'ebay') {
      const ebayResults = await searchEbay(query);
      results.push(...ebayResults);
    }
    
    if (platform === 'all' || platform === 'etsy') {
      const etsyResults = await searchEtsy(query);
      results.push(...etsyResults);
    }

    return NextResponse.json({ results });
  } catch (error) {
    console.error('Search error:', error);
    return NextResponse.json(
      { error: 'Search failed', results: [] },
      { status: 500 }
    );
  }
}
