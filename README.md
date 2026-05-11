# ChaiPoll v2.0: Cinematic Realtime Intelligence Engine

ChaiPoll is a production-grade, high-fidelity polling and tactical analysis platform designed for high-stakes data collection. Built with a "Warrior" aesthetic, it combines real-time synchronization with advanced visual intelligence mapping.

![Cinematic Banner](https://via.placeholder.com/1200x400/020202/ef4444?text=CHAI+POLL+v2.0+MISSION+CONTROL)

## ⚡ Realtime Architecture
ChaiPoll is engineered for sub-millisecond synchronization using a robust **Socket.io** infrastructure:
- **Neural Link Sync**: Atomic vote broadcasting across all connected clients.
- **Participation Telemetry**: Live activity streams with geo-location placeholders.
- **Session Persistence**: Production-hardened JWT authentication with auto-reconnect protocols.

## 🗺️ Tactical Decision Mapping
The signature feature of ChaiPoll is the **React Flow** based decision-tree visualization:
- **Nexus Visualization**: Maps the flow from root campaigns to questions and individual options.
- **Accuracy Tracking**: Identifies 'Target Objectives' (correct answers) with emerald-glowing 'Correct Paths'.
- **Divergence Analysis**: Highlights majority and minority trends using visual stroke weights and animated edges.

## 🛡️ Production Hardening
- **Security Fortress**: Integrated **Helmet**, **CORS**, and **Express-Rate-Limit** for enterprise-grade protection.
- **Data Integrity**: Centralized validation using **Express-Validator** for all mission-critical payloads.
- **Atomic Operations**: MongoDB `$inc` and `arrayFilters` used to prevent race conditions during high-concurrency voting events.
- **Responsive Command**: Fully optimized for mobile 'Warriors' with a dedicated cinematic MobileNav system.

## 🛠️ Tech Stack
- **Frontend**: React, Framer Motion, Tailwind CSS (Vanilla CSS focus), React Flow, Recharts, Lenis Scroll.
- **Backend**: Node.js, Express, Socket.io, MongoDB, Mongoose.
- **Auth**: Passport.js (Google/GitHub OAuth), JWT, bcrypt.
- **Icons/UI**: Lucide React, RoughNotation (Handwritten annotations).

## 🚀 Deployment Deployment Readiness
### Environment Variables
```env
# Server
PORT=5000
MONGODB_URI=your_mongodb_uri
JWT_SECRET=your_secret
CLIENT_URL=http://localhost:5173
GOOGLE_CLIENT_ID=...
GOOGLE_CLIENT_SECRET=...

# Client
VITE_API_URL=http://localhost:5000/api
VITE_SOCKET_URL=http://localhost:5000
```

## 📜 Mission Log
- **Phase 1**: Core Auth & Prototype Stabilization.
- **Phase 2**: Multi-Question Engine & Quiz Logic Deployment.
- **Phase 3**: Realtime Socket.io Cleanup & Reliability Hardening.
- **Phase 4**: Tactical Flow Visualization & Final UI Polish.

---
Built by **Warriors** for **Architects**. 🏿🔥
