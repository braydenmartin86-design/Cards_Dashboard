import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

// "gemini-flash-latest" always points at Google's current Flash model, so this won't break
// when a specific version is retired. Set a GEMINI_MODEL secret to pin a specific model.
const DEFAULT_MODEL = "gemini-flash-latest";

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const body = await req.json();
    const prompt = body.prompt || "Identify this trading card.";
    let imageBase64 = body.imageBase64 || body.image || "";
    const mimeType = body.mimeType || "image/jpeg";

    const apiKey = Deno.env.get("GEMINI_API_KEY");
    if (!apiKey) {
      return new Response(JSON.stringify({ error: "GEMINI_API_KEY is missing in Supabase Secrets." }), {
        status: 200, // Return 200 with error JSON to prevent 500 client crash
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }
    const model = Deno.env.get("GEMINI_MODEL") || DEFAULT_MODEL;

    if (imageBase64.includes(",")) {
      imageBase64 = imageBase64.split(",")[1];
    }

    // Gemini expects the image and prompt as "parts" inside a single content entry.
    const parts: any[] = [];
    if (imageBase64) {
      parts.push({
        inline_data: {
          mime_type: mimeType,
          data: imageBase64,
        },
      });
    }
    parts.push({ text: prompt });
    const contents = [{ role: "user", parts }];

    const geminiRes = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent`,
      {
        method: "POST",
        // Key goes in a header rather than the URL so it doesn't end up in request logs.
        headers: { "Content-Type": "application/json", "x-goog-api-key": apiKey },
        body: JSON.stringify({ contents }),
      }
    );

    const geminiData = await geminiRes.json();

    if (!geminiRes.ok) {
      return new Response(
        JSON.stringify({ error: geminiData.error?.message || `Gemini API returned status ${geminiRes.status}` }),
        {
          status: 200,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    // Newer models can split a reply across several parts; join them so nothing is lost.
    const textOutput = (geminiData?.candidates?.[0]?.content?.parts || [])
      .map((p: any) => p.text || "")
      .join("");

    return new Response(JSON.stringify({ text: textOutput }), {
      status: 200,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (err) {
    return new Response(JSON.stringify({ error: err.message }), {
      status: 200,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
