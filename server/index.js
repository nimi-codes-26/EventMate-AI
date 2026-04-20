import express from "express";
import cors from "cors";
import fetch from "node-fetch";
import dotenv from "dotenv";
import fs from "fs";
import path from "path";
import { fileURLToPath } from 'url';
import { dirname } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

dotenv.config({ path: './.env', override: true });

// Manual load if dotenv fails
if (!process.env.OPENAI_API_KEY) {
  try {
    const envPath = './.env';
    let envContent = fs.readFileSync(envPath, 'utf8');
    if (envContent.charCodeAt(0) === 0xFEFF) {
      envContent = envContent.slice(1);
    }
    const lines = envContent.split('\n');
    for (const line of lines) {
      const [key, ...valueParts] = line.split('=');
      if (key && valueParts.length) {
        const value = valueParts.join('=').trim();
        process.env[key.trim()] = value;
      }
    }
  } catch (error) {
    console.error("Failed to load .env manually:", error.message);
  }
}

const app = express();
app.use(cors());
app.use(express.json());

// Serve static files from the built frontend
app.use(express.static(path.join(__dirname, '../dist')));

const GEMINI_API_KEY = process.env.GEMINI_API_KEY?.trim();
const GEMINI_API_URL =
  process.env.GEMINI_API_URL?.trim() ||
  "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-pro:generateContent";

const OPENAI_API_KEY = process.env.OPENAI_API_KEY?.trim();

console.log("OPENAI_API_KEY loaded:", OPENAI_API_KEY ? "yes" : "no");
console.log("OPENAI_API_KEY starts with sk-:", OPENAI_API_KEY?.startsWith("sk-"));

const systemPrompt = `You are EventMate AI, a premium AI assistant for conference and event management.
You help users with event discovery, schedule planning, booking guidance, venue navigation, and speaker information.
Always be helpful, accurate, and professional. If you do not know the answer, say so and provide useful guidance instead of guessing.`;

const getFallbackResponse = (message) => {
  const lowerMessage = message.toLowerCase();

  if (lowerMessage.includes("hello") || lowerMessage.includes("hi")) {
    return "Hello! I'm EventMate AI. I can help you discover events, build your schedule, and guide you through bookings. What would you like help with?";
  }

  if (lowerMessage.includes("recommend") && lowerMessage.includes("event")) {
    return "Use the Events Calendar and filter by time or topic to find the best sessions. I can help you choose the right events for your interests.";
  }

  if (lowerMessage.includes("schedule") || lowerMessage.includes("agenda")) {
    return "You can build a personalized schedule in My Schedule. Pick events that fit your timeline and avoid overlaps for the smoothest experience.";
  }

  if (lowerMessage.includes("book") || lowerMessage.includes("register") || lowerMessage.includes("reserve")) {
    return "Booking is handled in the Upcoming Events section. Select the session you want and confirm your registration there. If you need help, tell me the session name or time.";
  }

  if (lowerMessage.includes("venue") || lowerMessage.includes("location")) {
    return "Venue details are available in the Hall Details section. I can help you find the right room and the best route between sessions.";
  }

  if (lowerMessage.includes("speaker") || lowerMessage.includes("presenter")) {
    return "Speaker and session information is available in the event details. Ask me about any session and I can tell you how it fits into your schedule.";
  }

  if (lowerMessage.includes("help") || lowerMessage.includes("what can you do")) {
    return "I can help you discover events, organize your schedule, book sessions, and answer event logistics questions. My full Gemini-powered AI will be available once the API is configured.";
  }

  return "I can still help you with event planning and scheduling while the AI service is being configured. Ask me about events, bookings, or how to make the most of the platform.";
};

const parseGeminiReply = (data) => {
  if (!data) return null;

  const findText = (item) => {
    if (!item) return null;
    if (typeof item.text === "string") return item.text;
    if (typeof item.outputText === "string") return item.outputText;
    if (typeof item.content === "string") return item.content;
    if (Array.isArray(item.content)) {
      for (const child of item.content) {
        if (child?.type === "text" && typeof child.text === "string") return child.text;
        if (typeof child?.text === "string") return child.text;
        const nested = findText(child);
        if (nested) return nested;
      }
    }
    if (Array.isArray(item.responses)) {
      for (const response of item.responses) {
        const found = findText(response);
        if (found) return found;
      }
    }
    return null;
  };

  const candidate = data?.candidates?.[0] || data?.output?.[0] || data?.responses?.[0] || data;
  if (!candidate) return null;

  return (
    findText(candidate) ||
    findText(data) ||
    candidate?.text ||
    candidate?.output?.text ||
    candidate?.content?.[0]?.text ||
    candidate?.content?.parts?.[0]?.text ||
    data?.output?.[0]?.content?.[0]?.text ||
    null
  );
};

const buildGeminiPayload = (message) => {
  const promptText = `${systemPrompt}\n\nUser: ${message}\n\nAssistant:`;
  const usesGenerateContent = GEMINI_API_URL.includes(":generateContent");

  if (usesGenerateContent) {
    return {
      contents: [
        {
          parts: [
            {
              text: promptText,
            },
          ],
        },
      ],
      generationConfig: {
        temperature: 0.25,
        maxOutputTokens: 520,
        topP: 0.92,
        topK: 40,
      },
    };
  }

  return {
    prompt: {
      text: promptText,
    },
    temperature: 0.25,
    maxOutputTokens: 520,
    topP: 0.92,
    topK: 40,
    candidateCount: 1,
  };
};

const buildOpenAIPayload = (message) => {
  return {
    model: "gpt-3.5-turbo",
    messages: [
      {
        role: "system",
        content: systemPrompt,
      },
      {
        role: "user",
        content: message,
      },
    ],
    max_tokens: 520,
    temperature: 0.25,
    top_p: 0.92,
  };
};

const parseOpenAIReply = (data) => {
  return data?.choices?.[0]?.message?.content || null;
};

const hasGeminiKey = Boolean(GEMINI_API_KEY) && GEMINI_API_KEY !== "YOUR_GEMINI_API_KEY_HERE";
const isBearerKey = hasGeminiKey && GEMINI_API_KEY.startsWith("ya29.");
const isApiKey = hasGeminiKey && !isBearerKey;

const hasOpenAIKey = Boolean(OPENAI_API_KEY) && OPENAI_API_KEY.startsWith("sk-");

if (!hasGeminiKey && !hasOpenAIKey) {
  console.warn("No AI API keys configured. The chat endpoint will use fallback responses.");
} else if (!hasGeminiKey) {
  console.warn("Gemini API key not configured. Will use OpenAI if available.");
} else if (!hasOpenAIKey) {
  console.warn("OpenAI API key not configured. Will use Gemini if available.");
}

const buildGeminiHeaders = () => {
  const headers = {
    "Content-Type": "application/json",
  };

  if (isBearerKey) {
    headers.Authorization = `Bearer ${GEMINI_API_KEY}`;
  }

  return headers;
};

const buildGeminiEndpoint = () => {
  if (isApiKey) {
    const separator = GEMINI_API_URL.includes("?") ? "&" : "?";
    return `${GEMINI_API_URL}${separator}key=${encodeURIComponent(GEMINI_API_KEY.trim())}`;
  }

  return GEMINI_API_URL;
};

app.get("/api/health", (req, res) => {
  const geminiConfigured = hasGeminiKey;
  const openaiConfigured = hasOpenAIKey;

  res.json({
    status: "ok",
    backend: true,
    geminiConfigured,
    openaiConfigured,
    authType: isBearerKey ? "bearer" : isApiKey ? "apiKey" : "none",
    geminiUrl: GEMINI_API_URL,
    message: geminiConfigured || openaiConfigured ? "AI backend ready" : "Valid AI API key required"
  });
});

const callAIService = async (service, message) => {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 30000);

  let response, data;

  if (service === "gemini") {
    const payload = buildGeminiPayload(message);
    const endpoint = buildGeminiEndpoint();

    response = await fetch(endpoint, {
      method: "POST",
      headers: buildGeminiHeaders(),
      body: JSON.stringify(payload),
      signal: controller.signal,
    });
  } else if (service === "openai") {
    const payload = buildOpenAIPayload(message);

    response = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${OPENAI_API_KEY}`,
      },
      body: JSON.stringify(payload),
      signal: controller.signal,
    });
  }

  clearTimeout(timeoutId);

  const rawBody = await response.text();

  try {
    data = rawBody ? JSON.parse(rawBody) : null;
  } catch (parseError) {
    console.error(`Failed to parse ${service} response as JSON:`, rawBody.substring(0, 200));
    throw new Error(`Invalid response from ${service}`);
  }

  if (!response.ok) {
    const errorMessage = data?.error?.message || data?.error?.status || rawBody || `${service} request failed`;
    throw new Error(`${service}: ${errorMessage}`);
  }

  const parsedReply = service === "gemini" ? parseGeminiReply(data) : parseOpenAIReply(data);
  return parsedReply;
};

app.post("/api/chat", async (req, res) => {
  try {
    const { message } = req.body;

    if (!message || typeof message !== "string") {
      return res.status(400).json({ reply: "Please send a valid message." });
    }

    let reply = null;
    let triedGemini = false;
    let triedOpenAI = false;

    // Try Gemini first if configured
    if (hasGeminiKey) {
      try {
        reply = await callAIService("gemini", message);
        triedGemini = true;
      } catch (error) {
        console.error("Gemini error:", error.message);
        const errorMsg = error.message.toUpperCase();
        if (
          errorMsg.includes("QUOTA") ||
          errorMsg.includes("RATE_LIMIT") ||
          errorMsg.includes("RESOURCE_EXHAUSTED") ||
          errorMsg.includes("429")
        ) {
          // Quota issue, try OpenAI if available
          if (hasOpenAIKey) {
            try {
              reply = await callAIService("openai", message);
              triedOpenAI = true;
            } catch (openaiError) {
              console.error("OpenAI error:", openaiError.message);
              triedOpenAI = true;
            }
          }
        }
      }
    }

    // If Gemini not tried or failed, try OpenAI
    if (!reply && hasOpenAIKey && !triedOpenAI) {
      try {
        reply = await callAIService("openai", message);
        triedOpenAI = true;
      } catch (error) {
        console.error("OpenAI error:", error.message);
      }
    }

    // Use fallback if no AI worked
    if (!reply) {
      reply = getFallbackResponse(message);
    }

    res.json({ reply });
  } catch (error) {
    console.error("Chat endpoint error:", error);
    const reply = getFallbackResponse(req.body?.message || "");
    res.json({ reply });
  }
});

const PORT = process.env.PORT || 5000;

// Catch-all route for SPA - serve index.html for non-API routes
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, '../dist/index.html'));
});

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
