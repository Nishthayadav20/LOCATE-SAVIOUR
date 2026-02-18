import React, { useEffect, useState } from "react";
import axios from "axios";
import {
  MapContainer,
  TileLayer,
  Marker,
  Popup,
  Polyline,
} from "react-leaflet";

export default function App() {
  const [location, setLocation] = useState(null);
  const [places, setPlaces] = useState([]);
  const [manualLocation, setManualLocation] = useState("");
  const [routeCoords, setRouteCoords] = useState([]);
  const [eta, setEta] = useState(null);
  const [selectedPlace, setSelectedPlace] = useState(null);

  const radiusLimit = 2; // 2km limit

  // ✅ Haversine Distance function
  const getDistance = (lat1, lon1, lat2, lon2) => {
    const R = 6371; // km
    const dLat = ((lat2 - lat1) * Math.PI) / 180;
    const dLon = ((lon2 - lon1) * Math.PI) / 180;

    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos((lat1 * Math.PI) / 180) *
        Math.cos((lat2 * Math.PI) / 180) *
        Math.sin(dLon / 2) *
        Math.sin(dLon / 2);

    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

    return R * c;
  };

  // ✅ Get user location
  useEffect(() => {
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setLocation({
          lat: pos.coords.latitude,
          lng: pos.coords.longitude,
        });
      },
      () => alert("Location permission denied!")
    );
  }, []);

  // ✅ Search manual location using OpenStreetMap Nominatim API (FREE)
  const searchLocation = async () => {
    if (!manualLocation) return;

    try {
      const res = await axios.get(
        `https://nominatim.openstreetmap.org/search?format=json&q=${manualLocation}`
      );

      if (res.data.length > 0) {
        setLocation({
          lat: parseFloat(res.data[0].lat),
          lng: parseFloat(res.data[0].lon),
        });

        setPlaces([]);
        setRouteCoords([]);
        setEta(null);
        setSelectedPlace(null);
      } else {
        alert("Location not found!");
      }
    } catch (err) {
      console.log(err);
      alert("Error searching location");
    }
  };

  // ✅ Fetch nearby hospitals / bloodbanks / pharmacy
  const fetchPlaces = async (type) => {
  if (!location) return;

  try {
    const res = await axios.get(
      `http://localhost:5000/api/osm/nearby?lat=${location.lat}&lng=${location.lng}&type=${type}`
    );

    // ✅ Ensure array always
    const data = Array.isArray(res.data) ? res.data : res.data.elements;

    setPlaces(data || []);
    setRouteCoords([]);
    setEta(null);
    setSelectedPlace(null);
  } catch (err) {
    console.log(err);
    alert("Backend error: Cannot fetch places");
  }
};


  // ✅ Fetch route using OSRM (FREE)
  const fetchRoute = async (destLat, destLon, placeName) => {
    try {
      const res = await axios.get(
        `https://router.project-osrm.org/route/v1/driving/${location.lng},${location.lat};${destLon},${destLat}?overview=full&geometries=geojson`
      );

      const coords = res.data.routes[0].geometry.coordinates.map((c) => [
        c[1],
        c[0],
      ]);

      const duration = res.data.routes[0].duration; // seconds
      const minutes = (duration / 60).toFixed(1);

      setRouteCoords(coords);
      setEta(minutes);
      setSelectedPlace(placeName);
    } catch (err) {
      console.log(err);
      alert("Route fetch failed!");
    }
  };

  if (!location) return <h1>Getting your location...</h1>;

  // ✅ Filter places within 2km
  const filteredPlaces = places
    .map((p) => {
      const lat = p.lat || p.center?.lat;
      const lon = p.lon || p.center?.lon;

      if (!lat || !lon) return null;

      const dist = getDistance(location.lat, location.lng, lat, lon);

      return {
        ...p,
        realLat: lat,
        realLon: lon,
        distance: dist,
      };
    })
    .filter((p) => p !== null && p.distance <= radiusLimit)
    .sort((a, b) => a.distance - b.distance);

  return (
    <div style={{ padding: "10px" }}>
      <h1 style={{ fontSize: "26px", fontWeight: "bold", color: "red" }}>
        🚨 Emergency Tracker
      </h1>

      {/* ✅ Manual Location Search */}
      <div style={{ marginBottom: "10px", display: "flex", gap: "10px" }}>
        <input
          type="text"
          placeholder="Enter location (eg: Raj Nagar Ghaziabad)"
          value={manualLocation}
          onChange={(e) => setManualLocation(e.target.value)}
          style={{
            padding: "10px",
            width: "70%",
            borderRadius: "6px",
            border: "1px solid gray",
          }}
        />
        <button
          onClick={searchLocation}
          style={{
            padding: "10px",
            borderRadius: "6px",
            cursor: "pointer",
          }}
        >
          🔍 Search
        </button>
      </div>

      {/* ✅ Buttons */}
      <div
        style={{
          marginTop: "10px",
          marginBottom: "10px",
          display: "flex",
          gap: "10px",
        }}
      >
        <button onClick={() => fetchPlaces("hospital")}>🏥 Hospitals</button>
        <button onClick={() => fetchPlaces("blood_bank")}>
          🩸 Blood Banks
        </button>
        <button onClick={() => fetchPlaces("pharmacy")}>💊 Pharmacies</button>
      </div>

      {/* ✅ Route Info */}
      {eta && (
        <h3 style={{ color: "green" }}>
          🛣️ Route to {selectedPlace} | ETA: {eta} min
        </h3>
      )}

      <div style={{ display: "flex", gap: "10px" }}>
        {/* ✅ Left List */}
        <div
          style={{
            width: "30%",
            height: "500px",
            overflowY: "scroll",
            border: "1px solid gray",
            padding: "10px",
            borderRadius: "10px",
          }}
        >
          <h2>📌 Nearby (within 2km)</h2>

          {filteredPlaces.length === 0 && (
            <p>No places found within 2km.</p>
          )}

          {filteredPlaces.map((p, i) => (
            <div
              key={i}
              style={{
                padding: "10px",
                borderBottom: "1px solid #ccc",
                cursor: "pointer",
              }}
              onClick={() =>
                fetchRoute(
                  p.realLat,
                  p.realLon,
                  p.tags?.name || "Unknown Place"
                )
              }
            >
              <b>{p.tags?.name || "Unknown Place"}</b>
              <p style={{ margin: "5px 0" }}>{p.tags?.amenity || ""}</p>
              <p style={{ color: "blue" }}>
                Distance: {p.distance.toFixed(2)} km
              </p>
            </div>
          ))}
        </div>

        {/* ✅ Map */}
        <MapContainer
          center={[location.lat, location.lng]}
          zoom={13}
          style={{ height: "500px", width: "70%" }}
        >
          <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />

          {/* User Marker */}
          <Marker position={[location.lat, location.lng]}>
            <Popup>📍 You are here</Popup>
          </Marker>

          {/* Places Markers */}
          {filteredPlaces.map((p, i) => (
            <Marker
              key={i}
              position={[p.realLat, p.realLon]}
              eventHandlers={{
                click: () =>
                  fetchRoute(
                    p.realLat,
                    p.realLon,
                    p.tags?.name || "Unknown Place"
                  ),
              }}
            >
              <Popup>
                <b>{p.tags?.name || "Unknown Place"}</b> <br />
                {p.tags?.amenity || ""} <br />
                <b>Distance:</b> {p.distance.toFixed(2)} km <br />
                <br />
                <i>Click marker to see route</i>
              </Popup>
            </Marker>
          ))}

          {/* Route Line */}
          {routeCoords.length > 0 && <Polyline positions={routeCoords} />}
        </MapContainer>
      </div>
    </div>
  );
}
