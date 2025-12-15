import { useReducer, useCallback } from "react";
import type { GameItem } from "../types";

export interface GameState {
  items: GameItem[];
  currentQuestionIndex: number;
  usedAnswers: Set<string>;
  isGameOver: boolean;
  lives: number;
  initialLives: number;
  score: number;
  totalQuestions: number;
  loading: boolean;
  error: string | null;
}

export type GameAction =
  | { type: "INITIALIZE"; payload: { items: GameItem[]; initialLives: number } }
  | { type: "ANSWER_CORRECT"; payload: { answer: string } }
  | { type: "ANSWER_INCORRECT" }
  | { type: "NEXT_QUESTION" }
  | { type: "SET_ERROR"; payload: string }
  | { type: "RESET_GAME" }
  | { type: "SET_LOADING"; payload: boolean };

const initialState: GameState = {
  items: [],
  currentQuestionIndex: 0,
  usedAnswers: new Set(),
  isGameOver: false,
  lives: 3,
  initialLives: 3,
  score: 0,
  totalQuestions: 0,
  loading: false,
  error: null,
};

function gameReducer(state: GameState, action: GameAction): GameState {
  switch (action.type) {
    case "INITIALIZE": {
      const { items, initialLives } = action.payload;
      return {
        ...state,
        items,
        initialLives,
        lives: initialLives,
        totalQuestions: items.length,
        currentQuestionIndex: 0,
        usedAnswers: new Set(),
        isGameOver: false,
        score: 0,
        error: null,
      };
    }

    case "ANSWER_CORRECT": {
      const newUsedAnswers = new Set(state.usedAnswers);
      newUsedAnswers.add(action.payload.answer);

      // Check if all answers are used
      const isGameOver = newUsedAnswers.size === state.items.length;

      return {
        ...state,
        usedAnswers: newUsedAnswers,
        score: state.score + 1,
        isGameOver,
        currentQuestionIndex: isGameOver
          ? state.currentQuestionIndex
          : state.currentQuestionIndex + 1,
      };
    }

    case "ANSWER_INCORRECT": {
      const newLives = state.lives - 1;
      const isGameOver = newLives <= 0;

      return {
        ...state,
        lives: newLives,
        isGameOver,
      };
    }

    case "NEXT_QUESTION": {
      const nextIndex = state.currentQuestionIndex + 1;
      const isGameOver =
        nextIndex >= state.items.length ||
        state.usedAnswers.size === state.items.length;

      return {
        ...state,
        currentQuestionIndex: isGameOver
          ? state.currentQuestionIndex
          : nextIndex,
        isGameOver,
      };
    }

    case "SET_ERROR":
      return {
        ...state,
        error: action.payload,
      };

    case "SET_LOADING":
      return {
        ...state,
        loading: action.payload,
      };

    case "RESET_GAME":
      return {
        ...initialState,
      };

    default:
      return state;
  }
}

export function useGameState() {
  const [state, dispatch] = useReducer(gameReducer, initialState);

  const initialize = useCallback((gameItems: GameItem[], lives: number) => {
    dispatch({
      type: "INITIALIZE",
      payload: { items: gameItems, initialLives: lives },
    });
  }, []);

  const handleCorrectAnswer = useCallback((answer: string) => {
    dispatch({ type: "ANSWER_CORRECT", payload: { answer } });
  }, []);

  const handleIncorrectAnswer = useCallback(() => {
    dispatch({ type: "ANSWER_INCORRECT" });
  }, []);

  const nextQuestion = useCallback(() => {
    dispatch({ type: "NEXT_QUESTION" });
  }, []);

  const setError = useCallback((error: string) => {
    dispatch({ type: "SET_ERROR", payload: error });
  }, []);

  const setLoading = useCallback((loading: boolean) => {
    dispatch({ type: "SET_LOADING", payload: loading });
  }, []);

  const reset = useCallback(() => {
    dispatch({ type: "RESET_GAME" });
  }, []);

  return {
    state,
    initialize,
    handleCorrectAnswer,
    handleIncorrectAnswer,
    nextQuestion,
    setError,
    setLoading,
    reset,
  };
}
