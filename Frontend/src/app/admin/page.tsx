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
  Image as ImageIcon,
  CheckCircle2,
  AlertCircle,
  X,
  LogOut,
  Loader2,
  RefreshCw,
} from "lucide-react";
import {
  Perfume,
  PerfumeCategory,
  PerfumeStatus,
  FragranceType,
  CATEGORY_LABELS,
  FRAGRANCE_TYPE_LABELS,
} from "@/types/perfume";
import { formatPrice } from "@/lib/utils";
import FragranceFormDialog from "@/components/admin/FragranceFormDialog";
import {
  fetchPerfumes,
  deletePerfume,
  updatePerfumeStatus,
  checkAdminSession,
  logoutAdmin,
  changeAdminPassword,
  updateAdminProfile,
} from "@/lib/api";

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

  // Open Edit Modal with selected perfume
  const openEditModal = (item: Perfume) => {
    setEditingPerfume(item);
  };

  // Reset form
  const resetForm = () => {
    setShowAddModal(false);
    setEditingPerfume(null);
  };

  // Callback when FragranceFormDialog saves successfully
  const handleFragranceSaved = (savedPerfume: Perfume, isEdit: boolean) => {
    if (isEdit) {
      setPerfumes((prev) => prev.map((p) => (p && p.id === savedPerfume.id ? savedPerfume : p)));
      showToast(`✓ Updated ${savedPerfume.name} (Price: ${formatPrice(savedPerfume.price)}) in database!`);
    } else {
      setPerfumes((prev) => [savedPerfume, ...prev.filter((p) => p && p.id !== savedPerfume.id)]);
      showToast(`✓ Published ${savedPerfume.name} permanently to PostgreSQL!`);
    }
    resetForm();
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
          <span className="font-medium">{toastMessage}</span>
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
                    <td className="py-3 px-4 text-stone-muted">
                      <div className="flex flex-col gap-0.5">
                        <span className="capitalize text-softwhite font-medium">
                          {CATEGORY_LABELS[item.category] || item.category}
                        </span>
                        {item.fragranceType && (
                          <span className="text-[10px] text-gold uppercase tracking-wider">
                            {FRAGRANCE_TYPE_LABELS[item.fragranceType as FragranceType] || item.fragranceType}
                          </span>
                        )}
                      </div>
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
                  <div className="flex items-center gap-1.5">
                    <span className="capitalize text-stone-muted">
                      {CATEGORY_LABELS[item.category] || item.category}
                    </span>
                    {item.fragranceType && (
                      <span className="text-[10px] text-gold uppercase tracking-wider">
                        • {FRAGRANCE_TYPE_LABELS[item.fragranceType as FragranceType] || item.fragranceType}
                      </span>
                    )}
                  </div>
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

      {/* ADD / EDIT FRAGRANCE MODAL (Mobile-responsive sheet on phones, max-h-[90dvh] dialog on desktop) */}
      <FragranceFormDialog
        isOpen={showAddModal || editingPerfume !== null}
        editingPerfume={editingPerfume}
        onClose={resetForm}
        onSaved={handleFragranceSaved}
      />

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
