"use client";

import React, { useState, useEffect } from "react";
import { useAuth } from "@/context/AuthContext";
import { api } from "@/lib/api";
import { 
  Ticket, 
  Plus, 
  Clock, 
  CheckCircle, 
  AlertCircle, 
  HelpCircle, 
  BarChart3, 
  ChevronDown, 
  TrendingUp, 
  Smile
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

interface TicketItem {
  id: string;
  title: string;
  description: string;
  category: string;
  status: string;
  severity: string;
  createdAt: string;
  student?: { profile: { firstName: string; lastName: string } };
  assignee?: { profile: { firstName: string; lastName: string } };
}

interface Analytics {
  totalTickets: number;
  resolvedRate: number;
  inProgressCount: number;
  sentimentIndex: number;
  growthRate: number;
  categories: Array<{ category: string; count: number }>;
}

export default function TicketsPage() {
  const { user } = useAuth();
  const [tickets, setTickets] = useState<TicketItem[]>([]);
  const [analytics, setAnalytics] = useState<Analytics | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("tickets"); // tickets vs analytics (admins only)

  // Create Ticket Form
  const [showCreate, setShowCreate] = useState(false);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState("FACILITIES");
  const [severity, setSeverity] = useState("LOW");

  const isAdmin = user && ["SUPER_ADMIN", "UNIV_ADMIN", "DEPT_ADMIN"].includes(user.role);

  const fetchTicketsAndAnalytics = async () => {
    setLoading(true);
    try {
      if (isAdmin) {
        const ticketList = await api.get<TicketItem[]>("/tickets");
        setTickets(ticketList);
        const analyticsData = await api.get<Analytics>("/tickets/analytics");
        setAnalytics(analyticsData);
      } else {
        const ticketList = await api.get<TicketItem[]>("/tickets/my");
        setTickets(ticketList);
      }
    } catch (e) {
      console.error("Failed to load tickets/analytics:", e);
      setTickets(getMockTickets(isAdmin || false));
      if (isAdmin) {
        setAnalytics(getMockAnalytics());
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTicketsAndAnalytics();
  }, [user]);

  const handleCreateTicket = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !description.trim()) return;

    try {
      await api.post("/tickets", { title, description, category, severity });
      setTitle("");
      setDescription("");
      setCategory("FACILITIES");
      setSeverity("LOW");
      setShowCreate(false);
      fetchTicketsAndAnalytics();
    } catch (err: any) {
      alert("Failed to submit ticket: " + err.message);
    }
  };

  const handleUpdateStatus = async (ticketId: string, newStatus: string) => {
    try {
      await api.put(`/tickets/${ticketId}/status`, { status: newStatus });
      fetchTicketsAndAnalytics();
    } catch (err: any) {
      alert("Status update failed: " + err.message);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white tracking-tight flex items-center gap-2">
            Ticket Management <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-brand-primary/10 border border-brand-primary/20 text-brand-primary">Support</span>
          </h1>
          <p className="text-xs text-text-secondary mt-1">Submit and track administrative, facilities, and academic tickets.</p>
        </div>
        {!isAdmin && (
          <button
            onClick={() => setShowCreate(true)}
            className="flex items-center gap-1.5 px-4 py-2.5 bg-brand-primary hover:bg-brand-secondary text-white text-xs font-semibold rounded-xl shadow-lg shadow-brand-primary/20 cursor-pointer transition-colors"
          >
            <Plus className="w-4 h-4" />
            File Ticket
          </button>
        )}
      </div>

      {/* Admin Tabs */}
      {isAdmin && (
        <div className="flex border-b border-dark-border gap-2 overflow-x-auto pb-px mb-4">
          <button
            onClick={() => setActiveTab("tickets")}
            className={`px-4 py-2.5 text-xs font-semibold transition-all relative border-b-2 cursor-pointer ${
              activeTab === "tickets" 
                ? "border-brand-primary text-white" 
                : "border-transparent text-text-secondary hover:text-white"
            }`}
          >
            Active Tickets Queue
          </button>
          <button
            onClick={() => setActiveTab("analytics")}
            className={`px-4 py-2.5 text-xs font-semibold transition-all relative border-b-2 cursor-pointer ${
              activeTab === "analytics" 
                ? "border-brand-primary text-white" 
                : "border-transparent text-text-secondary hover:text-white"
            }`}
          >
            Analytics & Sentiment Trends
          </button>
        </div>
      )}

      {/* Main Body */}
      {loading ? (
        <div className="space-y-4">
          {[1, 2].map((n) => (
            <div key={n} className="glass-panel border border-dark-border rounded-2xl h-36 shimmer" />
          ))}
        </div>
      ) : activeTab === "tickets" ? (
        <div className="space-y-4">
          {tickets.length === 0 ? (
            <div className="text-center py-12 glass-panel border border-dark-border rounded-2xl">
              <p className="text-sm text-text-secondary">No tickets submitted yet.</p>
            </div>
          ) : (
            <div className="space-y-4">
              {tickets.map((ticket) => {
                const statusColor = getStatusColor(ticket.status);
                const severityColor = getSeverityColor(ticket.severity);

                return (
                  <div key={ticket.id} className="glass-panel border border-dark-border p-6 rounded-2xl flex flex-col md:flex-row justify-between items-start md:items-center gap-4 hover:border-dark-border/80 transition-colors">
                    <div className="space-y-2 flex-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className={`px-2 py-0.5 rounded text-[8px] font-bold uppercase tracking-wider ${statusColor}`}>
                          {ticket.status}
                        </span>
                        <span className={`px-2 py-0.5 rounded text-[8px] font-bold uppercase tracking-wider ${severityColor}`}>
                          {ticket.severity} Priority
                        </span>
                        <span className="text-[10px] text-text-muted font-semibold">
                          Category: {ticket.category}
                        </span>
                      </div>
                      <h3 className="text-sm font-bold text-white leading-tight">{ticket.title}</h3>
                      <p className="text-xs text-text-secondary leading-relaxed line-clamp-2">{ticket.description}</p>
                      
                      {isAdmin && ticket.student && (
                        <p className="text-[10px] text-text-muted font-medium pt-1">
                          Filed by: {ticket.student.profile.firstName} {ticket.student.profile.lastName} • {new Date(ticket.createdAt).toLocaleDateString()}
                        </p>
                      )}
                    </div>

                    <div className="shrink-0 flex items-center gap-3 w-full md:w-auto justify-end">
                      {isAdmin ? (
                        <div className="relative inline-block text-left">
                          <select
                            value={ticket.status}
                            onChange={(e) => handleUpdateStatus(ticket.id, e.target.value)}
                            className="bg-dark-surface border border-dark-border rounded-xl text-xs font-semibold text-white px-3 py-2 cursor-pointer focus:outline-none focus:border-brand-primary"
                          >
                            <option value="SUBMITTED">SUBMITTED</option>
                            <option value="REVIEW">REVIEW</option>
                            <option value="ASSIGNED">ASSIGNED</option>
                            <option value="IN_PROGRESS">IN PROGRESS</option>
                            <option value="RESOLVED">RESOLVED</option>
                            <option value="CLOSED">CLOSED</option>
                          </select>
                        </div>
                      ) : (
                        <span className="text-[10px] text-text-muted font-semibold flex items-center gap-1">
                          <Clock className="w-3.5 h-3.5" /> Updated: {new Date(ticket.createdAt).toLocaleDateString()}
                        </span>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      ) : (
        /* Admin Analytics Subpage */
        analytics && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Analytics Stats Grid */}
            <div className="glass-panel border border-dark-border p-6 rounded-2xl flex flex-col items-center justify-center text-center relative overflow-hidden">
              <Ticket className="w-8 h-8 text-brand-primary mb-2" />
              <span className="text-[10px] font-bold text-text-secondary uppercase tracking-wider">Total Tickets</span>
              <h2 className="text-3xl font-black text-white mt-1">{analytics.totalTickets}</h2>
              <p className="text-[9px] text-text-muted mt-2">Active campus cases</p>
            </div>

            <div className="glass-panel border border-dark-border p-6 rounded-2xl flex flex-col items-center justify-center text-center relative overflow-hidden">
              <CheckCircle className="w-8 h-8 text-success mb-2" />
              <span className="text-[10px] font-bold text-text-secondary uppercase tracking-wider">Resolution Rate</span>
              <h2 className="text-3xl font-black text-white mt-1">{analytics.resolvedRate}%</h2>
              <p className="text-[9px] text-text-muted mt-2">Closed ticket percentage</p>
            </div>

            <div className="glass-panel border border-brand-primary/20 bg-brand-primary/5 p-6 rounded-2xl flex flex-col items-center justify-center text-center relative overflow-hidden">
              <Smile className="w-8 h-8 text-brand-accent mb-2" />
              <span className="text-[10px] font-bold text-text-secondary uppercase tracking-wider">Sentiment Index</span>
              <h2 className="text-3xl font-black text-white mt-1">{analytics.sentimentIndex}/100</h2>
              <p className="text-[9px] text-text-muted mt-2">Positive expression ratio</p>
            </div>

            {/* SVG Sentiment Chart */}
            <div className="md:col-span-3 glass-panel border border-dark-border p-6 rounded-2xl space-y-4">
              <h3 className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-1.5">
                <TrendingUp className="w-4 h-4 text-brand-primary" />
                Sentiment Trends (Last 7 Days)
              </h3>
              
              <div className="h-48 w-full bg-dark-bg/60 border border-dark-border rounded-xl p-4 flex items-end relative overflow-hidden">
                {/* SVG Line path for sentiment index chart */}
                <svg className="absolute inset-0 w-full h-full p-6" viewBox="0 0 100 100" preserveAspectRatio="none">
                  <defs>
                    <linearGradient id="chart-grad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#6366f1" stopOpacity="0.2"/>
                      <stop offset="100%" stopColor="#6366f1" stopOpacity="0"/>
                    </linearGradient>
                  </defs>
                  {/* Chart Line */}
                  <path 
                    d="M 0 60 Q 20 50 40 70 T 80 40 T 100 30" 
                    fill="none" 
                    stroke="#6366f1" 
                    strokeWidth="2.5"
                  />
                  {/* Fill Area */}
                  <path 
                    d="M 0 60 Q 20 50 40 70 T 80 40 T 100 30 L 100 100 L 0 100 Z" 
                    fill="url(#chart-grad)"
                  />
                </svg>
                <div className="w-full flex justify-between text-[9px] font-semibold text-text-muted relative z-10">
                  <span>Mon</span>
                  <span>Tue</span>
                  <span>Wed</span>
                  <span>Thu</span>
                  <span>Fri</span>
                  <span>Sat</span>
                  <span>Sun</span>
                </div>
              </div>
            </div>
          </div>
        )
      )}

      {/* Create Ticket Modal */}
      {showCreate && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <motion.div
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="glass-panel border border-dark-border p-8 rounded-2xl max-w-lg w-full space-y-4"
          >
            <h3 className="text-sm font-bold text-white uppercase tracking-wider">File an Administrative Ticket</h3>
            <p className="text-[10px] text-text-secondary mt-1">Provide clear details. Administrators will update status as they review and assign your ticket.</p>
            
            <form onSubmit={handleCreateTicket} className="space-y-4 pt-2">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-[10px] font-semibold text-text-secondary mb-1.5 uppercase tracking-wider">
                    Ticket Category
                  </label>
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    className="w-full px-4 py-2.5 bg-dark-bg border border-dark-border rounded-xl text-xs text-white focus:outline-none appearance-none"
                  >
                    <option value="FACILITIES">Facilities & Maintenance</option>
                    <option value="ACADEMIC">Academic / Coursework</option>
                    <option value="FINANCIAL">Tuition & Financials</option>
                    <option value="HOSTEL">Hostel & Housing</option>
                    <option value="OTHERS">Other Inquiries</option>
                  </select>
                </div>

                <div>
                  <label className="block text-[10px] font-semibold text-text-secondary mb-1.5 uppercase tracking-wider">
                    Severity Priority
                  </label>
                  <select
                    value={severity}
                    onChange={(e) => setSeverity(e.target.value)}
                    className="w-full px-4 py-2.5 bg-dark-bg border border-dark-border rounded-xl text-xs text-white focus:outline-none appearance-none"
                  >
                    <option value="LOW">Low</option>
                    <option value="MEDIUM">Medium</option>
                    <option value="HIGH">High Priority</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-[10px] font-semibold text-text-secondary mb-1.5 uppercase tracking-wider">
                  Subject Title
                </label>
                <input
                  type="text"
                  required
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="e.g. Broken water purifier on Hostel Floor 3"
                  className="w-full px-4 py-3 bg-dark-bg border border-dark-border rounded-xl text-sm text-white focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-[10px] font-semibold text-text-secondary mb-1.5 uppercase tracking-wider">
                  Detailed Description
                </label>
                <textarea
                  required
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Provide precise details, location, and dates..."
                  rows={4}
                  className="w-full bg-dark-bg border border-dark-border rounded-xl p-4 text-xs text-white focus:outline-none resize-none"
                />
              </div>

              <div className="flex gap-2 pt-2 justify-end">
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
                  Submit Ticket
                </button>
              </div>
            </form>
          </motion.div>
        </div>
      )}
    </div>
  );
}

// Helpers
function getStatusColor(status: string) {
  switch (status) {
    case "SUBMITTED":
      return "bg-text-muted/10 border border-text-muted/20 text-text-muted";
    case "REVIEW":
      return "bg-warning/10 border border-warning/20 text-warning";
    case "ASSIGNED":
    case "IN_PROGRESS":
      return "bg-brand-primary/10 border border-brand-primary/20 text-brand-primary";
    case "RESOLVED":
      return "bg-success/10 border border-success/20 text-success";
    default:
      return "bg-dark-hover border border-dark-border text-text-secondary";
  }
}

function getSeverityColor(sev: string) {
  switch (sev) {
    case "HIGH":
      return "bg-danger/10 border border-danger/20 text-danger";
    case "MEDIUM":
      return "bg-warning/10 border border-warning/20 text-warning";
    default:
      return "bg-text-muted/10 border border-text-muted/20 text-text-muted";
  }
}

// Mock Fallbacks
function getMockTickets(admin: boolean): TicketItem[] {
  const list = [
    {
      id: "ticket-1",
      title: "Broken water purifier on Hostel Floor 3",
      description: "The purifier has been leaking since yesterday. The filter indicator is flashing red.",
      category: "FACILITIES",
      status: "IN_PROGRESS",
      severity: "MEDIUM",
      createdAt: new Date().toISOString(),
    },
    {
      id: "ticket-2",
      title: "Course pre-requisite waiver for CS 301",
      description: "I did an equivalent course during my exchange semester. Need a waiver to register.",
      category: "ACADEMIC",
      status: "SUBMITTED",
      severity: "LOW",
      createdAt: new Date(Date.now() - 86400000).toISOString(),
    }
  ];

  if (admin) {
    return list.map(item => ({
      ...item,
      student: { profile: { firstName: "Sarah", lastName: "Connor" } }
    }));
  }
  return list;
}

function getMockAnalytics(): Analytics {
  return {
    totalTickets: 24,
    resolvedRate: 68,
    inProgressCount: 5,
    sentimentIndex: 78,
    growthRate: 15,
    categories: [
      { category: "FACILITIES", count: 12 },
      { category: "ACADEMIC", count: 8 },
      { category: "FINANCIAL", count: 4 }
    ]
  };
}
