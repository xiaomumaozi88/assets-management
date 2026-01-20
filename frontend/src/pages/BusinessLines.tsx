import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
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
          <table className="data-table">
            <thead>
              <tr>
                <th>序号</th>
                <th>名称</th>
                <th>代码</th>
                <th>后缀</th>
                <th>描述</th>
                <th>状态</th>
                <th>排序</th>
                <th>创建时间</th>
                <th>操作</th>
              </tr>
            </thead>
            <tbody>
              {businessLines.length === 0 ? (
                <tr>
                  <td colSpan={9} className="empty-state">
                    暂无数据
                  </td>
                </tr>
              ) : (
                businessLines.map((item, index) => (
                  <tr key={item.id}>
                    <td>{index + 1}</td>
                    <td>{item.name}</td>
                    <td>{item.code}</td>
                    <td>{item.suffix || '-'}</td>
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
                      <div className="action-buttons">
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
                ))
              )}
            </tbody>
          </table>
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
