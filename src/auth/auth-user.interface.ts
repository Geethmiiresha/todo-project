import type { Request } from 'express';

/** Token eken ganna logged-in user */
export interface AuthUser {
  id: string;
  email: string;
}

export interface AuthenticatedRequest extends Request {
  user: AuthUser;
}

/** API response walata yana user (password nethuwa) */
export interface UserProfile {
  id: string;
  name: string;
  email: string;
}

export interface AuthResponse {
  accessToken: string;
  user: UserProfile;
}