# Uber Clone — Project Documentation

## 1) Project Overview

This project is an “Uber-like” clone with:
- A **User** app flow (request rides, see route, fare estimate, OTP, chat/call with captain).
- A **Captain** app flow (receive ride offers in real-time, accept rides, navigate to pickup, verify OTP, start/complete ride).
- A **Node.js/Express + MongoDB** backend (auth, rides, maps utilities).
- A **Socket.IO** realtime layer (ride offers, accept/cancel events, chat, and WebRTC signaling for calls).
- **Google Maps APIs**:
  - Backend uses Google APIs for **geocoding**, **distance matrix**, **places autocomplete**.
  - Frontend uses **Google Maps JS** for map rendering and route drawing.

---

## 2) Tech Stack

### Frontend
- React (Vite)
- React Router
- TailwindCSS
- Axios
- socket.io-client
- Google Maps JavaScript API

### Backend
- Node.js + Express
- MongoDB + Mongoose
- JWT authentication
- bcrypt / bcryptjs
- socket.io
- Axios (for Google APIs)
- express-validator

---

## 3) Repository Structure (High-Level)

- `backend/`
  - `server.js` — HTTP server + Socket.IO initialization
  - `app.js` — Express app setup and route mounting
  - `db/db.js` — MongoDB connection
  - `models/` — Mongoose schemas (User, Captain, Ride, BlacklistToken)
  - `controllers/` — request handlers for users/captains/rides/maps
  - `services/` — ride fare calc + Google Maps API wrappers
  - `routes/` — REST routes
  - `middlewares/auth.middleware.js` — JWT auth + blacklist check
  - `socket.js` — socket events: ride lifecycle, chat, calls/webrtc

- `frontend/`
  - `src/main.jsx` — app boot + providers (User/Captain/Socket + Router)
  - `src/App.jsx` — route definitions
  - `src/context/` — User/Captain state + Socket provider
  - `src/pages/` — UI screens (User & Captain flows)
  - `src/components/` — BottomSlider, LocationSearchPanel

---

## 4) Setup & Run (Windows / PowerShell)

### 4.1 Backend install & run
```powershell
cd "d:\Coding\Web Development\Uber Clone\backend"
npm install
node server.js
```

Backend default port:
- `PORT` from `.env`, else `3000`

### 4.2 Frontend install & run
```powershell
cd "d:\Coding\Web Development\Uber Clone\frontend"
npm install
npm run dev
```

---

## 5) Environment Variables

### 5.1 Backend (`backend/.env`)
Required:
- `DB_CONNECT` = MongoDB connection string
- `JWT_SECRET` = secret for signing JWTs
- `GOOGLE_MAP_API_KEY` = Google API key (Geocoding, Distance Matrix, Places)

Optional:
- `PORT` = backend port (default 3000)

Example:
```env
PORT=3000
DB_CONNECT=mongodb://127.0.0.1:27017/uber-clone
JWT_SECRET=your_jwt_secret
GOOGLE_MAP_API_KEY=your_google_backend_key
```

### 5.2 Frontend (`frontend/.env`)
Required:
- `VITE_BASE_URL` = backend base url (e.g. `http://localhost:3000`)
- `VITE_GOOGLE_MAPS_JS_API_KEY` (or `VITE_GOOGLE_MAPS_API_KEY`) = Google Maps JS key

Example:
```env
VITE_BASE_URL=http://localhost:3000
VITE_GOOGLE_MAPS_JS_API_KEY=your_google_maps_js_key
```

---

## 6) Backend: REST API Documentation

Base URL: `VITE_BASE_URL` (example `http://localhost:3000`)

### 6.1 User Auth & Profile
Routes are mounted under `/users` ([backend/app.js]).

- `POST /users/register`
  - Body: `{ fullname: { firstname, lastname }, email, password }`
  - Returns: `{ token, user }`

- `POST /users/login`
  - Body: `{ email, password }`
  - Returns: `{ token, user }`

- `GET /users/profile`
  - Auth: Bearer token
  - Returns: `{ user }`

- `POST /users/profile/image`
  - Auth: Bearer token
  - Body: `{ imageData: "data:image/...base64..." }`
  - Stores base64 image string in DB

- `GET /users/stats/trips`
  - Auth: Bearer token
  - Returns: `{ trips }` = count of completed rides for user

- `GET /users/logout`
  - Auth: Bearer token
  - Blacklists token in `BlacklistToken` collection

### 6.2 Captain Auth & Profile
Routes under `/captains`.

- `POST /captains/register`
  - Body: `{ fullname, email, password, vehicle: { color, plate, capacity, vehicleType } }`
  - Returns: `{ message, captain, token }`

- `POST /captains/login`
  - Body: `{ email, password }`
  - Returns: `{ message, captain, token }`

- `GET /captains/profile`
  - Auth: Bearer token
  - Returns: `{ message, captain }`

- `POST /captains/profile/image`
  - Auth: Bearer token
  - Body: `{ imageData }`

- `GET /captains/stats/trips`
  - Auth: Bearer token
  - Returns: `{ trips }` = completed rides for captain

- `GET /captains/logout`
  - Auth: Bearer token
  - Blacklists token

### 6.3 Maps Utilities
Routes under `/maps` (used by both user and captain UI).

- `GET /maps/coordinates?address=...`
  - Returns `{ lat, lng }` from Google Geocoding API

- `GET /maps/distanceTime?origin=...&destination=...`
  - Returns `{ distance, time }` from Google Distance Matrix API

- `GET /maps/suggestions?input=...`
  - Returns Google Places Autocomplete predictions array

### 6.4 Rides
Routes under `/rides`.

- `GET /rides/fare?pickup=...&destination=...`
  - Calculates fare using:
    - distance + duration from `/maps/distanceTime`
    - per-vehicle rates (motorcycle/auto/car)
  - Returns: `{ fare }`

- `POST /rides/create`
  - Body: `{ pickup, destination, vehicleType }`
  - Creates ride in DB with:
    - computed `fare`, `distance`, `duration`
    - `otp` (4 digits)
    - status `pending`
  - Emits `ride:offer` to available captains via Socket.IO
  - Returns: `{ ride }`

- `GET /rides/:id`
  - Returns: `{ ride }`

- `POST /rides/cancel-open`
  - Cancels user rides in `pending/accepted/ongoing` and emits `ride:cancelled`

---

## 7) Realtime Layer: Socket.IO Events

Socket server is created in [backend/socket.js], initialized in [backend/server.js].

### 7.1 Connection and Identity
- Client emits: `join` `{ userId, userType: "user" | "captain" }`
- Server stores `socketId` into the relevant Mongo document.

### 7.2 Ride Offer & Acceptance
- Server emits to captains: `ride:offer`
  - Payload: `{ rideId, pickup, destination, fare, userId, userName }`

- Captain emits: `ride:accept` `{ rideId, captainId }`
- Server emits:
  - To user: `ride:accepted` `{ rideId, captain: { _id, fullname, vehicle } }`
  - To captain: `ride:accepted` `{ rideId }`
  - Also makes both join room: `ride:<rideId>`

### 7.3 Ride Start / OTP / Completion
- Captain emits: `ride:start` `{ rideId, otp }`
- Server emits:
  - `ride:otp:invalid` if OTP mismatch
  - `ride:ongoing` if OTP correct

- Captain emits: `ride:complete` `{ rideId }`
- Server emits: `ride:completed` `{ rideId }`

### 7.4 Ride Cancel
- User/Captain/System emits: `ride:cancel` `{ rideId, by }`
- Server emits: `ride:cancelled` `{ rideId, by }`

### 7.5 Chat (per-ride room)
- Emit: `chat:message` `{ rideId, from, text }`
- Broadcast: `chat:message` `{ rideId, from, text, ts }`

### 7.6 Calls (WebRTC signaling + ring/accept/decline/end)
- `call:initiate` → server emits `call:ring`
- `call:accept` → server emits `call:accept`
- `call:decline` → server emits `call:decline`
- `call:end` → server emits `call:end`
- WebRTC signaling:
  - `webrtc:offer`, `webrtc:answer`, `webrtc:candidate`

---

## 8) Frontend: Routing & Screens

Routes are defined in [frontend/src/App.jsx].

### 8.1 Public
- `/` → Start page
- `/user/login` / `/user/signup`
- `/captain/login` / `/captain/signup`

### 8.2 Protected (User)
Wrapped by `UserProtectWrapper`:
- `/Home`
- `/user/logout`
- `/user/chat`

`UserProtectWrapper`:
- Reads token from `localStorage.getItem("user")`
- Fetches `/users/profile` to validate token and load user data
- Calls `join(userId, "user")` on socket

### 8.3 Protected (Captain)
Wrapped by `CaptainProtectWrapper`:
- `/CaptainHome`
- `/CaptainRideDetail`
- `/PickupLocation`
- `/captain/chat`

`CaptainProtectWrapper`:
- Reads token from `localStorage.getItem("captain")`
- Fetches `/captains/profile`
- Calls `join(captainId, "captain")`

---

## 9) Maps + GPS Behavior (What Was Implemented / Updated)

This project uses **Google Maps JS** for map UI and **browser geolocation** for live GPS.

### 9.1 User Home Map GPS Pin (Updated)
File: `frontend/src/pages/Home.jsx`

Behavior:
- When user visits Home, the app requests GPS via `navigator.geolocation.getCurrentPosition`.
- If allowed, it centers the map to the user location and moves the marker there.
- Home also supports:
  - Dragging map to move the pin (map center marker)
  - Converting typed pickup/destination into coordinates by calling:
    - `GET /maps/coordinates?address=...`
  - Address suggestions via `LocationSearchPanel` → `GET /maps/suggestions?input=...`

### 9.2 Ride Selection Page GPS Removed (Updated)
File: `frontend/src/pages/RideSelection.jsx`

Behavior:
- No GPS tracking is used here.
- Route is drawn using Google Directions (pickup → destination).
- Fare is fetched via `GET /rides/fare`.
- Ride request is created via `POST /rides/create`.
- OTP is shown after ride is created.

### 9.3 Captain Home GPS Pin
File: `frontend/src/pages/CaptainHome.jsx`

Behavior:
- Captain map requests GPS and pins captain’s location.
- Uses `watchPosition` to keep updating captain location marker.
- This screen receives `ride:offer` events and displays incoming ride cards.

### 9.4 Captain Pickup & Ongoing Distance from Current Location (Updated)
File: `frontend/src/pages/PickupLocation.jsx`

Behavior:
- The captain’s GPS is tracked (watchPosition) and stored in `gpsLatestRef`.
- Distance/time is computed using backend `/maps/distanceTime`:
  - Before ride start: **captain current GPS → pickup address**
  - During ride: **captain current GPS → destination address**
- The distance/time refreshes automatically (every ~10 seconds).
- OTP submission triggers `ride:start`.
- Completing ride triggers `ride:complete`.

---

## 10) Ride Flow (End-to-End)

### 10.1 User Flow
1. User logs in → token stored in localStorage under `user`.
2. User goes to `/Home`:
   - Map loads and GPS centers (if allowed).
   - User selects pickup & destination.
3. User proceeds to `/RideSelection`:
   - Route is drawn on the map.
   - Fare estimates are fetched.
4. User confirms ride:
   - Backend creates ride + emits `ride:offer`.
   - User waits for `ride:accepted`.
5. When accepted:
   - User sees captain details and OTP.
   - User can chat/call the captain (socket + WebRTC signaling).
6. Ride can be cancelled by user or captain (socket event updates UI).

### 10.2 Captain Flow
1. Captain logs in → token stored in localStorage under `captain`.
2. Captain goes to `/CaptainHome`:
   - GPS pin is shown and updates live.
   - Receives ride offers in realtime.
3. Captain accepts a ride:
   - Emits `ride:accept`.
   - Both user and captain get `ride:accepted`.
4. Captain navigates to pickup:
   - `/PickupLocation` shows real-time distance from captain GPS → pickup.
5. Captain starts ride (OTP verification):
   - Emits `ride:start`.
   - If correct → server emits `ride:ongoing`.
6. During ride:
   - `/PickupLocation` shows real-time distance from captain GPS → destination.
7. Captain completes ride:
   - Emits `ride:complete` → server emits `ride:completed`.

---

## 11) Data Models (MongoDB)

### User
- `fullname`, `email`, `password`
- `profileImage` (base64 string)
- `socketId`

### Captain
- `fullname`, `email`, `password`
- `vehicle` (color, plate, capacity, vehicleType)
- `status` (`available` / `busy`)
- `profileImage`
- `location` (lat/lng)
- `socketId`

### Ride
- `user` (ObjectId)
- `captain` (ObjectId)
- `pickup`, `destination`
- `fare`, `duration`, `distance`
- `otp` (select:false)
- `status` (`pending/accepted/ongoing/completed/cancelled`)

### BlacklistToken
- `token`
- TTL expires automatically after 24 hours

---
