import { useState, useEffect } from 'react';
import { Select } from 'antd';
import { applicationsService, type Application } from '../services/applications.service';
import { approvalsService, type Approval } from '../services/approvals.service';
import { assetTypesService } from '../services/asset-types.service';
import { assetTemplatesService, type AssetTemplate } from '../services/asset-templates.service';
import { assetFieldsService, type AssetField } from '../services/asset-fields.service';
import { usersService } from '../services/users.service';
import { businessLinesService, type BusinessLine } from '../services/business-lines.service';
import api from '../services/api';
import './Applications.css';

type TabType = 'my-applications' | 'pending' | 'processed';

const Applications = () => {
  const [activeTab, setActiveTab] = useState<TabType>('my-applications');
  const [applications, setApplications] = useState<Application[]>([]);
  const [approvals, setApprovals] = useState<Approval[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isApprovalModalOpen, setIsApprovalModalOpen] = useState(false);
  const [selectedApproval, setSelectedApproval] = useState<Approval | null>(null);
  const [approvalFormData, setApprovalFormData] = useState<Record<string, any>>({});
  const [assetTypes, setAssetTypes] = useState<any[]>([]);
  const [templates, setTemplates] = useState<AssetTemplate[]>([]);
  const [templateFields, setTemplateFields] = useState<AssetField[]>([]);
  const [users, setUsers] = useState<any[]>([]);
  const [businessLines, setBusinessLines] = useState<BusinessLine[]>([]);
  const [fieldMaps, setFieldMaps] = useState<Record<string, Record<string, string>>>({}); // templateId -> {fieldCode: fieldName}
  const [fieldOptionsCache, setFieldOptionsCache] = useState<Record<string, Array<{ value: string; label: string }>>>({});
  const [fieldOptionsLoading, setFieldOptionsLoading] = useState<Record<string, boolean>>({});
  
  // 下拉框 loading 状态
  const [assetTypesLoading, setAssetTypesLoading] = useState(false);
  const [templatesLoading, setTemplatesLoading] = useState(false);
  const [usersLoading, setUsersLoading] = useState(false);
  const [businessLinesLoading, setBusinessLinesLoading] = useState(false);
  
  // 弹窗提交 loading 状态
  const [applicationSubmitLoading, setApplicationSubmitLoading] = useState(false);
  const [approvalSubmitLoading, setApprovalSubmitLoading] = useState(false);
  const [formData, setFormData] = useState<any>({
    asset_type_id: '',
    asset_template_id: '',
    business_line_id: '',
    owner_id: '', // 资源所有者，默认是申请人，但可以指定他人
    approver_id: '',
    application_data: {},
  });

  useEffect(() => {
    loadAssetTypes();
    loadUsers();
    loadBusinessLines();
    loadData();
  }, [activeTab]);

  // 预加载 select 字段的选项
  useEffect(() => {
    const loadOptionsForSelectFields = async () => {
      const selectFields = templateFields.filter(f => f.field_type === 'select');
      for (const field of selectFields) {
        const cacheKey = `${field.id || field.field_code}_${field.options?.source || 'manual'}`;
        if (fieldOptionsCache[cacheKey] || fieldOptionsLoading[cacheKey]) {
          continue; // 已经加载过或正在加载
        }

        setFieldOptionsLoading(prev => ({ ...prev, [cacheKey]: true }));
        try {
          const options = await loadFieldOptions(field);
          setFieldOptionsCache(prev => ({ ...prev, [cacheKey]: options }));
        } catch (err) {
          console.error(`加载字段选项失败 (${field.field_name}):`, err);
        } finally {
          setFieldOptionsLoading(prev => ({ ...prev, [cacheKey]: false }));
        }
      }
    };

    if (templateFields.length > 0) {
      loadOptionsForSelectFields();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [templateFields]);

  // 加载字段选项（从API或内置枚举）
  const loadFieldOptions = async (field: AssetField) => {
    const cacheKey = `${field.id || field.field_code}_${field.options?.source || 'manual'}`;
    if (fieldOptionsCache[cacheKey]) {
      return fieldOptionsCache[cacheKey];
    }

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
        return items;
      }
    } catch (err) {
      console.error(`加载字段选项失败 (${field.field_name}):`, err);
    }

    // 手动添加的选项
    return field.options?.items || [];
  };

  const loadAssetTypes = async () => {
    try {
      setAssetTypesLoading(true);
      const data = await assetTypesService.getAll();
      setAssetTypes(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error('加载资产类型失败:', err);
    } finally {
      setAssetTypesLoading(false);
    }
  };

  const loadUsers = async () => {
    try {
      setUsersLoading(true);
      const data = await usersService.getAll();
      setUsers(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error('加载用户失败:', err);
    } finally {
      setUsersLoading(false);
    }
  };

  const loadBusinessLines = async () => {
    try {
      setBusinessLinesLoading(true);
      const data = await businessLinesService.getAll();
      setBusinessLines(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error('加载业务线失败:', err);
    } finally {
      setBusinessLinesLoading(false);
    }
  };

  const loadData = async () => {
    try {
      setLoading(true);
      setError('');
      if (activeTab === 'my-applications') {
        const data = await applicationsService.getAll(true);
        const apps = Array.isArray(data) ? data : [];
        setApplications(apps);
        // 加载所有申请的字段映射
        await loadFieldMapsForApplications(apps);
      } else if (activeTab === 'pending') {
        const data = await approvalsService.getMyPending();
        const approvs = Array.isArray(data) ? data : [];
        setApprovals(approvs);
        // 加载所有审批的字段映射
        await loadFieldMapsForApprovals(approvs);
      } else if (activeTab === 'processed') {
        const data = await approvalsService.getMyProcessed();
        const approvs = Array.isArray(data) ? data : [];
        setApprovals(approvs);
        // 加载所有审批的字段映射
        await loadFieldMapsForApprovals(approvs);
      }
    } catch (err: any) {
      setError(err.response?.data?.message || err.message || '加载失败');
    } finally {
      setLoading(false);
    }
  };

  const loadFieldMapsForApplications = async (apps: Application[]) => {
    const templateIds = new Set<string>();
    apps.forEach(app => {
      if (app.asset_template_id) {
        templateIds.add(app.asset_template_id);
      }
    });

    const newFieldMaps: Record<string, Record<string, string>> = { ...fieldMaps };
    for (const templateId of templateIds) {
      if (!newFieldMaps[templateId]) {
        try {
          const fields = await assetFieldsService.getByTemplate(templateId);
          const fieldMap: Record<string, string> = {};
          (Array.isArray(fields) ? fields : []).forEach((field: AssetField) => {
            fieldMap[field.field_code] = field.field_name;
          });
          newFieldMaps[templateId] = fieldMap;
        } catch (err) {
          console.error(`加载模板 ${templateId} 的字段失败:`, err);
        }
      }
    }
    setFieldMaps(newFieldMaps);
  };

  const loadFieldMapsForApprovals = async (approvs: Approval[]) => {
    const templateIds = new Set<string>();
    approvs.forEach(approv => {
      if (approv.application?.asset_template_id) {
        templateIds.add(approv.application.asset_template_id);
      }
    });

    const newFieldMaps: Record<string, Record<string, string>> = { ...fieldMaps };
    for (const templateId of templateIds) {
      if (!newFieldMaps[templateId]) {
        try {
          const fields = await assetFieldsService.getByTemplate(templateId);
          const fieldMap: Record<string, string> = {};
          (Array.isArray(fields) ? fields : []).forEach((field: AssetField) => {
            fieldMap[field.field_code] = field.field_name;
          });
          newFieldMaps[templateId] = fieldMap;
        } catch (err) {
          console.error(`加载模板 ${templateId} 的字段失败:`, err);
        }
      }
    }
    setFieldMaps(newFieldMaps);
  };

  const getFieldName = (templateId: string | undefined, fieldCode: string): string => {
    if (!templateId || !fieldMaps[templateId]) {
      return fieldCode; // 如果找不到映射，返回字段代码
    }
    return fieldMaps[templateId][fieldCode] || fieldCode;
  };

  const loadTemplates = async (assetTypeId: string) => {
    try {
      setTemplatesLoading(true);
      const data = await assetTemplatesService.getAll(assetTypeId);
      setTemplates(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error('加载模板失败:', err);
      setTemplates([]);
    } finally {
      setTemplatesLoading(false);
    }
  };

  const loadTemplateFields = async (templateId: string) => {
    try {
      const data = await assetFieldsService.getByTemplate(templateId);
      const fields = Array.isArray(data) ? (data as unknown as AssetField[]) : [];
      setTemplateFields(fields);
      
      // 初始化表单数据
      const initialData: Record<string, any> = {};
      fields.forEach(field => {
        if (field.require_in_application) {
          // 如果是多选字段，初始化为空数组
          if (field.field_type === 'select' && field.options?.multiple) {
            initialData[field.field_code] = [];
          } else {
            initialData[field.field_code] = field.default_value || '';
          }
        }
      });
      setFormData((prev: any) => ({
        ...prev,
        application_data: initialData,
      }));
    } catch (err) {
      console.error('加载字段失败:', err);
      setTemplateFields([]);
    }
  };

  const handleCreateApplication = () => {
    setFormData({
      asset_type_id: '',
      asset_template_id: '',
      business_line_id: '',
      owner_id: '', // 默认空，表示使用申请人作为所有者
      approver_id: '',
      application_data: {},
    });
    setTemplates([]);
    setTemplateFields([]);
    setIsModalOpen(true);
  };

  const handleAssetTypeChange = (assetTypeId: string) => {
    setFormData((prev: any) => ({
      ...prev,
      asset_type_id: assetTypeId,
      asset_template_id: '',
      application_data: {},
    }));
    setTemplates([]);
    setTemplateFields([]);
    if (assetTypeId) {
      loadTemplates(assetTypeId);
    }
  };

  const handleTemplateChange = (templateId: string) => {
    setFormData((prev: any) => ({
      ...prev,
      asset_template_id: templateId,
      application_data: {},
    }));
    setTemplateFields([]);
    if (templateId) {
      loadTemplateFields(templateId);
    }
  };

  const renderFieldInput = (field: AssetField) => {
    // 对于多选字段，初始值应该是数组；对于单选字段，初始值应该是字符串
    const defaultValue = field.field_type === 'select' && field.options?.multiple ? [] : '';
    const value = formData.application_data?.[field.field_code] ?? defaultValue;
    
    switch (field.field_type) {
      case 'textarea':
        return (
          <textarea
            value={value}
            onChange={(e) => setFormData({
              ...formData,
              application_data: { ...formData.application_data, [field.field_code]: e.target.value }
            })}
            required={field.require_in_application}
            rows={3}
            placeholder={field.field_name}
          />
        );
      case 'number':
        return (
          <input
            type="number"
            value={value}
            onChange={(e) => setFormData({
              ...formData,
              application_data: { ...formData.application_data, [field.field_code]: e.target.value }
            })}
            required={field.require_in_application}
            placeholder={field.field_name}
          />
        );
      case 'date':
        return (
          <input
            type="date"
            value={value}
            onChange={(e) => setFormData({
              ...formData,
              application_data: { ...formData.application_data, [field.field_code]: e.target.value }
            })}
            required={field.require_in_application}
          />
        );
      case 'select':
        // 使用缓存的选项或手动选项
        const cacheKey = `${field.id || field.field_code}_${field.options?.source || 'manual'}`;
        const selectOptions = fieldOptionsCache[cacheKey] || field.options?.items || [];
        const isLoading = fieldOptionsLoading[cacheKey];
        const isMultiple = field.options?.multiple || false;
        
        if (isLoading) {
          return <select disabled><option>加载中...</option></select>;
        }
        
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
          
          // 将选项转换为 Ant Design Select 需要的格式
          const selectOptionsForAntd = selectOptions.map((option) => {
            const optValue = typeof option === 'string' ? option : option.value;
            const optLabel = typeof option === 'string' ? option : (option.label || option.value);
            return { value: optValue, label: optLabel };
          });
          
          return (
            <Select
              mode="multiple"
              value={selectedValues}
              onChange={(selected) => {
                setFormData({
                  ...formData,
                  application_data: { ...formData.application_data, [field.field_code]: selected }
                });
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
          // 将选项转换为 Ant Design Select 需要的格式
          const selectOptionsForAntd = selectOptions.map((option) => {
            const optValue = typeof option === 'string' ? option : option.value;
            const optLabel = typeof option === 'string' ? option : (option.label || option.value);
            return { value: optValue, label: optLabel };
          });
          
          return (
            <Select
              value={value || undefined}
              onChange={(selected) => {
                setFormData({
                  ...formData,
                  application_data: { ...formData.application_data, [field.field_code]: selected }
                });
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
        }
      default:
        return (
          <input
            type="text"
            value={value}
            onChange={(e) => setFormData({
              ...formData,
              application_data: { ...formData.application_data, [field.field_code]: e.target.value }
            })}
            required={field.require_in_application}
            placeholder={field.field_name}
          />
        );
    }
  };

  const handleSubmitApplication = async (e: React.FormEvent) => {
    e.preventDefault();
    if (applicationSubmitLoading) return;
    
    try {
      setApplicationSubmitLoading(true);
      setError('');
      
      // 验证必填字段：业务线
      if (!formData.business_line_id) {
        setError('请选择业务线');
        return;
      }

      // 验证必填字段：处理人
      if (!formData.approver_id) {
        setError('请指定处理人');
        return;
      }
      
      // 验证模板字段必填项
      for (const field of templateFields) {
        if (field.require_in_application && !formData.application_data[field.field_code]) {
          setError(`${field.field_name}不能为空`);
          return;
        }
      }

      // 将所有者ID放入application_data中，如果不指定则使用申请人（后端处理）
      const applicationData = {
        ...formData.application_data,
        owner_id: formData.owner_id || undefined, // 如果不指定，后端会使用申请人ID
      };

      // 创建申请
      const application = await applicationsService.create({
        asset_type_id: formData.asset_type_id,
        asset_template_id: formData.asset_template_id,
        business_line_id: formData.business_line_id,
        owner_id: formData.owner_id, // 如果指定了所有者，传递到后端
        approver_id: formData.approver_id,
        application_data: applicationData,
      });
      
      // 创建处理记录
      if (formData.approver_id && application) {
        await approvalsService.create({
          application_id: (application as any).id,
          approver_id: formData.approver_id,
          status: 'pending',
        });
      }
      
      setIsModalOpen(false);
      loadData();
    } catch (err: any) {
      setError(err.response?.data?.message || err.message || '提交失败');
    } finally {
      setApplicationSubmitLoading(false);
    }
  };

  const handleOpenApprovalModal = async (approval: Approval) => {
    setSelectedApproval(approval);
    // 初始化表单数据为申请者预填的数据
    setApprovalFormData(approval.application?.application_data || {});
    setIsApprovalModalOpen(true);
    
    // 加载模板字段配置
    if (approval.application?.asset_template_id) {
      await loadTemplateFields(approval.application.asset_template_id);
      // 预加载字段选项
      const fields = await assetFieldsService.getByTemplate(approval.application.asset_template_id);
      const fieldsList = Array.isArray(fields) ? fields : [];
      for (const field of fieldsList) {
        if (field.field_type === 'select') {
          await loadFieldOptions(field);
        }
      }
    }
  };

  const handleCancelApplication = async (applicationId: string) => {
    if (!confirm('确定要撤回该申请吗？撤回后无法恢复。')) {
      return;
    }

    try {
      setError('');
      await applicationsService.cancel(applicationId);
      loadData();
    } catch (err: any) {
      setError(err.response?.data?.message || err.message || '撤回失败');
    }
  };

  const handleApprove = async (approvalId: string, status: 'approved' | 'rejected', comments?: string, applicationData?: Record<string, any>) => {
    if (approvalSubmitLoading) return;
    
    try {
      setApprovalSubmitLoading(true);
      setError('');
      // 更新处理状态，如果提供了补充的数据，一起传递
      const updateData: any = { status, comments };
      if (applicationData) {
        updateData.application_data = applicationData;
      }
      await approvalsService.update(approvalId, updateData);
      
      setIsApprovalModalOpen(false);
      setSelectedApproval(null);
      setApprovalFormData({});
      loadData();
    } catch (err: any) {
      setError(err.response?.data?.message || err.message || '操作失败');
    } finally {
      setApprovalSubmitLoading(false);
    }
  };

  const renderApprovalFieldInput = (field: AssetField) => {
    // 对于多选字段，初始值应该是数组；对于单选字段，初始值应该是字符串
    const defaultValue = field.field_type === 'select' && field.options?.multiple ? [] : '';
    const value = approvalFormData[field.field_code] ?? defaultValue;
    
    switch (field.field_type) {
      case 'textarea':
        return (
          <textarea
            value={value}
            onChange={(e) => setApprovalFormData({
              ...approvalFormData,
              [field.field_code]: e.target.value
            })}
            rows={3}
            placeholder={field.field_name}
          />
        );
      case 'number':
        return (
          <input
            type="number"
            value={value}
            onChange={(e) => setApprovalFormData({
              ...approvalFormData,
              [field.field_code]: e.target.value
            })}
            placeholder={field.field_name}
          />
        );
      case 'date':
        return (
          <input
            type="date"
            value={value}
            onChange={(e) => setApprovalFormData({
              ...approvalFormData,
              [field.field_code]: e.target.value
            })}
            placeholder={field.field_name}
          />
        );
      case 'select':
        const cacheKey = `${field.id || field.field_code}_${field.options?.source || 'manual'}`;
        const options = fieldOptionsCache[cacheKey] || [];
        const isLoading = fieldOptionsLoading[cacheKey];
        
        if (isLoading) {
          return <Select disabled placeholder="加载中..." style={{ width: '100%' }} />;
        }
        
        // 将选项转换为 Ant Design Select 需要的格式
        const selectOptionsForAntd = options.map((opt) => ({
          value: opt.value,
          label: opt.label || opt.value,
        }));
        
        if (field.options?.multiple) {
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
                setApprovalFormData({
                  ...approvalFormData,
                  [field.field_code]: selected
                });
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
              onChange={(selected) => {
                setApprovalFormData({
                  ...approvalFormData,
                  [field.field_code]: selected
                });
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
        }
      default:
        return (
          <input
            type="text"
            value={value}
            onChange={(e) => setApprovalFormData({
              ...approvalFormData,
              [field.field_code]: e.target.value
            })}
            placeholder={field.field_name}
          />
        );
    }
  };

  return (
    <div className="applications-page">
      <div className="page-header">
        <h1>申请管理</h1>
        <button className="btn btn-primary" onClick={handleCreateApplication}>
          + 申请资源
        </button>
      </div>

      <div className="tabs">
        <button
          className={`tab ${activeTab === 'my-applications' ? 'active' : ''}`}
          onClick={() => setActiveTab('my-applications')}
        >
          我的申请
        </button>
        <button
          className={`tab ${activeTab === 'pending' ? 'active' : ''}`}
          onClick={() => setActiveTab('pending')}
        >
          待我处理
        </button>
        <button
          className={`tab ${activeTab === 'processed' ? 'active' : ''}`}
          onClick={() => setActiveTab('processed')}
        >
          我已处理
        </button>
      </div>

      {error && <div className="error-message">{error}</div>}

      {loading ? (
        <div className="loading">加载中...</div>
      ) : (
        <div className="table-container">
          <table className="data-table">
            <thead>
              {activeTab === 'my-applications' ? (
                <tr>
                  <th>序号</th>
                  <th>资产类型</th>
                  <th>申请数据</th>
                  <th>状态</th>
                  <th>处理人</th>
                  <th>创建时间</th>
                  <th>操作</th>
                </tr>
              ) : (
                <tr>
                  <th>序号</th>
                  <th>申请人</th>
                  <th>资产类型</th>
                  <th>申请数据</th>
                  <th>处理状态</th>
                  <th>处理时间</th>
                  <th>操作</th>
                </tr>
              )}
            </thead>
            <tbody>
              {activeTab === 'my-applications' ? (
                applications.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="empty-state">
                      暂无申请
                    </td>
                  </tr>
                ) : (
                  applications.map((app, index) => (
                    <tr key={app.id}>
                      <td>{index + 1}</td>
                      <td>{app.assetType?.name || '-'}</td>
                      <td>
                        <div className="application-data">
                          {Object.entries(app.application_data || {}).map(([key, value]) => {
                            // 过滤掉系统字段，不应该显示给用户
                            if (key === 'owner_id') {
                              // 将 owner_id 转换为用户名称显示
                              const owner = users.find(u => u.id === value);
                              if (owner) {
                                return (
                                  <div key={key}>
                                    <strong>负责人:</strong> {owner.name}
                                  </div>
                                );
                              }
                              return null; // 如果找不到用户，不显示
                            }
                            // description 是特殊字段，直接显示
                            if (key === 'description') {
                              return (
                                <div key={key}>
                                  <strong>申请说明:</strong> {String(value)}
                                </div>
                              );
                            }
                            // 其他字段使用字段名称
                            const fieldName = getFieldName(app.asset_template_id, key);
                            return (
                              <div key={key}>
                                <strong>{fieldName}:</strong> {String(value)}
                              </div>
                            );
                          })}
                        </div>
                      </td>
                      <td>
                        <span className={`status-badge ${
                          app.status === 'approved' ? 'approved' :
                          app.status === 'rejected' ? 'rejected' :
                          app.status === 'cancelled' ? 'cancelled' : 'pending'
                        }`}>
                          {app.status === 'approved' ? '已通过' :
                           app.status === 'rejected' ? '已拒绝' :
                           app.status === 'cancelled' ? '已撤回' : '待处理'}
                        </span>
                      </td>
                      <td>
                        {app.approvals && app.approvals.length > 0
                          ? app.approvals.map(a => a.approver?.name || '-').join(', ')
                          : '-'}
                      </td>
                      <td>{new Date(app.created_at).toLocaleString('zh-CN')}</td>
                      <td>
                        {app.status === 'pending' ? (
                          <button
                            className="btn btn-small btn-secondary"
                            onClick={() => handleCancelApplication(app.id)}
                          >
                            撤回
                          </button>
                        ) : '-'}
                      </td>
                    </tr>
                  ))
                )
              ) : (
                approvals.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="empty-state">
                      {activeTab === 'pending' ? '暂无待处理' : '暂无已处理'}
                    </td>
                  </tr>
                ) : (
                  approvals.map((approval, index) => (
                    <tr key={approval.id}>
                      <td>{index + 1}</td>
                      <td>{approval.application?.applicant?.name || '-'}</td>
                      <td>{approval.application?.assetType?.name || '-'}</td>
                      <td>
                        <div className="application-data">
                          {Object.entries(approval.application?.application_data || {}).map(([key, value]) => {
                            // 过滤掉系统字段，不应该显示给用户
                            if (key === 'owner_id') {
                              // 将 owner_id 转换为用户名称显示
                              const owner = users.find(u => u.id === value);
                              if (owner) {
                                return (
                                  <div key={key}>
                                    <strong>负责人:</strong> {owner.name}
                                  </div>
                                );
                              }
                              return null; // 如果找不到用户，不显示
                            }
                            // description 是特殊字段，直接显示
                            if (key === 'description') {
                              return (
                                <div key={key}>
                                  <strong>申请说明:</strong> {String(value)}
                                </div>
                              );
                            }
                            // 其他字段使用字段名称
                            const fieldName = getFieldName(approval.application?.asset_template_id, key);
                            return (
                              <div key={key}>
                                <strong>{fieldName}:</strong> {String(value)}
                              </div>
                            );
                          })}
                        </div>
                      </td>
                      <td>
                        <span className={`status-badge ${
                          approval.status === 'approved' ? 'approved' :
                          approval.status === 'rejected' ? 'rejected' : 'pending'
                        }`}>
                          {approval.status === 'approved' ? '已通过' :
                           approval.status === 'rejected' ? '已拒绝' : '待处理'}
                        </span>
                      </td>
                      <td>{new Date(approval.created_at).toLocaleString('zh-CN')}</td>
                      <td>
                        {approval.status === 'pending' ? (
                          <div className="action-buttons">
                            <button
                              className="btn btn-small btn-primary"
                              onClick={() => handleOpenApprovalModal(approval)}
                            >
                              处理
                            </button>
                          </div>
                        ) : (
                          <span>{approval.comments || '-'}</span>
                        )}
                      </td>
                    </tr>
                  ))
                )
              )}
            </tbody>
          </table>
        </div>
      )}

      {/* 申请资源模态框 */}
      {isModalOpen && (
        <div className="modal-overlay" onClick={() => setIsModalOpen(false)}>
          <div className="modal-content modal-large" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>申请资源</h2>
              <button className="modal-close" onClick={() => setIsModalOpen(false)}>
                ×
              </button>
            </div>
            <form onSubmit={handleSubmitApplication} className="modal-form">
              <div className="form-group">
                <label>
                  资产类型 <span className="required">*</span>
                </label>
                <select
                  value={formData.asset_type_id || ''}
                  onChange={(e) => handleAssetTypeChange(e.target.value)}
                  disabled={assetTypesLoading}
                  required
                >
                  <option value="">{assetTypesLoading ? '加载中...' : '请选择'}</option>
                  {assetTypes.map(type => (
                    <option key={type.id} value={type.id}>{type.name}</option>
                  ))}
                </select>
              </div>

              {formData.asset_type_id && (
                <div className="form-group">
                  <label>
                    用途 <span className="required">*</span>
                  </label>
                  <select
                    value={formData.asset_template_id || ''}
                    onChange={(e) => handleTemplateChange(e.target.value)}
                    disabled={templatesLoading}
                    required
                  >
                    <option value="">{templatesLoading ? '加载中...' : '请选择用途'}</option>
                    {templates.map(template => (
                      <option key={template.id} value={template.id}>
                        {template.purpose || template.name}
                      </option>
                    ))}
                  </select>
                  <small style={{ color: '#999', fontSize: '12px', marginTop: '4px', display: 'block' }}>
                    选择用途后，将根据表格配置显示需要填写的字段
                  </small>
                </div>
              )}

              <div className="form-group">
                <label>
                  业务线 <span className="required">*</span>
                </label>
                <select
                  value={formData.business_line_id || ''}
                  onChange={(e) => setFormData({ ...formData, business_line_id: e.target.value })}
                  disabled={businessLinesLoading}
                  required
                >
                  <option value="">{businessLinesLoading ? '加载中...' : '请选择业务线'}</option>
                  {businessLines.map(bl => (
                    <option key={bl.id} value={bl.id}>{bl.name}</option>
                  ))}
                </select>
                <small style={{ color: '#999', fontSize: '12px', marginTop: '4px', display: 'block' }}>
                  资源必须归属于某个业务线
                </small>
              </div>

              <div className="form-group">
                <label>
                  资源所有者 <span className="required">*</span>
                </label>
                <select
                  value={formData.owner_id || ''}
                  onChange={(e) => setFormData({ ...formData, owner_id: e.target.value })}
                  disabled={usersLoading}
                  required
                >
                  <option value="">{usersLoading ? '加载中...' : '默认：当前用户（申请人）'}</option>
                  {users.map(user => (
                    <option key={user.id} value={user.id}>{user.name} ({user.email})</option>
                  ))}
                </select>
                <small style={{ color: '#999', fontSize: '12px', marginTop: '4px', display: 'block' }}>
                  如果不选择，将默认使用申请人作为资源所有者
                </small>
              </div>

              {formData.asset_template_id && templateFields.length > 0 && (
                <div className="form-group">
                  <label style={{ marginBottom: '12px' }}>申请信息</label>
                  <div style={{ border: '1px solid #e8e8e8', borderRadius: '4px', padding: '16px', backgroundColor: '#fafafa' }}>
                    {templateFields
                      .filter(field => field.require_in_application)
                      .map(field => (
                        <div key={field.id || field.field_code} className="form-group" style={{ marginBottom: '16px' }}>
                          <label style={{ marginBottom: '8px' }}>
                            {field.field_name}
                            {field.require_in_application && <span className="required">*</span>}
                          </label>
                          {renderFieldInput(field)}
                        </div>
                      ))}
                    {templateFields.filter(field => field.require_in_application).length === 0 && (
                      <div style={{ textAlign: 'center', padding: '20px', color: '#999' }}>
                        该表格没有需要预填的字段
                      </div>
                    )}
                  </div>
                </div>
              )}

              <div className="form-group">
                <label>
                  指定处理人 <span className="required">*</span>
                </label>
                <select
                  value={formData.approver_id || ''}
                  onChange={(e) => setFormData({ ...formData, approver_id: e.target.value })}
                  disabled={usersLoading}
                  required
                >
                  <option value="">{usersLoading ? '加载中...' : '请选择'}</option>
                  {users.map(user => (
                    <option key={user.id} value={user.id}>{user.name} ({user.email})</option>
                  ))}
                </select>
              </div>

              <div className="form-group">
                <label>申请说明</label>
                <textarea
                  rows={3}
                  value={formData.application_data?.description || ''}
                  onChange={(e) => setFormData({ 
                    ...formData, 
                    application_data: { ...formData.application_data, description: e.target.value }
                  })}
                  placeholder="请说明申请资源的用途和需求（可选）"
                />
              </div>

              <div className="modal-actions">
                <button type="button" className="btn btn-secondary" onClick={() => setIsModalOpen(false)}>
                  取消
                </button>
                <button type="submit" className="btn btn-primary" disabled={applicationSubmitLoading}>
                  {applicationSubmitLoading ? '提交中...' : '提交申请'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 处理模态框 */}
      {isApprovalModalOpen && selectedApproval && (
        <div className="modal-overlay" onClick={() => setIsApprovalModalOpen(false)}>
          <div className="modal-content modal-large" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>处理申请</h2>
              <button className="modal-close" onClick={() => setIsApprovalModalOpen(false)}>×</button>
            </div>
            <div className="modal-body">
              <div style={{ marginBottom: '20px', padding: '12px', background: '#f5f5f5', borderRadius: '4px' }}>
                <div><strong>申请人:</strong> {selectedApproval.application?.applicant?.name || '-'}</div>
                <div><strong>资产类型:</strong> {selectedApproval.application?.assetType?.name || '-'}</div>
                <div><strong>业务线:</strong> {selectedApproval.application?.businessLine?.name || '-'}</div>
                {selectedApproval.application?.application_data?.description && (
                  <div><strong>申请说明:</strong> {selectedApproval.application.application_data.description}</div>
                )}
              </div>

              <form onSubmit={(e) => {
                e.preventDefault();
                const form = e.target as HTMLFormElement;
                const comments = (form.querySelector('[name="comments"]') as HTMLTextAreaElement)?.value || '';
                const submitButton = (e.nativeEvent as any).submitter;
                const status = submitButton?.value === 'reject' ? 'rejected' : 'approved';
                handleApprove(selectedApproval.id, status, comments, approvalFormData);
              }}>
                <div style={{ marginBottom: '20px' }}>
                  <h3 style={{ marginBottom: '12px', fontSize: '16px', fontWeight: 600 }}>补充/修改申请数据</h3>
                  <p style={{ marginBottom: '16px', color: '#666', fontSize: '14px' }}>
                    以下字段为申请者预填的数据，您可以补充或修改这些数据。处理通过后，将使用合并后的数据创建资产。
                  </p>
                  
                  {templateFields.length > 0 ? (
                    templateFields.map(field => (
                      <div key={field.id} className="form-group">
                        <label>
                          {field.field_name}
                          {field.is_required && <span className="required">*</span>}
                        </label>
                        {renderApprovalFieldInput(field)}
                        {field.description && (
                          <small style={{ color: '#999', display: 'block', marginTop: '4px' }}>
                            {field.description}
                          </small>
                        )}
                      </div>
                    ))
                  ) : (
                    <div style={{ padding: '20px', textAlign: 'center', color: '#999' }}>
                      该模板暂无字段配置
                    </div>
                  )}
                </div>

                <div className="form-group">
                  <label>处理意见</label>
                  <textarea
                    name="comments"
                    rows={3}
                    placeholder="请输入处理意见（可选）"
                  />
                </div>

                <div className="modal-actions">
                  <button
                    type="button"
                    className="btn btn-secondary"
                    onClick={() => {
                      setIsApprovalModalOpen(false);
                      setSelectedApproval(null);
                      setApprovalFormData({});
                    }}
                  >
                    取消
                  </button>
                  <button
                    type="submit"
                    name="action"
                    value="reject"
                    className="btn btn-delete"
                    disabled={approvalSubmitLoading}
                  >
                    {approvalSubmitLoading ? '处理中...' : '拒绝'}
                  </button>
                  <button
                    type="submit"
                    name="action"
                    value="approve"
                    className="btn btn-primary"
                    disabled={approvalSubmitLoading}
                  >
                    {approvalSubmitLoading ? '处理中...' : '通过'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Applications;

