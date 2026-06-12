"use client";

import React from "react";
import { AuthProvider } from "@/context/AuthContext";
import Navigation from "./Navigation";
import { motion, AnimatePresence } from "framer-motion";
import { usePathname } from "next/navigation";

export default function AppLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const isAuthPage = pathname === "/login" || pathname === "/register";

  if (isAuthPage) {
    return (
      <AuthProvider>
        <main className="min-h-screen bg-dark-bg flex items-center justify-center p-4">
          <AnimatePresence mode="wait">
            <motion.div
              key={pathname}
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -15 }}
              transition={{ duration: 0.25, ease: "easeInOut" }}
              className="w-full max-w-md"
            >
              {children}
            </motion.div>
          </AnimatePresence>
        </main>
      </AuthProvider>
    );
  }

  return (
    <AuthProvider>
      <div className="min-h-screen bg-dark-bg flex flex-col md:flex-row">
        {/* Navigation */}
        <Navigation />

        {/* Content Area */}
        <div className="flex-1 md:pl-64 flex flex-col min-h-screen pb-20 md:pb-0">
          <AnimatePresence mode="wait">
            <motion.main
              key={pathname}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.2, ease: "easeOut" }}
              className="flex-1 p-4 sm:p-6 md:p-8 max-w-4xl w-full mx-auto"
            >
              {children}
            </motion.main>
          </AnimatePresence>
        </div>
      </div>
    </AuthProvider>
  );
}
