"use client";

import React, { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import {
  Lock,
  Plus,
  Edit2,
  Trash2,
  Shield,
  Eye,
  Search,
  CheckCircle2,
} from "lucide-react";
import { MOCK_PERFUMES } from "@/data/mockPerfumes";
import { formatPrice } from "@/lib/utils";

export default function AdminPage() {
  const [perfumes, setPerfumes] = useState(MOCK_PERFUMES);
  const [showAddModal, setShowAddModal] = useState(false);
  const [search, setSearch] = useState("");

  const toggleStatus = (id: string) => {
    setPerfumes((prev) =>
      prev.map((item) => {
        if (item.id === id) {
          const nextStatus = item.status === "available" ? "sold_out" : "available";
          return { ...item, status: nextStatus };
        }
        return item;
      })
    );
  };

  const filtered = perfumes.filter((p) =>
    p.name.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="pt-28 pb-20 max-w-[1200px] mx-auto px-4 sm:px-6">
      {/* Top Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8 pb-4 border-b border-gold/20">
        <div>
          <div className="flex items-center gap-2">
            <Shield className="w-5 h-5 text-gold" />
            <h1 className="font-serif text-2xl sm:text-3xl text-softwhite">
              Aura Admin Studio
            </h1>
          </div>
          <p className="text-xs text-stone-muted mt-1">
            Manage your boutique catalog, toggle availability, and edit scent details.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Link
            href="/admin/login"
            className="px-4 py-2 rounded-full border border-gold/30 text-xs text-softwhite hover:border-gold hover:text-gold transition-colors flex items-center gap-1.5"
          >
            <Lock className="w-3.5 h-3.5" />
            <span>Admin Auth</span>
          </Link>
          <button
            onClick={() => setShowAddModal(true)}
            className="min-h-[40px] px-5 rounded-full bg-gold hover:bg-gold-light text-midnight font-medium text-xs uppercase tracking-wider flex items-center gap-1.5 shadow-glow transition-all"
          >
            <Plus className="w-4 h-4" />
            <span>Add Fragrance</span>
          </button>
        </div>
      </div>

      {/* Search Bar */}
      <div className="mb-6 flex items-center justify-between gap-4">
        <div className="relative max-w-sm w-full">
          <Search className="w-4 h-4 text-gold absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search perfumes in inventory..."
            className="w-full pl-9 pr-4 py-2 rounded-lg bg-plum/60 border border-gold/20 text-xs text-softwhite placeholder:text-stone-muted focus:outline-none focus:border-gold"
          />
        </div>
        <span className="text-xs text-stone-muted font-mono">
          {perfumes.length} Fragrances Total
        </span>
      </div>

      {/* Perfume List Table (Desktop) / Cards (Mobile) */}
      <div className="rounded-xl bg-plum/40 border border-gold/15 overflow-hidden">
        {/* Table View for Tablets & Desktop */}
        <div className="hidden sm:block overflow-x-auto">
          <table className="w-full text-left text-xs text-softwhite/90">
            <thead className="bg-plum/90 border-b border-gold/15 uppercase tracking-wider text-[11px] text-gold">
              <tr>
                <th className="py-3 px-4">Fragrance</th>
                <th className="py-3 px-4">Size</th>
                <th className="py-3 px-4">Price</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4">Category</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gold/10">
              {filtered.map((item) => (
                <tr key={item.id} className="hover:bg-plum/60 transition-colors">
                  <td className="py-3 px-4 flex items-center gap-3">
                    <div className="relative w-10 h-12 rounded overflow-hidden bg-midnight flex-shrink-0">
                      <Image
                        src={item.images[0]}
                        alt={item.name}
                        fill
                        className="object-cover"
                      />
                    </div>
                    <div>
                      <p className="font-serif text-sm font-medium text-softwhite">
                        {item.name}
                      </p>
                      <p className="text-[10px] text-stone-muted truncate max-w-[200px]">
                        {item.subtitle}
                      </p>
                    </div>
                  </td>
                  <td className="py-3 px-4 font-mono">{item.sizeMl}ml</td>
                  <td className="py-3 px-4 font-mono text-gold font-medium">
                    {formatPrice(item.price)}
                  </td>
                  <td className="py-3 px-4">
                    <button
                      onClick={() => toggleStatus(item.id)}
                      className={`px-2.5 py-1 rounded-full text-[10px] uppercase font-semibold tracking-wider transition-all ${
                        item.status === "available"
                          ? "bg-sage/20 text-sage border border-sage/40"
                          : "bg-clay/20 text-clay border border-clay/40"
                      }`}
                      title="Click to toggle availability"
                    >
                      {item.status.replace("_", " ")}
                    </button>
                  </td>
                  <td className="py-3 px-4 capitalize text-stone-muted">
                    {item.category}
                  </td>
                  <td className="py-3 px-4 text-right space-x-2">
                    <Link
                      href={`/perfumes/${item.slug}`}
                      className="p-1.5 rounded hover:bg-midnight/70 text-stone-muted hover:text-gold inline-block"
                      title="View public page"
                    >
                      <Eye className="w-4 h-4" />
                    </Link>
                    <button
                      onClick={() =>
                        alert(
                          "Per rules: Edit form coordinates with Go API in backend phase."
                        )
                      }
                      className="p-1.5 rounded hover:bg-midnight/70 text-stone-muted hover:text-gold inline-block"
                      title="Edit fragrance"
                    >
                      <Edit2 className="w-4 h-4" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Mobile Card List (<640px) */}
        <div className="sm:hidden divide-y divide-gold/10">
          {filtered.map((item) => (
            <div key={item.id} className="p-4 flex items-center justify-between gap-3">
              <div className="flex items-center gap-3">
                <div className="relative w-12 h-14 rounded overflow-hidden bg-midnight flex-shrink-0">
                  <Image
                    src={item.images[0]}
                    alt={item.name}
                    fill
                    className="object-cover"
                  />
                </div>
                <div>
                  <h4 className="font-serif text-sm font-medium text-softwhite">
                    {item.name}
                  </h4>
                  <span className="font-mono text-xs text-gold font-semibold block">
                    {formatPrice(item.price)} ({item.sizeMl}ml)
                  </span>
                  <button
                    onClick={() => toggleStatus(item.id)}
                    className="text-[10px] uppercase tracking-wider text-stone-muted underline mt-1"
                  >
                    Toggle: {item.status}
                  </button>
                </div>
              </div>

              <Link
                href={`/perfumes/${item.slug}`}
                className="p-2 rounded-full bg-midnight/80 border border-gold/20 text-gold"
              >
                <Eye className="w-4 h-4" />
              </Link>
            </div>
          ))}
        </div>
      </div>

      {/* Add Fragrance Modal Preview */}
      {showAddModal && (
        <div
          role="dialog"
          aria-modal="true"
          className="fixed inset-0 z-50 bg-midnight/90 backdrop-blur-sm flex items-center justify-center p-4"
        >
          <div className="bg-plum border border-gold/30 rounded-2xl max-w-md w-full p-6 space-y-4 shadow-glow">
            <div className="flex items-center justify-between border-b border-gold/15 pb-3">
              <h3 className="font-serif text-xl text-softwhite">Add New Fragrance</h3>
              <button
                onClick={() => setShowAddModal(false)}
                className="text-stone-muted hover:text-gold"
              >
                ✕
              </button>
            </div>
            <p className="text-xs text-stone-muted">
              Add new fragrances with name, notes, price, and image URLs.
            </p>
            <div className="space-y-3 text-xs">
              <div>
                <label className="block text-gold mb-1">Fragrance Name</label>
                <input
                  type="text"
                  placeholder="e.g. Amber Nocturne"
                  className="w-full p-2.5 rounded bg-midnight border border-gold/20 text-softwhite"
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-gold mb-1">Price ($)</label>
                  <input
                    type="number"
                    placeholder="140"
                    className="w-full p-2.5 rounded bg-midnight border border-gold/20 text-softwhite"
                  />
                </div>
                <div>
                  <label className="block text-gold mb-1">Size (ml)</label>
                  <input
                    type="number"
                    placeholder="100"
                    className="w-full p-2.5 rounded bg-midnight border border-gold/20 text-softwhite"
                  />
                </div>
              </div>
            </div>
            <div className="flex justify-end gap-2 pt-2">
              <button
                onClick={() => setShowAddModal(false)}
                className="px-4 py-2 rounded-full border border-gold/30 text-xs text-softwhite"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  alert("New fragrance added to mock catalog!");
                  setShowAddModal(false);
                }}
                className="px-5 py-2 rounded-full bg-gold text-midnight text-xs font-semibold"
              >
                Save Perfume
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
