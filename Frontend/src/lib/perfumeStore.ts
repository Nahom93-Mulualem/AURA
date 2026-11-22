"use client";

import { useState, useEffect } from "react";
import { Perfume, PerfumeStatus } from "@/types/perfume";
import { MOCK_PERFUMES } from "@/data/mockPerfumes";

const STORAGE_KEY = "aura_perfumes_catalog";
const EVENT_NAME = "aura:perfumes_updated";

// Get all perfumes from localStorage or fallback to defaults
export function getStoredPerfumes(): Perfume[] {
  if (typeof window === "undefined") {
    return MOCK_PERFUMES;
  }

  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(MOCK_PERFUMES));
      return MOCK_PERFUMES;
    }
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) && parsed.length > 0 ? parsed : MOCK_PERFUMES;
  } catch (e) {
    console.error("Failed to read perfumes from storage:", e);
    return MOCK_PERFUMES;
  }
}

// Update availability status without touching database manually
export async function updatePerfumeStatusInStore(
  id: string,
  newStatus: PerfumeStatus
): Promise<Perfume[]> {
  const current = getStoredPerfumes();
  const updated = current.map((p) => {
    if (p.id === id) {
      return { ...p, status: newStatus };
    }
    return p;
  });

  if (typeof window !== "undefined") {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
      window.dispatchEvent(new CustomEvent(EVENT_NAME, { detail: updated }));
    } catch (e) {
      console.error("Failed to persist updated perfume status:", e);
    }
  }

  // Attempt to sync with Go backend if running
  try {
    const token = typeof window !== "undefined" ? localStorage.getItem("aura_admin_token") : null;
    await fetch(`http://localhost:8080/api/v1/perfumes/${id}/status`, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
      body: JSON.stringify({ status: newStatus }),
    });
  } catch {
    // Graceful fallback to client persistence
  }

  return updated;
}

// Add a newly created fragrance to the store
export function addPerfumeToStore(newPerfume: Perfume): Perfume[] {
  const current = getStoredPerfumes();
  const updated = [newPerfume, ...current];

  if (typeof window !== "undefined") {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
      window.dispatchEvent(new CustomEvent(EVENT_NAME, { detail: updated }));
    } catch (e) {
      console.error("Failed to add perfume to storage:", e);
    }
  }

  return updated;
}

// Custom React hook to subscribe to real-time perfume updates across any component
export function usePerfumesCatalog(initialData: Perfume[] = MOCK_PERFUMES) {
  const [perfumes, setPerfumes] = useState<Perfume[]>(initialData);

  useEffect(() => {
    setPerfumes(getStoredPerfumes());

    const handleUpdate = (e: Event) => {
      const customEvent = e as CustomEvent<Perfume[]>;
      setPerfumes(customEvent.detail || getStoredPerfumes());
    };

    window.addEventListener(EVENT_NAME, handleUpdate);
    return () => window.removeEventListener(EVENT_NAME, handleUpdate);
  }, []);

  return perfumes;
}
