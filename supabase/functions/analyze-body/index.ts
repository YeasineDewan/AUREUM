import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { imageBase64 } = await req.json();
    if (!imageBase64) {
      return new Response(JSON.stringify({ error: "No image provided" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) {
      throw new Error("LOVABLE_API_KEY is not configured");
    }

    const response = await fetch(
      "https://ai.gateway.lovable.dev/v1/chat/completions",
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${LOVABLE_API_KEY}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          model: "google/gemini-2.5-flash",
          messages: [
            {
              role: "system",
              content: `You are a professional tailor's AI assistant that analyzes body photos to estimate measurements. 
              
Given a full-body photo, estimate the following measurements in inches. Use visual proportions, body landmarks, and standard anthropometric ratios. Be reasonable and conservative.

Return ONLY a valid JSON object with these exact keys:
{
  "height": number (total height in inches),
  "chest": number (chest circumference),
  "waist": number (waist circumference),
  "hips": number (hip circumference),
  "shoulders": number (shoulder width),
  "sleeveLength": number (shoulder to wrist),
  "inseam": number (inner leg length),
  "neck": number (neck circumference),
  "armLength": number (full arm length),
  "thigh": number (thigh circumference),
  "bodyType": string (one of: "slim", "athletic", "average", "broad", "heavy"),
  "confidence": number (0 to 1, how confident you are),
  "notes": string (brief observations about fit recommendations)
}

If you cannot see enough of the body, still provide best estimates and lower the confidence score. Always return valid JSON, nothing else.`,
            },
            {
              role: "user",
              content: [
                {
                  type: "text",
                  text: "Analyze this photo and estimate body measurements for tailoring. Provide all measurements in inches.",
                },
                {
                  type: "image_url",
                  image_url: {
                    url: imageBase64.startsWith("data:")
                      ? imageBase64
                      : `data:image/jpeg;base64,${imageBase64}`,
                  },
                },
              ],
            },
          ],
        }),
      }
    );

    if (!response.ok) {
      if (response.status === 429) {
        return new Response(
          JSON.stringify({ error: "Rate limit exceeded. Please try again in a moment." }),
          { status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      if (response.status === 402) {
        return new Response(
          JSON.stringify({ error: "AI usage limit reached. Please add credits." }),
          { status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      const errorText = await response.text();
      console.error("AI gateway error:", response.status, errorText);
      throw new Error(`AI gateway error: ${response.status}`);
    }

    const data = await response.json();
    const content = data.choices?.[0]?.message?.content || "";

    // Parse JSON from the response (handle markdown code blocks)
    let measurements;
    try {
      const jsonMatch = content.match(/```(?:json)?\s*([\s\S]*?)\s*```/) || [null, content];
      measurements = JSON.parse(jsonMatch[1] || content);
    } catch {
      console.error("Failed to parse AI response:", content);
      return new Response(
        JSON.stringify({ error: "Could not parse measurements from photo. Please try a clearer full-body photo." }),
        { status: 422, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    return new Response(JSON.stringify({ measurements }), {
      status: 200,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    console.error("analyze-body error:", e);
    return new Response(
      JSON.stringify({ error: e instanceof Error ? e.message : "Unknown error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
