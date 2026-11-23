"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Lock, ArrowRight, ArrowLeft, AlertCircle, Loader2 } from "lucide-react";
import { loginAdmin } from "@/lib/api";

export default function AdminLoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("admin@aurabyhani.com");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      await loginAdmin(email.trim(), password);
      router.push("/admin");
    } catch (err: any) {
      setError(err.message || "Invalid credentials. Please verify your email and password.");
    } finally {
      setLoading(false);
    }
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
            Protected management area for HANI to manage inventory and settings.
          </p>
        </div>

        {error && (
          <div className="p-3.5 rounded-lg bg-clay/20 border border-clay/40 text-clay text-xs flex items-center gap-2">
            <AlertCircle className="w-4 h-4 flex-shrink-0" />
            <span>{error}</span>
          </div>
        )}

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
            disabled={loading}
            className="w-full min-h-[44px] rounded-full bg-gold hover:bg-gold-light disabled:opacity-50 text-midnight font-semibold uppercase tracking-wider text-xs flex items-center justify-center gap-2 shadow-glow transition-all"
          >
            {loading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Verifying...</span>
              </>
            ) : (
              <>
                <span>Sign In to Dashboard</span>
                <ArrowRight className="w-4 h-4" />
              </>
            )}
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
          <span className="text-[10px] text-stone-muted">
            Aura Security System
          </span>
        </div>
      </div>
    </div>
  );
}
