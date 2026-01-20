import { Outlet, Link, useNavigate } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { getCurrentUserFromToken } from '../utils/auth';
import { usersService } from '../services/users.service';
import type { User } from '../services/users.service';
import './Layout.css';

const Layout = () => {
  const navigate = useNavigate();
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadCurrentUser();
  }, []);

  const loadCurrentUser = async () => {
    try {
      // 先从 token 中获取用户 ID
      const tokenUser = getCurrentUserFromToken();
      if (tokenUser?.id) {
        // 调用 API 获取完整用户信息
        const user = await usersService.getById(tokenUser.id);
        setCurrentUser(user as User);
      }
    } catch (error) {
      console.error('Failed to load user info:', error);
      // 如果 API 调用失败，使用 token 中的基本信息
      const tokenUser = getCurrentUserFromToken();
      if (tokenUser) {
        setCurrentUser({
          id: tokenUser.id,
          email: tokenUser.email,
          role: tokenUser.role as 'user' | 'admin' | undefined,
        } as User);
      }
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    navigate('/login');
  };


  return (
    <div className="layout">
      <nav className="sidebar">
        <div className="logo">资产管理系统</div>
        
        <ul className="nav-menu">
          <li>
            <Link to="/dashboard">仪表盘</Link>
          </li>
          <li>
            <Link to="/my-assets">我的资产</Link>
          </li>
          <li>
            <Link to="/applications">申请管理</Link>
          </li>
          <li>
            <Link to="/assets">资产管理</Link>
          </li>
          <li>
            <Link to="/business-lines">业务线管理</Link>
          </li>
          <li>
            <Link to="/asset-types">资产项管理</Link>
          </li>
          <li>
            <Link to="/users">用户管理</Link>
          </li>
        </ul>
        
        <div className="sidebar-footer">
          {/* 用户信息 */}
          {!loading && currentUser && (
            <div className="user-info">
              Hi, {currentUser.name || currentUser.email}
            </div>
          )}
          
          <button className="logout-btn" onClick={handleLogout}>
            退出登录
          </button>
        </div>
      </nav>
      <main className="content">
        <Outlet />
      </main>
    </div>
  );
};

export default Layout;

