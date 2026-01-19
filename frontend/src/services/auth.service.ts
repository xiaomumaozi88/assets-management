import api from './api';

export interface LoginDto {
  email: string;
  password: string;
}

export interface RegisterDto {
  name: string;
  email: string;
  password: string;
  department?: string;
}

export interface AuthResponse {
  access_token: string;
  user: {
    id: string;
    name: string;
    email: string;
    role: string;
    department?: string;
  };
}

export const authService = {
  login: async (data: LoginDto): Promise<AuthResponse> => {
    return await api.post<AuthResponse>('/auth/login', data) as unknown as AuthResponse;
  },
  register: async (data: RegisterDto): Promise<AuthResponse> => {
    return await api.post<AuthResponse>('/auth/register', data) as unknown as AuthResponse;
  },
};

