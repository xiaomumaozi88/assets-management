import api from './api';

export interface AssetTag {
  id: string;
  asset_id: string;
  tag_key: string;
  tag_value: string;
  created_at: string;
  updated_at: string;
}

export interface TagInput {
  key: string;
  value: string;
}

export const assetTagsService = {
  getByAsset: (assetId: string) => api.get<AssetTag[]>(`/assets/${assetId}/tags`),
  update: (assetId: string, tags: TagInput[]) => api.put(`/assets/${assetId}/tags`, { tags }),
  add: (assetId: string, key: string, value: string) => api.post(`/assets/${assetId}/tags`, { key, value }),
  remove: (assetId: string, tagId: string) => api.delete(`/assets/${assetId}/tags/${tagId}`),
};

