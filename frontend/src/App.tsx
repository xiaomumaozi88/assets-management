import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import Layout from './components/Layout';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import Assets from './pages/Assets';
import MyAssets from './pages/MyAssets';
import Applications from './pages/Applications';
import BusinessLines from './pages/BusinessLines';
import AssetTypes from './pages/AssetTypes';
import Users from './pages/Users';
import { ProtectedRoute } from './components/ProtectedRoute';

const queryClient = new QueryClient();

// 获取 base 路径，与 vite.config.ts 保持一致
// Vite 会自动设置 import.meta.env.BASE_URL 为 vite.config.ts 中的 base 值
const basename = import.meta.env.BASE_URL || '/assets-management/';

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter basename={basename}>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route
            path="/"
            element={
              <ProtectedRoute>
                <Layout />
              </ProtectedRoute>
            }
          >
            <Route index element={<Navigate to="/dashboard" replace />} />
            <Route path="dashboard" element={<Dashboard />} />
            <Route path="my-assets" element={<MyAssets />} />
            <Route path="applications" element={<Applications />} />
            <Route path="assets" element={<Assets />} />
            <Route path="business-lines" element={<BusinessLines />} />
            <Route path="asset-types" element={<AssetTypes />} />
            <Route path="users" element={<Users />} />
          </Route>
        </Routes>
      </BrowserRouter>
    </QueryClientProvider>
  );
}

export default App;
