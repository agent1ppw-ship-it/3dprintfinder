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

function isValidTitle(title: string): boolean {
  if (/^[A-Z0-9]{6,}$/i.test(title)) return false;
  if (/^\$[A-Za-z0-9]{5,}/.test(title)) return false;
  return true;
}

function is3DPrintRelated(title: string, query: string): boolean {
  const lower = title.toLowerCase();
  const q = query.toLowerCase();
  const keywords = ['3d', 'printed', 'print', 'filament', 'pla', 'abs', 'petg', 'tpu', 'resin', 'stl', 'model', 'case', 'holder', 'stand', 'mount', 'organizer', 'container', 'planter', 'figurine', 'toy', 'game', 'cosplay', 'prop', 'arduino', 'raspberry', 'robot', 'drone', 'rc', 'car', 'phone', 'switch', 'steam deck', 'desk', 'office', 'kitchen'];
  const queryWords = q.split(' ').filter(w => w.length > 2);
  const matchesQuery = queryWords.some(w => lower.includes(w));
  const matchesKeyword = keywords.some(kw => lower.includes(kw));
  return matchesQuery || matchesKeyword;
}

async function searchAmazon(query: string): Promise<SearchItem[]> {
  const results: SearchItem[] = [];
  const seen = new Set<string>();
  
  const searchQueries = [query, query + ' 3D printed'];
  
  for (const searchQuery of searchQueries) {
    if (results.length >= 25) break;
    try {
      const res = await fetch('https://www.amazon.com/s?k=' + encodeURIComponent(searchQuery), {
        headers: { 'User-Agent': 'Mozilla/5.0', 'Accept': 'text/html' },
        signal: AbortSignal.timeout(8000)
      });
      if (res.ok) {
        const html = await res.text();
        const imgRegex = /<img[^>]*data-a-dynamic-image[^>]*src="([^"]+)"[^>]*alt="([^"]{10,100})"[^>]*>/gi;
        let match;
        while ((match = imgRegex.exec(html))) {
          const image = match[1].replace(/\\u0026/g, '&');
          const title = match[2].replace(/&quot;/g, '"').replace(/&amp;/g, '&').trim();
          if (title.length > 15 && isValidTitle(title) && is3DPrintRelated(title, query)) {
            const key = title.substring(0, 20).toLowerCase();
            if (!seen.has(key)) {
              seen.add(key);
              results.push({
                id: 'amazon-' + results.length,
                title: title.substring(0, 100),
                price: 0,
                currency: 'USD',
                imageUrl: image.replace('._AC_US40_', '._AC_US200_'),
                itemUrl: 'https://www.amazon.com/s?k=' + encodeURIComponent(title),
                platform: 'amazon',
              });
            }
          }
        }
      }
    } catch (e) { console.error('Amazon error:', e); }
  }
  return results.slice(0, 25);
}

function generateMockResults(platform: 'ebay' | 'etsy', query: string): SearchItem[] {
  return [
    { id: platform + '-1', title: '3D Printed ' + query, price: 29.99, currency: 'USD', itemUrl: 'https://www.' + platform + '.com/search?q=' + query, platform: platform as any },
    { id: platform + '-2', title: 'Custom ' + query + ' - 3D Printed', price: 34.99, currency: 'USD', itemUrl: 'https://www.' + platform + '.com/search?q=' + query, platform: platform as any },
  ];
}

export async function GET(request: NextRequest) {
  const query = request.nextUrl.searchParams.get('q') || '';
  if (!query.trim()) return NextResponse.json({ results: [] });
  
  const results: SearchItem[] = [];
  const amazonResults = await searchAmazon(query);
  results.push(...amazonResults);
  results.push(...generateMockResults('ebay', query));
  results.push(...generateMockResults('etsy', query));
  
  return NextResponse.json({ results });
}
