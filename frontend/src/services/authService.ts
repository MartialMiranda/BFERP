import apiClient from '../lib/axios';
import {
  LoginCredentials,
  LoginResponse,
  RefreshTokenResponse,
  RegisterData,
  RegisterResponse,
  TwoFactorSetup,
  TwoFactorVerification,
} from '../types/auth';

/**
 * Service for authentication-related API endpoints
 */
export const authService = {
  /**
   * Login user with email and password
   * @param credentials - User login credentials
   * @returns Response containing user data and tokens
   */
  async login(credentials: LoginCredentials): Promise<LoginResponse> {
    interface BackendLoginResponse {
      user: {
        id: string;
        nombre: string;
        email: string;
        rol: 'admin' | 'gestor' | 'usuario';
        tiene_2fa: boolean;
        metodo_2fa?: 'app' | 'email';
      };
      accessToken?: string;
      refreshToken?: string;
      requires2FA?: boolean;
      metodo_2fa?: string;
      userId?: string;
      message: string;
      tokens?: {
        accessToken: string;
        refreshToken: string;
      };
    }

    const response = await apiClient.post<BackendLoginResponse>('/auth/login', credentials);
    
    // Mapear la respuesta del backend a nuestra interfaz LoginResponse
    // Permitir tokens en la raíz o anidados en 'tokens'
    const accessToken = response.data.accessToken || (response.data.tokens && response.data.tokens.accessToken);
    const refreshToken = response.data.refreshToken || (response.data.tokens && response.data.tokens.refreshToken);

    return {
      message: response.data.message,
      user: response.data.user,
      tokens: accessToken && refreshToken ? {
        accessToken,
        refreshToken
      } : undefined,
      requires2FA: response.data.requires2FA,
      metodo_2fa: response.data.metodo_2fa,
      userId: response.data.userId
    };
  },

  /**
   * Register a new user
   * @param userData - User registration data
   * @returns Response with created user data
   */
  async register(userData: RegisterData): Promise<RegisterResponse> {
    const response = await apiClient.post<RegisterResponse>('/auth/register', userData);
    return response.data;
  },

  /**
   * Refresh authentication token
   * @param refreshToken - Current refresh token
   * @returns New access token and refresh token
   */
  async refreshToken(refreshToken: string): Promise<RefreshTokenResponse> {
    // Definimos la interfaz para la respuesta del backend
    interface BackendRefreshResponse {
      accessToken: string;
      message: string;
    }
    
    const response = await apiClient.post<BackendRefreshResponse>('/auth/refresh-token', { refreshToken }, {
      _skipAuth: true // Avoid auth header for refresh requests to prevent cycles
    });
    
    // Map the backend response format to our frontend interface
    return {
      accessToken: response.data.accessToken,
      refreshToken: refreshToken, // Keep using the same refresh token if backend doesn't return a new one
      message: response.data.message
    };
  },

  /**
   * Logout user, invalidating server-side tokens
   * @param token - Current access token
   */
  async logout(token: string): Promise<void> {
    await apiClient.post('/auth/logout');
  },

  /**
   * Enable two-factor authentication
   * @param setup - 2FA method setup data
   * @param token - Current access token
   * @returns Setup response with QR code or confirmation
   */
  async enable2FA(setup: TwoFactorSetup, token: string): Promise<any> {
    const response = await apiClient.post('/auth/enable-2fa', setup, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    return response.data;
  },

  /**
   * Verify two-factor authentication code
   * @param verification - Verification code and user ID
   * @returns Authentication response with tokens
   */
  async verify2FA(verification: TwoFactorVerification): Promise<any> {
    const response = await apiClient.post('/auth/verify-2fa', verification);
    return response.data;
  },

  /**
   * Disable two-factor authentication
   * @param token - Current access token
   */
  async disable2FA(token: string): Promise<void> {
    await apiClient.post(
      '/auth/disable-2fa',
      {},
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );
  },

  /**
   * Verify if current token is valid
   * @param token - Access token to verify
   * @returns True if token is valid
   */
  async verifyToken(token: string): Promise<boolean> {
    try {
      const response = await apiClient.get('/auth/verify-token', {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      return response.status === 200;
    } catch (error) {
      return false;
    }
  },
};
