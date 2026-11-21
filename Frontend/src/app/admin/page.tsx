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
  Upload,
  Image as ImageIcon,
  CheckCircle2,
  AlertCircle,
  X,
} from "lucide-react";
import { MOCK_PERFUMES } from "@/data/mockPerfumes";
import { Perfume, PerfumeCategory, PerfumeStatus } from "@/types/perfume";
import { formatPrice } from "@/lib/utils";

const ALLOWED_MIME_TYPES = [
  "image/jpeg",
  "image/jpg",
  "image/png",
  "image/webp",
  "image/avif",
];
const MAX_FILE_SIZE_MB = 5;

export default function AdminPage() {
  const [perfumes, setPerfumes] = useState<Perfume[]>(MOCK_PERFUMES);
  const [showAddModal, setShowAddModal] = useState(false);
  const [search, setSearch] = useState("");

  // New Fragrance Form State
  const [name, setName] = useState("");
  const [subtitle, setSubtitle] = useState("");
  const [priceEtb, setPriceEtb] = useState("");
  const [sizePreset, setSizePreset] = useState("100");
  const [customSizeText, setCustomSizeText] = useState("100ml");
  const [status, setStatus] = useState<PerfumeStatus>("available");
  const [category, setCategory] = useState<PerfumeCategory>("unisex");
  const [topNotes, setTopNotes] = useState("");
  const [heartNotes, setHeartNotes] = useState("");
  const [baseNotes, setBaseNotes] = useState("");
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [imageFileName, setImageFileName] = useState<string | null>(null);
  const [uploadError, setUploadError] = useState<string | null>(null);

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

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setUploadError(null);
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate upload type
    if (!ALLOWED_MIME_TYPES.includes(file.type)) {
      setUploadError(
        "Unsupported format. Please upload JPG, PNG, WebP, or AVIF image."
      );
      return;
    }

    // Validate upload size (5MB max)
    const sizeInMb = file.size / (1024 * 1024);
    if (sizeInMb > MAX_FILE_SIZE_MB) {
      setUploadError(
        `File too large (${sizeInMb.toFixed(1)}MB). Maximum allowed is 5MB.`
      );
      return;
    }

    setImageFileName(file.name);
    const objectUrl = URL.createObjectURL(file);
    setImagePreview(objectUrl);
  };

  const handleCreatePerfume = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !priceEtb) {
      alert("Please provide at least a fragrance name and price.");
      return;
    }

    const newPerfume: Perfume = {
      id: String(Date.now()),
      name: name.trim(),
      slug: name.toLowerCase().replace(/\s+/g, "-"),
      subtitle: subtitle.trim() || "Artisanal extrait de parfum",
      tagline: "Scents that stay in memory.",
      description: `Bespoke artisanal fragrance with notes of ${topNotes || "precious woods and florals"}.`,
      price: Number(priceEtb),
      sizeMl: customSizeText.trim() || `${sizePreset}ml`,
      category: category,
      status: status,
      featured: true,
      notes: {
        top: topNotes ? topNotes.split(",").map((s) => s.trim()) : ["Bergamot", "Cardamom"],
        heart: heartNotes ? heartNotes.split(",").map((s) => s.trim()) : ["Amber", "Rose"],
        base: baseNotes ? baseNotes.split(",").map((s) => s.trim()) : ["Oud", "Musk"],
      },
      images: [
        imagePreview ||
          "https://images.unsplash.com/photo-1592945403244-b3fbafd7f539?q=80&w=1000&auto=format&fit=crop",
      ],
      longevity: "10-14 hours",
      bestSeason: "All Seasons",
      rating: 5.0,
    };

    setPerfumes([newPerfume, ...perfumes]);
    setShowAddModal(false);

    // Reset Form
    setName("");
    setSubtitle("");
    setPriceEtb("");
    setSizePreset("100");
    setCustomSizeText("100ml");
    setStatus("available");
    setCategory("unisex");
    setTopNotes("");
    setHeartNotes("");
    setBaseNotes("");
    setImagePreview(null);
    setImageFileName(null);
    setUploadError(null);
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
            Manage your boutique catalog, toggle availability, and configure fragrance specs in Ethiopian Birr (ETB).
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
                <th className="py-3 px-4">Price (ETB)</th>
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
                  <td className="py-3 px-4 font-mono">
                    {String(item.sizeMl).includes("ml") ? item.sizeMl : `${item.sizeMl}ml`}
                  </td>
                  <td className="py-3 px-4 font-mono text-gold font-medium">
                    {formatPrice(item.price)}
                  </td>
                  <td className="py-3 px-4">
                    <button
                      onClick={() => toggleStatus(item.id)}
                      className={`px-2.5 py-1 rounded-full text-[10px] uppercase font-semibold tracking-wider transition-all ${
                        item.status === "available"
                          ? "bg-sage/20 text-sage border border-sage/40"
                          : item.status === "new"
                          ? "bg-gold/20 text-gold border border-gold/40"
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
                    {formatPrice(item.price)} ({String(item.sizeMl).includes("ml") ? item.sizeMl : `${item.sizeMl}ml`})
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

      {/* Add Fragrance Modal with Comprehensive Specs & Picture Formats */}
      {showAddModal && (
        <div
          role="dialog"
          aria-modal="true"
          className="fixed inset-0 z-50 bg-midnight/90 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto"
        >
          <div className="bg-plum border border-gold/30 rounded-2xl max-w-lg w-full p-6 space-y-5 shadow-glow my-8">
            <div className="flex items-center justify-between border-b border-gold/15 pb-3">
              <div>
                <h3 className="font-serif text-xl text-softwhite">Add New Fragrance</h3>
                <p className="text-[11px] text-stone-muted mt-0.5">
                  Configure details, Ethiopian Birr pricing, and upload bottle photography.
                </p>
              </div>
              <button
                onClick={() => setShowAddModal(false)}
                className="p-1 rounded-full text-stone-muted hover:text-gold"
                aria-label="Close modal"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreatePerfume} className="space-y-4 text-xs">
              {/* Name & Subtitle */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-gold mb-1 font-medium">
                    Fragrance Name *
                  </label>
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="e.g. Amber Nocturne"
                    required
                    className="w-full p-2.5 rounded-lg bg-midnight border border-gold/20 text-softwhite focus:border-gold focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-gold mb-1 font-medium">
                    Subtitle / Notes Summary
                  </label>
                  <input
                    type="text"
                    value={subtitle}
                    onChange={(e) => setSubtitle(e.target.value)}
                    placeholder="e.g. Dark Oud, Amber & Vanilla"
                    className="w-full p-2.5 rounded-lg bg-midnight border border-gold/20 text-softwhite focus:border-gold focus:outline-none"
                  />
                </div>
              </div>

              {/* Price (ETB) & Size (ml) */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-gold mb-1 font-medium">
                    Price in ETB (Ethiopian Birr) *
                  </label>
                  <input
                    type="number"
                    value={priceEtb}
                    onChange={(e) => setPriceEtb(e.target.value)}
                    placeholder="e.g. 12500"
                    required
                    min="1"
                    className="w-full p-2.5 rounded-lg bg-midnight border border-gold/20 text-softwhite font-mono focus:border-gold focus:outline-none"
                  />
                </div>
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="text-gold font-medium">
                      Bottle Size *
                    </label>
                    <span className="text-[10px] text-stone-muted">
                      Select or type custom
                    </span>
                  </div>
                  <div className="space-y-1.5">
                    {/* Size Preset Dropdown */}
                    <select
                      value={sizePreset}
                      onChange={(e) => {
                        const val = e.target.value;
                        setSizePreset(val);
                        if (val !== "custom") {
                          setCustomSizeText(`${val}ml`);
                        }
                      }}
                      className="w-full p-2 rounded-lg bg-midnight border border-gold/20 text-softwhite focus:border-gold focus:outline-none text-xs"
                    >
                      <option value="30">30 ml (Travel Extrait)</option>
                      <option value="50">50 ml (Classic Flask)</option>
                      <option value="75">75 ml (Signature)</option>
                      <option value="100">100 ml (Grand Flacon)</option>
                      <option value="120">120 ml (Artisanal Reserve)</option>
                      <option value="custom">✏️ Custom size / volume...</option>
                    </select>

                    {/* Freeform text field allowing the user to write whatever they want */}
                    <input
                      type="text"
                      value={customSizeText}
                      onChange={(e) => setCustomSizeText(e.target.value)}
                      placeholder="e.g. 100ml, 50ml Pure Oil, 250ml Decanter..."
                      className="w-full p-2 rounded-lg bg-midnight/90 border border-gold/30 text-softwhite placeholder:text-stone-muted text-xs focus:border-gold focus:outline-none"
                    />
                  </div>
                </div>
              </div>

              {/* Status & Category */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-gold mb-1 font-medium">
                    Stock Status *
                  </label>
                  <select
                    value={status}
                    onChange={(e) => setStatus(e.target.value as PerfumeStatus)}
                    className="w-full p-2.5 rounded-lg bg-midnight border border-gold/20 text-softwhite focus:border-gold focus:outline-none"
                  >
                    <option value="available">Available (In Stock)</option>
                    <option value="new">New Arrival</option>
                    <option value="sold_out">Sold Out</option>
                  </select>
                </div>
                <div>
                  <label className="block text-gold mb-1 font-medium">
                    Category *
                  </label>
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value as PerfumeCategory)}
                    className="w-full p-2.5 rounded-lg bg-midnight border border-gold/20 text-softwhite focus:border-gold focus:outline-none"
                  >
                    <option value="unisex">Unisex (Harmonious)</option>
                    <option value="feminine">Feminine (Soft Floral)</option>
                    <option value="masculine">Masculine (Bold Wood/Leather)</option>
                  </select>
                </div>
              </div>

              {/* Olfactory Scent Notes */}
              <div>
                <label className="block text-gold mb-1 font-medium">
                  Scent Notes (comma separated)
                </label>
                <div className="grid grid-cols-3 gap-2">
                  <input
                    type="text"
                    value={topNotes}
                    onChange={(e) => setTopNotes(e.target.value)}
                    placeholder="Top: Bergamot, Saffron"
                    className="p-2 rounded bg-midnight border border-gold/20 text-softwhite text-[11px]"
                  />
                  <input
                    type="text"
                    value={heartNotes}
                    onChange={(e) => setHeartNotes(e.target.value)}
                    placeholder="Heart: Damask Rose, Oud"
                    className="p-2 rounded bg-midnight border border-gold/20 text-softwhite text-[11px]"
                  />
                  <input
                    type="text"
                    value={baseNotes}
                    onChange={(e) => setBaseNotes(e.target.value)}
                    placeholder="Base: Smoked Amber, Vanilla"
                    className="p-2 rounded bg-midnight border border-gold/20 text-softwhite text-[11px]"
                  />
                </div>
              </div>

              {/* Picture Upload with Multi-Format Support (.jpg, .png, .webp, .avif) */}
              <div>
                <label className="block text-gold mb-1 font-medium">
                  Bottle Picture (Formats: WEBP, JPG, PNG, AVIF • Max 5MB)
                </label>

                <div className="border-2 border-dashed border-gold/25 hover:border-gold/50 rounded-xl p-4 bg-midnight/60 text-center transition-colors">
                  {imagePreview ? (
                    <div className="flex items-center gap-4">
                      <div className="relative w-16 h-20 rounded-lg overflow-hidden bg-midnight border border-gold/30 flex-shrink-0">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img
                          src={imagePreview}
                          alt="Perfume bottle preview"
                          className="w-full h-full object-cover"
                        />
                      </div>
                      <div className="text-left flex-1 min-w-0">
                        <p className="text-xs text-softwhite font-medium truncate">
                          {imageFileName || "Selected bottle image"}
                        </p>
                        <p className="text-[10px] text-sage flex items-center gap-1 mt-0.5">
                          <CheckCircle2 className="w-3 h-3" />
                          <span>Valid image ready for catalog</span>
                        </p>
                        <label className="text-[11px] text-gold underline cursor-pointer mt-1 inline-block">
                          Change Image
                          <input
                            type="file"
                            accept="image/png, image/jpeg, image/jpg, image/webp, image/avif"
                            onChange={handleImageChange}
                            className="hidden"
                          />
                        </label>
                      </div>
                    </div>
                  ) : (
                    <label className="flex flex-col items-center justify-center gap-2 cursor-pointer py-2">
                      <div className="w-10 h-10 rounded-full bg-plum border border-gold/30 flex items-center justify-center text-gold">
                        <Upload className="w-5 h-5" />
                      </div>
                      <div>
                        <span className="text-xs text-gold font-medium">
                          Click to select bottle photograph
                        </span>
                        <p className="text-[10px] text-stone-muted mt-0.5">
                          Supports high-res WebP, JPEG, PNG, and AVIF up to 5MB
                        </p>
                      </div>
                      <input
                        type="file"
                        accept="image/png, image/jpeg, image/jpg, image/webp, image/avif"
                        onChange={handleImageChange}
                        className="hidden"
                      />
                    </label>
                  )}
                </div>

                {uploadError && (
                  <p className="text-xs text-clay flex items-center gap-1 mt-1.5">
                    <AlertCircle className="w-3.5 h-3.5" />
                    <span>{uploadError}</span>
                  </p>
                )}
              </div>

              {/* Form Buttons */}
              <div className="flex items-center justify-end gap-3 pt-3 border-t border-gold/15">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2 rounded-full border border-gold/30 text-xs text-softwhite hover:text-gold transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-6 py-2.5 rounded-full bg-gold hover:bg-gold-light text-midnight text-xs font-semibold uppercase tracking-wider shadow-glow transition-all"
                >
                  Save & Publish Fragrance
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
