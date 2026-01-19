import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { authService } from '../services/auth.service';
import type { LoginDto } from '../services/auth.service';
import './Login.css';

const Login = () => {
  const navigate = useNavigate();
  const [error, setError] = useState('');
  const { register, handleSubmit, formState: { errors } } = useForm<LoginDto>();

  const onSubmit = async (data: LoginDto) => {
    try {
      setError('');
      const response = await authService.login(data);
      localStorage.setItem('token', response.access_token);
      navigate('/dashboard');
    } catch (err: any) {
      setError(err.response?.data?.message || err.message || '登录失败');
    }
  };

  return (
    <div className="login-container">
      <div className="login-box">
        <h1>资产管理系统</h1>
        <form onSubmit={handleSubmit(onSubmit)}>
          <div className="form-group">
            <label>邮箱</label>
            <input
              type="email"
              {...register('email', { required: '请输入邮箱' })}
            />
            {errors.email && <span className="error">{errors.email.message}</span>}
          </div>
          <div className="form-group">
            <label>密码</label>
            <input
              type="password"
              {...register('password', { required: '请输入密码' })}
            />
            {errors.password && <span className="error">{errors.password.message}</span>}
          </div>
          {error && <div className="error-message">{error}</div>}
          <button type="submit" className="submit-btn">登录</button>
        </form>
      </div>
    </div>
  );
};

export default Login;

