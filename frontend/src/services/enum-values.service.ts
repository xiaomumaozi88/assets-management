import api from './api';

export type EnumValue = {
  id: string;
  name: string;
  code?: string;
  scope: 'global' | 'asset_type';
  asset_type_id?: string;
  values: Array<{ value: string; label: string }>;
  description?: string;
  sort_order: number;
  created_at: string;
  updated_at: string;
  assetType?: { id: string; name: string };
};

export const enumValuesService = {
  getAll: (assetTypeId?: string, scope?: 'global' | 'asset_type') => {
    const params: any = {};
    if (assetTypeId) params.asset_type_id = assetTypeId;
    if (scope) params.scope = scope;
    return api.get('/enum-values', { params });
  },
  getGlobal: () => api.get('/enum-values?scope=global'),
  getByAssetType: (assetTypeId: string) => api.get(`/enum-values?asset_type_id=${assetTypeId}`),
  getById: (id: string) => api.get(`/enum-values/${id}`),
  create: (data: Omit<EnumValue, 'id' | 'created_at' | 'updated_at'>) => api.post('/enum-values', data),
  update: (id: string, data: Partial<EnumValue>) => api.patch(`/enum-values/${id}`, data),
  delete: (id: string) => api.delete(`/enum-values/${id}`),
};

