const fs = require("node:fs");
const path = require("node:path");
const http = require("node:http");
const { URL } = require("node:url");
const { authenticate, destroySession, getBootstrap, login, signup } = require("./mock-store");

const rootDir = path.resolve(__dirname, "..");
const port = Number(process.env.PORT || 4173);
const geminiKey = process.env.GEMINI_API_KEY;
const geminiModel = process.env.GEMINI_MODEL || "gemini-1.5-flash";

const mimeTypes = {
  ".css": "text/css; charset=utf-8",
  ".doc": "application/msword",
  ".html": "text/html; charset=utf-8",
  ".js": "application/javascript; charset=utf-8",
  ".json": "application/json; charset=utf-8",
  ".md": "text/markdown; charset=utf-8",
  ".png": "image/png",
  ".svg": "image/svg+xml",
  ".txt": "text/plain; charset=utf-8"
};

const modelSignals = {
  medical: ["medical", "medicine", "doctor", "triage", "ambulance", "injury", "health", "patient", "clinic"],
  food: ["food", "ration", "meal", "hunger", "nutrition", "kitchen", "grain", "milk", "water"],
  education: ["education", "school", "student", "teaching", "books", "class", "learning", "exam"],
  shelter: ["shelter", "rescue", "flood", "relief camp", "blanket", "housing", "evacuation", "tent"],
  logistics: ["transport", "packing", "distribution", "crowd", "queue", "supply", "warehouse", "delivery"]
};

function sendJson(res, statusCode, payload) {
  res.writeHead(statusCode, { "Content-Type": "application/json; charset=utf-8" });
  res.end(JSON.stringify(payload));
}

function sendText(res, statusCode, text) {
  res.writeHead(statusCode, { "Content-Type": "text/plain; charset=utf-8" });
  res.end(text);
}

function getBearerToken(req) {
  const authHeader = req.headers.authorization || "";
  return authHeader.startsWith("Bearer ") ? authHeader.slice(7) : "";
}

function readJsonBody(req) {
  return new Promise((resolve, reject) => {
    let body = "";
    req.on("data", (chunk) => {
      body += chunk;
      if (body.length > 2_000_000) {
        reject(new Error("Request body too large."));
      }
    });
    req.on("end", () => {
      try {
        resolve(body ? JSON.parse(body) : {});
      } catch {
        reject(new Error("Invalid JSON body."));
      }
    });
    req.on("error", reject);
  });
}

function countSignals(text, signals) {
  return signals.reduce((score, signal) => score + (text.includes(signal) ? 1 : 0), 0);
}

function inferProblemType(text) {
  const scores = Object.entries(modelSignals)
    .filter(([key]) => key !== "logistics")
    .map(([type, signals]) => ({ type, score: countSignals(text, signals) }))
    .sort((a, b) => b.score - a.score);
  return scores[0].score > 0 ? scores[0].type : "food";
}

function inferSkills(text, type) {
  const skills = new Set([type]);
  if (countSignals(text, modelSignals.medical)) skills.add("medical");
  if (countSignals(text, modelSignals.food)) skills.add("food");
  if (countSignals(text, modelSignals.education)) skills.add("teaching");
  if (countSignals(text, modelSignals.shelter)) skills.add("shelter");
  if (countSignals(text, modelSignals.logistics) || skills.size < 2) skills.add("logistics");
  return [...skills].filter((skill) => ["medical", "food", "teaching", "shelter", "logistics"].includes(skill));
}

function inferNumber(text, patterns, fallback) {
  for (const pattern of patterns) {
    const match = text.match(pattern);
    if (match) return Number(match[1]);
  }
  return fallback;
}

function buildRequirements(type, skills, volunteersNeeded, peopleAffected) {
  const requirements = [];
  if (type === "medical" || skills.includes("medical")) requirements.push("Medical triage volunteers and first-aid coordination");
  if (type === "food" || skills.includes("food")) requirements.push(`Food/ration kits for approximately ${peopleAffected} people`);
  if (type === "education" || skills.includes("teaching")) requirements.push("Teaching volunteers, learning material, and attendance tracking");
  if (type === "shelter" || skills.includes("shelter")) requirements.push("Shelter setup, blankets, transport, and rescue coordination");
  if (skills.includes("logistics")) requirements.push("Logistics team for packing, dispatch, and queue control");
  requirements.push(`${volunteersNeeded} volunteers needed for field execution`);
  return [...new Set(requirements)];
}

function buildFallbackReport({ fileName, extractedText, notesText, locationKey, fallbackReport }) {
  if (fallbackReport) {
    return {
      ...fallbackReport,
      aiEngine: "Node backend fallback analyzer",
      modelConfidence: fallbackReport.modelConfidence || "medium"
    };
  }

  const combinedText = `${fileName || ""} ${extractedText || ""} ${notesText || ""}`.toLowerCase();
  const type = inferProblemType(combinedText);
  const skills = inferSkills(combinedText, type);
  const peopleAffected = inferNumber(
    combinedText,
    [/(\d+)\s+(?:people|families|residents|patients|children|students|affected)/, /(?:people|families|residents|patients|children|students|affected)\D{0,12}(\d+)/],
    type === "medical" ? 160 : type === "shelter" ? 220 : 85
  );
  const volunteersNeeded = inferNumber(
    combinedText,
    [/(\d+)\s+(?:volunteers|workers|helpers)/, /(?:volunteers|workers|helpers)\D{0,12}(\d+)/],
    Math.max(8, Math.ceil(peopleAffected / 12))
  );

  return {
    sourceName: fileName || "Demo report",
    type,
    locationKey,
    volunteersNeeded: Math.min(volunteersNeeded, 80),
    peopleAffected,
    skills,
    description: notesText || (extractedText || "").slice(0, 280) || "Document uploaded for prototype NLP analysis.",
    requirements: buildRequirements(type, skills, Math.min(volunteersNeeded, 80), peopleAffected),
    extractedChars: (extractedText || "").length,
    aiEngine: "Node backend fallback analyzer",
    modelConfidence: "medium"
  };
}

function extractJsonObject(text) {
  const start = text.indexOf("{");
  const end = text.lastIndexOf("}");
  if (start === -1 || end === -1 || end <= start) {
    throw new Error("Gemini response did not include JSON.");
  }
  return JSON.parse(text.slice(start, end + 1));
}

async function analyzeWithGemini(input, fallbackReport) {
  if (!geminiKey) {
    return {
      ...fallbackReport,
      aiEngine: "Node backend fallback analyzer",
      aiNote: "Gemini API key not configured on backend."
    };
  }

  const prompt = `
You are the AI analysis layer for AidFlow, an NGO-volunteer coordination platform.
Analyze the field report and return only valid JSON.

Required JSON shape:
{
  "type": "medical | food | education | shelter",
  "peopleAffected": number,
  "volunteersNeeded": number,
  "skills": ["medical", "food", "teaching", "shelter", "logistics"],
  "requirements": ["short actionable requirement"],
  "summary": "one concise operational summary",
  "confidence": "low | medium | high"
}

File name: ${input.fileName || "unknown"}
Report text:
${(input.extractedText || input.notesText || "No readable document text.").slice(0, 9000)}

Extra notes:
${input.notesText || "None"}
`;

  const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${geminiModel}:generateContent?key=${geminiKey}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      contents: [{ role: "user", parts: [{ text: prompt }] }],
      generationConfig: {
        responseMimeType: "application/json",
        temperature: 0.2
      }
    })
  });

  if (!response.ok) {
    throw new Error(`Gemini request failed with ${response.status}.`);
  }

  const payload = await response.json();
  const text = payload.candidates?.[0]?.content?.parts?.map((part) => part.text || "").join("") || "";
  const parsed = extractJsonObject(text);
  const skills = Array.isArray(parsed.skills)
    ? parsed.skills.filter((skill) => ["medical", "food", "teaching", "shelter", "logistics"].includes(skill))
    : fallbackReport.skills;
  const type = ["medical", "food", "education", "shelter"].includes(parsed.type) ? parsed.type : fallbackReport.type;

  return {
    ...fallbackReport,
    type,
    skills: skills.length ? skills : fallbackReport.skills,
    peopleAffected: Number(parsed.peopleAffected) || fallbackReport.peopleAffected,
    volunteersNeeded: Math.min(Number(parsed.volunteersNeeded) || fallbackReport.volunteersNeeded, 80),
    description: parsed.summary || fallbackReport.description,
    requirements: Array.isArray(parsed.requirements) && parsed.requirements.length
      ? parsed.requirements.slice(0, 8)
      : fallbackReport.requirements,
    aiEngine: `Gemini (${geminiModel}) via Node backend`,
    modelConfidence: parsed.confidence || "medium"
  };
}

function serveStaticFile(req, res, pathname) {
  const cleanPath = pathname === "/" ? "/index.html" : pathname;
  const fullPath = path.join(rootDir, cleanPath);
  const normalized = path.normalize(fullPath);

  if (!normalized.startsWith(rootDir)) {
    sendText(res, 403, "Forbidden");
    return;
  }

  fs.readFile(normalized, (error, content) => {
    if (error) {
      sendText(res, 404, "Not found");
      return;
    }

    const extension = path.extname(normalized).toLowerCase();
    res.writeHead(200, { "Content-Type": mimeTypes[extension] || "application/octet-stream" });
    res.end(content);
  });
}

const server = http.createServer(async (req, res) => {
  const requestUrl = new URL(req.url, `http://${req.headers.host}`);
  const pathname = requestUrl.pathname;

  if (req.method === "GET" && pathname === "/health") {
    res.writeHead(200, { "Content-Type": "text/plain" });
    return res.end("OK");
  }

  try {
    if (req.method === "GET" && pathname === "/api/bootstrap") {
      return sendJson(res, 200, getBootstrap());
    }

    if (req.method === "POST" && pathname === "/api/auth/login") {
      const payload = await readJsonBody(req);
      const session = login(payload);
      if (!session) return sendJson(res, 401, { error: "Invalid credentials for prototype login." });
      return sendJson(res, 200, { session });
    }

    if (req.method === "POST" && pathname === "/api/auth/signup") {
      const payload = await readJsonBody(req);
      const session = signup(payload);
      return sendJson(res, 200, { session });
    }

    if (req.method === "POST" && pathname === "/api/auth/logout") {
      destroySession(getBearerToken(req));
      return sendJson(res, 200, { ok: true });
    }

    if (req.method === "POST" && pathname === "/api/analyze-report") {
      const user = authenticate(getBearerToken(req));
      if (!user) return sendJson(res, 401, { error: "Please log in before analyzing a report." });

      const payload = await readJsonBody(req);
      const fallbackReport = buildFallbackReport(payload);

      try {
        const report = await analyzeWithGemini(payload, fallbackReport);
        return sendJson(res, 200, { report });
      } catch (error) {
        return sendJson(res, 200, {
          report: {
            ...fallbackReport,
            aiNote: `${error.message} Backend fallback used.`
          }
        });
      }
    }

    return serveStaticFile(req, res, pathname);
  } catch (error) {
    return sendJson(res, 500, { error: error.message || "Unexpected server error." });
  }
});

server.listen(port, () => {
  console.log(`AidFlow prototype server running at http://localhost:${port}`);
});
