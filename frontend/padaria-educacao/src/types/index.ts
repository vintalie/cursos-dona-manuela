// ========== User ==========
export interface User {
  id: number;
  name: string;
  email: string;
  tipo: 'gerente' | 'aluno';
}

export interface LoginResponse {
  access_token: string;
  token_type: string;
  expires_in: number;
  user: User;
}

// ========== Course ==========
export interface Course {
  id: number;
  title: string;
  description?: string;
  difficulty?: string;
  featured: boolean;
  target_role?: string;
  modules?: Module[];
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
  title: string;
  max_score?: number;
  scored?: boolean;
  worth_points?: boolean;
  questions?: Question[];
}

// ========== Question ==========
export interface Question {
  id: number;
  assessment_id: number;
  text: string;
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
