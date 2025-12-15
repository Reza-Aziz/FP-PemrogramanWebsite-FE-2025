import React from "react";
import { CheckCircle2, XCircle, Zap } from "lucide-react";

interface FeedbackProps {
  type: "success" | "error" | "combo";
  message: string;
  visible: boolean;
}

export const Feedback: React.FC<FeedbackProps> = ({
  type,
  message,
  visible,
}) => {
  if (!visible) return null;

  const config = {
    success: {
      bg: "bg-green-500",
      icon: <CheckCircle2 className="w-12 h-12 text-white animate-bounce" />,
      text: "text-white",
    },
    error: {
      bg: "bg-red-500",
      icon: <XCircle className="w-12 h-12 text-white animate-pulse" />,
      text: "text-white",
    },
    combo: {
      bg: "bg-purple-600",
      icon: <Zap className="w-12 h-12 text-yellow-300 animate-spin" />,
      text: "text-yellow-100",
    },
  };

  const current = config[type] || config.success;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center pointer-events-none">
      <div
        className={`
        ${current.bg} 
        px-8 py-6 rounded-3xl shadow-2xl 
        transform transition-all duration-300 animate-in zoom-in fade-in slide-in-from-bottom-10
        flex flex-col items-center gap-2
        border-4 border-white/30 backdrop-blur-md
      `}
      >
        {current.icon}
        <h2
          className={`text-2xl font-black ${current.text} uppercase tracking-wider drop-shadow-md`}
        >
          {message}
        </h2>
      </div>
    </div>
  );
};
