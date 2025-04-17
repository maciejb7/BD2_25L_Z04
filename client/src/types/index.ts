export interface User {
  userId: string;
  nickname: string;
  name: string;
  surname: string;
  email: string;
  gender: string;
  role: string;
}

export interface MatchType {
  match_type_id: string;
  match_type_name: string;
  match_type_description: string;
}

export interface UserMatchPreference {
  match_type_id: string;
  match_type_name: string;
  match_type_description: string;
}

export interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
}
