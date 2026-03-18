import { useEffect, useMemo, useState } from "react";
import MainLayout from "../layout/MainLayout";
import { useContext } from "react";
import { AuthContext } from "../context/AuthContext.jsx";
import api from "../api/api";

function ResourcesPage() {
  const { auth } = useContext(AuthContext);
  const isAdmin = auth.role === "ROLE_ADMIN";

  const emptyForm = {
    name: "",
    type: "ROOM",
    capacity: 1,
    location: "",
    availabilityStart: "08:00",
    availabilityEnd: "18:00",
    status: "ACTIVE",
  };

  const [resources, setResources] = useState([]);
  const [form, setForm] = useState(emptyForm);
  const [editingId, setEditingId] = useState(null);
  const [feedback, setFeedback] = useState("");
  const [filters, setFilters] = useState({
    type: "ALL",
    minCapacity: "",
    location: "",
    status: "ALL",
  });

  const loadResources = async () => {
    try {
      const params = new URLSearchParams();
      if (filters.type !== "ALL") params.set("type", filters.type);
      if (filters.status !== "ALL") params.set("status", filters.status);
      if (filters.minCapacity) params.set("minCapacity", filters.minCapacity);
      if (filters.location.trim()) params.set("location", filters.location.trim());

      const response = await api.get(`/resources${params.toString() ? `?${params.toString()}` : ""}`);
      setResources(response.data);
      setFeedback("");
    } catch (err) {
      setFeedback(err.response?.data || "Unable to load resources");
    }
  };

  useEffect(() => {
    loadResources();
  }, [filters]);

  const submitForm = async (event) => {
    event.preventDefault();

    try {
      if (editingId) {
        await api.put(`/resources/${editingId}`, form);
        setFeedback("Resource updated successfully.");
      } else {
        await api.post("/resources", form);
        setFeedback("Resource created successfully.");
      }

      setForm(emptyForm);
      setEditingId(null);
      await loadResources();
    } catch (err) {
      setFeedback(err.response?.data || "Unable to save resource");
    }
  };

  const handleEdit = (resource) => {
    setEditingId(resource.id);
    setForm({
      name: resource.name,
      type: resource.type,
      capacity: resource.capacity,
      location: resource.location,
      availabilityStart: resource.availabilityStart || "08:00",
      availabilityEnd: resource.availabilityEnd || "18:00",
      status: resource.status,
    });
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Delete this resource?")) {
      return;
    }

    try {
      await api.delete(`/resources/${id}`);
      setFeedback("Resource deleted successfully.");
      await loadResources();
    } catch (err) {
      setFeedback(err.response?.data || "Unable to delete resource");
    }
  };

  const activeCount = useMemo(
    () => resources.filter((item) => item.status === "ACTIVE").length,
    [resources]
  );

  return (
    <MainLayout role={auth.role}>
      <div className="mb-6 rounded-3xl border border-cyan-300/30 bg-gradient-to-r from-cyan-400/20 to-teal-400/20 p-6">
        <h1 className="text-3xl font-bold">Campus Resources</h1>
        <p className="mt-2 text-slate-100">Manage rooms, labs, and equipment availability in one place.</p>
        <p className="mt-1 text-sm text-slate-200">Total: {resources.length} | Active: {activeCount}</p>
      </div>

      {feedback && <div className="mb-4 rounded-xl bg-black/30 p-3 text-sm">{feedback}</div>}

      <div className="mb-4 grid gap-3 rounded-2xl border border-white/10 bg-white/10 p-4 md:grid-cols-4">
        <select className="rounded-lg border border-white/20 bg-black/20 p-2" value={filters.type} onChange={(e) => setFilters({ ...filters, type: e.target.value })}>
          <option value="ALL">All Types</option>
          <option value="ROOM">ROOM</option>
          <option value="LAB">LAB</option>
          <option value="EQUIPMENT">EQUIPMENT</option>
        </select>

        <input className="rounded-lg border border-white/20 bg-black/20 p-2" type="number" min="1" placeholder="Min capacity" value={filters.minCapacity} onChange={(e) => setFilters({ ...filters, minCapacity: e.target.value })} />

        <input className="rounded-lg border border-white/20 bg-black/20 p-2" placeholder="Location contains" value={filters.location} onChange={(e) => setFilters({ ...filters, location: e.target.value })} />

        <select className="rounded-lg border border-white/20 bg-black/20 p-2" value={filters.status} onChange={(e) => setFilters({ ...filters, status: e.target.value })}>
          <option value="ALL">All Statuses</option>
          <option value="ACTIVE">ACTIVE</option>
          <option value="OUT_OF_SERVICE">OUT_OF_SERVICE</option>
        </select>
      </div>

      {isAdmin && (
        <form onSubmit={submitForm} className="mb-6 grid gap-3 rounded-2xl border border-white/10 bg-white/10 p-5 md:grid-cols-3">
          <input className="rounded-lg border border-white/20 bg-black/20 p-2" placeholder="Resource Name" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required />

          <select className="rounded-lg border border-white/20 bg-black/20 p-2" value={form.type} onChange={(e) => setForm({ ...form, type: e.target.value })}>
            <option value="ROOM">ROOM</option>
            <option value="LAB">LAB</option>
            <option value="EQUIPMENT">EQUIPMENT</option>
          </select>

          <input className="rounded-lg border border-white/20 bg-black/20 p-2" type="number" min="1" placeholder="Capacity" value={form.capacity} onChange={(e) => setForm({ ...form, capacity: Number(e.target.value) })} required />

          <input className="rounded-lg border border-white/20 bg-black/20 p-2" placeholder="Location" value={form.location} onChange={(e) => setForm({ ...form, location: e.target.value })} required />

          <input className="rounded-lg border border-white/20 bg-black/20 p-2" type="time" value={form.availabilityStart} onChange={(e) => setForm({ ...form, availabilityStart: e.target.value })} />

          <input className="rounded-lg border border-white/20 bg-black/20 p-2" type="time" value={form.availabilityEnd} onChange={(e) => setForm({ ...form, availabilityEnd: e.target.value })} />

          <select className="rounded-lg border border-white/20 bg-black/20 p-2 md:col-span-2" value={form.status} onChange={(e) => setForm({ ...form, status: e.target.value })}>
            <option value="ACTIVE">ACTIVE</option>
            <option value="OUT_OF_SERVICE">OUT_OF_SERVICE</option>
          </select>

          <div className="flex gap-2">
            <button className="rounded-lg bg-cyan-600 px-4 py-2 font-semibold hover:bg-cyan-500" type="submit">
              {editingId ? "Update" : "Create"}
            </button>
            {editingId && (
              <button
                className="rounded-lg bg-slate-600 px-4 py-2 font-semibold hover:bg-slate-500"
                type="button"
                onClick={() => {
                  setEditingId(null);
                  setForm(emptyForm);
                }}
              >
                Cancel
              </button>
            )}
          </div>
        </form>
      )}

      <div className="overflow-x-auto rounded-2xl border border-white/10 bg-black/20">
        <table className="w-full min-w-[760px] text-left text-sm">
          <thead className="bg-white/10 text-slate-200">
            <tr>
              <th className="px-4 py-3">Name</th>
              <th className="px-4 py-3">Type</th>
              <th className="px-4 py-3">Capacity</th>
              <th className="px-4 py-3">Location</th>
              <th className="px-4 py-3">Window</th>
              <th className="px-4 py-3">Status</th>
              {isAdmin && <th className="px-4 py-3">Actions</th>}
            </tr>
          </thead>
          <tbody>
            {resources.map((resource) => (
              <tr key={resource.id} className="border-t border-white/10">
                <td className="px-4 py-3 font-medium">{resource.name}</td>
                <td className="px-4 py-3">{resource.type}</td>
                <td className="px-4 py-3">{resource.capacity}</td>
                <td className="px-4 py-3">{resource.location}</td>
                <td className="px-4 py-3">{resource.availabilityStart} - {resource.availabilityEnd}</td>
                <td className="px-4 py-3">{resource.status}</td>
                {isAdmin && (
                  <td className="px-4 py-3">
                    <div className="flex gap-2">
                      <button className="rounded bg-amber-500 px-3 py-1 text-black" onClick={() => handleEdit(resource)}>Edit</button>
                      <button className="rounded bg-rose-600 px-3 py-1" onClick={() => handleDelete(resource.id)}>Delete</button>
                    </div>
                  </td>
                )}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </MainLayout>
  );
}

export default ResourcesPage;