import React, { useCallback, useContext, useEffect, useMemo, useState } from "react";
import api from "../api/api";
import MainLayout from "../layout/MainLayout";
import { AuthContext } from "../context/AuthContext.jsx";

function TicketsPage() {
  const { auth } = useContext(AuthContext);
  const isAdmin = auth.role === "ROLE_ADMIN";
  const isTechnician = auth.role === "ROLE_TECHNICIAN";

  const [resources, setResources] = useState([]);
  const [tickets, setTickets] = useState([]);
  const [feedback, setFeedback] = useState("");
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [categoryFilter, setCategoryFilter] = useState("");
  const [resourceFilter, setResourceFilter] = useState("");

  const [form, setForm] = useState({
    resourceId: "",
    location: "",
    category: "GENERAL",
    description: "",
    priority: "MEDIUM",
    preferredContact: "",
    attachmentsRaw: "",
  });

  const [commentDrafts, setCommentDrafts] = useState({});
  const [commentData, setCommentData] = useState({});

  const loadResources = useCallback(async () => {
    try {
      const response = await api.get("/resources");
      setResources(response.data || []);
    } catch (_error) {
      setFeedback("Unable to load resources");
    }
  }, []);

  const loadTickets = useCallback(async () => {
    try {
      const params = new URLSearchParams();
      if (statusFilter !== "ALL") {
        params.set("status", statusFilter);
      }
      if (categoryFilter.trim()) {
        params.set("category", categoryFilter.trim());
      }
      if (resourceFilter) {
        params.set("resourceId", resourceFilter);
      }

      const response = await api.get(`/tickets${params.toString() ? `?${params.toString()}` : ""}`);
      setTickets(response.data || []);
      setFeedback("");
    } catch (error) {
      setFeedback(error.response?.data || "Unable to load tickets");
    }
  }, [categoryFilter, resourceFilter, statusFilter]);

  const loadComments = useCallback(async (ticketId) => {
    try {
      const response = await api.get(`/tickets/${ticketId}/comments`);
      setCommentData((previous) => ({ ...previous, [ticketId]: response.data || [] }));
    } catch (_error) {
      setCommentData((previous) => ({ ...previous, [ticketId]: [] }));
    }
  }, []);

  useEffect(() => {
    loadResources();
  }, [loadResources]);

  useEffect(() => {
    loadTickets();
  }, [loadTickets]);

  useEffect(() => {
    tickets.slice(0, 10).forEach((ticket) => {
      loadComments(ticket.id);
    });
  }, [tickets, loadComments]);

  const createTicket = async (event) => {
    event.preventDefault();

    const attachments = form.attachmentsRaw
      .split("\n")
      .map((item) => item.trim())
      .filter(Boolean)
      .slice(0, 3);

    const payload = {
      resource: form.resourceId ? { id: Number(form.resourceId) } : null,
      location: form.location,
      category: form.category,
      description: form.description,
      priority: form.priority,
      preferredContact: form.preferredContact,
      attachments,
    };

    try {
      await api.post("/tickets", payload);
      setFeedback("Ticket created successfully.");
      setForm({
        resourceId: "",
        location: "",
        category: "GENERAL",
        description: "",
        priority: "MEDIUM",
        preferredContact: "",
        attachmentsRaw: "",
      });
      loadTickets();
    } catch (error) {
      setFeedback(error.response?.data || "Unable to create ticket");
    }
  };

  const updateTicketStatus = async (ticket, status) => {
    try {
      const params = new URLSearchParams();
      params.set("status", status);

      if (status === "REJECTED") {
        const reason = window.prompt("Enter rejection reason:");
        if (!reason) {
          return;
        }
        params.set("reason", reason);
      }

      if (status === "RESOLVED") {
        const notes = window.prompt("Enter resolution notes:");
        if (!notes) {
          return;
        }
        params.set("resolutionNotes", notes);
      }

      await api.put(`/tickets/${ticket.id}/status?${params.toString()}`);
      setFeedback(`Ticket #${ticket.id} updated to ${status}.`);
      loadTickets();
    } catch (error) {
      setFeedback(error.response?.data || "Unable to update ticket status");
    }
  };

  const assignTicket = async (ticketId) => {
    const assignee = window.prompt("Assign to username (example: tech):");
    if (!assignee) {
      return;
    }

    try {
      await api.put(`/tickets/${ticketId}/assign?assignee=${encodeURIComponent(assignee)}`);
      setFeedback(`Ticket #${ticketId} assigned to ${assignee}.`);
      loadTickets();
    } catch (error) {
      setFeedback(error.response?.data || "Unable to assign ticket");
    }
  };

  const addComment = async (ticketId) => {
    const text = (commentDrafts[ticketId] || "").trim();
    if (!text) {
      return;
    }

    try {
      await api.post(`/tickets/${ticketId}/comments`, { content: text });
      setCommentDrafts((previous) => ({ ...previous, [ticketId]: "" }));
      await loadComments(ticketId);
      setFeedback("Comment added.");
    } catch (error) {
      setFeedback(error.response?.data || "Unable to add comment");
    }
  };

  const ticketCounts = useMemo(
    () => ({
      total: tickets.length,
      open: tickets.filter((item) => item.status === "OPEN").length,
      progress: tickets.filter((item) => item.status === "IN_PROGRESS").length,
      resolved: tickets.filter((item) => item.status === "RESOLVED").length,
    }),
    [tickets]
  );

  return (
    <MainLayout role={auth.role}>
      <div className="mb-6 rounded-3xl border border-fuchsia-300/30 bg-gradient-to-r from-fuchsia-500/20 to-cyan-500/20 p-6">
        <h2 className="text-3xl font-bold">Maintenance & Incident Ticketing</h2>
        <p className="mt-2 text-slate-100">Create, triage, assign, and resolve incident tickets with full workflow tracking.</p>
        <p className="mt-1 text-sm text-slate-200">
          Total: {ticketCounts.total} | OPEN: {ticketCounts.open} | IN_PROGRESS: {ticketCounts.progress} | RESOLVED: {ticketCounts.resolved}
        </p>
      </div>

      {feedback && <div className="mb-4 rounded-xl bg-black/30 p-3 text-sm">{feedback}</div>}

      <form onSubmit={createTicket} className="mb-6 grid gap-3 rounded-2xl border border-white/10 bg-white/10 p-5 md:grid-cols-2">
        <select
          className="rounded-lg border border-white/20 bg-black/20 p-2"
          value={form.resourceId}
          onChange={(e) => setForm({ ...form, resourceId: e.target.value })}
        >
          <option value="">No linked resource</option>
          {resources.map((resource) => (
            <option key={resource.id} value={resource.id}>{resource.name}</option>
          ))}
        </select>

        <input
          className="rounded-lg border border-white/20 bg-black/20 p-2"
          placeholder="Location (building/floor/room)"
          value={form.location}
          onChange={(e) => setForm({ ...form, location: e.target.value })}
          required
        />

        <input
          className="rounded-lg border border-white/20 bg-black/20 p-2"
          placeholder="Category (Electrical / Network / Equipment...)"
          value={form.category}
          onChange={(e) => setForm({ ...form, category: e.target.value })}
          required
        />

        <select
          className="rounded-lg border border-white/20 bg-black/20 p-2"
          value={form.priority}
          onChange={(e) => setForm({ ...form, priority: e.target.value })}
        >
          <option value="LOW">LOW</option>
          <option value="MEDIUM">MEDIUM</option>
          <option value="HIGH">HIGH</option>
          <option value="CRITICAL">CRITICAL</option>
        </select>

        <input
          className="rounded-lg border border-white/20 bg-black/20 p-2"
          placeholder="Preferred contact (email/phone)"
          value={form.preferredContact}
          onChange={(e) => setForm({ ...form, preferredContact: e.target.value })}
          required
        />

        <textarea
          className="rounded-lg border border-white/20 bg-black/20 p-2 md:col-span-2"
          placeholder="Description"
          value={form.description}
          onChange={(e) => setForm({ ...form, description: e.target.value })}
          rows={3}
          required
        />

        <textarea
          className="rounded-lg border border-white/20 bg-black/20 p-2 md:col-span-2"
          placeholder="Attachment URLs (max 3, one per line)"
          value={form.attachmentsRaw}
          onChange={(e) => setForm({ ...form, attachmentsRaw: e.target.value })}
          rows={3}
        />

        <button className="rounded-lg bg-fuchsia-500 px-4 py-2 font-semibold text-slate-950 hover:bg-fuchsia-400 md:col-span-2" type="submit">
          Create Ticket
        </button>
      </form>

      <div className="mb-5 grid gap-3 rounded-2xl border border-white/10 bg-white/10 p-4 md:grid-cols-4">
        <select className="rounded-lg border border-white/20 bg-black/20 p-2" value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}>
          <option value="ALL">All Statuses</option>
          <option value="OPEN">OPEN</option>
          <option value="IN_PROGRESS">IN_PROGRESS</option>
          <option value="RESOLVED">RESOLVED</option>
          <option value="CLOSED">CLOSED</option>
          <option value="REJECTED">REJECTED</option>
        </select>

        <input className="rounded-lg border border-white/20 bg-black/20 p-2" placeholder="Category" value={categoryFilter} onChange={(e) => setCategoryFilter(e.target.value)} />

        <select className="rounded-lg border border-white/20 bg-black/20 p-2" value={resourceFilter} onChange={(e) => setResourceFilter(e.target.value)}>
          <option value="">All resources</option>
          {resources.map((resource) => (
            <option key={resource.id} value={resource.id}>{resource.name}</option>
          ))}
        </select>

        <button className="rounded-lg bg-cyan-600 px-4 py-2 font-semibold hover:bg-cyan-500" onClick={loadTickets} type="button">
          Refresh
        </button>
      </div>

      <div className="grid gap-3 lg:grid-cols-2">
        {tickets.map((ticket) => (
          <div key={ticket.id} className="rounded-2xl border border-white/10 bg-black/20 p-4">
            <div className="mb-2 flex items-center justify-between gap-2">
              <h4 className="font-semibold">#{ticket.id} {ticket.category}</h4>
              <span className="rounded-full bg-white/15 px-2 py-1 text-xs">{ticket.status}</span>
            </div>
            <p className="text-sm text-slate-200">Priority: {ticket.priority}</p>
            <p className="text-sm text-slate-200">Location: {ticket.location}</p>
            <p className="text-sm text-slate-200">Resource: {ticket.resource?.name || "-"}</p>
            <p className="text-sm text-slate-200">Contact: {ticket.preferredContact}</p>
            <p className="mt-2 text-sm text-slate-100">{ticket.description}</p>
            {!!ticket.attachments?.length && (
              <div className="mt-2 text-xs text-cyan-100">Attachments: {ticket.attachments.length}</div>
            )}
            {ticket.assignedTo && <p className="mt-1 text-xs text-slate-300">Assigned to: {ticket.assignedTo}</p>}
            {ticket.rejectionReason && <p className="mt-1 text-xs text-rose-200">Reason: {ticket.rejectionReason}</p>}
            {ticket.resolutionNotes && <p className="mt-1 text-xs text-emerald-200">Resolution: {ticket.resolutionNotes}</p>}

            {(isAdmin || isTechnician) && (
              <div className="mt-3 flex flex-wrap gap-2">
                {ticket.status === "OPEN" && (
                  <>
                    <button className="rounded bg-amber-400 px-3 py-1 text-black" onClick={() => updateTicketStatus(ticket, "IN_PROGRESS")}>Start</button>
                    <button className="rounded bg-rose-500 px-3 py-1" onClick={() => updateTicketStatus(ticket, "REJECTED")}>Reject</button>
                  </>
                )}
                {ticket.status === "IN_PROGRESS" && (
                  <>
                    <button className="rounded bg-emerald-500 px-3 py-1 text-black" onClick={() => updateTicketStatus(ticket, "RESOLVED")}>Resolve</button>
                    <button className="rounded bg-rose-500 px-3 py-1" onClick={() => updateTicketStatus(ticket, "REJECTED")}>Reject</button>
                  </>
                )}
                {ticket.status === "RESOLVED" && (
                  <button className="rounded bg-cyan-500 px-3 py-1 text-black" onClick={() => updateTicketStatus(ticket, "CLOSED")}>Close</button>
                )}
                {isAdmin && <button className="rounded bg-indigo-500 px-3 py-1" onClick={() => assignTicket(ticket.id)}>Assign</button>}
              </div>
            )}

            <div className="mt-4 rounded-lg border border-white/10 bg-black/25 p-3">
              <p className="mb-2 text-xs uppercase tracking-wide text-slate-300">Comments</p>
              {(commentData[ticket.id] || []).map((comment) => (
                <div key={comment.id} className="mb-2 rounded bg-white/10 p-2 text-sm">
                  <p className="text-xs text-slate-300">{comment.authorUsername}</p>
                  <p>{comment.content}</p>
                </div>
              ))}

              <div className="mt-2 flex gap-2">
                <input
                  className="w-full rounded border border-white/20 bg-black/20 p-2 text-sm"
                  placeholder="Add comment"
                  value={commentDrafts[ticket.id] || ""}
                  onChange={(e) => setCommentDrafts((previous) => ({ ...previous, [ticket.id]: e.target.value }))}
                />
                <button className="rounded bg-cyan-600 px-3 py-1 text-sm" onClick={() => addComment(ticket.id)}>
                  Post
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </MainLayout>
  );
}

export default TicketsPage;
