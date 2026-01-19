import api from './api';

export type AssetTemplate = {
  id: string;
  asset_type_id: string;
  name: string;
  code?: string;
  purpose?: string;
  description?: string;
  status: boolean;
  sort_order: number;
  created_at: string;
  updated_at: string;
  fields?: any[];
};

export const assetTemplatesService = {
  getAll: (assetTypeId?: string) => {
    const url = assetTypeId 
      ? `/asset-templates?asset_type_id=${assetTypeId}`
      : '/asset-templates';
    return api.get(url);
  },
  getById: (id: string) => api.get(`/asset-templates/${id}`),
  create: (data: any) => api.post('/asset-templates', data),
  update: (id: string, data: any) => api.patch(`/asset-templates/${id}`, data),
  delete: (id: string) => api.delete(`/asset-templates/${id}`),
};

