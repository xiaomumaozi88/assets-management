import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { usersService, type User, type CreateUserDto } from '../services/users.service';
import './Users.css';

type UserFormData = {
  name: string;
  email: string;
  password: string;
  role: 'user' | 'admin';
  department: string;
  status: 'active' | 'inactive';
};

const Users = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<User | null>(null);

  const { register, handleSubmit, reset, formState: { errors } } = useForm<UserFormData>({
    defaultValues: {
      role: 'user',
      status: 'active',
    },
  });

  useEffect(() => {
    loadUsers();
  }, []);

  const loadUsers = async () => {
    try {
      setLoading(true);
      setError('');
      const data = await usersService.getAll();
      setUsers(Array.isArray(data) ? data : []);
    } catch (err: any) {
      setError(err.response?.data?.message || err.message || '加载失败');
    } finally {
      setLoading(false);
    }
  };

  const handleOpenModal = (user?: User) => {
    if (user) {
      setEditingUser(user);
      reset({
        name: user.name,
        email: user.email,
        password: '', // 编辑时不显示密码
        role: user.role || 'user',
        department: user.department || '',
        status: user.status || 'active',
      });
    } else {
      setEditingUser(null);
      reset({
        name: '',
        email: '',
        password: '',
        role: 'user',
        department: '',
        status: 'active',
      });
    }
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setEditingUser(null);
    reset();
  };

  const onSubmit = async (data: UserFormData) => {
    try {
      setError('');
      if (editingUser) {
        // 更新用户
        const updateData: Partial<CreateUserDto> = {
          name: data.name,
          email: data.email,
          role: data.role,
          department: data.department || undefined,
          status: data.status,
        };
        // 只有提供了新密码才更新密码
        if (data.password && data.password.trim()) {
          updateData.password = data.password;
        }
        await usersService.update(editingUser.id, updateData);
      } else {
        // 创建用户
        if (!data.password || !data.password.trim()) {
          setError('创建用户时必须设置密码');
          return;
        }
        await usersService.create({
          name: data.name,
          email: data.email,
          password: data.password,
          role: data.role,
          department: data.department || undefined,
          status: data.status,
        });
      }
      handleCloseModal();
      loadUsers();
    } catch (err: any) {
      setError(err.response?.data?.message || err.message || '操作失败');
    }
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm('确定要删除这个用户吗？')) {
      return;
    }
    try {
      setError('');
      await usersService.delete(id);
      loadUsers();
    } catch (err: any) {
      setError(err.response?.data?.message || err.message || '删除失败');
    }
  };

  return (
    <div className="users-page">
      <div className="page-header">
        <h1>用户管理</h1>
        <button className="btn btn-primary" onClick={() => handleOpenModal()}>
          新增用户
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
                <th>姓名</th>
                <th>邮箱</th>
                <th>角色</th>
                <th>部门</th>
                <th>状态</th>
                <th>创建时间</th>
                <th>操作</th>
              </tr>
            </thead>
            <tbody>
              {users.length === 0 ? (
                <tr>
                  <td colSpan={7} style={{ textAlign: 'center', padding: '20px', color: '#999' }}>
                    暂无用户数据
                  </td>
                </tr>
              ) : (
                users.map((user) => (
                  <tr key={user.id}>
                    <td>{user.name}</td>
                    <td>{user.email}</td>
                    <td>
                      <span className={`badge ${user.role === 'admin' ? 'badge-admin' : 'badge-user'}`}>
                        {user.role === 'admin' ? '管理员' : '普通用户'}
                      </span>
                    </td>
                    <td>{user.department || '-'}</td>
                    <td>
                      <span className={`badge ${user.status === 'active' ? 'badge-active' : 'badge-inactive'}`}>
                        {user.status === 'active' ? '启用' : '禁用'}
                      </span>
                    </td>
                    <td>{user.created_at ? new Date(user.created_at).toLocaleString('zh-CN') : '-'}</td>
                    <td>
                      <div className="action-buttons">
                        <button
                          className="btn btn-small btn-edit"
                          onClick={() => handleOpenModal(user)}
                        >
                          编辑
                        </button>
                        <button
                          className="btn btn-small btn-delete"
                          onClick={() => handleDelete(user.id)}
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

      {/* 创建/编辑用户模态框 */}
      {isModalOpen && (
        <div className="modal-overlay" onClick={handleCloseModal}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>{editingUser ? '编辑用户' : '新增用户'}</h2>
              <button className="modal-close" onClick={handleCloseModal}>
                ×
              </button>
            </div>
            <form onSubmit={handleSubmit(onSubmit)} className="modal-form">
              <div className="form-group">
                <label>
                  姓名 <span className="required">*</span>
                </label>
                <input
                  type="text"
                  {...register('name', { required: '请输入姓名' })}
                />
                {errors.name && (
                  <span className="error">{errors.name.message}</span>
                )}
              </div>

              <div className="form-group">
                <label>
                  邮箱 <span className="required">*</span>
                </label>
                <input
                  type="email"
                  {...register('email', { 
                    required: '请输入邮箱',
                    pattern: {
                      value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                      message: '请输入有效的邮箱地址'
                    }
                  })}
                />
                {errors.email && (
                  <span className="error">{errors.email.message}</span>
                )}
              </div>

              <div className="form-group">
                <label>
                  密码 {!editingUser && <span className="required">*</span>}
                </label>
                <input
                  type="password"
                  {...register('password', { 
                    required: !editingUser ? '请输入密码' : false,
                    minLength: editingUser ? undefined : { value: 6, message: '密码至少6位' }
                  })}
                  placeholder={editingUser ? '留空则不修改密码' : '请输入密码（至少6位）'}
                />
                {errors.password && (
                  <span className="error">{errors.password.message}</span>
                )}
              </div>

              <div className="form-group">
                <label>
                  角色 <span className="required">*</span>
                </label>
                <select {...register('role', { required: true })}>
                  <option value="user">普通用户</option>
                  <option value="admin">管理员</option>
                </select>
              </div>

              <div className="form-group">
                <label>部门</label>
                <input
                  type="text"
                  {...register('department')}
                />
              </div>

              <div className="form-group">
                <label>
                  状态 <span className="required">*</span>
                </label>
                <select {...register('status', { required: true })}>
                  <option value="active">启用</option>
                  <option value="inactive">禁用</option>
                </select>
              </div>

              <div className="modal-actions">
                <button type="button" className="btn btn-secondary" onClick={handleCloseModal}>
                  取消
                </button>
                <button type="submit" className="btn btn-primary">
                  {editingUser ? '更新' : '创建'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Users;

