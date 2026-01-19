import api from './api';

export type User = {
  id: string;
  name: string;
  email: string;
  role?: 'user' | 'admin';
  department?: string;
  status?: 'active' | 'inactive';
  created_at?: string;
};

export type CreateUserDto = {
  name: string;
  email: string;
  password: string;
  role?: 'user' | 'admin';
  department?: string;
  status?: 'active' | 'inactive';
};

export const usersService = {
  getAll: () => api.get<User[]>('/users'),
  getById: (id: string) => api.get<User>(`/users/${id}`),
  create: (data: CreateUserDto) => api.post<User>('/users', data),
  update: (id: string, data: Partial<CreateUserDto>) => api.patch<User>(`/users/${id}`, data),
  delete: (id: string) => api.delete(`/users/${id}`),
};

