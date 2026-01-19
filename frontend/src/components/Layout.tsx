import { Outlet, Link, useNavigate } from 'react-router-dom';
import './Layout.css';

const Layout = () => {
  const navigate = useNavigate();

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
        <button className="logout-btn" onClick={handleLogout}>
          退出登录
        </button>
      </nav>
      <main className="content">
        <Outlet />
      </main>
    </div>
  );
};

export default Layout;

