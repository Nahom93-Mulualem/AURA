"use client";

import React, { useState } from "react";
import Link from "next/link";
import { Lock, Sparkles, ArrowRight, ArrowLeft } from "lucide-react";

export default function AdminLoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    alert("In the backend phase, this connects securely to the Go Chi API with JWT authentication.");
  };

  return (
    <div className="min-h-[85vh] flex items-center justify-center px-4 py-20">
      <div className="w-full max-w-md p-8 rounded-2xl bg-plum/70 border border-gold/30 shadow-glow space-y-6">
        <div className="text-center space-y-2">
          <div className="w-12 h-12 rounded-full bg-midnight border border-gold/30 mx-auto flex items-center justify-center text-gold">
            <Lock className="w-5 h-5" />
          </div>
          <h1 className="font-serif text-2xl sm:text-3xl text-softwhite">
            Admin Authentication
          </h1>
          <p className="text-xs text-stone-muted">
            Protected area for HANI to manage inventory and settings.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4 text-xs">
          <div>
            <label className="block uppercase tracking-wider text-gold font-medium mb-1.5">
              Email Address
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="admin@aurabyhani.com"
              required
              className="w-full p-3 rounded-lg bg-midnight/90 border border-gold/20 text-softwhite placeholder:text-stone-muted focus:border-gold focus:outline-none"
            />
          </div>

          <div>
            <label className="block uppercase tracking-wider text-gold font-medium mb-1.5">
              Secret Password
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••••••"
              required
              className="w-full p-3 rounded-lg bg-midnight/90 border border-gold/20 text-softwhite placeholder:text-stone-muted focus:border-gold focus:outline-none"
            />
          </div>

          <button
            type="submit"
            className="w-full min-h-[44px] rounded-full bg-gold hover:bg-gold-light text-midnight font-semibold uppercase tracking-wider text-xs flex items-center justify-center gap-2 shadow-glow transition-all"
          >
            <span>Sign In to Dashboard</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </form>

        <div className="pt-4 border-t border-gold/15 flex items-center justify-between text-xs text-stone-muted">
          <Link
            href="/"
            className="inline-flex items-center gap-1 hover:text-gold transition-colors"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Return to Store</span>
          </Link>
          <Link href="/admin" className="text-gold hover:underline">
            Dashboard Preview
          </Link>
        </div>
      </div>
    </div>
  );
}
