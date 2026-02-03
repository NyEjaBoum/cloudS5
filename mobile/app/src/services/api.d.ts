// TypeScript declaration for api.js
declare module './api' {
  import { AxiosInstance } from 'axios';

  interface ApiInstance extends AxiosInstance {
    get<T = any>(url: string, config?: any): Promise<T>;
    post<T = any>(url: string, data?: any, config?: any): Promise<T>;
    put<T = any>(url: string, data?: any, config?: any): Promise<T>;
    delete<T = any>(url: string, config?: any): Promise<T>;
    patch<T = any>(url: string, data?: any, config?: any): Promise<T>;
  }

  const api: ApiInstance;
  export default api;

  export function setAuthToken(token: string): void;
  export function getAuthToken(): string | null;
  export function clearAuth(): void;
}
