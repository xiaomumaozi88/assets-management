import { useState, useEffect, useMemo } from 'react';
import { useForm } from 'react-hook-form';
import { Table, Tag } from 'antd';
import type { ColumnsType } from 'antd/es/table';
import { businessLinesService } from '../services/business-lines.service';
import './BusinessLines.css';

interface BusinessLine {
  id: string;
  name: string;
  code: string;
  suffix?: string;
  description?: string;
  status: boolean;
  sort_order: number;
  created_at: string;
}

interface BusinessLineFormData {
  name: string;
  code: string;
  suffix?: string;
  description?: string;
  status?: boolean;
  sort_order?: number;
}

const BusinessLines = () => {
  const [businessLines, setBusinessLines] = useState<BusinessLine[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<BusinessLine | null>(null);
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);
  const [submitLoading, setSubmitLoading] = useState(false);

  const { register, handleSubmit, reset, formState: { errors } } = useForm<BusinessLineFormData>();

  useEffect(() => {
    loadBusinessLines();
  }, []);

  const loadBusinessLines = async () => {
    try {
      setLoading(true);
      setError('');
      const data = await businessLinesService.getAll();
      setBusinessLines(Array.isArray(data) ? data : []);
    } catch (err: any) {
      setError(err.response?.data?.message || err.message || '加载失败');
    } finally {
      setLoading(false);
    }
  };

  const handleOpenModal = (item?: BusinessLine) => {
    if (item) {
      setEditingItem(item);
      reset({
        name: item.name,
        code: item.code,
        suffix: item.suffix || '',
        description: item.description || '',
        status: item.status,
        sort_order: item.sort_order,
      });
    } else {
      setEditingItem(null);
      reset({
        name: '',
        code: '',
        suffix: '',
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

  const onSubmit = async (data: BusinessLineFormData) => {
    if (submitLoading) return;
    
    try {
      setSubmitLoading(true);
      setError('');
      if (editingItem) {
        await businessLinesService.update(editingItem.id, data);
      } else {
        await businessLinesService.create(data);
      }
      handleCloseModal();
      loadBusinessLines();
    } catch (err: any) {
      setError(err.response?.data?.message || err.message || '操作失败');
    } finally {
      setSubmitLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    try {
      setError('');
      await businessLinesService.delete(id);
      setDeleteConfirm(null);
      loadBusinessLines();
    } catch (err: any) {
      setError(err.response?.data?.message || err.message || '删除失败');
    }
  };

  const handleToggleStatus = async (item: BusinessLine) => {
    try {
      setError('');
      await businessLinesService.update(item.id, { status: !item.status });
      loadBusinessLines();
    } catch (err: any) {
      setError(err.response?.data?.message || err.message || '操作失败');
    }
  };

  const columns: ColumnsType<BusinessLine> = useMemo(() => [
    {
      title: '序号',
      key: 'index',
      width: 80,
      render: (_: any, __: BusinessLine, index: number) => index + 1,
    },
    {
      title: '名称',
      dataIndex: 'name',
      key: 'name',
      width: 150,
    },
    {
      title: '代码',
      dataIndex: 'code',
      key: 'code',
      width: 120,
    },
    {
      title: '后缀',
      dataIndex: 'suffix',
      key: 'suffix',
      width: 100,
      render: (suffix: string) => suffix || '-',
    },
    {
      title: '描述',
      dataIndex: 'description',
      key: 'description',
      width: 200,
      render: (description: string) => description || '-',
    },
    {
      title: '状态',
      dataIndex: 'status',
      key: 'status',
      width: 100,
      render: (status: boolean, record: BusinessLine) => (
        <Tag
          color={status ? 'green' : 'default'}
          style={{ cursor: 'pointer' }}
          onClick={() => handleToggleStatus(record)}
        >
          {status ? '启用' : '禁用'}
        </Tag>
      ),
    },
    {
      title: '排序',
      dataIndex: 'sort_order',
      key: 'sort_order',
      width: 80,
    },
    {
      title: '创建时间',
      key: 'created_at',
      width: 180,
      render: (_: any, record: BusinessLine) => 
        new Date(record.created_at).toLocaleString('zh-CN'),
    },
    {
      title: '操作',
      key: 'action',
      width: 150,
      fixed: 'right',
      render: (_: any, record: BusinessLine) => (
        <div className="action-buttons">
          <button
            className="btn btn-small btn-edit"
            onClick={() => handleOpenModal(record)}
          >
            编辑
          </button>
          <button
            className="btn btn-small btn-delete"
            onClick={() => setDeleteConfirm(record.id)}
          >
            删除
          </button>
        </div>
      ),
    },
  ], [handleOpenModal, handleToggleStatus, setDeleteConfirm]);

  return (
    <div className="business-lines-page">
      <div className="page-header">
      <h1>业务线管理</h1>
        <button className="btn btn-primary" onClick={() => handleOpenModal()}>
          新增业务线
        </button>
      </div>

      {error && <div className="error-message">{error}</div>}

      {loading ? (
        <div className="loading">加载中...</div>
      ) : (
        <div className="table-container">
          <Table
            columns={columns}
            dataSource={businessLines}
            rowKey="id"
            pagination={false}
            scroll={{ x: 'max-content' }}
            locale={{
              emptyText: '暂无数据'
            }}
          />
        </div>
      )}

      {/* 创建/编辑模态框 */}
      {isModalOpen && (
        <div className="modal-overlay" onClick={handleCloseModal}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>{editingItem ? '编辑业务线' : '新增业务线'}</h2>
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
                <label>后缀</label>
                <input type="text" {...register('suffix')} />
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
                <button type="submit" className="btn btn-primary" disabled={submitLoading}>
                  {submitLoading ? '提交中...' : (editingItem ? '保存' : '创建')}
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
              <p>确定要删除这条业务线吗？此操作不可恢复。</p>
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
    </div>
  );
};

export default BusinessLines;
