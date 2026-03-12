// ========== User ==========
export interface User {
  id: number;
  name: string;
  email: string;
  tipo: 'gerente' | 'aluno';
  full_name?: string | null;
  avatar?: string | null;
  gender?: string | null;
  address?: string | null;
  whatsapp?: string | null;
  phone?: string | null;
}

// ========== Badge ==========
export interface Badge {
  id: number;
  title: string;
  short_description?: string | null;
  long_description?: string | null;
  image?: string | null;
  icon?: string;
  notification_message?: string | null;
  criteria_type: string;
  criteria_params?: Record<string, unknown> | null;
  earned_at?: string;
}

export interface LoginResponse {
  access_token: string;
  token_type: string;
  expires_in: number;
  user: User;
}

// ========== Category ==========
export interface Category {
  id: number;
  name: string;
}

// ========== Course ==========
export interface Course {
  id: number;
  title: string;
  description?: string;
  short_description?: string;
  difficulty?: string;
  featured: boolean;
  target_role?: string;
  category_id?: number | null;
  category?: Category | null;
  modules?: Module[];
  user_badges?: Badge[];
  is_enrolled?: boolean;
  user_progress?: number;
}

// ========== Module ==========
export interface Module {
  id: number;
  course_id: number;
  title: string;
  description?: string;
  position?: number;
  content?: string;
  lessons?: Lesson[];
  assessments?: Assessment[];
}

// ========== Lesson ==========
export interface Lesson {
  id: number;
  module_id: number;
  title: string;
  description?: string;
  position?: number;
  content?: string;
}

// ========== Assessment ==========
export interface Assessment {
  id: number;
  module_id: number;
  lesson_id?: number | null;
  title: string;
  max_score?: number;
  min_score?: number;
  position?: number;
  scored?: boolean;
  worth_points?: boolean;
  questions?: Question[];
}

// ========== Question ==========
export interface Question {
  id: number;
  assessment_id: number;
  text: string;
  answer_text?: string | null;
  is_multiple_choice: boolean;
  score?: number;
  options?: Option[];
}

// ========== Option ==========
export interface Option {
  id: number;
  question_id: number;
  label: string;
  text: string;
  is_correct: boolean;
}
