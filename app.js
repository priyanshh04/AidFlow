const defaultLocations = {
  "sector-62": { name: "Sector 62, Noida", lat: 28.628, lng: 77.364 },
  botanical: { name: "Botanical Garden, Noida", lat: 28.563, lng: 77.334 },
  "pari-chowk": { name: "Pari Chowk, Greater Noida", lat: 28.465, lng: 77.511 },
  vaishali: { name: "Vaishali, Ghaziabad", lat: 28.649, lng: 77.339 },
  "connaught-place": { name: "Connaught Place, Delhi", lat: 28.631, lng: 77.216 },
  dwarka: { name: "Dwarka, Delhi", lat: 28.592, lng: 77.046 },
  gurugram: { name: "Gurugram Sector 29", lat: 28.469, lng: 77.063 },
  faridabad: { name: "Faridabad NIT", lat: 28.408, lng: 77.317 },
  rohini: { name: "Rohini, Delhi", lat: 28.738, lng: 77.082 }
};

const defaultSearchLocations = [
  ...Object.values(defaultLocations),
  { name: "India Gate, Delhi", lat: 28.613, lng: 77.229 },
  { name: "Akshardham, Delhi", lat: 28.612, lng: 77.277 },
  { name: "Lajpat Nagar, Delhi", lat: 28.567, lng: 77.243 }
];

const defaultVolunteers = [
  { id: "vol-1", name: "Aarav Singh", skills: ["medical", "logistics"], location: "sector-62", available: true, tasks: 21 },
  { id: "vol-2", name: "Meera Khan", skills: ["food", "logistics"], location: "botanical", available: true, tasks: 18 },
  { id: "vol-3", name: "Rohan Patel", skills: ["teaching", "food"], location: "vaishali", available: true, tasks: 14 },
  { id: "vol-4", name: "Isha Verma", skills: ["medical", "food"], location: "sector-62", available: true, tasks: 27 },
  { id: "vol-5", name: "Kabir Rao", skills: ["logistics", "shelter"], location: "pari-chowk", available: true, tasks: 9 },
  { id: "vol-6", name: "Naina Das", skills: ["teaching", "logistics"], location: "botanical", available: false, tasks: 11 },
  { id: "vol-7", name: "Dev Malhotra", skills: ["food", "shelter"], location: "vaishali", available: true, tasks: 16 },
  { id: "vol-8", name: "Sara John", skills: ["medical", "teaching"], location: "sector-62", available: true, tasks: 24 },
  { id: "vol-9", name: "Tara Bhasin", skills: ["food", "logistics"], location: "connaught-place", available: true, tasks: 13 },
  { id: "vol-10", name: "Arjun Sethi", skills: ["shelter", "logistics"], location: "dwarka", available: true, tasks: 19 },
  { id: "vol-11", name: "Leena Thomas", skills: ["medical", "food"], location: "faridabad", available: true, tasks: 17 },
  { id: "vol-12", name: "Mihir Gupta", skills: ["teaching", "logistics"], location: "rohini", available: true, tasks: 8 }
];

const defaultNgos = [
  { id: "ngo-1", name: "CareBridge Foundation", focus: ["food", "medical"], location: "sector-62" },
  { id: "ngo-2", name: "Udaan Learning Trust", focus: ["education", "teaching"], location: "botanical" },
  { id: "ngo-3", name: "Seva Relief Network", focus: ["shelter", "logistics"], location: "pari-chowk" },
  { id: "ngo-4", name: "Asha Community Kitchen", focus: ["food", "logistics"], location: "vaishali" },
  { id: "ngo-5", name: "HealthFirst Camp", focus: ["medical"], location: "sector-62" },
  { id: "ngo-6", name: "Delhi Relief Collective", focus: ["food", "logistics"], location: "connaught-place" },
  { id: "ngo-7", name: "ShelterWorks NCR", focus: ["shelter", "logistics"], location: "dwarka" },
  { id: "ngo-8", name: "BrightPath Tutors", focus: ["education", "teaching"], location: "rohini" }
];

const modelSignals = {
  medical: ["medical", "medicine", "doctor", "triage", "ambulance", "injury", "health", "patient", "clinic"],
  food: ["food", "ration", "meal", "hunger", "nutrition", "kitchen", "grain", "milk", "water"],
  education: ["education", "school", "student", "teaching", "books", "class", "learning", "exam"],
  shelter: ["shelter", "rescue", "flood", "relief camp", "blanket", "housing", "evacuation", "tent"],
  logistics: ["transport", "packing", "distribution", "crowd", "queue", "supply", "warehouse", "delivery"]
};

const form = document.querySelector("#reportForm");
const authScreen = document.querySelector("#authScreen");
const appShell = document.querySelector("#appShell");
const authForm = document.querySelector("#authForm");
const authSubmit = document.querySelector("#authSubmit");
const accountType = document.querySelector("#accountType");
const orgName = document.querySelector("#orgName");
const orgNameWrap = document.querySelector("#orgNameWrap");
const signedInName = document.querySelector("#signedInName");
const signedInRole = document.querySelector("#signedInRole");
const reportFile = document.querySelector("#reportFile");
const reportNotes = document.querySelector("#reportNotes");
const fileName = document.querySelector("#fileName");
const urgencyBadge = document.querySelector("#urgencyBadge");
const analysisSummary = document.querySelector("#analysisSummary");
const volunteerList = document.querySelector("#volunteerList");
const ngoList = document.querySelector("#ngoList");
const activityLog = document.querySelector("#activityLog");
const mapCanvas = document.querySelector("#mapCanvas");
const mapMode = document.querySelector("#mapMode");
const mapSearchForm = document.querySelector("#mapSearchForm");
const mapSearchInput = document.querySelector("#mapSearchInput");
const radiusLabel = document.querySelector("#radiusLabel");

let locations = { ...defaultLocations };
let searchLocations = [...defaultSearchLocations];
let volunteers = [...defaultVolunteers];
let ngos = [...defaultNgos];
let authMode = "login";
let session = null;
let activeSearchCenter = defaultLocations["sector-62"];
let activeReport = buildFallbackReport();

function buildFallbackReport() {
  return {
    sourceName: "Prototype sample",
    type: "food",
    locationKey: "sector-62",
    volunteersNeeded: 12,
    peopleAffected: 85,
    skills: ["food", "logistics"],
    description: reportNotes.value.trim(),
    requirements: ["Dry ration kits", "Packing and sorting team", "Last-mile distribution volunteers"],
    aiEngine: "Server fallback analyzer",
    modelConfidence: "medium"
  };
}

function escapeHtml(value) {
  return String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

function getStoredSession() {
  const raw = localStorage.getItem("aidflow-session");
  if (!raw) return null;
  try {
    return JSON.parse(raw);
  } catch {
    return null;
  }
}

function setStoredSession(nextSession) {
  session = nextSession;
  if (nextSession) {
    localStorage.setItem("aidflow-session", JSON.stringify(nextSession));
  } else {
    localStorage.removeItem("aidflow-session");
  }
}

async function apiRequest(path, options = {}) {
  const headers = { "Content-Type": "application/json", ...(options.headers || {}) };
  if (session?.token) {
    headers.Authorization = `Bearer ${session.token}`;
  }

  const response = await fetch(path, { ...options, headers });
  if (!response.ok) {
    const errorPayload = await response.json().catch(() => ({ error: "Request failed." }));
    throw new Error(errorPayload.error || `Request failed with ${response.status}.`);
  }

  return response.json();
}

async function bootstrapData() {
  try {
    const payload = await apiRequest("/api/bootstrap");
    locations = payload.locations || locations;
    searchLocations = payload.searchLocations || searchLocations;
    volunteers = payload.volunteers || volunteers;
    ngos = payload.ngos || ngos;
  } catch (error) {
    appendActivity(`Bootstrap fallback active. ${error.message}`);
  }
}

function syncLocationOptions() {
  const locationSelect = document.querySelector("#location");
  locationSelect.innerHTML = Object.entries(locations)
    .map(([key, value]) => `<option value="${escapeHtml(key)}">${escapeHtml(value.name)}</option>`)
    .join("");
  locationSelect.value = activeReport.locationKey;
}

function haversineKm(a, b) {
  const radius = 6371;
  const dLat = ((b.lat - a.lat) * Math.PI) / 180;
  const dLng = ((b.lng - a.lng) * Math.PI) / 180;
  const lat1 = (a.lat * Math.PI) / 180;
  const lat2 = (b.lat * Math.PI) / 180;
  const curve = Math.sin(dLat / 2) ** 2 + Math.cos(lat1) * Math.cos(lat2) * Math.sin(dLng / 2) ** 2;
  return radius * 2 * Math.atan2(Math.sqrt(curve), Math.sqrt(1 - curve));
}

function geocodeSearch(query) {
  const normalized = query.trim().toLowerCase();
  const known = searchLocations.find((place) => place.name.toLowerCase().includes(normalized));
  if (known) return known;

  const hash = [...normalized].reduce((sum, char) => sum + char.charCodeAt(0), 0);
  return {
    name: query.trim() || "Custom search area",
    lat: 28.58 + ((hash % 90) - 45) / 1000,
    lng: 77.24 + ((hash % 130) - 65) / 1000
  };
}

function getEntityPoint(entity) {
  return locations[entity.location];
}

function withDistance(entity, center) {
  const point = getEntityPoint(entity);
  const distance = haversineKm(center, point);
  return { ...entity, distance, point };
}

function toMapPosition(point, center) {
  const kmPerLng = 111 * Math.cos((center.lat * Math.PI) / 180);
  const x = 50 + ((point.lng - center.lng) * kmPerLng * 42) / 25;
  const y = 50 - ((point.lat - center.lat) * 111 * 42) / 25;
  return {
    x: Math.max(6, Math.min(94, x)),
    y: Math.max(8, Math.min(92, y))
  };
}

async function readDocumentText(file) {
  if (!file) return "";
  const buffer = await file.arrayBuffer();
  const decoded = new TextDecoder("utf-8", { fatal: false }).decode(new Uint8Array(buffer));
  const readable = decoded.replace(/[^\x09\x0A\x0D\x20-\x7E]+/g, " ").replace(/\s+/g, " ").trim();
  return readable.length > 60 ? readable.slice(0, 7000) : "";
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

function buildFallbackAnalysis(file, extractedText, notesText, locationKey) {
  const combinedText = `${file?.name || ""} ${extractedText} ${notesText}`.toLowerCase();
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
    sourceName: file?.name || "Demo report",
    type,
    locationKey,
    volunteersNeeded: Math.min(volunteersNeeded, 80),
    peopleAffected,
    skills,
    description: notesText || extractedText.slice(0, 280) || "Document uploaded for prototype NLP analysis.",
    requirements: buildRequirements(type, skills, Math.min(volunteersNeeded, 80), peopleAffected),
    extractedChars: extractedText.length,
    aiEngine: "Server fallback analyzer",
    modelConfidence: "medium"
  };
}

async function analyzeUploadedReport(file) {
  const extractedText = await readDocumentText(file);
  const notesText = reportNotes.value.trim();
  const locationKey = document.querySelector("#location").value;
  const fallbackReport = buildFallbackAnalysis(file, extractedText, notesText, locationKey);

  try {
    const payload = await apiRequest("/api/analyze-report", {
      method: "POST",
      body: JSON.stringify({
        fileName: file?.name || "unknown",
        extractedText,
        notesText,
        locationKey,
        fallbackReport
      })
    });
    return payload.report || fallbackReport;
  } catch (error) {
    return {
      ...fallbackReport,
      aiNote: `${error.message} Server fallback used.`
    };
  }
}

function scoreUrgency(report) {
  const text = `${report.type} ${report.description} ${report.requirements.join(" ")}`.toLowerCase();
  const urgentWords = ["urgent", "emergency", "critical", "immediate", "medical", "rescue", "many", "shortage"];
  const keywordScore = urgentWords.reduce((score, word) => score + (text.includes(word) ? 1 : 0), 0);
  const peopleScore = report.peopleAffected >= 250 ? 3 : report.peopleAffected >= 100 ? 2 : report.peopleAffected >= 35 ? 1 : 0;
  const volunteerScore = report.volunteersNeeded >= 25 ? 2 : report.volunteersNeeded >= 10 ? 1 : 0;
  const total = keywordScore + peopleScore + volunteerScore;

  if (total >= 7) return { label: "High", className: "high", score: total };
  if (total >= 4) return { label: "Medium", className: "medium", score: total };
  return { label: "Low", className: "low", score: total };
}

function skillOverlap(required, available) {
  return required.filter((skill) => available.includes(skill)).length;
}

function rankVolunteers(report) {
  return volunteers
    .filter((volunteer) => volunteer.available)
    .map((volunteer) => withDistance(volunteer, locations[report.locationKey]))
    .filter((volunteer) => volunteer.distance <= 25)
    .map((volunteer) => {
      const overlap = skillOverlap(report.skills, volunteer.skills);
      const locationBoost = volunteer.location === report.locationKey ? 18 : 0;
      const score = overlap * 34 + Math.max(0, 22 - volunteer.distance * 3) + locationBoost + volunteer.tasks * 0.6;
      return { ...volunteer, overlap, score: Math.round(score) };
    })
    .filter((volunteer) => volunteer.overlap > 0)
    .sort((a, b) => b.score - a.score)
    .slice(0, Math.min(report.volunteersNeeded, 5));
}

function rankNgos(report) {
  return ngos
    .map((ngo) => withDistance(ngo, locations[report.locationKey]))
    .filter((ngo) => ngo.distance <= 25)
    .map((ngo) => {
      const overlap = skillOverlap([report.type, ...report.skills], ngo.focus);
      const locationBoost = ngo.location === report.locationKey ? 20 : 0;
      const score = overlap * 38 + Math.max(0, 18 - ngo.distance * 2) + locationBoost;
      return { ...ngo, overlap, score: Math.round(score) };
    })
    .filter((ngo) => ngo.overlap > 0)
    .sort((a, b) => b.score - a.score)
    .slice(0, 3);
}

function renderAnalysis(report, urgency) {
  analysisSummary.innerHTML = `
    <div class="requirement-grid">
      <span><b>Source</b>${escapeHtml(report.sourceName)}</span>
      <span><b>Need</b>${escapeHtml(report.type)}</span>
      <span><b>Affected</b>${report.peopleAffected} people</span>
      <span><b>Volunteers</b>${report.volunteersNeeded}</span>
    </div>
    <div class="person-meta">${report.skills.map((skill) => `<span>${escapeHtml(skill)}</span>`).join("")}</div>
    <ul class="requirements-list">
      ${report.requirements.map((item) => `<li>${escapeHtml(item)}</li>`).join("")}
    </ul>
    <p class="model-note">AI engine: ${escapeHtml(report.aiEngine || "Server fallback analyzer")} - confidence: ${escapeHtml(report.modelConfidence || (urgency.score >= 7 ? "high" : "medium"))}${
      report.extractedChars ? `; ${report.extractedChars} readable characters extracted.` : "; using filename and notes because binary document text was limited."
    }${report.aiNote ? ` ${escapeHtml(report.aiNote)}` : ""}</p>
  `;
}

function renderPersonList(container, items, type) {
  container.innerHTML = items
    .map((item) => {
      const labels = type === "volunteer" ? item.skills : item.focus;
      const action = type === "volunteer" ? "Notify volunteer" : "Request support";
      const itemKind = type === "volunteer" ? "volunteer" : "ngo";
      return `
        <article class="person-card">
          <div class="person-top">
            <div>
              <strong>${escapeHtml(item.name)}</strong>
              <span>${item.distance.toFixed(1)} km away - score ${item.score}</span>
            </div>
            <button class="ghost-button action-button" type="button" data-kind="${itemKind}" data-name="${escapeHtml(item.name)}">${action}</button>
          </div>
          <div class="person-meta">
            ${labels.map((label) => `<span>${escapeHtml(label)}</span>`).join("")}
          </div>
          <p>${type === "volunteer" ? `${item.tasks} completed tasks in contribution history.` : "Can coordinate resources with the reporting NGO."}</p>
        </article>
      `;
    })
    .join("");
}

function getRadiusResults(center) {
  return {
    volunteers: volunteers
      .filter((volunteer) => volunteer.available)
      .map((volunteer) => withDistance(volunteer, center))
      .filter((volunteer) => volunteer.distance <= 25)
      .sort((a, b) => a.distance - b.distance),
    ngos: ngos
      .map((ngo) => withDistance(ngo, center))
      .filter((ngo) => ngo.distance <= 25)
      .sort((a, b) => a.distance - b.distance)
  };
}

function addMarker(kind, label, x, y, title) {
  const marker = document.createElement("div");
  marker.className = `marker ${kind}`;
  marker.textContent = label;
  marker.title = title;
  marker.style.left = `${x}%`;
  marker.style.top = `${y}%`;
  mapCanvas.appendChild(marker);
}

function renderFallbackMap(report) {
  const reportLocation = locations[report.locationKey];
  const radiusResults = getRadiusResults(activeSearchCenter);
  const searchPoint = toMapPosition(activeSearchCenter, activeSearchCenter);
  const issuePoint = toMapPosition(reportLocation, activeSearchCenter);

  mapCanvas.innerHTML = `
    <div class="map-grid"></div>
    <div class="road road-a"></div>
    <div class="road road-b"></div>
    <div class="road road-c"></div>
    <div class="radius-ring"></div>
    <div class="map-search-label">${escapeHtml(activeSearchCenter.name)}</div>
  `;

  addMarker("issue", "!", issuePoint.x, issuePoint.y, reportLocation.name);
  addMarker("search", "25", searchPoint.x, searchPoint.y, "Search center");

  radiusResults.volunteers.slice(0, 8).forEach((volunteer, index) => {
    const point = toMapPosition(volunteer.point, activeSearchCenter);
    addMarker("volunteer", `V${index + 1}`, point.x, point.y, `${volunteer.name} - ${volunteer.distance.toFixed(1)} km`);
  });

  radiusResults.ngos.slice(0, 6).forEach((ngo, index) => {
    const point = toMapPosition(ngo.point, activeSearchCenter);
    addMarker("ngo", `N${index + 1}`, point.x, point.y, `${ngo.name} - ${ngo.distance.toFixed(1)} km`);
  });

  mapMode.textContent = "25 km radius";
  radiusLabel.textContent = `${radiusResults.ngos.length} NGOs and ${radiusResults.volunteers.length} volunteers within 25 km`;
}

function writeActivity(report, urgency, matchedVolunteers, matchedNgos) {
  const location = locations[report.locationKey].name;
  const lines = [
    `Document ingested: ${report.sourceName}.`,
    `AI extracted ${report.type} need for ${location}.`,
    `Urgency classified as ${urgency.label.toLowerCase()} with score ${urgency.score}.`,
    `${matchedVolunteers.length} nearby volunteers matched by skills, distance, and availability.`,
    `${matchedNgos.length} NGO partners prepared for collaboration notification.`
  ];
  activityLog.innerHTML = lines.map((line) => `<li>${escapeHtml(line)}</li>`).join("");
}

function appendActivity(line) {
  const item = document.createElement("li");
  item.textContent = line;
  activityLog.prepend(item);
}

function updateMetrics(matchedVolunteers, matchedNgos) {
  document.querySelector("#availableVolunteers").textContent = volunteers.filter((volunteer) => volunteer.available).length;
  document.querySelector("#partnerNgos").textContent = ngos.length;
  document.querySelector("#openReports").textContent = 4;
  const avg = matchedVolunteers.length
    ? matchedVolunteers.reduce((sum, volunteer) => sum + volunteer.distance, 0) / matchedVolunteers.length
    : 0;
  document.querySelector("#avgRadius").textContent = `${avg.toFixed(1)} km`;
  document.querySelector("#matchCount").textContent = `${matchedVolunteers.length} matched`;
  document.querySelector("#ngoCount").textContent = `${matchedNgos.length} notified`;
}

function renderAll(report) {
  const urgency = scoreUrgency(report);
  const matchedVolunteers = rankVolunteers(report);
  const matchedNgos = rankNgos(report);

  urgencyBadge.textContent = urgency.label;
  urgencyBadge.className = `status-pill ${urgency.className}`;
  renderAnalysis(report, urgency);
  renderPersonList(volunteerList, matchedVolunteers, "volunteer");
  renderPersonList(ngoList, matchedNgos, "ngo");
  updateMetrics(matchedVolunteers, matchedNgos);
  writeActivity(report, urgency, matchedVolunteers, matchedNgos);
  mapMode.className = "status-pill low";
  renderFallbackMap(report);
}

function applySession(nextSession) {
  setStoredSession(nextSession);
  signedInName.textContent = nextSession.user.displayName;
  signedInRole.textContent = nextSession.user.role === "ngo" ? "Verified NGO" : "Volunteer responder";
  authScreen.classList.add("is-hidden");
  appShell.classList.remove("is-hidden");
}

function restoreSession() {
  const stored = getStoredSession();
  if (!stored) return;
  applySession(stored);
}

form.addEventListener("submit", async (event) => {
  event.preventDefault();
  const file = reportFile.files[0];
  if (!file) {
    appendActivity("Upload a PDF, Word, or PowerPoint report before analysis.");
    return;
  }

  analysisSummary.textContent = "Analyzing document via backend...";
  activeReport = await analyzeUploadedReport(file);
  activeSearchCenter = locations[activeReport.locationKey];
  mapSearchInput.value = activeSearchCenter.name;
  renderAll(activeReport);
});

reportFile.addEventListener("change", () => {
  fileName.textContent = reportFile.files[0]?.name || "PDF, Word, or PowerPoint";
});

document.querySelector("#seedScenario").addEventListener("click", () => {
  document.querySelector("#location").value = "sector-62";
  reportNotes.value = "Critical medical emergency near a settlement. 320 people affected and 28 volunteers required for triage, medicine distribution, crowd management, and food support.";
  activeReport = {
    sourceName: "Emergency-demo-report.pdf",
    type: "medical",
    locationKey: "sector-62",
    volunteersNeeded: 28,
    peopleAffected: 320,
    skills: ["medical", "logistics", "food"],
    description: reportNotes.value,
    requirements: buildRequirements("medical", ["medical", "logistics", "food"], 28, 320),
    extractedChars: 480,
    aiEngine: "Backend demo scenario",
    modelConfidence: "high"
  };
  activeSearchCenter = locations["sector-62"];
  mapSearchInput.value = activeSearchCenter.name;
  fileName.textContent = "Emergency-demo-report.pdf";
  renderAll(activeReport);
});

document.querySelector("#clearActivity").addEventListener("click", () => {
  activityLog.innerHTML = '<li>Activity log cleared. Submit a report to generate a fresh trace.</li>';
});

document.querySelectorAll(".auth-tab").forEach((button) => {
  button.addEventListener("click", () => {
    authMode = button.dataset.authMode;
    document.querySelectorAll(".auth-tab").forEach((tab) => tab.classList.remove("active"));
    button.classList.add("active");
    authSubmit.textContent = authMode === "login" ? "Login" : "Create account";
  });
});

accountType.addEventListener("change", () => {
  const isNgo = accountType.value === "ngo";
  orgNameWrap.classList.toggle("is-hidden", !isNgo);
  document.querySelector("#email").value = isNgo ? "operator@aidflow.org" : "volunteer@aidflow.org";
});

authForm.addEventListener("submit", async (event) => {
  event.preventDefault();
  const isNgo = accountType.value === "ngo";
  const path = authMode === "login" ? "/api/auth/login" : "/api/auth/signup";
  const payload = await apiRequest(path, {
    method: "POST",
    body: JSON.stringify({
      role: accountType.value,
      email: document.querySelector("#email").value.trim(),
      password: document.querySelector("#password").value,
      organizationName: isNgo ? orgName.value.trim() : "",
      displayName: isNgo ? orgName.value.trim() || "Verified organization" : "Volunteer account"
    })
  });

  applySession(payload.session);
  appendActivity(`${authMode === "login" ? "Logged in" : "Account created"} as ${signedInRole.textContent}.`);
});

document.querySelector("#logoutButton").addEventListener("click", async () => {
  try {
    await apiRequest("/api/auth/logout", { method: "POST" });
  } catch {
    // Ignore prototype logout errors.
  }
  setStoredSession(null);
  appShell.classList.add("is-hidden");
  authScreen.classList.remove("is-hidden");
});

mapSearchForm.addEventListener("submit", (event) => {
  event.preventDefault();
  activeSearchCenter = geocodeSearch(mapSearchInput.value);
  mapSearchInput.value = activeSearchCenter.name;
  renderFallbackMap(activeReport);
  appendActivity(`Network search updated to ${activeSearchCenter.name}; showing NGOs and volunteers within 25 km.`);
});

document.addEventListener("click", (event) => {
  const button = event.target.closest(".action-button");
  if (!button) return;
  const name = button.dataset.name;
  const isVolunteer = button.dataset.kind === "volunteer";
  button.textContent = isVolunteer ? "Notification sent" : "Support requested";
  button.disabled = true;
  button.classList.add("is-complete");
  appendActivity(`${isVolunteer ? "Volunteer notification sent to" : "NGO support request sent to"} ${name}.`);
});

async function initializeApp() {
  await bootstrapData();
  syncLocationOptions();
  restoreSession();
  mapSearchInput.value = activeSearchCenter.name;
  renderAll(activeReport);
}

initializeApp();
