# Technologies To Be Used

## Core frontend

- HTML5 for structure
- CSS3 for styling and responsive layout
- Vanilla JavaScript for interaction and workflow logic

## Backend and API

- Node.js HTTP server for static hosting and prototype API endpoints
- Backend route for secure Gemini calls instead of browser-exposed keys
- REST-style prototype endpoints for auth, bootstrap data, and report analysis

## AI and analysis

- Google Gemini 3 Flash Preview via REST API for document understanding and structured extraction
- Node backend fallback analyzer for demo continuity when Gemini is unavailable

## Data and authentication

- In-memory mock store representing a future Firestore, PostgreSQL, or MongoDB layer
- Prototype session-based auth shaped like a future Firebase Auth, Auth0, or JWT flow

## File and document handling

- Browser File API for PDF, DOC, DOCX, PPT, and PPTX uploads
- Text decoding / parsing pipeline for prototype document extraction

## Matching and coordination

- Haversine distance calculation for 25 km radius search
- Rule-based urgency scoring and task prioritization
- Skill and availability based volunteer / NGO matching

## Map and search experience

- Searchable client-side map-style visualization
- Radius-based drive discovery and nearby partner lookup

## Production path

- Database such as Firebase Firestore, PostgreSQL, or MongoDB
- Authentication using Firebase Auth, Auth0, or custom JWT-based auth
- Cloud hosting on Firebase, Google Cloud Run, or Vercel
- Google Maps Platform or Mapbox for real geospatial search and map tiles
