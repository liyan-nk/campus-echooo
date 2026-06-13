"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { 
  Home, 
  Ticket, 
  Users, 
  Calendar, 
  ShoppingBag, 
  ShieldAlert, 
  User, 
  LogOut, 
  PlusCircle, 
  Compass
} from "lucide-react";
import { motion } from "framer-motion";

interface NavItem {
  label: string;
  href: string;
  icon: React.ComponentType<any>;
  roles?: string[];
}

export default function Navigation() {
  const pathname = usePathname();
  const { user, logout } = useAuth();

  const navItems: NavItem[] = [
    { label: "Feed", href: "/", icon: Home },
    { label: "Tickets", href: "/tickets", icon: Ticket },
    { label: "Clubs", href: "/clubs", icon: Users },
    { label: "Events", href: "/events", icon: Calendar },
    //{ label: "Market", href: "/marketplace", icon: ShoppingBag },
    { label: "Mod", href: "/moderation", icon: ShieldAlert, roles: ["MODERATOR", "SUPER_ADMIN", "UNIV_ADMIN"] },
  ];

  const filteredItems = navItems.filter(
    (item) => !item.roles || (user && item.roles.includes(user.role))
  );

  return (
    <>
      {/* Desktop Sidebar */}
      <aside className="hidden md:flex flex-col w-64 bg-dark-surface border-r border-dark-border h-screen fixed left-0 top-0 p-6 z-20">
        {/* Logo */}
        <div className="flex items-center gap-3 mb-8">
          <div className="w-8 h-8 rounded-lg brand-gradient flex items-center justify-center font-bold text-white shadow-[0_0_15px_rgba(99,102,241,0.5)]">
            E
          </div>
          <span className="font-sans font-bold text-lg tracking-tight text-white">
            Campus Echo
          </span>
        </div>

        {/* Nav Links */}
        <nav className="flex-1 space-y-1">
          {filteredItems.map((item) => {
            const isActive = pathname === item.href;
            const Icon = item.icon;

            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 group relative ${
                  isActive 
                    ? "text-white" 
                    : "text-text-secondary hover:text-white hover:bg-dark-hover"
                }`}
              >
                {isActive && (
                  <motion.div
                    layoutId="desktop-nav-active"
                    className="absolute inset-0 bg-dark-hover border border-dark-border/40 rounded-xl -z-10"
                    transition={{ type: "spring", stiffness: 380, damping: 30 }}
                  />
                )}
                <Icon className={`w-5 h-5 transition-transform group-hover:scale-105 ${
                  isActive ? "text-brand-primary" : ""
                }`} />
                <span className="font-medium text-sm">{item.label}</span>
              </Link>
            );
          })}
        </nav>

        {/* User Card & Logout */}
        <div className="border-t border-dark-border pt-4 mt-auto">
          {user ? (
            <div className="flex flex-col gap-3">
              <Link href="/profile" className="flex items-center gap-3 group">
                <div className="w-10 h-10 rounded-full bg-brand-primary/10 border border-brand-primary/20 flex items-center justify-center text-brand-primary font-bold text-sm uppercase">
                  {user.email[0]}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-white truncate leading-none">
                    {user.email.split("@")[0]}
                  </p>
                  <span className="text-[10px] text-brand-accent uppercase font-bold tracking-wider leading-none">
                    {user.role}
                  </span>
                </div>
              </Link>
              <button
                onClick={logout}
                className="flex items-center gap-3 px-4 py-2 text-xs font-semibold text-danger/80 hover:text-danger hover:bg-danger/10 rounded-lg w-full transition-all duration-200"
              >
                <LogOut className="w-4 h-4" />
                Sign Out
              </button>
            </div>
          ) : (
            <Link
              href="/login"
              className="flex items-center justify-center py-3 bg-brand-primary hover:bg-brand-secondary text-white rounded-xl text-sm font-semibold transition-all duration-200"
            >
              Sign In
            </Link>
          )}
        </div>
      </aside>

      {/* Mobile Bottom Navigation */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-dark-surface/90 backdrop-blur-lg border-t border-dark-border px-4 py-2 flex justify-around items-center z-30 pb-safe">
        {filteredItems.slice(0, 4).map((item) => {
          const isActive = pathname === item.href;
          const Icon = item.icon;

          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex flex-col items-center gap-1 py-1 px-3 relative ${
                isActive ? "text-brand-primary" : "text-text-secondary"
              }`}
            >
              <Icon className="w-5 h-5" />
              <span className="text-[10px] font-medium">{item.label}</span>
              {isActive && (
                <motion.div
                  layoutId="mobile-nav-dot"
                  className="w-1 h-1 rounded-full bg-brand-primary absolute -bottom-1"
                  transition={{ type: "spring", stiffness: 380, damping: 30 }}
                />
              )}
            </Link>
          );
        })}

        {/* Mobile quick create action */}
        <Link href="/create" className="flex flex-col items-center justify-center -translate-y-4">
          <div className="w-12 h-12 rounded-full brand-gradient flex items-center justify-center text-white shadow-lg shadow-brand-primary/40 active:scale-95 transition-transform">
            <PlusCircle className="w-6 h-6" />
          </div>
        </Link>

        {user ? (
          <Link
            href="/profile"
            className={`flex flex-col items-center gap-1 py-1 px-3 ${
              pathname === "/profile" ? "text-brand-primary" : "text-text-secondary"
            }`}
          >
            <User className="w-5 h-5" />
            <span className="text-[10px] font-medium">Profile</span>
          </Link>
        ) : (
          <Link href="/login" className="flex flex-col items-center gap-1 py-1 px-3 text-text-secondary">
            <User className="w-5 h-5" />
            <span className="text-[10px] font-medium">Sign In</span>
          </Link>
        )}
      </nav>
    </>
  );
}
