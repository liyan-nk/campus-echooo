"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useAuth } from "@/context/AuthContext";
import { LogIn, Mail, Lock, User, UserCheck, AlertCircle } from "lucide-react";

export default function RegisterPage() {
  const { register } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [roleName, setRoleName] = useState("STUDENT");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      await register({
        email,
        password,
        firstName,
        lastName,
        roleName,
      });
    } catch (err: any) {
      setError(err.message || "Failed to create account. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full">
      <div className="glass-panel border border-dark-border p-8 rounded-2xl w-full relative overflow-hidden">
        {/* Decorative blur blob */}
        <div className="absolute -top-12 -left-12 w-36 h-36 bg-brand-primary/10 rounded-full blur-3xl -z-10" />

        <div className="flex flex-col items-center mb-8">
          <div className="w-12 h-12 rounded-xl brand-gradient flex items-center justify-center font-bold text-white shadow-[0_0_20px_rgba(99,102,241,0.4)] text-lg mb-3">
            E
          </div>
          <h1 className="text-xl font-bold text-white tracking-tight">Create your Account</h1>
          <p className="text-xs text-text-secondary mt-1">Get anonymous and verified voice on campus</p>
        </div>

        {error && (
          <div className="mb-5 p-4 rounded-xl bg-danger/10 border border-danger/20 flex items-start gap-3 text-danger text-xs">
            <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
            <p className="font-medium">{error}</p>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-text-secondary mb-1.5 uppercase tracking-wider">
                First Name
              </label>
              <div className="relative">
                <User className="absolute left-3.5 top-3.5 w-4 h-4 text-text-muted" />
                <input
                  type="text"
                  required
                  value={firstName}
                  onChange={(e) => setFirstName(e.target.value)}
                  placeholder="John"
                  className="w-full pl-11 pr-4 py-3 bg-dark-bg border border-dark-border rounded-xl text-sm text-white placeholder-text-muted focus:border-brand-primary focus:outline-none transition-all duration-200"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-text-secondary mb-1.5 uppercase tracking-wider">
                Last Name
              </label>
              <div className="relative">
                <User className="absolute left-3.5 top-3.5 w-4 h-4 text-text-muted" />
                <input
                  type="text"
                  required
                  value={lastName}
                  onChange={(e) => setLastName(e.target.value)}
                  placeholder="Doe"
                  className="w-full pl-11 pr-4 py-3 bg-dark-bg border border-dark-border rounded-xl text-sm text-white placeholder-text-muted focus:border-brand-primary focus:outline-none transition-all duration-200"
                />
              </div>
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-text-secondary mb-1.5 uppercase tracking-wider">
              Email Address
            </label>
            <div className="relative">
              <Mail className="absolute left-3.5 top-3.5 w-4 h-4 text-text-muted" />
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="student@echostate.edu"
                className="w-full pl-11 pr-4 py-3 bg-dark-bg border border-dark-border rounded-xl text-sm text-white placeholder-text-muted focus:border-brand-primary focus:outline-none transition-all duration-200"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-text-secondary mb-1.5 uppercase tracking-wider">
              Password
            </label>
            <div className="relative">
              <Lock className="absolute left-3.5 top-3.5 w-4 h-4 text-text-muted" />
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full pl-11 pr-4 py-3 bg-dark-bg border border-dark-border rounded-xl text-sm text-white placeholder-text-muted focus:border-brand-primary focus:outline-none transition-all duration-200"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-text-secondary mb-1.5 uppercase tracking-wider">
              Account Role
            </label>
            <div className="relative">
              <UserCheck className="absolute left-3.5 top-3.5 w-4 h-4 text-text-muted" />
              <select
                value={roleName}
                onChange={(e) => setRoleName(e.target.value)}
                className="w-full pl-11 pr-4 py-3 bg-dark-bg border border-dark-border rounded-xl text-sm text-white focus:border-brand-primary focus:outline-none transition-all duration-200 appearance-none cursor-pointer"
              >
                <option value="STUDENT">Student</option>
                <option value="FACULTY">Faculty Member</option>
              </select>
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 mt-2 bg-brand-primary hover:bg-brand-secondary text-white rounded-xl text-sm font-semibold flex items-center justify-center gap-2 transition-all duration-250 cursor-pointer active:scale-[0.98] disabled:opacity-50"
          >
            {loading ? (
              <span className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            ) : (
              <>
                <LogIn className="w-4 h-4" />
                Sign Up
              </>
            )}
          </button>
        </form>

        <div className="mt-6 text-center text-xs text-text-secondary">
          Already have an account?{" "}
          <Link href="/login" className="text-brand-primary hover:text-brand-accent font-semibold transition-colors duration-200">
            Sign in here
          </Link>
        </div>
      </div>
    </div>
  );
}
