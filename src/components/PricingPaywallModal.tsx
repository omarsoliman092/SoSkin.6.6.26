import React from "react";
import { Shield, Check, X, Smartphone, MessageCircle, Copy } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { toast } from "sonner";

interface PaywallProps {
  isOpen: boolean;
  onClose: () => void;
  isExpertModel: boolean;
}

const INSTAPAY_NUMBER = "01141519948";
const WHATSAPP_NUMBER = "201141519948";

export const PricingPaywallModal: React.FC<PaywallProps> = ({
  isOpen,
  onClose,
  isExpertModel,
}) => {
  const { user } = useAuth();
  if (!isOpen) return null;

  const userEmail = user?.email ?? "(no email)";

  const planDetails = isExpertModel
    ? {
        title: "SOSKIN EXPERT PRO",
        badge: "عرض الإطلاق للاحتراف",
        features: [
          "مساعد البيع اللحظي الذكي (AI Copilot)",
          "مهندس البدائل الفوري للنواقص (Dupe Finder)",
          "تنبيهات إعادة الشراء الأوتوماتيكية عبر الواتساب",
          "محلل تريندات السوشيال ميديا اليومي",
        ],
      }
    : {
        title: "SOSKIN CONSUMER PRO",
        badge: "عرض الإطلاق المميز",
        features: [
          "فحص وتحليل المنتجات بدون حد أقصى",
          "بروتوكول الإنقاذ السريع SOS",
          "تحليل الذكاء الاصطناعي لتطور البشرة",
          "كاشف تعارضات المكونات الفوري",
        ],
      };

  const handleWhatsApp = () => {
    const msg =
      `مرحباً SOSKIN Admin،\n` +
      `لقد قمت بتحويل مبلغ 200 جنيه عبر إنستا باي لتفعيل حسابي البرو.\n\n` +
      `📧 البريد المسجل: ${userEmail}\n` +
      `🏷️ نوع الاشتراك: ${isExpertModel ? "Expert Pro" : "Consumer Pro"}\n` +
      `💳 وسيلة الدفع: InstaPay → ${INSTAPAY_NUMBER}\n\n` +
      `مرفق لقطة شاشة التحويل.`;
    const url = `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(msg)}`;
    window.open(url, "_blank", "noopener,noreferrer");
  };

  const copyInstaPay = async () => {
    try {
      await navigator.clipboard.writeText(INSTAPAY_NUMBER);
      toast.success("تم نسخ الرقم");
    } catch {
      toast.error("فشل النسخ");
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md p-4 animate-fade-in">
      <div className="relative w-full max-w-md max-h-[92vh] overflow-y-auto rounded-2xl border border-primary/30 bg-foreground p-6 text-center shadow-2xl">
        <div className="absolute -top-12 -left-12 h-40 w-40 rounded-full bg-primary/10 blur-3xl pointer-events-none" />

        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-muted-foreground hover:text-foreground transition-colors z-10"
        >
          <X size={20} />
        </button>

        <div className="relative">
          <div className="mx-auto mb-2 inline-block rounded-full bg-primary/10 px-3 py-1 text-[10px] font-bold tracking-wider text-primary uppercase">
            {planDetails.badge}
          </div>
          <h3 className="font-serif text-2xl font-bold tracking-wide text-background mb-1">
            {planDetails.title}
          </h3>
          <p className="text-xs text-muted-foreground tracking-widest uppercase mb-5">
            انتهت فترتك التجريبية (14 يوم) — فعّل النسخة الكاملة
          </p>

          <div className="bg-card border border-border rounded-xl p-4 mb-5">
            <div className="flex justify-center items-baseline gap-2">
              <span className="text-5xl font-bold text-background tracking-tight">200 ج.م</span>
              <span className="text-muted-foreground text-sm">/ مرة واحدة</span>
            </div>
            <div className="text-xs text-primary mt-2 font-medium">
              اشتراك موحّد ومدى الحياة للنسخة الحالية
            </div>
          </div>

          <div className="text-right space-y-2.5 mb-5 max-w-[95%] mx-auto">
            {planDetails.features.map((feature, idx) => (
              <div
                key={idx}
                className="flex items-start justify-end gap-3 text-sm text-muted-foreground"
              >
                <span>{feature}</span>
                <div className="mt-0.5 rounded-full bg-primary/20 p-0.5 text-primary shrink-0">
                  <Check size={14} />
                </div>
              </div>
            ))}
          </div>

          {/* InstaPay instructions */}
          <div className="bg-primary/5 border border-primary/30 rounded-xl p-4 mb-4 text-right">
            <div className="flex items-center justify-end gap-2 mb-2 text-primary font-semibold text-sm">
              <span>تعليمات الدفع</span>
              <Smartphone size={16} />
            </div>
            <p className="text-xs text-muted-foreground leading-relaxed mb-3">
              يرجى تحويل المبلغ عبر InstaPay إلى الرقم التالى ثم إرسال لقطة شاشة التحويل عبر واتساب لتفعيل اشتراكك يدوياً.
            </p>
            <button
              onClick={copyInstaPay}
              className="w-full flex items-center justify-between bg-background/40 border border-primary/30 rounded-lg px-3 py-2.5 hover:bg-background/60 transition-colors"
            >
              <Copy size={14} className="text-primary" />
              <div className="text-right flex-1 mr-2">
                <div className="text-[10px] text-muted-foreground uppercase tracking-wider">رقم InstaPay</div>
                <div className="text-background font-mono font-bold tracking-wider text-base ltr-text">
                  {INSTAPAY_NUMBER}
                </div>
              </div>
            </button>
          </div>

          {/* WhatsApp CTA */}
          <button
            onClick={handleWhatsApp}
            className="w-full flex items-center justify-center gap-2 rounded-xl gradient-primary py-3.5 font-semibold text-primary-foreground hover:opacity-90 transition-opacity shadow-lg shadow-primary/20 mb-3"
          >
            <MessageCircle size={18} />
            إرسال لقطة شاشة التحويل عبر واتساب
          </button>

          <p className="text-center text-xs text-muted-foreground flex items-center justify-center gap-1">
            <Shield size={12} />
            تفعيل يدوى خلال دقائق • وصول مدى الحياة
          </p>
        </div>
      </div>
    </div>
  );
};
