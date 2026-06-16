import { ShoppingBag, FlaskConical } from "lucide-react";
import { useProfile } from "@/hooks/useProfile";
import { MobileShell } from "@/components/MobileShell";
import logo from "@/assets/logo.png";

const KEY = "soskin_type_chosen";

export function hasChosenType() {
  if (typeof window === "undefined") return true;
  return localStorage.getItem(KEY) === "1";
}

interface Props {
  onDone: () => void;
}

/**
 * SelectionGateway — Step 1 of the Value-First flow.
 * Minimalist icon-based picker: Shopper vs Expert.
 * Persists choice in localStorage (one-time gate).
 */
export function SelectionGateway({ onDone }: Props) {
  const { profile, update } = useProfile();
  const ar = profile.lang === "ar";

  const choose = (role: "customer" | "expert") => {
    update({ role });
    localStorage.setItem(KEY, "1");
    onDone();
  };

  return (
    <MobileShell>
      <div className="min-h-[85vh] flex flex-col items-center justify-center text-center animate-float-up">
        <img
          src={logo}
          alt="S.o.Skin"
          width={88}
          height={88}
          className="w-20 h-20 object-contain drop-shadow-[0_4px_24px_rgba(212,175,55,0.4)]"
        />
        <p className="text-[10px] tracking-[0.32em] uppercase text-primary/80 mt-4 font-semibold">
          {ar ? "اختر تجربتك" : "Choose your experience"}
        </p>
        <h1 className="text-2xl font-bold tracking-tight mt-2 text-gradient">
          {ar ? "أنت مين؟" : "Who are you?"}
        </h1>

        <div className="grid grid-cols-2 gap-3 mt-8 w-full max-w-sm">
          <button
            onClick={() => choose("customer")}
            className="group flex flex-col items-center gap-3 p-5 rounded-2xl glass border border-primary/25 hover:border-primary/70 hover:shadow-glow transition-all"
          >
            <div className="w-14 h-14 rounded-2xl gradient-aurora flex items-center justify-center shadow-glow">
              <ShoppingBag className="w-7 h-7 text-primary-foreground" />
            </div>
            <div>
              <div className="font-bold text-sm">{ar ? "متسوّق" : "Shopper"}</div>
              <div className="text-[10px] text-muted-foreground mt-1 leading-snug">
                {ar ? "أرخص سعر من الصيدليات" : "Best pharmacy prices"}
              </div>
            </div>
          </button>

          <button
            onClick={() => choose("expert")}
            className="group flex flex-col items-center gap-3 p-5 rounded-2xl glass border border-primary/25 hover:border-primary/70 hover:shadow-glow transition-all"
          >
            <div className="w-14 h-14 rounded-2xl gradient-aurora flex items-center justify-center shadow-glow">
              <FlaskConical className="w-7 h-7 text-primary-foreground" />
            </div>
            <div>
              <div className="font-bold text-sm">{ar ? "خبير" : "Expert"}</div>
              <div className="text-[10px] text-muted-foreground mt-1 leading-snug">
                {ar ? "تحليل مكونات عميق" : "Deep ingredient analysis"}
              </div>
            </div>
          </button>
        </div>

        <p className="text-[11px] text-muted-foreground mt-6 max-w-xs leading-relaxed">
          {ar
            ? "تقدر تغير اختيارك من الإعدادات في أي وقت."
            : "You can change this any time in settings."}
        </p>
      </div>
    </MobileShell>
  );
}
