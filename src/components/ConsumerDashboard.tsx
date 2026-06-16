import React from "react";
import { AlertTriangle } from "lucide-react";

interface ConsumerDashboardProps {
  onAction: (featureName: string) => void;
}

export const ConsumerDashboard: React.FC<ConsumerDashboardProps> = ({ onAction }) => {
  return (
    <div className="space-y-4">
      <button
        onClick={() => onAction("sos")}
        className="w-full py-5 bg-gradient-to-b from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 border border-red-500 rounded-2xl flex flex-col items-center justify-center p-4 transition-all relative overflow-hidden group shadow-lg shadow-red-500/30"
      >
        <AlertTriangle className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-white/80 group-hover:scale-110 transition-transform" />
        <span className="text-3xl font-black tracking-widest text-white font-mono animate-pulse">
          SOS
        </span>
        <span className="text-xs font-bold text-white/80 mt-1">إنقاذ فورى لبشرتك</span>
      </button>
    </div>
  );
};
