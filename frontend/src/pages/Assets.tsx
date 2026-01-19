import { useState, useEffect } from 'react';
import React from 'react';
import { Select } from 'antd';
import { assetTypesService } from '../services/asset-types.service';
import { assetTemplatesService, type AssetTemplate } from '../services/asset-templates.service';
import { assetFieldsService, type AssetField } from '../services/asset-fields.service';
import { assetsService } from '../services/assets.service';
import { businessLinesService } from '../services/business-lines.service';
import api from '../services/api';
import './Assets.css';

interface AssetType {
  id: string;
  name: string;
  code: string;
}

interface BusinessLine {
  id: string;
  name: string;
  code: string;
}

interface Asset {
  id: string;
  asset_type_id: string;
  asset_template_id?: string;
  name: string;
  code?: string;
  status: string;
  business_line_id?: string;
  owner_id: string;
  parent_id?: string;
  expiry_date?: string;
  cost?: number;
  custom_fields?: Record<string, any>;
  children?: Asset[];
  created_at: string;
  updated_at: string;
}

const Assets = () => {
  const [assetTypes, setAssetTypes] = useState<AssetType[]>([]);
  const [templates, setTemplates] = useState<AssetTemplate[]>([]);
  const [fields, setFields] = useState<AssetField[]>([]);
  const [assets, setAssets] = useState<Asset[]>([]);
  const [businessLines, setBusinessLines] = useState<BusinessLine[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  
  const [selectedAssetTypeId, setSelectedAssetTypeId] = useState<string>('');
  const [selectedTemplateId, setSelectedTemplateId] = useState<string>('');
  const [isAssetModalOpen, setIsAssetModalOpen] = useState(false);
  const [isFieldModalOpen, setIsFieldModalOpen] = useState(false);
  const [editingAsset, setEditingAsset] = useState<Asset | null>(null);
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);
  const [assetFormData, setAssetFormData] = useState<Record<string, any>>({});
  const [editingRowId, setEditingRowId] = useState<string | null>(null);
  const [editingCell, setEditingCell] = useState<{ rowId: string; field: string } | null>(null);
  const [rowData, setRowData] = useState<Record<string, Record<string, any>>>({});
  const [expandedRows, setExpandedRows] = useState<Set<string>>(new Set());
  const [templateDescription, setTemplateDescription] = useState<string>('');
  const [isEditingDescription, setIsEditingDescription] = useState(false);
  const [fieldOptionsCache, setFieldOptionsCache] = useState<Record<string, Array<{ value: string; label: string }>>>({});
  const [fieldOptionsLoading, setFieldOptionsLoading] = useState<Record<string, boolean>>({});

  useEffect(() => {
    loadAssetTypes();
    loadBusinessLines();
  }, []);

  useEffect(() => {
    if (selectedAssetTypeId) {
      loadTemplates(selectedAssetTypeId);
    } else {
      setTemplates([]);
      setSelectedTemplateId('');
    }
  }, [selectedAssetTypeId]);

  useEffect(() => {
    if (selectedTemplateId) {
      loadFields(selectedTemplateId);
      loadAssets(selectedTemplateId);
      loadTemplateDescription(selectedTemplateId);
    } else {
      setFields([]);
      setAssets([]);
      setTemplateDescription('');
    }
  }, [selectedTemplateId]);

  // 预加载所有需要动态加载的字段选项
  useEffect(() => {
    if (fields.length === 0) return;
    
    const loadAllFieldOptions = async () => {
      for (const field of fields) {
        if (field.field_type === 'select' && (field.options?.source === 'enum' || field.options?.source === 'api')) {
          const cacheKey = `${field.id || field.field_code}_${field.options?.source || 'manual'}`;
          if (!fieldOptionsCache[cacheKey] && !fieldOptionsLoading[cacheKey]) {
            await loadFieldOptions(field);
          }
        }
      }
    };
    
    loadAllFieldOptions();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedTemplateId, fields.length]);

  // 加载字段选项（从API或内置枚举）
  const loadFieldOptions = async (field: AssetField) => {
    const cacheKey = `${field.id || field.field_code}_${field.options?.source || 'manual'}`;
    if (fieldOptionsCache[cacheKey]) {
      return fieldOptionsCache[cacheKey];
    }
    
    // 设置加载状态
    setFieldOptionsLoading(prev => ({ ...prev, [cacheKey]: true }));

    try {
      if (field.options?.source === 'enum') {
        // 内置枚举
        if (field.options?.enumType === 'business_lines') {
          const data = await businessLinesService.getAll();
          const items = Array.isArray(data) ? data.map((bl: any) => ({
            value: bl.code || bl.id, // 使用code作为value
            label: bl.name
          })) : [];
          setFieldOptionsCache(prev => ({ ...prev, [cacheKey]: items }));
          setFieldOptionsLoading(prev => ({ ...prev, [cacheKey]: false }));
          return items;
        }
      } else if (field.options?.source === 'api' && field.options?.apiUrl) {
        // 从API获取
        const response = await api.get(field.options.apiUrl);
        const data = Array.isArray(response) ? response : (response.data || []);
        const valueField = field.options.apiValueField || 'id';
        const labelField = field.options.apiLabelField || 'name';
        const items = data.map((item: any) => ({
          value: item[valueField],
          label: item[labelField] || item[valueField]
        }));
        setFieldOptionsCache(prev => ({ ...prev, [cacheKey]: items }));
        setFieldOptionsLoading(prev => ({ ...prev, [cacheKey]: false }));
        return items;
      }
    } catch (err) {
      console.error(`加载字段选项失败 (${field.field_name}):`, err);
      setFieldOptionsLoading(prev => ({ ...prev, [cacheKey]: false }));
    }

    // 手动添加的选项
    setFieldOptionsLoading(prev => ({ ...prev, [cacheKey]: false }));
    return field.options?.items || [];
  };

  const loadTemplateDescription = async (templateId: string) => {
    try {
      const response = await assetTemplatesService.getById(templateId);
      const template = response as unknown as AssetTemplate;
      if (template) {
        setTemplateDescription(template.description || '');
      }
    } catch (err) {
      console.error('加载模板描述失败:', err);
      setTemplateDescription('');
    }
  };

  const handleUpdateTemplateDescription = async (newDescription: string) => {
    if (!selectedTemplateId) return;
    
    try {
      await assetTemplatesService.update(selectedTemplateId, {
        description: newDescription,
      });
      setTemplateDescription(newDescription);
      setIsEditingDescription(false);
    } catch (err: any) {
      setError(err.response?.data?.message || err.message || '更新描述失败');
    }
  };

  const loadAssetTypes = async () => {
    try {
      const data = await assetTypesService.getAll();
      setAssetTypes(Array.isArray(data) ? data : []);
    } catch (err: any) {
      setError(err.response?.data?.message || err.message || '加载失败');
    }
  };

  const loadBusinessLines = async () => {
    try {
      const data = await businessLinesService.getAll();
      setBusinessLines(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error('加载业务线失败:', err);
    }
  };

  const loadTemplates = async (assetTypeId: string) => {
    try {
      const data = await assetTemplatesService.getAll(assetTypeId);
      setTemplates(Array.isArray(data) ? data : []);
      if (Array.isArray(data) && data.length > 0) {
        setSelectedTemplateId(data[0].id);
      } else {
        setSelectedTemplateId('');
      }
    } catch (err) {
      console.error('加载模板失败:', err);
    }
  };

  const loadFields = async (templateId: string) => {
    try {
      const data = await assetFieldsService.getByTemplate(templateId);
      setFields(Array.isArray(data) ? (data as unknown as AssetField[]) : []);
    } catch (err) {
      console.error('加载字段失败:', err);
      setFields([]);
    }
  };

  const loadAssets = async (templateId: string) => {
    try {
      setLoading(true);
      setError('');
      const data = await assetsService.getAll({ asset_template_id: templateId });
      const assetsList = Array.isArray(data) ? data : [];
      
      // 构建树形结构
      const assetMap = new Map<string, Asset>();
      const rootAssets: Asset[] = [];

      // 创建资产映射
      assetsList.forEach(asset => {
        assetMap.set(asset.id, { ...asset, children: [] });
      });

      // 构建树形结构
      assetsList.forEach(asset => {
        const assetWithChildren = assetMap.get(asset.id)!;
        if (asset.parent_id && assetMap.has(asset.parent_id)) {
          const parent = assetMap.get(asset.parent_id)!;
          if (!parent.children) {
            parent.children = [];
          }
          parent.children.push(assetWithChildren);
        } else {
          rootAssets.push(assetWithChildren);
        }
      });

      setAssets(rootAssets);
      
      // 初始化行数据
      const initialRowData: Record<string, Record<string, any>> = {};
      assetsList.forEach(asset => {
        initialRowData[asset.id] = {
          name: asset.name,
          code: asset.code || '',
          business_line_id: asset.business_line_id || '',
          expiry_date: asset.expiry_date || '',
          cost: asset.cost || '',
          status: asset.status,
          parent_id: asset.parent_id || '',
          ...asset.custom_fields,
        };
      });
      setRowData(prev => ({ ...prev, ...initialRowData }));
    } catch (err: any) {
      setError(err.response?.data?.message || err.message || '加载失败');
    } finally {
      setLoading(false);
    }
  };

  const toggleExpand = (assetId: string) => {
    const newExpanded = new Set(expandedRows);
    if (newExpanded.has(assetId)) {
      newExpanded.delete(assetId);
    } else {
      newExpanded.add(assetId);
    }
    setExpandedRows(newExpanded);
  };

  const handleOpenAssetModal = (asset?: Asset) => {
    if (asset) {
      setEditingAsset(asset);
      setAssetFormData({
        name: asset.name,
        code: asset.code || '',
        business_line_id: asset.business_line_id || '',
        expiry_date: asset.expiry_date || '',
        cost: asset.cost || '',
        ...asset.custom_fields,
      });
    } else {
      setEditingAsset(null);
      const initialData: Record<string, any> = {
        name: '',
        code: '',
        business_line_id: '',
        expiry_date: '',
        cost: '',
      };
      // 为每个字段设置默认值
      fields.forEach(field => {
        initialData[field.field_code] = field.default_value || '';
      });
      setAssetFormData(initialData);
    }
    setIsAssetModalOpen(true);
  };

  const handleAddNewRow = (parentId?: string) => {
    console.log('handleAddNewRow called', { parentId, selectedTemplateId, selectedAssetTypeId });
    
    if (!selectedTemplateId || !selectedAssetTypeId) {
      setError('请先选择资产类型和表格');
      return;
    }

    const newId = `new-${Date.now()}`;
    console.log('Creating new asset with id:', newId);
    const newAsset: Asset = {
      id: newId,
      asset_type_id: selectedAssetTypeId,
      asset_template_id: selectedTemplateId,
      name: '',
      status: 'active',
      owner_id: '',
      parent_id: parentId,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      custom_fields: {},
      children: [],
    };
    
    const initialData: Record<string, any> = {
      name: '',
      code: '',
      business_line_id: '',
      expiry_date: '',
      cost: '',
      status: 'active',
      parent_id: parentId || '',
    };
    
    fields.forEach(field => {
      initialData[field.field_code] = field.default_value || '';
    });
    
    setRowData(prev => ({
      ...prev,
      [newId]: initialData,
    }));
    
    if (parentId) {
      // 添加到父资产的子列表中，并展开父资产
      setAssets(prev => {
        const addToChildren = (list: Asset[]): Asset[] => {
          return list.map(a => {
            if (a.id === parentId) {
              return { ...a, children: [...(a.children || []), newAsset] };
            }
            if (a.children && a.children.length > 0) {
              return { ...a, children: addToChildren(a.children) };
            }
            return a;
          });
        };
        return addToChildren(prev);
      });
      setExpandedRows(prev => new Set([...prev, parentId]));
    } else {
      // 添加到顶级列表
      setAssets(prev => {
        console.log('Adding new asset to top level', { prev, newAsset });
        return [...prev, newAsset];
      });
    }
    
    setEditingRowId(newId);
    setError(''); // 清除之前的错误
    console.log('New row added, editingRowId set to:', newId);
  };

  const handleCellChange = (rowId: string, field: string, value: any) => {
    setRowData(prev => ({
      ...prev,
      [rowId]: {
        ...prev[rowId] || {},
        [field]: value,
      },
    }));
  };

  const handleSaveRow = async (rowId: string) => {
    try {
      setError('');
      const data = rowData[rowId];
      if (!data) {
        setError('数据不存在');
        return;
      }

      // 验证必填字段：名称
      if (!data.name || data.name.trim() === '') {
        setError('名称不能为空');
        return;
      }

      // 验证必填字段：业务线
      if (!data.business_line_id) {
        setError('业务线是必填项，请选择业务线');
        return;
      }

      // 验证必填的自定义字段
      for (const field of fields) {
        if (field.is_required && (!data[field.field_code] || data[field.field_code].toString().trim() === '')) {
          setError(`${field.field_name}不能为空`);
          return;
        }
      }

      const customFields: Record<string, any> = {};
      fields.forEach(field => {
        if (data[field.field_code] !== undefined && data[field.field_code] !== null && data[field.field_code] !== '') {
          customFields[field.field_code] = data[field.field_code];
        }
      });

      const assetData = {
        asset_type_id: selectedAssetTypeId,
        asset_template_id: selectedTemplateId,
        name: data.name.trim(),
        code: data.code?.trim() || undefined,
        business_line_id: data.business_line_id || undefined,
        expiry_date: data.expiry_date || undefined,
        cost: data.cost ? parseFloat(data.cost.toString()) : undefined,
        status: data.status || 'active',
        parent_id: data.parent_id || undefined,
        custom_fields: customFields,
      };

      if (rowId.startsWith('new-')) {
        // 新建 - owner_id 会在后端自动设置为当前用户ID
        await assetsService.create(assetData);
      } else {
        // 更新
        await assetsService.update(rowId, assetData);
      }
      
      setEditingRowId(null);
      setEditingCell(null);
      loadAssets(selectedTemplateId);
    } catch (err: any) {
      const errorMessage = err.response?.data?.message || err.message || '保存失败';
      setError(errorMessage);
      console.error('保存失败:', err);
    }
  };

  const findAssetInTree = (list: Asset[], id: string): Asset | null => {
    for (const asset of list) {
      if (asset.id === id) return asset;
      if (asset.children) {
        const found = findAssetInTree(asset.children, id);
        if (found) return found;
      }
    }
    return null;
  };

  const removeAssetFromTree = (list: Asset[], id: string): Asset[] => {
    return list.filter(a => {
      if (a.id === id) return false;
      if (a.children && a.children.length > 0) {
        a.children = removeAssetFromTree(a.children, id);
      }
      return true;
    });
  };

  const handleCancelEdit = (rowId: string) => {
    if (rowId.startsWith('new-')) {
      // 如果是新行，从树中删除
      setAssets(prev => removeAssetFromTree(prev, rowId));
      const newRowData = { ...rowData };
      delete newRowData[rowId];
      setRowData(newRowData);
    } else {
      // 恢复原始数据
      const asset = findAssetInTree(assets, rowId);
      if (asset) {
        setRowData({
          ...rowData,
          [rowId]: {
            name: asset.name,
            code: asset.code || '',
            business_line_id: asset.business_line_id || '',
            expiry_date: asset.expiry_date || '',
            cost: asset.cost || '',
            status: asset.status,
            parent_id: asset.parent_id || '',
            ...asset.custom_fields,
          },
        });
      }
    }
    setEditingRowId(null);
    setEditingCell(null);
  };

  const renderCellInput = (asset: Asset, field: AssetField | null, fieldKey: string) => {
    const isEditing = editingRowId === asset.id;
    const value = rowData[asset.id]?.[fieldKey] ?? (field ? (asset.custom_fields?.[field.field_code] || '') : (fieldKey === 'name' ? asset.name : fieldKey === 'code' ? (asset.code || '') : fieldKey === 'business_line_id' ? (asset.business_line_id || '') : fieldKey === 'expiry_date' ? (asset.expiry_date || '') : fieldKey === 'cost' ? (asset.cost || '') : ''));
    
    if (!isEditing) {
      // 显示模式
      if (fieldKey === 'business_line_id') {
        return businessLines.find(bl => bl.id === value)?.name || '-';
      }
      if (fieldKey === 'expiry_date' && value) {
        return new Date(value).toLocaleDateString('zh-CN');
      }
      if (fieldKey === 'cost' && value) {
        return `¥${value}`;
      }
      if (fieldKey === 'status') {
        return (
          <span className={`status-badge ${value === 'active' ? 'active' : 'inactive'}`}>
            {value === 'active' ? '启用' : '禁用'}
          </span>
        );
      }
      // 如果是下拉字段，显示标签（需要从缓存或字段配置中获取）
      if (field && field.field_type === 'select') {
        const cacheKey = `${field.id || field.field_code}_${field.options?.source || 'manual'}`;
        const options = fieldOptionsCache[cacheKey] || field.options?.items || [];
        const isMultiple = field.options?.multiple || false;
        
        if (isMultiple) {
          const selectedValues = Array.isArray(value) ? value : (value ? [value] : []);
          const labels = selectedValues.map((val: string) => {
            const option = options.find((opt: any) => {
              const optValue = typeof opt === 'string' ? opt : opt.value;
              return optValue === val;
            });
            if (option) {
              return typeof option === 'string' ? option : (option.label || option.value);
            }
            return val;
          });
          return labels.join(', ') || '-';
        } else {
          const option = options.find((opt: any) => {
            const optValue = typeof opt === 'string' ? opt : opt.value;
            return optValue === value;
          });
          if (option) {
            return typeof option === 'string' ? option : (option.label || option.value);
          }
        }
      }
      return value || '-';
    }

    // 编辑模式
    if (fieldKey === 'name') {
      return (
        <input
          type="text"
          value={value || ''}
          onChange={(e) => handleCellChange(asset.id, 'name', e.target.value)}
          className="inline-input"
          placeholder="名称"
        />
      );
    }
    if (fieldKey === 'code') {
      return (
        <input
          type="text"
          value={value || ''}
          onChange={(e) => handleCellChange(asset.id, 'code', e.target.value)}
          className="inline-input"
          placeholder="代码"
        />
      );
    }
    if (fieldKey === 'business_line_id') {
      return (
        <select
          value={value || ''}
          onChange={(e) => handleCellChange(asset.id, 'business_line_id', e.target.value)}
          className="inline-input"
          required={isEditing}
          style={isEditing && !value ? { borderColor: '#ff4d4f' } : {}}
        >
          <option value="">请选择业务线（必填）</option>
          {businessLines.map(bl => (
            <option key={bl.id} value={bl.id}>{bl.name}</option>
          ))}
        </select>
      );
    }
    if (fieldKey === 'expiry_date') {
      return (
        <input
          type="date"
          value={value || ''}
          onChange={(e) => handleCellChange(asset.id, 'expiry_date', e.target.value)}
          className="inline-input"
        />
      );
    }
    if (fieldKey === 'cost') {
      return (
        <input
          type="number"
          step="0.01"
          value={value || ''}
          onChange={(e) => handleCellChange(asset.id, 'cost', e.target.value)}
          className="inline-input"
          placeholder="0.00"
        />
      );
    }
    if (fieldKey === 'status') {
      return (
        <select
          value={value || 'active'}
          onChange={(e) => handleCellChange(asset.id, 'status', e.target.value)}
          className="inline-input"
        >
          <option value="active">启用</option>
          <option value="inactive">禁用</option>
        </select>
      );
    }
    if (field) {
      // 自定义字段
      switch (field.field_type) {
        case 'textarea':
          return (
            <textarea
              value={value || ''}
              onChange={(e) => handleCellChange(asset.id, field.field_code, e.target.value)}
              className="inline-input"
              rows={2}
              placeholder={field.field_name}
            />
          );
        case 'number':
          return (
            <input
              type="number"
              value={value || ''}
              onChange={(e) => handleCellChange(asset.id, field.field_code, e.target.value)}
              className="inline-input"
              placeholder={field.field_name}
            />
          );
        case 'date':
          return (
            <input
              type="date"
              value={value || ''}
              onChange={(e) => handleCellChange(asset.id, field.field_code, e.target.value)}
              className="inline-input"
            />
          );
        case 'select':
          // 使用缓存的选项或手动选项
          const cacheKey = `${field.id || field.field_code}_${field.options?.source || 'manual'}`;
          const selectOptions = fieldOptionsCache[cacheKey] || field.options?.items || [];
          const isLoading = fieldOptionsLoading[cacheKey];
          const isMultiple = field.options?.multiple || false;
          
          // 不再在渲染时触发加载，由 useEffect 统一处理
          if (isLoading) {
            return <select className="inline-input" disabled><option>加载中...</option></select>;
          }
          
          // 将选项转换为 Ant Design Select 需要的格式
          const selectOptionsForAntd = selectOptions.map((option) => {
            const optValue = typeof option === 'string' ? option : option.value;
            const optLabel = typeof option === 'string' ? option : (option.label || option.value);
            return { value: optValue, label: optLabel };
          });
          
          if (isMultiple) {
            // 处理多选：确保value是数组格式
            let selectedValues: string[] = [];
            if (value) {
              if (Array.isArray(value)) {
                selectedValues = value;
              } else if (typeof value === 'string') {
                // 如果是字符串，尝试按逗号分割，或者作为单个值
                selectedValues = value.includes(',') ? value.split(',').map(v => v.trim()) : [value];
              } else {
                selectedValues = [String(value)];
              }
            }
            
            return (
              <Select
                mode="multiple"
                value={selectedValues}
                onChange={(selected) => {
                  handleCellChange(asset.id, field.field_code, selected);
                }}
                placeholder="请选择"
                options={selectOptionsForAntd}
                style={{ width: '100%' }}
                allowClear
                showSearch
                filterOption={(input, option) =>
                  (option?.label ?? '').toLowerCase().includes(input.toLowerCase())
                }
              />
            );
          } else {
            return (
              <Select
                value={value || undefined}
                onChange={(selected) => handleCellChange(asset.id, field.field_code, selected)}
                placeholder="请选择"
                options={selectOptionsForAntd}
                style={{ width: '100%' }}
                allowClear
                showSearch
                filterOption={(input, option) =>
                  (option?.label ?? '').toLowerCase().includes(input.toLowerCase())
                }
              />
            );
          }
        default:
          return (
            <input
              type="text"
              value={value || ''}
              onChange={(e) => handleCellChange(asset.id, field.field_code, e.target.value)}
              className="inline-input"
              placeholder={field.field_name}
            />
          );
      }
    }
    return value || '-';
  };

  const renderAssetRows = (assetsList: Asset[], level: number = 0): React.ReactElement[] => {
    return assetsList.map((asset, index) => {
      const hasChildren = asset.children && asset.children.length > 0;
      const isExpanded = expandedRows.has(asset.id);
      
      return (
        <React.Fragment key={asset.id}>
          <tr className={editingRowId === asset.id ? 'editing-row' : ''} style={{ backgroundColor: level > 0 ? '#fafafa' : 'white' }}>
            <td>
              <div style={{ display: 'flex', alignItems: 'center', gap: '4px', paddingLeft: `${level * 20}px` }}>
                {hasChildren ? (
                  <span
                    onClick={() => toggleExpand(asset.id)}
                    style={{ cursor: 'pointer', userSelect: 'none', fontSize: '12px', width: '16px', display: 'inline-block' }}
                  >
                    {isExpanded ? '▼' : '▶'}
                  </span>
                ) : (
                  <span style={{ width: '16px', display: 'inline-block' }}></span>
                )}
                <span>{index + 1}</span>
              </div>
            </td>
            <td className="editable-cell">
              <div style={{ paddingLeft: `${level * 20}px`, display: 'block', width: '100%' }}>
                {renderCellInput(asset, null, 'name')}
              </div>
            </td>
            {fields.map(field => (
              <td key={field.id || field.field_code} className="editable-cell">
                {renderCellInput(asset, field, field.field_code)}
              </td>
            ))}
            <td className="editable-cell">
              {renderCellInput(asset, null, 'status')}
            </td>
            <td>
              {editingRowId === asset.id ? (
                <div className="action-buttons">
                  <button
                    className="btn btn-small btn-primary"
                    onClick={() => handleSaveRow(asset.id)}
                  >
                    保存
                  </button>
                  <button
                    className="btn btn-small btn-secondary"
                    onClick={() => handleCancelEdit(asset.id)}
                  >
                    取消
                  </button>
                </div>
              ) : (
                <div className="action-buttons">
                  <button
                    className="btn btn-small btn-primary"
                    onClick={() => handleAddNewRow(asset.id)}
                    style={{ fontSize: '11px', padding: '2px 6px' }}
                    title="新增子行"
                  >
                    +子
                  </button>
                  <button
                    className="btn btn-small btn-edit"
                    onClick={() => {
                      setEditingRowId(asset.id);
                      if (!rowData[asset.id]) {
                        setRowData({
                          ...rowData,
                          [asset.id]: {
                            name: asset.name,
                            code: asset.code || '',
                            business_line_id: asset.business_line_id || '',
                            expiry_date: asset.expiry_date || '',
                            cost: asset.cost || '',
                            status: asset.status,
                            parent_id: asset.parent_id || '',
                            ...asset.custom_fields,
                          },
                        });
                      }
                    }}
                  >
                    编辑
                  </button>
                  <button
                    className="btn btn-small btn-delete"
                    onClick={() => setDeleteConfirm(asset.id)}
                  >
                    删除
                  </button>
                </div>
              )}
            </td>
          </tr>
          {isExpanded && hasChildren && asset.children && renderAssetRows(asset.children, level + 1)}
        </React.Fragment>
      );
    });
  };

  const handleCloseAssetModal = () => {
    setIsAssetModalOpen(false);
    setEditingAsset(null);
    setAssetFormData({});
  };

  const handleAssetSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setError('');
      
      // 验证必填字段：业务线
      if (!assetFormData.business_line_id) {
        setError('业务线是必填项，请选择业务线');
        return;
      }

      const customFields: Record<string, any> = {};
      fields.forEach(field => {
        if (assetFormData[field.field_code] !== undefined) {
          customFields[field.field_code] = assetFormData[field.field_code];
        }
      });

      const assetData = {
        asset_type_id: selectedAssetTypeId,
        asset_template_id: selectedTemplateId,
        name: assetFormData.name,
        code: assetFormData.code || undefined,
        business_line_id: assetFormData.business_line_id,
        expiry_date: assetFormData.expiry_date || undefined,
        cost: assetFormData.cost ? parseFloat(assetFormData.cost) : undefined,
        custom_fields: customFields,
      };

      if (editingAsset) {
        await assetsService.update(editingAsset.id, assetData);
      } else {
        await assetsService.create(assetData);
      }
      
      handleCloseAssetModal();
      loadAssets(selectedTemplateId);
    } catch (err: any) {
      setError(err.response?.data?.message || err.message || '操作失败');
    }
  };

  const handleDeleteAsset = async (id: string) => {
    try {
      setError('');
      await assetsService.delete(id);
      setDeleteConfirm(null);
      loadAssets(selectedTemplateId);
    } catch (err: any) {
      setError(err.response?.data?.message || err.message || '删除失败');
    }
  };

  const handleOpenFieldModal = async () => {
    await loadFields(selectedTemplateId);
    setIsFieldModalOpen(true);
  };

  const handleCloseFieldModal = () => {
    setIsFieldModalOpen(false);
  };

  const handleFieldSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setError('');
      const template = templates.find(t => t.id === selectedTemplateId);
      if (!template) return;

      // 保存字段
      if (fields.length > 0) {
        const oldFieldsData = await assetFieldsService.getByTemplate(selectedTemplateId);
        const oldFields = Array.isArray(oldFieldsData) ? (oldFieldsData as unknown as AssetField[]) : [];
        
        // 删除已移除的字段
        for (const oldField of oldFields) {
          if (oldField.id && !fields.find(f => f.id === oldField.id)) {
            await assetFieldsService.delete(oldField.id);
          }
        }
        
        // 创建或更新字段
        for (let i = 0; i < fields.length; i++) {
          const field = { 
            ...fields[i], 
            asset_template_id: selectedTemplateId, 
            display_order: i,
          };
          delete (field as any).asset_type_id;
          
          if (field.id) {
            await assetFieldsService.update(field.id, field);
          } else {
            await assetFieldsService.create(field);
          }
        }
      }
      
      handleCloseFieldModal();
      await loadFields(selectedTemplateId);
    } catch (err: any) {
      setError(err.response?.data?.message || err.message || '操作失败');
    }
  };

  const addField = () => {
    setFields([...fields, {
      asset_template_id: selectedTemplateId,
      field_name: '',
      field_code: '',
      field_type: 'text',
      is_required: false,
      display_order: fields.length,
    }]);
  };

  const removeField = (index: number) => {
    setFields(fields.filter((_, i) => i !== index).map((f, i) => ({ ...f, display_order: i })));
  };

  const updateField = (index: number, updates: Partial<AssetField>) => {
    const newFields = [...fields];
    newFields[index] = { ...newFields[index], ...updates };
    if (updates.field_name && !updates.field_code) {
      newFields[index].field_code = updates.field_name
        .toLowerCase()
        .replace(/\s+/g, '_')
        .replace(/[^a-z0-9_]/g, '');
    }
    setFields(newFields);
  };

  const renderFieldInput = (field: AssetField) => {
    const value = assetFormData[field.field_code] || '';
    
    switch (field.field_type) {
      case 'textarea':
        return (
          <textarea
            value={value}
            onChange={(e) => setAssetFormData({ ...assetFormData, [field.field_code]: e.target.value })}
            required={field.is_required}
            rows={3}
          />
        );
      case 'number':
        return (
          <input
            type="number"
            value={value}
            onChange={(e) => setAssetFormData({ ...assetFormData, [field.field_code]: e.target.value })}
            required={field.is_required}
          />
        );
      case 'date':
        return (
          <input
            type="date"
            value={value}
            onChange={(e) => setAssetFormData({ ...assetFormData, [field.field_code]: e.target.value })}
            required={field.is_required}
          />
        );
      default:
        return (
          <input
            type="text"
            value={value}
            onChange={(e) => setAssetFormData({ ...assetFormData, [field.field_code]: e.target.value })}
            required={field.is_required}
          />
        );
    }
  };

  return (
    <div className="assets-page">
      <div className="page-header">
      <h1>资产管理</h1>
        <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
          <select
            value={selectedAssetTypeId}
            onChange={(e) => setSelectedAssetTypeId(e.target.value)}
            style={{ padding: '8px 12px', borderRadius: '4px', border: '1px solid #d9d9d9' }}
          >
            <option value="">选择资产类型</option>
            {assetTypes.map(type => (
              <option key={type.id} value={type.id}>{type.name}</option>
            ))}
          </select>
          
          {selectedAssetTypeId && (
            <select
              value={selectedTemplateId}
              onChange={(e) => setSelectedTemplateId(e.target.value)}
              style={{ padding: '8px 12px', borderRadius: '4px', border: '1px solid #d9d9d9' }}
            >
              <option value="">选择表格</option>
              {templates.map(template => (
                <option key={template.id} value={template.id}>{template.name}</option>
              ))}
            </select>
          )}

          {selectedTemplateId && (
            <>
              <button
                type="button"
                className="btn btn-primary"
                onClick={() => {
                  console.log('Button clicked');
                  handleAddNewRow();
                }}
                style={{ cursor: 'pointer' }}
              >
                + 新增行
              </button>
              <button
                className="btn btn-secondary"
                onClick={handleOpenFieldModal}
              >
                编辑表头
              </button>
            </>
          )}
        </div>
      </div>

      {error && <div className="error-message">{error}</div>}

      {!selectedAssetTypeId ? (
        <div className="empty-state" style={{ padding: '60px', textAlign: 'center', color: '#999' }}>
          <p>请先选择资产类型</p>
        </div>
      ) : !selectedTemplateId ? (
        <div className="empty-state" style={{ padding: '60px', textAlign: 'center', color: '#999' }}>
          <p>请选择要查看的表格</p>
        </div>
      ) : loading ? (
        <div className="loading">加载中...</div>
      ) : (
        <>
          {/* 表格描述 */}
          {selectedTemplateId && (
            <div style={{ 
              marginBottom: '16px', 
              padding: '12px 16px', 
              backgroundColor: '#f5f5f5', 
              borderRadius: '4px',
              border: '1px solid #e8e8e8'
            }}>
              {isEditingDescription ? (
                <div>
                  <textarea
                    value={templateDescription}
                    onChange={(e) => setTemplateDescription(e.target.value)}
                    onBlur={() => handleUpdateTemplateDescription(templateDescription)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' && e.ctrlKey) {
                        handleUpdateTemplateDescription(templateDescription);
                      } else if (e.key === 'Escape') {
                        setIsEditingDescription(false);
                        loadTemplateDescription(selectedTemplateId);
                      }
                    }}
                    style={{
                      width: '100%',
                      minHeight: '60px',
                      padding: '8px',
                      border: '1px solid #d9d9d9',
                      borderRadius: '4px',
                      fontSize: '14px',
                      fontFamily: 'inherit',
                      resize: 'vertical',
                    }}
                    autoFocus
                    placeholder="请输入表格描述..."
                  />
                  <div style={{ marginTop: '8px', fontSize: '12px', color: '#999' }}>
                    按 Ctrl+Enter 保存，Esc 取消
                  </div>
                </div>
              ) : (
                <div 
                  onClick={() => setIsEditingDescription(true)}
                  style={{
                    cursor: 'pointer',
                    color: templateDescription ? '#333' : '#999',
                    minHeight: '20px',
                    padding: '4px',
                    borderRadius: '4px',
                    transition: 'background-color 0.2s',
                  }}
                  onMouseEnter={(e) => {
                    if (!templateDescription) {
                      e.currentTarget.style.backgroundColor = '#f0f0f0';
                    }
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.backgroundColor = 'transparent';
                  }}
                >
                  {templateDescription || '点击添加表格描述...'}
                </div>
              )}
            </div>
          )}
          
          <div className="table-container">
            <table className="data-table">
            <thead>
              <tr>
                <th>序号</th>
                <th>名称</th>
                {fields.map(field => (
                  <th key={field.id || field.field_code}>{field.field_name}</th>
                ))}
                <th>状态</th>
                <th>操作</th>
              </tr>
            </thead>
            <tbody>
              {assets.length === 0 ? (
                <tr>
                  <td colSpan={fields.length + 3} className="empty-state">
                    暂无数据，点击"新增资产"创建第一条记录
                  </td>
                </tr>
              ) : (
                <>
                  {renderAssetRows(assets, 0)}
                </>
              )}
            </tbody>
          </table>
        </div>
        </>
      )}

      {/* 创建/编辑资产模态框 */}
      {isAssetModalOpen && selectedTemplateId && (
        <div className="modal-overlay" onClick={handleCloseAssetModal}>
          <div className="modal-content modal-large" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>{editingAsset ? '编辑资产' : '新增资产'}</h2>
              <button className="modal-close" onClick={handleCloseAssetModal}>
                ×
              </button>
            </div>
            <form onSubmit={handleAssetSubmit} className="modal-form">
              <div className="form-group">
                <label>
                  名称 <span className="required">*</span>
                </label>
                <input
                  type="text"
                  value={assetFormData.name || ''}
                  onChange={(e) => setAssetFormData({ ...assetFormData, name: e.target.value })}
                  required
                />
              </div>

              <div className="form-group">
                <label>代码</label>
                <input
                  type="text"
                  value={assetFormData.code || ''}
                  onChange={(e) => setAssetFormData({ ...assetFormData, code: e.target.value })}
                />
              </div>

              <div className="form-group">
                <label>
                  业务线 <span className="required">*</span>
                </label>
                <select
                  value={assetFormData.business_line_id || ''}
                  onChange={(e) => setAssetFormData({ ...assetFormData, business_line_id: e.target.value })}
                  required
                >
                  <option value="">请选择</option>
                  {businessLines.map(bl => (
                    <option key={bl.id} value={bl.id}>{bl.name}</option>
                  ))}
                </select>
              </div>

              <div className="form-group">
                <label>到期日期</label>
                <input
                  type="date"
                  value={assetFormData.expiry_date || ''}
                  onChange={(e) => setAssetFormData({ ...assetFormData, expiry_date: e.target.value })}
                />
              </div>

              <div className="form-group">
                <label>成本</label>
                <input
                  type="number"
                  step="0.01"
                  value={assetFormData.cost || ''}
                  onChange={(e) => setAssetFormData({ ...assetFormData, cost: e.target.value })}
                />
              </div>

              {/* 动态字段 */}
              {fields.map(field => (
                <div key={field.id || field.field_code} className="form-group">
                  <label>
                    {field.field_name}
                    {field.is_required && <span className="required">*</span>}
                  </label>
                  {renderFieldInput(field)}
                </div>
              ))}

              <div className="modal-actions">
                <button type="button" className="btn btn-secondary" onClick={handleCloseAssetModal}>
                  取消
                </button>
                <button type="submit" className="btn btn-primary">
                  {editingAsset ? '保存' : '创建'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 编辑表头字段模态框 */}
      {isFieldModalOpen && selectedTemplateId && (
        <div className="modal-overlay" onClick={handleCloseFieldModal}>
          <div className="modal-content modal-large" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>编辑表头字段</h2>
              <button className="modal-close" onClick={handleCloseFieldModal}>
                ×
              </button>
            </div>
            <form onSubmit={handleFieldSubmit} className="modal-form">
              <div className="form-group">
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
                  <label style={{ marginBottom: 0 }}>字段配置</label>
                  <button
                    type="button"
                    className="btn btn-small btn-primary"
                    onClick={addField}
                  >
                    + 添加字段
                  </button>
                </div>
                
                {fields.length === 0 ? (
                  <div style={{ padding: '20px', textAlign: 'center', color: '#999', border: '1px dashed #ddd', borderRadius: '4px' }}>
                    暂无字段，点击"添加字段"开始配置
                  </div>
                ) : (
                  <div className="fields-table-container">
                    <table className="fields-table">
                      <thead>
                        <tr>
                          <th style={{ width: '20%' }}>字段名称</th>
                          <th style={{ width: '15%' }}>字段代码</th>
                          <th style={{ width: '12%' }}>字段类型</th>
                          <th style={{ width: '8%' }}>必填</th>
                          <th style={{ width: '10%' }}>默认值</th>
                          <th style={{ width: '25%' }}>说明</th>
                          <th style={{ width: '10%' }}>操作</th>
                        </tr>
                      </thead>
                      <tbody>
                        {fields.map((field, index) => (
                          <tr key={index}>
                            <td>
                              <input
                                type="text"
                                value={field.field_name}
                                onChange={(e) => updateField(index, { field_name: e.target.value })}
                                placeholder="如：域名地址"
                                style={{ width: '100%', padding: '6px' }}
                              />
                            </td>
                            <td>
                              <input
                                type="text"
                                value={field.field_code}
                                onChange={(e) => updateField(index, { field_code: e.target.value })}
                                placeholder="自动生成"
                                style={{ width: '100%', padding: '6px' }}
                              />
                            </td>
                            <td>
                              <select
                                value={field.field_type}
                                onChange={(e) => updateField(index, { field_type: e.target.value as any })}
                                style={{ width: '100%', padding: '6px' }}
                              >
                                <option value="text">文本</option>
                                <option value="number">数字</option>
                                <option value="date">日期</option>
                                <option value="url">URL</option>
                                <option value="email">邮箱</option>
                                <option value="textarea">多行文本</option>
                                <option value="select">下拉选择</option>
                              </select>
                            </td>
                            <td style={{ textAlign: 'center' }}>
                              <input
                                type="checkbox"
                                checked={field.is_required}
                                onChange={(e) => updateField(index, { is_required: e.target.checked })}
                              />
                            </td>
                            <td>
                              <input
                                type="text"
                                value={field.default_value || ''}
                                onChange={(e) => updateField(index, { default_value: e.target.value })}
                                placeholder="可选"
                                style={{ width: '100%', padding: '6px' }}
                              />
                            </td>
                            <td>
                              <input
                                type="text"
                                value={field.validation_rule?.description || ''}
                                onChange={(e) => updateField(index, { 
                                  validation_rule: { ...field.validation_rule, description: e.target.value }
                                })}
                                placeholder="字段说明"
                                style={{ width: '100%', padding: '6px' }}
                              />
                            </td>
                            <td style={{ textAlign: 'center' }}>
                              <button
                                type="button"
                                className="btn btn-small btn-delete"
                                onClick={() => removeField(index)}
                              >
                                删除
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>

              <div className="modal-actions">
                <button type="button" className="btn btn-secondary" onClick={handleCloseFieldModal}>
                  取消
                </button>
                <button type="submit" className="btn btn-primary">
                  保存
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 删除确认模态框 */}
      {deleteConfirm && (
        <div className="modal-overlay" onClick={() => setDeleteConfirm(null)}>
          <div className="modal-content modal-small" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>确认删除</h2>
              <button className="modal-close" onClick={() => setDeleteConfirm(null)}>
                ×
              </button>
            </div>
            <div className="modal-body">
              <p>确定要删除这条资产记录吗？此操作不可恢复。</p>
            </div>
            <div className="modal-actions">
              <button
                type="button"
                className="btn btn-secondary"
                onClick={() => setDeleteConfirm(null)}
              >
                取消
              </button>
              <button
                type="button"
                className="btn btn-danger"
                onClick={() => handleDeleteAsset(deleteConfirm)}
              >
                确认删除
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Assets;
