"use client";

import React, { useState, useEffect } from "react";
import { useAuth } from "@/context/AuthContext";
import { api } from "@/lib/api";
import { ShieldAlert, CheckCircle, Trash, ShieldCheck, AlertCircle } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

interface Report {
  id: string;
  reason: string;
  createdAt: string;
  post?: { id: string; title: string; content: string };
  comment?: { id: string; content: string };
  reporter: { profile: { firstName: string; lastName: string } };
}

export default function ModerationPage() {
  const { user, loading: authLoading } = useAuth();
  const [reports, setReports] = useState<Report[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchReports = async () => {
    setLoading(true);
    try {
      const data = await api.get<Report[]>("/moderation/reports");
      setReports(data);
    } catch (e) {
      console.error("Failed to load reported queue:", e);
      setReports(getMockReports());
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!authLoading && user && ["MODERATOR", "SUPER_ADMIN", "UNIV_ADMIN"].includes(user.role)) {
      fetchReports();
    }
  }, [user, authLoading]);

  const handleResolve = async (reportId: string, action: "DELETE" | "DISMISS") => {
    try {
      await api.post(`/moderation/reports/${reportId}/resolve`, { action });
      // Remove from local state
      setReports((prev) => prev.filter((r) => r.id !== reportId));
    } catch (err: any) {
      alert("Action failed: " + err.message);
    }
  };

  if (authLoading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="w-8 h-8 border-2 border-brand-primary/30 border-t-brand-primary rounded-full animate-spin" />
      </div>
    );
  }

  // RBAC Access Gate
  const isMod = user && ["MODERATOR", "SUPER_ADMIN", "UNIV_ADMIN"].includes(user.role);
  if (!isMod) {
    return (
      <div className="text-center py-20 glass-panel border border-danger/20 rounded-2xl max-w-md mx-auto mt-12 p-8">
        <ShieldAlert className="w-12 h-12 text-danger mx-auto mb-4" />
        <h2 className="text-lg font-bold text-white mb-2">Access Denied</h2>
        <p className="text-xs text-text-secondary">Only verified moderators and administrator staff can access this page.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col">
        <h1 className="text-2xl font-bold text-white tracking-tight flex items-center gap-2">
          Moderation Dashboard <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-danger/10 border border-danger/20 text-danger">Mod Queue</span>
        </h1>
        <p className="text-xs text-text-secondary mt-1">Review flagged comments, posts, and AI-moderator reports.</p>
      </div>

      {loading ? (
        <div className="space-y-4">
          {[1, 2].map((n) => (
            <div key={n} className="glass-panel border border-dark-border rounded-2xl h-44 shimmer" />
          ))}
        </div>
      ) : reports.length === 0 ? (
        <div className="text-center py-16 glass-panel border border-dark-border rounded-2xl flex flex-col items-center justify-center">
          <ShieldCheck className="w-12 h-12 text-success mb-3 animate-pulse" />
          <h3 className="text-sm font-bold text-white">Queue is Clear!</h3>
          <p className="text-xs text-text-secondary mt-1">No reported items currently require administrator review.</p>
        </div>
      ) : (
        <div className="space-y-4">
          <AnimatePresence mode="popLayout">
            {reports.map((report) => (
              <motion.div
                layout
                initial={{ opacity: 0, scale: 0.98 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, x: -30 }}
                key={report.id}
                className="glass-panel border border-dark-border p-6 rounded-2xl space-y-4"
              >
                {/* Header Flag Info */}
                <div className="flex items-start gap-3 p-3 bg-danger/5 border border-danger/10 rounded-xl">
                  <AlertCircle className="w-4 h-4 text-danger shrink-0 mt-0.5" />
                  <div className="text-xs text-text-secondary">
                    <p className="font-semibold text-white">Report Reason:</p>
                    <p className="mt-0.5 text-[11px] leading-relaxed">{report.reason}</p>
                    <p className="text-[10px] text-text-muted mt-1">
                      Reported by: {report.reporter.profile.firstName} {report.reporter.profile.lastName} • {new Date(report.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                </div>

                {/* Flagged Content Preview */}
                <div className="p-4 bg-dark-bg border border-dark-border rounded-xl">
                  {report.post ? (
                    <div className="space-y-1">
                      <span className="text-[9px] font-bold text-brand-primary uppercase tracking-widest">Post Item</span>
                      <h4 className="text-xs font-bold text-white leading-tight">{report.post.title}</h4>
                      <p className="text-xs text-text-secondary line-clamp-3 leading-relaxed mt-1">{report.post.content}</p>
                    </div>
                  ) : report.comment ? (
                    <div className="space-y-1">
                      <span className="text-[9px] font-bold text-brand-primary uppercase tracking-widest">Comment Reply</span>
                      <p className="text-xs text-text-secondary leading-relaxed mt-1">{report.comment.content}</p>
                    </div>
                  ) : (
                    <p className="text-xs text-text-muted">Target content was deleted.</p>
                  )}
                </div>

                {/* Action buttons */}
                <div className="flex justify-end gap-2 pt-2 border-t border-dark-border/40">
                  <button
                    onClick={() => handleResolve(report.id, "DISMISS")}
                    className="flex items-center gap-1.5 px-4 py-2 border border-dark-border text-xs font-semibold text-text-secondary hover:text-white rounded-xl transition-colors cursor-pointer"
                  >
                    <CheckCircle className="w-3.5 h-3.5" />
                    Approve (Keep)
                  </button>
                  <button
                    onClick={() => handleResolve(report.id, "DELETE")}
                    className="flex items-center gap-1.5 px-4 py-2 bg-danger hover:bg-red-600 text-white text-xs font-semibold rounded-xl transition-colors cursor-pointer"
                  >
                    <Trash className="w-3.5 h-3.5" />
                    Takedown (Delete)
                  </button>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      )}
    </div>
  );
}

function getMockReports(): Report[] {
  return [
    {
      id: "report-1",
      reason: "AI Moderation: Flagged for potential toxic language / guidelines breach. Matched words: [hack]",
      createdAt: new Date(Date.now() - 600000).toISOString(),
      reporter: { profile: { firstName: "AI Moderation", lastName: "Engine" } },
      post: {
        id: "post-101",
        title: "I hacked the library database",
        content: "Just kidding, I just found out their API returns student emails without verification. We need to tell the admins."
      }
    },
    {
      id: "report-2",
      reason: "Harassment. Insulting other students anonymously.",
      createdAt: new Date(Date.now() - 3600000).toISOString(),
      reporter: { profile: { firstName: "Alex", lastName: "Standard" } },
      comment: {
        id: "comment-202",
        content: "CS 101 students are completely lazy, they just whine about grading curves because they don't study."
      }
    }
  ];
}
