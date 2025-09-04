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
        const newToken = data?.data?.token || data?.data?.accessToken || null;
        if (newToken) {
          await AsyncStorage.setItem('authToken', newToken);
          console.log('✅ New token obtained:', newToken);
          return true;
        }
      }
      return false;
    } catch (error) {
      console.error('Error refreshing token:', error);
      return false;
    }
  };

  // ✅ Handle API response
  private async handleResponse<T>(response: Response): Promise<ApiResponse<T>> {
    try {
      const data = await response.json();

      if (!response.ok) {
        return {
          success: false,
          error: data.message || 'An error occurred',
        };
      }

      return {
        success: true,
        data: data.data || data,
        message: data.message,
      };
    } catch (error) {
      return {
        success: false,
        error: 'Network error or invalid response',
      };
    }
  }

  // ✅ Generic request with auto token refresh
  private async request<T>(
    method: 'GET' | 'POST' | 'PUT' | 'DELETE',
    endpoint: string,
    body?: any,
    isFormData: boolean = false,
    retry: boolean = true
  ): Promise<ApiResponse<T>> {
    try {
      const headers = await this.getHeaders(!isFormData);
      const response = await fetch(`${this.baseURL}${endpoint}`, {
        method,
        headers,
        body: isFormData ? body : body ? JSON.stringify(body) : undefined,
      });

      const result = await this.handleResponse<T>(response);

      // If 401, try refreshing token and retry once
      if (!result.success && response.status === 401 && retry) {
        const refreshed = await this.refreshTokenHandler();
        if (refreshed) {
          return this.request(method, endpoint, body, isFormData, false);
        } else {
          await AsyncStorage.multiRemove(['authToken', 'user']);
        }
      }

      return result;
    } catch (error) {
      return {
        success: false,
        error: 'Network error',
      };
    }
  }

  // ✅ Public methods
  async get<T>(endpoint: string, params?: Record<string, any>): Promise<ApiResponse<T>> {
    let url = endpoint;
    if (params) {
      const query = new URLSearchParams(params as any).toString();
      url += `?${query}`;
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
    return this.request<T>('DELETE', endpoint,data);
  }

  async postForm<T>(endpoint: string, formData: FormData): Promise<ApiResponse<T>> {
    return this.request<T>('POST', endpoint, formData, true);
  }

  async putForm<T>(endpoint: string, formData: FormData): Promise<ApiResponse<T>> {
    return this.request<T>('PUT', endpoint, formData, true);
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

