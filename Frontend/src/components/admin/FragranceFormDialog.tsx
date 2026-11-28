"use client";

import React, { useState, useEffect, useRef, useCallback } from "react";
import Image from "next/image";
import {
  X,
  Upload,
  Loader2,
  AlertCircle,
  Plus,
  Sparkles,
  Camera,
  Check,
} from "lucide-react";
import {
  Perfume,
  PerfumeCategory,
  PerfumeStatus,
  FragranceType,
} from "@/types/perfume";
import { PerfumePayload, uploadPerfumeImage, createPerfume, updatePerfume } from "@/lib/api";

const ALLOWED_MIME_TYPES = [
  "image/jpeg",
  "image/jpg",
  "image/png",
  "image/webp",
  "image/avif",
];
const MAX_FILE_SIZE_MB = 5;

interface FragranceFormDialogProps {
  isOpen: boolean;
  editingPerfume: Perfume | null;
  onClose: () => void;
  onSaved: (savedPerfume: Perfume, isEdit: boolean) => void;
}

// Reusable chip/tag input for olfactory notes
interface ScentNotesInputProps {
  label: string;
  notes: string[];
  onChange: (notes: string[]) => void;
  placeholder?: string;
  id: string;
}

function ScentNotesInput({ label, notes, onChange, placeholder, id }: ScentNotesInputProps) {
  const [inputValue, setInputValue] = useState("");

  const addNote = (val: string) => {
    const trimmed = val.trim();
    if (!trimmed) return;
    // Split by comma if user pasted comma-separated items
    const parts = trimmed.split(",").map((s) => s.trim()).filter(Boolean);
    const updated = [...notes];
    for (const part of parts) {
      if (!updated.includes(part)) {
        updated.push(part);
      }
    }
    onChange(updated);
    setInputValue("");
  };

  const removeNote = (idx: number) => {
    onChange(notes.filter((_, i) => i !== idx));
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" || e.key === ",") {
      e.preventDefault();
      addNote(inputValue);
    } else if (e.key === "Backspace" && !inputValue && notes.length > 0) {
      removeNote(notes.length - 1);
    }
  };

  return (
    <div className="space-y-2">
      <label htmlFor={id} className="block text-xs font-medium text-gold">
        {label}
      </label>
      <div className="min-h-[44px] p-2 rounded-xl bg-midnight border border-gold/25 focus-within:border-gold transition-colors flex flex-wrap items-center gap-1.5">
        {notes.map((note, idx) => (
          <span
            key={`${note}-${idx}`}
            className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-plum border border-gold/30 text-softwhite text-xs"
          >
            <span>{note}</span>
            <button
              type="button"
              onClick={() => removeNote(idx)}
              className="w-4 h-4 rounded-full flex items-center justify-center text-stone-muted hover:text-gold hover:bg-gold/10"
              aria-label={`Remove ${note}`}
            >
              <X className="w-3 h-3" />
            </button>
          </span>
        ))}
        <div className="flex-1 flex items-center min-w-[130px]">
          <input
            id={id}
            type="text"
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            onKeyDown={handleKeyDown}
            onBlur={() => addNote(inputValue)}
            placeholder={notes.length === 0 ? placeholder || "Type & press enter..." : "Add note..."}
            className="w-full bg-transparent text-softwhite text-base sm:text-xs placeholder:text-stone-muted focus:outline-none py-1"
          />
          {inputValue.trim() && (
            <button
              type="button"
              onClick={() => addNote(inputValue)}
              className="min-h-[28px] px-2 py-0.5 text-[10px] uppercase tracking-wider rounded bg-gold/20 text-gold hover:bg-gold hover:text-midnight transition-colors"
            >
              Add
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

export default function FragranceFormDialog({
  isOpen,
  editingPerfume,
  onClose,
  onSaved,
}: FragranceFormDialogProps) {
  // Form fields
  const [name, setName] = useState("");
  const [subtitle, setSubtitle] = useState("");
  const [tagline, setTagline] = useState("");
  const [description, setDescription] = useState("");
  const [shortDescription, setShortDescription] = useState("");
  const [priceEtb, setPriceEtb] = useState("");
  const [size, setSize] = useState("100ml");
  const [category, setCategory] = useState<PerfumeCategory>("women");
  const [fragranceType, setFragranceType] = useState<string>("");
  const [status, setStatus] = useState<PerfumeStatus>("available");
  const [featured, setFeatured] = useState(false);
  const [topNotes, setTopNotes] = useState<string[]>([]);
  const [heartNotes, setHeartNotes] = useState<string[]>([]);
  const [baseNotes, setBaseNotes] = useState<string[]>([]);
  const [longevity, setLongevity] = useState("Long-lasting");
  const [bestSeason, setBestSeason] = useState("All Seasons");

  // Image state management
  const [imageUrl, setImageUrl] = useState("");
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const objectUrlRef = useRef<string | null>(null);

  // Status & Validation
  const [submitting, setSubmitting] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [formError, setFormError] = useState<string | null>(null);
  const [isDirty, setIsDirty] = useState(false);
  const [showDiscardConfirm, setShowDiscardConfirm] = useState(false);

  // Field error states for inline accessibility
  const [nameError, setNameError] = useState<string | null>(null);
  const [priceError, setPriceError] = useState<string | null>(null);
  const [shortDescError, setShortDescError] = useState<string | null>(null);

  // DOM Refs for Focus Management & Scroll
  const dialogRef = useRef<HTMLDivElement>(null);
  const scrollBodyRef = useRef<HTMLDivElement>(null);
  const nameInputRef = useRef<HTMLInputElement>(null);
  const priceInputRef = useRef<HTMLInputElement>(null);
  const shortDescRef = useRef<HTMLTextAreaElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const openerRef = useRef<HTMLElement | null>(null);
  const keepEditingBtnRef = useRef<HTMLButtonElement>(null);

  // Helper to safely revoke object URL
  const revokeCurrentObjectUrl = useCallback(() => {
    if (objectUrlRef.current) {
      URL.revokeObjectURL(objectUrlRef.current);
      objectUrlRef.current = null;
    }
  }, []);

  // Initialize or populate form
  useEffect(() => {
    if (!isOpen) {
      revokeCurrentObjectUrl();
      return;
    }

    // Capture the element that triggered the dialog for restored focus
    openerRef.current = document.activeElement as HTMLElement;

    if (editingPerfume) {
      setName(editingPerfume.name || "");
      setSubtitle(editingPerfume.subtitle || "");
      setTagline(editingPerfume.tagline || "");
      setDescription(editingPerfume.description || "");
      setShortDescription(editingPerfume.shortDescription || "");
      setPriceEtb(editingPerfume.price ? String(editingPerfume.price) : "");
      setSize(String(editingPerfume.sizeMl || "100ml"));
      const cat =
        editingPerfume.category === "feminine"
          ? "women"
          : editingPerfume.category === "masculine"
          ? "men"
          : editingPerfume.category || "women";
      setCategory(cat as PerfumeCategory);
      setFragranceType(editingPerfume.fragranceType || "");
      setStatus(editingPerfume.status || "available");
      setFeatured(Boolean(editingPerfume.featured));
      setTopNotes(editingPerfume.notes?.top || []);
      setHeartNotes(editingPerfume.notes?.heart || []);
      setBaseNotes(editingPerfume.notes?.base || []);
      setLongevity(editingPerfume.longevity || "");
      setBestSeason(editingPerfume.bestSeason || "");

      const existingImg = editingPerfume.images?.[0] || "";
      setImageUrl(existingImg);
      setImageFile(null);
      setImagePreview(existingImg || null);
    } else {
      setName("");
      setSubtitle("");
      setTagline("");
      setDescription("");
      setShortDescription("");
      setPriceEtb("");
      setSize("100ml");
      setCategory("women");
      setFragranceType("");
      setStatus("available");
      setFeatured(false);
      setTopNotes([]);
      setHeartNotes([]);
      setBaseNotes([]);
      setLongevity("Long-lasting");
      setBestSeason("All Seasons");
      setImageUrl("");
      setImageFile(null);
      setImagePreview(null);
    }

    setUploadError(null);
    setFormError(null);
    setNameError(null);
    setPriceError(null);
    setShortDescError(null);
    setIsDirty(false);
    setShowDiscardConfirm(false);

    // Initial focus on fragrance name input after mount
    setTimeout(() => {
      nameInputRef.current?.focus();
    }, 50);

    return () => {
      revokeCurrentObjectUrl();
    };
  }, [isOpen, editingPerfume, revokeCurrentObjectUrl]);

  // Body scroll lock
  useEffect(() => {
    if (isOpen) {
      const prevOverflow = document.body.style.overflow;
      document.body.style.overflow = "hidden";
      return () => {
        document.body.style.overflow = prevOverflow;
      };
    }
  }, [isOpen]);

  // Restored focus to opener when dialog closes
  const handleDialogClosed = useCallback(() => {
    revokeCurrentObjectUrl();
    onClose();
    setTimeout(() => {
      openerRef.current?.focus();
    }, 50);
  }, [onClose, revokeCurrentObjectUrl]);

  // Close request with dirty check
  const handleRequestClose = useCallback(() => {
    if (isDirty) {
      setShowDiscardConfirm(true);
      setTimeout(() => {
        keepEditingBtnRef.current?.focus();
      }, 50);
    } else {
      handleDialogClosed();
    }
  }, [isDirty, handleDialogClosed]);

  // Keyboard Navigation: Focus trap (Tab / Shift+Tab) & Escape handling
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        e.preventDefault();
        if (showDiscardConfirm) {
          setShowDiscardConfirm(false);
        } else {
          handleRequestClose();
        }
        return;
      }

      if (e.key === "Tab") {
        const currentContainer = showDiscardConfirm
          ? document.querySelector('div[role="alertdialog"]')
          : dialogRef.current;

        if (!currentContainer) return;

        const focusableElements = currentContainer.querySelectorAll<HTMLElement>(
          'button:not([disabled]):not([aria-hidden="true"]), [href], input:not([disabled]):not([type="hidden"]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])'
        );

        if (!focusableElements || focusableElements.length === 0) return;

        const first = focusableElements[0];
        const last = focusableElements[focusableElements.length - 1];

        if (e.shiftKey) {
          if (document.activeElement === first || !currentContainer.contains(document.activeElement)) {
            e.preventDefault();
            last.focus();
          }
        } else {
          if (document.activeElement === last || !currentContainer.contains(document.activeElement)) {
            e.preventDefault();
            first.focus();
          }
        }
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, showDiscardConfirm, handleRequestClose]);

  // Handle local image file selection (Camera / Photo Gallery)
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setUploadError(null);
    const file = e.target.files?.[0];
    if (!file) return;

    if (!ALLOWED_MIME_TYPES.includes(file.type)) {
      setUploadError("Unsupported format. Allowed: JPG, PNG, WebP, AVIF.");
      return;
    }
    if (file.size > MAX_FILE_SIZE_MB * 1024 * 1024) {
      setUploadError("File exceeds 5MB limit.");
      return;
    }

    // Revoke previous blob if any
    revokeCurrentObjectUrl();

    const objectUrl = URL.createObjectURL(file);
    objectUrlRef.current = objectUrl;

    setImageFile(file);
    setImagePreview(objectUrl);
    setImageUrl(""); // Clear text URL to avoid ambiguity
    setIsDirty(true);
  };

  // Handle external image URL change
  const handleUrlChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    // Clear any selected file to avoid ambiguity
    if (imageFile) {
      revokeCurrentObjectUrl();
      setImageFile(null);
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    }
    setImageUrl(val);
    if (val.trim()) {
      setImagePreview(val.trim());
    } else {
      setImagePreview(null);
    }
    setIsDirty(true);
  };

  // Form submission preserving exact original behavior
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);
    setNameError(null);
    setPriceError(null);
    setShortDescError(null);

    // Validation
    let hasError = false;
    if (!name.trim()) {
      setNameError("Fragrance Name is required.");
      hasError = true;
      nameInputRef.current?.scrollIntoView({ behavior: "smooth", block: "center" });
      nameInputRef.current?.focus();
    }
    if (!priceEtb || Number(priceEtb) <= 0 || isNaN(Number(priceEtb))) {
      setPriceError("Valid price in ETB is required.");
      if (!hasError) {
        hasError = true;
        priceInputRef.current?.scrollIntoView({ behavior: "smooth", block: "center" });
        priceInputRef.current?.focus();
      }
    }
    if (Array.from(shortDescription).length > 140) {
      setShortDescError("Short description must not exceed 140 characters.");
      if (!hasError) {
        hasError = true;
        shortDescRef.current?.scrollIntoView({ behavior: "smooth", block: "center" });
        shortDescRef.current?.focus();
      }
    }

    if (hasError) return;

    setSubmitting(true);
    try {
      // Resolve final image array
      let finalImages: string[] = [];
      if (imageFile) {
        const uploadedUrl = await uploadPerfumeImage(imageFile);
        finalImages = [uploadedUrl];
      } else if (imageUrl.trim()) {
        finalImages = [imageUrl.trim()];
      } else if (editingPerfume && editingPerfume.images && editingPerfume.images.length > 0) {
        finalImages = editingPerfume.images; // Retained untouched
      }

      if (editingPerfume) {
        // ==========================================
        // EDIT MODE: Preserve original handleEditSubmit semantics
        // Do not substitute defaults for empty values!
        // ==========================================
        const payload: Partial<PerfumePayload> = {
          name: name.trim(),
          subtitle: subtitle.trim(),
          tagline: tagline.trim(),
          description: description.trim(),
          shortDescription: shortDescription.trim() || "",
          price: Number(priceEtb),
          sizeMl: size.trim(),
          category,
          fragranceType: fragranceType || "",
          status,
          featured,
          notes: {
            top: topNotes,
            heart: heartNotes,
            base: baseNotes,
          },
          images:
            finalImages.length > 0
              ? finalImages
              : editingPerfume.images || [],
          longevity: longevity || "",
          bestSeason: bestSeason || "",
        };

        const updated = await updatePerfume(editingPerfume.id, payload);
        onSaved(updated, true);
      } else {
        // ==========================================
        // ADD MODE: Preserve original handleCreateSubmit semantics
        // Includes original creation defaults when empty
        // ==========================================
        const payload: PerfumePayload = {
          name: name.trim(),
          subtitle: subtitle.trim() || "Artisanal extrait de parfum",
          tagline: tagline.trim() || "Scents that stay in memory.",
          description:
            description.trim() ||
            `Bespoke artisanal fragrance with notes of ${topNotes.join(", ") || "precious woods and florals"}.`,
          shortDescription: shortDescription.trim() || undefined,
          price: Number(priceEtb),
          sizeMl: size.trim() || "100ml",
          category,
          fragranceType: fragranceType || undefined,
          status,
          featured,
          notes: {
            top: topNotes.length > 0 ? topNotes : ["Bergamot", "Cardamom"],
            heart: heartNotes.length > 0 ? heartNotes : ["Amber", "Rose"],
            base: baseNotes.length > 0 ? baseNotes : ["Oud", "Musk"],
          },
          images:
            finalImages.length > 0
              ? finalImages
              : ["https://images.unsplash.com/photo-1592945403244-b3fbafd7f539?q=80&w=1000&auto=format&fit=crop"],
          longevity: longevity || undefined,
          bestSeason: bestSeason || undefined,
        };

        const created = await createPerfume(payload);
        onSaved(created, false);
      }

      handleDialogClosed();
    } catch (err: any) {
      setFormError(err.message || "Operation failed. Please check connection and credentials.");
    } finally {
      setSubmitting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="dialog-title"
      ref={dialogRef}
      className="fixed inset-0 z-50 bg-midnight/90 backdrop-blur-md flex flex-col justify-start sm:justify-center items-center p-0 sm:p-4 overflow-hidden animate-in fade-in duration-200"
    >
      {/* DIALOG BOX:
          On phones (<640px): 100dvh fullscreen sheet.
          On desktop/tablets: centered dialog with max-h-[90dvh] (fallback 90vh) and flex-shrink-0 header/footer. */}
      <div className="relative w-full h-[100dvh] sm:h-auto sm:max-h-[90vh] sm:max-h-[90dvh] sm:max-w-2xl bg-plum sm:border sm:border-gold/30 sm:rounded-2xl shadow-glow-lg flex flex-col overflow-hidden my-auto">
        {/* 1. PINNED HEADER */}
        <header className="flex-shrink-0 px-4 sm:px-6 py-4 border-b border-gold/15 bg-plum/95 backdrop-blur-md flex items-center justify-between z-10">
          <div>
            <h2 id="dialog-title" className="font-serif text-lg sm:text-2xl text-softwhite leading-tight">
              {editingPerfume ? `Edit: ${editingPerfume.name}` : "Add New Fragrance"}
            </h2>
            <p className="text-[11px] text-stone-muted mt-0.5">
              Changes save directly to PostgreSQL database.
            </p>
          </div>
          <button
            type="button"
            onClick={handleRequestClose}
            className="w-11 h-11 min-w-[44px] min-h-[44px] rounded-full flex items-center justify-center text-stone-muted hover:text-gold hover:bg-gold/10 transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-gold"
            aria-label="Close dialog"
          >
            <X className="w-5 h-5" />
          </button>
        </header>

        {/* 2. SCROLLABLE BODY (Only body scrolls; min-h-0 allows flex child to shrink properly) */}
        <div
          ref={scrollBodyRef}
          className="flex-1 min-h-0 overflow-y-auto overscroll-contain px-4 sm:px-6 py-5 space-y-6"
        >
          {formError && (
            <div
              role="alert"
              className="p-3.5 rounded-xl bg-clay/20 border border-clay/40 text-clay flex items-start gap-2.5 text-xs"
            >
              <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />
              <span>{formError}</span>
            </div>
          )}

          <form id="fragrance-form" onSubmit={handleSubmit} className="space-y-6">
            {/* SECTION 1: BASICS */}
            <div className="space-y-3">
              <span className="text-[10px] uppercase tracking-[0.2em] text-gold font-medium block">
                1. Basics
              </span>

              {/* Fragrance Name */}
              <div className="space-y-1">
                <label htmlFor="fragrance-name" className="block text-xs font-medium text-gold">
                  Fragrance Name <span className="text-clay font-bold">*</span>
                </label>
                <input
                  ref={nameInputRef}
                  id="fragrance-name"
                  type="text"
                  required
                  value={name}
                  autoComplete="off"
                  autoCorrect="off"
                  spellCheck={false}
                  onChange={(e) => {
                    setName(e.target.value);
                    setIsDirty(true);
                    if (nameError) setNameError(null);
                  }}
                  placeholder="e.g. Amber Nocturne"
                  aria-invalid={nameError ? "true" : "false"}
                  aria-describedby={nameError ? "name-error" : undefined}
                  className={`w-full min-h-[44px] px-3.5 rounded-xl bg-midnight border text-softwhite text-base sm:text-xs placeholder:text-stone-muted focus:outline-none transition-colors ${
                    nameError ? "border-clay focus:border-clay" : "border-gold/25 focus:border-gold"
                  }`}
                />
                {nameError && (
                  <p id="name-error" className="text-xs text-clay">
                    {nameError}
                  </p>
                )}
              </div>

              {/* Subtitle & Tagline */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label htmlFor="fragrance-subtitle" className="block text-xs font-medium text-gold">
                    Subtitle Notes
                  </label>
                  <input
                    id="fragrance-subtitle"
                    type="text"
                    value={subtitle}
                    autoComplete="off"
                    autoCorrect="off"
                    onChange={(e) => {
                      setSubtitle(e.target.value);
                      setIsDirty(true);
                    }}
                    placeholder="e.g. Oud, Vanilla & Amber"
                    className="w-full min-h-[44px] px-3.5 rounded-xl bg-midnight border border-gold/25 focus:border-gold text-softwhite text-base sm:text-xs placeholder:text-stone-muted focus:outline-none transition-colors"
                  />
                </div>
                <div className="space-y-1">
                  <label htmlFor="fragrance-tagline" className="block text-xs font-medium text-gold">
                    Tagline (Detail Motto)
                  </label>
                  <input
                    id="fragrance-tagline"
                    type="text"
                    value={tagline}
                    autoComplete="off"
                    autoCorrect="off"
                    onChange={(e) => {
                      setTagline(e.target.value);
                      setIsDirty(true);
                    }}
                    placeholder="e.g. Scents that stay in memory."
                    className="w-full min-h-[44px] px-3.5 rounded-xl bg-midnight border border-gold/25 focus:border-gold text-softwhite text-base sm:text-xs placeholder:text-stone-muted focus:outline-none transition-colors"
                  />
                </div>
              </div>
            </div>

            {/* SECTION 2: DETAILS */}
            <div className="space-y-3 pt-3 border-t border-gold/15">
              <span className="text-[10px] uppercase tracking-[0.2em] text-gold font-medium block">
                2. Details & Inventory
              </span>

              {/* Price & Size */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label htmlFor="fragrance-price" className="block text-xs font-medium text-gold">
                    Price in ETB <span className="text-clay font-bold">*</span>
                  </label>
                  <input
                    ref={priceInputRef}
                    id="fragrance-price"
                    type="number"
                    inputMode="decimal"
                    min="1"
                    step="any"
                    required
                    value={priceEtb}
                    onChange={(e) => {
                      setPriceEtb(e.target.value);
                      setIsDirty(true);
                      if (priceError) setPriceError(null);
                    }}
                    placeholder="e.g. 12500"
                    aria-invalid={priceError ? "true" : "false"}
                    aria-describedby={priceError ? "price-error" : undefined}
                    className={`w-full min-h-[44px] px-3.5 rounded-xl bg-midnight border text-softwhite font-mono text-base sm:text-xs placeholder:text-stone-muted focus:outline-none transition-colors ${
                      priceError ? "border-clay focus:border-clay" : "border-gold/25 focus:border-gold"
                    }`}
                  />
                  {priceError && (
                    <p id="price-error" className="text-xs text-clay">
                      {priceError}
                    </p>
                  )}
                </div>

                <div className="space-y-1">
                  <label htmlFor="fragrance-size" className="block text-xs font-medium text-gold">
                    Bottle Size
                  </label>
                  <input
                    id="fragrance-size"
                    type="text"
                    value={size}
                    onChange={(e) => {
                      setSize(e.target.value);
                      setIsDirty(true);
                    }}
                    placeholder="e.g. 50ml, 100ml"
                    className="w-full min-h-[44px] px-3.5 rounded-xl bg-midnight border border-gold/25 focus:border-gold text-softwhite text-base sm:text-xs placeholder:text-stone-muted focus:outline-none transition-colors"
                  />
                </div>
              </div>

              {/* Category & Fragrance Type */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label htmlFor="fragrance-category" className="block text-xs font-medium text-gold">
                    Category <span className="text-clay font-bold">*</span>
                  </label>
                  <select
                    id="fragrance-category"
                    value={category}
                    onChange={(e) => {
                      setCategory(e.target.value as PerfumeCategory);
                      setIsDirty(true);
                    }}
                    className="w-full min-h-[44px] px-3.5 rounded-xl bg-midnight border border-gold/25 focus:border-gold text-softwhite text-base sm:text-xs focus:outline-none capitalize transition-colors"
                  >
                    <option value="women">Women</option>
                    <option value="men">Men</option>
                    <option value="unisex">Unisex</option>
                  </select>
                </div>

                <div className="space-y-1">
                  <label htmlFor="fragrance-type" className="block text-xs font-medium text-gold">
                    Fragrance Type (Optional)
                  </label>
                  <select
                    id="fragrance-type"
                    value={fragranceType}
                    onChange={(e) => {
                      setFragranceType(e.target.value);
                      setIsDirty(true);
                    }}
                    className="w-full min-h-[44px] px-3.5 rounded-xl bg-midnight border border-gold/25 focus:border-gold text-softwhite text-base sm:text-xs focus:outline-none transition-colors"
                  >
                    <option value="">None / Hide</option>
                    <option value="extrait_de_parfum">Extrait de Parfum</option>
                    <option value="eau_de_parfum">Eau de Parfum</option>
                    <option value="eau_de_toilette">Eau de Toilette</option>
                    <option value="perfume_oil">Perfume Oil</option>
                    <option value="bakhoor">Bakhoor</option>
                    <option value="body_splash">Body Splash</option>
                  </select>
                </div>
              </div>

              {/* Status & Featured Toggle */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 items-center">
                <div className="space-y-1">
                  <label htmlFor="fragrance-status" className="block text-xs font-medium text-gold">
                    Availability Status
                  </label>
                  <select
                    id="fragrance-status"
                    value={status}
                    onChange={(e) => {
                      setStatus(e.target.value as PerfumeStatus);
                      setIsDirty(true);
                    }}
                    className="w-full min-h-[44px] px-3.5 rounded-xl bg-midnight border border-gold/25 focus:border-gold text-softwhite text-base sm:text-xs focus:outline-none transition-colors"
                  >
                    <option value="available">Available (In Stock)</option>
                    <option value="new">New Arrival</option>
                    <option value="sold_out">Sold Out</option>
                  </select>
                </div>

                <label className="min-h-[44px] flex items-center gap-3 px-3 py-2 rounded-xl bg-midnight/60 border border-gold/15 cursor-pointer select-none">
                  <input
                    type="checkbox"
                    checked={featured}
                    onChange={(e) => {
                      setFeatured(e.target.checked);
                      setIsDirty(true);
                    }}
                    className="w-5 h-5 rounded accent-gold cursor-pointer"
                  />
                  <div>
                    <span className="text-xs text-softwhite font-medium block">Feature on Homepage</span>
                    <span className="text-[10px] text-stone-muted block">Showcase in Curated Selections</span>
                  </div>
                </label>
              </div>
            </div>

            {/* SECTION 3: DESCRIPTION */}
            <div className="space-y-3 pt-3 border-t border-gold/15">
              <span className="text-[10px] uppercase tracking-[0.2em] text-gold font-medium block">
                3. Story & Descriptions
              </span>

              {/* Short Description with live 0/140 counter */}
              <div className="space-y-1">
                <div className="flex items-center justify-between">
                  <label htmlFor="fragrance-short-desc" className="block text-xs font-medium text-gold">
                    Short Description (Card Toggle Essence)
                  </label>
                  <span
                    className={`text-xs font-mono font-medium ${
                      Array.from(shortDescription).length > 140 ? "text-clay font-bold" : "text-stone-muted"
                    }`}
                  >
                    {Array.from(shortDescription).length} / 140
                  </span>
                </div>
                <textarea
                  ref={shortDescRef}
                  id="fragrance-short-desc"
                  rows={2}
                  value={shortDescription}
                  onChange={(e) => {
                    setShortDescription(e.target.value);
                    setIsDirty(true);
                    if (shortDescError) setShortDescError(null);
                  }}
                  placeholder="Concise 1-2 sentence description shown on card flip. Falls back to full description if empty."
                  aria-invalid={shortDescError ? "true" : "false"}
                  aria-describedby={shortDescError ? "short-desc-error" : undefined}
                  className={`w-full min-h-[44px] p-3 rounded-xl bg-midnight border text-softwhite text-base sm:text-xs placeholder:text-stone-muted focus:outline-none transition-colors leading-relaxed ${
                    Array.from(shortDescription).length > 140 || shortDescError
                      ? "border-clay focus:border-clay"
                      : "border-gold/25 focus:border-gold"
                  }`}
                />
                {(Array.from(shortDescription).length > 140 || shortDescError) && (
                  <p id="short-desc-error" className="text-xs text-clay">
                    {shortDescError || "Short description must not exceed 140 characters."}
                  </p>
                )}
              </div>

              {/* Full Description */}
              <div className="space-y-1">
                <label htmlFor="fragrance-full-desc" className="block text-xs font-medium text-gold">
                  Full Description (Detail Page)
                </label>
                <textarea
                  id="fragrance-full-desc"
                  rows={3}
                  value={description}
                  onChange={(e) => {
                    setDescription(e.target.value);
                    setIsDirty(true);
                  }}
                  placeholder="Artisanal story, inspiration and fragrance profile..."
                  className="w-full min-h-[72px] p-3 rounded-xl bg-midnight border border-gold/25 focus:border-gold text-softwhite text-base sm:text-xs placeholder:text-stone-muted focus:outline-none transition-colors leading-relaxed"
                />
              </div>
            </div>

            {/* SECTION 4: SCENT NOTES (Mobile Tag/Chip Inputs) */}
            <div className="space-y-3 pt-3 border-t border-gold/15">
              <span className="text-[10px] uppercase tracking-[0.2em] text-gold font-medium block">
                4. Olfactory Pyramid (Notes)
              </span>
              <p className="text-[11px] text-stone-muted">
                Type an essence name and press Enter, comma, or tap Add.
              </p>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <ScentNotesInput
                  id="top-notes"
                  label="Top Notes"
                  notes={topNotes}
                  onChange={(n) => {
                    setTopNotes(n);
                    setIsDirty(true);
                  }}
                  placeholder="e.g. Saffron, Bergamot"
                />
                <ScentNotesInput
                  id="heart-notes"
                  label="Heart Notes"
                  notes={heartNotes}
                  onChange={(n) => {
                    setHeartNotes(n);
                    setIsDirty(true);
                  }}
                  placeholder="e.g. Turkish Rose, Oud"
                />
                <ScentNotesInput
                  id="base-notes"
                  label="Base Notes"
                  notes={baseNotes}
                  onChange={(n) => {
                    setBaseNotes(n);
                    setIsDirty(true);
                  }}
                  placeholder="e.g. Vanilla, Amber"
                />
              </div>
            </div>

            {/* SECTION 5: LONGEVITY & SEASON */}
            <div className="space-y-3 pt-3 border-t border-gold/15">
              <span className="text-[10px] uppercase tracking-[0.2em] text-gold font-medium block">
                5. Longevity & Season
              </span>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label htmlFor="fragrance-longevity" className="block text-xs font-medium text-gold">
                    Longevity (Optional)
                  </label>
                  <select
                    id="fragrance-longevity"
                    value={longevity}
                    onChange={(e) => {
                      setLongevity(e.target.value);
                      setIsDirty(true);
                    }}
                    className="w-full min-h-[44px] px-3.5 rounded-xl bg-midnight border border-gold/25 focus:border-gold text-softwhite text-base sm:text-xs focus:outline-none transition-colors"
                  >
                    <option value="">None / Hide</option>
                    <option value="Moderate">Moderate (4-6 hours)</option>
                    <option value="Long-lasting">Long-lasting (8-12 hours)</option>
                    <option value="Very long-lasting">Very long-lasting (12+ hours)</option>
                  </select>
                </div>

                <div className="space-y-1">
                  <label htmlFor="fragrance-season" className="block text-xs font-medium text-gold">
                    Best Season (Optional)
                  </label>
                  <input
                    id="fragrance-season"
                    type="text"
                    value={bestSeason}
                    onChange={(e) => {
                      setBestSeason(e.target.value);
                      setIsDirty(true);
                    }}
                    placeholder="e.g. All Seasons, Fall & Winter"
                    className="w-full min-h-[44px] px-3.5 rounded-xl bg-midnight border border-gold/25 focus:border-gold text-softwhite text-base sm:text-xs placeholder:text-stone-muted focus:outline-none transition-colors"
                  />
                </div>
              </div>
            </div>

            {/* SECTION 6: PHOTOGRAPHY & UPLOAD */}
            <div className="space-y-3 pt-3 border-t border-gold/15">
              <span className="text-[10px] uppercase tracking-[0.2em] text-gold font-medium block">
                6. Bottle Photography
              </span>

              <div className="space-y-3">
                {/* Visual Thumbnail */}
                {imagePreview && (
                  <div className="p-3 rounded-xl bg-midnight/80 border border-gold/25 flex items-center gap-3">
                    <div className="relative w-14 h-14 rounded-lg overflow-hidden border border-gold/40 shadow-sm flex-shrink-0">
                      <Image
                        src={imagePreview}
                        alt="Perfume bottle preview"
                        fill
                        unoptimized
                        className="object-cover"
                      />
                    </div>
                    <div className="space-y-0.5 min-w-0 flex-1">
                      <span className="text-xs text-softwhite font-medium block">Active Bottle Photo</span>
                      <span className="text-[11px] text-stone-muted block truncate max-w-[240px] sm:max-w-md">
                        {imageFile ? imageFile.name : imageUrl ? imageUrl : "Current database image"}
                      </span>
                    </div>
                  </div>
                )}

                <div className="flex flex-wrap items-center gap-3">
                  {/* Gallery / Camera File Upload Trigger */}
                  <label className="min-h-[44px] px-4 rounded-xl bg-midnight border border-gold/30 hover:border-gold text-softwhite text-xs flex items-center gap-2 cursor-pointer transition-colors shadow-sm focus-within:ring-2 focus-within:ring-gold">
                    <Upload className="w-4 h-4 text-gold flex-shrink-0" />
                    <span>{imagePreview ? "Replace Photo (Camera / Gallery)" : "Choose Photo (Camera / Gallery)"}</span>
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept="image/*"
                      onChange={handleFileChange}
                      className="hidden"
                    />
                  </label>
                </div>

                {uploadError && (
                  <p className="text-xs text-clay font-medium">{uploadError}</p>
                )}

                <div className="space-y-1">
                  <label htmlFor="fragrance-url" className="block text-[11px] text-stone-muted">
                    Or direct external image URL:
                  </label>
                  <input
                    id="fragrance-url"
                    type="url"
                    value={imageUrl}
                    onChange={handleUrlChange}
                    placeholder="https://images.unsplash.com/..."
                    className="w-full min-h-[44px] px-3.5 rounded-xl bg-midnight border border-gold/20 focus:border-gold text-softwhite text-base sm:text-xs placeholder:text-stone-muted focus:outline-none transition-colors"
                  />
                </div>
              </div>
            </div>
          </form>
        </div>

        {/* 3. PINNED FOOTER WITH SAFE AREA PADDING */}
        <footer className="flex-shrink-0 px-4 sm:px-6 py-3.5 border-t border-gold/15 bg-plum/95 backdrop-blur-md flex items-center justify-end gap-3 pb-[max(0.875rem,env(safe-area-inset-bottom))] z-10">
          <button
            type="button"
            onClick={handleRequestClose}
            className="min-h-[44px] px-5 rounded-full border border-gold/25 text-stone-muted hover:text-softwhite hover:border-gold/50 text-xs uppercase tracking-wider font-medium transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-gold"
          >
            Cancel
          </button>
          <button
            type="submit"
            form="fragrance-form"
            disabled={submitting || Array.from(shortDescription).length > 140}
            className="min-h-[44px] px-7 rounded-full bg-gold hover:bg-gold-light text-midnight font-medium uppercase tracking-wider text-xs flex items-center justify-center gap-2 shadow-glow disabled:opacity-50 transition-all focus:outline-none focus-visible:ring-2 focus-visible:ring-gold"
          >
            {submitting ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Saving to PostgreSQL...</span>
              </>
            ) : (
              <span>{editingPerfume ? "Save Changes" : "Publish to Boutique"}</span>
            )}
          </button>
        </footer>
      </div>

      {/* DISCARD UNSAVED CHANGES CONFIRMATION POPUP */}
      {showDiscardConfirm && (
        <div
          role="alertdialog"
          aria-modal="true"
          aria-labelledby="discard-title"
          aria-describedby="discard-desc"
          className="fixed inset-0 z-50 bg-midnight/80 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in duration-150"
        >
          <div className="bg-plum border border-gold/30 rounded-2xl max-w-sm w-full p-5 shadow-glow-lg space-y-4">
            <h3 id="discard-title" className="font-serif text-lg text-softwhite">
              Discard Unsaved Changes?
            </h3>
            <p id="discard-desc" className="text-xs text-stone-muted leading-relaxed">
              You have unsaved form edits. If you close now, your changes will be discarded.
            </p>
            <div className="flex items-center justify-end gap-2.5 pt-2">
              <button
                ref={keepEditingBtnRef}
                type="button"
                onClick={() => setShowDiscardConfirm(false)}
                className="min-h-[44px] px-5 rounded-full border border-gold/20 text-xs text-softwhite hover:bg-gold/10 font-medium focus:outline-none focus-visible:ring-2 focus-visible:ring-gold"
              >
                Keep Editing
              </button>
              <button
                type="button"
                onClick={() => {
                  setShowDiscardConfirm(false);
                  handleDialogClosed();
                }}
                className="min-h-[44px] px-5 rounded-full bg-clay text-softwhite text-xs font-medium hover:bg-clay-light focus:outline-none focus-visible:ring-2 focus-visible:ring-clay"
              >
                Discard & Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
