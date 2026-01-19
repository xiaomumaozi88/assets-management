import api from './api';

export type Application = {
  id: string;
  applicant_id: string;
  asset_type_id: string;
  asset_template_id?: string;
  project_id?: string;
  business_line_id?: string;
  application_data: Record<string, any>;
  status: 'pending' | 'approved' | 'rejected' | 'cancelled';
  created_at: string;
  updated_at: string;
  applicant?: any;
  assetType?: any;
  project?: any;
  businessLine?: any;
  approvals?: any[];
};

export const applicationsService = {
  getAll: (my?: boolean) => {
    const url = my ? '/applications/my' : '/applications';
    return api.get(url);
  },
  getById: (id: string) => api.get(`/applications/${id}`),
  create: (data: any) => api.post('/applications', data),
  update: (id: string, data: any) => api.patch(`/applications/${id}`, data),
  cancel: (id: string) => api.post(`/applications/${id}/cancel`),
};

