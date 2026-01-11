import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import Replicate from "https://esm.sh/replicate@0.25.2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  // Handle CORS preflight
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const REPLICATE_API_KEY = Deno.env.get("REPLICATE_API_KEY");
    if (!REPLICATE_API_KEY) {
      throw new Error("REPLICATE_API_KEY is not configured");
    }

    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    const authHeader = req.headers.get("Authorization");
    if (!authHeader) {
      throw new Error("No authorization header");
    }

    const { data: { user }, error: authError } = await supabase.auth.getUser(
      authHeader.replace("Bearer ", "")
    );

    if (authError || !user) {
      throw new Error("Unauthorized");
    }

    const body = await req.json();
    const { imageUrl, externalUrl, sourceType, sourceUrl } = body;

    console.log("Extract garment request:", {
      userId: user.id,
      sourceType,
      hasImage: !!imageUrl,
      hasExternalUrl: !!externalUrl,
    });

    let finalImageUrl = imageUrl;

    // If externalUrl is provided, fetch it server-side (bypasses CORS)
    if (externalUrl) {
      console.log("Fetching external URL server-side:", externalUrl);
      
      try {
        const initialResponse = await fetch(externalUrl, {
          headers: {
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
            'Accept': 'text/html,image/*,*/*;q=0.8',
          },
        });

        if (!initialResponse.ok) {
          throw new Error(`Falha ao acessar URL: ${initialResponse.status}`);
        }

        let contentType = initialResponse.headers.get('content-type') || '';
        let imageData: Uint8Array;
        let imageContentType = 'image/jpeg';
        
        // Check if it's an HTML page (product page)
        if (contentType.includes('text/html')) {
          console.log("URL is an HTML page, extracting product image...");
          
          const htmlContent = await initialResponse.text();
          const extractedImageUrl = extractImageFromHtml(htmlContent, externalUrl);
          
          if (!extractedImageUrl) {
            throw new Error(
              'Não foi possível encontrar uma imagem de produto nesta página. ' +
              'Tente usar a URL direta da imagem ou fazer upload de um screenshot.'
            );
          }
          
          console.log("Extracted image URL from HTML:", extractedImageUrl);
          
          // Fetch the actual image
          const imageResponse = await fetch(extractedImageUrl, {
            headers: {
              'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
              'Accept': 'image/*,*/*;q=0.8',
              'Referer': externalUrl,
            },
          });
          
          if (!imageResponse.ok) {
            throw new Error('Não foi possível baixar a imagem do produto');
          }
          
          imageContentType = imageResponse.headers.get('content-type') || 'image/jpeg';
          
          if (!imageContentType.startsWith('image/')) {
            throw new Error('A URL extraída não aponta para uma imagem válida');
          }
          
          const arrayBuffer = await imageResponse.arrayBuffer();
          imageData = new Uint8Array(arrayBuffer);
          
        } else if (contentType.startsWith('image/')) {
          // Direct image URL
          console.log("URL is a direct image");
          imageContentType = contentType;
          const arrayBuffer = await initialResponse.arrayBuffer();
          imageData = new Uint8Array(arrayBuffer);
          
        } else {
          throw new Error(
            'Esta URL não contém uma imagem ou página de produto reconhecível. ' +
            'Tente copiar a URL direta da imagem ou fazer upload de um screenshot.'
          );
        }
        
        // Determine file extension from content type
        const extMap: Record<string, string> = {
          'image/jpeg': 'jpg',
          'image/jpg': 'jpg',
          'image/png': 'png',
          'image/webp': 'webp',
          'image/gif': 'gif',
        };
        const ext = extMap[imageContentType.split(';')[0]] || 'jpg';
        
        const fileName = `${user.id}/external_${Date.now()}.${ext}`;
        
        console.log("Uploading fetched image to storage:", fileName);
        
        const { error: uploadError } = await supabase.storage
          .from('external-garments')
          .upload(fileName, imageData, {
            contentType: imageContentType,
            upsert: false,
          });

        if (uploadError) {
          console.error("Storage upload error:", uploadError);
          throw new Error(`Falha ao salvar imagem: ${uploadError.message}`);
        }

        const { data: { publicUrl } } = supabase.storage
          .from('external-garments')
          .getPublicUrl(fileName);

        finalImageUrl = publicUrl;
        console.log("Image uploaded, public URL:", finalImageUrl);
        
      } catch (fetchError) {
        console.error("Error processing external URL:", fetchError);
        throw new Error(
          fetchError instanceof Error 
            ? fetchError.message
            : 'Não foi possível processar esta URL'
        );
      }
    }

    if (!finalImageUrl) {
      return new Response(
        JSON.stringify({ error: "Image URL or external URL is required" }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 400 }
      );
    }

    const replicate = new Replicate({
      auth: REPLICATE_API_KEY,
    });

    console.log("Removing background from garment image...");

    // Use background removal model to isolate the garment
    const output = await replicate.run(
      "cjwbw/rembg:fb8af171cfa1616ddcf1242c093f9c46bcada5ad4cf6f2fbe8b81b330ec5c003",
      {
        input: {
          image: finalImageUrl,
        },
      }
    );

    console.log("Background removal completed");

    const processedImageUrl = output as string;

    // Detect category based on simple heuristics (could be enhanced with vision AI)
    const detectedCategory = detectCategory(sourceType);

    // Save to external_garments table
    const { data: garment, error: insertError } = await supabase
      .from("external_garments")
      .insert({
        user_id: user.id,
        source_type: sourceType || "url",
        original_image_url: finalImageUrl,
        processed_image_url: processedImageUrl,
        detected_category: detectedCategory,
        source_url: sourceUrl || externalUrl || null,
      })
      .select()
      .single();

    if (insertError) {
      console.error("Error saving garment:", insertError);
      throw new Error("Failed to save extracted garment");
    }

    // Return full garment object for consistency
    return new Response(
      JSON.stringify({
        success: true,
        garment: {
          id: garment.id,
          user_id: garment.user_id,
          source_type: garment.source_type,
          original_image_url: garment.original_image_url,
          processed_image_url: processedImageUrl,
          detected_category: detectedCategory,
          source_url: garment.source_url,
          name: garment.name,
          created_at: garment.created_at,
        },
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("Extract garment error:", error);
    const errorMessage = error instanceof Error ? error.message : "Failed to extract garment";

    return new Response(
      JSON.stringify({
        success: false,
        error: errorMessage,
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 500 }
    );
  }
});

function detectCategory(sourceType: string): string {
  return "upper_body";
}

/**
 * Check if a URL looks like a valid image URL (not JavaScript variable or placeholder)
 */
function isValidImageUrl(url: string): boolean {
  if (!url || url.length < 5) return false;
  
  // Skip JavaScript-like patterns (variables, template literals)
  if (url.includes('productData.') || url.includes('{{') || url.includes('${')) return false;
  if (/^[a-zA-Z_$][a-zA-Z0-9_$]*\./.test(url)) return false; // JS variable pattern
  
  // Must start with http, https, //, or / for relative paths
  if (!url.startsWith('http://') && !url.startsWith('https://') && 
      !url.startsWith('//') && !url.startsWith('/') && !url.startsWith('data:')) {
    // Could be a relative path like "images/product.jpg"
    if (!url.match(/\.(jpg|jpeg|png|gif|webp|svg|avif)/i)) {
      return false;
    }
  }
  
  // Skip data URIs that are too short (placeholders)
  if (url.startsWith('data:') && url.length < 100) return false;
  
  return true;
}

/**
 * Extract product image URL from HTML page using meta tags and common patterns
 */
function extractImageFromHtml(html: string, baseUrl: string): string | null {
  // 1. Try og:image (Open Graph - standard for e-commerce)
  const ogImageMatch = html.match(/<meta\s+(?:property|name)=["']og:image["']\s+content=["']([^"']+)["']/i) 
    || html.match(/<meta\s+content=["']([^"']+)["']\s+(?:property|name)=["']og:image["']/i);
  if (ogImageMatch && ogImageMatch[1] && isValidImageUrl(ogImageMatch[1])) {
    return resolveUrl(ogImageMatch[1], baseUrl);
  }
  
  // 2. Try twitter:image
  const twitterImageMatch = html.match(/<meta\s+(?:property|name)=["']twitter:image["']\s+content=["']([^"']+)["']/i)
    || html.match(/<meta\s+content=["']([^"']+)["']\s+(?:property|name)=["']twitter:image["']/i);
  if (twitterImageMatch && twitterImageMatch[1] && isValidImageUrl(twitterImageMatch[1])) {
    return resolveUrl(twitterImageMatch[1], baseUrl);
  }
  
  // 3. Try product:image (used by some e-commerce platforms)
  const productImageMatch = html.match(/<meta\s+(?:property|name)=["']product:image["']\s+content=["']([^"']+)["']/i)
    || html.match(/<meta\s+content=["']([^"']+)["']\s+(?:property|name)=["']product:image["']/i);
  if (productImageMatch && productImageMatch[1] && isValidImageUrl(productImageMatch[1])) {
    return resolveUrl(productImageMatch[1], baseUrl);
  }
  
  // 4. Look for JSON-LD structured data (common in modern e-commerce)
  const jsonLdMatches = html.matchAll(/<script[^>]*type=["']application\/ld\+json["'][^>]*>([\s\S]*?)<\/script>/gi);
  for (const match of jsonLdMatches) {
    try {
      const jsonData = JSON.parse(match[1]);
      // Handle array of JSON-LD objects
      const items = Array.isArray(jsonData) ? jsonData : [jsonData];
      for (const item of items) {
        if (item.image) {
          const imgUrl = Array.isArray(item.image) ? item.image[0] : 
                        (typeof item.image === 'object' ? item.image.url : item.image);
          if (imgUrl && isValidImageUrl(imgUrl)) {
            return resolveUrl(imgUrl, baseUrl);
          }
        }
      }
    } catch {
      // JSON parse error, continue
    }
  }
  
  // 5. Look for common product image patterns in img tags with src containing http/https
  const imgWithAbsoluteUrl = html.matchAll(/<img[^>]+src=["'](https?:\/\/[^"']+)["'][^>]*>/gi);
  for (const match of imgWithAbsoluteUrl) {
    const src = match[1];
    
    // Skip small images, icons, logos, tracking pixels
    if (src.includes('icon') || src.includes('logo') || src.includes('sprite') || 
        src.includes('avatar') || src.includes('thumb') || src.includes('1x1') ||
        src.includes('pixel') || src.includes('tracking') || src.includes('analytics')) {
      continue;
    }
    
    // Prioritize images with product-related keywords or image extensions
    if (src.match(/\.(jpg|jpeg|png|webp)/i) && 
        (src.includes('product') || src.includes('main') || src.includes('large') || 
         src.includes('zoom') || src.includes('detail') || src.includes('hero') ||
         src.includes('img') || src.includes('image') || src.includes('photo'))) {
      return src;
    }
  }
  
  // 6. Look for data attributes that often contain product images
  const dataImagePatterns = [
    /data-(?:zoom|large|full|original|src|image)=["'](https?:\/\/[^"']+)["']/gi,
    /data-lazy(?:-src)?=["'](https?:\/\/[^"']+)["']/gi,
  ];
  
  for (const pattern of dataImagePatterns) {
    const matches = html.matchAll(pattern);
    for (const match of matches) {
      if (match[1] && isValidImageUrl(match[1])) {
        return match[1];
      }
    }
  }
  
  // 7. Find any large absolute URL image as fallback
  const anyAbsoluteImg = html.matchAll(/["'](https?:\/\/[^"']+\.(?:jpg|jpeg|png|webp)[^"']*)["']/gi);
  for (const match of anyAbsoluteImg) {
    const src = match[1];
    if (isValidImageUrl(src) && !src.includes('icon') && !src.includes('logo') && 
        !src.includes('thumb') && src.length > 30) {
      return src;
    }
  }
  
  return null;
}

/**
 * Resolve relative URLs to absolute URLs
 */
function resolveUrl(url: string, baseUrl: string): string {
  if (url.startsWith('http://') || url.startsWith('https://')) {
    return url;
  }
  if (url.startsWith('//')) {
    return 'https:' + url;
  }
  if (url.startsWith('data:')) {
    return url;
  }
  try {
    return new URL(url, baseUrl).href;
  } catch {
    return url;
  }
}
