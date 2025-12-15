import React, { useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Trophy, Home, RotateCcw, Frown } from "lucide-react";
import confetti from "canvas-confetti";

interface GameOverScreenProps {
  score: number;
  totalQuestions: number;
  isWin: boolean;
  onRestart: () => void;
  onBackToHome: () => void;
}

export const GameOverScreen: React.FC<GameOverScreenProps> = ({
  score,
  totalQuestions,
  isWin,
  onRestart,
  onBackToHome,
}) => {
  const percentage =
    totalQuestions > 0 ? Math.round((score / totalQuestions) * 100) : 0;

  useEffect(() => {
    if (isWin) {
      // Fire confetti from side
      const end = Date.now() + 1000;
      const colors = ["#bb0000", "#ffffff"];

      (function frame() {
        confetti({
          particleCount: 2,
          angle: 60,
          spread: 55,
          origin: { x: 0 },
          colors: colors,
        });
        confetti({
          particleCount: 2,
          angle: 120,
          spread: 55,
          origin: { x: 1 },
          colors: colors,
        });

        if (Date.now() < end) {
          requestAnimationFrame(frame);
        }
      })();
    }
  }, [isWin]);

  return (
    <Card className="mx-auto max-w-md animate-in zoom-in duration-500 border-none shadow-2xl overflow-hidden bg-white/95 backdrop-blur">
      <div className={`h-3 w-full ${isWin ? "bg-green-500" : "bg-red-500"}`} />

      <CardHeader className="text-center pt-8 pb-2">
        <div className="mx-auto mb-4 w-20 h-20 rounded-full flex items-center justify-center bg-slate-100 shadow-inner">
          {isWin ? (
            <Trophy className="w-10 h-10 text-yellow-500 animate-bounce" />
          ) : (
            <Frown className="w-10 h-10 text-red-500 animate-pulse" />
          )}
        </div>

        <CardTitle
          className={`text-4xl font-black uppercase tracking-tight ${isWin ? "text-green-600" : "text-red-600"}`}
        >
          {isWin ? "Victory!" : "Game Over"}
        </CardTitle>
        <p className="text-slate-500 font-medium">
          {isWin ? "You are a master matcher!" : "Don't give up, try again!"}
        </p>
      </CardHeader>

      <CardContent className="space-y-8 px-8 pb-8">
        <div className="bg-slate-50 rounded-2xl p-6 border border-slate-100 flex flex-col items-center gap-1">
          <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">
            Final Score
          </p>
          <div className="flex items-baseline gap-1">
            <span className="text-5xl font-black text-slate-800">{score}</span>
            <span className="text-lg font-bold text-slate-400">
              / {totalQuestions}
            </span>
          </div>
          <div
            className={`text-sm font-bold px-3 py-1 rounded-full mt-2 ${isWin ? "bg-green-100 text-green-700" : "bg-orange-100 text-orange-700"}`}
          >
            {percentage}% Accuracy
          </div>
        </div>

        <div className="space-y-3">
          <Button
            onClick={onRestart}
            className="w-full text-lg h-14 font-bold shadow-lg shadow-indigo-200 hover:shadow-xl transition-all hover:-translate-y-1"
          >
            <RotateCcw className="mr-2 w-5 h-5" /> Play Again
          </Button>
          <Button
            onClick={onBackToHome}
            variant="outline"
            className="w-full text-lg h-14 font-semibold border-2 hover:bg-slate-50"
          >
            <Home className="mr-2 w-5 h-5" /> Back to Home
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};
