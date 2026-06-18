// Independent Auth Handler (Replaces Lovable Cloud Auth)
import { supabase } from "../supabase/client";

type SignInOptions = {
  redirect_uri?: string;
  extraParams?: Record<string, string>;
};

export const lovable = {
  auth: {
    signInWithOAuth: async (provider: "google" | "apple" | "microsoft" | "lovable", opts?: SignInOptions) => {
      // Direct Supabase OAuth (Gain 100% independence)
      const { data, error } = await supabase.auth.signInWithOAuth({
        provider: provider === "lovable" ? "google" : provider as any,
        options: {
          redirectTo: opts?.redirect_uri || window.location.origin,
          queryParams: opts?.extraParams,
        },
      });

      if (error) return { error };
      return { redirected: true, data };
    },
  },
};
