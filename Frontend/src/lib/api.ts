import { Perfume, PerfumeCategory, PerfumeStatus } from "@/types/perfume";

const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080/api/v1";

export interface PerfumePayload {
  name: string;
  subtitle?: string;
  tagline?: string;
  description: string;
  price: number;
  sizeMl: string;
  category: PerfumeCategory;
  status: PerfumeStatus;
  featured?: boolean;
  notes: {
    top: string[];
    heart: string[];
    base: string[];
  };
  images: string[];
  longevity?: string;
  bestSeason?: string;
}

// Helper to get stored auth token if present
export function getAuthToken(): string | null {
  if (typeof window === "undefined") return null;
  return localStorage.getItem("aura_admin_token");
}

export function setAuthToken(token: string | null) {
  if (typeof window === "undefined") return;
  if (token) {
    localStorage.setItem("aura_admin_token", token);
  } else {
    localStorage.removeItem("aura_admin_token");
  }
}

// 1. Fetch all perfumes
export async function fetchPerfumes(params?: {
  category?: string;
  status?: string;
  search?: string;
}): Promise<Perfume[]> {
  const query = new URLSearchParams();
  if (params?.category && params.category !== "all") query.set("category", params.category);
  if (params?.status && params.status !== "all") query.set("status", params.status);
  if (params?.search) query.set("search", params.search);

  const url = `${API_BASE}/perfumes${query.toString() ? `?${query.toString()}` : ""}`;
  const res = await fetch(url, {
    cache: "no-store",
  });

  if (!res.ok) {
    throw new Error(`Failed to fetch perfumes: ${res.statusText}`);
  }

  const data = await res.json();
  return Array.isArray(data) ? data : [];
}

// 2. Fetch single perfume by slug
export async function fetchPerfumeBySlug(slug: string): Promise<Perfume | null> {
  const res = await fetch(`${API_BASE}/perfumes/${encodeURIComponent(slug)}`, {
    cache: "no-store",
  });

  if (res.status === 404) {
    return null;
  }

  if (!res.ok) {
    throw new Error(`Failed to fetch perfume: ${res.statusText}`);
  }

  return res.json();
}

// 3. Create a new perfume (Admin protected)
export async function createPerfume(payload: PerfumePayload): Promise<Perfume> {
  const token = getAuthToken();
  const res = await fetch(`${API_BASE}/perfumes`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    credentials: "include",
    body: JSON.stringify(payload),
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({ error: res.statusText }));
    throw new Error(err.error || "Failed to create perfume");
  }

  return res.json();
}

// 4. Update an existing perfume (Admin protected)
export async function updatePerfume(id: string, payload: Partial<PerfumePayload>): Promise<Perfume> {
  const token = getAuthToken();
  const res = await fetch(`${API_BASE}/perfumes/${id}`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    credentials: "include",
    body: JSON.stringify(payload),
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({ error: res.statusText }));
    throw new Error(err.error || "Failed to update perfume");
  }

  return res.json();
}

// 5. Delete a perfume (Admin protected)
export async function deletePerfume(id: string): Promise<void> {
  const token = getAuthToken();
  const res = await fetch(`${API_BASE}/perfumes/${id}`, {
    method: "DELETE",
    headers: {
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    credentials: "include",
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({ error: res.statusText }));
    throw new Error(err.error || "Failed to delete perfume");
  }
}

// 6. Update perfume availability status
export async function updatePerfumeStatus(id: string, status: PerfumeStatus): Promise<{ id: string; status: PerfumeStatus }> {
  const token = getAuthToken();
  const res = await fetch(`${API_BASE}/perfumes/${id}/status`, {
    method: "PATCH",
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    credentials: "include",
    body: JSON.stringify({ status }),
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({ error: res.statusText }));
    throw new Error(err.error || "Failed to update status");
  }

  return res.json();
}

// 7. Upload perfume bottle photography
export async function uploadPerfumeImage(file: File): Promise<string> {
  const token = getAuthToken();
  const formData = new FormData();
  formData.append("image", file);

  const res = await fetch(`${API_BASE}/admin/upload`, {
    method: "POST",
    headers: {
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    credentials: "include",
    body: formData,
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({ error: res.statusText }));
    throw new Error(err.error || "Failed to upload image");
  }

  const data = await res.json();
  return data.url;
}

// 8. Admin Login
export async function loginAdmin(email: string, password: string): Promise<{ token: string; email: string }> {
  const res = await fetch(`${API_BASE}/admin/login`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    credentials: "include",
    body: JSON.stringify({ email, password }),
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({ error: res.statusText }));
    throw new Error(err.error || "Invalid email or password");
  }

  const data = await res.json();
  if (data.token) {
    setAuthToken(data.token);
  }
  return { token: data.token, email: data.admin?.email || email };
}

// 9. Admin Logout
export async function logoutAdmin(): Promise<void> {
  const token = getAuthToken();
  setAuthToken(null);
  try {
    await fetch(`${API_BASE}/admin/logout`, {
      method: "POST",
      headers: {
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
      credentials: "include",
    });
  } catch {
    // Ignore error on logout
  }
}

// 10. Check Current Admin Session
export async function checkAdminSession(): Promise<{ id: string; email: string } | null> {
  const token = getAuthToken();
  try {
    const res = await fetch(`${API_BASE}/admin/me`, {
      headers: {
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
      credentials: "include",
    });
    if (!res.ok) return null;
    return res.json();
  } catch {
    return null;
  }
}
