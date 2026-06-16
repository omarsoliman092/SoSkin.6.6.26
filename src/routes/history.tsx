import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { MobileShell } from "@/components/MobileShell";
import { BottomNav } from "@/components/BottomNav";
import { useProfile } from "@/hooks/useProfile";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { Clock, Trash2, ScanLine, Loader2 } from "lucide-react";
import { toast } from "sonner";

export const Route = createFileRoute("/history")({ component: HistoryPage });

interface Scan {
  id: string;
  product_name: string;
  result_summary: string;
  created_at: string;
}

function HistoryPage() {
  const { profile } = useProfile();
  const { isAuthenticated, isLoading } = useAuth();
  const ar = profile.lang === "ar";
  const [scans, setScans] = useState<Scan[] | null>(null);

  useEffect(() => {
    if (isLoading || !isAuthenticated) return;
    supabase
      .from("scans")
      .select("id, product_name, result_summary, created_at")
      .order("created_at", { ascending: false })
      .limit(50)
      .then(({ data, error }) => {
        if (error) {
          toast.error(error.message);
          setScans([]);
        } else setScans((data as Scan[]) || []);
      });
  }, [isAuthenticated, isLoading]);

  const remove = async (id: string) => {
    const { error } = await supabase.from("scans").delete().eq("id", id);
    if (error) return toast.error(error.message);
    setScans((s) => (s ? s.filter((x) => x.id !== id) : s));
  };

  return (
    <>
      <MobileShell>
        <h1 className="text-2xl font-bold mb-1">{ar ? "السجل" : "History"}</h1>
        <p className="text-sm text-muted-foreground mb-5">
          {ar ? "كل الفحوصات السابقة بتاعتك" : "All your previous scans"}
        </p>

        {!isAuthenticated && !isLoading && (
          <div className="p-6 rounded-2xl gradient-card border border-border text-center">
            <div className="text-sm mb-3">{ar ? "سجّل دخول لعرض السجل" : "Sign in to view your history"}</div>
            <Link to="/login" className="inline-block px-4 py-2 rounded-xl gradient-primary text-primary-foreground text-sm font-medium">
              {ar ? "تسجيل الدخول" : "Sign in"}
            </Link>
          </div>
        )}

        {isAuthenticated && scans === null && (
          <div className="flex justify-center py-10">
            <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
          </div>
        )}

        {isAuthenticated && scans?.length === 0 && (
          <div className="text-center py-10 rounded-2xl border border-dashed border-border">
            <ScanLine className="w-10 h-10 mx-auto text-muted-foreground mb-2" />
            <div className="text-sm text-muted-foreground mb-3">{ar ? "لا توجد فحوصات بعد" : "No scans yet"}</div>
            <Link to="/scan" className="inline-block px-4 py-2 rounded-xl gradient-primary text-primary-foreground text-sm">
              {ar ? "ابدأ فحص" : "Start scanning"}
            </Link>
          </div>
        )}

        <div className="space-y-2">
          {scans?.map((s) => (
            <div key={s.id} className="p-3 rounded-2xl gradient-card border border-border">
              <div className="flex items-start justify-between gap-2">
                <div className="flex-1 min-w-0">
                  <div className="font-semibold text-sm truncate">{s.product_name || (ar ? "بدون اسم" : "Untitled")}</div>
                  <div className="flex items-center gap-1.5 text-[11px] text-muted-foreground mt-0.5">
                    <Clock className="w-3 h-3" />
                    {new Date(s.created_at).toLocaleString(ar ? "ar-EG" : "en-US")}
                  </div>
                  {s.result_summary && (
                    <div className="text-xs text-muted-foreground mt-2 line-clamp-3">{s.result_summary}</div>
                  )}
                </div>
                <button onClick={() => remove(s.id)} className="text-destructive p-1.5 rounded-lg hover:bg-destructive/10">
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      </MobileShell>
      <BottomNav />
    </>
  );
}
