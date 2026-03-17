import React, { useEffect, useMemo, useRef, useState } from "react";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import markerIcon2x from "leaflet/dist/images/marker-icon-2x.png";
import markerIcon from "leaflet/dist/images/marker-icon.png";
import markerShadow from "leaflet/dist/images/marker-shadow.png";
import {
  Circle,
  MapContainer,
  Marker,
  Popup,
  TileLayer,
  useMap,
} from "react-leaflet";
import MainLayout from "../layout/MainLayout";
import api from "../api/api";
import { AuthContext } from "../context/AuthContext.jsx";

L.Icon.Default.mergeOptions({
  iconRetinaUrl: markerIcon2x,
  iconUrl: markerIcon,
  shadowUrl: markerShadow,
});

function RecenterMap({ center }) {
  const map = useMap();

  useEffect(() => {
    if (center) {
      map.flyTo([center.lat, center.lng], Math.max(map.getZoom(), 16), {
        duration: 1.2,
      });
    }
  }, [center, map]);

  return null;
}

function toDateKey(dateLike) {
  const value = new Date(dateLike);
  const year = value.getFullYear();
  const month = String(value.getMonth() + 1).padStart(2, "0");
  const day = String(value.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

function LiveOpsPage() {
  const { auth } = React.useContext(AuthContext);
  const watchRef = useRef(null);

  const [bookings, setBookings] = useState([]);
  const [monthAnchor, setMonthAnchor] = useState(new Date());
  const [location, setLocation] = useState(null);
  const [locationError, setLocationError] = useState("");

  useEffect(() => {
    const loadBookings = async () => {
      try {
        const response = await api.get("/bookings");
        setBookings(response.data || []);
      } catch (error) {
        setBookings([]);
      }
    };

    loadBookings();
  }, []);

  useEffect(() => {
    if (!navigator.geolocation) {
      setLocationError("Geolocation is not available in this browser.");
      return;
    }

    watchRef.current = navigator.geolocation.watchPosition(
      (position) => {
        setLocation({
          lat: position.coords.latitude,
          lng: position.coords.longitude,
          accuracy: position.coords.accuracy,
          updatedAt: new Date(position.timestamp),
        });
        setLocationError("");
      },
      (error) => {
        setLocationError(error.message || "Unable to access live location.");
      },
      {
        enableHighAccuracy: true,
        maximumAge: 5000,
        timeout: 10000,
      }
    );

    return () => {
      if (watchRef.current !== null) {
        navigator.geolocation.clearWatch(watchRef.current);
      }
    };
  }, []);

  const monthStart = useMemo(
    () => new Date(monthAnchor.getFullYear(), monthAnchor.getMonth(), 1),
    [monthAnchor]
  );

  const monthMeta = useMemo(() => {
    const firstDayIndex = monthStart.getDay();
    const totalDays = new Date(
      monthStart.getFullYear(),
      monthStart.getMonth() + 1,
      0
    ).getDate();

    return { firstDayIndex, totalDays };
  }, [monthStart]);

  const bookingsByDay = useMemo(() => {
    const grouped = new Map();

    bookings.forEach((booking) => {
      const dateKey = toDateKey(booking.startTime);
      const list = grouped.get(dateKey) || [];
      list.push(booking);
      grouped.set(dateKey, list);
    });

    return grouped;
  }, [bookings]);

  const dayTiles = useMemo(() => {
    const tiles = [];

    for (let i = 0; i < monthMeta.firstDayIndex; i += 1) {
      tiles.push({ key: `blank-${i}`, day: null });
    }

    for (let day = 1; day <= monthMeta.totalDays; day += 1) {
      const dateObj = new Date(
        monthStart.getFullYear(),
        monthStart.getMonth(),
        day
      );
      const key = toDateKey(dateObj);
      tiles.push({ key, day, bookings: bookingsByDay.get(key) || [] });
    }

    return tiles;
  }, [monthMeta, monthStart, bookingsByDay]);

  const center = location || { lat: 13.0827, lng: 80.2707, accuracy: 1000 };

  return (
    <MainLayout role={auth.role}>
      <div className="mb-6 rounded-3xl border border-sky-300/30 bg-gradient-to-r from-sky-500/20 to-emerald-500/20 p-6">
        <h1 className="text-3xl font-bold">MOLA Live Operations</h1>
        <p className="mt-2 text-slate-100">
          Track booking demand on calendar and monitor live field location over
          satellite imagery.
        </p>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <section className="rounded-2xl border border-white/10 bg-black/20 p-5">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-xl font-semibold">Operations Calendar</h2>
            <div className="flex gap-2">
              <button
                className="rounded bg-white/10 px-3 py-1"
                onClick={() =>
                  setMonthAnchor(
                    new Date(monthStart.getFullYear(), monthStart.getMonth() - 1, 1)
                  )
                }
              >
                Prev
              </button>
              <button
                className="rounded bg-white/10 px-3 py-1"
                onClick={() =>
                  setMonthAnchor(
                    new Date(monthStart.getFullYear(), monthStart.getMonth() + 1, 1)
                  )
                }
              >
                Next
              </button>
            </div>
          </div>

          <p className="mb-3 text-sm text-slate-300">
            {monthStart.toLocaleDateString(undefined, {
              month: "long",
              year: "numeric",
            })}
          </p>

          <div className="mb-2 grid grid-cols-7 gap-2 text-center text-xs uppercase tracking-wide text-slate-300">
            <span>Sun</span>
            <span>Mon</span>
            <span>Tue</span>
            <span>Wed</span>
            <span>Thu</span>
            <span>Fri</span>
            <span>Sat</span>
          </div>

          <div className="grid grid-cols-7 gap-2">
            {dayTiles.map((tile) => (
              <div
                key={tile.key}
                className={`min-h-[90px] rounded-lg border border-white/10 p-2 ${
                  tile.day ? "bg-white/5" : "bg-transparent"
                }`}
              >
                {tile.day && (
                  <>
                    <div className="text-sm font-semibold">{tile.day}</div>
                    {tile.bookings?.slice(0, 2).map((booking) => (
                      <div
                        key={booking.id}
                        className="mt-1 truncate rounded bg-sky-500/20 px-1 py-0.5 text-[10px]"
                        title={booking.purpose || "Booking"}
                      >
                        {booking.purpose || "Booking"}
                      </div>
                    ))}
                    {(tile.bookings?.length || 0) > 2 && (
                      <div className="mt-1 text-[10px] text-slate-300">
                        +{tile.bookings.length - 2} more
                      </div>
                    )}
                  </>
                )}
              </div>
            ))}
          </div>
        </section>

        <section className="rounded-2xl border border-white/10 bg-black/20 p-5">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-xl font-semibold">Live Location Tracker</h2>
            <span className="rounded-full bg-emerald-500/20 px-3 py-1 text-xs">
              {location ? "LIVE" : "Waiting GPS"}
            </span>
          </div>

          {locationError && (
            <p className="mb-3 rounded bg-rose-500/20 p-2 text-sm text-rose-100">
              {locationError}
            </p>
          )}

          <div className="h-[420px] overflow-hidden rounded-xl border border-white/10">
            <MapContainer
              center={[center.lat, center.lng]}
              zoom={15}
              scrollWheelZoom
              className="h-full w-full"
            >
              <TileLayer
                attribution='Tiles &copy; Esri &mdash; Source: Esri, Maxar, Earthstar Geographics'
                url="https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}"
              />
              <Marker position={[center.lat, center.lng]}>
                <Popup>
                  You are here.<br />
                  Accuracy: {Math.round(center.accuracy || 0)} m
                </Popup>
              </Marker>
              <Circle
                center={[center.lat, center.lng]}
                radius={Math.max(center.accuracy || 35, 25)}
                pathOptions={{ color: "#38bdf8", fillColor: "#38bdf8", fillOpacity: 0.15 }}
              />
              <RecenterMap center={location} />
            </MapContainer>
          </div>

          <div className="mt-3 grid gap-2 text-sm text-slate-200 md:grid-cols-2">
            <p>Latitude: {center.lat.toFixed(6)}</p>
            <p>Longitude: {center.lng.toFixed(6)}</p>
            <p>Accuracy: {Math.round(center.accuracy || 0)} meters</p>
            <p>
              Last update:{" "}
              {location?.updatedAt
                ? location.updatedAt.toLocaleTimeString()
                : "Not available"}
            </p>
          </div>
        </section>
      </div>
    </MainLayout>
  );
}

export default LiveOpsPage;
