import React, { useEffect, useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Heart, Star, ListChecks } from "lucide-react";

interface GameHeaderProps {
  lives: number;
  maxLives: number;
  score: number;
  answersRemaining: number;
}

export const GameHeader: React.FC<GameHeaderProps> = ({
  lives,
  maxLives,
  score,
  answersRemaining,
}) => {
  const [animateScore, setAnimateScore] = useState(false);

  useEffect(() => {
    setAnimateScore(true);
    const timer = setTimeout(() => setAnimateScore(false), 500);
    return () => clearTimeout(timer);
  }, [score]);

  const livesPercentage = Math.round((lives / maxLives) * 100);
  const liveColorClass =
    livesPercentage > 50
      ? "text-red-500"
      : livesPercentage > 25
        ? "text-yellow-500"
        : "text-slate-500";

  return (
    <div className="mb-6">
      <div className="flex justify-between items-center mb-4 bg-white/80 backdrop-blur rounded-2xl p-4 shadow-sm border border-indigo-100">
        <div className="flex flex-col leading-none transform -rotate-3 select-none hover:scale-105 transition-transform duration-300 animate-sway">
          <span className="text-sm font-black text-slate-400 tracking-widest uppercase ml-1 drop-shadow-sm">
            FIND THE
          </span>
          <h1 className="text-3xl md:text-4xl font-black text-transparent bg-clip-text bg-gradient-to-br from-indigo-600 to-purple-700 drop-shadow-md tracking-tighter">
            MATCH
          </h1>
        </div>
        <style>{`
                  @keyframes sway {
                    0%, 100% { transform: rotate(-3deg) translateY(0); }
                    50% { transform: rotate(-1deg) translateY(-2px); }
                  }
                  .animate-sway {
                    animation: sway 3s ease-in-out infinite;
                  }
                `}</style>

        <div
          className={`transition-transform duration-300 ${animateScore ? "scale-125" : "scale-100"}`}
        >
          <Badge
            variant="secondary"
            className="px-3 py-1 bg-yellow-100 text-yellow-700 border-yellow-200 text-lg font-bold shadow-sm gap-2"
          >
            <Star className="w-5 h-5 fill-yellow-400 text-yellow-500" />
            {score}
          </Badge>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        {/* Lives Card */}
        <div className="bg-white/80 backdrop-blur rounded-xl p-3 flex items-center justify-between border border-red-100 shadow-sm">
          <div className="flex items-center gap-2">
            <div className="p-2 bg-red-100 rounded-lg">
              <Heart className={`w-5 h-5 ${liveColorClass} fill-current`} />
            </div>
            <span className="text-sm font-bold text-slate-600 uppercase tracking-tighter">
              Lives
            </span>
          </div>
          <span className="text-xl font-black text-slate-800">
            {lives} / {maxLives}
          </span>
        </div>

        {/* Remaining Card */}
        <div className="bg-white/80 backdrop-blur rounded-xl p-3 flex items-center justify-between border border-blue-100 shadow-sm">
          <div className="flex items-center gap-2">
            <div className="p-2 bg-blue-100 rounded-lg">
              <ListChecks className="w-5 h-5 text-blue-600" />
            </div>
            <span className="text-sm font-bold text-slate-600 uppercase tracking-tighter">
              Left
            </span>
          </div>
          <span className="text-xl font-black text-slate-800">
            {answersRemaining}
          </span>
        </div>
      </div>
    </div>
  );
};
