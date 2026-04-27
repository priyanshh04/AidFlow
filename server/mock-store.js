const crypto = require("node:crypto");

const locations = {
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

const searchLocations = [
  ...Object.values(locations),
  { name: "India Gate, Delhi", lat: 28.613, lng: 77.229 },
  { name: "Akshardham, Delhi", lat: 28.612, lng: 77.277 },
  { name: "Lajpat Nagar, Delhi", lat: 28.567, lng: 77.243 }
];

const volunteers = [
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

const ngos = [
  { id: "ngo-1", name: "CareBridge Foundation", focus: ["food", "medical"], location: "sector-62" },
  { id: "ngo-2", name: "Udaan Learning Trust", focus: ["education", "teaching"], location: "botanical" },
  { id: "ngo-3", name: "Seva Relief Network", focus: ["shelter", "logistics"], location: "pari-chowk" },
  { id: "ngo-4", name: "Asha Community Kitchen", focus: ["food", "logistics"], location: "vaishali" },
  { id: "ngo-5", name: "HealthFirst Camp", focus: ["medical"], location: "sector-62" },
  { id: "ngo-6", name: "Delhi Relief Collective", focus: ["food", "logistics"], location: "connaught-place" },
  { id: "ngo-7", name: "ShelterWorks NCR", focus: ["shelter", "logistics"], location: "dwarka" },
  { id: "ngo-8", name: "BrightPath Tutors", focus: ["education", "teaching"], location: "rohini" }
];

const users = [
  {
    id: "user-ngo-demo",
    email: "operator@aidflow.org",
    password: "aidflow-demo",
    role: "ngo",
    displayName: "CareBridge Foundation"
  },
  {
    id: "user-vol-demo",
    email: "volunteer@aidflow.org",
    password: "aidflow-demo",
    role: "volunteer",
    displayName: "Volunteer account"
  }
];

const sessions = new Map();

function createSession(user) {
  const token = crypto.randomBytes(24).toString("hex");
  const payload = {
    token,
    user: {
      id: user.id,
      role: user.role,
      email: user.email,
      displayName: user.displayName
    }
  };
  sessions.set(token, payload.user);
  return payload;
}

function authenticate(token) {
  return token ? sessions.get(token) || null : null;
}

function destroySession(token) {
  sessions.delete(token);
}

function login({ email, password, role }) {
  const user = users.find((entry) => entry.email === email && entry.password === password && entry.role === role);
  if (!user) return null;
  return createSession(user);
}

function signup({ email, password, role, displayName }) {
  const existing = users.find((entry) => entry.email === email);
  if (existing) {
    existing.password = password;
    existing.role = role;
    existing.displayName = displayName;
    return createSession(existing);
  }

  const user = {
    id: `user-${crypto.randomUUID()}`,
    email,
    password,
    role,
    displayName
  };
  users.push(user);
  return createSession(user);
}

function getBootstrap() {
  return {
    locations,
    searchLocations,
    volunteers,
    ngos,
    technologies: {
      backend: "Node.js",
      database: "Prototype in-memory store (production target: Firestore/PostgreSQL/MongoDB)",
      auth: "Prototype session auth (production target: Firebase Auth/Auth0/JWT)",
      hosting: "Prototype local Node server (production target: Cloud Run/Firebase/Vercel)",
      maps: "Prototype map canvas (production target: Google Maps Platform/Mapbox)"
    }
  };
}

module.exports = {
  authenticate,
  destroySession,
  getBootstrap,
  login,
  signup
};
