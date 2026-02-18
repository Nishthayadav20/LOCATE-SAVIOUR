# 🚨  Emergency Free Tracker (Ghaziabad)

SUVIDHA is a real-time emergency assistance web application that helps users quickly locate **nearby hospitals, blood banks, and pharmacies** using live location tracking and OpenStreetMap data.

This project is designed to support people during emergencies by providing fast access to essential healthcare services in their area.

---

## 🌟 Features

✅ Live Location Detection (GPS)  
✅ Manual Location Search (Enter any city/area)  
✅ Nearby Hospitals Locator (within radius)  
✅ Nearby Blood Banks Locator  
✅ Nearby Pharmacies Locator  
✅ Distance Calculation (in KM)  
✅ Interactive Map View using Leaflet  
✅ Click Marker to View Place Details  
✅ Route Path (OSRM Routing Support - Free API)  
✅ Sorted List of Nearest Places  
✅ Future Scope: Real-Time Ambulance Tracking via Socket.IO  

---

## 🛠️ Tech Stack

### Frontend
- React.js
- Leaflet + React Leaflet
- Axios
- OpenStreetMap Tiles

### Backend
- Node.js
- Express.js
- Axios (for Overpass API calls)
- MongoDB (Atlas)
- Socket.IO (for real-time tracking future feature)

### APIs Used (Free)
- OpenStreetMap
- Overpass API (for hospitals/bloodbanks/pharmacies data)
- Nominatim API (manual location search)
- OSRM Routing API (route navigation)

---

## 📌 How It Works

1. User location is detected using browser GPS.
2. The backend calls **Overpass API** to fetch nearby hospitals/blood banks/pharmacies.
3. Results are displayed on a live map with markers.
4. Distance is calculated using the Haversine formula.
5. User can click on any hospital marker to see details.
6. Route path is generated using **OSRM** free routing.

---

## ⚙️ Installation & Setup

### Step 1: Clone Repository
```bash
git clone https://github.com/your-username/SUVIDHA-Emergency-Tracker.git
cd SUVIDHA-Emergency-Tracker
