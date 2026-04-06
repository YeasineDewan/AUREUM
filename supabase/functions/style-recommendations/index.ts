import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const { bodyType, preferredStyle, occasion, measurements, budget, colorPreferences } = await req.json();
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) throw new Error("LOVABLE_API_KEY is not configured");

    // Build detailed body analysis section
    let bodyAnalysis = `- Body Type: ${bodyType || "Not specified"}`;
    if (measurements) {
      const m = measurements;
      bodyAnalysis += `
- Height: ${m.height || "N/A"} cm
- Weight: ${m.weight || "N/A"} kg
- Chest: ${m.chest || "N/A"} cm
- Waist: ${m.waist || "N/A"} cm
- Shoulder Width: ${m.shoulder || "N/A"} cm
- Inseam: ${m.inseam || "N/A"} cm`;

      // Compute proportional insights for the AI
      if (m.chest && m.waist) {
        const dropValue = m.chest - m.waist;
        let dropCategory = "regular";
        if (dropValue >= 16) dropCategory = "athletic (high drop)";
        else if (dropValue >= 12) dropCategory = "slim (moderate drop)";
        else if (dropValue >= 8) dropCategory = "regular";
        else dropCategory = "comfort/relaxed (low drop)";
        bodyAnalysis += `\n- Chest-Waist Drop: ${dropValue} cm → ${dropCategory} fit category`;
      }
      if (m.height && m.inseam) {
        const torsoRatio = ((m.height - m.inseam) / m.height * 100).toFixed(1);
        bodyAnalysis += `\n- Torso-to-Leg Ratio: ${torsoRatio}% torso — ${Number(torsoRatio) > 55 ? "longer torso, consider higher-rise trousers" : Number(torsoRatio) < 50 ? "longer legs, can wear lower-rise with shorter jackets" : "balanced proportions"}`;
      }
      if (m.shoulder && m.waist) {
        const shToWaist = (m.shoulder / m.waist).toFixed(2);
        bodyAnalysis += `\n- Shoulder-to-Waist Ratio: ${shToWaist} — ${Number(shToWaist) > 0.56 ? "V-shaped, emphasize structured shoulders" : Number(shToWaist) < 0.50 ? "rectangular, add structure via padding" : "balanced frame"}`;
      }
      if (m.height && m.weight) {
        const heightM = m.height / 100;
        const bmi = (m.weight / (heightM * heightM)).toFixed(1);
        bodyAnalysis += `\n- BMI: ${bmi} — ${Number(bmi) < 20 ? "lean build, structured fabrics add form" : Number(bmi) > 27 ? "fuller build, draping fabrics and dark tones slim" : "medium build, versatile options"}`;
      }
    }

    const prompt = `You are an expert bespoke menswear style consultant for AUREUM, a luxury tailoring house in Dhaka.
Based on the following detailed client profile and body proportions analysis, provide personalized fabric, color, and silhouette recommendations.

IMPORTANT: Use the body measurements and proportional analysis below to make SPECIFIC silhouette decisions:
- Recommend jacket length, trouser rise, and lapel width based on actual proportions
- Factor chest-waist drop into fit recommendations (slim, regular, comfort)
- Use height and torso ratio to suggest jacket length and trouser break
- Consider shoulder width for padding and structure recommendations

Client Profile:
${bodyAnalysis}
- Preferred Style: ${preferredStyle || "Classic"}
- Occasion: ${occasion || "General wardrobe"}
- Budget Tier: ${budget || "Not specified"}
- Color Preferences: ${colorPreferences?.length ? colorPreferences.join(", ") : "Open to suggestions"}

Provide exactly 4 recommendations. Each should include:
1. A garment type (suit, blazer, shirt, trousers, etc.)
2. Recommended fabric with specific mill/quality (e.g. "Loro Piana Super 150s Wool")
3. Color recommendation with hex code and reasoning
4. Detailed silhouette tip SPECIFIC to their measurements (mention actual cm values, jacket length, trouser rise, etc.)
5. Estimated price range in BDT (format as "25,000 – 45,000")
6. A brief reasoning sentence explaining why this is perfect for their body proportions
7. A fit detail mentioning specific alterations or construction details (e.g. "half-canvas construction with 3cm shoulder extension")

Return as JSON array with fields: garment, fabric, color, tip, priceRange, reasoning, fitDetail`;

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-3-flash-preview",
        messages: [
          { role: "system", content: "You are a luxury menswear consultant specializing in bespoke tailoring. You deeply understand body proportions and how they affect garment construction. Always return valid JSON arrays. Include the fitDetail field in every recommendation." },
          { role: "user", content: prompt },
        ],
        tools: [
          {
            type: "function",
            function: {
              name: "provide_recommendations",
              description: "Return style recommendations with fit details",
              parameters: {
                type: "object",
                properties: {
                  recommendations: {
                    type: "array",
                    items: {
                      type: "object",
                      properties: {
                        garment: { type: "string" },
                        fabric: { type: "string" },
                        color: { type: "string" },
                        tip: { type: "string" },
                        priceRange: { type: "string" },
                        reasoning: { type: "string" },
                        fitDetail: { type: "string" },
                      },
                      required: ["garment", "fabric", "color", "tip", "priceRange", "reasoning", "fitDetail"],
                      additionalProperties: false,
                    },
                  },
                },
                required: ["recommendations"],
                additionalProperties: false,
              },
            },
          },
        ],
        tool_choice: { type: "function", function: { name: "provide_recommendations" } },
      }),
    });

    if (!response.ok) {
      if (response.status === 429) {
        return new Response(JSON.stringify({ error: "Rate limited. Please try again shortly." }), {
          status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      if (response.status === 402) {
        return new Response(JSON.stringify({ error: "AI credits depleted. Please add funds." }), {
          status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      const t = await response.text();
      console.error("AI gateway error:", response.status, t);
      throw new Error("AI gateway error");
    }

    const data = await response.json();
    const toolCall = data.choices?.[0]?.message?.tool_calls?.[0];
    let recommendations = [];
    if (toolCall?.function?.arguments) {
      const parsed = JSON.parse(toolCall.function.arguments);
      recommendations = parsed.recommendations || [];
    }

    return new Response(JSON.stringify({ recommendations }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    console.error("style-recommendations error:", e);
    return new Response(JSON.stringify({ error: e instanceof Error ? e.message : "Unknown error" }), {
      status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
