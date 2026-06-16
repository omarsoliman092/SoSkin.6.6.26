import { createContext, useContext, useEffect, useState, useCallback, type ReactNode } from "react";
import { supabase } from "@/integrations/supabase/client";
import { DEFAULT_PROFILE, loadProfile, saveProfile, type UserProfile } from "@/lib/profile";
import { useAuth } from "@/hooks/useAuth";

interface Ctx {
  profile: UserProfile;
  setProfile: (p: UserProfile) => void;
  update: (patch: Partial<UserProfile>) => void;
  ready: boolean;
  syncStatus: "idle" | "syncing" | "error";
}

const ProfileCtx = createContext<Ctx | null>(null);

export function ProfileProvider({ children }: { children: ReactNode }) {
  const { user, isAuthenticated } = useAuth();
  const [profile, setProfileState] = useState<UserProfile>(DEFAULT_PROFILE);
  const [ready, setReady] = useState(false);
  const [syncStatus, setSyncStatus] = useState<"idle" | "syncing" | "error">("idle");

  // Load initial profile (localStorage first, then cloud if authenticated)
  useEffect(() => {
    const local = loadProfile();
    setProfileState(local);
    setReady(true);
  }, []);

  // Sync with database when auth state changes
  useEffect(() => {
    if (!isAuthenticated || !user) return;

    let cancelled = false;
    setSyncStatus("syncing");

    (async () => {
      try {
        const { data, error } = await supabase
          .from("profiles")
          .select("*")
          .eq("user_id", user.id)
          .single();

        if (cancelled) return;

        if (error) {
          console.error("Profile fetch error:", error);
          setSyncStatus("error");
          return;
        }

        if (data) {
          const rawRole = (data.role as string) || "customer";
          const normalizedRole: UserProfile["role"] = rawRole === "advisor" ? "expert" : (rawRole as UserProfile["role"]);
          const d = data as typeof data & {
            hair_porosity?: string;
            hair_concerns?: string[];
            last_skin_id_refresh?: string | null;
          };
          const cloudProfile: UserProfile = {
            name: data.name ?? "",
            role: normalizedRole,
            lang: (data.lang as UserProfile["lang"]) || "en",
            gender: (data.gender as UserProfile["gender"]) || "female",
            recommendFor: (data.recommend_for as UserProfile["gender"]) || "female",
            skinType: data.skin_type ?? "",
            combinationZone: (data.combination_zone as UserProfile["combinationZone"]) || "",
            concerns: data.concerns ?? [],
            budget: data.budget ?? "",
            preference: (data.preference as UserProfile["preference"]) || "both",
            allergies: data.allergies ?? "",
            pregnant: data.pregnant ?? false,
            favoriteBrands: data.favorite_brands ?? "",
            answerStyle: (data.answer_style as UserProfile["answerStyle"]) || "quick",
            hairPorosity: (d.hair_porosity as UserProfile["hairPorosity"]) || "",
            hairConcerns: d.hair_concerns ?? [],
            lastSkinIdRefresh: d.last_skin_id_refresh ?? undefined,
            onboarded: data.onboarded ?? false,
            hiddenTools: [],
            roastMode: "roast",
          };


          // If local profile is more complete (onboarded=true, cloud isn't), push local to cloud
          // Otherwise, use cloud profile
          const local = loadProfile();
          if (local.onboarded && !cloudProfile.onboarded) {
            setProfileState(local);
            await pushProfileToCloud(user.id, local);
          } else {
            setProfileState(cloudProfile);
            saveProfile(cloudProfile);
          }
          setSyncStatus("idle");
        }
      } catch (e) {
        if (!cancelled) setSyncStatus("error");
      }
    })();

    return () => { cancelled = true; };
  }, [isAuthenticated, user]);

  // Push profile changes to cloud
  const pushProfileToCloud = useCallback(async (userId: string, p: UserProfile) => {
    try {
      const { error } = await supabase
        .from("profiles")
        .upsert({
          user_id: userId,
          name: p.name,
          role: p.role,
          lang: p.lang,
          gender: p.gender,
          recommend_for: p.recommendFor,
          skin_type: p.skinType,
          combination_zone: p.combinationZone,
          concerns: p.concerns,
          budget: p.budget,
          preference: p.preference,
          allergies: p.allergies,
          pregnant: p.pregnant,
          favorite_brands: p.favoriteBrands,
          answer_style: p.answerStyle,
          hair_porosity: p.hairPorosity,
          hair_concerns: p.hairConcerns,
          last_skin_id_refresh: p.lastSkinIdRefresh ?? null,
          onboarded: p.onboarded,
        } as any, { onConflict: "user_id" });

      if (error) console.error("Profile sync error:", error);
    } catch (e) {
      console.error("Profile sync error:", e);
    }
  }, []);

  const setProfile = useCallback((p: UserProfile) => {
    setProfileState(p);
    saveProfile(p);
    if (isAuthenticated && user) {
      pushProfileToCloud(user.id, p);
    }
  }, [isAuthenticated, user, pushProfileToCloud]);

  const update = useCallback((patch: Partial<UserProfile>) => {
    setProfileState((prev) => {
      const next = { ...prev, ...patch };
      saveProfile(next);
      if (isAuthenticated && user) {
        pushProfileToCloud(user.id, next);
      }
      return next;
    });
  }, [isAuthenticated, user, pushProfileToCloud]);

  useEffect(() => {
    if (!ready) return;
    document.documentElement.dir = profile.lang === "ar" ? "rtl" : "ltr";
    document.documentElement.lang = profile.lang;
    document.documentElement.dataset.gender = profile.gender || "female";
  }, [profile.lang, profile.gender, ready]);

  return (
    <ProfileCtx.Provider value={{ profile, setProfile, update, ready, syncStatus }}>
      {children}
    </ProfileCtx.Provider>
  );
}

export function useProfile() {
  const ctx = useContext(ProfileCtx);
  if (!ctx) throw new Error("useProfile must be inside ProfileProvider");
  return ctx;
}
