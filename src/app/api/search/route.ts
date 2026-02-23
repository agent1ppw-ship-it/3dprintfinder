import { NextRequest, NextResponse } from "next/server";

interface SearchItem {
  id: string;
  title: string;
  price: number;
  currency: string;
  imageUrl?: string;
  itemUrl: string;
  platform: "amazon" | "ebay" | "etsy";
}

// Filter to check if title is valid
function isValidTitle(title: string): boolean {
  if (/^[A-Z0-9]{6,}$/i.test(title)) return false;
  if (/^\$[A-Za-z0-9]{5,}/.test(title)) return false;
  if (/^[a-z]{10,}$/i.test(title) && !title.includes(' ')) return false;
  if (/^[^a-zA-Z]+$/.test(title)) return false;
  return true;
}

// Amazon scraping - try multiple approaches
async function searchAmazon(query: string): Promise<SearchItem[]> {
  const results: SearchItem[] = [];
  const seen = new Set<string>();
  
  // Try both with and without "3D printed"
  const searchQueries = [
    query,
    query + " 3D printed"
  ];
  
  for (const searchQuery of searchQueries) {
    if (results.length >= 20) break;
    
    try {
      const res = await fetch(
        `https://www.amazon.com/s?k=${encodeURIComponent(searchQuery)}`,
        {
          headers: {
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
            'Accept': 'text/html,application/xhtml+xml',
          },
          signal: AbortSignal.timeout(8000)
        }
      );
      
      if (res.ok) {
        const html = await res.text();
        
        // Try to extract title + price from JSON-LD structured data
        const jsonLdPattern = /<script[^>]*type="application\/ld\+json"[^>]*>([\s\S]*?)<\/script>/gi;
        let match;
        
        while ((match = jsonLdPattern.exec(html)) !== null && results.length < 20) {
          try {
            const json = JSON.parse(match[1]);
            const items = Array.isArray(json) ? json : (json['@graph'] || [json]);
            
            for (const item of items) {
              if (item['@type'] === 'Product' && item.name) {
                let price = 0;
                if (item.offers) {
                  const offers = Array.isArray(item.offers) ? item.offers[0] : item.offers;
                  if (offers.price) price = parseFloat(String(offers.price).replace(/[^0-9.]/g, ''));
                }
                
                const title = item.name.substring(0, 100);
                const key = title.substring(0, 20).toLowerCase();
                
                if (title.length > 10 && !seen.has(key) && isValidTitle(title)) {
                  seen.add(key);
                  results.push({
                    id: `amazon-${results.length}`,
                    title,
                    price: price || 0,
                    currency: 'USD',
                    imageUrl: Array.isArray(item.image) ? item.image[0] : item.image,
                    itemUrl: `https://www.amazon.com/s?k=${encodeURIComponent(title)}`,
                    platform: 'amazon',
                  });
                }
              }
            }
          } catch (e) {}
        }
        
        // Also try regular image pattern
        const imgPattern = /<img[^>]*data-a-dynamic-image[^>]*src="([^"]+)"[^>]*alt="([^"]{10,100})"[^>]*>/gi;
        while ((match = imgPattern.exec(html)) !== null && results.length < 20) {
          const image = match[1].replace(/\\u0026/g, '&');
          const title = match[2].replace(/&quot;/g, '"').replace(/&amp;/g, '&').trim();
          
          if (title.length > 15 && isValidTitle(title)) {
            const key = title.substring(0, 20).toLowerCase();
            if (!seen.has(key)) {
              seen.add(key);
              results.push({
                id: `amazon-${results.length}`,
                title: title.substring(0, 100),
                price: 0,
                currency: 'USD',
                imageUrl: image.replace('._AC_US40_', '._AC_US200_'),
                itemUrl: `https://www.amazon.com/s?k=${encodeURIComponent(title)}`,
                platform: 'amazon',
              });
            }
          }
        }
      }
    } catch (e) {
      console.error('Amazon scrape error:', e);
    }
  }
  
  return results.slice(0, 20);
}

// eBay API
async function searchEbay(query: string): Promise<SearchItem[]> {
  const appId = process.env.EBAY_APP_ID;
  
  if (!appId) return generateMockResults("ebay", query);

  try {
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

    if (!accessToken) return generateMockResults("ebay", query);

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
    console.error('eBay error:', error);
    return generateMockResults("ebay", query);
  }
}

// Etsy API
async function searchEtsy(query: string): Promise<SearchItem[]> {
  const apiKey = process.env.ETSY_API_KEY;
  
  if (!apiKey) return generateMockResults("etsy", query);

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
    console.error('Etsy error:', error);
    return generateMockResults("etsy", query);
  }
}

// Mock fallback
function generateMockResults(platform: "ebay" | "etsy", query: string): SearchItem[] {
  return [
    { id: `${platform}-1`, title: `3D Printed ${query} - Custom Design`, price: 29.99, currency: 'USD', itemUrl: `https://www.${platform}.com/search?q=${query}`, platform },
    { id: `${platform}-2`, title: `Handmade ${query} - 3D Printed`, price: 34.99, currency: 'USD', itemUrl: `https://www.${platform}.com/search?q=${query}`, platform },
  ];
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
    
    // Always include Amazon (with real scraping)
    const amazonResults = await searchAmazon(query);
    results.push(...amazonResults);
    
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
    return NextResponse.json({ results: [] });
  }
}
