"use client";

import React, { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
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
  LogOut,
  Loader2,
  RefreshCw,
} from "lucide-react";
import { Perfume, PerfumeCategory, PerfumeStatus } from "@/types/perfume";
import { formatPrice } from "@/lib/utils";
import {
  fetchPerfumes,
  createPerfume,
  updatePerfume,
  deletePerfume,
  updatePerfumeStatus,
  uploadPerfumeImage,
  checkAdminSession,
  logoutAdmin,
  changeAdminPassword,
  updateAdminProfile,
  PerfumePayload,
} from "@/lib/api";

const ALLOWED_MIME_TYPES = [
  "image/jpeg",
  "image/jpg",
  "image/png",
  "image/webp",
  "image/avif",
];
const MAX_FILE_SIZE_MB = 5;

export default function AdminPage() {
  const router = useRouter();
  const [perfumes, setPerfumes] = useState<Perfume[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [adminUser, setAdminUser] = useState<{ id: string; email: string } | null>(null);
  const [authChecking, setAuthChecking] = useState(true);

  // Modals state
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingPerfume, setEditingPerfume] = useState<Perfume | null>(null);
  const [deletingPerfume, setDeletingPerfume] = useState<Perfume | null>(null);
  const [submitting, setSubmitting] = useState(false);

  // Security & Account Settings State
  const [showSecurityModal, setShowSecurityModal] = useState(false);
  const [newAdminEmail, setNewAdminEmail] = useState("");
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmNewPassword, setConfirmNewPassword] = useState("");
  const [securityLoading, setSecurityLoading] = useState(false);
  const [securitySuccess, setSecuritySuccess] = useState<string | null>(null);
  const [securityError, setSecurityError] = useState<string | null>(null);

  // Add/Edit Form State
  const [formName, setFormName] = useState("");
  const [formSubtitle, setFormSubtitle] = useState("");
  const [formTagline, setFormTagline] = useState("");
  const [formDescription, setFormDescription] = useState("");
  const [formPriceEtb, setFormPriceEtb] = useState("");
  const [formSize, setFormSize] = useState("100ml");
  const [formCategory, setFormCategory] = useState<PerfumeCategory>("unisex");
  const [formStatus, setFormStatus] = useState<PerfumeStatus>("available");
  const [formFeatured, setFormFeatured] = useState(false);
  const [formTopNotes, setFormTopNotes] = useState("");
  const [formHeartNotes, setFormHeartNotes] = useState("");
  const [formBaseNotes, setFormBaseNotes] = useState("");
  const [formLongevity, setFormLongevity] = useState("10-14 hours");
  const [formBestSeason, setFormBestSeason] = useState("All Seasons");
  const [formImageUrl, setFormImageUrl] = useState("");
  const [formImageFile, setFormImageFile] = useState<File | null>(null);
  const [formImagePreview, setFormImagePreview] = useState<string | null>(null);
  const [formUploadError, setFormUploadError] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  // Load catalog directly from PostgreSQL through Go API
  const loadCatalog = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await fetchPerfumes();
      setPerfumes(data);
    } catch (err: any) {
      setError(err.message || "Failed to load perfume catalog from server.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    let isMounted = true;
    async function verifyAuthAndLoad() {
      try {
        const user = await checkAdminSession();
        if (!isMounted) return;
        if (!user) {
          router.replace("/admin/login");
          return;
        }
        setAdminUser(user);
        setAuthChecking(false);
        loadCatalog();
      } catch {
        if (isMounted) {
          router.replace("/admin/login");
        }
      }
    }
    verifyAuthAndLoad();
    return () => {
      isMounted = false;
    };
  }, [router]);

  const handleLogout = async () => {
    await logoutAdmin();
    setAdminUser(null);
    router.push("/admin/login");
  };

  // Availability status toggle
  const handleStatusChange = async (id: string, name: string, nextStatus: PerfumeStatus) => {
    try {
      await updatePerfumeStatus(id, nextStatus);
      setPerfumes((prev) =>
        prev.map((p) => (p.id === id ? { ...p, status: nextStatus } : p))
      );
      showToast(`✓ Updated ${name} status to ${nextStatus.replace("_", " ").toUpperCase()}`);
    } catch (err: any) {
      alert(`Status update failed: ${err.message}. Please verify you are logged in.`);
    }
  };

  // Handle local image file selection
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormUploadError(null);
    const file = e.target.files?.[0];
    if (!file) return;

    if (!ALLOWED_MIME_TYPES.includes(file.type)) {
      setFormUploadError("Unsupported format. Allowed: JPG, PNG, WebP, AVIF.");
      return;
    }
    if (file.size > MAX_FILE_SIZE_MB * 1024 * 1024) {
      setFormUploadError("File exceeds 5MB size limit.");
      return;
    }

    setFormImageFile(file);
    setFormImagePreview(URL.createObjectURL(file));
  };

  // Open Edit Modal with existing values
  const openEditModal = (item: Perfume) => {
    setEditingPerfume(item);
    setFormName(item.name);
    setFormSubtitle(item.subtitle || "");
    setFormTagline(item.tagline || "");
    setFormDescription(item.description || "");
    setFormPriceEtb(String(item.price));
    setFormSize(String(item.sizeMl || "100ml"));
    setFormCategory(item.category);
    setFormStatus(item.status);
    setFormFeatured(item.featured);
    setFormTopNotes(item.notes?.top ? item.notes.top.join(", ") : "");
    setFormHeartNotes(item.notes?.heart ? item.notes.heart.join(", ") : "");
    setFormBaseNotes(item.notes?.base ? item.notes.base.join(", ") : "");
    setFormLongevity(item.longevity || "10-14 hours");
    setFormBestSeason(item.bestSeason || "All Seasons");
    setFormImageUrl(item.images?.[0] || "");
    setFormImageFile(null);
    setFormImagePreview(item.images?.[0] || null);
    setFormUploadError(null);
  };

  // Reset form
  const resetForm = () => {
    setFormName("");
    setFormSubtitle("");
    setFormTagline("");
    setFormDescription("");
    setFormPriceEtb("");
    setFormSize("100ml");
    setFormCategory("unisex");
    setFormStatus("available");
    setFormFeatured(false);
    setFormTopNotes("");
    setFormHeartNotes("");
    setFormBaseNotes("");
    setFormLongevity("10-14 hours");
    setFormBestSeason("All Seasons");
    setFormImageUrl("");
    setFormImageFile(null);
    setFormImagePreview(null);
    setFormUploadError(null);
    setShowAddModal(false);
    setEditingPerfume(null);
  };

  // Submit Admin Email Update
  const handleUpdateEmail = async (e: React.FormEvent) => {
    e.preventDefault();
    setSecurityError(null);
    setSecuritySuccess(null);
    if (!newAdminEmail.trim() || !newAdminEmail.includes("@")) {
      setSecurityError("Please enter a valid email address.");
      return;
    }

    setSecurityLoading(true);
    try {
      const res = await updateAdminProfile(newAdminEmail.trim());
      setAdminUser((prev) => (prev ? { ...prev, email: res.email } : prev));
      setSecuritySuccess("✓ Admin email updated successfully!");
      showToast("✓ Admin email updated successfully");
    } catch (err: any) {
      setSecurityError(err.message || "Failed to update email.");
    } finally {
      setSecurityLoading(false);
    }
  };

  // Submit Password Change
  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setSecurityError(null);
    setSecuritySuccess(null);
    if (!currentPassword) {
      setSecurityError("Current password is required.");
      return;
    }
    if (newPassword.length < 8) {
      setSecurityError("New password must be at least 8 characters long.");
      return;
    }
    if (newPassword !== confirmNewPassword) {
      setSecurityError("New passwords do not match.");
      return;
    }

    setSecurityLoading(true);
    try {
      await changeAdminPassword(currentPassword, newPassword);
      setSecuritySuccess("✓ Password changed successfully!");
      setCurrentPassword("");
      setNewPassword("");
      setConfirmNewPassword("");
      showToast("✓ Password changed successfully");
    } catch (err: any) {
      setSecurityError(err.message || "Failed to change password.");
    } finally {
      setSecurityLoading(false);
    }
  };

  // Submit Add Fragrance (POST)
  const handleCreateSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formName.trim() || !formPriceEtb) {
      alert("Name and price in ETB are required.");
      return;
    }

    setSubmitting(true);
    try {
      let finalImageUrl = formImageUrl.trim() ||
        "https://images.unsplash.com/photo-1592945403244-b3fbafd7f539?q=80&w=1000&auto=format&fit=crop";

      // If a local image file was chosen, upload to backend first
      if (formImageFile) {
        finalImageUrl = await uploadPerfumeImage(formImageFile);
      }

      const payload: PerfumePayload = {
        name: formName.trim(),
        subtitle: formSubtitle.trim() || "Artisanal extrait de parfum",
        tagline: formTagline.trim() || "Scents that stay in memory.",
        description: formDescription.trim() || `Bespoke artisanal fragrance with notes of ${formTopNotes || "precious woods and florals"}.`,
        price: Number(formPriceEtb),
        sizeMl: formSize.trim() || "100ml",
        category: formCategory,
        status: formStatus,
        featured: formFeatured,
        notes: {
          top: formTopNotes ? formTopNotes.split(",").map((s) => s.trim()).filter(Boolean) : ["Bergamot", "Cardamom"],
          heart: formHeartNotes ? formHeartNotes.split(",").map((s) => s.trim()).filter(Boolean) : ["Amber", "Rose"],
          base: formBaseNotes ? formBaseNotes.split(",").map((s) => s.trim()).filter(Boolean) : ["Oud", "Musk"],
        },
        images: [finalImageUrl],
        longevity: formLongevity,
        bestSeason: formBestSeason,
      };

      const created = await createPerfume(payload);
      if (created && created.name) {
        setPerfumes((prev) => [created, ...prev.filter((p) => p && p.id !== created.id)]);
        showToast(`✓ Published ${created.name} permanently to PostgreSQL!`);
      } else {
        await loadCatalog();
        showToast(`✓ Published fragrance permanently to PostgreSQL!`);
      }
      resetForm();
    } catch (err: any) {
      alert(`Failed to create perfume: ${err.message}. Make sure you are authenticated.`);
    } finally {
      setSubmitting(false);
    }
  };

  // Submit Edit Fragrance (PUT)
  const handleEditSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingPerfume) return;
    if (!formName.trim() || !formPriceEtb) {
      alert("Name and price in ETB are required.");
      return;
    }

    setSubmitting(true);
    try {
      let finalImageUrl = formImageUrl.trim() || editingPerfume.images?.[0] || "";

      // If user replaced with a new file
      if (formImageFile) {
        finalImageUrl = await uploadPerfumeImage(formImageFile);
      }

      const payload: Partial<PerfumePayload> = {
        name: formName.trim(),
        subtitle: formSubtitle.trim(),
        tagline: formTagline.trim(),
        description: formDescription.trim(),
        price: Number(formPriceEtb),
        sizeMl: formSize.trim(),
        category: formCategory,
        status: formStatus,
        featured: formFeatured,
        notes: {
          top: formTopNotes ? formTopNotes.split(",").map((s) => s.trim()).filter(Boolean) : [],
          heart: formHeartNotes ? formHeartNotes.split(",").map((s) => s.trim()).filter(Boolean) : [],
          base: formBaseNotes ? formBaseNotes.split(",").map((s) => s.trim()).filter(Boolean) : [],
        },
        images: finalImageUrl ? [finalImageUrl] : editingPerfume.images,
        longevity: formLongevity,
        bestSeason: formBestSeason,
      };

      const updated = await updatePerfume(editingPerfume.id, payload);
      if (updated && updated.name) {
        setPerfumes((prev) => prev.map((p) => (p && p.id === updated.id ? updated : p)));
        showToast(`✓ Updated ${updated.name} (Price: ${formatPrice(updated.price)}) in database!`);
      } else {
        await loadCatalog();
        showToast(`✓ Updated fragrance in database!`);
      }
      resetForm();
    } catch (err: any) {
      alert(`Failed to update perfume: ${err.message}. Make sure you are authenticated.`);
    } finally {
      setSubmitting(false);
    }
  };

  // Submit Delete Fragrance (DELETE with confirmation)
  const handleConfirmDelete = async () => {
    if (!deletingPerfume) return;

    setSubmitting(true);
    try {
      await deletePerfume(deletingPerfume.id);
      setPerfumes((prev) => prev.filter((p) => p.id !== deletingPerfume.id));
      showToast(`✓ Permanently deleted ${deletingPerfume.name} from PostgreSQL.`);
      setDeletingPerfume(null);
    } catch (err: any) {
      alert(`Failed to delete perfume: ${err.message}. Make sure you are authenticated.`);
    } finally {
      setSubmitting(false);
    }
  };

  const filtered = (Array.isArray(perfumes) ? perfumes : []).filter((p) => {
    if (!p) return false;
    const pName = (p.name || "").toLowerCase();
    const pSub = (p.subtitle || "").toLowerCase();
    const q = (search || "").toLowerCase();
    return pName.includes(q) || pSub.includes(q);
  });

  if (authChecking) {
    return (
      <div className="min-h-[85vh] flex flex-col items-center justify-center gap-4 text-center px-4">
        <div className="w-14 h-14 rounded-full bg-midnight border border-gold/40 flex items-center justify-center text-gold shadow-glow">
          <Lock className="w-6 h-6 animate-pulse" />
        </div>
        <div className="space-y-1">
          <h2 className="font-serif text-lg text-softwhite">Aura Admin Studio</h2>
          <p className="text-xs text-stone-muted tracking-wider uppercase flex items-center justify-center gap-2">
            <Loader2 className="w-3.5 h-3.5 animate-spin text-gold" />
            Verifying Administrator Session...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="pt-28 pb-20 max-w-[1200px] mx-auto px-4 sm:px-6">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed top-24 right-6 z-50 px-5 py-3 rounded-xl bg-midnight border border-gold/40 text-gold shadow-glow flex items-center gap-2.5 text-xs animate-in slide-in-from-top duration-300">
          <CheckCircle2 className="w-4 h-4 text-sage" />
          <span>{toastMessage}</span>
        </div>
      )}

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
            Database-backed perfume management, real-time availability, and Ethiopian Birr (ETB) pricing.
          </p>
        </div>

        <div className="flex items-center gap-3">
          {adminUser ? (
            <div className="flex items-center gap-2">
              <span className="text-[11px] text-stone-muted bg-plum/60 border border-gold/20 px-3 py-1.5 rounded-full">
                {adminUser.email}
              </span>
              <button
                onClick={() => {
                  setNewAdminEmail(adminUser.email);
                  setSecurityError(null);
                  setSecuritySuccess(null);
                  setCurrentPassword("");
                  setNewPassword("");
                  setConfirmNewPassword("");
                  setShowSecurityModal(true);
                }}
                className="p-2 rounded-full border border-gold/30 text-stone-muted hover:text-gold hover:border-gold transition-colors"
                title="Account & Security Settings"
              >
                <Shield className="w-4 h-4" />
              </button>
              <button
                onClick={handleLogout}
                className="p-2 rounded-full border border-gold/30 text-stone-muted hover:text-clay hover:border-clay transition-colors"
                title="Log out"
              >
                <LogOut className="w-4 h-4" />
              </button>
            </div>
          ) : (
            <Link
              href="/admin/login"
              className="px-4 py-2 rounded-full border border-gold/30 text-xs text-softwhite hover:border-gold hover:text-gold transition-colors flex items-center gap-1.5"
            >
              <Lock className="w-3.5 h-3.5" />
              <span>Admin Auth</span>
            </Link>
          )}

          <button
            onClick={() => {
              resetForm();
              setShowAddModal(true);
            }}
            className="min-h-[40px] px-5 rounded-full bg-gold hover:bg-gold-light text-midnight font-medium text-xs uppercase tracking-wider flex items-center gap-1.5 shadow-glow transition-all"
          >
            <Plus className="w-4 h-4" />
            <span>Add Fragrance</span>
          </button>
        </div>
      </div>

      {/* Error / Backend Unavailable Banner */}
      {error && (
        <div className="p-4 rounded-xl bg-clay/20 border border-clay/40 text-softwhite text-xs mb-6 flex items-center justify-between gap-3">
          <div className="flex items-center gap-2.5">
            <AlertCircle className="w-5 h-5 text-clay flex-shrink-0" />
            <div>
              <p className="font-semibold text-clay">Backend Connection Error</p>
              <p className="text-stone-muted text-[11px] mt-0.5">{error}</p>
            </div>
          </div>
          <button
            onClick={loadCatalog}
            className="px-3 py-1.5 rounded-lg bg-midnight border border-gold/30 text-gold text-xs flex items-center gap-1.5 hover:bg-gold/10"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            <span>Retry</span>
          </button>
        </div>
      )}

      {/* Search & Counter Bar */}
      <div className="mb-6 flex items-center justify-between gap-4">
        <div className="relative max-w-sm w-full">
          <Search className="w-4 h-4 text-gold absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search perfumes in PostgreSQL..."
            className="w-full pl-9 pr-4 py-2 rounded-lg bg-plum/60 border border-gold/20 text-xs text-softwhite placeholder:text-stone-muted focus:outline-none focus:border-gold"
          />
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={loadCatalog}
            className="p-2 rounded-lg border border-gold/20 text-stone-muted hover:text-gold"
            title="Refresh catalog from PostgreSQL"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? "animate-spin text-gold" : ""}`} />
          </button>
          <span className="text-xs text-stone-muted font-mono">
            {perfumes.length} Fragrances Total
          </span>
        </div>
      </div>

      {/* Loading state */}
      {loading && perfumes.length === 0 ? (
        <div className="p-16 text-center space-y-3 bg-plum/30 rounded-2xl border border-gold/15">
          <Loader2 className="w-8 h-8 text-gold animate-spin mx-auto" />
          <p className="text-xs text-stone-muted">Querying PostgreSQL database...</p>
        </div>
      ) : (
        /* Perfumes Table & Mobile Cards */
        <div className="rounded-xl bg-plum/40 border border-gold/15 overflow-hidden">
          {/* Table View (Tablets & Desktop) */}
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
                          src={(item.images && item.images.length > 0 && item.images[0]?.trim()) || "https://images.unsplash.com/photo-1592945403244-b3fbafd7f539?q=80&w=1000&auto=format&fit=crop"}
                          alt={item.name}
                          fill
                          className="object-cover"
                        />
                      </div>
                      <div>
                        <p className="font-serif text-sm font-medium text-softwhite flex items-center gap-2">
                          <span>{item.name}</span>
                          {item.featured && (
                            <span className="text-[9px] px-1.5 py-0.5 rounded bg-gold/20 text-gold uppercase tracking-wider font-semibold">
                              Featured
                            </span>
                          )}
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
                      <select
                        value={item.status}
                        onChange={(e) =>
                          handleStatusChange(
                            item.id,
                            item.name,
                            e.target.value as PerfumeStatus
                          )
                        }
                        className={`px-2.5 py-1 rounded-full text-[10px] uppercase font-semibold tracking-wider transition-all cursor-pointer focus:outline-none focus:ring-1 focus:ring-gold ${item.status === "available"
                          ? "bg-sage/20 text-sage border border-sage/40"
                          : item.status === "new"
                            ? "bg-gold/20 text-gold border border-gold/40"
                            : "bg-clay/20 text-clay border border-clay/40"
                          }`}
                        title="Change availability status"
                      >
                        <option value="available" className="bg-midnight text-sage">
                          Available
                        </option>
                        <option value="new" className="bg-midnight text-gold">
                          New Arrival
                        </option>
                        <option value="sold_out" className="bg-midnight text-clay">
                          Sold Out
                        </option>
                      </select>
                    </td>
                    <td className="py-3 px-4 capitalize text-stone-muted">
                      {item.category}
                    </td>
                    <td className="py-3 px-4 text-right space-x-1.5">
                      <Link
                        href={`/perfumes/${item.slug}`}
                        className="p-1.5 rounded hover:bg-midnight/70 text-stone-muted hover:text-gold inline-block"
                        title="View public page"
                      >
                        <Eye className="w-4 h-4" />
                      </Link>
                      <button
                        onClick={() => openEditModal(item)}
                        className="p-1.5 rounded hover:bg-midnight/70 text-stone-muted hover:text-gold inline-block"
                        title="Edit fragrance & price"
                      >
                        <Edit2 className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => setDeletingPerfume(item)}
                        className="p-1.5 rounded hover:bg-midnight/70 text-stone-muted hover:text-clay inline-block"
                        title="Delete fragrance"
                      >
                        <Trash2 className="w-4 h-4" />
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
              <div key={item.id} className="p-4 space-y-3">
                <div className="flex items-center justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <div className="relative w-12 h-14 rounded overflow-hidden bg-midnight flex-shrink-0">
                      <Image
                        src={(item.images && item.images.length > 0 && item.images[0]?.trim()) || "https://images.unsplash.com/photo-1592945403244-b3fbafd7f539?q=80&w=1000&auto=format&fit=crop"}
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
                    </div>
                  </div>

                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => openEditModal(item)}
                      className="p-2 rounded-full bg-midnight/80 border border-gold/20 text-gold"
                      title="Edit"
                    >
                      <Edit2 className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => setDeletingPerfume(item)}
                      className="p-2 rounded-full bg-midnight/80 border border-clay/40 text-clay"
                      title="Delete"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

                <div className="flex items-center justify-between pt-1 border-t border-gold/10 text-xs">
                  <span className="capitalize text-stone-muted">{item.category}</span>
                  <select
                    value={item.status}
                    onChange={(e) =>
                      handleStatusChange(
                        item.id,
                        item.name,
                        e.target.value as PerfumeStatus
                      )
                    }
                    className={`px-2 py-0.5 rounded-full text-[9px] uppercase font-semibold tracking-wider transition-all cursor-pointer focus:outline-none ${item.status === "available"
                      ? "bg-sage/20 text-sage border border-sage/40"
                      : item.status === "new"
                        ? "bg-gold/20 text-gold border border-gold/40"
                        : "bg-clay/20 text-clay border border-clay/40"
                      }`}
                  >
                    <option value="available" className="bg-midnight text-sage">
                      Available
                    </option>
                    <option value="new" className="bg-midnight text-gold">
                      New Arrival
                    </option>
                    <option value="sold_out" className="bg-midnight text-clay">
                      Sold Out
                    </option>
                  </select>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ADD / EDIT MODAL */}
      {(showAddModal || editingPerfume) && (
        <div
          role="dialog"
          aria-modal="true"
          className="fixed inset-0 z-50 bg-midnight/90 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto"
        >
          <div className="bg-plum border border-gold/30 rounded-2xl max-w-lg w-full p-6 space-y-5 shadow-glow my-8">
            <div className="flex items-center justify-between border-b border-gold/15 pb-3">
              <div>
                <h3 className="font-serif text-xl text-softwhite">
                  {editingPerfume ? `Edit: ${editingPerfume.name}` : "Add New Fragrance"}
                </h3>
                <p className="text-[11px] text-stone-muted mt-0.5">
                  Changes save directly to PostgreSQL database.
                </p>
              </div>
              <button
                onClick={resetForm}
                className="p-1 rounded-full text-stone-muted hover:text-gold"
                aria-label="Close modal"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form
              onSubmit={editingPerfume ? handleEditSubmit : handleCreateSubmit}
              className="space-y-4 text-xs"
            >
              {/* Name & Subtitle */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-gold mb-1 font-medium">
                    Fragrance Name *
                  </label>
                  <input
                    type="text"
                    value={formName}
                    onChange={(e) => setFormName(e.target.value)}
                    placeholder="e.g. Amber Nocturne"
                    required
                    className="w-full p-2.5 rounded-lg bg-midnight border border-gold/20 text-softwhite focus:border-gold focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-gold mb-1 font-medium">
                    Subtitle Notes
                  </label>
                  <input
                    type="text"
                    value={formSubtitle}
                    onChange={(e) => setFormSubtitle(e.target.value)}
                    placeholder="e.g. Oud, Vanilla & Amber"
                    className="w-full p-2.5 rounded-lg bg-midnight border border-gold/20 text-softwhite focus:border-gold focus:outline-none"
                  />
                </div>
              </div>

              {/* Price & Size */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-gold mb-1 font-medium">
                    Price in ETB *
                  </label>
                  <input
                    type="number"
                    min="1"
                    step="any"
                    value={formPriceEtb}
                    onChange={(e) => setFormPriceEtb(e.target.value)}
                    placeholder="e.g. 12500"
                    required
                    className="w-full p-2.5 rounded-lg bg-midnight border border-gold/20 text-softwhite font-mono focus:border-gold focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-gold mb-1 font-medium">
                    Bottle Size
                  </label>
                  <input
                    type="text"
                    value={formSize}
                    onChange={(e) => setFormSize(e.target.value)}
                    placeholder="e.g. 50ml, 100ml"
                    className="w-full p-2.5 rounded-lg bg-midnight border border-gold/20 text-softwhite focus:border-gold focus:outline-none"
                  />
                </div>
              </div>

              {/* Category, Status & Featured */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block text-gold mb-1 font-medium">
                    Category
                  </label>
                  <select
                    value={formCategory}
                    onChange={(e) => setFormCategory(e.target.value as PerfumeCategory)}
                    className="w-full p-2.5 rounded-lg bg-midnight border border-gold/20 text-softwhite focus:border-gold focus:outline-none capitalize"
                  >
                    <option value="unisex">Unisex</option>
                    <option value="feminine">Feminine</option>
                    <option value="masculine">Masculine</option>
                  </select>
                </div>
                <div>
                  <label className="block text-gold mb-1 font-medium">
                    Initial Status
                  </label>
                  <select
                    value={formStatus}
                    onChange={(e) => setFormStatus(e.target.value as PerfumeStatus)}
                    className="w-full p-2.5 rounded-lg bg-midnight border border-gold/20 text-softwhite focus:border-gold focus:outline-none"
                  >
                    <option value="available">Available</option>
                    <option value="new">New Arrival</option>
                    <option value="sold_out">Sold Out</option>
                  </select>
                </div>
                <div className="flex items-center gap-2 pt-6">
                  <input
                    type="checkbox"
                    id="formFeatured"
                    checked={formFeatured}
                    onChange={(e) => setFormFeatured(e.target.checked)}
                    className="w-4 h-4 rounded accent-gold"
                  />
                  <label htmlFor="formFeatured" className="text-softwhite text-xs cursor-pointer">
                    Feature on Homepage
                  </label>
                </div>
              </div>

              {/* Olfactory Notes Pyramid */}
              <div className="space-y-2 pt-1 border-t border-gold/15">
                <span className="text-gold font-medium block">
                  Olfactory Notes (Comma-separated)
                </span>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                  <input
                    type="text"
                    value={formTopNotes}
                    onChange={(e) => setFormTopNotes(e.target.value)}
                    placeholder="Top (e.g. Saffron)"
                    className="w-full p-2 rounded bg-midnight border border-gold/20 text-softwhite focus:outline-none"
                  />
                  <input
                    type="text"
                    value={formHeartNotes}
                    onChange={(e) => setFormHeartNotes(e.target.value)}
                    placeholder="Heart (e.g. Rose)"
                    className="w-full p-2 rounded bg-midnight border border-gold/20 text-softwhite focus:outline-none"
                  />
                  <input
                    type="text"
                    value={formBaseNotes}
                    onChange={(e) => setFormBaseNotes(e.target.value)}
                    placeholder="Base (e.g. Oud)"
                    className="w-full p-2 rounded bg-midnight border border-gold/20 text-softwhite focus:outline-none"
                  />
                </div>
              </div>

              {/* Image Upload or URL */}
              <div className="space-y-2 pt-1 border-t border-gold/15">
                <label className="block text-gold font-medium">
                  Bottle Photography
                </label>
                <div className="flex items-center gap-3">
                  <label className="min-h-[38px] px-4 rounded-lg bg-midnight border border-gold/30 hover:border-gold text-softwhite text-xs flex items-center gap-2 cursor-pointer transition-colors">
                    <Upload className="w-4 h-4 text-gold" />
                    <span>Upload Image (.webp, .jpg, .png)</span>
                    <input
                      type="file"
                      accept=".jpg,.jpeg,.png,.webp,.avif"
                      onChange={handleFileChange}
                      className="hidden"
                    />
                  </label>
                  {formImagePreview && (
                    <div className="relative w-10 h-10 rounded overflow-hidden border border-gold/30">
                      <Image
                        src={formImagePreview}
                        alt="Preview"
                        fill
                        unoptimized
                        className="object-cover"
                      />
                    </div>
                  )}
                </div>
                {formUploadError && (
                  <p className="text-[11px] text-clay">{formUploadError}</p>
                )}
                <input
                  type="url"
                  value={formImageUrl}
                  onChange={(e) => setFormImageUrl(e.target.value)}
                  placeholder="Or paste external image URL (https://...)"
                  className="w-full p-2 rounded bg-midnight border border-gold/20 text-softwhite text-[11px] focus:outline-none"
                />
              </div>

              {/* Submit Buttons */}
              <div className="flex items-center justify-end gap-3 pt-3 border-t border-gold/15">
                <button
                  type="button"
                  onClick={resetForm}
                  className="px-4 py-2 rounded-full border border-gold/20 text-stone-muted hover:text-softwhite transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="min-h-[40px] px-6 rounded-full bg-gold hover:bg-gold-light text-midnight font-medium uppercase tracking-wider text-xs flex items-center gap-2 shadow-glow disabled:opacity-50 transition-all"
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
              </div>
            </form>
          </div>
        </div>
      )}

      {/* DELETE CONFIRMATION MODAL */}
      {deletingPerfume && (
        <div
          role="dialog"
          aria-modal="true"
          className="fixed inset-0 z-50 bg-midnight/90 backdrop-blur-sm flex items-center justify-center p-4"
        >
          <div className="bg-plum border border-clay/50 rounded-2xl max-w-md w-full p-6 space-y-4 shadow-glow">
            <div className="w-12 h-12 rounded-full bg-clay/20 border border-clay/40 flex items-center justify-center text-clay mx-auto">
              <Trash2 className="w-6 h-6" />
            </div>
            <div className="text-center space-y-1">
              <h3 className="font-serif text-xl text-softwhite">
                Delete Fragrance?
              </h3>
              <p className="text-xs text-stone-muted leading-relaxed">
                Are you sure you want to permanently delete{" "}
                <span className="font-semibold text-softwhite">
                  &ldquo;{deletingPerfume.name}&rdquo;
                </span>
                ? This will remove it from the PostgreSQL database and public collection.
              </p>
            </div>
            <div className="flex items-center justify-center gap-3 pt-3">
              <button
                type="button"
                onClick={() => setDeletingPerfume(null)}
                className="px-5 py-2.5 rounded-full border border-gold/30 text-xs text-stone-muted hover:text-softwhite transition-colors"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={submitting}
                onClick={handleConfirmDelete}
                className="min-h-[40px] px-6 rounded-full bg-clay hover:bg-clay-light text-softwhite font-medium text-xs uppercase tracking-wider flex items-center gap-2 transition-all disabled:opacity-50"
              >
                {submitting ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Deleting...</span>
                  </>
                ) : (
                  <span>Confirm Delete</span>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ACCOUNT & SECURITY MODAL */}
      {showSecurityModal && (
        <div
          role="dialog"
          aria-modal="true"
          className="fixed inset-0 z-50 bg-midnight/90 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto"
        >
          <div className="bg-plum border border-gold/30 rounded-2xl max-w-lg w-full p-6 sm:p-8 space-y-6 shadow-glow relative my-8">
            <button
              onClick={() => setShowSecurityModal(false)}
              className="absolute top-5 right-5 p-2 rounded-full text-stone-muted hover:text-gold hover:bg-midnight/50 transition-colors"
              title="Close modal"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-center gap-3 border-b border-gold/20 pb-4">
              <div className="w-10 h-10 rounded-full bg-midnight border border-gold/30 flex items-center justify-center text-gold">
                <Shield className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-serif text-xl text-softwhite">
                  Account & Security
                </h3>
                <p className="text-xs text-stone-muted">
                  Update administrator email and access credentials
                </p>
              </div>
            </div>

            {/* Status alerts */}
            {securitySuccess && (
              <div className="p-3 rounded-xl bg-sage/20 border border-sage/40 text-sage text-xs flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 flex-shrink-0" />
                <span>{securitySuccess}</span>
              </div>
            )}
            {securityError && (
              <div className="p-3 rounded-xl bg-clay/20 border border-clay/40 text-clay text-xs flex items-center gap-2">
                <AlertCircle className="w-4 h-4 flex-shrink-0" />
                <span>{securityError}</span>
              </div>
            )}

            {/* Section 1: Update Email */}
            <form onSubmit={handleUpdateEmail} className="space-y-3 pt-1">
              <h4 className="text-xs font-semibold uppercase tracking-wider text-gold flex items-center gap-1.5">
                <span>Administrator Email</span>
              </h4>
              <div className="flex flex-col sm:flex-row gap-2.5">
                <input
                  type="email"
                  value={newAdminEmail}
                  onChange={(e) => setNewAdminEmail(e.target.value)}
                  placeholder="admin@aurabyhani.com"
                  required
                  className="flex-1 p-2.5 rounded-lg bg-midnight border border-gold/20 text-softwhite text-xs focus:outline-none focus:border-gold"
                />
                <button
                  type="submit"
                  disabled={securityLoading}
                  className="px-5 py-2.5 rounded-lg bg-gold hover:bg-gold-light text-midnight font-medium text-xs uppercase tracking-wider shadow-glow transition-all disabled:opacity-50 whitespace-nowrap"
                >
                  {securityLoading ? "Saving..." : "Update Email"}
                </button>
              </div>
              <p className="text-[11px] text-stone-muted">
                Safely updates the primary admin email without duplicating the account.
              </p>
            </form>

            <div className="border-t border-gold/15 my-4" />

            {/* Section 2: Change Password */}
            <form onSubmit={handleChangePassword} className="space-y-4">
              <h4 className="text-xs font-semibold uppercase tracking-wider text-gold flex items-center gap-1.5">
                <span>Change Password</span>
              </h4>

              <div className="space-y-3">
                <div>
                  <label className="block text-[11px] text-stone-muted mb-1">
                    Current Password *
                  </label>
                  <input
                    type="password"
                    value={currentPassword}
                    onChange={(e) => setCurrentPassword(e.target.value)}
                    required
                    placeholder="••••••••••••"
                    className="w-full p-2.5 rounded-lg bg-midnight border border-gold/20 text-softwhite text-xs focus:outline-none focus:border-gold"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[11px] text-stone-muted mb-1">
                      New Password (Min 8 chars) *
                    </label>
                    <input
                      type="password"
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      required
                      placeholder="••••••••••••"
                      className="w-full p-2.5 rounded-lg bg-midnight border border-gold/20 text-softwhite text-xs focus:outline-none focus:border-gold"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] text-stone-muted mb-1">
                      Confirm New Password *
                    </label>
                    <input
                      type="password"
                      value={confirmNewPassword}
                      onChange={(e) => setConfirmNewPassword(e.target.value)}
                      required
                      placeholder="••••••••••••"
                      className="w-full p-2.5 rounded-lg bg-midnight border border-gold/20 text-softwhite text-xs focus:outline-none focus:border-gold"
                    />
                  </div>
                </div>
              </div>

              <div className="flex items-center justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setShowSecurityModal(false)}
                  className="px-4 py-2 rounded-full border border-gold/20 text-stone-muted hover:text-softwhite text-xs transition-colors"
                >
                  Close
                </button>
                <button
                  type="submit"
                  disabled={securityLoading}
                  className="min-h-[38px] px-5 rounded-full bg-gold hover:bg-gold-light text-midnight font-medium uppercase tracking-wider text-xs flex items-center gap-2 shadow-glow disabled:opacity-50 transition-all"
                >
                  {securityLoading ? (
                    <>
                      <Loader2 className="w-3.5 h-3.5 animate-spin" />
                      <span>Updating...</span>
                    </>
                  ) : (
                    <span>Update Password</span>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
