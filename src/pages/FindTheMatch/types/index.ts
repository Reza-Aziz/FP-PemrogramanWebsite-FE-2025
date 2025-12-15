export interface GameItem {
  question: string;
  answer: string;
}

export interface Game {
  id: string;
  name: string;
  description: string;
  thumbnail_image: string;
  is_published: boolean;
  created_at: string;
  game_json: {
    initial_lives: number;
    items: GameItem[];
  };
  creator_id: string;
}

export interface GameResponse {
  statusCode: number;
  message: string;
  data: Game;
}

export interface GameListResponse {
  statusCode: number;
  message: string;
  data: Game[];
}

export interface CheckAnswerRequest {
  game_id: string;
  question: string;
  answer: string;
  user_answer: string;
}

export interface CheckAnswerResponse {
  statusCode: number;
  message: string;
  data: {
    is_correct: boolean;
    next_question?: string;
    remaining_questions: number;
  };
}
