export interface ClassData {
    lesson_id: string;
    title: string;
    image_url?: string;
    category: string;
    difficulty: string;
    passing_accuracy: number;
    gained_XP: number;
    instructions: string;
    order: number;
    is_active?: boolean;
}

export interface LessonsResponse {
    lessons: ClassData[];
}

export interface AslResult {
    top: string | null;
    conf: number | null;
    hand_conf?: number | null;
}

export interface AttemptResult {
    correct: boolean;
    confidence: number;
    prediction: string;
}
