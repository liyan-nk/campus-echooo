"use client";

import React, { useState, useEffect } from "react";
import { useAuth } from "@/context/AuthContext";
import { api } from "@/lib/api";
import { Calendar, Plus, MapPin, CheckCircle, QRcode, QrCode } from "lucide-react";

interface Event {
  id: string;
  title: string;
  description: string;
  date: string;
  location: string;
  qrCodeUrl?: string;
  club?: { name: string; logoUrl?: string };
  _count: { rsvps: number };
}

export default function EventsPage() {
  const { user } = useAuth();
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Create Event Form
  const [showCreate, setShowCreate] = useState(false);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [date, setDate] = useState("");
  const [location, setLocation] = useState("");
  const [clubId, setClubId] = useState("");

  const [activeQrEvent, setActiveQrEvent] = useState<Event | null>(null);

  const fetchEvents = async () => {
    setLoading(true);
    try {
      const data = await api.get<Event[]>("/campus/events");
      setEvents(data);
    } catch (e) {
      console.error("Failed to load events:", e);
      setEvents(getMockEvents());
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEvents();
  }, []);

  const handleRsvp = async (eventId: string) => {
    try {
      await api.post(`/campus/events/${eventId}/rsvp`, {});
      fetchEvents();
    } catch (err: any) {
      alert(err.message || "Failed to RSVP");
    }
  };

  const handleCreateEvent = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !description.trim() || !date || !location.trim()) return;

    try {
      await api.post("/campus/events", {
        title,
        description,
        date,
        location,
        clubId: clubId || undefined,
      });
      setTitle("");
      setDescription("");
      setDate("");
      setLocation("");
      setClubId("");
      setShowCreate(false);
      fetchEvents();
    } catch (err: any) {
      alert("Failed to schedule event: " + err.message);
    }
  };

  const isStaff = user && ["SUPER_ADMIN", "FACULTY", "UNIV_ADMIN"].includes(user.role);

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-white tracking-tight flex items-center gap-2">
            Campus Events <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-brand-primary/10 border border-brand-primary/20 text-brand-primary">Calendar</span>
          </h1>
          <p className="text-xs text-text-secondary mt-1">RSVP and attend academic and student assemblies.</p>
        </div>
        {isStaff && (
          <button
            onClick={() => setShowCreate(!showCreate)}
            className="flex items-center gap-1.5 px-4 py-2.5 bg-brand-primary hover:bg-brand-secondary text-white text-xs font-semibold rounded-xl cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            New Event
          </button>
        )}
      </div>

      {showCreate && (
        <form onSubmit={handleCreateEvent} className="glass-panel border border-dark-border p-6 rounded-2xl space-y-4">
          <h3 className="text-xs font-bold text-white uppercase tracking-wider">Schedule a New Event</h3>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-text-secondary mb-1.5 uppercase tracking-wider">
                Event Title
              </label>
              <input
                type="text"
                required
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g. Intro to Cyber Security"
                className="w-full px-4 py-3 bg-dark-bg border border-dark-border rounded-xl text-sm text-white focus:border-brand-primary focus:outline-none"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-text-secondary mb-1.5 uppercase tracking-wider">
                Date & Time
              </label>
              <input
                type="datetime-local"
                required
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="w-full px-4 py-3 bg-dark-bg border border-dark-border rounded-xl text-sm text-white focus:border-brand-primary focus:outline-none"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-text-secondary mb-1.5 uppercase tracking-wider">
                Location
              </label>
              <input
                type="text"
                required
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                placeholder="e.g. Auditorium B or Zoom Link"
                className="w-full px-4 py-3 bg-dark-bg border border-dark-border rounded-xl text-sm text-white focus:border-brand-primary focus:outline-none"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-text-secondary mb-1.5 uppercase tracking-wider">
                Club ID (optional)
              </label>
              <input
                type="text"
                value={clubId}
                onChange={(e) => setClubId(e.target.value)}
                placeholder="e.g. club-1"
                className="w-full px-4 py-3 bg-dark-bg border border-dark-border rounded-xl text-sm text-white focus:border-brand-primary focus:outline-none"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-text-secondary mb-1.5 uppercase tracking-wider">
              Description
            </label>
            <textarea
              required
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="What is the event structure, speaker, or goal?"
              rows={3}
              className="w-full bg-dark-bg border border-dark-border rounded-xl p-4 text-xs text-white placeholder-text-muted focus:border-brand-primary focus:outline-none resize-none"
            />
          </div>

          <div className="flex gap-2">
            <button
              type="button"
              onClick={() => setShowCreate(false)}
              className="px-4 py-2 border border-dark-border text-xs font-semibold text-text-secondary hover:text-white rounded-xl"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-brand-primary hover:bg-brand-secondary text-white text-xs font-semibold rounded-xl"
            >
              Schedule Event
            </button>
          </div>
        </form>
      )}

      {loading ? (
        <div className="space-y-4">
          {[1, 2].map((n) => (
            <div key={n} className="glass-panel border border-dark-border rounded-2xl h-40 shimmer" />
          ))}
        </div>
      ) : (
        <div className="space-y-4">
          {events.map((event) => {
            const isRsvped = false;

            return (
              <div key={event.id} className="glass-panel border border-dark-border p-6 rounded-2xl flex flex-col sm:flex-row justify-between gap-6 hover:border-dark-border/80 transition-colors">
                <div className="space-y-3 flex-1">
                  <div className="space-y-1">
                    <span className="text-[10px] font-bold text-brand-primary uppercase tracking-widest leading-none">
                      {event.club?.name || "Official Academic"}
                    </span>
                    <h3 className="text-sm font-bold text-white leading-tight">{event.title}</h3>
                    <p className="text-[10px] text-text-secondary line-clamp-2 leading-relaxed">{event.description}</p>
                  </div>

                  <div className="flex flex-wrap items-center gap-4 text-[10px] text-text-muted font-semibold">
                    <span className="flex items-center gap-1">
                      <Calendar className="w-3.5 h-3.5" />
                      {new Date(event.date).toLocaleString()}
                    </span>
                    <span className="flex items-center gap-1">
                      <MapPin className="w-3.5 h-3.5" />
                      {event.location}
                    </span>
                  </div>
                </div>

                <div className="flex sm:flex-col justify-between items-center sm:items-end gap-3 shrink-0">
                  <span className="text-[10px] font-bold text-white bg-dark-hover border border-dark-border px-2.5 py-1 rounded-lg">
                    {event._count.rsvps} RSVP'd
                  </span>

                  <div className="flex gap-2">
                    <button
                      onClick={() => handleRsvp(event.id)}
                      className={`px-4 py-2 rounded-xl text-[10px] font-bold uppercase tracking-wider transition-colors cursor-pointer ${
                        isRsvped
                          ? "bg-success/10 border border-success/20 text-success"
                          : "bg-brand-primary hover:bg-brand-secondary text-white"
                      }`}
                    >
                      {isRsvped ? "RSVP'd ✓" : "RSVP"}
                    </button>
                    {event.qrCodeUrl && (
                      <button
                        onClick={() => setActiveQrEvent(activeQrEvent?.id === event.id ? null : event)}
                        className="p-2 border border-dark-border hover:bg-dark-hover rounded-xl text-text-secondary hover:text-white"
                      >
                        <QrCode className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* QR Code Modal Display */}
      {activeQrEvent && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="glass-panel border border-dark-border p-6 rounded-2xl max-w-sm w-full text-center space-y-4">
            <h3 className="text-sm font-bold text-white">Event Ticket QR Code</h3>
            <p className="text-[10px] text-text-secondary">Scan this code at the door to check-in for {activeQrEvent.title}.</p>
            <div className="w-48 h-48 bg-white p-2 rounded-xl mx-auto flex items-center justify-center">
              <img src={activeQrEvent.qrCodeUrl} alt="QR Code" className="w-full h-full object-contain" />
            </div>
            <button
              onClick={() => setActiveQrEvent(null)}
              className="w-full py-2 bg-dark-hover border border-dark-border text-xs font-semibold text-white rounded-xl"
            >
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

function getMockEvents(): Event[] {
  return [
    {
      id: "event-1",
      title: "Google AI Research talk on Campus",
      description: "Join us for an interactive research talk covering the latest LLMs and deep learning techniques with Google researchers.",
      date: new Date(Date.now() + 172800000).toISOString(),
      location: "Auditorium C",
      qrCodeUrl: "https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=mock-event-1",
      club: { name: "ACM Student Chapter" },
      _count: { rsvps: 58 }
    },
    {
      id: "event-2",
      title: "Graduation Board Review Meeting",
      description: "Mandatory informational panel for all CS graduates finishing in Batch of 2026.",
      date: new Date(Date.now() + 345600000).toISOString(),
      location: "Dean's Boardroom",
      qrCodeUrl: "https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=mock-event-2",
      _count: { rsvps: 120 }
    }
  ];
}
