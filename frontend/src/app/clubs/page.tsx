"use client";

import React, { useState, useEffect } from "react";
import { useAuth } from "@/context/AuthContext";
import { api } from "@/lib/api";
import { Users, Plus, Award, CheckCircle2 } from "lucide-react";

interface Club {
  id: string;
  name: string;
  description: string;
  logoUrl?: string;
  _count: { members: number };
}

export default function ClubsPage() {
  const { user } = useAuth();
  const [clubs, setClubs] = useState<Club[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Create Club Form
  const [showCreate, setShowCreate] = useState(false);
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [logoUrl, setLogoUrl] = useState("");

  const fetchClubs = async () => {
    setLoading(true);
    try {
      const data = await api.get<Club[]>("/campus/clubs");
      setClubs(data);
    } catch (e) {
      console.error("Failed to load clubs:", e);
      setClubs(getMockClubs());
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchClubs();
  }, []);

  const handleJoinLeave = async (clubId: string, isMember: boolean) => {
    try {
      if (isMember) {
        await api.post(`/campus/clubs/${clubId}/leave`, {});
      } else {
        await api.post(`/campus/clubs/${clubId}/join`, {});
      }
      fetchClubs();
    } catch (err: any) {
      alert(err.message || "Failed to complete join/leave request");
    }
  };

  const handleCreateClub = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !description.trim()) return;

    try {
      const logo = logoUrl || `https://api.dicebear.com/7.x/initials/svg?seed=${name}`;
      await api.post("/campus/clubs", { name, description, logoUrl: logo });
      setName("");
      setDescription("");
      setLogoUrl("");
      setShowCreate(false);
      fetchClubs();
    } catch (err: any) {
      alert("Failed to create club: " + err.message);
    }
  };

  const isStaff = user && ["SUPER_ADMIN", "FACULTY", "UNIV_ADMIN"].includes(user.role);

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-white tracking-tight flex items-center gap-2">
            Campus Clubs <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-brand-primary/10 border border-brand-primary/20 text-brand-primary">Communities</span>
          </h1>
          <p className="text-xs text-text-secondary mt-1">Connect with student-led programs and batches.</p>
        </div>
        {isStaff && (
          <button
            onClick={() => setShowCreate(!showCreate)}
            className="flex items-center gap-1.5 px-4 py-2.5 bg-brand-primary hover:bg-brand-secondary text-white text-xs font-semibold rounded-xl cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            New Club
          </button>
        )}
      </div>

      {showCreate && (
        <form onSubmit={handleCreateClub} className="glass-panel border border-dark-border p-6 rounded-2xl space-y-4">
          <h3 className="text-xs font-bold text-white uppercase tracking-wider">Establish a New Club</h3>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-text-secondary mb-1.5 uppercase tracking-wider">
                Club Name
              </label>
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. ACM CS Chapter"
                className="w-full px-4 py-3 bg-dark-bg border border-dark-border rounded-xl text-sm text-white placeholder-text-muted focus:border-brand-primary focus:outline-none"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-text-secondary mb-1.5 uppercase tracking-wider">
                Logo Image URL
              </label>
              <input
                type="text"
                value={logoUrl}
                onChange={(e) => setLogoUrl(e.target.value)}
                placeholder="https://example.com/logo.png (optional)"
                className="w-full px-4 py-3 bg-dark-bg border border-dark-border rounded-xl text-sm text-white placeholder-text-muted focus:border-brand-primary focus:outline-none"
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
              placeholder="What is the club's objective and core activities?"
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
              Create Club
            </button>
          </div>
        </form>
      )}

      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {[1, 2].map((n) => (
            <div key={n} className="glass-panel border border-dark-border rounded-2xl h-36 shimmer" />
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {clubs.map((club) => {
            const isMember = false; // In a full build, check membership status

            return (
              <div key={club.id} className="glass-panel border border-dark-border p-6 rounded-2xl flex flex-col justify-between hover:border-dark-border/80 transition-colors">
                <div className="flex gap-4">
                  <div className="w-12 h-12 rounded-xl border border-dark-border bg-dark-bg overflow-hidden flex items-center justify-center font-bold text-brand-primary shrink-0">
                    {club.logoUrl ? (
                      <img src={club.logoUrl} alt="Logo" className="w-full h-full object-cover" />
                    ) : (
                      club.name[0]
                    )}
                  </div>
                  <div className="space-y-1">
                    <h3 className="text-sm font-bold text-white leading-none flex items-center gap-1.5">
                      {club.name}
                    </h3>
                    <p className="text-[10px] text-text-secondary line-clamp-2 leading-relaxed">{club.description}</p>
                  </div>
                </div>

                <div className="flex items-center justify-between border-t border-dark-border/40 pt-4 mt-4 text-xs font-semibold">
                  <span className="text-[10px] text-text-muted uppercase tracking-wider flex items-center gap-1">
                    <Users className="w-3.5 h-3.5" /> {club._count.members} Members
                  </span>
                  
                  <button
                    onClick={() => handleJoinLeave(club.id, isMember)}
                    className={`px-3.5 py-1.5 rounded-lg text-[10px] font-bold uppercase tracking-wider transition-all cursor-pointer ${
                      isMember
                        ? "border border-dark-border text-text-secondary hover:text-white"
                        : "bg-brand-primary hover:bg-brand-secondary text-white"
                    }`}
                  >
                    {isMember ? "Leave" : "Join"}
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

function getMockClubs(): Club[] {
  return [
    {
      id: "club-1",
      name: "ACM Student Chapter",
      description: "Association for Computing Machinery student community, hosting coding hackathons and workshops.",
      _count: { members: 145 },
      logoUrl: "https://api.dicebear.com/7.x/initials/svg?seed=ACM"
    },
    {
      id: "club-2",
      name: "Campus Robotics Club",
      description: "Designing, building, and programming autonomous robots for regional college competitions.",
      _count: { members: 82 },
      logoUrl: "https://api.dicebear.com/7.x/initials/svg?seed=Robo"
    }
  ];
}
