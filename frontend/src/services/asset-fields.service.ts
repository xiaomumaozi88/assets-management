import api from './api';

export type AssetField = {
  id?: string;
  asset_type_id?: string;
  asset_template_id?: string;
  field_name: string;
  field_code: string;
  field_type: 'text' | 'number' | 'date' | 'url' | 'email' | 'json' | 'select' | 'textarea';
  is_required: boolean;
  require_in_application?: boolean;
  is_primary?: boolean; // 是否为主要字段
  default_value?: string;
  validation_rule?: Record<string, any>;
  options?: Record<string, any>;
  display_order: number;
};

export const assetFieldsService = {
  getAll: (assetTypeId: string) => api.get(`/asset-fields/asset-type/${assetTypeId}`),
  getByTemplate: (templateId: string) => api.get(`/asset-fields/asset-template/${templateId}`),
  create: (data: AssetField) => api.post('/asset-fields', data),
  update: (id: string, data: Partial<AssetField>) => api.patch(`/asset-fields/${id}`, data),
  delete: (id: string) => api.delete(`/asset-fields/${id}`),
  batchCreate: (fields: AssetField[]) => Promise.all(fields.map(field => api.post('/asset-fields', field))),
};

