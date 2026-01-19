import api from './api';

export const assetTypesService = {
  getAll: () => api.get('/asset-types'),
  getById: (id: string) => api.get(`/asset-types/${id}`),
  create: (data: any) => api.post('/asset-types', data),
  update: (id: string, data: any) => api.patch(`/asset-types/${id}`, data),
  delete: (id: string) => api.delete(`/asset-types/${id}`),
};

