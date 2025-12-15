import React, { useState, useEffect, useCallback } from "react";
import { useParams } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { GameHeader } from "./components/GameHeader";
import { GameOverScreen } from "./components/GameOverScreen";
import { Feedback } from "./components/Feedback";
import { useGameState } from "./hooks/useGameState";
import { findTheMatchService } from "./services/findTheMatch";
import { shuffleArray } from "./utils";
import type { Game } from "./types";
import confetti from "canvas-confetti";
import { Loader2, Volume2, VolumeX } from "lucide-react";

interface AnswerOption {
  id: string;
  text: string;
  matchedQuestionId: string | null;
}

const PlayFindTheMatch: React.FC = () => {
  const { id: gameId } = useParams<{ id: string }>();

  const [game, setGame] = useState<Game | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [answers, setAnswers] = useState<AnswerOption[]>([]);
  const [matchedPairs, setMatchedPairs] = useState<Map<string, string>>(
    new Map(),
  );
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [selectedAnswerId, setSelectedAnswerId] = useState<string | null>(null);

  // Animation States
  const [slideDirection, setSlideDirection] = useState<"in" | "out">("in");
  const [shake, setShake] = useState(false);

  // Feedback state "Heboh"
  const [feedback, setFeedback] = useState<{
    type: "success" | "error" | "combo";
    message: string;
    visible: boolean;
  }>({ type: "success", message: "", visible: false });

  const [isSoundEnabled, setIsSoundEnabled] = useState(true);

  const gameState = useGameState();

  // Sound Effects
  const playSound = useCallback(
    (type: "pop" | "error" | "success" | "win") => {
      if (!isSoundEnabled) return;
      const soundFile = type === "win" ? "success" : type; // Map 'win' to success.mp3
      const audio = new Audio(`/sounds/${soundFile}.mp3`);
      audio.play().catch((err) => console.error("Error playing sound:", err));
    },
    [isSoundEnabled],
  );

  // Load game
  const { initialize, setError: setGameStateError } = gameState;

  useEffect(() => {
    const loadGame = async () => {
      try {
        setLoading(true);
        if (!gameId) throw new Error("Game ID is missing.");

        const gameData = await findTheMatchService.getPublicGame(gameId);
        setGame(gameData);

        const items = findTheMatchService.getGameItems(gameData);
        const lives = findTheMatchService.getInitialLives(gameData);

        initialize(items, lives);

        // Shuffle answers
        const shuffledAnswers = shuffleArray(
          items.map((item, index) => ({
            id: `answer-${index}`,
            text: item.answer,
            matchedQuestionId: null,
          })),
        );
        setAnswers(shuffledAnswers);
        setCurrentQuestionIndex(0);
      } catch (err) {
        const errorMessage =
          err instanceof Error ? err.message : "Failed to load game";
        setError(errorMessage);
        setGameStateError(errorMessage);
      } finally {
        setTimeout(() => setLoading(false), 2000); // Artificial delay to show splash screen
      }
    };

    loadGame();
  }, [gameId, initialize, setGameStateError]);

  // Question Changing Logic with Animation
  const changeQuestion = async (nextIndex: number) => {
    setSlideDirection("out");
    // Wait for slide out animation
    await new Promise((r) => setTimeout(r, 300));

    setCurrentQuestionIndex(nextIndex);
    setSlideDirection("in");
  };

  const handleAnswerSelect = async (answerId: string) => {
    if (
      gameState.state.isGameOver ||
      !game ||
      feedback.visible ||
      slideDirection === "out"
    )
      return;

    const selectedAnswer = answers.find((a) => a.id === answerId);
    if (!selectedAnswer || selectedAnswer.matchedQuestionId) return;

    setSelectedAnswerId(answerId);

    const currentQuestion = gameState.state.items[currentQuestionIndex];
    if (!currentQuestion) return;

    try {
      const result = await findTheMatchService.checkAnswer(
        game.id,
        currentQuestion.question,
        selectedAnswer.text,
        answers.filter((a) => !a.matchedQuestionId).map((a) => a.text),
        gameState.state.lives,
      );
      const isCorrect = result.is_correct;

      if (isCorrect) {
        // --- CORRECT ANSWER ---
        playSound("success");

        confetti({
          particleCount: 50,
          spread: 60,
          origin: { y: 0.7 },
          colors: ["#facc15", "#fcd34d", "#fbbf24"], // Yellow/Gold confetti
        });

        setFeedback({
          type: "success",
          message: "✨ MATCHED! ✨",
          visible: true,
        });

        const newMatches = new Map(matchedPairs);
        newMatches.set(`question-${currentQuestionIndex}`, answerId);
        setMatchedPairs(newMatches);

        setAnswers((prev) =>
          prev.map((a) =>
            a.id === answerId
              ? { ...a, matchedQuestionId: `question-${currentQuestionIndex}` }
              : a,
          ),
        );

        gameState.handleCorrectAnswer(selectedAnswer.text);

        setTimeout(() => {
          setFeedback((prev) => ({ ...prev, visible: false }));
          setSelectedAnswerId(null);

          if (newMatches.size === gameState.state.items.length) {
            // WIN GAME
            gameState.state.isGameOver = true;
            playSound("win");
            const duration = 3000;
            const animationEnd = Date.now() + duration;
            const randomInRange = (min: number, max: number) =>
              Math.random() * (max - min) + min;

            const interval = setInterval(function () {
              const timeLeft = animationEnd - Date.now();
              if (timeLeft <= 0) return clearInterval(interval);
              const particleCount = 50 * (timeLeft / duration);
              confetti({
                startVelocity: 30,
                spread: 360,
                ticks: 60,
                zIndex: 0,
                particleCount,
                origin: { x: randomInRange(0.1, 0.3), y: Math.random() - 0.2 },
              });
              confetti({
                startVelocity: 30,
                spread: 360,
                ticks: 60,
                zIndex: 0,
                particleCount,
                origin: { x: randomInRange(0.7, 0.9), y: Math.random() - 0.2 },
              });
            }, 250);
          } else {
            // NEXT QUESTION
            // Calculate next safe index (wrapping around if needed, skipping matched)
            let nextIndex = currentQuestionIndex + 1;
            while (
              newMatches.has(`question-${nextIndex}`) &&
              nextIndex < gameState.state.items.length
            ) {
              nextIndex++;
            }
            if (nextIndex >= gameState.state.items.length) {
              nextIndex = 0;
              let loopCount = 0;
              while (
                newMatches.has(`question-${nextIndex}`) &&
                loopCount < gameState.state.items.length
              ) {
                nextIndex++;
                loopCount++;
              }
            }

            changeQuestion(nextIndex);
          }
        }, 1200);
      } else {
        // --- WRONG ANSWER ---
        playSound("error");
        setShake(true);
        setTimeout(() => setShake(false), 500);

        setFeedback({
          type: "error",
          message: "🚀 WRONG! SKIPPING... 🚀",
          visible: true,
        });

        const newLives = gameState.state.lives - 1;
        gameState.handleIncorrectAnswer(); // This updates internal state reducer

        setTimeout(async () => {
          setFeedback((prev) => ({ ...prev, visible: false }));
          setSelectedAnswerId(null);

          if (newLives <= 0) {
            gameState.state.isGameOver = true;
          } else {
            // CHANGE QUESTION ON ERROR (Skip current)
            let nextIndex = currentQuestionIndex + 1;
            if (nextIndex >= gameState.state.items.length) nextIndex = 0;

            let attempt = 0;
            while (
              matchedPairs.has(`question-${nextIndex}`) &&
              attempt < gameState.state.items.length
            ) {
              nextIndex++;
              if (nextIndex >= gameState.state.items.length) nextIndex = 0;
              attempt++;
            }

            await changeQuestion(nextIndex);
          }
        }, 1500);
      }
    } catch (error) {
      console.error(error);
      setFeedback({ type: "error", message: "⚠️ Error", visible: true });
      setTimeout(
        () => setFeedback((prev) => ({ ...prev, visible: false })),
        2000,
      );
    }
  };

  if (loading) {
    return (
      <div className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-gradient-to-br from-yellow-400 via-orange-500 to-red-500 overflow-hidden">
        {/* Animated Background Elements */}
        <div className="absolute inset-0 opacity-20">
          <div className="absolute top-10 left-10 w-32 h-32 bg-white rounded-full mix-blend-overlay filter blur-xl animate-blob"></div>
          <div className="absolute top-0 right-10 w-32 h-32 bg-yellow-200 rounded-full mix-blend-overlay filter blur-xl animate-blob animation-delay-2000"></div>
          <div className="absolute -bottom-8 left-20 w-32 h-32 bg-pink-300 rounded-full mix-blend-overlay filter blur-xl animate-blob animation-delay-4000"></div>
        </div>

        <div className="z-10 text-center space-y-8 animate-in zoom-in duration-700 slide-in-from-bottom-10">
          <div className="relative">
            <div className="absolute inset-0 bg-white/20 blur-2xl rounded-full scale-150"></div>
            <h1 className="relative text-6xl md:text-8xl font-black text-white drop-shadow-[0_5px_5px_rgba(0,0,0,0.3)] tracking-tighter transform -rotate-2">
              FIND
              <span className="block text-4xl md:text-6xl text-yellow-200 mt-2">
                THE MATCH
              </span>
            </h1>
          </div>

          <div className="flex flex-col items-center gap-4">
            <Loader2 className="h-16 w-16 text-white animate-spin drop-shadow-md" />
            <p className="text-2xl font-bold text-white tracking-widest uppercase animate-pulse">
              Loading Game...
            </p>
          </div>
        </div>
      </div>
    );
  }

  if (error || !game) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-yellow-50 p-4">
        <div className="max-w-md w-full bg-white shadow-lg rounded-xl p-8 text-center border-2 border-yellow-200">
          <div className="text-5xl mb-4">😿</div>
          <h2 className="text-2xl font-bold text-yellow-600 mb-2">
            Oops! Something went wrong
          </h2>
          <p className="text-gray-600 mb-6">
            {error || "Failed to load game."}
          </p>
          <Button onClick={() => window.location.reload()} variant="outline">
            Try Again
          </Button>
        </div>
      </div>
    );
  }

  if (gameState.state.isGameOver) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-yellow-300 to-orange-500 p-4 flex items-center justify-center">
        <GameOverScreen
          score={gameState.state.score}
          totalQuestions={gameState.state.totalQuestions}
          isWin={
            gameState.state.lives > 0 &&
            gameState.state.usedAnswers.size === gameState.state.totalQuestions
          }
          onRestart={() => window.location.reload()}
          onBackToHome={() => (window.location.href = "/")}
        />
      </div>
    );
  }

  const currentQuestion = gameState.state.items[currentQuestionIndex];
  const unmatchedAnswers = answers.filter((a) => !a.matchedQuestionId);

  return (
    <div className="min-h-screen bg-gradient-to-br from-yellow-300 via-yellow-200 to-orange-200 flex flex-col overflow-hidden">
      {/* Sound Toggle */}
      <div className="absolute top-4 right-4 z-10">
        <Button
          variant="ghost"
          size="icon"
          onClick={() => setIsSoundEnabled(!isSoundEnabled)}
          className="rounded-full bg-white/50 backdrop-blur hover:bg-white/80 text-yellow-800"
        >
          {isSoundEnabled ? (
            <Volume2 className="h-5 w-5" />
          ) : (
            <VolumeX className="h-5 w-5" />
          )}
        </Button>
      </div>

      <div className="container mx-auto max-w-4xl px-4 py-8 flex-1 flex flex-col relative z-0">
        {/* Header */}
        <GameHeader
          lives={gameState.state.lives}
          maxLives={gameState.state.initialLives}
          score={gameState.state.score}
          answersRemaining={unmatchedAnswers.length}
        />

        {/* Dramatic Feedback Overlay */}
        <Feedback
          type={feedback.type}
          message={feedback.message}
          visible={feedback.visible}
        />

        <div className="flex-1 flex flex-col justify-center gap-8">
          {/* Current Question Card with Animations */}
          {currentQuestion && (
            <div
              className={`
                        transform transition-all duration-300
                        ${shake ? "animate-shake" : ""}
                        ${slideDirection === "out" ? "-translate-x-full opacity-0" : "translate-x-0 opacity-100"}
                    `}
            >
              <Card className="border-b-8 border-yellow-500 shadow-xl overflow-hidden bg-white hover:scale-[1.02] transition-transform duration-300 rounded-3xl">
                <div className="h-3 bg-gradient-to-r from-yellow-400 to-orange-500 w-full" />
                <CardHeader className="text-center pb-2 pt-6">
                  <span className="text-xs font-black tracking-widest text-yellow-600 uppercase bg-yellow-100 px-3 py-1 rounded-full w-fit mx-auto">
                    Match current item
                  </span>
                </CardHeader>
                <CardContent className="text-center py-10 px-6">
                  <h2 className="text-2xl md:text-4xl font-black text-slate-800 leading-tight">
                    {currentQuestion.question}
                  </h2>
                </CardContent>
              </Card>
            </div>
          )}

          {/* Answer List */}
          <div
            className={`space-y-4 transition-all duration-300 ${feedback.visible ? "opacity-50 pointer-events-none" : "opacity-100"}`}
          >
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {unmatchedAnswers.map((answer) => (
                <Button
                  key={answer.id}
                  onClick={() => handleAnswerSelect(answer.id)}
                  className={`
                        py-8 h-auto text-lg font-bold shadow-[0_4px_0_0_rgb(0,0,0,0.1)] active:shadow-none active:translate-y-1 transition-all
                        rounded-2xl border-2
                        ${
                          selectedAnswerId === answer.id
                            ? "bg-yellow-500 text-white border-yellow-600 ring-4 ring-yellow-200"
                            : "bg-white text-slate-700 hover:bg-orange-50 border-slate-200 hover:border-orange-300"
                        }
                    `}
                >
                  <span className="line-clamp-2">{answer.text}</span>
                </Button>
              ))}
            </div>
          </div>
        </div>

        {/* Progress Text */}
        <div className="mt-8 text-center">
          <p className="text-yellow-700 font-bold text-xs tracking-widest uppercase mb-2">
            Progress
          </p>
          {/* Animated Progress Bar */}
          <div className="w-full max-w-xs mx-auto h-4 bg-white/50 rounded-full overflow-hidden shadow-inner border border-white/60">
            <div
              className="h-full bg-gradient-to-r from-yellow-400 to-orange-500 transition-all duration-1000 ease-out shadow-[0_2px_10px_rgba(251,191,36,0.5)]"
              style={{
                width: `${(matchedPairs.size / gameState.state.items.length) * 100}%`,
              }}
            />
          </div>
          <p className="text-yellow-800 font-medium text-xs mt-1">
            {matchedPairs.size} / {gameState.state.items.length}
          </p>
        </div>
      </div>

      {/* CSS for Shake & Slide Animation */}
      <style>{`
        @keyframes shake {
            0%, 100% { transform: translateX(0); }
            10%, 30%, 50%, 70%, 90% { transform: translateX(-5px); }
            20%, 40%, 60%, 80% { transform: translateX(5px); }
        }
        .animate-shake {
            animation: shake 0.5s cubic-bezier(.36,.07,.19,.97) both;
        }
      `}</style>
    </div>
  );
};

export default PlayFindTheMatch;
