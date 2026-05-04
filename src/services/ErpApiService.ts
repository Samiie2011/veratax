import { API_BASE_URL } from '../config/api';
import { getAuth } from 'firebase/auth';

export interface ApiResponse<T> {
  ok: boolean;
  data?: T;
  error?: string;
  message?: string;
  [key: string]: any;
}

const getHeaders = async (customHeaders: Record<string, string> = {}) => {
  const auth = getAuth();
  const user = auth.currentUser;
  const token = user ? await user.getIdToken() : null;
  
  return {
    'Content-Type': 'application/json',
    ...(token ? { 'Authorization': `Bearer ${token}` } : {}),
    ...customHeaders
  };
};

const ErpApiService = {
  apiGet: async <T>(path: string): Promise<ApiResponse<T>> => {
    if (!path) throw new Error("API path is required");
    const url = `${API_BASE_URL}${path.startsWith("/") ? path : `/${path}`}`;
    
    try {
      const headers = await getHeaders();
      const response = await fetch(url, {
        method: 'GET',
        headers,
      });
      
      if (response.status === 401) {
        throw new Error("UNAUTHORIZED");
      }
      
      if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
      
      const text = await response.text();
      if (!text) return { ok: true } as ApiResponse<T>;
      
      const json = JSON.parse(text);
      if (json.ok === false) throw new Error(json.error || json.message || "Unknown API error");
      return json;
    } catch (error) {
      // Don't log sensitive path if it contains tokens or IDs in a real app, 
      // but here we just keep it clean and minimal.
      throw error;
    }
  },

  apiPost: async <T>(path: string, body: any): Promise<ApiResponse<T>> => {
    if (!path) throw new Error("API path is required");
    const url = `${API_BASE_URL}${path.startsWith("/") ? path : `/${path}`}`;
    
    try {
      const headers = await getHeaders();
      const response = await fetch(url, {
        method: 'POST',
        headers,
        body: JSON.stringify(body),
      });
      
      if (response.status === 401) {
        throw new Error("UNAUTHORIZED");
      }
      
      if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
      
      const text = await response.text();
      if (!text) return { ok: true } as ApiResponse<T>;

      const json = JSON.parse(text);
      if (json.ok === false) throw new Error(json.error || json.message || "Unknown API error");
      return json;
    } catch (error) {
      throw error;
    }
  },

  apiPut: async <T>(path: string, body: any): Promise<ApiResponse<T>> => {
    if (!path) throw new Error("API path is required");
    const url = `${API_BASE_URL}${path.startsWith("/") ? path : `/${path}`}`;
    
    try {
      const headers = await getHeaders();
      const response = await fetch(url, {
        method: 'PUT',
        headers,
        body: JSON.stringify(body),
      });
      
      if (response.status === 401) {
        throw new Error("UNAUTHORIZED");
      }
      
      if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
      
      const text = await response.text();
      if (!text) return { ok: true } as ApiResponse<T>;

      const json = JSON.parse(text);
      if (json.ok === false) throw new Error(json.error || json.message || "Unknown API error");
      return json;
    } catch (error) {
      throw error;
    }
  },

  apiDelete: async <T>(path: string): Promise<ApiResponse<T>> => {
    if (!path) throw new Error("API path is required");
    const url = `${API_BASE_URL}${path.startsWith("/") ? path : `/${path}`}`;
    
    try {
      const headers = await getHeaders();
      const response = await fetch(url, {
        method: 'DELETE',
        headers,
      });
      
      if (response.status === 401) {
        throw new Error("UNAUTHORIZED");
      }
      
      if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
      
      const text = await response.text();
      if (!text) return { ok: true } as ApiResponse<T>;

      const json = JSON.parse(text);
      if (json.ok === false) throw new Error(json.error || json.message || "Unknown API error");
      return json;
    } catch (error) {
      throw error;
    }
  }
};

export default ErpApiService;

