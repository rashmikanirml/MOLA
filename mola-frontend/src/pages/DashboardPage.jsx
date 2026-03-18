import React, { useContext, useEffect, useMemo, useRef, useState } from "react";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import markerIcon2x from "leaflet/dist/images/marker-icon-2x.png";
import markerIcon from "leaflet/dist/images/marker-icon.png";
import markerShadow from "leaflet/dist/images/marker-shadow.png";
import { Circle, MapContainer, Marker, Popup, TileLayer, useMap } from "react-leaflet";
import api from "../api/api";
import MainLayout from "../layout/MainLayout";
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
        duration: 1,
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

function buildLocalAssistantReply(message, context) {
  const text = (message || "").toLowerCase();

  if (text.includes("pending") || text.includes("approval")) {
    return `There are currently ${context.stats.PENDING || 0} pending bookings. Prioritize high-impact spaces first and clear old requests to reduce queue time.`;
  }

  if (text.includes("resource") || text.includes("room") || text.includes("lab")) {
    return `${context.activeResources} out of ${context.totalResources} resources are ACTIVE. You can open the Resources page to activate unavailable spaces and improve booking throughput.`;
  }

  if (text.includes("today") || text.includes("schedule") || text.includes("calendar")) {
    return `Today has ${context.todaysBookings} bookings scheduled. Check the Overview Calendar and Recent Bookings panel for quick conflict scanning.`;
  }

  if (text.includes("status") || text.includes("summary") || text.includes("overview")) {
    return `Current snapshot: Total ${context.stats.TOTAL || 0}, Pending ${context.stats.PENDING || 0}, Approved ${context.stats.APPROVED || 0}, Rejected ${context.stats.REJECTED || 0}, Cancelled ${context.stats.CANCELLED || 0}.`;
  }

  return "I can help with booking status, pending approvals, resource utilization, and schedule insights. Ask something like: 'How many pending requests do we have?'";
}

function DashboardPage() {
  const { auth } = useContext(AuthContext);
  const watchRef = useRef(null);
  const chatBottomRef = useRef(null);

  const [stats, setStats] = useState({ TOTAL: 0, PENDING: 0, APPROVED: 0, REJECTED: 0, CANCELLED: 0 });
  const [resources, setResources] = useState([]);
  const [allBookings, setAllBookings] = useState([]);
  const [recentBookings, setRecentBookings] = useState([]);
  const [monthAnchor, setMonthAnchor] = useState(new Date());
  const [location, setLocation] = useState(null);
  const [locationError, setLocationError] = useState("");
  const [error, setError] = useState("");
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [chatInput, setChatInput] = useState("");
  const [isChatLoading, setIsChatLoading] = useState(false);
  const [chatMessages, setChatMessages] = useState([
    {
      id: "welcome",
      role: "assistant",
      text: "Hi, I am MOLA AI Assistant. I can summarize bookings, resource activity, and operational signals from this dashboard.",
      createdAt: new Date().toISOString(),
    },
  ]);

  const loadStats = async () => {
    try {
      const [statsResponse, resourcesResponse, bookingsResponse] = await Promise.all([
        api.get("/bookings/stats"),
        api.get("/resources"),
        api.get("/bookings"),
      ]);

      setStats(statsResponse.data);
      setResources(resourcesResponse.data);
      setAllBookings(bookingsResponse.data || []);

      const sorted = [...bookingsResponse.data].sort(
        (a, b) => new Date(b.startTime).getTime() - new Date(a.startTime).getTime()
      );
      setRecentBookings(sorted.slice(0, 5));
      setError("");
    } catch (err) {
      setError(err.response?.data || "Unable to load dashboard data");
    }
  };

  useEffect(() => {
    loadStats();
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
      (geoError) => {
        setLocationError(geoError.message || "Unable to access live location.");
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

  const activeResources = useMemo(
    () => resources.filter((item) => item.status === "ACTIVE").length,
    [resources]
  );

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

    allBookings.forEach((booking) => {
      const dateKey = toDateKey(booking.startTime);
      const list = grouped.get(dateKey) || [];
      list.push(booking);
      grouped.set(dateKey, list);
    });

    return grouped;
  }, [allBookings]);

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
  }, [bookingsByDay, monthMeta, monthStart]);

  const todaysBookings = useMemo(() => {
    const todayKey = toDateKey(new Date());
    return bookingsByDay.get(todayKey)?.length || 0;
  }, [bookingsByDay]);

  useEffect(() => {
    if (chatBottomRef.current) {
      chatBottomRef.current.scrollIntoView({ behavior: "smooth", block: "end" });
    }
  }, [chatMessages, isChatLoading]);

  const handleChatSubmit = async (event) => {
    event.preventDefault();

    const trimmed = chatInput.trim();
    if (!trimmed || isChatLoading) {
      return;
    }

    const userMessage = {
      id: `user-${Date.now()}`,
      role: "user",
      text: trimmed,
      createdAt: new Date().toISOString(),
    };

    const dashboardContext = {
      stats,
      totalResources: resources.length,
      activeResources,
      todaysBookings,
    };

    setChatMessages((previous) => [...previous, userMessage]);
    setChatInput("");
    setIsChatLoading(true);

    try {
      const response = await api.post("/ai/chat", {
        message: trimmed,
        context: dashboardContext,
      });

      const assistantText =
        response?.data?.reply ||
        response?.data?.message ||
        buildLocalAssistantReply(trimmed, dashboardContext);

      setChatMessages((previous) => [
        ...previous,
        {
          id: `assistant-${Date.now()}`,
          role: "assistant",
          text: assistantText,
          createdAt: new Date().toISOString(),
        },
      ]);
    } catch (_err) {
      const fallback = buildLocalAssistantReply(trimmed, dashboardContext);
      setChatMessages((previous) => [
        ...previous,
        {
          id: `assistant-fallback-${Date.now()}`,
          role: "assistant",
          text: fallback,
          createdAt: new Date().toISOString(),
        },
      ]);
    } finally {
      setIsChatLoading(false);
    }
  };

  const mapCenter = location || { lat: 13.0827, lng: 80.2707, accuracy: 1000 };

  return (
    <MainLayout role={auth.role}>
      <div className="mb-8 rounded-3xl border border-cyan-300/30 bg-gradient-to-r from-cyan-500/20 to-amber-500/20 p-8">
        <h1 className="text-3xl font-bold">MOLA Operations Hub</h1>
        <p className="mt-2 text-slate-200">Live operations snapshot for bookings, spaces, and service reliability.</p>
      </div>

      {error && (
        <div className="mb-6 rounded-xl border border-rose-500/50 bg-rose-500/20 p-4 text-rose-100">
          {error}
        </div>
      )}

      <div className="grid gap-4 md:grid-cols-5">
        <div className="rounded-2xl border border-white/10 bg-white/10 p-4">
          <p className="text-sm text-slate-300">Total Bookings</p>
          <p className="mt-1 text-3xl font-bold">{stats.TOTAL || 0}</p>
        </div>
        <div className="rounded-2xl border border-white/10 bg-amber-300/20 p-4">
          <p className="text-sm text-slate-100">Pending</p>
          <p className="mt-1 text-3xl font-bold">{stats.PENDING || 0}</p>
        </div>
        <div className="rounded-2xl border border-white/10 bg-emerald-300/20 p-4">
          <p className="text-sm text-slate-100">Approved</p>
          <p className="mt-1 text-3xl font-bold">{stats.APPROVED || 0}</p>
        </div>
        <div className="rounded-2xl border border-white/10 bg-sky-300/20 p-4">
          <p className="text-sm text-slate-100">Resources</p>
          <p className="mt-1 text-3xl font-bold">{resources.length}</p>
        </div>
        <div className="rounded-2xl border border-white/10 bg-lime-300/20 p-4">
          <p className="text-sm text-slate-100">Active Resources</p>
          <p className="mt-1 text-3xl font-bold">{activeResources}</p>
        </div>
      </div>

      <div className="mt-8 grid gap-6 lg:grid-cols-2">
        <section className="rounded-2xl border border-white/10 bg-black/20 p-5">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-xl font-semibold">Overview Calendar</h2>
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
                className={`min-h-[88px] rounded-lg border border-white/10 p-2 ${
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
            <h2 className="text-xl font-semibold">Satellite Live Tracker</h2>
            <span className="rounded-full bg-emerald-500/20 px-3 py-1 text-xs">
              {location ? "LIVE" : "Waiting GPS"}
            </span>
          </div>

          {locationError && (
            <p className="mb-3 rounded bg-rose-500/20 p-2 text-sm text-rose-100">
              {locationError}
            </p>
          )}

          <div className="h-[360px] overflow-hidden rounded-xl border border-white/10">
            <MapContainer
              center={[mapCenter.lat, mapCenter.lng]}
              zoom={15}
              scrollWheelZoom
              className="h-full w-full"
            >
              <TileLayer
                attribution='Tiles &copy; Esri &mdash; Source: Esri, Maxar, Earthstar Geographics'
                url="https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}"
              />
              <Marker position={[mapCenter.lat, mapCenter.lng]}>
                <Popup>
                  You are here.<br />
                  Accuracy: {Math.round(mapCenter.accuracy || 0)} m
                </Popup>
              </Marker>
              <Circle
                center={[mapCenter.lat, mapCenter.lng]}
                radius={Math.max(mapCenter.accuracy || 35, 25)}
                pathOptions={{ color: "#38bdf8", fillColor: "#38bdf8", fillOpacity: 0.15 }}
              />
              <RecenterMap center={location} />
            </MapContainer>
          </div>
        </section>
      </div>

      <div className="mt-8 rounded-2xl border border-white/10 bg-white/10 p-6">
        <h2 className="mb-4 text-xl font-semibold">Recent Bookings</h2>
        {recentBookings.length === 0 && <p className="text-slate-300">No bookings found.</p>}
        {recentBookings.map((booking) => (
          <div key={booking.id} className="mb-3 rounded-xl border border-white/10 bg-black/20 p-3">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <p className="font-semibold">{booking.purpose || "Untitled booking"}</p>
              <span className="rounded-full bg-white/15 px-2 py-1 text-xs">{booking.status}</span>
            </div>
            <p className="text-sm text-slate-200">{booking.resource?.name} | {booking.startTime?.replace("T", " ")}</p>
          </div>
        ))}
      </div>


      {isChatOpen && (
        <section className="fixed bottom-24 right-4 z-50 w-[calc(100vw-2rem)] max-w-md rounded-2xl border border-cyan-300/30 bg-slate-950/95 p-4 shadow-2xl backdrop-blur sm:right-6">
          <div className="mb-3 flex items-center justify-between gap-3">
            <div>
              <h2 className="text-base font-semibold">AI Operations Chatbot</h2>
              <p className="text-xs text-slate-300">Live insights from dashboard data.</p>
            </div>
            <div className="flex items-center gap-2">
              <span className="rounded-full border border-cyan-300/30 bg-cyan-400/10 px-2 py-1 text-[10px] text-cyan-100">
                {isChatLoading ? "Thinking..." : "Ready"}
              </span>
              <button
                type="button"
                onClick={() => setIsChatOpen(false)}
                className="rounded-md border border-white/20 px-2 py-1 text-xs text-slate-200 hover:bg-white/10"
                aria-label="Close AI chatbot"
              >
                Close
              </button>
            </div>
          </div>

          <div className="h-[300px] overflow-y-auto rounded-xl border border-white/10 bg-black/30 p-3">
            {chatMessages.map((message) => (
              <div
                key={message.id}
                className={`mb-3 flex ${message.role === "user" ? "justify-end" : "justify-start"}`}
              >
                <div
                  className={`max-w-[88%] rounded-2xl px-4 py-2 text-sm ${
                    message.role === "user"
                      ? "bg-cyan-500/30 text-cyan-50"
                      : "border border-white/10 bg-white/10 text-slate-100"
                  }`}
                >
                  {message.text}
                </div>
              </div>
            ))}

            {isChatLoading && (
              <div className="mb-2 flex justify-start">
                <div className="rounded-2xl border border-white/10 bg-white/10 px-4 py-2 text-sm text-slate-300">
                  Analyzing dashboard context...
                </div>
              </div>
            )}

            <div ref={chatBottomRef} />
          </div>

          <form onSubmit={handleChatSubmit} className="mt-3 flex gap-2">
            <input
              type="text"
              value={chatInput}
              onChange={(event) => setChatInput(event.target.value)}
              placeholder="Ask: What is our booking status today?"
              className="w-full rounded-xl border border-white/15 bg-slate-900/60 px-4 py-2 text-sm text-slate-100 outline-none placeholder:text-slate-400 focus:border-cyan-300/60"
            />
            <button
              type="submit"
              disabled={isChatLoading || !chatInput.trim()}
              className="rounded-xl bg-cyan-500/80 px-4 py-2 text-sm font-semibold text-slate-950 transition hover:bg-cyan-400 disabled:cursor-not-allowed disabled:opacity-60"
            >
              Send
            </button>
          </form>
        </section>
      )}

      <button
        type="button"
        onClick={() => setIsChatOpen((open) => !open)}
        className="fixed bottom-6 right-4 z-50 rounded-full border border-cyan-300/40 bg-cyan-500/90 px-5 py-3 text-sm font-semibold text-slate-950 shadow-lg transition hover:bg-cyan-400 sm:right-6"
        aria-label="Toggle AI chatbot"
      >
        {isChatOpen ? "Hide AI Chat" : "AI Chat"}
      </button>
    </MainLayout>
  );
}

export default DashboardPage;