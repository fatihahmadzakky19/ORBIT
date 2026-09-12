"use client";

import { useState, useEffect } from "react";

export interface UserProfile {
  name: string;
  email: string;
  timezone?: string;
  avatarUrl?: string;
}

export const DEFAULT_PROFILE: UserProfile = {
  name: "Fatih Ahmad Zakky",
  email: "fatihahmadzakky19@gmail.com",
  timezone: "Asia/Jakarta",
  avatarUrl: "/avatar.jpg",
};

export const PROFILE_STORAGE_KEY = "orbit_profile";
export const PROFILE_UPDATED_EVENT = "orbit_profile_updated";

export function getStoredProfile(): UserProfile {
  if (typeof window === "undefined") return DEFAULT_PROFILE;
  try {
    const raw = localStorage.getItem(PROFILE_STORAGE_KEY);
    if (!raw) {
      localStorage.setItem(PROFILE_STORAGE_KEY, JSON.stringify(DEFAULT_PROFILE));
      return DEFAULT_PROFILE;
    }
    const parsed = JSON.parse(raw);
    return {
      name: parsed.name?.trim() || DEFAULT_PROFILE.name,
      email: parsed.email?.trim() || DEFAULT_PROFILE.email,
      timezone: parsed.timezone || DEFAULT_PROFILE.timezone,
      avatarUrl: parsed.avatarUrl || "/avatar.jpg",
    };
  } catch {
    return DEFAULT_PROFILE;
  }
}

export function saveStoredProfile(profile: Partial<UserProfile>): UserProfile {
  if (typeof window === "undefined") return DEFAULT_PROFILE;
  try {
    const current = getStoredProfile();
    const updated: UserProfile = {
      ...current,
      ...profile,
      name: profile.name !== undefined ? profile.name.trim() : current.name,
      email: profile.email !== undefined ? profile.email.trim() : current.email,
      avatarUrl: profile.avatarUrl !== undefined ? profile.avatarUrl : current.avatarUrl,
    };
    localStorage.setItem(PROFILE_STORAGE_KEY, JSON.stringify(updated));
    window.dispatchEvent(new CustomEvent(PROFILE_UPDATED_EVENT, { detail: updated }));
    return updated;
  } catch {
    return DEFAULT_PROFILE;
  }
}

/**
 * Resizes and compresses an uploaded avatar image using an offscreen canvas
 * to max 300x300 for optimal performance and avoiding localStorage quota overflow.
 */
export function resizeAvatarImage(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    if (!file.type.startsWith("image/")) {
      reject(new Error("File harus berupa gambar (JPEG, PNG, WEBP, dll.)"));
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement("canvas");
        const MAX_SIZE = 300;
        let width = img.width;
        let height = img.height;

        // Crop to square center
        const minDimension = Math.min(width, height);
        const startX = (width - minDimension) / 2;
        const startY = (height - minDimension) / 2;

        canvas.width = MAX_SIZE;
        canvas.height = MAX_SIZE;

        const ctx = canvas.getContext("2d");
        if (!ctx) {
          resolve(event.target?.result as string);
          return;
        }

        ctx.drawImage(
          img,
          startX,
          startY,
          minDimension,
          minDimension,
          0,
          0,
          MAX_SIZE,
          MAX_SIZE
        );

        // Convert to WebP or JPEG
        const dataUrl = canvas.toDataURL("image/jpeg", 0.85);
        resolve(dataUrl);
      };
      img.onerror = () => reject(new Error("Gagal membaca gambar"));
      img.src = event.target?.result as string;
    };
    reader.onerror = () => reject(new Error("Gagal memuat berkas"));
    reader.readAsDataURL(file);
  });
}

export function useProfile() {
  const [profile, setProfile] = useState<UserProfile>(DEFAULT_PROFILE);
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    setProfile(getStoredProfile());
    setIsLoaded(true);

    const handleUpdate = (e: Event) => {
      const customEvent = e as CustomEvent<UserProfile>;
      if (customEvent.detail) {
        setProfile(customEvent.detail);
      } else {
        setProfile(getStoredProfile());
      }
    };

    window.addEventListener(PROFILE_UPDATED_EVENT, handleUpdate);
    window.addEventListener("storage", handleUpdate);
    return () => {
      window.removeEventListener(PROFILE_UPDATED_EVENT, handleUpdate);
      window.removeEventListener("storage", handleUpdate);
    };
  }, []);

  const updateProfile = (newProfile: Partial<UserProfile>) => {
    const saved = saveStoredProfile(newProfile);
    setProfile(saved);
    return saved;
  };

  return { profile, updateProfile, isLoaded };
}
