import api from './api';

export type Approval = {
  id: string;
  application_id: string;
  approver_id: string;
  status: 'pending' | 'approved' | 'rejected';
  comments?: string;
  created_at: string;
  application?: any;
  approver?: any;
};

export const approvalsService = {
  getMyPending: () => api.get('/approvals/my-pending'),
  getMyProcessed: () => api.get('/approvals/my-processed'),
  getAll: (status?: string) => {
    const url = status ? `/approvals?status=${status}` : '/approvals';
    return api.get(url);
  },
  getById: (id: string) => api.get(`/approvals/${id}`),
  create: (data: any) => api.post('/approvals', data),
  update: (id: string, data: any) => api.patch(`/approvals/${id}`, data),
};

