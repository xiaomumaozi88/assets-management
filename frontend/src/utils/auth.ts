/**
 * 从 JWT token 中解析用户信息
 */
export interface UserInfo {
  id: string;
  email: string;
  role?: string;
}

export const getCurrentUserFromToken = (): UserInfo | null => {
  try {
    const token = localStorage.getItem('token');
    if (!token) {
      return null;
    }

    // JWT token 格式: header.payload.signature
    const parts = token.split('.');
    if (parts.length !== 3) {
      return null;
    }

    // 解码 payload (base64)
    const payload = JSON.parse(atob(parts[1]));
    
    return {
      id: payload.sub,
      email: payload.email,
      role: payload.role,
    };
  } catch (error) {
    console.error('Failed to parse token:', error);
    return null;
  }
};

