// Independent Auth Implementation (Direct Supabase)
import { supabase } from "../supabase/client";

type SignInOptions = {
  redirect_uri?: string;
  extraParams?: Record<string, string>;
};

export const lovable = {
  auth: {
    signInWithOAuth: async (provider: "google" | "apple" | "microsoft" | "lovable", opts?: SignInOptions) => {
      // Use Supabase directly to bypass Lovable Cloud Auth dependency
      const { data, error } = await supabase.auth.signInWithOAuth({
        provider: provider === "lovable" ? "google" : provider,
        options: {
          redirectTo: opts?.redirect_uri || window.location.origin,
          queryParams: opts?.extraParams,
        },
      });

      if (error) return { error };
      return { redirected: !!data.url };
    },
  },
};
