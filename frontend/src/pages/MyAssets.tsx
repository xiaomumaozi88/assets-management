import { useState, useEffect } from 'react';
import { Table, Tooltip, Tabs, Card, Statistic } from 'antd';
import type { ColumnsType } from 'antd/es/table';
import { assetsService } from '../services/assets.service';
import { assetFieldsService, type AssetField } from '../services/asset-fields.service';
import { assetTypesService } from '../services/asset-types.service';
import { assetTemplatesService, type AssetTemplate } from '../services/asset-templates.service';
import './MyAssets.css';

interface Asset {
  id: string;
  name: string;
  code?: string;
  status: string;
  asset_type_id: string;
  asset_template_id?: string;
  business_line_id?: string;
  expiry_date?: string;
  cost?: number;
  custom_fields?: Record<string, any>;
  assetType?: { name: string; id: string };
  assetTemplate?: { name: string; id?: string };
  businessLine?: { name: string };
  created_at: string;
}

interface AssetType {
  id: string;
  name: string;
  code: string;
}

const MyAssets = () => {
  const [allAssets, setAllAssets] = useState<Asset[]>([]);
  const [assetTypes, setAssetTypes] = useState<AssetType[]>([]);
  const [templatesByType, setTemplatesByType] = useState<Record<string, AssetTemplate[]>>({}); // typeId -> templates
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [templateFields, setTemplateFields] = useState<Record<string, AssetField[]>>({}); // templateId -> fields
  const [activeTab, setActiveTab] = useState<string>('overview');
  const [activeSubTab, setActiveSubTab] = useState<Record<string, string>>({}); // typeId -> templateId
  const [pagination, setPagination] = useState<Record<string, { current: number; pageSize: number; total: number }>>({});

  useEffect(() => {
    loadAssetTypes();
    loadMyAssets();
  }, []);

  const loadAssetTypes = async () => {
    try {
      const data = await assetTypesService.getAll();
      const typesList = Array.isArray(data) ? data : [];
      setAssetTypes(typesList);
      
      // 为每个资产类型加载模板
      const templatesMap: Record<string, AssetTemplate[]> = {};
      for (const type of typesList) {
        try {
          const templatesData = await assetTemplatesService.getAll(type.id);
          const templates = Array.isArray(templatesData) ? templatesData : [];
          templatesMap[type.id] = templates;
          
          // 设置默认激活的子标签（第一个模板）
          if (templates.length > 0 && !activeSubTab[type.id]) {
            setActiveSubTab(prev => ({ ...prev, [type.id]: templates[0].id }));
          }
        } catch (err) {
          console.error(`加载资产类型 ${type.name} 的模板失败:`, err);
          templatesMap[type.id] = [];
        }
      }
      setTemplatesByType(templatesMap);
    } catch (err) {
      console.error('加载资产类型失败:', err);
    }
  };

  const loadMyAssets = async () => {
    try {
      setLoading(true);
      setError('');
      const data = await assetsService.getAll({ my: 'true' });
      const assetsList = Array.isArray(data) ? data : [];
      setAllAssets(assetsList);
      
      // 加载所有模板的字段配置
      const templateIds = new Set<string>();
      assetsList.forEach(asset => {
        if (asset.asset_template_id) {
          templateIds.add(asset.asset_template_id);
        }
      });
      
      // 为每个模板加载字段
      const fieldsMap: Record<string, AssetField[]> = {};
      for (const templateId of templateIds) {
        try {
          const fieldsData = await assetFieldsService.getByTemplate(templateId);
          // 处理可能的响应格式：可能是直接数组，也可能是包装在 data 中
          let fields: AssetField[] = [];
          if (Array.isArray(fieldsData)) {
            fields = fieldsData as unknown as AssetField[];
          } else if (fieldsData && typeof fieldsData === 'object' && 'data' in fieldsData && Array.isArray(fieldsData.data)) {
            fields = fieldsData.data as unknown as AssetField[];
          }
          fieldsMap[templateId] = fields;
        } catch (err) {
          console.error(`加载模板 ${templateId} 的字段失败:`, err);
          fieldsMap[templateId] = [];
        }
      }
      setTemplateFields(fieldsMap);
    } catch (err: any) {
      setError(err.response?.data?.message || err.message || '加载失败');
    } finally {
      setLoading(false);
    }
  };

  const getFieldValue = (asset: Asset, fieldCode: string): any => {
    if (!asset.custom_fields || typeof asset.custom_fields !== 'object') {
      return null;
    }
    const value = asset.custom_fields[fieldCode];
    // 允许 0 和 false 作为有效值
    if (value === null || value === undefined || value === '') {
      return null;
    }
    return value;
  };

  const getPrimaryFieldValue = (asset: Asset): string => {
    if (!asset.asset_template_id || !templateFields[asset.asset_template_id]) {
      return asset.name; // 如果没有模板或字段配置，使用默认名称
    }
    
    const fields = templateFields[asset.asset_template_id];
    const primaryFields = fields.filter(f => f.is_primary);
    
    if (primaryFields.length > 0) {
      // 获取所有主要字段的值，用空格或分隔符连接
      const values = primaryFields
        .map(field => {
          const value = getFieldValue(asset, field.field_code);
          return value !== null ? String(value) : null;
        })
        .filter(v => v !== null);
      
      if (values.length > 0) {
        return values.join(' / '); // 多个主要字段用 " / " 连接
      }
    }
    
    return asset.name; // 如果没有主要字段或值为空，使用默认名称
  };


  const renderCustomFields = (asset: Asset) => {
    if (!asset.asset_template_id) {
      return <span style={{ color: '#999' }}>无模板关联</span>;
    }
    
    const templateId = asset.asset_template_id;
    if (!templateFields[templateId]) {
      return <span style={{ color: '#999' }}>字段配置加载中...</span>;
    }

    const fields = templateFields[templateId];
    
    if (!fields || fields.length === 0) {
      return <span style={{ color: '#999' }}>无字段配置</span>;
    }
    
    // 显示所有字段，不仅仅是主要字段
    const fieldsWithValues = fields
      .map(field => {
        const value = getFieldValue(asset, field.field_code);
        return {
          name: field.field_name,
          code: field.field_code,
          value: value,
        };
      })
      .filter(f => f.value !== null);

    if (fieldsWithValues.length === 0) {
      return <span style={{ color: '#999' }}>暂无数据</span>;
    }

    // 生成完整内容的HTML（用于Tooltip）
    const fullContent = (
      <div style={{ maxWidth: '400px' }}>
        {fieldsWithValues.map((field) => (
          <div key={field.code} style={{ marginBottom: '4px', lineHeight: '1.5' }}>
            <span style={{ color: '#fff', fontWeight: 500 }}>{field.name}:</span>{' '}
            <span style={{ color: '#fff' }}>{String(field.value)}</span>
          </div>
        ))}
      </div>
    );
    
    // 生成单行显示的内容（截断）
    const displayContent = (
      <div className="custom-fields-display">
        {fieldsWithValues.map((field) => (
          <span key={field.code} className="field-tag">
            <span className="field-name">{field.name}:</span>
            <span className="field-value">{String(field.value)}</span>
          </span>
        ))}
      </div>
    );

    return (
      <Tooltip title={fullContent} placement="topLeft" overlayStyle={{ maxWidth: '500px' }}>
        <div style={{ cursor: 'pointer' }}>{displayContent}</div>
      </Tooltip>
    );
  };

  // 定义表格列（根据templateId返回对应的列配置，包含该模板的自定义字段）
  const getColumns = (typeId?: string, templateId?: string): ColumnsType<Asset> => {
    const baseColumns: ColumnsType<Asset> = [
      {
        title: '序号',
        key: 'index',
        width: 60,
        align: 'center',
        render: (_: any, __: Asset, index: number) => {
          const tabKey = templateId ? `${typeId}_${templateId}` : (typeId || 'overview');
          const pageInfo = pagination[tabKey] || { current: 1, pageSize: 10, total: 0 };
          return (pageInfo.current - 1) * pageInfo.pageSize + index + 1;
        },
      },
      {
        title: '名称',
        dataIndex: 'name',
        key: 'name',
        width: 300,
        render: (_: any, asset: Asset) => (
          <Tooltip title={getPrimaryFieldValue(asset)} placement="topLeft">
            <div className="single-line-cell" style={{ fontWeight: 500 }}>
              {getPrimaryFieldValue(asset)}
            </div>
          </Tooltip>
        ),
      },
      {
        title: '代码',
        dataIndex: 'code',
        key: 'code',
        width: 120,
        render: (code: string) => code || '-',
      },
    ];

    // 如果指定了templateId，添加该模板的自定义字段列
    if (templateId && templateFields[templateId]) {
      const fields = templateFields[templateId];
      // 只显示主要字段和常用字段，详细信息列显示所有字段
      const primaryFields = fields.filter(f => f.is_primary);
      const otherFields = fields.filter(f => !f.is_primary && f.field_type !== 'text' && f.field_type !== 'textarea');
      
      // 添加主要字段列
      primaryFields.forEach(field => {
        baseColumns.push({
          title: field.field_name,
          key: field.field_code,
          width: 150,
          render: (_: any, asset: Asset) => {
            const value = getFieldValue(asset, field.field_code);
            return value !== null ? String(value) : '-';
          },
        });
      });

      // 添加其他重要字段列（如select、number等）
      otherFields.slice(0, 5).forEach(field => { // 最多显示5个其他字段
        baseColumns.push({
          title: field.field_name,
          key: field.field_code,
          width: 150,
          render: (_: any, asset: Asset) => {
            const value = getFieldValue(asset, field.field_code);
            if (value === null) return '-';
            // 如果是select字段，显示标签
            if (field.field_type === 'select') {
              const options = field.options?.items || [];
              const option = options.find((opt: any) => {
                const optValue = typeof opt === 'string' ? opt : opt.value;
                return optValue === value;
              });
              return typeof option === 'string' ? option : (option?.label || value);
            }
            return String(value);
          },
        });
      });
    }

    // 添加固定列
    baseColumns.push(
      {
        title: '业务线',
        dataIndex: ['businessLine', 'name'],
        key: 'businessLine',
        width: 100,
        render: (name: string) => name || '-',
      },
      {
        title: '状态',
        dataIndex: 'status',
        key: 'status',
        width: 120,
        render: (status: string) => (
          <span className={`status-badge ${status === 'active' ? 'active' : 'inactive'}`}>
            {status === 'active' ? '启用' : '禁用'}
          </span>
        ),
      },
      {
        title: '详细信息',
        key: 'customFields',
        ellipsis: true,
        render: (_: any, asset: Asset) => (
          <div className="custom-fields-cell">
            {renderCustomFields(asset)}
          </div>
        ),
      },
      {
        title: '创建时间',
        dataIndex: 'created_at',
        key: 'created_at',
        width: 200,
        render: (date: string) => new Date(date).toLocaleString('zh-CN'),
      }
    );

    return baseColumns;
  };

  // 按资产类型分组资产
  const getAssetsByType = (typeId: string) => {
    return allAssets.filter(asset => asset.asset_type_id === typeId);
  };

  // 按表格分组资产
  const getAssetsByTemplate = (typeId: string, templateId: string) => {
    return allAssets.filter(asset => 
      asset.asset_type_id === typeId && asset.asset_template_id === templateId
    );
  };

  // 获取资产类型统计
  const getAssetTypeStats = () => {
    const stats = assetTypes.map(type => {
      const count = getAssetsByType(type.id).length;
      return {
        typeId: type.id,
        typeName: type.name,
        count,
      };
    });
    return stats;
  };

  // 计算当前页的数据，确保没有children属性
  const getCurrentPageData = (typeId?: string, templateId?: string) => {
    let assets: Asset[] = [];
    if (templateId && typeId) {
      assets = getAssetsByTemplate(typeId, templateId);
    } else if (typeId) {
      assets = getAssetsByType(typeId);
    } else {
      assets = allAssets;
    }
    const tabKey = templateId ? `${typeId}_${templateId}` : (typeId || 'overview');
    const pageInfo = pagination[tabKey] || { current: 1, pageSize: 10, total: assets.length };
    const start = (pageInfo.current - 1) * pageInfo.pageSize;
    const end = start + pageInfo.pageSize;
    return assets.slice(start, end).map(asset => {
      const { children, ...assetWithoutChildren } = asset as any;
      return assetWithoutChildren;
    });
  };

  const handleTableChange = (newPagination: any, typeId?: string, templateId?: string) => {
    let assets: Asset[] = [];
    if (templateId && typeId) {
      assets = getAssetsByTemplate(typeId, templateId);
    } else if (typeId) {
      assets = getAssetsByType(typeId);
    } else {
      assets = allAssets;
    }
    const tabKey = templateId ? `${typeId}_${templateId}` : (typeId || 'overview');
    setPagination(prev => ({
      ...prev,
      [tabKey]: {
        current: newPagination.current,
        pageSize: newPagination.pageSize,
        total: assets.length,
      },
    }));
  };

  // 渲染总览
  const renderOverview = () => {
    const stats = getAssetTypeStats();
    const totalCount = allAssets.length;

    return (
      <div>
        <div style={{ marginBottom: '24px' }}>
          <Card>
            <Statistic
              title="资产总数"
              value={totalCount}
              valueStyle={{ color: '#1890ff' }}
            />
          </Card>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: '16px' }}>
          {stats.map(stat => (
            <Card key={stat.typeId} hoverable onClick={() => setActiveTab(stat.typeId)}>
              <Statistic
                title={stat.typeName}
                value={stat.count}
                valueStyle={{ color: stat.count > 0 ? '#52c41a' : '#999' }}
              />
            </Card>
          ))}
        </div>
      </div>
    );
  };

  // 渲染资产类型表格（按模板分组）
  const renderAssetTypeTable = (typeId: string) => {
    const templates = templatesByType[typeId] || [];
    const currentSubTab = activeSubTab[typeId] || (templates.length > 0 ? templates[0].id : '');

    if (templates.length === 0) {
      return <div style={{ padding: '20px', textAlign: 'center', color: '#999' }}>该资产类型下暂无表格</div>;
    }

    // 为每个模板创建子标签页
    const subTabItems = templates.map(template => {
      const assets = getAssetsByTemplate(typeId, template.id);
      const tabKey = `${typeId}_${template.id}`;
      const pageInfo = pagination[tabKey] || { current: 1, pageSize: 10, total: assets.length };

      return {
        key: template.id,
        label: `${template.name} (${assets.length})`,
        children: (
          <Table
            columns={getColumns(typeId, template.id)}
            dataSource={getCurrentPageData(typeId, template.id)}
            rowKey="id"
            loading={loading}
            pagination={{
              current: pageInfo.current,
              pageSize: pageInfo.pageSize,
              total: pageInfo.total,
              showSizeChanger: true,
              showQuickJumper: true,
              showTotal: (total) => `共 ${total} 条`,
              pageSizeOptions: ['10', '20', '50', '100'],
            }}
            onChange={(newPagination) => handleTableChange(newPagination, typeId, template.id)}
            scroll={{ x: 'max-content' }}
            locale={{
              emptyText: '暂无资产',
            }}
          />
        ),
      };
    });

    return (
      <Tabs
        activeKey={currentSubTab}
        onChange={(key) => setActiveSubTab(prev => ({ ...prev, [typeId]: key }))}
        items={subTabItems}
        type="card"
      />
    );
  };

  // 生成标签页项
  const tabItems = [
    {
      key: 'overview',
      label: '总览',
      children: renderOverview(),
    },
    ...assetTypes.map(type => ({
      key: type.id,
      label: `${type.name} (${getAssetsByType(type.id).length})`,
      children: renderAssetTypeTable(type.id),
    })),
  ];

  return (
    <div className="my-assets-page">
      <div className="page-header">
        <h1>我的资产</h1>
      </div>

      {error && <div className="error-message">{error}</div>}

      <Tabs
        activeKey={activeTab}
        onChange={setActiveTab}
        items={tabItems}
        type="card"
      />
    </div>
  );
};

export default MyAssets;
