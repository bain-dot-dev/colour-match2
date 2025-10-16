/**
 * Type definitions for World ID verification and authentication
 */

// Verification success response from the backend
export interface VerificationSuccessResponse {
  verifyRes: {
    success: boolean;
    status: number;
    [key: string]: unknown;
  };
  status: number;
}

// Verification error response from MiniKit or backend
export interface VerificationErrorResponse {
  error_code?: string;
  message?: string;
  status?: string;
  [key: string]: unknown;
}

// Props for WorldIDVerification component
export interface WorldIDVerificationProps {
  action: string;
  signal?: string;
  onSuccess?: (response: VerificationSuccessResponse) => void;
  onError?: (error: VerificationErrorResponse | Error) => void;
  buttonText?: string;
  disabled?: boolean;
}

// Authentication status types
export type AuthStatus = "idle" | "authenticating" | "success" | "error";
export type VerificationStatus = "idle" | "verifying" | "success" | "error";

// User session data
export interface UserSession {
  id: string;
  walletAddress: string;
  username: string;
  profilePictureUrl: string;
  permissions?: {
    notifications: boolean;
    contacts: boolean;
  };
  optedIntoOptionalAnalytics?: boolean;
  worldAppVersion?: number;
  deviceOS?: string;
}
