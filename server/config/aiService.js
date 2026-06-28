const fetch = require("node-fetch");

/**
 * Builds the prompt sent to the AI model for trip generation.
 * Asks for STRICT JSON back so it can be parsed and stored cleanly.
 */
function buildPrompt({ destination, startDate, endDate, members, budget, currency, preferences }) {
  const days = Math.max(
    1,
    Math.ceil((new Date(endDate) - new Date(startDate)) / (1000 * 60 * 60 * 24)) + 1
  );

  return `You are an expert eco-conscious travel planner for an app called MY ECO TRIP.
Plan a sustainable, low-impact trip with the following details:

Destination: ${destination}
Start date: ${startDate}
End date: ${endDate}
Number of days: ${days}
Number of travelers: ${members}
Total budget: ${budget} ${currency || "USD"}
Traveler preferences/notes: ${preferences || "none specified"}

Favor eco-friendly transport, locally-owned accommodation, low-waste activities, and sustainable food choices.
Stay realistic for the stated budget.

Respond with ONLY valid JSON (no markdown fences, no commentary) in exactly this shape:

{
  "summary": "2-3 sentence overview of the trip and its eco focus",
  "ecoScore": 0-100 integer representing how eco-friendly this plan is,
  "bestTimeToVisit": "1 sentence on whether these dates are a good time to visit, with any seasonal notes",
  "localTransportTips": "1-2 sentences on the most eco-friendly way to get around once there (trains, bikes, public transit, etc.)",
  "weatherNotes": "1 sentence on typical weather to expect for this destination and date range",
  "carbonFootprintEstimate": "estimated total CO2 for this trip's transport, e.g. '~180 kg CO2 round trip by train'",
  "stayOptions": [
    {
      "name": "name of a real or realistic eco-friendly hotel/hostel/guesthouse",
      "type": "Hotel | Hostel | Guesthouse | Eco-lodge",
      "pricePerNight": "approximate price per night, e.g. '$60'",
      "whyEco": "1 sentence on why this stay is a sustainable choice"
    }
  ],
  "itinerary": [
    {
      "day": 1,
      "title": "short title for the day",
      "activities": [
        {
          "time": "Morning | Afternoon | Evening",
          "description": "what to do",
          "location": "specific place or neighborhood name"
        }
      ],
      "localFoodHighlight": "one specific local dish or eco-friendly restaurant/market to try this day",
      "ecoTip": "one practical sustainability tip relevant to this day",
      "estimatedCost": "approximate cost for this day, e.g. '$45'"
    }
  ],
  "packingList": ["item 1", "item 2", "item 3"]
}

Include exactly ${days} entries in the itinerary array, one per day, with day numbers 1 through ${days}.
Include 2-4 activities per day, each with its own time of day, description, and location.
Include 2-3 stay options that fit within the stated budget.`;
}

function extractJson(text) {
  // Strip markdown code fences if the model added them despite instructions
  const cleaned = text.replace(/```json/gi, "").replace(/```/g, "").trim();
  const firstBrace = cleaned.indexOf("{");
  const lastBrace = cleaned.lastIndexOf("}");
  if (firstBrace === -1 || lastBrace === -1) {
    throw new Error("AI response did not contain valid JSON.");
  }
  const jsonSlice = cleaned.slice(firstBrace, lastBrace + 1);
  return JSON.parse(jsonSlice);
}

async function callAnthropic(prompt) {
  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) {
    throw new Error("ANTHROPIC_API_KEY is not set in your .env file.");
  }

  const response = await fetch("https://api.anthropic.com/v1/messages", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "x-api-key": apiKey,
      "anthropic-version": "2023-06-01",
    },
    body: JSON.stringify({
      model: "claude-sonnet-4-6",
      max_tokens: 4000,
      messages: [{ role: "user", content: prompt }],
    }),
  });

  if (!response.ok) {
    const errText = await response.text();
    throw new Error(`Anthropic API error (${response.status}): ${errText}`);
  }

  const data = await response.json();
  const textBlock = data.content.find((b) => b.type === "text");
  if (!textBlock) {
    throw new Error("Anthropic response did not include a text block.");
  }
  return textBlock.text;
}

async function callOpenAI(prompt) {
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) {
    throw new Error("OPENAI_API_KEY is not set in your .env file.");
  }

  const response = await fetch("https://api.openai.com/v1/chat/completions", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model: "gpt-4o-mini",
      messages: [{ role: "user", content: prompt }],
      temperature: 0.7,
    }),
  });

  if (!response.ok) {
    const errText = await response.text();
    throw new Error(`OpenAI API error (${response.status}): ${errText}`);
  }

  const data = await response.json();
  return data.choices[0].message.content;
}

async function callGroq(prompt) {
  const apiKey = process.env.GROQ_API_KEY;
  if (!apiKey) {
    throw new Error("GROQ_API_KEY is not set in your .env file.");
  }

  // Groq's chat completions endpoint is OpenAI-compatible.
  // GROQ_MODEL lets you switch models without touching code (see .env).
  const model = process.env.GROQ_MODEL || "openai/gpt-oss-120b";

  const response = await fetch("https://api.groq.com/openai/v1/chat/completions", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model,
      messages: [{ role: "user", content: prompt }],
      temperature: 0.7,
      // Asks Groq to guarantee a JSON object back, removing the need to
      // strip markdown fences for models that support this mode.
      response_format: { type: "json_object" },
    }),
  });

  if (!response.ok) {
    const errText = await response.text();
    throw new Error(`Groq API error (${response.status}): ${errText}`);
  }

  const data = await response.json();
  return data.choices[0].message.content;
}

async function generateTripPlan(tripDetails) {
  const prompt = buildPrompt(tripDetails);
  const provider = (process.env.AI_PROVIDER || "anthropic").toLowerCase();

  let rawText;
  if (provider === "groq") {
    rawText = await callGroq(prompt);
  } else if (provider === "openai") {
    rawText = await callOpenAI(prompt);
  } else {
    rawText = await callAnthropic(prompt);
  }

  const parsed = extractJson(rawText);

  return {
    summary: parsed.summary || "",
    ecoScore: typeof parsed.ecoScore === "number" ? parsed.ecoScore : null,
    bestTimeToVisit: parsed.bestTimeToVisit || "",
    localTransportTips: parsed.localTransportTips || "",
    weatherNotes: parsed.weatherNotes || "",
    carbonFootprintEstimate: parsed.carbonFootprintEstimate || "",
    stayOptions: Array.isArray(parsed.stayOptions) ? parsed.stayOptions : [],
    itinerary: Array.isArray(parsed.itinerary) ? parsed.itinerary : [],
    packingList: Array.isArray(parsed.packingList) ? parsed.packingList : [],
    rawText,
  };
}

module.exports = { generateTripPlan };