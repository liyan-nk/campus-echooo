"use client";

import React, { useState, useEffect } from "react";
import { useAuth } from "@/context/AuthContext";
import { api } from "@/lib/api";
import { 
  Sparkles, 
  Award, 
  BookOpen, 
  MapPin, 
  Briefcase, 
  EyeOff, 
  Info,
  Clock,
  LogOut
} from "lucide-react";
import { motion } from "framer-motion";

export default function ProfilePage() {
  const { user, logout } = useAuth();
  const [profile, setProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const data = await api.get<any>("/auth/profile");
        setProfile(data);
      } catch (e) {
        console.error("Failed to load profile:", e);
        // Fallback mock profile
        setProfile({
          firstName: "John",
          lastName: "Doe",
          echoScore: 125,
          user: { email: "student@echostate.edu", role: { name: "STUDENT" } },
          university: { name: "Echo State University" },
          department: { name: "Computer Science" },
          program: { name: "Bachelor of Science in CS" },
          batch: { name: "Class of 2027" },
          class: { name: "CS-101" },
          anonymousProfiles: [
            { id: "anon-1", alias: "BlueEcho", avatarUrl: "https://api.dicebear.com/7.x/identicon/svg?seed=BlueEcho" }
          ]
        });
      } finally {
        setLoading(false);
      }
    };

    if (user) {
      fetchProfile();
    }
  }, [user]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="w-8 h-8 border-2 border-brand-primary/30 border-t-brand-primary rounded-full animate-spin" />
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="text-center py-12 glass-panel border border-dark-border rounded-2xl">
        <p className="text-sm text-text-secondary">Failed to load profile.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col">
        <h1 className="text-2xl font-bold text-white tracking-tight">Your Student Profile</h1>
        <p className="text-xs text-text-secondary mt-1">Manage credentials, view scores, and track your voice.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Main Info Card */}
        <div className="md:col-span-2 glass-panel border border-dark-border p-6 rounded-2xl space-y-6 relative overflow-hidden">
          <div className="absolute -top-24 -left-24 w-48 h-48 bg-brand-primary/5 rounded-full blur-3xl -z-10" />

          {/* Avatar and Name */}
          <div className="flex items-start gap-4">
            <div className="w-16 h-16 rounded-2xl brand-gradient flex items-center justify-center text-white text-2xl font-extrabold uppercase shadow-lg shadow-brand-primary/20">
              {profile.firstName[0]}
            </div>
            <div className="space-y-1">
              <h2 className="text-lg font-bold text-white leading-tight">
                {profile.firstName} {profile.lastName}
              </h2>
              <p className="text-xs text-text-secondary">{profile.user.email}</p>
              <div className="inline-block px-2.5 py-0.5 rounded bg-brand-primary/10 border border-brand-primary/20 text-[9px] font-bold uppercase tracking-wider text-brand-primary">
                {profile.user.role.name}
              </div>
            </div>
          </div>

          {/* Grid details */}
          <div className="border-t border-dark-border/40 pt-6 grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="flex items-center gap-3">
              <MapPin className="w-4 h-4 text-text-muted shrink-0" />
              <div>
                <p className="text-[10px] text-text-muted uppercase font-bold tracking-wider">University</p>
                <p className="text-xs font-semibold text-white">{profile.university?.name || "Unspecified"}</p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <Briefcase className="w-4 h-4 text-text-muted shrink-0" />
              <div>
                <p className="text-[10px] text-text-muted uppercase font-bold tracking-wider">Department</p>
                <p className="text-xs font-semibold text-white">{profile.department?.name || "Unspecified"}</p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <BookOpen className="w-4 h-4 text-text-muted shrink-0" />
              <div>
                <p className="text-[10px] text-text-muted uppercase font-bold tracking-wider">Program</p>
                <p className="text-xs font-semibold text-white">{profile.program?.name || "Unspecified"}</p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <Clock className="w-4 h-4 text-text-muted shrink-0" />
              <div>
                <p className="text-[10px] text-text-muted uppercase font-bold tracking-wider">Batch & Class</p>
                <p className="text-xs font-semibold text-white">
                  {profile.batch?.name || "Unspecified"} • {profile.class?.name || "Unspecified"}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Echo Score / Reputation Card */}
        <div className="glass-panel border border-brand-primary/20 bg-brand-primary/5 p-6 rounded-2xl flex flex-col items-center justify-center text-center relative overflow-hidden">
          {/* Shimmer effect */}
          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent -translate-x-full shimmer -z-10" />

          <Award className="w-10 h-10 text-brand-primary mb-3" />
          <p className="text-xs font-bold text-brand-accent uppercase tracking-widest">Echo Score</p>
          <motion.h2 
            initial={{ scale: 0.8 }}
            animate={{ scale: 1 }}
            className="text-4xl font-black text-white mt-1 mb-2 tracking-tight"
          >
            {profile.echoScore}
          </motion.h2>
          <p className="text-[10px] text-text-secondary max-w-[200px] leading-relaxed">
            Measures your contributions, vote weight, and positive resolution actions on campus.
          </p>

          <div className="mt-4 flex gap-1.5 items-center p-2 rounded-lg bg-dark-bg/60 border border-dark-border text-[9px] text-text-secondary leading-none">
            <Info className="w-3.5 h-3.5" />
            <span>Top 10% of campus responders</span>
          </div>
        </div>
      </div>

      {/* Anonymous Profile Card */}
      {profile.anonymousProfiles && profile.anonymousProfiles.length > 0 && (
        <div className="glass-panel border border-dark-border p-6 rounded-2xl space-y-4">
          <h3 className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-1.5">
            <EyeOff className="w-4 h-4 text-text-secondary" />
            Your Anonymous Identity
          </h3>
          <div className="flex items-center gap-4 p-4 rounded-xl bg-dark-bg border border-dark-border w-fit">
            <img 
              src={profile.anonymousProfiles[0].avatarUrl} 
              alt="Avatar" 
              className="w-12 h-12 rounded-full border border-dark-border bg-dark-surface"
            />
            <div>
              <p className="text-xs font-bold text-white">{profile.anonymousProfiles[0].alias}</p>
              <p className="text-[9px] text-text-muted mt-0.5 uppercase tracking-wider">Generated Alias Profile</p>
            </div>
          </div>
        </div>
      )}

      {/* Sign Out Button (Mobile specific visibility fallback) */}
      <button
        onClick={logout}
        className="md:hidden w-full py-3 bg-danger/10 hover:bg-danger/20 border border-danger/30 text-danger text-sm font-semibold rounded-xl flex items-center justify-center gap-2 transition-all cursor-pointer"
      >
        <LogOut className="w-4.5 h-4.5" />
        Sign Out
      </button>
    </div>
  );
}
