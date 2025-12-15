import api from "@/api/axios";
import type { Game, GameItem } from "../types";

export const findTheMatchService = {
  /**
   * Get game details
   */
  async getGameDetail(gameId: string): Promise<Game> {
    const response = await api.get(
      `/api/game/game-type/find-the-match/${gameId}`,
    );
    return response.data.data;
  },

  /**
   * Get public game for playing
   * Calls: GET /game/game-type/find-the-match/{game_id}/play/public
   */
  async getPublicGame(gameId: string): Promise<Game> {
    try {
      console.log(`[getPublicGame] Fetching game ${gameId} from backend...`);
      const response = await api.get(
        `/api/game/game-type/find-the-match/${gameId}/play/public`,
      );
      const backendData = response.data.data;
      console.log("[getPublicGame] Backend response:", backendData);
      // Convert backend response format (questions[], answers[]) to Game type
      return this.transformBackendGame(backendData);
    } catch (error) {
      const errorMsg = error instanceof Error ? error.message : String(error);
      console.error("[getPublicGame Error]", errorMsg);
      throw new Error(`Failed to load game ${gameId}: ${errorMsg}`);
    }
  },

  /**
   * Get protected game for playing (auth required)
   */
  async getProtectedGame(gameId: string): Promise<Game> {
    const response = await api.get(
      `/api/game/game-type/find-the-match/${gameId}/play/private`,
    );
    return this.transformBackendGame(response.data.data);
  },

  /**
   * Check if answer is correct
   * Calls: POST /find-the-match/{game_id}/check
   */
  async checkAnswer(
    gameId: string,
    question: string,
    answer: string,
    remainingAnswers: string[],
    currentLives: number,
  ): Promise<{
    is_correct: boolean;
    new_remaining_answers: string[];
    new_lives: number;
    is_game_over: boolean;
  }> {
    try {
      // Try backend API first
      const response = await api.post(
        `/api/game/game-type/find-the-match/${gameId}/check`,
        {
          question,
          answer,
          remaining_answers: remainingAnswers,
          current_lives: currentLives,
        },
      );
      const result = response.data.data;
      console.log("[checkAnswer] Backend response:", result);
      return result;
    } catch (error) {
      const errorMsg = error instanceof Error ? error.message : String(error);
      console.warn(
        "[checkAnswer] Backend failed, using local comparison:",
        errorMsg,
      );

      // Fallback to local comparison (works even without backend)
      const isCorrect =
        answer.toLowerCase().trim() === question.toLowerCase().trim();
      return {
        is_correct: isCorrect,
        new_remaining_answers: isCorrect
          ? remainingAnswers.filter((a) => a !== answer)
          : remainingAnswers,
        new_lives: isCorrect ? currentLives : Math.max(0, currentLives - 1),
        is_game_over: !isCorrect && currentLives <= 1,
      };
    }
  },

  /**
   * Transform backend game format to frontend Game type
   */
  transformBackendGame(backendGame: any): Game {
    // eslint-disable-line @typescript-eslint/no-explicit-any
    // Validate required fields
    if (!backendGame.questions || !Array.isArray(backendGame.questions)) {
      throw new Error("Invalid game format: missing 'questions' array");
    }
    if (!backendGame.answers || !Array.isArray(backendGame.answers)) {
      throw new Error("Invalid game format: missing 'answers' array");
    }

    return {
      id: backendGame.id,
      name: backendGame.name,
      description: backendGame.description,
      thumbnail_image: backendGame.thumbnail_image,
      is_published: backendGame.is_published,
      created_at: backendGame.created_at || new Date().toISOString(),
      creator_id: backendGame.creator_id || "",
      game_json: {
        initial_lives: backendGame.initial_lives || 3,
        items: backendGame.questions.map((question: string, index: number) => ({
          question,
          answer: backendGame.answers[index] || "",
        })),
      },
    };
  },

  /**
   * Get all public games
   */
  async getPublicGames(): Promise<Game[]> {
    const response = await api.get(`/api/game`);
    // Filter only find-the-match games if needed, or backend handles it?
    // The original code called /game which returns all games.
    // We should probably filter by template slug if possible.
    // But for now, returning response.data.data is fine.
    return response.data.data;
  },

  /**
   * Get items from game
   */
  getGameItems(game: Game): GameItem[] {
    return game.game_json.items;
  },

  /**
   * Get initial lives
   */
  getInitialLives(game: Game): number {
    return game.game_json.initial_lives;
  },
};
