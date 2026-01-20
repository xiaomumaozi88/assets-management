import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import * as XLSX from 'xlsx';
import { assetTypesService } from '../services/asset-types.service';
import { assetTemplatesService, type AssetTemplate } from '../services/asset-templates.service';
import { assetFieldsService } from '../services/asset-fields.service';
import { assetsService } from '../services/assets.service';
import { businessLinesService } from '../services/business-lines.service';
import { enumValuesService, type EnumValue } from '../services/enum-values.service';
import { usersService } from '../services/users.service';
import './AssetTypes.css';

type AssetField = {
  id?: string;
  asset_template_id?: string;
  asset_type_id?: string;
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

interface AssetType {
  id: string;
  name: string;
  code: string;
  category?: string;
  description?: string;
  status: boolean;
  sort_order: number;
  created_at: string;
  updated_at: string;
}

interface AssetTypeFormData {
  name: string;
  code: string;
  category?: string;
  description?: string;
  status?: boolean;
  sort_order?: number;
}

const AssetTypes = () => {
  const [assetTypes, setAssetTypes] = useState<AssetType[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<AssetType | null>(null);
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);
  const [expandedTypes, setExpandedTypes] = useState<Set<string>>(new Set());
  const [templates, setTemplates] = useState<Record<string, AssetTemplate[]>>({});
  const [templateModalOpen, setTemplateModalOpen] = useState(false);
  const [currentAssetTypeId, setCurrentAssetTypeId] = useState<string | null>(null);
  const [editingTemplate, setEditingTemplate] = useState<AssetTemplate | null>(null);
  const [templateFields, setTemplateFields] = useState<AssetField[]>([]);
  const [importMode, setImportMode] = useState<'create' | 'import'>('create');
  const [parsedExcelData, setParsedExcelData] = useState<{ headers: string[]; rows: any[][] } | null>(null);
  const [businessLines, setBusinessLines] = useState<any[]>([]);
  const [enumValues, setEnumValues] = useState<Record<string, EnumValue[]>>({});
  const [activeTab, setActiveTab] = useState<Record<string, 'templates' | 'enums'>>({});
  const [enumModalOpen, setEnumModalOpen] = useState(false);
  const [editingEnum, setEditingEnum] = useState<EnumValue | null>(null);
  const [enumFormData, setEnumFormData] = useState<{ name: string; code: string; values: Array<{ value: string; label: string }>; description: string }>({ name: '', code: '', values: [], description: '' });
  const [fieldEnumMapping, setFieldEnumMapping] = useState<Record<string, string>>({}); // field_code -> enum_id
  const [enumMatchedData, setEnumMatchedData] = useState<Record<string, Record<number, boolean>>>({}); // field_code -> { rowIndex: isMatched }
  const [defaultOwnerId, setDefaultOwnerId] = useState<string>(''); // 默认负责人ID（系统管理员）
  const [users, setUsers] = useState<Array<{ id: string; name: string; email: string; role?: string }>>([]); // 用户列表
  const [ownerFieldHeader, setOwnerFieldHeader] = useState<string>(''); // 选择的作为owner_id来源的字段（表头名称）
  const [adminUser, setAdminUser] = useState<{ id: string; name: string; email: string } | null>(null); // 系统管理员用户
  
  // 弹窗提交 loading 状态
  const [assetTypeSubmitLoading, setAssetTypeSubmitLoading] = useState(false);
  const [templateSubmitLoading, setTemplateSubmitLoading] = useState(false);
  const [enumSubmitLoading, setEnumSubmitLoading] = useState(false);

  const { register, handleSubmit, reset, formState: { errors } } = useForm<AssetTypeFormData>();

  useEffect(() => {
    loadAssetTypes();
    loadBusinessLines();
    loadUsers();
  }, []);

  const loadUsers = async () => {
    try {
      const data = await usersService.getAll();
      const usersList = Array.isArray(data) ? data : [];
      setUsers(usersList);
      
      // 查找系统管理员
      const admin = usersList.find((u: any) => u.role === 'admin');
      if (admin) {
        setAdminUser(admin);
        // 如果没有设置默认负责人，设置为系统管理员
        if (!defaultOwnerId) {
          setDefaultOwnerId(admin.id);
        }
      }
    } catch (err) {
      console.error('加载用户列表失败:', err);
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

  const loadAssetTypes = async () => {
    try {
      setLoading(true);
      setError('');
      const data = await assetTypesService.getAll();
      setAssetTypes(Array.isArray(data) ? data : []);
    } catch (err: any) {
      setError(err.response?.data?.message || err.message || '加载失败');
    } finally {
      setLoading(false);
    }
  };

  const loadTemplates = async (assetTypeId: string) => {
    try {
      const data = await assetTemplatesService.getAll(assetTypeId);
      setTemplates(prev => ({ ...prev, [assetTypeId]: Array.isArray(data) ? data : [] }));
    } catch (err) {
      console.error('加载模板失败:', err);
    }
  };

  const loadEnumValues = async (assetTypeId: string) => {
    try {
      const [assetTypeEnums, globalEnums] = await Promise.all([
        enumValuesService.getByAssetType(assetTypeId),
        enumValuesService.getGlobal(),
      ]);
      setEnumValues(prev => ({
        ...prev,
        [assetTypeId]: [
          ...(Array.isArray(assetTypeEnums) ? assetTypeEnums : []),
          ...(Array.isArray(globalEnums) ? globalEnums : []),
        ],
      }));
    } catch (err) {
      console.error('加载枚举值失败:', err);
    }
  };

  const toggleExpand = (assetTypeId: string) => {
    const newExpanded = new Set(expandedTypes);
    if (newExpanded.has(assetTypeId)) {
      newExpanded.delete(assetTypeId);
    } else {
      newExpanded.add(assetTypeId);
      if (!templates[assetTypeId]) {
        loadTemplates(assetTypeId);
      }
      if (!enumValues[assetTypeId]) {
        loadEnumValues(assetTypeId);
      }
      if (!activeTab[assetTypeId]) {
        setActiveTab(prev => ({ ...prev, [assetTypeId]: 'templates' }));
      }
    }
    setExpandedTypes(newExpanded);
  };

  const handleOpenModal = (item?: AssetType) => {
    if (item) {
      setEditingItem(item);
      reset({
        name: item.name,
        code: item.code,
        category: item.category || '',
        description: item.description || '',
        status: item.status,
        sort_order: item.sort_order,
      });
    } else {
      setEditingItem(null);
      reset({
        name: '',
        code: '',
        category: '',
        description: '',
        status: true,
        sort_order: 0,
      });
    }
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setEditingItem(null);
    reset();
  };

  const handleOpenTemplateModal = async (assetTypeId: string, template?: AssetTemplate) => {
    setCurrentAssetTypeId(assetTypeId);
    if (template) {
      setEditingTemplate(template);
      try {
        const fieldsData = await assetFieldsService.getByTemplate(template.id);
        setTemplateFields(Array.isArray(fieldsData) ? (fieldsData as unknown as AssetField[]) : []);
      } catch (err) {
        setTemplateFields([]);
      }
    } else {
      setEditingTemplate(null);
      setTemplateFields([]);
    }
    setTemplateModalOpen(true);
  };

  const handleCloseTemplateModal = () => {
    setTemplateModalOpen(false);
    setCurrentAssetTypeId(null);
    setEditingTemplate(null);
    setTemplateFields([]);
    setImportMode('create');
    setParsedExcelData(null);
    setOwnerFieldHeader(''); // 重置负责人字段选择
  };

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // 检查文件类型
    const validTypes = [
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      'application/vnd.ms-excel',
      'text/csv'
    ];
    if (!validTypes.includes(file.type) && !file.name.match(/\.(xlsx|xls|csv)$/i)) {
      setError('请选择Excel文件（.xlsx, .xls）或CSV文件');
      return;
    }

    setError('');

    try {
      // 读取文件
      const arrayBuffer = await file.arrayBuffer();
      const workbook = XLSX.read(arrayBuffer, { type: 'array' });
      const sheetName = workbook.SheetNames[0];
      const worksheet = workbook.Sheets[sheetName];
      
      // 转换为JSON数组
      const data = XLSX.utils.sheet_to_json(worksheet, { header: 1, defval: '' });
      
      if (data.length === 0) {
        throw new Error('Excel文件为空');
      }
      
      // 第一行作为表头
      const headers = (data[0] as any[]).map((h: any) => String(h || '').trim()).filter(h => h);
      
      if (headers.length === 0) {
        throw new Error('Excel文件没有有效的表头');
      }
      
      // 其余行作为数据（仅用于预览，实际导入时再处理）
      const rows = (data.slice(1) as any[][]).map(row => 
        row.map(cell => String(cell || '').trim())
      ).filter(row => row.some(cell => cell)); // 过滤空行
      
      setParsedExcelData({ headers, rows });
      setOwnerFieldHeader(''); // 重置负责人字段选择（因为表头可能已变化）
      
      // 自动生成字段配置
      const fields: AssetField[] = headers.map((header, index) => {
        // 生成字段代码（从表头名称生成）
        const fieldCode = header
          .toLowerCase()
          .replace(/\s+/g, '_')
          .replace(/[^a-z0-9_]/g, '') || `field_${index}`;
        
        return {
          field_name: header,
          field_code: fieldCode,
          field_type: 'text', // 默认为文本类型
          is_required: false,
          require_in_application: false,
          is_primary: false,
          display_order: index,
        };
      });
      
      setTemplateFields(fields);
      
      // 设置表格名称为文件名（去掉扩展名）
      const fileName = file.name.replace(/\.(xlsx|xls|csv)$/i, '');
      // 使用setTimeout确保DOM已更新
      setTimeout(() => {
        const nameInput = document.querySelector('input[name="name"]') as HTMLInputElement;
        if (nameInput) {
          nameInput.value = fileName;
        }
      }, 100);
    } catch (err: any) {
      setError(err.message || '解析Excel文件失败');
      setParsedExcelData(null);
    }
  };

  const handleTemplateSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (templateSubmitLoading) return;
    
    const formData = new FormData(e.currentTarget);
    const templateData = {
      asset_type_id: currentAssetTypeId!,
      name: formData.get('name') as string,
      code: formData.get('code') as string || undefined,
      purpose: formData.get('purpose') as string || undefined,
      description: formData.get('description') as string || undefined,
      status: formData.get('status') === 'on',
      sort_order: parseInt(formData.get('sort_order') as string) || 0,
    };

    try {
      setTemplateSubmitLoading(true);
      setError('');
      let templateId: string;
      
      if (editingTemplate) {
        await assetTemplatesService.update(editingTemplate.id, templateData);
        templateId = editingTemplate.id;
      } else {
        const created = await assetTemplatesService.create(templateData);
        templateId = (created as any).id;
      }
      
      if (!templateId) {
        throw new Error('模板ID获取失败，无法继续');
      }
      
      // 保存字段
      if (templateFields.length > 0) {
        // 先删除旧字段（编辑时）
        if (editingTemplate) {
          const oldFieldsData = await assetFieldsService.getByTemplate(templateId);
          const oldFields = Array.isArray(oldFieldsData) ? (oldFieldsData as unknown as AssetField[]) : [];
          for (const oldField of oldFields) {
            if (oldField.id && !templateFields.find(f => f.id === oldField.id)) {
              await assetFieldsService.delete(oldField.id);
            }
          }
        }
        
        // 创建或更新字段
        for (let i = 0; i < templateFields.length; i++) {
          const field = templateFields[i];
          
          // 确保 field_code 不为空
          let fieldCode = field.field_code;
          if (!fieldCode || fieldCode.trim() === '') {
            if (field.field_name) {
              fieldCode = field.field_name
                .toLowerCase()
                .replace(/\s+/g, '_')
                .replace(/[^a-z0-9_]/g, '');
            } else {
              fieldCode = `field_${i}`;
            }
          }
          
          const fieldData: any = { 
            asset_template_id: templateId, 
            field_name: field.field_name,
            field_code: fieldCode,
            field_type: field.field_type,
            is_required: field.is_required || false,
            require_in_application: field.require_in_application || false,
            is_primary: field.is_primary || false,
            display_order: i,
          };
          
          // 只添加有值的可选字段
          if (field.default_value) {
            fieldData.default_value = field.default_value;
          }
          if (field.validation_rule) {
            fieldData.validation_rule = field.validation_rule;
          }
          if (field.options) {
            fieldData.options = field.options;
          }
          
          if (field.id) {
            await assetFieldsService.update(field.id, fieldData);
          } else {
            await assetFieldsService.create(fieldData);
          }
        }
      }
      
      // 如果是导入模式且有数据，导入资产数据
      if (importMode === 'import' && parsedExcelData && parsedExcelData.rows.length > 0) {
        try {
          // 获取当前用户ID（从localStorage或API）
          const token = localStorage.getItem('token');
          let currentUserId = '';
          if (token) {
            try {
              const payload = JSON.parse(atob(token.split('.')[1]));
              currentUserId = payload.sub;
            } catch (e) {
              console.error('无法解析token:', e);
            }
          }
          
          // 获取字段映射（表头 -> 字段代码）
          const fieldMap: Record<string, string> = {};
          templateFields.forEach(field => {
            const headerIndex = parsedExcelData.headers.findIndex(h => {
              const normalizedHeader = h.toLowerCase().replace(/\s+/g, '_').replace(/[^a-z0-9_]/g, '');
              const normalizedFieldCode = field.field_code.toLowerCase();
              return normalizedHeader === normalizedFieldCode || h === field.field_name;
            });
            if (headerIndex >= 0) {
              fieldMap[parsedExcelData.headers[headerIndex]] = field.field_code;
            }
          });
          
          // 使用已加载的用户列表（在组件级别已加载）
          
          // 查找用户选择的负责人字段索引
          let ownerFieldIndex = -1;
          if (ownerFieldHeader) {
            ownerFieldIndex = parsedExcelData.headers.findIndex(h => h === ownerFieldHeader);
          }
          
          // 确定默认负责人ID（系统管理员或当前用户）
          const fallbackOwnerId = defaultOwnerId || (adminUser ? adminUser.id : currentUserId);
          
          // 导入每一行数据
          for (const row of parsedExcelData.rows) {
            const customFields: Record<string, any> = {};
            let businessLineId: string | undefined = undefined;
            
            // 将行数据映射到字段
            parsedExcelData.headers.forEach((header, index) => {
              const fieldCode = fieldMap[header];
              if (fieldCode && row[index]) {
                const value = String(row[index]).trim();
                // 如果字段是"业务线"，尝试匹配业务线ID
                if (header === '业务线' || fieldCode === 'field_1' || (templateFields.find(f => f.field_code === fieldCode && f.field_name === '业务线'))) {
                  // 尝试通过名称或代码匹配业务线
                  const matchedBusinessLine = businessLines.find(bl => 
                    bl.name === value || 
                    bl.code === value ||
                    bl.code?.toLowerCase() === value.toLowerCase()
                  );
                  if (matchedBusinessLine) {
                    businessLineId = matchedBusinessLine.id;
                    // 仍然保存到custom_fields中，以便在详细信息中显示
                    customFields[fieldCode] = value;
                  } else {
                    // 如果匹配失败，仍然保存到custom_fields
                    customFields[fieldCode] = value;
                  }
                } else {
                  customFields[fieldCode] = value;
                }
              }
            });
            
            // 尝试从Excel中获取owner_id
            let assetOwnerId = fallbackOwnerId; // 默认使用系统管理员或当前用户
            if (ownerFieldIndex >= 0 && row[ownerFieldIndex]) {
              const ownerValue = String(row[ownerFieldIndex]).trim();
              if (ownerValue) {
                // 尝试通过姓名或邮箱匹配用户
                const matchedUser = users.find(u => 
                  u.name === ownerValue || 
                  u.email === ownerValue ||
                  u.name.includes(ownerValue) ||
                  ownerValue.includes(u.name)
                );
                if (matchedUser) {
                  assetOwnerId = matchedUser.id;
                } else {
                  console.warn(`未找到匹配的用户: ${ownerValue}，使用系统管理员作为默认负责人`);
                }
              }
            }
            
            // 创建资产记录
            if (!templateId) {
              throw new Error('模板ID为空，无法创建资产');
            }
            await assetsService.create({
              asset_type_id: currentAssetTypeId!,
              asset_template_id: templateId,
              name: customFields.name || `导入资产-${Date.now()}`,
              status: 'active',
              owner_id: assetOwnerId,
              business_line_id: businessLineId,
              custom_fields: customFields,
            });
          }
        } catch (err: any) {
          console.error('导入资产数据失败:', err);
          setError(`导入资产数据失败: ${err.message || '未知错误'}`);
        }
      }
      
      handleCloseTemplateModal();
      if (currentAssetTypeId) {
        loadTemplates(currentAssetTypeId);
      }
    } catch (err: any) {
      setError(err.response?.data?.message || err.message || '操作失败');
    } finally {
      setTemplateSubmitLoading(false);
    }
  };

  const addTemplateField = () => {
    setTemplateFields([...templateFields, {
      asset_template_id: editingTemplate?.id || '',
      field_name: '',
      field_code: '',
      field_type: 'text',
      is_required: false,
      require_in_application: false,
      display_order: templateFields.length,
    }]);
  };

  const removeTemplateField = (index: number) => {
    setTemplateFields(templateFields.filter((_, i) => i !== index).map((f, i) => ({ ...f, display_order: i })));
  };

  const updateTemplateField = (index: number, updates: Partial<AssetField>) => {
    const newFields = [...templateFields];
    newFields[index] = { ...newFields[index], ...updates };
    // 自动生成 field_code（基于 field_name）
    if (updates.field_name && !updates.field_code) {
      newFields[index].field_code = updates.field_name
        .toLowerCase()
        .replace(/\s+/g, '_')
        .replace(/[^a-z0-9_]/g, '');
    }
    setTemplateFields(newFields);
  };

  const onSubmit = async (data: AssetTypeFormData) => {
    if (assetTypeSubmitLoading) return;
    
    try {
      setAssetTypeSubmitLoading(true);
      setError('');
      if (editingItem) {
        await assetTypesService.update(editingItem.id, data);
      } else {
        await assetTypesService.create(data);
      }
      handleCloseModal();
      loadAssetTypes();
    } catch (err: any) {
      setError(err.response?.data?.message || err.message || '操作失败');
    } finally {
      setAssetTypeSubmitLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    try {
      setError('');
      await assetTypesService.delete(id);
      setDeleteConfirm(null);
      loadAssetTypes();
    } catch (err: any) {
      setError(err.response?.data?.message || err.message || '删除失败');
    }
  };

  const handleDeleteTemplate = async (templateId: string, assetTypeId: string) => {
    if (!confirm('确定要删除这个模板吗？此操作不可恢复。')) {
      return;
    }
    try {
      setError('');
      await assetTemplatesService.delete(templateId);
      loadTemplates(assetTypeId);
    } catch (err: any) {
      setError(err.response?.data?.message || err.message || '删除失败');
    }
  };

  const handleToggleStatus = async (item: AssetType) => {
    try {
      setError('');
      await assetTypesService.update(item.id, { status: !item.status });
      loadAssetTypes();
    } catch (err: any) {
      setError(err.response?.data?.message || err.message || '操作失败');
    }
  };

  const handleOpenEnumModal = (assetTypeId: string, enumValue?: EnumValue) => {
    setCurrentAssetTypeId(assetTypeId);
    if (enumValue) {
      setEditingEnum(enumValue);
      setEnumFormData({
        name: enumValue.name,
        code: enumValue.code || '',
        values: enumValue.values || [],
        description: enumValue.description || '',
      });
    } else {
      setEditingEnum(null);
      setEnumFormData({ name: '', code: '', values: [], description: '' });
    }
    setEnumModalOpen(true);
  };

  const handleCloseEnumModal = () => {
    setEnumModalOpen(false);
    setEditingEnum(null);
    setEnumFormData({ name: '', code: '', values: [], description: '' });
    setCurrentAssetTypeId(null);
  };

  const handleDeleteEnum = async (enumId: string, assetTypeId: string) => {
    if (!confirm('确定要删除这个枚举值吗？此操作不可恢复。')) {
      return;
    }
    try {
      setError('');
      await enumValuesService.delete(enumId);
      loadEnumValues(assetTypeId);
    } catch (err: any) {
      setError(err.response?.data?.message || err.message || '删除失败');
    }
  };

  const handleEnumSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentAssetTypeId || enumSubmitLoading) return;
    
    try {
      setEnumSubmitLoading(true);
      setError('');
      const enumData = {
        name: enumFormData.name,
        code: enumFormData.code || undefined,
        scope: 'asset_type' as const,
        asset_type_id: currentAssetTypeId,
        values: enumFormData.values.filter(v => v.value && v.label),
        description: enumFormData.description || undefined,
        sort_order: 0,
      };
      
      if (editingEnum) {
        await enumValuesService.update(editingEnum.id, enumData);
      } else {
        await enumValuesService.create(enumData);
      }
      
      handleCloseEnumModal();
      loadEnumValues(currentAssetTypeId);
    } catch (err: any) {
      setError(err.response?.data?.message || err.message || '操作失败');
    } finally {
      setEnumSubmitLoading(false);
    }
  };

  const addEnumValue = () => {
    setEnumFormData({
      ...enumFormData,
      values: [...enumFormData.values, { value: '', label: '' }],
    });
  };

  const removeEnumValue = (index: number) => {
    setEnumFormData({
      ...enumFormData,
      values: enumFormData.values.filter((_, i) => i !== index),
    });
  };

  const updateEnumValue = (index: number, updates: Partial<{ value: string; label: string }>) => {
    const newValues = [...enumFormData.values];
    newValues[index] = { ...newValues[index], ...updates };
    setEnumFormData({ ...enumFormData, values: newValues });
  };

  // 执行枚举匹配
  const performEnumMatching = (fieldCode: string, enumIdOrType: string) => {
    if (!parsedExcelData || !currentAssetTypeId) {
      console.log('匹配条件不满足:', { parsedExcelData: !!parsedExcelData, currentAssetTypeId });
      return;
    }
    
    let enumValuesList: Array<{ value: string; label: string }> = [];
    
    // 判断是内置枚举还是资产项枚举
    if (enumIdOrType.startsWith('builtin_')) {
      // 内置枚举
      const enumType = enumIdOrType.replace('builtin_', '');
      if (enumType === 'business_lines') {
        // 业务线枚举，value使用code字段
        enumValuesList = businessLines.map(bl => ({ value: bl.code || bl.id, label: bl.name }));
        console.log('业务线枚举值:', enumValuesList);
      }
    } else {
      // 资产项枚举
      const selectedEnum = enumValues[currentAssetTypeId]?.find(ev => ev.id === enumIdOrType);
      if (!selectedEnum) {
        console.log('未找到资产项枚举:', enumIdOrType);
        return;
      }
      enumValuesList = selectedEnum.values || [];
    }
    
    if (enumValuesList.length === 0) {
      console.log('枚举值列表为空');
      return;
    }
    
    // 查找字段索引：需要匹配field_code或field_name
    let fieldIndex = -1;
    // 先找到对应的字段配置
    const field = templateFields.find(f => f.field_code === fieldCode);
    
    console.log('查找字段索引 - 字段代码:', fieldCode, '字段配置:', field);
    console.log('表头列表:', parsedExcelData.headers);
    
    for (let i = 0; i < parsedExcelData.headers.length; i++) {
      const header = parsedExcelData.headers[i];
      const normalizedHeader = header.toLowerCase().replace(/\s+/g, '_').replace(/[^a-z0-9_]/g, '');
      const normalizedFieldCode = fieldCode.toLowerCase();
      
      // 优先匹配 field_name（精确匹配）
      if (field && header === field.field_name) {
        fieldIndex = i;
        console.log(`找到匹配 - 索引: ${i}, 表头: "${header}", 匹配方式: header===field_name (精确匹配)`);
        break;
      }
      
      // 然后尝试其他匹配方式（避免空字符串匹配）
      const match1 = normalizedHeader === normalizedFieldCode && normalizedHeader !== '';
      const match2 = header === fieldCode;
      const normalizedFieldName = field ? field.field_name.toLowerCase().replace(/\s+/g, '_').replace(/[^a-z0-9_]/g, '') : '';
      const match3 = field && normalizedHeader === normalizedFieldName && normalizedHeader !== '' && normalizedFieldName !== '';
      
      if (match1 || match2 || match3) {
        fieldIndex = i;
        console.log(`找到匹配 - 索引: ${i}, 表头: "${header}", 匹配方式: ${match1 ? 'normalizedHeader===fieldCode' : match2 ? 'header===fieldCode' : 'normalizedHeader===field_name'}`);
        break;
      }
    }
    
    if (fieldIndex < 0) {
      console.log('未找到字段索引:', fieldCode, '字段配置:', field, '表头:', parsedExcelData.headers);
      // 尝试通过field_name直接查找
      if (field && field.field_name) {
        const directIndex = parsedExcelData.headers.findIndex(h => h === field.field_name || h.trim() === field.field_name);
        if (directIndex >= 0) {
          fieldIndex = directIndex;
          console.log('通过field_name直接找到索引:', fieldIndex);
        }
      }
      if (fieldIndex < 0) {
        return;
      }
    }
    
    console.log('开始匹配，字段索引:', fieldIndex, '字段代码:', fieldCode, '表头:', parsedExcelData.headers[fieldIndex]);
    
    // 创建匹配映射：主要使用value匹配
    const enumValuesMap = new Map<string, string>();
    enumValuesList.forEach(v => {
      // 主要使用value来匹配，确保trim掉空格
      if (typeof v.value === 'string') {
        const valueKey = v.value.trim().toLowerCase();
        enumValuesMap.set(valueKey, v.value);
      }
      // 也支持按label匹配（作为备选）
      if (typeof v.label === 'string') {
        const labelKey = v.label.trim().toLowerCase();
        // 只有当label和value不同时才添加label映射，避免重复
        const valueKey = (v.value?.toString().trim().toLowerCase() || '');
        if (labelKey !== valueKey) {
          enumValuesMap.set(labelKey, v.value);
        }
      }
    });
    
    console.log('枚举值映射（全部）:', Array.from(enumValuesMap.entries()));
    console.log('枚举值列表:', enumValuesList);
    
    const matchedData: Record<number, boolean> = {};
    
    parsedExcelData.rows.forEach((row, rowIndex) => {
      // 获取原始单元格值
      const rawCellValue = String(row[fieldIndex] || '');
      // 清理值：去除前后空格、换行符、制表符等所有空白字符
      const cleanedValue = rawCellValue.replace(/[\s\u00A0\u2000-\u200B\u2028\u2029\uFEFF]/g, '').trim();
      const cellValue = cleanedValue.toLowerCase();
      const isMatched = enumValuesMap.has(cellValue);
      matchedData[rowIndex] = isMatched;
      
      // 详细日志（前10行）
      if (rowIndex < 10) {
        console.log(`行${rowIndex}: 原始值="${rawCellValue}", 清理后="${cleanedValue}", 小写值="${cellValue}", 是否匹配=${isMatched}`);
        if (!isMatched) {
          // 如果没匹配上，检查是否有相似的
          const similarKeys = Array.from(enumValuesMap.keys()).filter(k => {
            const kLower = k.toLowerCase();
            return kLower.includes(cellValue) || cellValue.includes(kLower) || kLower === cellValue;
          });
          if (similarKeys.length > 0) {
            console.log(`  相似键:`, similarKeys);
          } else {
            console.log(`  所有可用键:`, Array.from(enumValuesMap.keys()));
          }
        }
      }
    });
    
    console.log('匹配结果（前10行）:', Object.keys(matchedData).slice(0, 10).map(k => `${k}:${matchedData[Number(k)]}`).join(', '));
    
    setEnumMatchedData(prev => ({
      ...prev,
      [fieldCode]: matchedData,
    }));
    
    // 更新字段映射
    setFieldEnumMapping((prev: Record<string, string>) => ({
      ...prev,
      [fieldCode]: enumIdOrType,
    }));
  };

  return (
    <div className="asset-types-page">
      <div className="page-header">
        <h1>资产项管理</h1>
        <button className="btn btn-primary" onClick={() => handleOpenModal()}>
          新增资产项
        </button>
      </div>

      {error && <div className="error-message">{error}</div>}

      {loading ? (
        <div className="loading">加载中...</div>
      ) : (
        <div className="table-container">
          <table className="data-table">
            <thead>
              <tr>
                <th style={{ width: '40px' }}></th>
                <th>序号</th>
                <th>名称</th>
                <th>代码</th>
                <th>分类</th>
                <th>描述</th>
                <th>状态</th>
                <th>排序</th>
                <th>创建时间</th>
                <th>更新时间</th>
                <th>操作</th>
              </tr>
            </thead>
            <tbody>
              {assetTypes.length === 0 ? (
                <tr>
                  <td colSpan={11} className="empty-state">
                    暂无数据
                  </td>
                </tr>
              ) : (
                assetTypes.map((item, index) => (
                  <>
                    <tr key={item.id}>
                      <td>
                        <span
                          onClick={() => toggleExpand(item.id)}
                          style={{ cursor: 'pointer', userSelect: 'none', fontSize: '12px', display: 'inline-block', width: '20px' }}
                        >
                          {expandedTypes.has(item.id) ? '▼' : '▶'}
                        </span>
                      </td>
                      <td>{index + 1}</td>
                      <td>{item.name}</td>
                      <td>{item.code}</td>
                      <td>{item.category || '-'}</td>
                      <td className="description-cell">
                        {item.description || '-'}
                      </td>
                      <td>
                        <span
                          className={`status-badge ${item.status ? 'active' : 'inactive'}`}
                          onClick={() => handleToggleStatus(item)}
                          style={{ cursor: 'pointer' }}
                        >
                          {item.status ? '启用' : '禁用'}
                        </span>
                      </td>
                      <td>{item.sort_order}</td>
                      <td>
                        {new Date(item.created_at).toLocaleString('zh-CN')}
                      </td>
                      <td>
                        {new Date(item.updated_at).toLocaleString('zh-CN')}
                      </td>
                      <td>
                        <div className="action-buttons">
                          <button
                            className="btn btn-small btn-primary"
                            onClick={() => handleOpenTemplateModal(item.id)}
                            style={{ fontSize: '11px', padding: '3px 8px' }}
                          >
                            + 新增表格
                          </button>
                          <button
                            className="btn btn-small btn-edit"
                            onClick={() => handleOpenModal(item)}
                          >
                            编辑
                          </button>
                          <button
                            className="btn btn-small btn-delete"
                            onClick={() => setDeleteConfirm(item.id)}
                          >
                            删除
                          </button>
                        </div>
                      </td>
                    </tr>
                    {expandedTypes.has(item.id) && (
                      <tr>
                        <td colSpan={11} style={{ padding: '0', backgroundColor: '#fafafa' }}>
                          <div style={{ padding: '16px 24px' }}>
                            {/* 标签页 */}
                            <div style={{ display: 'flex', gap: '8px', marginBottom: '16px', borderBottom: '1px solid #e8e8e8' }}>
                              <button
                                onClick={() => setActiveTab(prev => ({ ...prev, [item.id]: 'templates' }))}
                                style={{
                                  padding: '8px 16px',
                                  border: 'none',
                                  background: 'none',
                                  cursor: 'pointer',
                                  borderBottom: activeTab[item.id] === 'templates' ? '2px solid #1890ff' : '2px solid transparent',
                                  color: activeTab[item.id] === 'templates' ? '#1890ff' : '#666',
                                  fontWeight: activeTab[item.id] === 'templates' ? 600 : 400,
                                }}
                              >
                                管理表格
                              </button>
                              <button
                                onClick={() => setActiveTab(prev => ({ ...prev, [item.id]: 'enums' }))}
                                style={{
                                  padding: '8px 16px',
                                  border: 'none',
                                  background: 'none',
                                  cursor: 'pointer',
                                  borderBottom: activeTab[item.id] === 'enums' ? '2px solid #1890ff' : '2px solid transparent',
                                  color: activeTab[item.id] === 'enums' ? '#1890ff' : '#666',
                                  fontWeight: activeTab[item.id] === 'enums' ? 600 : 400,
                                }}
                              >
                                管理枚举值
                              </button>
                            </div>
                            
                            {/* 管理表格标签页 */}
                            {activeTab[item.id] === 'templates' && (
                              <>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
                              <h3 style={{ margin: 0, fontSize: '14px', fontWeight: 600 }}>管理表格</h3>
                              <button
                                className="btn btn-small btn-primary"
                                onClick={() => handleOpenTemplateModal(item.id)}
                              >
                                + 新增表格
                              </button>
                            </div>
                            {templates[item.id] && templates[item.id].length > 0 ? (
                              <table className="data-table" style={{ fontSize: '13px' }}>
                                <thead>
                                  <tr>
                                    <th>表格名称</th>
                                    <th>用途</th>
                                    <th>代码</th>
                                    <th>描述</th>
                                    <th>状态</th>
                                    <th>字段数</th>
                                    <th>创建时间</th>
                                    <th>操作</th>
                                  </tr>
                                </thead>
                                <tbody>
                                  {templates[item.id].map((template) => (
                                    <tr key={template.id}>
                                      <td>{template.name}</td>
                                      <td>{template.purpose || '-'}</td>
                                      <td>{template.code || '-'}</td>
                                      <td className="description-cell">{template.description || '-'}</td>
                                      <td>
                                        <span className={`status-badge ${template.status ? 'active' : 'inactive'}`}>
                                          {template.status ? '启用' : '禁用'}
                                        </span>
                                      </td>
                                      <td>{template.fields?.length || 0}</td>
                                      <td>{new Date(template.created_at).toLocaleString('zh-CN')}</td>
                                      <td>
                                        <div className="action-buttons">
                                          <button
                                            className="btn btn-small btn-edit"
                                            onClick={() => handleOpenTemplateModal(item.id, template)}
                                          >
                                            编辑
                                          </button>
                                          <button
                                            className="btn btn-small btn-delete"
                                            onClick={() => handleDeleteTemplate(template.id, item.id)}
                                          >
                                            删除
                                          </button>
                                        </div>
                                      </td>
                                    </tr>
                                  ))}
                                </tbody>
                              </table>
                            ) : (
                              <div style={{ textAlign: 'center', padding: '20px', color: '#999' }}>
                                暂无表格，点击"新增表格"创建
                              </div>
                            )}
                            </>
                            )}
                            
                            {/* 管理枚举值标签页 */}
                            {activeTab[item.id] === 'enums' && (
                              <>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
                              <h3 style={{ margin: 0, fontSize: '14px', fontWeight: 600 }}>管理枚举值</h3>
                              <button
                                className="btn btn-small btn-primary"
                                onClick={() => handleOpenEnumModal(item.id)}
                              >
                                + 新增枚举值
                              </button>
                            </div>
                            {enumValues[item.id] && enumValues[item.id].length > 0 ? (
                              <table className="data-table" style={{ fontSize: '13px' }}>
                                <thead>
                                  <tr>
                                    <th>枚举名称</th>
                                    <th>代码</th>
                                    <th>作用域</th>
                                    <th>枚举值数量</th>
                                    <th>描述</th>
                                    <th>创建时间</th>
                                    <th>操作</th>
                                  </tr>
                                </thead>
                                <tbody>
                                  {enumValues[item.id].map((enumValue) => (
                                    <tr key={enumValue.id}>
                                      <td>{enumValue.name}</td>
                                      <td>{enumValue.code || '-'}</td>
                                      <td>
                                        <span className={`status-badge ${enumValue.scope === 'global' ? 'active' : 'inactive'}`}>
                                          {enumValue.scope === 'global' ? '全局' : '资产项特定'}
                                        </span>
                                      </td>
                                      <td>{enumValue.values?.length || 0}</td>
                                      <td className="description-cell">{enumValue.description || '-'}</td>
                                      <td>{new Date(enumValue.created_at).toLocaleString('zh-CN')}</td>
                                      <td>
                                        <div className="action-buttons">
                                          <button
                                            className="btn btn-small btn-edit"
                                            onClick={() => handleOpenEnumModal(item.id, enumValue)}
                                          >
                                            编辑
                                          </button>
                                          <button
                                            className="btn btn-small btn-delete"
                                            onClick={() => handleDeleteEnum(enumValue.id, item.id)}
                                          >
                                            删除
                                          </button>
                                        </div>
                                      </td>
                                    </tr>
                                  ))}
                                </tbody>
                              </table>
                            ) : (
                              <div style={{ textAlign: 'center', padding: '20px', color: '#999' }}>
                                暂无枚举值，点击"新增枚举值"创建
                              </div>
                            )}
                            </>
                            )}
                          </div>
                        </td>
                      </tr>
                    )}
                  </>
                ))
              )}
            </tbody>
          </table>
        </div>
      )}

      {/* 创建/编辑资产类型模态框 */}
      {isModalOpen && (
        <div className="modal-overlay" onClick={handleCloseModal}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>{editingItem ? '编辑资产项' : '新增资产项'}</h2>
              <button className="modal-close" onClick={handleCloseModal}>
                ×
              </button>
            </div>
            <form onSubmit={handleSubmit(onSubmit)} className="modal-form">
              <div className="form-group">
                <label>
                  名称 <span className="required">*</span>
                </label>
                <input
                  type="text"
                  {...register('name', { required: '请输入名称' })}
                />
                {errors.name && (
                  <span className="error">{errors.name.message}</span>
                )}
              </div>

              <div className="form-group">
                <label>
                  代码 <span className="required">*</span>
                </label>
                <input
                  type="text"
                  {...register('code', { required: '请输入代码' })}
                  disabled={!!editingItem}
                />
                {errors.code && (
                  <span className="error">{errors.code.message}</span>
                )}
              </div>

              <div className="form-group">
                <label>分类</label>
                <input type="text" {...register('category')} />
              </div>

              <div className="form-group">
                <label>描述</label>
                <textarea
                  rows={3}
                  {...register('description')}
                />
              </div>

              <div className="form-group">
                <label>排序</label>
                <input
                  type="number"
                  {...register('sort_order', { valueAsNumber: true })}
                />
              </div>

              <div className="form-group">
                <label className="checkbox-label">
                  <input
                    type="checkbox"
                    {...register('status')}
                  />
                  <span>启用</span>
                </label>
              </div>

              <div className="modal-actions">
                <button type="button" className="btn btn-secondary" onClick={handleCloseModal}>
                  取消
                </button>
                <button type="submit" className="btn btn-primary" disabled={assetTypeSubmitLoading}>
                  {assetTypeSubmitLoading ? '提交中...' : (editingItem ? '保存' : '创建')}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 创建/编辑模板模态框 */}
      {templateModalOpen && (
        <div className="modal-overlay" onClick={handleCloseTemplateModal}>
          <div className="modal-content modal-large" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>{editingTemplate ? '编辑管理表格' : '新增管理表格'}</h2>
              <button className="modal-close" onClick={handleCloseTemplateModal}>
                ×
              </button>
            </div>
            
            {!editingTemplate && (
              <div style={{ padding: '16px', borderBottom: '1px solid #e8e8e8' }}>
                <div style={{ display: 'flex', gap: '12px' }}>
                  <button
                    type="button"
                    className={`btn ${importMode === 'create' ? 'btn-primary' : 'btn-secondary'}`}
                    onClick={() => {
    setImportMode('create');
    setParsedExcelData(null);
    setTemplateFields([]);
                    }}
                    style={{ flex: 1 }}
                  >
                    从头开始创建
                  </button>
                  <button
                    type="button"
                    className={`btn ${importMode === 'import' ? 'btn-primary' : 'btn-secondary'}`}
                    onClick={() => setImportMode('import')}
                    style={{ flex: 1 }}
                  >
                    从Excel导入
                  </button>
                </div>
              </div>
            )}

            {!editingTemplate && importMode === 'import' && (
              <div style={{ padding: '16px', borderBottom: '1px solid #e8e8e8' }}>
                <div className="form-group">
                  <label>
                    选择Excel文件 <span className="required">*</span>
                  </label>
                  <input
                    type="file"
                    accept=".xlsx,.xls,.csv"
                    onChange={handleFileSelect}
                    style={{ width: '100%', padding: '8px' }}
                  />
                  <small style={{ color: '#999', fontSize: '12px', marginTop: '4px', display: 'block' }}>
                    支持 .xlsx, .xls, .csv 格式。第一行将作为表头，自动生成字段配置。
                  </small>
                </div>
                
                {parsedExcelData && parsedExcelData.headers.length > 0 && (
                  <div className="form-group" style={{ marginTop: '16px' }}>
                    <label>
                      选择负责人字段
                    </label>
                    <select
                      value={ownerFieldHeader}
                      onChange={(e) => setOwnerFieldHeader(e.target.value)}
                      style={{ width: '100%', padding: '8px' }}
                    >
                      <option value="">不选择（使用系统管理员作为默认负责人）</option>
                      {parsedExcelData.headers.map((header, index) => (
                        <option key={index} value={header}>
                          {header}
                        </option>
                      ))}
                    </select>
                    <small style={{ color: '#999', fontSize: '12px', marginTop: '4px', display: 'block' }}>
                      选择Excel中的哪个字段作为负责人。系统会尝试匹配该字段的值与用户姓名或邮箱。如果未选择字段或匹配失败，将使用系统管理员作为默认负责人。
                    </small>
                  </div>
                )}
                
                {adminUser && (
                  <div className="form-group" style={{ marginTop: '16px', padding: '12px', backgroundColor: '#f5f5f5', borderRadius: '4px' }}>
                    <div style={{ fontSize: '13px', color: '#666' }}>
                      <strong>默认负责人：</strong>{adminUser.name} ({adminUser.email})
                    </div>
                    <div style={{ fontSize: '12px', color: '#999', marginTop: '4px' }}>
                      当未选择负责人字段或匹配失败时，将使用系统管理员作为资产负责人。
                    </div>
                  </div>
                )}
                
                {parsedExcelData && (
                  <div style={{ marginTop: '16px' }}>
                    <div style={{ padding: '12px', backgroundColor: '#f5f5f5', borderRadius: '4px', marginBottom: '12px' }}>
                      <div style={{ marginBottom: '8px', fontWeight: 500 }}>
                        解析结果：发现 {parsedExcelData.headers.length} 个字段，{parsedExcelData.rows.length} 行数据
                      </div>
                      <div style={{ fontSize: '12px', color: '#666' }}>
                        表头：{parsedExcelData.headers.join(', ')}
                      </div>
                    </div>
                    
                    {/* 数据预览 */}
                    {parsedExcelData.rows.length > 0 && (
                      <div style={{ marginTop: '12px' }}>
                        <div style={{ marginBottom: '8px', fontWeight: 500, fontSize: '13px' }}>数据预览（最多显示前10行）</div>
                        <div style={{ maxHeight: '300px', overflow: 'auto', border: '1px solid #e8e8e8', borderRadius: '4px' }}>
                          <table style={{ width: '100%', fontSize: '12px', borderCollapse: 'collapse' }}>
                            <thead style={{ backgroundColor: '#fafafa', position: 'sticky', top: 0 }}>
                              <tr>
                                {parsedExcelData.headers.map((header, hIndex) => {
                                  const field = templateFields.find(f => {
                                    const normalizedHeader = header.toLowerCase().replace(/\s+/g, '_').replace(/[^a-z0-9_]/g, '');
                                    return normalizedHeader === f.field_code || header === f.field_name;
                                  });
                                  const hasEnum = field && field.field_type === 'select' && (field.options?.enumId || field.options?.enumType);
                                  return (
                                    <th key={hIndex} style={{ padding: '8px', border: '1px solid #e8e8e8', textAlign: 'left', fontWeight: 500 }}>
                                      {header}
                                      {hasEnum && <span style={{ marginLeft: '4px', fontSize: '10px', color: '#1890ff' }}>📌</span>}
                                    </th>
                                  );
                                })}
                              </tr>
                            </thead>
                            <tbody>
                              {parsedExcelData.rows.slice(0, 10).map((row, rowIndex) => (
                                <tr key={rowIndex}>
                                  {parsedExcelData.headers.map((header, hIndex) => {
                                    const field = templateFields.find(f => {
                                      const normalizedHeader = header.toLowerCase().replace(/\s+/g, '_').replace(/[^a-z0-9_]/g, '');
                                      return normalizedHeader === f.field_code || header === f.field_name;
                                    });
                                    const cellValue = String(row[hIndex] || '').trim();
                                    // 检查是否匹配：支持enumId（资产项枚举）和enumType（内置枚举）
                                    const hasEnum = field && field.field_type === 'select' && (field.options?.enumId || field.options?.enumType);
                                    // 确保field存在且有field_code，且匹配结果为true
                                    const isMatched = field && field.field_code && hasEnum && enumMatchedData[field.field_code]?.[rowIndex] === true;
                                    return (
                                      <td key={hIndex} style={{ padding: '8px', border: '1px solid #e8e8e8', position: 'relative' }}>
                                        {cellValue || '-'}
                                        {isMatched && (
                                          <span style={{
                                            position: 'absolute',
                                            top: '2px',
                                            right: '2px',
                                            fontSize: '10px',
                                            backgroundColor: '#52c41a',
                                            color: 'white',
                                            borderRadius: '50%',
                                            width: '16px',
                                            height: '16px',
                                            display: 'flex',
                                            alignItems: 'center',
                                            justifyContent: 'center',
                                            fontWeight: 'bold',
                                          }} title="已匹配枚举值">✓</span>
                                        )}
                                      </td>
                                    );
                                  })}
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>
            )}

            <form onSubmit={handleTemplateSubmit} className="modal-form">
              <div className="form-group">
                <label>
                  表格名称 <span className="required">*</span>
                </label>
                <input
                  type="text"
                  name="name"
                  defaultValue={editingTemplate?.name || ''}
                  required
                />
              </div>

              <div className="form-group">
                <label>代码</label>
                <input
                  type="text"
                  name="code"
                  defaultValue={editingTemplate?.code || ''}
                />
              </div>

              <div className="form-group">
                <label>用途</label>
                <input
                  type="text"
                  name="purpose"
                  defaultValue={editingTemplate?.purpose || ''}
                  placeholder="如：数据上报、API调用等"
                />
              </div>

              <div className="form-group">
                <label>描述</label>
                <textarea
                  rows={2}
                  name="description"
                  defaultValue={editingTemplate?.description || ''}
                />
              </div>

              <div className="form-group">
                <label>排序</label>
                <input
                  type="number"
                  name="sort_order"
                  defaultValue={editingTemplate?.sort_order || 0}
                />
              </div>

              <div className="form-group">
                <label className="checkbox-label">
                  <input
                    type="checkbox"
                    name="status"
                    defaultChecked={editingTemplate?.status !== false}
                  />
                  <span>启用</span>
                </label>
              </div>

              {/* 字段配置区域 */}
              <div className="form-group">
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
                  <label style={{ marginBottom: 0 }}>字段配置</label>
                  <button
                    type="button"
                    className="btn btn-small btn-primary"
                    onClick={addTemplateField}
                  >
                    + 添加字段
                  </button>
                </div>
                
                {templateFields.length === 0 ? (
                  <div style={{ padding: '20px', textAlign: 'center', color: '#999', border: '1px dashed #ddd', borderRadius: '4px' }}>
                    暂无字段，点击"添加字段"开始配置
                  </div>
                ) : (
                  <div className="fields-table-container">
                    <table className="fields-table">
                      <thead>
                        <tr>
                          <th style={{ width: '12%' }}>字段名称</th>
                          <th style={{ width: '10%' }}>字段代码</th>
                          <th style={{ width: '9%' }}>字段类型</th>
                          <th style={{ width: '5%' }}>必填</th>
                          <th style={{ width: '5%' }}>申请必填</th>
                          <th style={{ width: '5%' }}>主要字段</th>
                          <th style={{ width: '9%' }}>默认值</th>
                          <th style={{ width: '18%' }}>说明</th>
                          <th style={{ width: '27%' }}>操作</th>
                        </tr>
                      </thead>
                      <tbody>
                        {templateFields.map((field, index) => (
                          <React.Fragment key={index}>
                            <tr>
                              <td>
                                <input
                                  type="text"
                                  value={field.field_name}
                                  onChange={(e) => updateTemplateField(index, { field_name: e.target.value })}
                                  placeholder="如：域名地址"
                                  style={{ width: '100%', padding: '6px' }}
                                />
                              </td>
                              <td>
                                <input
                                  type="text"
                                  value={field.field_code}
                                  onChange={(e) => updateTemplateField(index, { field_code: e.target.value })}
                                  placeholder="自动生成"
                                  style={{ width: '100%', padding: '6px' }}
                                />
                              </td>
                              <td>
                                <select
                                  value={field.field_type}
                                  onChange={(e) => {
                                    const newFieldType = e.target.value as any;
                                    updateTemplateField(index, { field_type: newFieldType });
                                    // 如果改为select类型，且已有枚举配置，触发匹配
                                    if (newFieldType === 'select' && importMode === 'import' && parsedExcelData && currentAssetTypeId) {
                                      // 使用当前字段的值（因为updateTemplateField会更新状态）
                                      const currentField = { ...field, field_type: newFieldType };
                                      const options = currentField.options;
                                      if (options) {
                                        if (options.enumId) {
                                          setTimeout(() => performEnumMatching(currentField.field_code, options.enumId), 0);
                                        } else if (options.enumType) {
                                          setTimeout(() => performEnumMatching(currentField.field_code, `builtin_${options.enumType}`), 0);
                                        }
                                      }
                                    }
                                  }}
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
                                  onChange={(e) => updateTemplateField(index, { is_required: e.target.checked })}
                                />
                              </td>
                              <td style={{ textAlign: 'center' }}>
                                <input
                                  type="checkbox"
                                  checked={field.require_in_application || false}
                                  onChange={(e) => updateTemplateField(index, { require_in_application: e.target.checked })}
                                />
                              </td>
                              <td style={{ textAlign: 'center' }}>
                                <input
                                  type="checkbox"
                                  checked={field.is_primary || false}
                                  onChange={(e) => updateTemplateField(index, { is_primary: e.target.checked })}
                                  title="主要字段将作为资产的描述/标题显示，可多选"
                                />
                              </td>
                              <td>
                                <input
                                  type="text"
                                  value={field.default_value || ''}
                                  onChange={(e) => updateTemplateField(index, { default_value: e.target.value })}
                                  placeholder="可选"
                                  style={{ width: '100%', padding: '6px' }}
                                />
                              </td>
                              <td>
                                <input
                                  type="text"
                                  value={field.validation_rule?.description || ''}
                                  onChange={(e) => updateTemplateField(index, { 
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
                                  onClick={() => removeTemplateField(index)}
                                >
                                  删除
                                </button>
                              </td>
                            </tr>
                            {field.field_type === 'select' && (
                              <tr key={`options-${index}`} style={{ backgroundColor: '#fafafa' }}>
                                <td colSpan={8} style={{ padding: '12px' }}>
                                  <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                                    <div style={{ display: 'flex', gap: '12px' }}>
                                      <div style={{ flex: 1 }}>
                                        <label style={{ display: 'block', marginBottom: '6px', fontSize: '12px', fontWeight: 500 }}>
                                          选择模式
                                        </label>
                                        <select
                                          value={field.options?.multiple ? 'multiple' : 'single'}
                                          onChange={(e) => updateTemplateField(index, {
                                            options: {
                                              ...field.options,
                                              multiple: e.target.value === 'multiple'
                                            }
                                          })}
                                          style={{ width: '100%', padding: '6px', fontSize: '12px' }}
                                        >
                                          <option value="single">单选</option>
                                          <option value="multiple">多选</option>
                                        </select>
                                      </div>
                                      <div style={{ flex: 1 }}>
                                        <label style={{ display: 'block', marginBottom: '6px', fontSize: '12px', fontWeight: 500 }}>
                                          选项来源
                                        </label>
                                        <select
                                          value={field.options?.source || 'manual'}
                                          onChange={(e) => {
                                            const source = e.target.value;
                                            const newOptions: any = {
                                              ...field.options,
                                              source,
                                              multiple: field.options?.multiple || false
                                            };
                                            if (source === 'manual') {
                                              newOptions.items = field.options?.items || [];
                                            } else if (source === 'enum') {
                                              newOptions.enumType = '';
                                            } else if (source === 'api') {
                                              newOptions.apiUrl = '';
                                              newOptions.apiValueField = 'id';
                                              newOptions.apiLabelField = 'name';
                                            }
                                            updateTemplateField(index, { options: newOptions });
                                          }}
                                          style={{ width: '100%', padding: '6px', fontSize: '12px' }}
                                        >
                                          <option value="manual">手动添加</option>
                                          <option value="enum">内置枚举</option>
                                          <option value="api">数据接口</option>
                                        </select>
                                      </div>
                                    </div>

                                    {/* 手动添加选项 */}
                                    {(!field.options?.source || field.options?.source === 'manual') && (
    <div>
                                        <label style={{ display: 'block', marginBottom: '6px', fontSize: '12px', fontWeight: 500 }}>
                                          选项列表
                                        </label>
                                        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                                          {(field.options?.items || []).map((item: any, itemIndex: number) => {
                                            const itemValue = typeof item === 'string' ? item : item.value;
                                            const itemLabel = typeof item === 'string' ? item : (item.label || item.value);
                                            return (
                                              <div key={itemIndex} style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                                                <input
                                                  type="text"
                                                  placeholder="标签"
                                                  value={itemLabel}
                                                  onChange={(e) => {
                                                    const items = [...(field.options?.items || [])];
                                                    items[itemIndex] = {
                                                      value: itemValue,
                                                      label: e.target.value
                                                    };
                                                    updateTemplateField(index, {
                                                      options: {
                                                        ...field.options,
                                                        items
                                                      }
                                                    });
                                                  }}
                                                  style={{ flex: 1, padding: '6px', fontSize: '12px' }}
                                                />
                                                <input
                                                  type="text"
                                                  placeholder="值"
                                                  value={itemValue}
                                                  onChange={(e) => {
                                                    const items = [...(field.options?.items || [])];
                                                    items[itemIndex] = {
                                                      value: e.target.value,
                                                      label: itemLabel
                                                    };
                                                    updateTemplateField(index, {
                                                      options: {
                                                        ...field.options,
                                                        items
                                                      }
                                                    });
                                                  }}
                                                  style={{ flex: 1, padding: '6px', fontSize: '12px' }}
                                                />
                                                <button
                                                  type="button"
                                                  className="btn btn-small btn-delete"
                                                  onClick={() => {
                                                    const items = [...(field.options?.items || [])];
                                                    items.splice(itemIndex, 1);
                                                    updateTemplateField(index, {
                                                      options: {
                                                        ...field.options,
                                                        items
                                                      }
                                                    });
                                                  }}
                                                  style={{ padding: '6px 12px' }}
                                                >
                                                  删除
                                                </button>
                                              </div>
                                            );
                                          })}
                                          <button
                                            type="button"
                                            className="btn btn-small btn-primary"
                                            onClick={() => {
                                              const items = [...(field.options?.items || [])];
                                              items.push({ value: '', label: '' });
                                              updateTemplateField(index, {
                                                options: {
                                                  ...field.options,
                                                  items
                                                }
                                              });
                                            }}
                                            style={{ alignSelf: 'flex-start', padding: '6px 12px' }}
                                          >
                                            + 增加选项
                                          </button>
                                        </div>
                                      </div>
                                    )}

                                    {/* 内置枚举 */}
                                    {field.options?.source === 'enum' && (
                                      <div>
                                        <label style={{ display: 'block', marginBottom: '6px', fontSize: '12px', fontWeight: 500 }}>
                                          选择枚举类型
                                        </label>
                                        <select
                                          value={field.options?.enumId || (field.options?.enumType ? `builtin_${field.options.enumType}` : '') || ''}
                                          onChange={(e) => {
                                            const value = e.target.value;
                                            if (value.startsWith('builtin_')) {
                                              // 内置枚举
                                              updateTemplateField(index, {
                                                options: {
                                                  ...field.options,
                                                  enumType: value.replace('builtin_', ''),
                                                  enumId: undefined,
                                                }
                                              });
                                              // 触发枚举匹配
                                              if (importMode === 'import' && parsedExcelData && currentAssetTypeId) {
                                                performEnumMatching(field.field_code, value);
                                              }
                                            } else {
                                              // 资产项枚举
                                              updateTemplateField(index, {
                                                options: {
                                                  ...field.options,
                                                  enumId: value,
                                                  enumType: undefined,
                                                }
                                              });
                                              // 触发枚举匹配
                                              if (importMode === 'import' && parsedExcelData && currentAssetTypeId) {
                                                performEnumMatching(field.field_code, value);
                                              }
                                            }
                                          }}
                                          style={{ width: '100%', padding: '6px', fontSize: '12px' }}
                                        >
                                          <option value="">请选择</option>
                                          <optgroup label="内置枚举">
                                            <option value="builtin_business_lines">业务线</option>
                                          </optgroup>
                                          {currentAssetTypeId && enumValues[currentAssetTypeId] && enumValues[currentAssetTypeId].length > 0 && (
                                            <optgroup label="资产项枚举">
                                              {enumValues[currentAssetTypeId].map(ev => (
                                                <option key={ev.id} value={ev.id}>{ev.name}</option>
                                              ))}
                                            </optgroup>
                                          )}
                                        </select>
                                        {field.options?.enumType === 'business_lines' && (
                                          <div style={{ marginTop: '8px', padding: '8px', backgroundColor: '#f0f0f0', borderRadius: '4px', fontSize: '12px' }}>
                                            将使用业务线列表作为选项，值字段：id，标签字段：name
                                          </div>
                                        )}
                                        {field.options?.enumId && currentAssetTypeId && enumValues[currentAssetTypeId] && (
                                          (() => {
                                            const selectedEnum = enumValues[currentAssetTypeId].find(ev => ev.id === field.options?.enumId);
                                            return selectedEnum ? (
                                              <div style={{ marginTop: '8px', padding: '8px', backgroundColor: '#f0f0f0', borderRadius: '4px', fontSize: '12px' }}>
                                                已选择枚举：{selectedEnum.name}，包含 {selectedEnum.values?.length || 0} 个选项
                                              </div>
                                            ) : null;
                                          })()
                                        )}
                                      </div>
                                    )}

                                    {/* 数据接口 */}
                                    {field.options?.source === 'api' && (
                                      <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                                        <div>
                                          <label style={{ display: 'block', marginBottom: '6px', fontSize: '12px', fontWeight: 500 }}>
                                            API接口地址
                                          </label>
                                          <input
                                            type="text"
                                            placeholder="https://api.example.com/data"
                                            value={field.options?.apiUrl || ''}
                                            onChange={(e) => updateTemplateField(index, {
                                              options: {
                                                ...field.options,
                                                apiUrl: e.target.value
                                              }
                                            })}
                                            style={{ width: '100%', padding: '6px', fontSize: '12px' }}
                                          />
                                        </div>
                                        <div style={{ display: 'flex', gap: '8px' }}>
                                          <div style={{ flex: 1 }}>
                                            <label style={{ display: 'block', marginBottom: '6px', fontSize: '12px', fontWeight: 500 }}>
                                              值字段名
                                            </label>
                                            <input
                                              type="text"
                                              placeholder="id"
                                              value={field.options?.apiValueField || 'id'}
                                              onChange={(e) => updateTemplateField(index, {
                                                options: {
                                                  ...field.options,
                                                  apiValueField: e.target.value
                                                }
                                              })}
                                              style={{ width: '100%', padding: '6px', fontSize: '12px' }}
                                            />
                                          </div>
                                          <div style={{ flex: 1 }}>
                                            <label style={{ display: 'block', marginBottom: '6px', fontSize: '12px', fontWeight: 500 }}>
                                              标签字段名
                                            </label>
                                            <input
                                              type="text"
                                              placeholder="name"
                                              value={field.options?.apiLabelField || 'name'}
                                              onChange={(e) => updateTemplateField(index, {
                                                options: {
                                                  ...field.options,
                                                  apiLabelField: e.target.value
                                                }
                                              })}
                                              style={{ width: '100%', padding: '6px', fontSize: '12px' }}
                                            />
                                          </div>
                                        </div>
                                        <small style={{ color: '#999', fontSize: '11px' }}>
                                          API应返回数组格式，例如：[{`{id: "1", name: "选项1"}`}, ...]
                                        </small>
                                      </div>
                                    )}
                                  </div>
                                </td>
                              </tr>
                            )}
                          </React.Fragment>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>

              <div className="modal-actions">
                <button type="button" className="btn btn-secondary" onClick={handleCloseTemplateModal}>
                  取消
                </button>
                <button type="submit" className="btn btn-primary" disabled={templateSubmitLoading}>
                  {templateSubmitLoading ? '提交中...' : (editingTemplate ? '保存' : '创建')}
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
              <p>确定要删除这条资产项吗？此操作不可恢复。</p>
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
                onClick={() => handleDelete(deleteConfirm)}
              >
                确认删除
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 创建/编辑枚举值模态框 */}
      {enumModalOpen && currentAssetTypeId && (
        <div className="modal-overlay" onClick={handleCloseEnumModal}>
          <div className="modal-content modal-large" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>{editingEnum ? '编辑枚举值' : '新增枚举值'}</h2>
              <button className="modal-close" onClick={handleCloseEnumModal}>
                ×
              </button>
            </div>
            <form onSubmit={handleEnumSubmit} className="modal-form">
              <div className="form-group">
                <label>
                  枚举名称 <span className="required">*</span>
                </label>
                <input
                  type="text"
                  value={enumFormData.name}
                  onChange={(e) => setEnumFormData({ ...enumFormData, name: e.target.value })}
                  required
                  placeholder="如：升级型号"
                />
              </div>

              <div className="form-group">
                <label>代码</label>
                <input
                  type="text"
                  value={enumFormData.code}
                  onChange={(e) => setEnumFormData({ ...enumFormData, code: e.target.value })}
                  placeholder="自动生成或手动输入"
                />
              </div>

              <div className="form-group">
                <label>描述</label>
                <textarea
                  value={enumFormData.description}
                  onChange={(e) => setEnumFormData({ ...enumFormData, description: e.target.value })}
                  rows={3}
                  placeholder="枚举值的说明"
                />
              </div>

              <div className="form-group">
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
                  <label style={{ marginBottom: 0 }}>枚举值列表 <span className="required">*</span></label>
                  <button
                    type="button"
                    className="btn btn-small btn-primary"
                    onClick={addEnumValue}
                  >
                    + 添加选项
                  </button>
                </div>
                
                {enumFormData.values.length === 0 ? (
                  <div style={{ padding: '20px', textAlign: 'center', color: '#999', border: '1px dashed #ddd', borderRadius: '4px' }}>
                    暂无枚举值，点击"添加选项"开始配置
                  </div>
                ) : (
                  <div className="fields-table-container">
                    <table className="fields-table">
                      <thead>
                        <tr>
                          <th style={{ width: '45%' }}>标签</th>
                          <th style={{ width: '45%' }}>值</th>
                          <th style={{ width: '10%' }}>操作</th>
                        </tr>
                      </thead>
                      <tbody>
                        {enumFormData.values.map((item, index) => (
                          <tr key={index}>
                            <td>
                              <input
                                type="text"
                                value={item.label}
                                onChange={(e) => updateEnumValue(index, { label: e.target.value })}
                                placeholder="如：旗舰型"
                                style={{ width: '100%', padding: '6px' }}
                              />
                            </td>
                            <td>
                              <input
                                type="text"
                                value={item.value}
                                onChange={(e) => updateEnumValue(index, { value: e.target.value })}
                                placeholder="如：premium"
                                style={{ width: '100%', padding: '6px' }}
                              />
                            </td>
                            <td style={{ textAlign: 'center' }}>
                              <button
                                type="button"
                                className="btn btn-small btn-delete"
                                onClick={() => removeEnumValue(index)}
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
                <button type="button" className="btn btn-secondary" onClick={handleCloseEnumModal}>
                  取消
                </button>
                <button type="submit" className="btn btn-primary" disabled={enumSubmitLoading}>
                  {enumSubmitLoading ? '提交中...' : (editingEnum ? '保存' : '创建')}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default AssetTypes;
