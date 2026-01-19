import api from './api';

export type BusinessLine = {
  id: string;
  name: string;
  code?: string;
  description?: string;
  status?: boolean;
  created_at?: string;
  updated_at?: string;
};

export const businessLinesService = {
  getAll: () => api.get('/business-lines'),
  getById: (id: string) => api.get(`/business-lines/${id}`),
  create: (data: any) => api.post('/business-lines', data),
  update: (id: string, data: any) => api.patch(`/business-lines/${id}`, data),
  delete: (id: string) => api.delete(`/business-lines/${id}`),
};

