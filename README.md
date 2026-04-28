# AidFlow

Dark, minimal prototype for smart resource allocation between NGOs and volunteers, now backed by a lightweight Node.js server.

## What it demonstrates

- PDF, Word, and PowerPoint report upload for NGO field reports.
- Login/signup entry for verified NGOs and volunteers.
- Node.js backend endpoint for secure Gemini report analysis.
- Prototype session auth through backend login/signup endpoints.
- In-memory mock data store standing in for Firestore/PostgreSQL/MongoDB.
- Gemini-ready AI extraction for need type, affected people, volunteer count, skills, and fulfillment requirements.
- Backend fallback analyzer when Gemini is not configured or unavailable.
- Rule-based urgency analysis using document keywords, affected population, and volunteer demand.
- Volunteer matching by availability, distance, contribution history, and skill overlap.
- Nearby NGO collaboration suggestions for resource sharing.
- Working action buttons for volunteer notifications, NGO support requests, login/logout, demo loading, and activity clearing.
- Searchable 25 km network map for nearby drives, NGOs, and volunteers.

## Demo Credentials

Use the following credentials to explore the platform:

### Verified NGO / Organisation
- **Email:** operator@aidflow.org  
- **Password:** aidflow-demo  

### Volunteer
- **Email:** volunteer@aidflow.org  
- **Password:** aidflow-demo  

---

## Project Structure

```bash
AidFlow/
│
├── assets/
│   └── aidflow-logo.png
│
├── docs/
│   └── diagrams/
│       ├── architecture-diagram.svg
│       ├── process-flow-diagram.svg
│       ├── use-case-diagram.svg
│       └── TECHNOLOGIES.md
│
├── node_modules/
│   ├── @google/
│   └── .package-lock.json
│
├── server/
│   ├── mock-store.js
│   └── server.js
│
├── .env.example
├── app.js
├── index.html
├── package-lock.json
├── package.json
├── README.md
├── sample-emergency-report.doc
├── server.stderr.log
├── server.stdout.log
└── styles.css
```

## Run

1. Set `GEMINI_API_KEY` in your environment if you want live Gemini analysis.
2. Run `npm start`
3. Open `http://localhost:4173`

For a quick demo, upload `sample-emergency-report.doc` or use **Load emergency demo**.

## Prototype architecture choices

- `server/server.js` serves the frontend and API routes.
- `server/mock-store.js` acts as the prototype database/auth layer.
- Gemini is called only from the backend using `process.env.GEMINI_API_KEY`.
- `.env.example` shows the production-aligned config placeholders for Gemini, Firebase, and maps.
