const locations = {
  "sector-62": { name: "Sector 62, Noida", lat: 28.628, lng: 77.364, x: 49, y: 42 },
  botanical: { name: "Botanical Garden, Noida", lat: 28.563, lng: 77.334, x: 35, y: 59 },
  "pari-chowk": { name: "Pari Chowk, Greater Noida", lat: 28.465, lng: 77.511, x: 68, y: 71 },
  vaishali: { name: "Vaishali, Ghaziabad", lat: 28.649, lng: 77.339, x: 28, y: 34 }
};

const volunteers = [
  { name: "Aarav Singh", skills: ["medical", "logistics"], location: "sector-62", distance: 1.4, available: true, tasks: 21, x: 54, y: 36 },
  { name: "Meera Khan", skills: ["food", "logistics"], location: "botanical", distance: 2.8, available: true, tasks: 18, x: 38, y: 53 },
  { name: "Rohan Patel", skills: ["teaching", "food"], location: "vaishali", distance: 4.3, available: true, tasks: 14, x: 25, y: 29 },
  { name: "Isha Verma", skills: ["medical", "food"], location: "sector-62", distance: 3.2, available: true, tasks: 27, x: 58, y: 47 },
  { name: "Kabir Rao", skills: ["logistics", "shelter"], location: "pari-chowk", distance: 5.6, available: true, tasks: 9, x: 72, y: 67 },
  { name: "Naina Das", skills: ["teaching", "logistics"], location: "botanical", distance: 6.2, available: false, tasks: 11, x: 31, y: 62 },
  { name: "Dev Malhotra", skills: ["food", "shelter"], location: "vaishali", distance: 3.7, available: true, tasks: 16, x: 30, y: 39 },
  { name: "Sara John", skills: ["medical", "teaching"], location: "sector-62", distance: 4.9, available: true, tasks: 24, x: 51, y: 50 }
];

const ngos = [
  { name: "CareBridge Foundation", focus: ["food", "medical"], location: "sector-62", distance: 1.9, x: 47, y: 31 },
  { name: "Udaan Learning Trust", focus: ["education", "teaching"], location: "botanical", distance: 3.6, x: 34, y: 64 },
  { name: "Seva Relief Network", focus: ["shelter", "logistics"], location: "pari-chowk", distance: 4.8, x: 75, y: 75 },
  { name: "Asha Community Kitchen", focus: ["food", "logistics"], location: "vaishali", distance: 4.2, x: 22, y: 42 },
  { name: "HealthFirst Camp", focus: ["medical"], location: "sector-62", distance: 2.5, x: 61, y: 40 }
];

const modelSignals = {
  medical: ["medical", "medicine", "doctor", "triage", "ambulance", "injury", "health", "patient", "clinic"],
  food: ["food", "ration", "meal", "hunger", "nutrition", "kitchen", "grain", "milk", "water"],
  education: ["education", "school", "student", "teaching", "books", "class", "learning", "exam"],
  shelter: ["shelter", "rescue", "flood", "relief camp", "blanket", "housing", "evacuation", "tent"],
  logistics: ["transport", "packing", "distribution", "crowd", "queue", "supply", "warehouse", "delivery"]
};

const form = document.querySelector("#reportForm");
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

let activeReport = buildFallbackReport();
let activeMatches = { volunteers: [], ngos: [] };

function buildFallbackReport() {
  return {
    sourceName: "Prototype sample",
    type: "food",
    locationKey: document.querySelector("#location").value,
    volunteersNeeded: 12,
    peopleAffected: 85,
    skills: ["food", "logistics"],
    description: reportNotes.value.trim(),
    requirements: ["Dry ration kits", "Packing and sorting team", "Last-mile distribution volunteers"]
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

async function readDocumentText(file) {
  if (!file) return "";

  const buffer = await file.arrayBuffer();
  const bytes = new Uint8Array(buffer);
  const decoded = new TextDecoder("utf-8", { fatal: false }).decode(bytes);
  const readable = decoded
    .replace(/[^\x09\x0A\x0D\x20-\x7E]+/g, " ")
    .replace(/\s+/g, " ")
    .trim();

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
  if (skills.includes("logistics")) requirements.push(`Logistics team for packing, dispatch, and queue control`);
  requirements.push(`${volunteersNeeded} volunteers needed for field execution`);
  return [...new Set(requirements)];
}

async function analyzeUploadedReport(file) {
  const extractedText = await readDocumentText(file);
  const notesText = reportNotes.value.trim();
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
    locationKey: document.querySelector("#location").value,
    volunteersNeeded: Math.min(volunteersNeeded, 80),
    peopleAffected,
    skills,
    description: notesText || extractedText.slice(0, 280) || "Document uploaded for prototype NLP analysis.",
    requirements: buildRequirements(type, skills, Math.min(volunteersNeeded, 80), peopleAffected),
    extractedChars: extractedText.length
  };
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
    <p class="model-note">Prototype NLP confidence: ${urgency.score >= 7 ? "high" : "medium"}${
      report.extractedChars ? `; ${report.extractedChars} readable characters extracted.` : "; using filename and notes because binary document text was limited."
    }</p>
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
              <span>${item.distance.toFixed(1)} km away · score ${item.score}</span>
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

function renderFallbackMap(report, matchedVolunteers, matchedNgos) {
  const location = locations[report.locationKey];
  mapCanvas.innerHTML = '<div class="map-grid"></div><div class="map-route"></div>';
  addMarker("issue", "!", location.x, location.y, location.name);
  matchedVolunteers.forEach((volunteer, index) => addMarker("volunteer", `V${index + 1}`, volunteer.x, volunteer.y, volunteer.name));
  matchedNgos.forEach((ngo, index) => addMarker("ngo", `N${index + 1}`, ngo.x, ngo.y, ngo.name));
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

function writeActivity(report, urgency, matchedVolunteers, matchedNgos) {
  const location = locations[report.locationKey].name;
  const lines = [
    `Document ingested: ${report.sourceName}.`,
    `NLP extracted ${report.type} need for ${location}.`,
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
  activeMatches = { volunteers: matchedVolunteers, ngos: matchedNgos };

  urgencyBadge.textContent = urgency.label;
  urgencyBadge.className = `status-pill ${urgency.className}`;

  renderAnalysis(report, urgency);
  renderPersonList(volunteerList, matchedVolunteers, "volunteer");
  renderPersonList(ngoList, matchedNgos, "ngo");
  updateMetrics(matchedVolunteers, matchedNgos);
  writeActivity(report, urgency, matchedVolunteers, matchedNgos);

  mapMode.textContent = "Live network";
  mapMode.className = "status-pill low";
  renderFallbackMap(report, matchedVolunteers, matchedNgos);
}

form.addEventListener("submit", async (event) => {
  event.preventDefault();
  const file = reportFile.files[0];
  if (!file) {
    appendActivity("Upload a PDF, Word, or PowerPoint report before analysis.");
    return;
  }

  analysisSummary.textContent = "Analyzing document...";
  activeReport = await analyzeUploadedReport(file);
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
    extractedChars: 480
  };
  fileName.textContent = "Emergency-demo-report.pdf";
  renderAll(activeReport);
});

document.querySelector("#clearActivity").addEventListener("click", () => {
  activityLog.innerHTML = '<li>Activity log cleared. Submit a report to generate a fresh trace.</li>';
});

document.querySelectorAll(".chip").forEach((button) => {
  button.addEventListener("click", () => {
    document.querySelectorAll(".chip").forEach((chip) => chip.classList.remove("active"));
    button.classList.add("active");
    appendActivity(`${button.textContent.trim()} view selected.`);
  });
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

renderAll(activeReport);
