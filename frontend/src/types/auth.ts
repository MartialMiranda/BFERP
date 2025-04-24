/**
 * User interface representing the authenticated user
 */
export interface User {
  [key: string]: unknown;
  id: string;
  nombre: string;
  email: string;
  rol: 'admin' | 'gestor' | 'usuario';
  tiene_2fa: boolean;
  metodo_2fa?: 'app' | 'email';
}

/**
 * Authentication state interface
 */
export interface AuthState {
  user: User | null;
  token: string | null;
  refreshToken: string | null;
  isAuthenticated: boolean;
  loading: boolean;
  error: { message: string } | null;
  requires2FA: boolean;
  twoFactorSetup: TwoFactorSetupState;
}

/**
 * Login credentials interface
 */
export interface LoginCredentials {
  email: string;
  password: string;
  code_2fa?: string;
  rememberMe?: boolean;
}

/**
 * Registration data interface
 */
export interface RegisterData {
  nombre: string;
  email: string;
  password: string;
  rol?: 'admin' | 'gestor' | 'usuario';
}

/**
 * Login response interface
 */
export interface LoginResponse {
  message: string;
  user?: User;
  tokens?: {
    accessToken: string;
    refreshToken: string;
  };
  requires2FA?: boolean;
  metodo_2fa?: string;
  userId?: string;
  error?: string;
  verified?: boolean;
}

/**
 * Registration response interface
 */
export interface RegisterResponse {
  message: string;
  user: User;
}

/**
 * Token refresh response interface
 */
export interface RefreshTokenResponse {
  accessToken: string;
  refreshToken?: string;
  message?: string;
}

/**
 * Two-factor authentication setup interface
 */
export interface TwoFactorSetup {
  method: 'app' | 'email';
}

/**
 * Two-factor authentication setup state interface
 */
export interface TwoFactorSetupState {
  isActivating: boolean;
  qrCode: string | null;
  secret: string | null;
  method: 'app' | 'email' | null;
  pendingVerification: boolean;
}

/**
 * Two-factor authentication verification interface
 */
export interface TwoFactorVerification {
  code: string;
  userId: string;
  method: 'app' | 'email';
}

/**
 * Two-factor authentication response interface
 */
export interface TwoFactorResponse {
  secret?: string;
  otpauth_url?: string;
  emailSent?: boolean;
  verified: boolean;
  message?: string;
}

/**
 * Representa un error de autenticación
 */
export interface AuthError {
  message: string;
  code?: string;
}
