import AsyncStorage from '@react-native-async-storage/async-storage';
import API_BASE_URL, { API_ENDPOINTS } from '@/config/api';

interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  message?: string;
  error?: string;
}

class ApiService {
  private baseURL: string;

  constructor() {
    this.baseURL = API_BASE_URL;
  }

  // ✅ Get stored access token
  private async getAuthToken(): Promise<string | null> {
    try {
      return await AsyncStorage.getItem('authToken');
    } catch (error) {
      console.error('Error getting auth token:', error);
      return null;
    }
  }

  // ✅ Generate headers for API request
  private async getHeaders(contentType: boolean = true): Promise<Record<string, string>> {
    const token = await this.getAuthToken();
    const headers: Record<string, string> = {};

    if (contentType) headers['Content-Type'] = 'application/json';
    if (token) headers['Authorization'] = `Bearer ${token}`;

    return headers;
  }

  // ✅ Refresh token when expired
  private refreshTokenHandler = async (): Promise<boolean> => {
    try {
      const response = await fetch(`${this.baseURL}${API_ENDPOINTS.REFRESH_TOKEN}`, {
        method: 'POST',
        credentials: 'include', // cookies if backend uses them
      });

      const data = await response.json();

      if (data.success) {
        const newToken = data?.data?.token || data?.data?.accessToken || data?.token || data?.accessToken || null;
        if (newToken) {
          await AsyncStorage.setItem('authToken', newToken);
          console.log('✅ Token refreshed successfully');
          return true;
        }
      }
      return false;
    } catch (error) {
      console.error('Error refreshing token:', error);
      return false;
    }
  };

  // ✅ Handle API response with better error handling
  private async handleResponse<T>(response: Response): Promise<ApiResponse<T>> {
    try {
      const contentType = response.headers.get('content-type');
      let data: any;
      
      if (contentType && contentType.includes('application/json')) {
        data = await response.json();
      } else {
        const textData = await response.text();
        data = { message: textData };
      }

      if (!response.ok) {
        return {
          success: false,
          error: data.message || data.error || `HTTP ${response.status}: ${response.statusText}`,
          message: data.message || data.error,
        };
      }

      return {
        success: true,
        data: data.data || data,
        message: data.message,
      };
    } catch (error: any) {
      console.error('Error handling response:', error);
      return {
        success: false,
        error: 'Network error or invalid response format',
        message: error.message || 'Network error',
      };
    }
  }

  // ✅ Generic request with auto token refresh and better error handling
  private async request<T>(
    method: 'GET' | 'POST' | 'PUT' | 'DELETE',
    endpoint: string,
    body?: any,
    isFormData: boolean = false,
    retry: boolean = true
  ): Promise<ApiResponse<T>> {
    try {
      const headers = await this.getHeaders(!isFormData);
      
      const requestConfig: RequestInit = {
        method,
        headers,
      };

      // Only add body for non-GET requests
      if (method !== 'GET' && body !== undefined) {
        requestConfig.body = isFormData ? body : JSON.stringify(body);
      }

      console.log(`🚀 API Request: ${method} ${endpoint}`, {
        headers: headers,
        body: isFormData ? '[FormData]' : body,
      });

      const response = await fetch(`${this.baseURL}${endpoint}`, requestConfig);
      const result = await this.handleResponse<T>(response);

      console.log(`📥 API Response: ${method} ${endpoint}`, {
        status: response.status,
        success: result.success,
        data: result.data,
        error: result.error,
      });

      // If 401 Unauthorized, try refreshing token and retry once
      if (!result.success && response.status === 401 && retry) {
        console.log('🔄 Received 401, attempting token refresh...');
        const refreshed = await this.refreshTokenHandler();
        if (refreshed) {
          console.log('✅ Token refreshed, retrying request...');
          return this.request(method, endpoint, body, isFormData, false);
        } else {
          console.log('❌ Token refresh failed, clearing auth data...');
          await AsyncStorage.multiRemove(['authToken', 'user']);
          // Don't navigate here, let the auth context handle it
        }
      }

      return result;
    } catch (error: any) {
      console.error(`❌ API Request Error: ${method} ${endpoint}`, error);
      return {
        success: false,
        error: error.message || 'Network error',
        message: error.message || 'Network connection failed',
      };
    }
  }

  // ✅ Public methods with better parameter handling
  async get<T>(endpoint: string, params?: Record<string, any>): Promise<ApiResponse<T>> {
    let url = endpoint;
    if (params && Object.keys(params).length > 0) {
      const filteredParams = Object.fromEntries(
        Object.entries(params).filter(([_, value]) => value !== undefined && value !== null)
      );
      if (Object.keys(filteredParams).length > 0) {
        const query = new URLSearchParams(filteredParams as any).toString();
        url += `?${query}`;
      }
    }
    return this.request<T>('GET', url);
  }

  async post<T>(endpoint: string, data?: any): Promise<ApiResponse<T>> {
    return this.request<T>('POST', endpoint, data);
  }

  async put<T>(endpoint: string, data?: any): Promise<ApiResponse<T>> {
    return this.request<T>('PUT', endpoint, data);
  }

  async delete<T>(endpoint: string, data?: any): Promise<ApiResponse<T>> {
    return this.request<T>('DELETE', endpoint, data);
  }

  async postForm<T>(endpoint: string, formData: FormData): Promise<ApiResponse<T>> {
    return this.request<T>('POST', endpoint, formData, true);
  }

  async putForm<T>(endpoint: string, formData: FormData): Promise<ApiResponse<T>> {
    return this.request<T>('PUT', endpoint, formData, true);
  }

  // ✅ Helper method to check if token is valid
  async isTokenValid(): Promise<boolean> {
    const token = await this.getAuthToken();
    if (!token) return false;
    
    try {
      const response = await this.get(API_ENDPOINTS.CURRENT_USER);
      return response.success;
    } catch {
      return false;
    }
  }

  // ✅ Helper method to clear auth data
  async clearAuthData(): Promise<void> {
    await AsyncStorage.multiRemove(['authToken', 'user']);
  }
}

export const apiService = new ApiService();
export default apiService;


// import AsyncStorage from '@react-native-async-storage/async-storage';
// import API_BASE_URL, { API_ENDPOINTS } from '@/config/api';

// interface ApiResponse<T = any> {
//   success: boolean;
//   data?: T;
//   message?: string;
//   error?: string;
// }

// class ApiService {
//   private baseURL: string;

//   constructor() {
//     this.baseURL = API_BASE_URL;
//   }

//   private async getAuthToken(): Promise<string | null> {
//     try {
//       return await AsyncStorage.getItem('authToken');
//     } catch (error) {
//       console.error('Error getting auth token:', error);
//       return null;
//     }
//   }

//   private async getHeaders(): Promise<Record<string, string>> {
//     const token = await this.getAuthToken();
//     const headers: Record<string, string> = {
//       'Content-Type': 'application/json',
//     };

//     if (token) {
//       headers.Authorization = `Bearer ${token}`;
//     }

//     return headers;
//   }



// //   setLogoutHandler(handler?: (message?: string) => void) {
// //   this.onLogout = handler;
// // }

//  private refreshTokenHandler = async (): Promise<boolean> => {
//   try { 
//     let response = await fetch(`${this.baseURL}${API_ENDPOINTS.REFRESH_TOKEN}`, {
//       method: 'POST',
//       credentials: 'include'
//     });
    
//     const data = await response.json();
    
//     if (data.success) {
//       const newToken = data?.data?.token || data?.data?.accessToken || null;
      
//       if (newToken) {
//         await AsyncStorage.setItem('authToken', newToken);
//         console.log('new token', newToken);
//         return true; // ✅ Return success
//       }
//     }
//     return false; // ✅ Return failure if no token
//   } catch (error) {
//     console.log('Error refreshing token:', error);
//     return false; // ✅ Return failure on error
//   }
// };

// private async handleResponse<T>(response: Response): Promise<ApiResponse<T>> {
//   try {
//     const data = await response.json();

//     if (!response.ok) {
//       if (response.status === 401) {
//         console.log('access token expired trying to get new token');
//         const refreshSuccess = await this.refreshTokenHandler();
        
//         if (!refreshSuccess) {
//           console.log('Token refresh failed, removing stored tokens');
//           await AsyncStorage.multiRemove(['authToken', 'user']);
//         }
//       }

//       return {
//         success: false,
//         error: data.message || 'An error occurred',
//       };
//     }

//     return {
//       success: true,
//       data: data.data || data,
//       message: data.message,
//     };
//   } catch (error) {
//     console.error('Handle response error:', error);
//     return {
//       success: false,
//       error: 'Network error or invalid response',
//     };
//   }
// }
//   async get<T>(endpoint: string, params?: Record<string, any>): Promise<ApiResponse<T>> {
//     try {
//       const url = new URL(`${this.baseURL}${endpoint}`);

//       if (params) {
//         Object.keys(params).forEach(key => {
//           if (params[key] !== undefined && params[key] !== null) {
//             url.searchParams.append(key, params[key].toString());
//           }
//         });
//       }

//       const headers = await this.getHeaders();

//       const response = await fetch(url.toString(), {
//         method: 'GET',
//         headers,
//       });

//       return this.handleResponse<T>(response);
//     } catch (error) {
//       return {
//         success: false,
//         error: 'Network error',
//       };
//     }
//   }

//   async post<T>(endpoint: string, data?: any): Promise<ApiResponse<T>> {
//     try {
//       const headers = await this.getHeaders();

//       const response = await fetch(`${this.baseURL}${endpoint}`, {
//         method: 'POST',
//         headers,
//         body: data ? JSON.stringify(data) : undefined,
//       });

//       return this.handleResponse<T>(response);
//     } catch (error) {
//       return {
//         success: false,
//         error: 'Network error',
//       };
//     }
//   }

//   async put<T>(endpoint: string, data?: any): Promise<ApiResponse<T>> {
//     try {
//       const headers = await this.getHeaders();

//       const response = await fetch(`${this.baseURL}${endpoint}`, {
//         method: 'PUT',
//         headers,
//         body: data ? JSON.stringify(data) : undefined,
//       });

//       return this.handleResponse<T>(response);
//     } catch (error) {
//       return {
//         success: false,
//         error: 'Network error',
//       };
//     }
//   }

//   async delete<T>(endpoint: string): Promise<ApiResponse<T>> {
//     try {
//       const headers = await this.getHeaders();

//       const response = await fetch(`${this.baseURL}${endpoint}`, {
//         method: 'DELETE',
//         headers,
//       });

//       return this.handleResponse<T>(response);
//     } catch (error) {
//       return {
//         success: false,
//         error: 'Network error',
//       };
//     }
//   }

//   async uploadFile<T>(endpoint: string, file: any, additionalData?: Record<string, any>): Promise<ApiResponse<T>> {
//     try {
//       const token = await this.getAuthToken();
//       const formData = new FormData();

//       formData.append('file', file);

//       if (additionalData) {
//         Object.keys(additionalData).forEach(key => {
//           formData.append(key, additionalData[key]);
//         });
//       }

//       const headers: Record<string, string> = {};
//       if (token) {
//         headers.Authorization = `Bearer ${token}`;
//       }

//       const response = await fetch(`${this.baseURL}${endpoint}`, {
//         method: 'POST',
//         headers,
//         body: formData,
//       });

//       return this.handleResponse<T>(response);
//     } catch (error) {
//       return {
//         success: false,
//         error: 'Upload failed',
//       };
//     }
//   }

//   // ✅ This is the new method for posting FormData (for tweets with images)
//   async postForm<T>(endpoint: string, formData: FormData): Promise<ApiResponse<T>> {
//   try {
//     const token = await this.getAuthToken();

//     const headers: Record<string, string> = {};
//     if (token) {
//       headers['Authorization'] = `Bearer ${token}`;
//     }

//     const response = await fetch(`${this.baseURL}${endpoint}`, {
//       method: 'POST',
//       headers, // DO NOT include 'Content-Type'
//       body: formData,
//     });

//     return this.handleResponse<T>(response);
//   } catch (error) {
//     return {
//       success: false,
//       error: 'Form submission failed',
//     };
//   }
// }

// async putForm<T>(endpoint: string, formData: FormData): Promise<ApiResponse<T>> {
//   try {
//     const token = await this.getAuthToken();


//     const headers: Record<string, string> = {};
//     if (token) {
//       headers['Authorization'] = `Bearer ${token}`;
//     }

//     const response = await fetch(`${this.baseURL}${endpoint}`, {
//       method: 'PUT',
//       headers, // ✅ Let browser/native set boundary Content-Type
//       body: formData,
//     });

//     return this.handleResponse<T>(response);
//   } catch (error) {
//     console.error('❌ Error while uploading form:', error);
//     return {
//       success: false,
//       error: 'Form submission failed',
//     };
//   }
// }



// }

// export const apiService = new ApiService();
// export default apiService;

